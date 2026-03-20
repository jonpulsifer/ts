import { serve, sql } from 'bun';
import {
  contaminate,
  getStats,
  inoculate,
  listSpecimens,
  listTransmissions,
  purgeDecomposed,
} from './db/queries';
import index from './index.html';

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });

const server = serve({
  routes: {
    '/api/healthz': {
      GET: () => json({ status: 'ok', app: 'truffle', version: '2.0.0-mold' }),
    },
    '/api/readyz': {
      async GET() {
        try {
          await sql`SELECT 1`;
          return json({ status: 'ready', substrate: 'connected' });
        } catch {
          return json({ status: 'not-ready', substrate: 'disconnected' }, 503);
        }
      },
    },
    '/api/stats': {
      async GET() {
        return json(await getStats());
      },
    },
    '/api/specimens': {
      async GET() {
        return json(await listSpecimens());
      },
    },
    '/api/inoculate': {
      async POST(req) {
        const body = await req.json().catch(() => ({})) as { name?: string };
        const specimen = await inoculate(body?.name);
        return json(specimen, 201);
      },
    },
    '/api/contaminate': {
      async POST() {
        const result = await contaminate();
        if (!result) {
          return json({ error: 'no living specimens to contaminate' }, 404);
        }
        return json(result);
      },
    },
    '/api/purge': {
      async POST() {
        return json(await purgeDecomposed());
      },
    },
    '/api/transmissions': {
      async GET(req) {
        const url = new URL(req.url);
        const limit = Number(url.searchParams.get('limit')) || 25;
        return json(await listTransmissions(limit));
      },
    },

    '/*': index,
  },

  development: process.env.NODE_ENV !== 'production' && {
    hmr: true,
    console: true,
  },
});

console.log(`\x1b[32m🍄 truffle mold lab v2.0 running at ${server.url}\x1b[0m`);
