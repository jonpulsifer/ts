# Spore - iPXE Boot Manager

A web-based iPXE boot manager for homelab network infrastructure. Manage hosts, boot profiles, and chainable scripts with a clean UI.

## Features

- **Host Management**: Track hosts by MAC address, auto-register on first boot
- **Boot Profiles**: Create iPXE scripts with template variable support
- **Chainable Scripts**: Organize sub-scripts for modular boot configurations
- **Template Variables**: Dynamic substitution for hostname, MAC, server IP, etc.
- **Built-in TFTP**: dnsmasq TFTP server for serving iPXE binaries

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm

### Development

```bash
# Install dependencies
pnpm install

# Push database schema
pnpm --filter spore db:push

# Start development server
pnpm --filter spore dev
```

The app will be available at http://localhost:3000

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | SQLite database path | `file:./spore.db` |
| `PORT` | HTTP server port | `3000` |

### Database

Spore uses SQLite with Drizzle ORM. To initialize or update the schema:

```bash
pnpm --filter spore db:push
```

To browse the database:

```bash
pnpm --filter spore db:studio
```

## Architecture

### API Routes

| Endpoint | Description |
|----------|-------------|
| `GET /api/boot/[mac]` | Returns iPXE script for the host |
| `GET /api/scripts/[...path]` | Serves chainable sub-scripts |

### Template Variables

Available in profiles and scripts:

| Variable | Description | Example |
|----------|-------------|---------|
| `{{mac}}` | MAC address (colon-separated) | `aa:bb:cc:dd:ee:ff` |
| `{{mac_hyphen}}` | MAC address (hyphen-separated) | `aa-bb-cc-dd-ee-ff` |
| `{{hostname}}` | Host hostname | `k8s-node-1` |
| `{{profile_name}}` | Profile name | `K8s Node` |
| `{{server_ip}}` | Server IP address | `10.2.0.11` |
| `{{base_url}}` | Full server URL | `http://10.2.0.11:3000` |

### Boot Flow

1. Host boots and gets DHCP response pointing to iPXE
2. iPXE chains to Spore: `http://spore:3000/api/boot/${net0/mac}`
3. Spore looks up host by MAC:
   - If host has profile assigned: serve that profile
   - If host is unassigned: serve default profile
   - If host is unknown and auto-register enabled: create host, serve default
4. Profile may chain to additional scripts at `/api/scripts/[path]`

## Deployment

### Docker

```bash
docker build -t spore -f apps/spore/Dockerfile .
docker run -d \
  -p 3000:3000 \
  -p 69:69/udp \
  -v spore-data:/app/data \
  -v tftpboot:/var/lib/tftpboot \
  spore
```

### Volumes

| Path | Description |
|------|-------------|
| `/app/data` | SQLite database |
| `/var/lib/tftpboot` | TFTP root (place iPXE binaries here) |

### DHCP Configuration

#### dnsmasq

```conf
# Enable PXE
dhcp-match=set:ipxe,175
dhcp-boot=tag:!ipxe,undionly.kpxe
dhcp-boot=tag:ipxe,http://spore:3000/api/boot/${net0/mac}
```

#### ISC DHCP

```conf
if exists user-class and option user-class = "iPXE" {
  filename "http://spore:3000/api/boot/${net0/mac}";
} else {
  next-server spore;
  filename "undionly.kpxe";
}
```

## Example Profiles

### Boot Menu (Default)

```ipxe
#!ipxe
dhcp
set server-ip {{server_ip}}
set base-url {{base_url}}

:start
menu iPXE Boot Menu - {{hostname}} ({{mac}})
item --gap --             -------------------------
item k8s-node             Boot NixOS K8s Node
item netbootxyz           Exit to netboot.xyz
item shell                iPXE Shell
choose --default k8s-node --timeout 5000 target && goto ${target}

:k8s-node
chain ${base-url}/api/scripts/k8s-node/netboot.ipxe

:netbootxyz
chain --replace https://boot.netboot.xyz/menu.ipxe

:shell
shell
```

### Direct Boot Profile

```ipxe
#!ipxe
dhcp
chain {{base_url}}/api/scripts/k8s-node/netboot.ipxe
```

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: SQLite + Drizzle ORM
- **UI**: Tailwind CSS + shadcn/ui
- **TFTP**: dnsmasq
