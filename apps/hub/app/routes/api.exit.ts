const EXIT_DELAY_MS = 500;

const isDev =
  process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'dev';
const log = (...args: unknown[]) => {
  if (isDev) {
    console.log(...args);
  }
};
const logError = (...args: unknown[]) => {
  if (isDev) {
    console.error(...args);
  }
};

export async function loader({ request }: { request: Request }) {
  if (request.method === 'GET') {
    return new Response('Method Not Allowed', {
      status: 405,
      headers: { Allow: 'POST' },
    });
  }
  return new Response('Method Not Allowed', {
    status: 405,
    headers: { Allow: 'POST' },
  });
}

export async function action({ request }: { request: Request }) {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', {
      status: 405,
      headers: { Allow: 'POST' },
    });
  }

  try {
    // Drain body to avoid lingering streams
    await request.text();
  } catch (error) {
    logError('Failed to read exit request body:', error);
  }

  log('Exit endpoint invoked. Scheduling process termination.');

  setTimeout(() => {
    log('Exiting Node process to trigger container restart.');
    process.exit(1);
  }, EXIT_DELAY_MS).unref?.();

  return new Response(JSON.stringify({ status: 'restarting' }), {
    status: 202,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}
