import EmptyState from 'components/EmptyState';
import GiftList from 'components/GiftList';
import Page from 'components/Page';
import { UserProfile } from 'components/User';
import { getUserById, getVisibleGiftsForUserById } from 'lib/prisma-ssr';
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
  const profile = await getUserById(params.id);
  const { gifts, user } = await getVisibleGiftsForUserById(params.id);
  if (!gifts.length) {
    return (
      <EmptyState
        title="🎁 No Gifts Found"
        subtitle="The elves could not find any gifts for this person"
      >
        <div className="p-4">
          <p>
            People need to{' '}
            <span className="font-semibold text-black dark:text-slate-200">
              add more gifts
            </span>{' '}
            to their wishlists
          </p>
        </div>
      </EmptyState>
    );
  }
  return (
    <Page>
      <div className="space-y-4">
        <UserProfile user={profile} currentUserId={user.id} />
        <GiftList gifts={gifts} currentUserId={user.id} />
      </div>
    </Page>
  );
};

export default ProfilePage;
