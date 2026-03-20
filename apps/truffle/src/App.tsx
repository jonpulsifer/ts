import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import './index.css';

type Project = {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
};

type Deployment = {
  id: number;
  projectId: number;
  projectName: string;
  version: string;
  environment: string;
  status: string;
  createdAt: string;
};

type Check = {
  id: number;
  deploymentId: number;
  projectName: string;
  version: string;
  environment: string;
  name: string;
  status: string;
  message: string | null;
  createdAt: string;
};

type Dashboard = {
  counts: {
    projects: number;
    deployments: number;
    checks: number;
  };
  recentDeployments: Deployment[];
  recentChecks: Check[];
};

const fetchJson = async <T,>(url: string, options?: RequestInit) => {
  const res = await fetch(url, options);
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    throw new Error(payload.error || 'request failed');
  }
  return (await res.json()) as T;
};

const formatTime = (value: string) => new Date(value).toLocaleString();

const defaultDeployment = {
  version: '🍄🧫 icon pack',
  environment: 'storage',
  status: 'stored',
};

export function App() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [checks, setChecks] = useState<Check[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [projectName, setProjectName] = useState('');
  const [projectSlug, setProjectSlug] = useState('');

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashboardData, projectsData, deploymentsData, checksData] =
        await Promise.all([
          fetchJson<Dashboard>('/api/dashboard'),
          fetchJson<Project[]>('/api/projects'),
          fetchJson<Deployment[]>('/api/deployments?limit=6'),
          fetchJson<Check[]>('/api/checks?limit=6'),
        ]);
      setDashboard(dashboardData);
      setProjects(projectsData);
      setDeployments(deploymentsData);
      setChecks(checksData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const createProject = async () => {
    if (!projectName.trim()) {
      setError('project name is required');
      return;
    }

    try {
      await fetchJson<Project>('/api/projects', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: projectName.trim(),
          slug: projectSlug.trim() || undefined,
        }),
      });
      setProjectName('');
      setProjectSlug('');
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'failed to create project');
    }
  };

  const runSmokeCheck = async () => {
    if (!projects[0]) {
      setError('create a collection before inserting sample rows');
      return;
    }

    setError(null);
    try {
      const deployment = await fetchJson<Deployment>('/api/deployments', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          projectId: projects[0].id,
          version: defaultDeployment.version,
          environment: defaultDeployment.environment,
          status: defaultDeployment.status,
        }),
      });

      await fetchJson<Check>('/api/checks', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          deploymentId: deployment.id,
          name: 'icon-note',
          status: 'stored',
          message: 'saved emoji set 🍄🧫',
        }),
      });

      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'smoke check failed');
    }
  };

  return (
    <div className="min-h-screen bg-grid page-rise px-6 py-12 text-foreground">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="space-y-3">
          <div className="terminal-title">truffle :: storage lab</div>
          <h1 className="text-3xl tracking-tight">
            a tiny database demo for storing moldy emojis
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Truffle is a single-screen storage example. It writes a project,
            inserts a sample record, adds a note, and shows the rows coming back
            from Postgres — just enough to prove data in, data out.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" onClick={refresh}>
              reload data
            </Button>
            <Button onClick={runSmokeCheck}>insert sample rows</Button>
          </div>
        </header>

        {error && (
          <Card className="terminal-panel border-destructive/40 text-destructive">
            <CardContent className="py-4 text-sm">{error}</CardContent>
          </Card>
        )}

        <section className="grid gap-4 md:grid-cols-3">
          <Card className="terminal-panel">
            <CardHeader>
              <CardDescription>collections (projects)</CardDescription>
              <CardTitle className="text-3xl text-truffle">
                {dashboard?.counts.projects ?? 0}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="terminal-panel">
            <CardHeader>
              <CardDescription>records</CardDescription>
              <CardTitle className="text-3xl text-truffle">
                {dashboard?.counts.deployments ?? 0}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="terminal-panel">
            <CardHeader>
              <CardDescription>notes</CardDescription>
              <CardTitle className="text-3xl text-truffle">
                {dashboard?.counts.checks ?? 0}
              </CardTitle>
            </CardHeader>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Card className="terminal-panel">
            <CardHeader>
              <CardTitle>new collection</CardTitle>
              <CardDescription>create a place to store emoji rows</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="project-name">collection name</Label>
                <Input
                  id="project-name"
                  placeholder="Mushroom Icons 🍄"
                  value={projectName}
                  onChange={(event) => setProjectName(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-slug">slug</Label>
                <Input
                  id="project-slug"
                  placeholder="mushroom-icons"
                  value={projectSlug}
                  onChange={(event) => setProjectSlug(event.target.value)}
                />
              </div>
              <Button className="w-full" onClick={createProject}>
                create collection
              </Button>
            </CardContent>
          </Card>

          <Card className="terminal-panel">
            <CardHeader>
              <CardTitle>recent activity</CardTitle>
              <CardDescription>latest records + notes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {loading && (
                <p className="text-muted-foreground">loading rows…</p>
              )}
              {!loading && deployments.length === 0 && checks.length === 0 && (
                <p className="text-muted-foreground">
                  no rows stored yet
                </p>
              )}
              {!loading && deployments.length > 0 && (
                <div className="space-y-2">
                  {deployments.map((deployment) => (
                    <div key={deployment.id} className="terminal-row">
                      <span className="text-truffle">RECORD</span>
                      <span>
                        {deployment.projectName} · {deployment.version}
                      </span>
                      <span className="text-muted-foreground">
                        {deployment.environment}
                      </span>
                      <span className="text-truffle">{deployment.status}</span>
                      <span className="text-muted-foreground">
                        {formatTime(deployment.createdAt)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {!loading && checks.length > 0 && (
                <div className="space-y-2">
                  {checks.map((check) => (
                    <div key={check.id} className="terminal-row">
                      <span className="text-truffle">NOTE</span>
                      <span>
                        {check.projectName} · {check.name}
                      </span>
                      <span className="text-muted-foreground">
                        {check.message || 'no message'}
                      </span>
                      <span className="text-truffle">{check.status}</span>
                      <span className="text-muted-foreground">
                        {formatTime(check.createdAt)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

export default App;
