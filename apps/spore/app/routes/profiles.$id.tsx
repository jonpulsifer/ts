import { redirect } from 'react-router';
import { ProfileForm } from '~/components/profile-form';
import {
  deleteProfile,
  getIsos,
  getProfile,
  updateProfile,
} from '~/lib/actions';
import type { Route } from './+types/profiles.$id';

export const meta: Route.MetaFunction = ({ data }) => [
  { title: data?.profile ? `${data.profile.name} - Spore` : 'Profile - Spore' },
];

export async function loader({ params }: Route.LoaderArgs) {
  const profile = await getProfile(Number(params.id));
  if (!profile) {
    throw new Response('Not Found', { status: 404 });
  }
  const isos = await getIsos();
  return { profile, isos };
}

export async function action({ request, params }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get('intent');
  const id = Number(params.id);

  if (intent === 'delete') {
    await deleteProfile(id);
    return redirect('/profiles');
  }

  const name = formData.get('name') as string;
  const content = formData.get('content') as string;
  const variables = formData.get('variables') as string;
  const isoIdStr = formData.get('isoId') as string;

  await updateProfile(id, {
    name,
    content,
    variables: variables || null,
    isoId: isoIdStr && isoIdStr !== 'none' ? Number(isoIdStr) : null,
  });

  return redirect('/profiles');
}

export default function EditProfile({ loaderData }: Route.ComponentProps) {
  const { profile, isos } = loaderData;

  return (
    <div className="max-w-4xl mx-auto">
      <ProfileForm profile={profile} isos={isos} />
    </div>
  );
}
