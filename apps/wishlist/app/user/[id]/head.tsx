import { getUserGifts } from '../../../lib/firebase-ssr';

interface Props {
  params: { [K in string]: string };
}

export default async function Head({ params }: Props) {
  const { user } = await getUserGifts(params.id);
  const titleMarkup = user?.name
    ? `Edit Profile | ${user.name}`
    : 'Edit Profile';

  return (
    <>
      <title>{titleMarkup}</title>
    </>
  );
}
