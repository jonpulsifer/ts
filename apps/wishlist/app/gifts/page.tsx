import type { Metadata } from 'next';
import GiftList from 'components/GiftList';
import Page from 'components/Page';
import { getVisibleGiftsForUser } from 'lib/prisma-ssr';

export const metadata: Metadata = {
  title: 'Gifts',
  description: "See everyone's gifts",
};

const GiftsPage = async () => {
  const { gifts, user } = await getVisibleGiftsForUser();
  return (
    <Page>
      <GiftList currentUserId={user.id} gifts={gifts} />
    </Page>
  );
};

export default GiftsPage;
