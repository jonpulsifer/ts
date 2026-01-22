# Spore - iPXE Boot Manager

A web-based iPXE boot management system built with React Router 7, designed to be a companion app for network booting infrastructure.

## Features

- **Host Management**: Auto-registers PXE booting hosts by MAC address
- **Boot Profiles**: Create and manage iPXE boot scripts with template variables
- **ISO Management**: Upload ISOs or use external URLs for network booting
- **TFTP File Browser**: Browse and manage TFTP boot files
- **Web Terminal**: SSH-like access to the server from the browser
- **Template System**: Dynamic variable substitution in iPXE scripts

## Tech Stack

- **Framework**: React Router 7 (Remix)
- **Database**: SQLite with Drizzle ORM
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Terminal**: xterm.js with node-pty

## Development

```bash
# Install dependencies
pnpm install

# Initialize database
pnpm db:push

# Start development server
pnpm dev
```

The app runs on `http://localhost:3000` by default.

## Template Variables

iPXE scripts support `${variable}` syntax for dynamic content:

```ipxe
#!ipxe

set server ${SPORE_ORIGIN}
echo Booting ${host.hostname} (${host.macAddress})
echo Using profile: ${profile.name}

# Custom variables from profile/host
set kernel_args ${kernel_args}
```

### Built-in Variables

| Variable | Description |
|----------|-------------|
| `${SPORE_ORIGIN}` | Full server URL (e.g., `http://192.168.1.10:3000`) |
| `${host.macAddress}` | Host MAC address |
| `${host.hostname}` | Host hostname (if set) |
| `${profile.name}` | Profile name |

Profile-level and host-level custom variables can be defined as JSON and override each other (host takes precedence).

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/boot/:mac` | iPXE boot script for a MAC address |
| `GET /api/isos/:id/file` | Download an uploaded ISO file |

## Docker

```bash
# Build the image
docker build -t spore -f apps/spore/Dockerfile .

# Run with volumes for persistence
docker run -p 3000:3000 \
  -v spore-data:/app/data \
  -v spore-isos:/app/storage/isos \
  -v spore-tftp:/app/storage/tftpboot \
  spore
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `DATABASE_URL` | `sqlite.db` | SQLite database path |
| `ISO_STORAGE_DIR` | `storage/isos` | ISO upload directory |
| `TFTP_ROOT_DIR` | `storage/tftpboot` | TFTP root directory |

## Project Structure

```
apps/spore/
├── app/
│   ├── routes/           # React Router routes
│   ├── components/       # React components
│   │   └── ui/          # shadcn/ui components
│   ├── db/              # Drizzle schema
│   └── lib/             # Utilities
├── server.ts            # Custom server with WebSocket
├── Dockerfile
└── package.json
```
