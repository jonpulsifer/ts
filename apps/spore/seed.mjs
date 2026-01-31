// Seed script for initial Spore setup
import Database from 'better-sqlite3';

const db = new Database('spore.db');
const now = new Date().toISOString();

console.log('Setting up Spore configuration...\n');

// Settings
console.log('1. Configuring settings...');
db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(
  'serverOrigin',
  'http://10.2.0.11:3000',
);
db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(
  'autoRegisterHosts',
  'true',
);

// Default Boot Menu Profile
console.log('2. Creating Default Boot Menu profile...');
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
item netbootxyz           Exit to netboot.xyz (Global)
item shell                iPXE Shell
item local                Boot from local disk
choose --default k8s-node --timeout 5000 target && goto \${target}

:k8s-node
chain \${base-url}/api/scripts/k8s-node/netboot.ipxe

:netbootxyz
chain --replace https://boot.netboot.xyz/menu.ipxe

:shell
shell

:local
exit
`;

db.prepare(`
  INSERT OR IGNORE INTO profiles (name, description, content, is_default, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?)
`).run(
  'Default Boot Menu',
  'Main iPXE boot menu for all hosts',
  defaultMenuContent,
  1,
  now,
  now,
);

// K8s Node Direct Boot Profile
console.log('3. Creating K8s Node profile...');
const k8sNodeContent = `#!ipxe
# Direct boot to NixOS K8s Node
dhcp
chain {{base_url}}/api/scripts/k8s-node/netboot.ipxe
`;

db.prepare(`
  INSERT OR IGNORE INTO profiles (name, description, content, is_default, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?)
`).run(
  'K8s Node',
  'Direct boot to NixOS K8s Node (skips menu)',
  k8sNodeContent,
  0,
  now,
  now,
);

// K8s Node netboot script
console.log('4. Creating k8s-node/netboot.ipxe script...');
const k8sNetbootScript = `#!ipxe
# NixOS K8s Node Boot Script
# Host: {{hostname}} ({{mac}})

set base-url http://{{server_ip}}

echo Loading NixOS Kernel for {{hostname}} via HTTP...
kernel \${base-url}/k8s-node/bzImage init=/nix/store/xvvwybxnzv1ngwlxnbp0q8zm72p4cqp0-nixos-system-k8s-node-netboot-kexec-25.05.20260102.ac62194/init initrd=initrd loglevel=3 console=ttyS0,115200 console=tty1
initrd \${base-url}/k8s-node/initrd
boot
`;

db.prepare(`
  INSERT OR IGNORE INTO scripts (path, description, content, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?)
`).run(
  'k8s-node/netboot.ipxe',
  'NixOS K8s Node HTTP boot script',
  k8sNetbootScript,
  now,
  now,
);

// Get K8s Node profile ID
const k8sProfile = db
  .prepare('SELECT id FROM profiles WHERE name = ?')
  .get('K8s Node');
const profileId = k8sProfile?.id || null;

// Hosts
console.log('5. Registering hosts...');

db.prepare(`
  INSERT OR REPLACE INTO hosts (mac_address, hostname, profile_id, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?)
`).run('1c:69:7a:01:2a:ef', 'nuc', profileId, now, now);

db.prepare(`
  INSERT OR REPLACE INTO hosts (mac_address, hostname, profile_id, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?)
`).run('ec:8e:b5:72:35:24', '800g2', profileId, now, now);

db.prepare(`
  INSERT OR REPLACE INTO hosts (mac_address, hostname, profile_id, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?)
`).run('14:b3:1f:2b:57:85', 'optiplex', profileId, now, now);

db.prepare(`
  INSERT OR REPLACE INTO hosts (mac_address, hostname, profile_id, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?)
`).run('38:22:e2:2d:96:44', 'riptide', profileId, now, now);

console.log('\n✓ Setup complete!\n');
console.log('Configuration:');
console.log('  - Server origin: http://10.2.0.11:3000');
console.log('  - Auto-register hosts: enabled\n');

console.log('Profiles:');
const profiles = db.prepare('SELECT id, name, is_default FROM profiles').all();
profiles.forEach((p) =>
  console.log(`  - [${p.id}] ${p.name}${p.is_default ? ' (default)' : ''}`),
);

console.log('\nScripts:');
const scripts = db.prepare('SELECT path FROM scripts').all();
scripts.forEach((s) => console.log(`  - ${s.path}`));

console.log('\nHosts:');
const hosts = db
  .prepare('SELECT mac_address, hostname, profile_id FROM hosts')
  .all();
hosts.forEach((h) =>
  console.log(
    `  - ${h.hostname} (${h.mac_address}) -> profile ${h.profile_id}`,
  ),
);

console.log('\n🚀 Access Spore at http://localhost:3000');

db.close();
