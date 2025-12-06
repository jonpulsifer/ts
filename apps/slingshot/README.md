# Slingshot - Webhook Testing Platform

A modern, serverless webhook testing platform built with Next.js 16, Vercel Blob, and distributed serverless primitives.

## Features

- 🚀 **Serverless Architecture** - Built entirely on Vercel's edge network
- 🎨 **Violet Design System** - Custom rgb(109, 40, 217) theme
- ⚡ **Real-time Updates** - Server-Sent Events (SSE) for live webhook streaming
- 🔒 **Rate Limiting** - 5 requests per second to prevent congestion
- 📦 **Single-File Storage** - All webhooks stored in a single JSON file per project
- 🔄 **Optimistic Locking** - ETag-based concurrency control for data integrity
- 🎯 **One-Click Resend** - Client-side webhook replay (SSRF-safe)
- 🔍 **Advanced Inspection** - Monaco Editor for JSON viewing, diffing, and cURL export
- 📱 **Responsive UI** - Resizable panels with ShadCN UI components

## Architecture

### Technology Stack

- **Framework**: Next.js 16 (App Router, React Server Components)
- **Storage**: Vercel Blob (object storage)
- **Routing**: Middleware-based slug-to-ID resolution
- **Rate Limiting**: In-memory sliding window (5 RPS)
- **Real-time**: Server-Sent Events with polling fallback
- **UI**: ShadCN UI, Tailwind CSS, Monaco Editor, React Resizable Panels

### Key Design Decisions

1. **Single-File Storage**: All webhooks for a project are stored in one JSON file (`projects/{id}/webhooks.json`) with a circular buffer limit of 100 webhooks
2. **Optimistic Locking**: Uses ETag-based retry logic instead of distributed locks (no Redis required)
3. **Client-Side Resend**: Webhook replay happens in the browser to prevent SSRF attacks
4. **Vercel-Only**: No external dependencies like Upstash Redis - everything runs on Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Vercel account with Blob Storage enabled (for production)

### Installation

1. Install dependencies:

```bash
pnpm install
```

2. Set up environment variables:

Create a `.env.local` file:

```env
# Required: Vercel Blob token from [Vercel Dashboard](https://vercel.com/dashboard/stores)
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Optional: Use NanoID instead of slug as project ID (default: false)
USE_NANOID=false
```

3. Run the development server:

```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000)

**Note:** This application requires Vercel Blob storage. Make sure you have `BLOB_READ_WRITE_TOKEN` configured in your environment variables.

## Usage

### Creating a Project

1. Navigate to the home page
2. Enter a project slug (e.g., `my-webhook-test`)
3. Click "Create Project"
4. You'll be redirected to your project page

### Receiving Webhooks

Your webhook endpoint will be:
```
POST /api/webhook/{projectId}
```

You can send any HTTP request (GET, POST, PUT, PATCH, DELETE) to this endpoint. The platform will:
- Capture all headers
- Store the request body
- Record timestamp, IP, and user agent
- Display it in real-time via SSE

### Features

- **View Webhooks**: Click on any webhook in the list to see full details
- **Inspect Headers**: View all request headers in a searchable table
- **View Body**: Pretty-printed JSON in Monaco Editor with syntax highlighting
- **Copy as cURL**: One-click export to cURL command
- **Resend**: Replay webhooks to any target URL (client-side, SSRF-safe)
- **Compare**: Select two webhooks to see a side-by-side diff
- **Clear History**: Delete all webhooks for a project

## Project Structure

```
apps/slingshot/
├── app/
│   ├── api/
│   │   ├── projects/          # Project creation
│   │   ├── webhook/[id]/      # Webhook ingestion
│   │   ├── webhooks/[id]/     # Webhook CRUD
│   │   └── stream/[id]/       # SSE endpoint
│   ├── projects/[id]/         # Project viewer page
│   └── page.tsx                # Home page
├── components/
│   ├── create-project-form.tsx
│   ├── webhook-viewer.tsx
│   ├── webhook-list.tsx
│   ├── webhook-detail.tsx
│   └── webhook-diff.tsx
├── lib/
│   ├── blob.ts                # Vercel Blob operations
│   ├── projects.ts            # Project mapping management
│   ├── rate-limit.ts          # Rate limiting logic
│   ├── nanoid.ts              # ID generation
│   └── types.ts               # TypeScript types
└── middleware.ts              # Slug-to-ID routing
```

## Rate Limiting

The platform implements a 5 requests per second rate limiter per project to prevent blob storage congestion. The rate limiter uses a sliding window algorithm and is currently in-memory (per-instance). For production deployments with multiple instances, consider using Vercel KV or Edge Config for distributed rate limiting.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project in [Vercel Dashboard](https://vercel.com/new)
3. Add environment variables:
   - `BLOB_READ_WRITE_TOKEN`: Your Vercel Blob token
4. Deploy!

The platform is optimized for Vercel's serverless architecture and will automatically scale.

## Limitations

- **Single-File Storage**: Write amplification occurs when adding webhooks (must read entire file, modify, write back)
- **Rate Limiting**: In-memory rate limiter is per-instance (not distributed)
- **SSE Polling**: Without Redis pub/sub, SSE uses polling (500ms interval) instead of true event streaming
- **Concurrency**: Optimistic locking with retries may fail under extreme concurrency (>50 req/sec)

These limitations are acceptable for a webhook testing/debugging tool but may not suit production webhook consumers.

## License

MIT
