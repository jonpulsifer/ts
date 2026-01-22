import { redirect } from 'react-router';
import { IsoForm } from '~/components/iso-form';
import { createIso, createIsoUpload } from '~/lib/actions';
import type { Route } from './+types/isos.new';

export const meta: Route.MetaFunction = () => [{ title: 'Add ISO - Spore' }];

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const name = formData.get('name') as string;
  const source = formData.get('source') as string;
  const url = formData.get('url') as string;
  const file = formData.get('file') as File | null;

  if (source === 'upload' && file && file.size > 0) {
    const uploadForm = new FormData();
    uploadForm.set('name', name);
    uploadForm.set('file', file);
    await createIsoUpload(uploadForm);
  } else {
    await createIso({ name, url });
  }

  return redirect('/isos');
}

export default function NewIso() {
  return (
    <div className="max-w-2xl mx-auto">
      <IsoForm />
    </div>
  );
}
