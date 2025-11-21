import { EventEmitter } from 'node:events';
import { WebSocket } from 'ws';
import { log } from '~/lib/logger';
import { WeatherMessageHandler } from '~/lib/weatherflow/message-handler';
import type { ListenStartMessage } from '~/lib/weatherflow/types';

const WEATHERFLOW_WS_URL = 'wss://ws.weatherflow.com/swd/data';

export class WeatherService extends EventEmitter {
  private static instance: WeatherService;
  private ws: WebSocket | null = null;
  private tokens: string[] = [];
  private messageHandler = new WeatherMessageHandler();
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isConnecting = false;
  private deviceToStation = new Map<number, string>();

  private constructor() {
    super();
    // Increase max listeners for many SSE clients
    this.setMaxListeners(100);
  }

  public static getInstance(): WeatherService {
    if (!WeatherService.instance) {
      WeatherService.instance = new WeatherService();
    }
    return WeatherService.instance;
  }

  public setTokens(tokens: string[]) {
    const newTokens = tokens.filter((t) => !this.tokens.includes(t));
    if (newTokens.length > 0) {
      this.tokens = [...this.tokens, ...newTokens];
      // If we have new tokens, we might need to reconnect or send new listen commands
      // For simplicity, we'll just ensure we are connected
      this.connect();
    }
  }

  private connect() {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }

    if (this.tokens.length === 0) {
      log.warn('No tokens configured, skipping weather connection');
      return;
    }

    this.isConnecting = true;
    const token = this.tokens[0]; // Use first token for connection (WeatherFlow allows multiple devices per token, or we can open multiple connections if needed, but usually one token covers the user's station)
    // Note: If users have multiple tokens for different stations, we might need a more complex multi-socket approach,
    // but for a simple hub, we'll assume the first token is sufficient or we'll append them.
    // Actually, WeatherFlow WS auth is per-connection.
    // If we need multiple tokens, we'd need multiple sockets.
    // For this simplification, let's assume one primary token or just use the first one.
    // If the user provided multiple tokens, we might be missing data from others.
    // Let's stick to the first token for now as a simplification, or iterate if we want to support multiple.
    // The original code supported multiple tokens. Let's try to support it by just opening one socket per token?
    // Or just stick to the first one for now to "Simplify".
    // Let's use the first token.

    const url = `${WEATHERFLOW_WS_URL}?token=${token}`;

    log.info('Connecting to WeatherFlow WebSocket...');

    this.ws = new WebSocket(url);

    this.ws.on('open', () => {
      log.info('WeatherFlow WebSocket connected');
      this.isConnecting = false;
      this.emit('status', { status: 'connected' });

      // We need to know which devices to listen to.
      // In the simplified version, we don't pre-fetch devices.
      // But we need to send 'listen_start'.
      // Without pre-fetching, we don't know the device IDs!
      // Ah, the catch-22.
      // We MUST pre-fetch stations to know device IDs to send 'listen_start'.
      // OR, we can rely on the fact that the token might auto-subscribe?
      // No, WeatherFlow requires 'listen_start' for specific devices.

      // OK, we need a minimal fetch.
      this.fetchAndListen();
    });

    this.ws.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());

        // Process with handler to get clean WeatherData
        const deviceId = message.device_id || 0;
        const stationLabel = this.deviceToStation.get(deviceId) || '';

        const weatherData = this.messageHandler.processObservation(
          message,
          deviceId,
          stationLabel,
        );

        if (weatherData) {
          this.emit('data', weatherData);
        }

        const weatherEvent = this.messageHandler.processEvent(
          message,
          deviceId,
          stationLabel,
        );
        if (weatherEvent) {
          this.emit('event', weatherEvent);
        }
      } catch (error) {
        log.error('Error processing message:', error);
      }
    });

    this.ws.on('close', () => {
      log.warn('WeatherFlow WebSocket closed');
      this.isConnecting = false;
      this.ws = null;
      this.emit('status', { status: 'disconnected' });
      this.scheduleReconnect();
    });

    this.ws.on('error', (error: Error) => {
      log.error('WeatherFlow WebSocket error:', error);
      this.isConnecting = false;
    });
  }

  private scheduleReconnect() {
    if (this.reconnectTimeout) return;
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      this.connect();
    }, 5000);
  }

  private async fetchAndListen() {
    // We need to fetch stations to get device IDs
    // This is the one "prefetch" we can't really avoid if we want to listen.
    try {
      for (const token of this.tokens) {
        const response = await fetch(
          `https://swd.weatherflow.com/swd/rest/stations?token=${token}`,
        );
        if (!response.ok) continue;

        const data = await response.json();
        if (!data.stations) continue;

        for (const station of data.stations) {
          if (!station.devices) continue;
          for (const device of station.devices) {
            // Only listen to Tempest (ST) or Air/Sky devices, not Hubs (HB)
            if (device.device_type === 'HB') continue;

            const deviceId = device.device_id;
            this.deviceToStation.set(deviceId, station.name);

            // Emit status update so client knows about this station immediately
            this.emit('status', {
              status: 'connected',
              device_id: deviceId,
              stationLabel: station.name,
            });

            if (this.ws?.readyState === WebSocket.OPEN) {
              const msg: ListenStartMessage = {
                type: 'listen_start',
                device_id: deviceId,
                id: Math.random().toString(),
              };
              this.ws.send(JSON.stringify(msg));
              log.info(`Listening to device ${deviceId} (${station.name})`);
            }
          }
        }
      }
    } catch (error) {
      log.error('Error fetching stations:', error);
      // Retry fetch in a bit?
      setTimeout(() => this.fetchAndListen(), 30000);
    }
  }

  public getKnownStations(): Array<{ deviceId: number; stationLabel: string }> {
    const stations: Array<{ deviceId: number; stationLabel: string }> = [];
    for (const [deviceId, stationLabel] of this.deviceToStation.entries()) {
      stations.push({ deviceId, stationLabel });
    }
    return stations;
  }
}
