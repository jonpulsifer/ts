import { getUser } from '../../../lib/firebase-ssr';
import DefaultTags from '../../DefaultTags';

interface Props {
  params: { [K in string]: string };
}

export default async function Head({ params }: Props) {
  const { user } = await getUser(params.id);
  const titleMarkup = user?.name
    ? `Edit Profile | ${user.name}`
    : 'Edit Profile';

  return (
    <>
      <DefaultTags />
      <title>{titleMarkup}</title>
    </>
  );
}
