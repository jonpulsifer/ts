import { WeatherService } from '~/services/weather.server';

export async function loader() {
  const tokensEnv = process.env.TEMPESTWX_TOKENS;
  if (!tokensEnv) {
    throw new Response('Missing TEMPESTWX_TOKENS', { status: 500 });
  }

  const tokens = tokensEnv
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
  const service = WeatherService.getInstance();
  service.setTokens(tokens);

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const send = (event: string, data: any) => {
        try {
          controller.enqueue(
            encoder.encode(
              `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`,
            ),
          );
        } catch (_e) {
          // Controller likely closed
        }
      };

      const onData = (data: any) => send('weather-data', data);
      const onEvent = (data: any) => send('weather-event', data);
      const onStatus = (data: any) => send('status', data);

      service.on('data', onData);
      service.on('event', onEvent);
      service.on('status', onStatus);

      // Send initial connected status if already connected
      const knownStations = service.getKnownStations();
      for (const station of knownStations) {
        send('status', {
          status: 'connected',
          device_id: station.deviceId,
          stationLabel: station.stationLabel,
        });
      }

      // Cleanup
      return () => {
        service.off('data', onData);
        service.off('event', onEvent);
        service.off('status', onStatus);
      };
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
