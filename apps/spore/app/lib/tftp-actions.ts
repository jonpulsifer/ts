import { createWriteStream } from 'node:fs';
import {
  mkdir,
  readdir,
  readFile,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { resolveTftpPath, type TftpFile } from './tftp';

export async function listTftpDirectory(
  relativePath: string,
): Promise<TftpFile[]> {
  const fullPath = resolveTftpPath(relativePath);

  try {
    const dirEntries = await readdir(fullPath, { withFileTypes: true });

    const files = await Promise.all(
      dirEntries.map(async (entry) => {
        const entryPath = path.join(fullPath, entry.name);
        const stats = await stat(entryPath);
        return {
          name: entry.name,
          path: path.join(relativePath, entry.name),
          isDirectory: entry.isDirectory(),
          size: stats.size,
          updatedAt: stats.mtime,
        };
      }),
    );

    return files.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    // If directory doesn't exist or path is a file, return empty array
    if (code === 'ENOENT' || code === 'ENOTDIR') {
      return [];
    }
    throw error;
  }
}

export async function getTftpFile(relativePath: string) {
  const fullPath = resolveTftpPath(relativePath);
  const stats = await stat(fullPath);

  if (stats.isDirectory()) {
    throw new Error('Path is a directory');
  }

  const content = await readFile(fullPath, 'utf-8');
  return {
    name: path.basename(relativePath),
    path: relativePath,
    content: content,
    size: stats.size,
    updatedAt: stats.mtime,
  };
}

export async function updateTftpFile(relativePath: string, content: string) {
  const fullPath = resolveTftpPath(relativePath);
  await writeFile(fullPath, content);
}

export async function createTftpFile(relativePath: string, content = '') {
  const fullPath = resolveTftpPath(relativePath);
  const dir = path.dirname(fullPath);
  await mkdir(dir, { recursive: true });
  await writeFile(fullPath, content);
}

export async function createTftpDirectory(relativePath: string) {
  const fullPath = resolveTftpPath(relativePath);
  await mkdir(fullPath, { recursive: true });
}

export async function deleteTftpPath(relativePath: string) {
  const fullPath = resolveTftpPath(relativePath);
  await rm(fullPath, { recursive: true, force: true });
}

export async function uploadTftpFile(relativePath: string, file: File) {
  const dirPath = resolveTftpPath(relativePath);
  const filePath = resolveTftpPath(path.join(relativePath, file.name));

  if (!filePath.startsWith(dirPath)) {
    throw new Error('Upload path is outside of the target directory.');
  }

  await pipeline(
    Readable.fromWeb(
      file.stream() as unknown as import('stream/web').ReadableStream,
    ),
    createWriteStream(filePath),
  );
}
