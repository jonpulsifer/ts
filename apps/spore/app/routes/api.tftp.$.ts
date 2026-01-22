import { getTftpFile, updateTftpFile } from '~/lib/tftp-actions';
import type { Route } from './+types/api.tftp.$';

// Resource route for TFTP file operations
export async function loader({ params }: Route.LoaderArgs) {
  const filePath = params['*'] || '';

  try {
    const file = await getTftpFile(filePath);
    return Response.json({ content: file.content, name: file.name });
  } catch {
    return Response.json(
      { content: '', error: 'File not found' },
      { status: 404 },
    );
  }
}

export async function action({ params, request }: Route.ActionArgs) {
  const filePath = params['*'] || '';
  const formData = await request.formData();
  const content = formData.get('content') as string;

  try {
    await updateTftpFile(filePath, content);
    return Response.json({ ok: true });
  } catch {
    return Response.json(
      { ok: false, error: 'Failed to save' },
      { status: 500 },
    );
  }
}
