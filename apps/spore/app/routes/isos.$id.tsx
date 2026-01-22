import { redirect } from 'react-router';
import { IsoForm } from '~/components/iso-form';
import {
  deleteIso,
  getIso,
  updateIsoMeta,
  updateIsoUpload,
  updateIsoUrl,
} from '~/lib/actions';
import type { Route } from './+types/isos.$id';

export const meta: Route.MetaFunction = ({ data }) => [
  { title: data?.iso ? `${data.iso.name} - Spore` : 'ISO - Spore' },
];

export async function loader({ params }: Route.LoaderArgs) {
  const iso = await getIso(Number(params.id));
  if (!iso) {
    throw new Response('Not Found', { status: 404 });
  }
  return { iso };
}

export async function action({ request, params }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get('intent');
  const id = Number(params.id);

  if (intent === 'delete') {
    await deleteIso(id);
    return redirect('/isos');
  }

  const name = formData.get('name') as string;
  const source = formData.get('source') as string;
  const url = formData.get('url') as string;
  const file = formData.get('file') as File | null;

  if (source === 'upload' && file && file.size > 0) {
    const uploadForm = new FormData();
    uploadForm.set('name', name);
    uploadForm.set('file', file);
    await updateIsoUpload(id, uploadForm);
  } else if (source === 'upload') {
    // No new file, just update metadata
    await updateIsoMeta(id, { name });
  } else {
    await updateIsoUrl(id, { name, url });
  }

  return redirect('/isos');
}

export default function EditIso({ loaderData }: Route.ComponentProps) {
  const { iso } = loaderData;

  return (
    <div className="max-w-2xl mx-auto">
      <IsoForm iso={iso} />
    </div>
  );
}
