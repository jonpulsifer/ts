import { Divider, Heading } from '@repo/ui';
import type { Metadata } from 'next';

import { notFound } from 'next/navigation';
import EmptyState from '../../../../../components/EmptyState';
import { getGiftById } from '../../../../../lib/db/queries';
import GiftForm from './components/gift-form';

interface PageProps {
  params: { [K in string]: string };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  if (!params.id) {
    return {
      title: 'Gift Not Found',
      description: 'The requested gift could not be found.',
    };
  }

  const gift = await getGiftById(params.id);
  if (!gift) {
    notFound();
  }
  return {
    title: `Edit ${gift.name}`,
    description: 'Edit a gift',
  };
}

const EditGiftPage = async ({ params }: PageProps) => {
  if (!params.id) {
    return <EmptyState title="Invalid Gift ID" />;
  }

  const gift = await getGiftById(params.id);
  if (!gift) {
    notFound();
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
