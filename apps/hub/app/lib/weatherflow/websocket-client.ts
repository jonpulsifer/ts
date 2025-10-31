import { log } from '~/lib/logger';
import { WEATHERFLOW_CONFIG } from './config';
import type {
  AnyWebSocketMessage,
  ListenStartMessage,
  ListenStopMessage,
  WebSocketState,
} from './types';

// Maximum duration to stay in reconnecting state before forcing rebuild (120 seconds)
const MAX_RECONNECTING_DURATION = 120000;
// Delay before force rebuild after MAX_RETRIES hit (60 seconds)
const FORCE_REBUILD_DELAY_AFTER_MAX_RETRIES = 60000;

export interface WebSocketCallbacks {
  onConnect?: () => void;
  onDisconnect?: (code: number, reason?: string) => void;
  onError?: (error: Error) => void;
  onMessage?: (message: AnyWebSocketMessage) => void;
  onStateChange?: (state: WebSocketState) => void;
}

/**
 * WebSocket client for WeatherFlow API with retry logic and message queuing
 */
export class WeatherFlowWebSocketClient {
  private ws: WebSocket | null = null;
  private token: string;
  private deviceIds: number[];
  private state: WebSocketState = 'disconnected';
  private callbacks: WebSocketCallbacks;
  private messageQueue: Array<{
    message: ListenStartMessage | ListenStopMessage;
  }> = [];
  private reconnectAttempts = 0;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private keepaliveInterval: NodeJS.Timeout | null = null;
  private isManualClose = false;
  private reconnectingStartTime: number | null = null;
  private stuckStateCheckInterval: NodeJS.Timeout | null = null;
  private forceRebuildTimeout: NodeJS.Timeout | null = null;
  private isHandlingError = false;

  constructor(
    token: string,
    deviceIds: number[],
    callbacks: WebSocketCallbacks = {},
  ) {
    this.token = token;
    this.deviceIds = deviceIds;
    this.callbacks = callbacks;
  }

