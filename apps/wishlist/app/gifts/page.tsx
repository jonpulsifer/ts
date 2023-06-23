import GiftList from 'components/GiftList';
import Page from 'components/Page';
import { getGifts } from 'lib/firebase-ssr';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gifts',
  description: "See everyone's gifts",
};

const GiftsPage = async () => {
  const { gifts } = await getGifts();

  return (
    <Page title="🎁 Gifts">
      <GiftList gifts={gifts} />
    </Page>
  );
};

export default GiftsPage;
