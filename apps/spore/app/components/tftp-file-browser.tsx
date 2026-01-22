import { File, Folder, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useRevalidator } from 'react-router';
import { Button } from '~/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import type { TftpFile } from '~/lib/tftp';
import { TftpEditorModal } from './tftp-editor-modal';

interface TftpFileBrowserProps {
  files: TftpFile[];
  onDelete: (path: string) => void;
}

export function TftpFileBrowser({ files, onDelete }: TftpFileBrowserProps) {
  const [editingFile, setEditingFile] = useState<string | null>(null);
  const revalidator = useRevalidator();

  async function handleDelete(path: string) {
    if (confirm(`Are you sure you want to delete "${path}"?`)) {
      onDelete(path);
    }
  }

  function handleEdit(file: TftpFile) {
    if (!file.isDirectory) {
      setEditingFile(file.path);
    }
  }

  function handleEditorClose(open: boolean) {
    if (!open) {
      setEditingFile(null);
      revalidator.revalidate();
    }
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Last Modified</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center h-48">
                <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
                  <p>This directory is empty.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            files.map((file) => (
              <TableRow key={file.name}>
                <TableCell>
                  {file.isDirectory ? (
                    <Link
                      to={`/tftp/${file.path}`}
                      className="flex items-center gap-2 hover:underline"
                    >
                      <Folder className="h-4 w-4 text-primary" />
                      <span className="font-medium">{file.name}</span>
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleEdit(file)}
                      className="flex items-center gap-2 hover:underline text-left"
                    >
                      <File className="h-4 w-4" />
                      <span className="font-medium">{file.name}</span>
                    </button>
                  )}
                </TableCell>
                <TableCell>
                  {file.isDirectory
                    ? '-'
                    : `${(file.size / 1024).toFixed(2)} KB`}
                </TableCell>
                <TableCell>
                  {new Date(file.updatedAt).toLocaleString()}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleEdit(file)}
                    disabled={file.isDirectory}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(file.path)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {editingFile && (
        <TftpEditorModal
          path={editingFile}
          open={!!editingFile}
          onOpenChange={handleEditorClose}
        />
      )}
    </>
  );
}
