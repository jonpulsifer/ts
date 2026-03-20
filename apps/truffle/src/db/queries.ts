import { sql } from 'bun';

export type Project = {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
};

export type Deployment = {
  id: number;
  projectId: number;
  projectName: string;
  version: string;
  environment: string;
  status: string;
  createdAt: string;
};

export type Check = {
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

export type Dashboard = {
  counts: {
    projects: number;
    deployments: number;
    checks: number;
  };
  recentDeployments: Deployment[];
  recentChecks: Check[];
};

export async function listProjects() {
  return sql<Project>`
    SELECT id, name, slug, created_at AS "createdAt"
    FROM projects
    ORDER BY created_at DESC
  `;
}

export async function createProject(data: { name: string; slug: string }) {
  const [project] = await sql<Project>`
    INSERT INTO projects ${sql({ name: data.name, slug: data.slug })}
    RETURNING id, name, slug, created_at AS "createdAt"
  `;
  return project;
}

export async function listDeployments(limit = 12) {
  return sql<Deployment>`
    SELECT
      d.id,
      d.project_id AS "projectId",
      p.name AS "projectName",
      d.version,
      d.environment,
      d.status,
      d.created_at AS "createdAt"
    FROM deployments d
    JOIN projects p ON p.id = d.project_id
    ORDER BY d.created_at DESC
    LIMIT ${limit}
  `;
}

export async function createDeployment(data: {
  projectId: number;
  version: string;
  environment: string;
  status: string;
}) {
  const [deployment] = await sql<{ id: number }>`
    INSERT INTO deployments ${sql({
      project_id: data.projectId,
      version: data.version,
      environment: data.environment,
      status: data.status,
    })}
    RETURNING id
  `;

  const [row] = await sql<Deployment>`
    SELECT
      d.id,
      d.project_id AS "projectId",
      p.name AS "projectName",
      d.version,
      d.environment,
      d.status,
      d.created_at AS "createdAt"
    FROM deployments d
    JOIN projects p ON p.id = d.project_id
    WHERE d.id = ${deployment?.id}
  `;
  return row;
}

export async function listChecks(limit = 12) {
  return sql<Check>`
    SELECT
      c.id,
      c.deployment_id AS "deploymentId",
      p.name AS "projectName",
      d.version,
      d.environment,
      c.name,
      c.status,
      c.message,
      c.created_at AS "createdAt"
    FROM checks c
    JOIN deployments d ON d.id = c.deployment_id
    JOIN projects p ON p.id = d.project_id
    ORDER BY c.created_at DESC
    LIMIT ${limit}
  `;
}

export async function createCheck(data: {
  deploymentId: number;
  name: string;
  status: string;
  message?: string | null;
}) {
  const [check] = await sql<{ id: number }>`
    INSERT INTO checks ${sql({
      deployment_id: data.deploymentId,
      name: data.name,
      status: data.status,
      message: data.message ?? null,
    })}
    RETURNING id
  `;

  const [row] = await sql<Check>`
    SELECT
      c.id,
      c.deployment_id AS "deploymentId",
      p.name AS "projectName",
      d.version,
      d.environment,
      c.name,
      c.status,
      c.message,
      c.created_at AS "createdAt"
    FROM checks c
    JOIN deployments d ON d.id = c.deployment_id
    JOIN projects p ON p.id = d.project_id
    WHERE c.id = ${check?.id}
  `;
  return row;
}

export async function getDashboard() {
  const [countsRow, deployments, checks] = await Promise.all([
    sql<{ projects: number; deployments: number; checks: number }>`
      SELECT
        (SELECT COUNT(*) FROM projects)::int AS projects,
        (SELECT COUNT(*) FROM deployments)::int AS deployments,
        (SELECT COUNT(*) FROM checks)::int AS checks
    `,
    listDeployments(5),
    listChecks(5),
  ]);

  const counts = countsRow?.[0] ?? {
    projects: 0,
    deployments: 0,
    checks: 0,
  };

  return {
    counts,
    recentDeployments: deployments,
    recentChecks: checks,
  } satisfies Dashboard;
}
