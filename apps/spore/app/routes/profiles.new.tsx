import { redirect } from 'react-router';
import { ProfileForm } from '~/components/profile-form';
import { createProfile, getIsos } from '~/lib/actions';
import type { Route } from './+types/profiles.new';

export const meta: Route.MetaFunction = () => [
  { title: 'New Profile - Spore' },
];

export async function loader() {
  const isos = await getIsos();
  return { isos };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const name = formData.get('name') as string;
  const content = formData.get('content') as string;
  const variables = formData.get('variables') as string;
  const isoIdStr = formData.get('isoId') as string;

  await createProfile({
    name,
    content,
    variables: variables || null,
    isoId: isoIdStr && isoIdStr !== 'none' ? Number(isoIdStr) : null,
  });

  return redirect('/profiles');
}

export default function NewProfile({ loaderData }: Route.ComponentProps) {
  const { isos } = loaderData;

  return (
    <div className="max-w-4xl mx-auto">
      <ProfileForm isos={isos} />
    </div>
  );
}
