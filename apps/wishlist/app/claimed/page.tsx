import GiftList from 'components/GiftList';
import Page from 'components/Page';
import { getClaimedGifts } from 'lib/firebase-ssr';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Claimed Gifts',
  description: 'See what gifts you have claimed',
};

const ClaimedPage = async () => {
  const { gifts } = await getClaimedGifts();
  return (
    <Page>
      <GiftList gifts={gifts} />
    </Page>
  );
};

export default ClaimedPage;
