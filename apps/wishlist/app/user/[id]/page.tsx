import EmptyState from 'components/EmptyState';
import Page from 'components/Page';
import { UserProfile } from 'components/User';
import { getUserById, getVisibleGiftsForUserById } from 'lib/prisma-ssr';
import type { Metadata } from 'next';

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
  return (
    <Page title="View Profile">
      {gifts.length ? (
        <UserProfile currentUserId={user.id} user={profile} />
      ) : (
        <EmptyState
          subtitle="The elves could not find any gifts for this person"
          title="🎁 No Gifts Found"
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
      )}
    </Page>
  );
};

export default ProfilePage;
