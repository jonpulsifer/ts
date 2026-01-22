# Spore iPXE Manager - Agent Context

## Overview

Spore is a React Router 7 application for managing iPXE (Preboot Execution Environment) boot configurations for network hosts. It provides a web interface for managing boot profiles, ISO images, and TFTP boot files, with an integrated terminal for server management.

## Purpose

This application serves iPXE boot scripts to network hosts during PXE boot. When a machine boots via PXE and requests its boot configuration, Spore:

1. Identifies the host by MAC address
2. Serves the assigned boot profile (iPXE script) with templated variables
3. Auto-registers unknown hosts
4. Tracks last-seen timestamps

## Tech Stack

- **Framework**: React Router 7 (Remix) with Vite
- **Server**: Custom Express server with WebSocket support
- **Database**: SQLite with better-sqlite3
- **ORM**: Drizzle ORM
- **UI**: Shadcn UI components (new-york style)
- **Styling**: Tailwind CSS v4 with OKLCH color variables
- **Icons**: Lucide React
- **Terminal**: xterm.js with node-pty backend
- **Theme**: Dark mode with blue accent colors

## Architecture

### Database Schema

Located in `app/db/schema.ts`:

```typescript
// profiles table
- id: integer (auto-increment, primary key)
- name: text (profile name)
- content: text (iPXE script content with template variables)
- variables: text (JSON object for default template variables)
- isoId: integer (foreign key to isos, optional)
- createdAt: text (timestamp)
- updatedAt: text (timestamp)

// hosts table
- macAddress: text (primary key, normalized to lowercase)
- hostname: text (optional)
- profileId: integer (foreign key to profiles, optional)
- variables: text (JSON object for host-specific template variables)
- lastSeen: text (timestamp of last boot request)
- createdAt: text (timestamp)
- updatedAt: text (timestamp)

// isos table
- id: integer (auto-increment, primary key)
- name: text (ISO display name)
- url: text (external URL or null for uploads)
- filename: text (local filename for uploads)
- size: integer (file size in bytes)
- createdAt: text (timestamp)
- updatedAt: text (timestamp)
```

### Database Connection

- Location: `app/db/index.ts`
- Uses better-sqlite3 with Drizzle ORM
- Database file: `storage/sqlite.db` (or `DATABASE_URL` env var)
- **Important**: `better-sqlite3` requires native compilation

### Server Architecture

The app uses a custom Express server (`server.ts`) that:

1. Serves the React Router app (SSR in production, Vite dev server in development)
2. Provides WebSocket endpoint at `/api/terminal` for the xterm.js terminal
3. Spawns pseudo-terminals via `node-pty` for shell access

### Route Structure

Routes are defined in `app/routes.ts`:

```typescript
// Page routes
route('/', 'routes/home.tsx')           // Dashboard with hosts table
route('profiles', 'routes/profiles.tsx') // List profiles
route('profiles/new', 'routes/profiles.new.tsx')
route('profiles/:id', 'routes/profiles.$id.tsx')
route('isos', 'routes/isos.tsx')         // List ISOs
route('isos/new', 'routes/isos.new.tsx')
route('isos/:id', 'routes/isos.$id.tsx')
route('tftp/*', 'routes/tftp.$.tsx')     // TFTP file browser
route('terminal', 'routes/terminal.tsx') // Web terminal

// API routes (resource routes returning JSON)
route('api/boot/:mac', 'routes/api.boot.$mac.ts')
route('api/isos/:id/file', 'routes/api.isos.$id.file.ts')
route('api/tftp/*', 'routes/api.tftp.$.ts')
```

### API Routes

#### `/api/boot/:mac` (api.boot.$mac.ts)

The main iPXE boot endpoint:

- **Method**: GET
- **Parameter**: `mac` - MAC address of the booting host
- **Behavior**:
  - Normalizes MAC address to lowercase
  - Looks up host in database
  - Updates `lastSeen` timestamp
  - Renders profile template with merged variables (profile defaults + host overrides)
  - Auto-registers new hosts with no profile
  - Returns default "not provisioned" script for unassigned hosts

**Default Script** (for unknown/unassigned hosts):
```ipxe
#!ipxe
echo Spore: Host {mac} is not provisioned.
echo Registering host...
sleep 5
exit
```

#### `/api/isos/:id/file` (api.isos.$id.file.ts)

Serves uploaded ISO files for boot:

