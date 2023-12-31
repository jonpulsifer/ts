import GiftList from 'components/GiftList';
import Page from 'components/Page';
import { getVisibleGiftsForUser } from 'lib/prisma-ssr';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gifts',
  description: "See everyone's gifts",
};

const GiftsPage = async () => {
  const { gifts, user } = await getVisibleGiftsForUser();
  return (
    <Page>
      <GiftList gifts={gifts} currentUserId={user.id} />
    </Page>
  );
};

export default GiftsPage;
