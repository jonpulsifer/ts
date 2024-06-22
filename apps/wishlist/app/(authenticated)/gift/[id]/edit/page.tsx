import { Divider, Heading } from '@repo/ui';
import type { Metadata } from 'next';

import EmptyState from '../../../../../components/EmptyState';
import { getGiftById } from '../../../../../lib/prisma-ssr';
import GiftForm from './components/gift-form';

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
    <>
      <Heading>Edit Gift</Heading>
      <Divider soft className="my-4" />
      <GiftForm gift={gift} />
    </>
  );
};

export default EditGiftPage;
