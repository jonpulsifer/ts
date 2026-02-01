import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getScriptByPath } from '@/lib/actions';
import { formatDate } from '@/lib/utils';
import { ScriptEditForm } from './_components/script-edit-form';

interface ScriptPageProps {
  params: Promise<{ path: string[] }>;
}

export default async function ScriptPage({ params }: ScriptPageProps) {
  await connection();
  const { path: pathSegments } = await params;
  const scriptPath = pathSegments.join('/');

  const script = await getScriptByPath(scriptPath);

  if (!script) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/scripts">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="font-mono text-2xl font-bold">{script.path}</h1>
          <p className="text-muted-foreground">
            {script.description || 'iPXE script'}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ScriptEditForm script={script} />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Script Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">API Endpoint</p>
                <code className="mt-1 block rounded bg-muted p-2 text-xs">
                  /api/scripts/{script.path}
                </code>
              </div>
              <div>
                <p className="text-sm font-medium">Chain Command</p>
                <code className="mt-1 block rounded bg-muted p-2 text-xs">
                  chain {'{{base_url}}'}/api/scripts/{script.path}
                </code>
              </div>
              <div>
                <p className="text-sm font-medium">Created</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(script.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Last Updated</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(script.updatedAt)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Template Variables</CardTitle>
              <CardDescription>Available in this script</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <code className="rounded bg-muted px-1">{'{{mac}}'}</code>
                  <span className="text-muted-foreground">MAC address</span>
                </div>
                <div className="flex justify-between">
                  <code className="rounded bg-muted px-1">
                    {'{{hostname}}'}
                  </code>
                  <span className="text-muted-foreground">Hostname</span>
                </div>
                <div className="flex justify-between">
                  <code className="rounded bg-muted px-1">
                    {'{{server_ip}}'}
                  </code>
                  <span className="text-muted-foreground">Server IP</span>
                </div>
                <div className="flex justify-between">
                  <code className="rounded bg-muted px-1">
                    {'{{base_url}}'}
                  </code>
                  <span className="text-muted-foreground">Server URL</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
