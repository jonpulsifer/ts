import { createReadStream, type Stats, statSync } from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import { getIso } from '~/lib/actions';
import type { Route } from './+types/api.isos.$id.file';

export async function loader({ params }: Route.LoaderArgs) {
  const id = Number(params.id);

  if (!id) {
    return new Response('Not Found', { status: 404 });
  }

  const iso = await getIso(id);

  if (!iso || iso.source !== 'upload' || !iso.filePath) {
    return new Response('Not Found', { status: 404 });
  }

  const storageDir =
    process.env.ISO_STORAGE_DIR || path.join(process.cwd(), 'storage', 'isos');
  const filePath = path.join(storageDir, iso.filePath);

  // Verify file exists
  let stats: Stats;
  try {
    stats = statSync(filePath);
  } catch {
    return new Response('Not Found', { status: 404 });
  }

  // Create a readable stream
  const stream = createReadStream(filePath);
  const webStream = Readable.toWeb(stream) as ReadableStream;

  return new Response(webStream, {
    headers: {
      'Content-Type': iso.contentType || 'application/octet-stream',
      'Content-Length': stats.size.toString(),
      'Content-Disposition': `attachment; filename="${iso.fileName || 'download.iso'}"`,
      'Accept-Ranges': 'bytes',
    },
  });
}
