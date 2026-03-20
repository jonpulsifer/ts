import { useCallback, useEffect, useRef, useState } from 'react';
import './index.css';

type Specimen = {
  id: number;
  name: string;
  species: string;
  status: string;
  sporeCount: number;
  humidity: number;
  notes: string | null;
  createdAt: string;
};

type Transmission = {
  id: number;
  message: string;
  severity: string;
  createdAt: string;
};

type Stats = {
  specimens: number;
  totalSpores: number;
  transmissions: number;
  decomposed: number;
};

const fetchJson = async <T,>(url: string, opts?: RequestInit) => {
  const res = await fetch(url, opts);
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    throw new Error((payload as { error?: string }).error || `${res.status} ${res.statusText}`);
  }
  return (await res.json()) as T;
};

const post = (url: string, body?: unknown) =>
  fetchJson(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : '{}',
  });

const formatTime = (value: string) => {
  const d = new Date(value);
  return d.toLocaleTimeString('en-US', { hour12: false }) + ' ' +
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const statusClass = (status: string) => `status-${status}`;

const severityClass = (severity: string) => `severity-${severity}`;

const statusIcon = (status: string) => {
  const icons: Record<string, string> = {
    dormant: '.',
    germinating: 'o',
    thriving: '*',
    sporulating: '~',
    moldy: '#',
    decomposed: 'x',
  };
  return icons[status] ?? '?';
};

const SPORE_ART = `
    .  *  .
   / ~~~~~ \\
  / . o . o \\
 |  ~~~~~~~~  |
  \\__________/
      |  |
    ~~|  |~~
  ~~~~    ~~~~
`.trimStart();

export function App() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [specimens, setSpecimens] = useState<Specimen[]>([]);
  const [transmissions, setTransmissions] = useState<Transmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customName, setCustomName] = useState('');
  const logRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, sp, tx] = await Promise.all([
        fetchJson<Stats>('/api/stats'),
        fetchJson<Specimen[]>('/api/specimens'),
        fetchJson<Transmission[]>('/api/transmissions?limit=30'),
      ]);
      setStats(s);
      setSpecimens(sp);
      setTransmissions(tx);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'failed to reach substrate');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = 0;
    }
  }, [transmissions]);

  const act = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'operation failed');
    } finally {
      setBusy(false);
    }
  };

  const handleInoculate = () =>
    act(() => post('/api/inoculate', customName ? { name: customName } : {}));

  const handleContaminate = () => act(() => post('/api/contaminate'));

  const handlePurge = () => act(() => post('/api/purge'));

  const humidityColor = (h: number) => {
    if (h >= 90) return 'text-decay';
    if (h >= 75) return 'text-spore';
    return 'text-truffle';
  };

  return (
    <div className="crt crt-flicker">
      <div className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto page-rise">
        {/* ═══ HEADER ═══ */}
        <header className="mb-6">
          <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-8">
            <pre className="text-truffle text-[0.55rem] leading-tight opacity-70 select-none hidden md:block">
              {SPORE_ART}
            </pre>
            <div className="space-y-1">
              <div className="text-[0.6rem] tracking-[0.4em] text-muted-foreground uppercase">
                substrate://truffle.local
              </div>
              <h1 className="text-xl md:text-2xl text-truffle font-bold tracking-wider pulse-glow">
                TRUFFLE MOLD LAB
              </h1>
              <p className="text-[0.65rem] tracking-[0.25em] text-muted-foreground uppercase">
                where deployments go to decompose // v2.0.0-mold
              </p>
            </div>
          </div>
        </header>

        {/* ═══ STATS BAR ═══ */}
        <div className="stats-bar mb-5 flex flex-wrap gap-x-6 gap-y-1 items-center">
          <span className="text-muted-foreground">
            specimens:{' '}
            <span className="text-truffle">{stats?.specimens ?? '—'}</span>
          </span>
          <span className="text-muted-foreground">
            total spores:{' '}
            <span className="text-truffle">
              {stats?.totalSpores?.toLocaleString() ?? '—'}
            </span>
          </span>
          <span className="text-muted-foreground">
            decomposed:{' '}
            <span className="text-decay">{stats?.decomposed ?? '—'}</span>
          </span>
          <span className="text-muted-foreground">
            transmissions:{' '}
            <span className="text-truffle">{stats?.transmissions ?? '—'}</span>
          </span>
          <span className="md:ml-auto text-muted-foreground">
            db:{' '}
            <span className="text-truffle blink">●</span>{' '}
            <span className="text-truffle">CONNECTED</span>
          </span>
        </div>

        {/* ═══ ERROR BANNER ═══ */}
        {error && (
          <div className="terminal-panel p-3 mb-5 border-l-3 border-l-decay text-decay text-xs">
            <span className="text-decay font-bold">ERR</span>{' '}
            {error}
          </div>
        )}

        {/* ═══ INOCULATION CONTROLS ═══ */}
        <section className="terminal-panel p-4 mb-5">
          <div className="terminal-header">inoculation chamber</div>
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
            <div className="flex-1">
              <label className="block text-[0.6rem] tracking-[0.2em] text-muted-foreground uppercase mb-1">
                specimen name (leave blank for random)
              </label>
              <div className="flex items-center gap-1">
                <span className="text-truffle text-xs">&gt;</span>
                <input
                  type="text"
                  className="terminal-input"
                  placeholder="Sentient Mycelium #420"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleInoculate();
                  }}
                  disabled={busy}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                className="terminal-btn"
                onClick={handleInoculate}
                disabled={busy}
              >
                [ inoculate ]
              </button>
              <button
                className="terminal-btn terminal-btn-warn"
                onClick={handleContaminate}
                disabled={busy}
              >
                [ contaminate ]
              </button>
              <button
                className="terminal-btn terminal-btn-danger"
                onClick={handlePurge}
                disabled={busy}
              >
                [ purge ]
              </button>
              <button
                className="terminal-btn"
                onClick={refresh}
                disabled={busy || loading}
              >
                [ refresh ]
              </button>
            </div>
          </div>
        </section>

        {/* ═══ MAIN GRID ═══ */}
        <div className="grid gap-5 lg:grid-cols-5">
          {/* ─── SPECIMEN LOG ─── */}
          <section className="lg:col-span-3">
            <div className="terminal-panel p-4">
              <div className="terminal-header">specimen log</div>
              <div className="space-y-2 max-h-[28rem] overflow-y-auto terminal-scroll">
                {loading && specimens.length === 0 && (
                  <p className="text-muted-foreground text-xs animate-pulse">
                    scanning containment bays...
                  </p>
                )}
                {!loading && specimens.length === 0 && (
                  <p className="text-muted-foreground text-xs">
                    no specimens in containment. hit [ inoculate ] to begin.
                  </p>
                )}
                {specimens.map((s) => (
                  <div key={s.id} className="specimen-row space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-xs font-bold tracking-wider ${statusClass(s.status)}`}
                      >
                        [{s.status.toUpperCase()}]
                      </span>
                      <span className="text-sm text-foreground">{s.name}</span>
                    </div>
                    <div className="text-[0.65rem] text-muted-foreground italic">
                      {s.species}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-0 text-[0.65rem]">
                      <span className="text-muted-foreground">
                        spores:{' '}
                        <span className="text-truffle">
                          {s.sporeCount.toLocaleString()}
                        </span>
                      </span>
                      <span className="text-muted-foreground">
                        humidity:{' '}
                        <span className={humidityColor(s.humidity)}>
                          {s.humidity}%
                        </span>
                      </span>
                      <span className="text-muted-foreground">
                        age:{' '}
                        <span className="text-foreground/60">
                          {formatTime(s.createdAt)}
                        </span>
                      </span>
                    </div>
                    {s.notes && (
                      <div className="text-[0.6rem] text-muted-foreground">
                        // {s.notes}
                      </div>
                    )}
                    <div className="mold-bar mt-1">
                      <div
                        className="mold-bar-fill"
                        style={{
                          width: `${Math.min(100, s.sporeCount / 15)}%`,
                          background:
                            s.status === 'decomposed'
                              ? 'oklch(0.5 0.18 25)'
                              : s.status === 'moldy'
                                ? 'oklch(0.75 0.2 85)'
                                : s.status === 'sporulating'
                                  ? 'oklch(0.78 0.2 100)'
                                  : 'oklch(0.75 0.22 145)',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ─── TRANSMISSION LOG ─── */}
          <section className="lg:col-span-2">
            <div className="terminal-panel p-4">
              <div className="terminal-header">transmission log</div>
              <div
                ref={logRef}
                className="space-y-1 max-h-[28rem] overflow-y-auto terminal-scroll text-[0.65rem] leading-relaxed"
              >
                {loading && transmissions.length === 0 && (
                  <p className="text-muted-foreground animate-pulse">
                    tuning frequencies...
                  </p>
                )}
                {transmissions.map((t) => (
                  <div key={t.id} className={severityClass(t.severity)}>
                    <span className="text-muted-foreground">
                      [{formatTime(t.createdAt)}]
                    </span>{' '}
                    <span className="text-muted-foreground">&gt;</span>{' '}
                    {t.message}
                  </div>
                ))}
                {!loading && transmissions.length === 0 && (
                  <p className="text-muted-foreground">
                    no transmissions recorded
                  </p>
                )}
                <div className="text-truffle blink mt-2">▊</div>
              </div>
            </div>
          </section>
        </div>

        {/* ═══ FOOTER ═══ */}
        <footer className="mt-6 text-center text-[0.55rem] tracking-[0.3em] text-muted-foreground uppercase">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span>truffle mold lab</span>
            <span className="text-truffle/30">|</span>
            <span>bun + postgres + react</span>
            <span className="text-truffle/30">|</span>
            <span>
              {specimens.map((s) => statusIcon(s.status)).join(' ') || '...'}
            </span>
            <span className="text-truffle/30">|</span>
            <span>every click proves the db works</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
