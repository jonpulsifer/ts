-- Settings
INSERT OR REPLACE INTO settings (key, value) VALUES ('serverOrigin', 'http://10.2.0.11:3000');
INSERT OR REPLACE INTO settings (key, value) VALUES ('autoRegisterHosts', 'true');

-- Default Boot Menu Profile
INSERT OR IGNORE INTO profiles (name, description, content, is_default, created_at, updated_at)
VALUES (
  'Default Boot Menu',
  'Main iPXE boot menu for all hosts',
  '#!ipxe

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
choose --default k8s-node --timeout 5000 target && goto ${target}

:k8s-node
chain ${base-url}/api/scripts/k8s-node/netboot.ipxe

:netbootxyz
chain --replace https://boot.netboot.xyz/menu.ipxe

:shell
shell

:local
exit
',
  1,
  datetime('now'),
  datetime('now')
);

-- K8s Node Direct Boot Profile
INSERT OR IGNORE INTO profiles (name, description, content, is_default, created_at, updated_at)
VALUES (
  'K8s Node',
  'Direct boot to NixOS K8s Node (skips menu)',
  '#!ipxe
# Direct boot to NixOS K8s Node
dhcp
chain {{base_url}}/api/scripts/k8s-node/netboot.ipxe
',
  0,
  datetime('now'),
  datetime('now')
);

-- K8s Node netboot script
INSERT OR IGNORE INTO scripts (path, description, content, created_at, updated_at)
VALUES (
  'k8s-node/netboot.ipxe',
  'NixOS K8s Node HTTP boot script',
  '#!ipxe
# NixOS K8s Node Boot Script
# Host: {{hostname}} ({{mac}})

set base-url http://{{server_ip}}

echo Loading NixOS Kernel for {{hostname}} via HTTP...
kernel ${base-url}/k8s-node/bzImage init=/nix/store/xvvwybxnzv1ngwlxnbp0q8zm72p4cqp0-nixos-system-k8s-node-netboot-kexec-25.05.20260102.ac62194/init initrd=initrd loglevel=3 console=ttyS0,115200 console=tty1
initrd ${base-url}/k8s-node/initrd
boot
',
  datetime('now'),
  datetime('now')
);

-- Get K8s Node profile ID
-- Hosts will be assigned to K8s Node profile (ID 2)

-- Host: NUC
INSERT OR IGNORE INTO hosts (mac_address, hostname, profile_id, created_at, updated_at)
VALUES ('1c:69:7a:01:2a:ef', 'nuc', 2, datetime('now'), datetime('now'));

-- Host: 800g2
INSERT OR IGNORE INTO hosts (mac_address, hostname, profile_id, created_at, updated_at)
VALUES ('ec:8e:b5:72:35:24', '800g2', 2, datetime('now'), datetime('now'));
