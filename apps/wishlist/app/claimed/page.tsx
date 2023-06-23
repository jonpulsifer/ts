import Card from 'components/Card';
import GiftList from 'components/GiftList';
import Page from 'components/Page';
import { getClaimedGifts } from 'lib/firebase-ssr';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Claimed Gifts',
  description: 'See what gifts you have claimed',
};

const ClaimedPage = async () => {
  const { gifts } = await getClaimedGifts();
  return (
    <Page title="🛒 Claimed Gifts">
      <Suspense fallback={<Card title="LOADING">Loading...</Card>}>
        <GiftList gifts={gifts} />
      </Suspense>
    </Page>
  );
};

export default ClaimedPage;
