import { serve, sql } from 'bun';
import {
  createCheck,
  createDeployment,
  createProject,
  getDashboard,
  listChecks,
  listDeployments,
  listProjects,
} from './db/queries';
import index from './index.html';

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json',
    },
  });

const errorResponse = (status: number, message: string) =>
  json({ error: message }, status);

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

const parseLimit = (req: Request, fallback = 12) => {
  const url = new URL(req.url);
  const limit = Number(url.searchParams.get('limit'));
  return Number.isFinite(limit) && limit > 0 ? limit : fallback;
};

const server = serve({
  routes: {
    '/api/healthz': {
      GET() {
        return json({ status: 'ok', app: 'truffle' });
      },
    },
    '/api/readyz': {
      async GET() {
        try {
          await sql`SELECT 1`;
          return json({ status: 'ready' });
        } catch (error) {
          return json({ status: 'not-ready', error: 'db-unavailable' }, 503);
        }
      },
    },
    '/api/dashboard': {
      async GET() {
        const dashboard = await getDashboard();
        return json(dashboard);
      },
    },
    '/api/projects': {
      async GET() {
        const projects = await listProjects();
        return json(projects);
      },
      async POST(req) {
        const body = (await req.json()) as {
          name?: string;
          slug?: string;
        };

        if (!body?.name) {
          return errorResponse(400, 'name is required');
        }

        const slug = body.slug?.trim() || slugify(body.name);
        if (!slug) {
          return errorResponse(400, 'slug is required');
        }

        try {
          const project = await createProject({ name: body.name, slug });
          return json(project, 201);
        } catch (error) {
          return errorResponse(409, 'project already exists');
        }
      },
    },
    '/api/deployments': {
      async GET(req) {
        const deployments = await listDeployments(parseLimit(req));
        return json(deployments);
      },
      async POST(req) {
        const body = (await req.json()) as {
          projectId?: number;
          version?: string;
          environment?: string;
          status?: string;
        };

        if (!body?.projectId || !body.version || !body.environment) {
          return errorResponse(400, 'projectId, version, environment required');
        }

        const deployment = await createDeployment({
          projectId: Number(body.projectId),
          version: body.version,
          environment: body.environment,
          status: body.status ?? 'pending',
        });

        return json(deployment, 201);
      },
    },
    '/api/checks': {
      async GET(req) {
        const checks = await listChecks(parseLimit(req));
        return json(checks);
      },
      async POST(req) {
        const body = (await req.json()) as {
          deploymentId?: number;
          name?: string;
          status?: string;
          message?: string;
        };

        if (!body?.deploymentId || !body.name || !body.status) {
          return errorResponse(400, 'deploymentId, name, status required');
        }

        const check = await createCheck({
          deploymentId: Number(body.deploymentId),
          name: body.name,
          status: body.status,
          message: body.message ?? null,
        });

        return json(check, 201);
      },
    },

    // Serve index.html for all unmatched routes.
    '/*': index,
  },

  development: process.env.NODE_ENV !== 'production' && {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
