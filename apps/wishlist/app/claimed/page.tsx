import { faGifts } from '@fortawesome/free-solid-svg-icons';
import EmptyState from 'components/EmptyState';
import GiftList from 'components/GiftList';
import Page from 'components/Page';
import { getClaimedGiftsForMe } from 'lib/prisma-ssr';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Claimed Gifts',
  description: 'See what gifts you have claimed',
};

const ClaimedPage = async () => {
  const { gifts, user } = await getClaimedGiftsForMe();

  if (!gifts.length) {
    return (
      <EmptyState
        title="🛒 No Claimed Gifts"
        subtitle="You have not claimed any gifts"
        action={{
          title: 'View gifts',
          link: '/gifts',
          icon: faGifts,
        }}
      >
        <div className="p-4">
          <p>
            <span className="font-semibold dark:text-slate-200 text-black dark:text-slate-200">
              Claim a gift
            </span>{' '}
            before they&apos;re all gone.
          </p>
        </div>
      </EmptyState>
    );
  }
  return (
    <Page>
      <GiftList gifts={gifts} currentUserId={user.id} />
    </Page>
  );
};

export default ClaimedPage;