  /**
   * Get current connection state
   */
  getState(): WebSocketState {
    return this.state;
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.state === 'connected' && this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Connect to WebSocket
   */
  connect(): void {
    // If already connected, do nothing
    if (this.state === 'connected') {
      log.debug('WebSocket already connected');
      return;
    }

    // If stuck in reconnecting or error state, force rebuild
    if (this.state === 'reconnecting' || this.state === 'error') {
      log.warn(`WebSocket in stuck state (${this.state}), forcing rebuild`);
      this.forceReconnect();
      return;
    }

    // If already connecting, do nothing
    if (this.state === 'connecting') {
      log.debug('WebSocket already connecting');
      return;
    }

    this.isManualClose = false;
    this.setState('connecting');
    this.connectInternal();
  }

  /**
   * Internal connection logic
   */
  private connectInternal(): void {
    try {
      const wsUrl = `${WEATHERFLOW_CONFIG.WS_URL}?token=${this.token}`;
      log.debug(
        `Connecting WebSocket for token (devices: ${this.deviceIds.join(', ')}): ${wsUrl.substring(0, 50)}...`,
      );
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        log.info(
          `Weather WebSocket connected for token (${this.deviceIds.length} devices)`,
        );
        this.isHandlingError = false; // Reset error handling flag on successful connection
        this.setState('connected');
        this.reconnectAttempts = 0;
        this.flushMessageQueue();
        this.startKeepalive();
        this.callbacks.onConnect?.();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.callbacks.onMessage?.(data as AnyWebSocketMessage);
        } catch (error) {
          log.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        // Prevent recursive calls if we're already handling an error
        if (this.isHandlingError) {
          return;
        }

        this.isHandlingError = true;
        log.error(
          `Weather WebSocket error for token (devices: ${this.deviceIds.join(', ')}):`,
          error,
        );
        log.error(
          `WebSocket state: ${this.ws?.readyState} (0=CONNECTING, 1=OPEN, 2=CLOSING, 3=CLOSED)`,
        );
        this.callbacks.onError?.(new Error('WebSocket connection error'));

        // If error occurs during connection attempt, schedule reconnect directly
        // instead of closing (which would trigger another error event)
        if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
          log.warn(
            'Connection error during CONNECTING state, scheduling reconnect',
          );
          // Remove handlers to prevent further events
          this.ws.onerror = null;
          this.ws.onopen = null;
          this.ws.onmessage = null;

          // Try to close gracefully, but don't wait for it
          try {
            this.ws.onclose = null; // Prevent onclose from interfering
            this.ws.close();
          } catch (_closeError) {
            // Ignore close errors
          }

          this.ws = null;
          this.setState('disconnected');

          // Schedule reconnect if appropriate
          if (
            !this.isManualClose &&
            this.reconnectAttempts < WEATHERFLOW_CONFIG.WS_RECONNECT.MAX_RETRIES
          ) {
            this.scheduleReconnect();
          } else {
            this.setState('error');
          }
        }

        this.isHandlingError = false;
      };

      this.ws.onclose = (event) => {
        log.info(
          `Weather WebSocket closed for token (devices: ${this.deviceIds.join(', ')}):`,
          `code=${event.code}, reason=${event.reason || 'none'}, wasClean=${event.wasClean}`,
        );
        this.stopKeepalive();
        this.setState('disconnected');
        this.callbacks.onDisconnect?.(event.code, event.reason);

        // Auto-reconnect if not manually closed and within retry limit
        if (
          !this.isManualClose &&
          event.code !== 1000 &&
          this.reconnectAttempts < WEATHERFLOW_CONFIG.WS_RECONNECT.MAX_RETRIES
        ) {
          this.scheduleReconnect();
        } else if (
          this.reconnectAttempts >= WEATHERFLOW_CONFIG.WS_RECONNECT.MAX_RETRIES
        ) {
          this.setState('error');
          log.error('Max reconnection attempts reached');
        }
      };
    } catch (error) {
      log.error('Error creating weather WebSocket:', error);
      this.setState('error');
      this.callbacks.onError?.(
        error instanceof Error ? error : new Error('Unknown error'),
      );
    }
  }

  /**
   * Schedule reconnection with exponential backoff
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    // Check if we've been stuck reconnecting too long
    if (
      this.reconnectingStartTime !== null &&
      Date.now() - this.reconnectingStartTime > MAX_RECONNECTING_DURATION
    ) {
      log.warn(
        'Been reconnecting too long, forcing rebuild instead of scheduling another attempt',
      );
      this.forceReconnect();
      return;
    }

    const delay = Math.min(
      WEATHERFLOW_CONFIG.WS_RECONNECT.INITIAL_DELAY *
        WEATHERFLOW_CONFIG.WS_RECONNECT.BACKOFF_MULTIPLIER **
          this.reconnectAttempts,
      WEATHERFLOW_CONFIG.WS_RECONNECT.MAX_DELAY,
    );

    this.reconnectAttempts++;
    this.setState('reconnecting');
    log.debug(
      `Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`,
    );

    this.reconnectTimeout = setTimeout(() => {
      if (!this.isManualClose) {
        this.connectInternal();
      }
    }, delay);
  }

  /**
   * Set connection state and notify callback
   */
  private setState(state: WebSocketState): void {
    if (this.state !== state) {
      this.state = state;

      // Track when we enter reconnecting state
      if (state === 'reconnecting') {
        this.reconnectingStartTime = Date.now();
        this.startStuckStateCheck();
      } else if (state === 'connected') {
        // Clear reconnecting tracking on successful connection
        this.reconnectingStartTime = null;
        this.stopStuckStateCheck();
        this.clearForceRebuildTimeout();
      } else if (state === 'error') {
        // Schedule force rebuild after MAX_RETRIES hit
        this.scheduleForceRebuildAfterMaxRetries();
      }

      this.callbacks.onStateChange?.(state);
    }
  }

  /**
   * Force reconnect by completely tearing down and rebuilding the connection
   */
  forceReconnect(): void {
    log.warn(
      `Force reconnecting WebSocket for token (devices: ${this.deviceIds.join(', ')})`,
    );

    // Clear all timeouts and intervals
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.stopStuckStateCheck();
    this.clearForceRebuildTimeout();
    this.stopKeepalive();

    // Close existing websocket if present
    if (this.ws) {
      try {
        // Remove event handlers to prevent callbacks during teardown
        this.ws.onopen = null;
        this.ws.onmessage = null;
        this.ws.onerror = null;
        this.ws.onclose = null;
        this.ws.close();
      } catch (error) {
        log.error('Error closing websocket during force reconnect:', error);
      }
      this.ws = null;
    }

    // Reset all state
    this.reconnectAttempts = 0;
    this.reconnectingStartTime = null;
    this.isManualClose = false;
    this.isHandlingError = false; // Reset error handling flag

    // Start fresh connection
    this.setState('connecting');
    this.connectInternal();
  }

  /**
   * Start checking if we're stuck in reconnecting state
   */
  private startStuckStateCheck(): void {
    this.stopStuckStateCheck(); // Clear any existing check

    this.stuckStateCheckInterval = setInterval(() => {
      if (
        this.state === 'reconnecting' &&
        this.reconnectingStartTime !== null
      ) {
        const duration = Date.now() - this.reconnectingStartTime;
        if (duration > MAX_RECONNECTING_DURATION) {
          log.warn(
            `WebSocket stuck in reconnecting state for ${duration}ms, forcing rebuild`,
          );
          this.forceReconnect();
        }
      }
    }, 10000); // Check every 10 seconds
  }

  /**
   * Stop checking for stuck state
   */
  private stopStuckStateCheck(): void {
    if (this.stuckStateCheckInterval) {
      clearInterval(this.stuckStateCheckInterval);
      this.stuckStateCheckInterval = null;
    }
  }

  /**
   * Schedule force rebuild after MAX_RETRIES has been hit
   */
  private scheduleForceRebuildAfterMaxRetries(): void {
    this.clearForceRebuildTimeout();

    log.warn(
      `Scheduling force rebuild in ${FORCE_REBUILD_DELAY_AFTER_MAX_RETRIES}ms after MAX_RETRIES reached`,
    );

    this.forceRebuildTimeout = setTimeout(() => {
      if (this.state === 'error' && !this.isManualClose) {
        log.warn('Force rebuilding websocket after MAX_RETRIES timeout');
        this.forceReconnect();
      }
    }, FORCE_REBUILD_DELAY_AFTER_MAX_RETRIES);
  }

  /**
   * Clear force rebuild timeout
   */
  private clearForceRebuildTimeout(): void {
    if (this.forceRebuildTimeout) {
      clearTimeout(this.forceRebuildTimeout);
      this.forceRebuildTimeout = null;
    }
  }

  /**
   * Send message to WebSocket (queue if not ready)
   */
  send(message: ListenStartMessage | ListenStopMessage): void {
    if (this.isConnected() && this.ws) {
      try {
        this.ws.send(JSON.stringify(message));
        log.debug(
          `Sent ${message.type} message for device ${message.device_id}`,
        );
      } catch (error) {
        log.error('Error sending message:', error);
        // Queue message for retry
        this.messageQueue.push({ message });
      }
    } else {
      // Queue message to send when connected
      this.messageQueue.push({ message });
    }
  }

  /**
   * Flush queued messages
   */
  private flushMessageQueue(): void {
    if (this.messageQueue.length === 0) return;

    log.debug(`Flushing ${this.messageQueue.length} queued messages`);
    const queue = [...this.messageQueue];
    this.messageQueue = [];

    for (const item of queue) {
      if (this.isConnected() && this.ws) {
        try {
          this.ws.send(JSON.stringify(item.message));
          log.debug(
            `Sent queued ${item.message.type} message for device ${item.message.device_id}`,
          );
        } catch (error) {
          log.error('Error sending queued message:', error);
          // Re-queue failed messages
          this.messageQueue.push(item);
        }
      } else {
        // Re-queue if not connected
        this.messageQueue.push(item);
      }
    }
  }

  /**
   * Start keepalive mechanism to prevent idle timeout
   */
  private startKeepalive(): void {
    this.stopKeepalive(); // Clear any existing interval

    this.keepaliveInterval = setInterval(() => {
      if (this.isConnected() && this.ws) {
        // Send listen_start for all devices as keepalive
        // This is safe according to API docs - it just ensures we're listening
        for (const deviceId of this.deviceIds) {
          const message: ListenStartMessage = {
            type: 'listen_start',
            device_id: deviceId,
            id: `${Date.now()}-${deviceId}`,
          };
          try {
            this.ws.send(JSON.stringify(message));
          } catch (error) {
            log.error(`Error sending keepalive for device ${deviceId}:`, error);
          }
        }
        log.debug('Keepalive sent for all devices');
      } else {
        // Stop keepalive if not connected
        this.stopKeepalive();
      }
    }, WEATHERFLOW_CONFIG.KEEPALIVE_INTERVAL);
  }

  /**
   * Stop keepalive interval
   */
  private stopKeepalive(): void {
    if (this.keepaliveInterval) {
      clearInterval(this.keepaliveInterval);
      this.keepaliveInterval = null;
    }
  }

  /**
   * Disconnect WebSocket
   */
  disconnect(): void {
    this.isManualClose = true;

    // Clear all timeouts and intervals
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.stopStuckStateCheck();
    this.clearForceRebuildTimeout();
    this.stopKeepalive();

    // Send listen_stop for all devices if connected
    if (this.isConnected() && this.ws) {
      for (const deviceId of this.deviceIds) {
        const message: ListenStopMessage = {
          type: 'listen_stop',
          device_id: deviceId,
          id: `${Date.now()}-${deviceId}`,
        };
        try {
          this.ws.send(JSON.stringify(message));
        } catch (error) {
          log.error(
            `Could not send listen_stop message for device ${deviceId}:`,
            error,
          );
        }
      }
    }

    // Close WebSocket
    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }

    // Clear message queue
    this.messageQueue = [];
    this.reconnectAttempts = 0;
    this.reconnectingStartTime = null;
    this.setState('disconnected');
  }

  /**
   * Cleanup all resources
   */
  destroy(): void {
    this.disconnect();
    this.callbacks = {};
  }
}
