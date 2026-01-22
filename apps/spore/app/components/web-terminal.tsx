import { useCallback, useEffect, useRef, useState } from 'react';

interface WebTerminalProps {
  className?: string;
}

export function WebTerminal({ className }: WebTerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminalInstanceRef = useRef<unknown>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const fitAddonRef = useRef<unknown>(null);
  const [status, setStatus] = useState<
    'connecting' | 'connected' | 'disconnected' | 'error'
  >('disconnected');
  const [cssLoaded, setCssLoaded] = useState(false);

  const connect = useCallback(async () => {
    if (!terminalRef.current) return;

    // Clean up existing connections
    if (wsRef.current) {
      wsRef.current.close();
    }
    if (terminalInstanceRef.current) {
      (terminalInstanceRef.current as { dispose: () => void }).dispose();
    }

    setStatus('connecting');

    // Dynamically import xterm modules (they require browser globals)
    const [{ Terminal }, { FitAddon }, { AttachAddon }] = await Promise.all([
      import('@xterm/xterm'),
      import('@xterm/addon-fit'),
      import('@xterm/addon-attach'),
    ]);

    // Load CSS dynamically
    if (!cssLoaded) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href =
        'https://cdn.jsdelivr.net/npm/@xterm/xterm@5.5.0/css/xterm.min.css';
      document.head.appendChild(link);
      setCssLoaded(true);
    }

    // Create terminal instance
    const terminal = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: '#1a1b26',
        foreground: '#a9b1d6',
        cursor: '#c0caf5',
        black: '#32344a',
        red: '#f7768e',
        green: '#9ece6a',
        yellow: '#e0af68',
        blue: '#7aa2f7',
        magenta: '#ad8ee6',
        cyan: '#449dab',
        white: '#787c99',
        brightBlack: '#444b6a',
        brightRed: '#ff7a93',
        brightGreen: '#b9f27c',
        brightYellow: '#ff9e64',
        brightBlue: '#7da6ff',
        brightMagenta: '#bb9af7',
        brightCyan: '#0db9d7',
        brightWhite: '#acb0d0',
      },
    });

    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);

    terminalInstanceRef.current = terminal;
    fitAddonRef.current = fitAddon;

    terminal.open(terminalRef.current);
    fitAddon.fit();

    // Connect WebSocket
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/terminal`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus('connected');
      terminal.writeln('Connected to terminal.');
      terminal.writeln('');

      // Attach WebSocket to terminal
      const attachAddon = new AttachAddon(ws);
      terminal.loadAddon(attachAddon);

      // Send initial resize
      const dims = fitAddon.proposeDimensions();
      if (dims) {
        ws.send(
          JSON.stringify({ type: 'resize', cols: dims.cols, rows: dims.rows }),
        );
      }
    };

    ws.onclose = () => {
      setStatus('disconnected');
      terminal.writeln('');
      terminal.writeln('Connection closed.');
    };

    ws.onerror = () => {
      setStatus('error');
      terminal.writeln('');
      terminal.writeln('Connection error.');
    };
  }, [cssLoaded]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const fitAddon = fitAddonRef.current as {
        fit: () => void;
        proposeDimensions: () => { cols: number; rows: number } | undefined;
      } | null;
      if (fitAddon && terminalInstanceRef.current) {
        fitAddon.fit();
        const dims = fitAddon.proposeDimensions();
        if (dims && wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({
              type: 'resize',
              cols: dims.cols,
              rows: dims.rows,
            }),
          );
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      wsRef.current?.close();
      if (terminalInstanceRef.current) {
        (terminalInstanceRef.current as { dispose: () => void }).dispose();
      }
    };
  }, []);

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2 px-2">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              status === 'connected'
                ? 'bg-green-500'
                : status === 'connecting'
                  ? 'bg-yellow-500 animate-pulse'
                  : status === 'error'
                    ? 'bg-red-500'
                    : 'bg-gray-500'
            }`}
          />
          <span className="text-sm text-muted-foreground capitalize">
            {status}
          </span>
        </div>
        <button
          type="button"
          onClick={connect}
          disabled={status === 'connecting'}
          className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
        >
          {status === 'disconnected' || status === 'error'
            ? 'Connect'
            : 'Reconnect'}
        </button>
      </div>
      <div
        ref={terminalRef}
        className="w-full h-[400px] rounded-lg overflow-hidden border border-border"
        style={{ backgroundColor: '#1a1b26' }}
      />
    </div>
  );
}
