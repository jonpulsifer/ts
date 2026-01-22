import { FolderPlus, Plus, Upload } from 'lucide-react';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';

interface TftpToolbarProps {
  currentPath: string;
  onCreateDirectory: (name: string) => void;
  onCreateFile: (name: string) => void;
  onUploadFile: (file: File) => void;
}

export function TftpToolbar({
  currentPath: _currentPath,
  onCreateDirectory,
  onCreateFile,
  onUploadFile,
}: TftpToolbarProps) {
  const [dirName, setDirName] = useState('');
  const [fileName, setFileName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [createDirOpen, setCreateDirOpen] = useState(false);
  const [createFileOpen, setCreateFileOpen] = useState(false);
  const [uploadFileOpen, setUploadFileOpen] = useState(false);

  function handleCreateDirectory() {
    if (dirName) {
      onCreateDirectory(dirName);
      setDirName('');
      setCreateDirOpen(false);
    }
  }

  function handleCreateFile() {
    if (fileName) {
      onCreateFile(fileName);
      setFileName('');
      setCreateFileOpen(false);
    }
  }

  function handleUpload() {
    if (file) {
      onUploadFile(file);
      setFile(null);
      setUploadFileOpen(false);
    }
  }

  return (
    <div className="flex gap-2">
      <Dialog open={createDirOpen} onOpenChange={setCreateDirOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <FolderPlus className="h-4 w-4 mr-2" />
            Create Directory
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Directory</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={dirName}
                onChange={(e) => setDirName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <Button onClick={handleCreateDirectory}>Create</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={createFileOpen} onOpenChange={setCreateFileOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Create File
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create File</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <Button onClick={handleCreateFile}>Create</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={uploadFileOpen} onOpenChange={setUploadFileOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Upload File
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload File</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                File
              </Label>
              <Input
                id="name"
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="col-span-3"
              />
            </div>
          </div>
          <Button onClick={handleUpload}>Upload</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
