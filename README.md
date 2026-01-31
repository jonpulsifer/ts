# TypeScript Monorepo

A personal monorepo containing TypeScript applications and shared packages, managed with Turborepo and pnpm.

## Overview

This repository uses [Turborepo](https://turbo.build/) for build orchestration and [pnpm](https://pnpm.io/) for package management. It follows a monorepo structure with applications in `apps/` and shared packages in `packages/`.

## Tech Stack

- **Package Manager**: [pnpm](https://pnpm.io/) (v10.24.0)
- **Build System**: [Turborepo](https://turbo.build/) (v2.6.3)
- **Linting & Formatting**: [Biome](https://biomejs.dev/) (v2.3.8)
- **Node.js**: >=22.x
- **TypeScript**: Shared configuration via `@repo/typescript-config`

## Applications

### [Slingshot](./apps/slingshot/)

**Webhook Testing Platform** - A modern, serverless webhook testing and debugging platform.

- **Framework**: Next.js 16 (App Router, React Server Components)
- **Storage**: Google Cloud Storage with Workload Identity Federation
- **Features**:
  - Real-time webhook streaming via Server-Sent Events
  - Full request inspection (headers, body, metadata)
  - JSON viewing and diffing with Monaco Editor
  - Client-side webhook replay (SSRF-safe)
  - Rate limiting (5 requests/second)
  - Optimistic locking with ETag-based concurrency control

**Deployment**: Vercel (serverless) with Google Cloud Storage backend

### [Hub](./apps/hub/)

**TempestWx Weather Hub** - A weather station dashboard for Raspberry Pi displays.

- **Framework**: React Router 7
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Features**:
  - Real-time weather data from TempestWx API
  - Station display with detailed metrics
  - Dashboard overview
  - Kiosk mode optimized for Raspberry Pi 4

**Deployment**: Kubernetes in home lab (runs on Raspberry Pi devices)

### [Spore](./apps/spore/)

**Spore** - iPXE Boot Manager UI for homelab network infrastructure.

- **Framework**: React Router 7 (Remix)
- **Database**: SQLite with Drizzle ORM
- **Features**:
  - Host management: Auto-registers PXE booting hosts by MAC address
  - Boot profiles: Create and manage iPXE boot scripts with template variables
  - ISO management: Upload ISOs or use external URLs for network booting
  - TFTP file browser: Browse and manage TFTP boot files
  - Web terminal: SSH-like access to the server from the browser
  - Template system: Dynamic variable substitution in iPXE scripts

**Deployment**: Kubernetes in home lab (runs on Raspberry Pi devices)

## Packages

### [@repo/typescript-config](./packages/typescript-config/)

Shared TypeScript configuration used across all applications and packages in the monorepo.

### [k6-scripts](./packages/k6/)

Load testing scripts using [k6](https://k6.io/), a modern load testing tool written in Go with a JavaScript API.

## Getting Started

### Prerequisites

- **Node.js**: >=22.x
- **pnpm**: v10.24.0 (specified in `packageManager` field)
- **Git**: For cloning the repository

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd ts
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

### Development

Run all applications in development mode:

```bash
pnpm dev
```

This will start all apps concurrently using Turborepo's task orchestration.

To run a specific app:

```bash
pnpm --filter slingshot dev
pnpm --filter hub dev
pnpm --filter spore dev
```

### Building

Build all applications and packages:

```bash
pnpm build
```

Build a specific app:

```bash
pnpm --filter slingshot build
pnpm --filter hub build
pnpm --filter spore build
```

### Linting

Lint all code:

```bash
pnpm lint
```

Auto-fix linting issues:

```bash
pnpm lint:fix
```

### Testing

Run all tests:

```bash
pnpm test
```

### Cleaning

Remove all build artifacts:

```bash
pnpm clean
```

## Project Structure

```
ts/
├── apps/
│   ├── slingshot/          # Webhook testing platform
│   ├── hub/                # Weather dashboard
│   └── spore/              # iPXE Boot Manager UI
├── packages/
│   ├── typescript-config/  # Shared TS config
│   └── k6/                 # Load testing scripts
├── turbo.json              # Turborepo configuration
├── pnpm-workspace.yaml     # pnpm workspace configuration
├── biome.json              # Biome linting/formatting config
└── package.json            # Root package.json
```

## CI/CD

The repository uses GitHub Actions for continuous integration and deployment:

- **CI**: Runs linting, type checking, and tests on pull requests
- **Containerization**: Builds Docker images for applications (slingshot, hub, spore)
- **Deployment**: Automated deployments to Vercel (Slingshot) and Kubernetes (Hub, Spore)
- **Attestation**: Generates SLSA attestations for container images

See `.github/workflows/` for workflow definitions.

## Remote Caching

Turborepo supports remote caching to share build artifacts across machines and CI/CD pipelines.

### Setup

1. Authenticate with Vercel:
   ```bash
   pnpm dlx turbo login
   ```

2. Link your repository to remote cache:
   ```bash
   pnpm dlx turbo link
   ```

Remote caching is automatically enabled once linked and will speed up builds in CI/CD and across team members' machines.

## Environment Variables

Each application may require specific environment variables. See individual app READMEs for details:

- [Slingshot Environment Setup](./apps/slingshot/README.md#getting-started)
- [Hub Environment Setup](./apps/hub/README.md#getting-started)
- [Spore Environment Setup](./apps/spore/README.md#getting-started)

## Contributing

This is a personal repository, but contributions and suggestions are welcome. Please ensure:

1. Code follows the Biome linting rules
2. All tests pass
3. TypeScript types are correct (no `any` types without justification)

## License

MIT

## Useful Links

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [pnpm Documentation](https://pnpm.io/motivation)
- [Biome Documentation](https://biomejs.dev/)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Router Documentation](https://reactrouter.com/)
