import GiftList from 'components/GiftList';
import { UserProfile } from 'components/User';
import { getAllGiftsForUserById, getUserById } from 'lib/prisma-ssr';
import { Metadata } from 'next';

interface Props {
  params: { [K in string]: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const user = await getUserById(params.id);
  const { name, email } = user;
  const title = `${name || email}'s Profile`;
  return {
    title,
    description: title,
  };
}

const ProfilePage = async ({ params }: Props) => {
  const user = await getUserById(params.id);
  const gifts = await getAllGiftsForUserById(params.id);
  return (
    <div className="space-y-16">
      <UserProfile user={user} />
      <GiftList gifts={gifts} />
    </div>
  );
};

export default ProfilePage;
