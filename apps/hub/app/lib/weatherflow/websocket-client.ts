import { WEATHERFLOW_CONFIG } from './config';
import type {
  AnyWebSocketMessage,
  ListenStartMessage,
  ListenStopMessage,
} from './types';

// Logging utility - only log in development
const isDev =
  process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'dev';
const log = (...args: any[]) => {
  if (isDev) {
    console.log(...args);
  }
};
const logError = (...args: any[]) => {
  if (isDev) {
    console.error(...args);
  }
};

export type WebSocketState =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'error';

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
    if (this.state === 'connected' || this.state === 'connecting') {
      log('WebSocket already connected or connecting');
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
      log(
        `Connecting WebSocket for token (devices: ${this.deviceIds.join(', ')}): ${wsUrl.substring(0, 50)}...`,
      );
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        log(
          `Weather WebSocket connected for token (${this.deviceIds.length} devices)`,
        );
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
          logError('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        logError(
          `Weather WebSocket error for token (devices: ${this.deviceIds.join(', ')}):`,
          error,
        );
        logError(
          `WebSocket state: ${this.ws?.readyState} (0=CONNECTING, 1=OPEN, 2=CLOSING, 3=CLOSED)`,
        );
        this.callbacks.onError?.(new Error('WebSocket connection error'));
      };

      this.ws.onclose = (event) => {
        log(
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
          logError('Max reconnection attempts reached');
        }
      };
    } catch (error) {
      logError('Error creating weather WebSocket:', error);
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

    const delay = Math.min(
      WEATHERFLOW_CONFIG.WS_RECONNECT.INITIAL_DELAY *
        WEATHERFLOW_CONFIG.WS_RECONNECT.BACKOFF_MULTIPLIER **
          this.reconnectAttempts,
      WEATHERFLOW_CONFIG.WS_RECONNECT.MAX_DELAY,
    );

    this.reconnectAttempts++;
    this.setState('reconnecting');
    log(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);

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
      this.callbacks.onStateChange?.(state);
    }
  }

  /**
   * Send message to WebSocket (queue if not ready)
   */
  send(message: ListenStartMessage | ListenStopMessage): void {
    if (this.isConnected() && this.ws) {
      try {
        this.ws.send(JSON.stringify(message));
        log(`Sent ${message.type} message for device ${message.device_id}`);
      } catch (error) {
        logError('Error sending message:', error);
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

    log(`Flushing ${this.messageQueue.length} queued messages`);
    const queue = [...this.messageQueue];
    this.messageQueue = [];

    for (const item of queue) {
      if (this.isConnected() && this.ws) {
        try {
          this.ws.send(JSON.stringify(item.message));
          log(
            `Sent queued ${item.message.type} message for device ${item.message.device_id}`,
          );
        } catch (error) {
          logError('Error sending queued message:', error);
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
            logError(`Error sending keepalive for device ${deviceId}:`, error);
          }
        }
        log('Keepalive sent for all devices');
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

    // Clear reconnect timeout
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    // Stop keepalive
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
          logError(
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
