import { createServer } from 'node:http';
import { createRequestHandler } from '@react-router/express';
import express from 'express';
import { WebSocket, WebSocketServer } from 'ws';

const app = express();
const server = createServer(app);
const isProduction = process.env.NODE_ENV === 'production';

// ============================================================================
// WebSocket Terminal Server
// ============================================================================

interface NodePty {
  spawn(
    file: string,
    args: string[],
    options: {
      name?: string;
      cols?: number;
      rows?: number;
      cwd?: string;
      env?: NodeJS.ProcessEnv;
    },
  ): {
    onData: (callback: (data: string) => void) => void;
    write: (data: string) => void;
    resize: (cols: number, rows: number) => void;
    kill: () => void;
    pid: number;
  };
}

let nodePtyModule: NodePty | null = null;

async function loadNodePty(): Promise<NodePty | null> {
  if (nodePtyModule) return nodePtyModule;
  try {
    nodePtyModule = await import('node-pty');
    return nodePtyModule;
  } catch {
    console.warn('node-pty not available - terminal functionality disabled');
    return null;
  }
}

const wss = new WebSocketServer({ server, path: '/api/terminal' });

wss.on('connection', async (ws: WebSocket) => {
  const pty = await loadNodePty();

  if (!pty) {
    ws.send(
      '\r\n\x1b[31mError: Terminal not available (node-pty not installed)\x1b[0m\r\n',
    );
    ws.close();
    return;
  }

  const shell = process.env.SHELL || '/bin/sh';
  const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-256color',
    cols: 80,
    rows: 24,
    cwd: process.env.HOME || '/',
    env: process.env as NodeJS.ProcessEnv,
  });

  console.log(`Terminal spawned: PID ${ptyProcess.pid}`);

  ptyProcess.onData((data: string) => {
    try {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    } catch (err) {
      console.error('Error sending to WebSocket:', err);
    }
  });

  ws.on('message', (message: Buffer | ArrayBuffer | Buffer[]) => {
    try {
      const data = message.toString();

      if (data.startsWith('{')) {
        try {
          const parsed = JSON.parse(data);
          if (parsed.type === 'resize' && parsed.cols && parsed.rows) {
            ptyProcess.resize(parsed.cols, parsed.rows);
            return;
          }
        } catch {
          // Not JSON, treat as regular input
        }
      }

      ptyProcess.write(data);
    } catch (err) {
      console.error('Error writing to PTY:', err);
    }
  });

  ws.on('close', () => {
    console.log(`Terminal closed: PID ${ptyProcess.pid}`);
    ptyProcess.kill();
  });

  ws.on('error', (err) => {
    console.error('WebSocket error:', err);
    ptyProcess.kill();
  });
});

// ============================================================================
// Main Server Setup
// ============================================================================

async function main() {
  let viteDevServer: any;

  if (!isProduction) {
    // Development: use Vite dev server
    const vite = await import('vite');
    viteDevServer = await vite.createServer({
      server: { middlewareMode: true },
    });
    app.use(viteDevServer.middlewares);
  } else {
    // Production: serve static files
    app.use(
      '/assets',
      express.static('build/client/assets', { immutable: true, maxAge: '1y' }),
    );
    app.use(express.static('build/client', { maxAge: '1h' }));
  }

  // Handle all other requests with React Router
  let build: any;
  if (viteDevServer) {
    build = () =>
      viteDevServer.ssrLoadModule('virtual:react-router/server-build');
  } else {
    build = await import('./build/server/index.js');
  }

  app.all('/{*path}', createRequestHandler({ build }));

  // Start server
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Spore server listening on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
