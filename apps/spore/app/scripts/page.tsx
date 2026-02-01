import { FileCode, Plus } from 'lucide-react';
import Link from 'next/link';
import { connection } from 'next/server';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getScripts } from '@/lib/actions';
import { timeAgo } from '@/lib/utils';
import { NewScriptDialog } from './_components/new-script-dialog';

export default async function ScriptsPage() {
  await connection();
  const scripts = await getScripts();

  // Group scripts by top-level directory
  const groupedScripts = scripts.reduce(
    (acc, script) => {
      const parts = script.path.split('/');
      const group = parts.length > 1 ? parts[0] : '(root)';
      if (!acc[group]) acc[group] = [];
      acc[group].push(script);
      return acc;
    },
    {} as Record<string, typeof scripts>,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Scripts</h1>
          <p className="text-muted-foreground">
            Chainable iPXE sub-scripts served at /api/scripts/[path]
          </p>
        </div>
        <NewScriptDialog>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Script
          </Button>
        </NewScriptDialog>
      </div>

      {scripts.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No scripts created yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Scripts are chainable sub-scripts that can be referenced from
              profiles.
            </p>
            <NewScriptDialog>
              <Button className="mt-4">Create your first script</Button>
            </NewScriptDialog>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedScripts)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([group, groupScripts]) => (
              <Card key={group}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileCode className="h-5 w-5" />
                    {group === '(root)' ? 'Root Scripts' : group}
                  </CardTitle>
                  <CardDescription>
                    {groupScripts.length} script
                    {groupScripts.length !== 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="divide-y">
                    {groupScripts.map((script) => (
                      <div
                        key={script.id}
                        className="flex items-center justify-between py-3"
                      >
                        <div>
                          <Link
                            href={`/scripts/${script.path}`}
                            className="font-mono text-sm hover:underline"
                          >
                            {script.path}
                          </Link>
                          {script.description && (
                            <p className="text-sm text-muted-foreground">
                              {script.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <code className="rounded bg-muted px-2 py-1 text-xs">
                            /api/scripts/{script.path}
                          </code>
                          <span className="text-xs text-muted-foreground">
                            {timeAgo(script.updatedAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
}