- **Method**: GET
- **Returns**: ISO file stream with appropriate headers

#### `/api/tftp/*` (api.tftp.$.ts)

Resource route for TFTP file operations:

- **GET**: Read file content (returns JSON with `content` field)
- **POST**: Update file content

### Data Actions

Located in `app/lib/actions.ts`:

**Hosts**:
- `getHosts()` - List all hosts (ordered by lastSeen desc)
- `getHost(macAddress)` - Get single host
- `updateHost(macAddress, data)` - Update hostname, profileId, or variables
- `deleteHost(macAddress)` - Delete host

**Profiles**:
- `getProfiles()` - List all profiles (ordered by updatedAt desc)
- `getProfile(id)` - Get single profile with related ISO
- `createProfile(data)` - Create new profile
- `updateProfile(id, data)` - Update profile
- `deleteProfile(id)` - Delete profile

**ISOs**:
- `getIsos()` - List all ISOs
- `getIso(id)` - Get single ISO
- `createIso(data)` - Create ISO (URL or upload)
- `updateIso(id, data)` - Update ISO
- `deleteIso(id)` - Delete ISO

### TFTP File Management

Located in `app/lib/tftp-actions.ts`:

- `listTftpDirectory(path)` - List directory contents
- `getTftpFile(path)` - Read file content
- `createTftpDirectory(path)` - Create directory
- `createTftpFile(path, content)` - Create file
- `updateTftpFile(path, content)` - Update file
- `uploadTftpFile(path, file)` - Upload file
- `deleteTftpPath(path)` - Delete file or directory

TFTP root: `storage/tftpboot/` (or `TFTP_ROOT` env var)

### Template System

Located in `app/lib/templating.ts`:

Profiles support Handlebars-style template variables:

```ipxe
#!ipxe
set base-url {{BASE_URL}}
kernel {{base-url}}/vmlinuz initrd=initrd.img hostname={{HOSTNAME}}
initrd {{base-url}}/initrd.img
boot
```

Variables are merged in order of precedence:
1. Host-specific variables (highest priority)
2. Profile default variables
3. Built-in variables (MAC, HOSTNAME, etc.)

## UI Components

### Layout & Navigation

- **`app/root.tsx`**: Root layout with Inter + JetBrains Mono fonts, dark mode
- **`app/components/navbar.tsx`**: Navigation with Server/Network icons and SPORE branding

### Pages

1. **Home (`routes/home.tsx`)**: Dashboard with hosts table
2. **Profiles (`routes/profiles.tsx`)**: List boot profiles
3. **New Profile (`routes/profiles.new.tsx`)**: Create profile form
4. **Edit Profile (`routes/profiles.$id.tsx`)**: Edit profile
5. **ISOs (`routes/isos.tsx`)**: List ISO images
6. **New ISO (`routes/isos.new.tsx`)**: Add ISO form
7. **Edit ISO (`routes/isos.$id.tsx`)**: Edit ISO
8. **TFTP Browser (`routes/tftp.$.tsx`)**: File browser for boot files
9. **Terminal (`routes/terminal.tsx`)**: Web terminal

### Key Components

- **`components/hosts-table.tsx`**: Hosts table with edit dialog
- **`components/edit-host-dialog.tsx`**: Modal for editing host
- **`components/profile-form.tsx`**: Profile create/edit form
- **`components/iso-form.tsx`**: ISO create/edit form
- **`components/tftp-file-browser.tsx`**: TFTP directory listing
- **`components/tftp-toolbar.tsx`**: TFTP actions (create, upload)
- **`components/tftp-editor-modal.tsx`**: File content editor
- **`components/web-terminal.tsx`**: xterm.js terminal component

### Styling

- **Theme**: Dark mode with blue accent colors (OKLCH)
- **Primary**: `oklch(0.7 0.18 250)` - bright blue
- **Background**: `oklch(0.13 0.02 260)` - dark with blue tint
- **Cards**: Elevated with rounded corners and subtle borders
- **Monospace**: JetBrains Mono for code, MAC addresses, terminal

## Development

### Running the App

```bash
# Install dependencies (from workspace root)
pnpm install

# Push database schema
pnpm db:push --filter=spore

# Start dev server (uses Vite HMR)
pnpm dev --filter=spore
```

### Database Management

```bash
# Push schema changes
pnpm db:push --filter=spore

# Open Drizzle Studio
pnpm db:studio --filter=spore
```

### Important Notes

