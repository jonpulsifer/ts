import path from 'node:path';
import { ChevronRight, Folder, Home } from 'lucide-react';
import { Link, useRevalidator } from 'react-router';
import { TftpFileBrowser } from '~/components/tftp-file-browser';
import { TftpToolbar } from '~/components/tftp-toolbar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '~/components/ui/breadcrumb';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import {
  createTftpDirectory,
  createTftpFile,
  deleteTftpPath,
  listTftpDirectory,
  uploadTftpFile,
} from '~/lib/tftp-actions';
import type { Route } from './+types/tftp.$';

export const meta: Route.MetaFunction = () => [{ title: 'TFTP - Spore' }];

export async function loader({ params }: Route.LoaderArgs) {
  const splatPath = params['*'] || '';
  const files = await listTftpDirectory(splatPath);
  return { files, currentPath: splatPath };
}

export async function action({ request, params }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get('intent') as string;
  const currentPath = params['*'] || '';

  switch (intent) {
    case 'createDirectory': {
      const name = formData.get('name') as string;
      await createTftpDirectory(path.join(currentPath, name));
      break;
    }
    case 'createFile': {
      const name = formData.get('name') as string;
      await createTftpFile(path.join(currentPath, name));
      break;
    }
    case 'uploadFile': {
      const file = formData.get('file') as File;
      if (file && file.size > 0) {
        await uploadTftpFile(currentPath, file);
      }
      break;
    }
    case 'delete': {
      const targetPath = formData.get('path') as string;
      await deleteTftpPath(targetPath);
      break;
    }
  }

  return { ok: true };
}

export default function TftpBrowser({ loaderData }: Route.ComponentProps) {
  const { files = [], currentPath = '' } = (loaderData || {}) as {
    files?: Awaited<ReturnType<typeof listTftpDirectory>>;
    currentPath?: string;
  };
  const revalidator = useRevalidator();

  const pathParts = currentPath ? currentPath.split('/').filter(Boolean) : [];

  async function handleCreateDirectory(name: string) {
    const formData = new FormData();
    formData.set('intent', 'createDirectory');
    formData.set('name', name);
    await fetch(`/tftp/${currentPath}`, { method: 'POST', body: formData });
    revalidator.revalidate();
  }

  async function handleCreateFile(name: string) {
    const formData = new FormData();
    formData.set('intent', 'createFile');
    formData.set('name', name);
    await fetch(`/tftp/${currentPath}`, { method: 'POST', body: formData });
    revalidator.revalidate();
  }

  async function handleUploadFile(file: File) {
    const formData = new FormData();
    formData.set('intent', 'uploadFile');
    formData.set('file', file);
    await fetch(`/tftp/${currentPath}`, { method: 'POST', body: formData });
    revalidator.revalidate();
  }

  async function handleDelete(targetPath: string) {
    const formData = new FormData();
    formData.set('intent', 'delete');
    formData.set('path', targetPath);
    await fetch(`/tftp/${currentPath}`, { method: 'POST', body: formData });
    revalidator.revalidate();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">TFTP File Browser</h1>
          <p className="text-muted-foreground">
            Manage files served via TFTP for network booting.
          </p>
        </div>
        <TftpToolbar
          currentPath={currentPath}
          onCreateDirectory={handleCreateDirectory}
          onCreateFile={handleCreateFile}
          onUploadFile={handleUploadFile}
        />
      </div>

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/tftp" className="flex items-center gap-1">
                <Home className="h-4 w-4" />
                TFTP Root
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {pathParts.map((part, index) => {
            const pathTo = `/tftp/${pathParts.slice(0, index + 1).join('/')}`;
            const isLast = index === pathParts.length - 1;
            return (
              <BreadcrumbItem key={pathTo}>
                <BreadcrumbSeparator>
                  <ChevronRight className="h-4 w-4" />
                </BreadcrumbSeparator>
                {isLast ? (
                  <BreadcrumbPage className="flex items-center gap-1">
                    <Folder className="h-4 w-4" />
                    {part}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={pathTo} className="flex items-center gap-1">
                      <Folder className="h-4 w-4" />
                      {part}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Folder className="h-5 w-5 text-primary" />
            <CardTitle>{currentPath || 'Root'}</CardTitle>
          </div>
          <CardDescription>
            Files in this directory are served via TFTP.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TftpFileBrowser files={files} onDelete={handleDelete} />
        </CardContent>
      </Card>
    </div>
  );
}
