import path from 'node:path';

/**
 * Returns the configured TFTP root directory.
 * Defaults to `storage/tftpboot` for development if TFTP_ROOT_DIR is not set.
 * The production environment should have this configured to `/var/lib/tftpboot`.
 */
export function getTftpRootDir() {
  return (
    process.env.TFTP_ROOT_DIR || path.join(process.cwd(), 'storage', 'tftpboot')
  );
}

/**
 * Resolves a relative path from the TFTP root and ensures it's within the root.
 * @param relPath The relative path from the user.
 * @returns The absolute, verified path.
 * @throws An error if the path is outside the TFTP root.
 */
export function resolveTftpPath(relPath: string) {
  const rootDir = getTftpRootDir();
  const fullPath = path.resolve(rootDir, relPath);

  // Verify the path is within the root directory
  if (!fullPath.startsWith(rootDir)) {
    throw new Error('Path traversal detected');
  }

  return fullPath;
}

export type TftpFile = {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  updatedAt: Date;
};