1. **Storage Directory**: Database and TFTP files are in `storage/`
2. **MAC Address Format**: Always normalized to lowercase
3. **WebSocket Terminal**: Requires the custom server (not just Vite)
4. **Better SQLite3**: Requires rebuild on different platforms

## Deployment

### Docker

A single-stage Dockerfile is provided:

```dockerfile
FROM node:22-alpine
# Installs: dnsmasq, bash, python3, make, g++ (for native deps)
# Uses pnpm with tsx for runtime
CMD ["pnpm", "tsx", "server.ts"]
```

Build and run:
```bash
docker build -t spore -f apps/spore/Dockerfile .
docker run -p 3000:3000 -v spore-data:/app/apps/spore/storage spore
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `storage/sqlite.db` | SQLite database path |
| `TFTP_ROOT` | `storage/tftpboot` | TFTP files directory |
| `ISO_STORAGE_PATH` | `storage/isos` | Uploaded ISOs directory |
| `PORT` | `3000` | Server port |
| `NODE_ENV` | `development` | Environment mode |

### Production Considerations

1. **Persistent Storage**: Mount volume for `storage/` directory
2. **Network Access**: Ensure accessible from PXE network
3. **DHCP Configuration**: Point to `/api/boot/{mac}` endpoint

## PXE Boot Flow

1. Host sends PXE boot request to DHCP server
2. DHCP provides Spore URL and instructs iPXE chain-load
3. iPXE requests `http://spore-server/api/boot/{mac-address}`
4. Spore serves templated iPXE script
5. Host executes script (boot OS, load installer, etc.)

## File Structure

```
apps/spore/
├── app/
│   ├── components/          # React components
│   │   ├── ui/              # Shadcn UI components
│   │   ├── hosts-table.tsx
│   │   ├── profile-form.tsx
│   │   ├── tftp-*.tsx       # TFTP browser components
│   │   └── web-terminal.tsx
│   ├── db/
│   │   ├── schema.ts        # Drizzle schema
│   │   └── index.ts         # Database connection
│   ├── lib/
│   │   ├── actions.ts       # Data actions (CRUD)
│   │   ├── tftp-actions.ts  # TFTP file operations
│   │   ├── templating.ts    # Template rendering
│   │   └── ipxe.ts          # iPXE script utilities
│   ├── routes/
│   │   ├── home.tsx         # Dashboard
│   │   ├── profiles.*.tsx   # Profile pages
│   │   ├── isos.*.tsx       # ISO pages
│   │   ├── tftp.$.tsx       # TFTP browser
│   │   ├── terminal.tsx     # Web terminal
│   │   └── api.*.ts         # API resource routes
│   ├── routes.ts            # Route definitions
│   ├── root.tsx             # Root layout
│   └── app.css              # Global styles + theme
├── storage/                 # Persistent data (gitignored)
│   ├── sqlite.db            # Database
│   ├── tftpboot/            # TFTP files
│   └── isos/                # Uploaded ISOs
├── server.ts                # Custom Express + WebSocket server
├── vite.config.ts           # Vite configuration
├── react-router.config.ts   # React Router config
├── drizzle.config.ts        # Drizzle configuration
├── Dockerfile               # Production deployment
└── package.json
```

## Testing Boot Flow

```bash
# Simulate a boot request
curl http://localhost:3000/api/boot/00:11:22:33:44:55

# Check host was registered in UI or database
```

## Troubleshooting

### Database Issues

```bash
# Push schema (creates tables)
pnpm db:push --filter=spore
```

### Better SQLite3 Bindings Error

```bash
pnpm approve-builds
# or
pnpm rebuild better-sqlite3
```

### WebSocket Terminal Not Connecting

Ensure you're using the custom server (`pnpm dev`) not just Vite.

## Code Style

- Biome for linting/formatting
- TypeScript strict mode
- React Router loaders/actions for data
- Tailwind CSS for styling
- Path alias: `~/` maps to `app/`

## Dependencies

Key dependencies:

- `react-router@7` - Framework
- `@react-router/express` - Express adapter
- `vite@6` - Build tool
- `drizzle-orm` + `better-sqlite3` - Database
- `xterm` + `node-pty` - Terminal
- `ws` - WebSocket server
- `@radix-ui/*` - UI primitives
- `tailwindcss@4` - Styling
- `lucide-react` - Icons

---

**Last Updated**: January 2026
**Framework**: React Router 7
