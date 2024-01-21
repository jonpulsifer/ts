import { Card } from '@repo/ui/card';
import type { Metadata } from 'next';

import EmptyState from '../../../../components/EmptyState';
import GiftForm from '../../../../components/GiftForm';
import Page from '../../../../components/Page';
import { getGiftById } from '../../../../lib/prisma-ssr';

interface PageProps {
  params: { [K in string]: string };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const gift = await getGiftById(params.id);
  return {
    title: `Edit ${gift?.name || '🎁 Edit Gift'}`,
    description: 'Edit a gift',
  };
}

const EditGiftPage = async ({ params }: PageProps) => {
  const gift = await getGiftById(params.id);
  if (!gift) {
    return EmptyState({ title: 'Gift not found' });
  }
  return (
    <Page title={`Edit ${gift.name}`}>
      <Card>
        <GiftForm gift={gift} />
      </Card>
    </Page>
  );
};

export default EditGiftPage;
