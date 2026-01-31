import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getSettings } from '@/lib/actions';
import { SettingsForm } from './_components/settings-form';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Configure Spore boot manager</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SettingsForm settings={settings} />

        <Card>
          <CardHeader>
            <CardTitle>DHCP Configuration</CardTitle>
            <CardDescription>
              Configure your DHCP server to chain to Spore
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">ISC DHCP Server</p>
              <pre className="mt-2 overflow-x-auto rounded bg-muted p-3 text-xs">
                {`# In dhcpd.conf
if exists user-class and option user-class = "iPXE" {
  filename "http://${settings.serverOrigin || '<spore-server>'}:3000/api/boot/\${net0/mac}";
} else {
  # Chain to iPXE first (TFTP)
  next-server ${settings.serverOrigin?.split(':')[0] || '<tftp-server>'};
  filename "undionly.kpxe";  # or ipxe.efi for UEFI
}`}
              </pre>
            </div>

            <div>
              <p className="text-sm font-medium">dnsmasq</p>
              <pre className="mt-2 overflow-x-auto rounded bg-muted p-3 text-xs">
                {`# In dnsmasq.conf
dhcp-match=set:ipxe,175
dhcp-boot=tag:!ipxe,undionly.kpxe
dhcp-boot=tag:ipxe,http://${settings.serverOrigin || '<spore-server>'}:3000/api/boot/\${net0/mac}`}
              </pre>
            </div>

            <div>
              <p className="text-sm font-medium">iPXE Script (embedded)</p>
              <pre className="mt-2 overflow-x-auto rounded bg-muted p-3 text-xs">
                {`#!ipxe
dhcp
chain http://${settings.serverOrigin || '<spore-server>'}:3000/api/boot/\${net0/mac}`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
