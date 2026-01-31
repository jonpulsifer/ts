// Seed script for initial Spore setup
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { hosts, profiles, scripts, settings } from './lib/db/schema';

const sqlite = new Database('spore.db');
const db = drizzle(sqlite);

// Settings
console.log('Setting up configuration...');
db.insert(settings)
  .values([
    { key: 'serverOrigin', value: 'http://10.2.0.11:3000' },
    { key: 'autoRegisterHosts', value: 'true' },
  ])
  .onConflictDoUpdate({
    target: settings.key,
    set: { value: settings.value },
  })
  .run();

// Default Boot Menu Profile
console.log('Creating default boot menu profile...');
const defaultMenuContent = `#!ipxe

# Ensure we have an IP
dhcp

# Define the server and protocol
set server-ip {{server_ip}}
set base-url {{base_url}}

:start
menu iPXE Boot Menu - {{hostname}} ({{mac}})
item --gap --             -------------------------
item k8s-node             Boot NixOS K8s Node (HTTP)
item nuc                  Boot NUC Management
item netbootxyz           Exit to netboot.xyz (Global)
item shell                iPXE Shell
item local                Boot from local disk
choose --default k8s-node --timeout 5000 target && goto \${target}

:k8s-node
chain \${base-url}/api/scripts/k8s-node/netboot.ipxe

:nuc
chain \${base-url}/api/scripts/nuc/netboot.ipxe

:netbootxyz
chain --replace https://boot.netboot.xyz/menu.ipxe

:shell
shell

:local
exit
`;

const now = new Date().toISOString();

// Check if default profile exists
const existingDefault = db
  .select()
  .from(profiles)
  .where(require('drizzle-orm').eq(profiles.isDefault, true))
  .get();
if (!existingDefault) {
  db.insert(profiles)
    .values({
      name: 'Default Boot Menu',
      description: 'Main iPXE boot menu for all hosts',
      content: defaultMenuContent,
      isDefault: true,
      createdAt: now,
      updatedAt: now,
    })
    .run();
}

// K8s Node Direct Boot Profile
console.log('Creating K8s Node profile...');
const k8sNodeContent = `#!ipxe
# Direct boot to NixOS K8s Node
dhcp
chain {{base_url}}/api/scripts/k8s-node/netboot.ipxe
`;

const existingK8s = db
  .select()
  .from(profiles)
  .where(require('drizzle-orm').eq(profiles.name, 'K8s Node'))
  .get();
if (!existingK8s) {
  db.insert(profiles)
    .values({
      name: 'K8s Node',
      description: 'Direct boot to NixOS K8s Node (skips menu)',
      content: k8sNodeContent,
      isDefault: false,
      createdAt: now,
      updatedAt: now,
    })
    .run();
}

// K8s Node netboot script
console.log('Creating k8s-node/netboot.ipxe script...');
const k8sNetbootScript = `#!ipxe
# NixOS K8s Node Boot Script
# Host: {{hostname}} ({{mac}})

set base-url http://{{server_ip}}

echo Loading NixOS Kernel for {{hostname}} via HTTP...
kernel \${base-url}/k8s-node/bzImage init=/nix/store/xvvwybxnzv1ngwlxnbp0q8zm72p4cqp0-nixos-system-k8s-node-netboot-kexec-25.05.20260102.ac62194/init initrd=initrd loglevel=3 console=ttyS0,115200 console=tty1
initrd \${base-url}/k8s-node/initrd
boot
`;

const existingK8sScript = db
  .select()
  .from(scripts)
  .where(require('drizzle-orm').eq(scripts.path, 'k8s-node/netboot.ipxe'))
  .get();
if (!existingK8sScript) {
  db.insert(scripts)
    .values({
      path: 'k8s-node/netboot.ipxe',
      description: 'NixOS K8s Node HTTP boot script',
      content: k8sNetbootScript,
      createdAt: now,
      updatedAt: now,
    })
    .run();
}

// NUC management script
console.log('Creating nuc/netboot.ipxe script...');
const nucNetbootScript = `#!ipxe
# NUC Management Boot Script
# Host: {{hostname}} ({{mac}})

set base-url http://{{server_ip}}

echo Loading NUC management environment for {{hostname}}...
# Add your NUC-specific boot commands here
# For now, chain to netboot.xyz as fallback
chain --replace https://boot.netboot.xyz/menu.ipxe
`;

const existingNucScript = db
  .select()
  .from(scripts)
  .where(require('drizzle-orm').eq(scripts.path, 'nuc/netboot.ipxe'))
  .get();
if (!existingNucScript) {
  db.insert(scripts)
    .values({
      path: 'nuc/netboot.ipxe',
      description: 'NUC management boot script',
      content: nucNetbootScript,
      createdAt: now,
      updatedAt: now,
    })
    .run();
}

// Host: NUC
console.log('Creating NUC host...');
const nucMac = '1c:69:7a:01:2a:ef';

// Get K8s Node profile ID for assignment
const k8sProfile = db
  .select()
  .from(profiles)
  .where(require('drizzle-orm').eq(profiles.name, 'K8s Node'))
  .get();

const existingNuc = db
  .select()
  .from(hosts)
  .where(require('drizzle-orm').eq(hosts.macAddress, nucMac))
  .get();
if (!existingNuc) {
  db.insert(hosts)
    .values({
      macAddress: nucMac,
      hostname: 'nuc',
      profileId: k8sProfile?.id || null, // Assign K8s Node profile
      createdAt: now,
      updatedAt: now,
    })
    .run();
}

console.log('\nSetup complete!');
console.log('- Server origin: http://10.2.0.11:3000');
console.log('- Default boot menu profile created');
console.log('- K8s Node profile created');
console.log('- k8s-node/netboot.ipxe script created');
console.log('- nuc/netboot.ipxe script created');
console.log('- NUC host registered (1c:69:7a:01:2a:ef -> nuc)');
console.log('\nYou can now access Spore at http://localhost:3000');

sqlite.close();
