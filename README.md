# ts

A personal TypeScript monorepo

## What's inside?

This turborepo uses [pnpm](https://pnpm.io) as a package manager. It includes the following packages/apps:

### Apps and Packages

- `authme`: A [Next.js](https://nextjs.org) app that uses JWTs to authenticate users. It is deployed at [https://authme.vercel.app](https://authme.vercel.app)
- `hub`: A [Next.js](https://nextjs.org) app that runs on two different Raspberry Pis. It is deployed on Kubernetes inside my home lab.
- `nested`: A [NestJS](https://nestjs.com/) learning project.
- `request-headers`: A [Next.js](https://nextjs.org) app that returns request headers. It is deployed at [https://request-headers.vercel.app](https://request-headers.vercel.app)
- `remixed`: A [Remix](https://remix.run/) application integrated with Tailwind CSS for enhanced styling.
- `rosie`: A chatbot built with [Bolt for JavaScript](https://slack.dev/bolt-js/) for Slack integrations.
- `ui`: A React component library shared by both `hub` and `remixed` applications.
- `wishlist`: A [Next.js](https://nextjs.org) app that is my family's Christmas wishlist. It is deployed on Vercel.

### Utilities

This turborepo has some additional tools already set up for you:

- [pnpm](https://pnpm.io/) for package management
- [turbo](https://turbo.build/repo/docs) for building and testing
- [biome](https://biomejs.dev/) for code linting and formatting

### Build

To build all apps and packages, run the following command:

```
cd my-turborepo
pnpm run build
```

### Develop

To develop all apps and packages, run the following command:

```
cd my-turborepo
pnpm run dev
```

### Remote Caching

Turborepo can use a technique known as [Remote Caching](https://turborepo.org/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup), then enter the following commands:

```
cd my-turborepo
pnpm dlx turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your turborepo:

```
pnpm dlx turbo link
```

## Useful Links

Learn more about the power of Turborepo:

- [Pipelines](https://turborepo.org/docs/core-concepts/pipelines)
- [Caching](https://turborepo.org/docs/core-concepts/caching)
- [Remote Caching](https://turborepo.org/docs/core-concepts/remote-caching)
- [Scoped Tasks](https://turborepo.org/docs/core-concepts/scopes)
- [Configuration Options](https://turborepo.org/docs/reference/configuration)
- [CLI Usage](https://turborepo.org/docs/reference/command-line-reference)
