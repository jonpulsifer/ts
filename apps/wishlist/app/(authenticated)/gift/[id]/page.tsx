import {
  DescriptionDetails,
  DescriptionList,
  DescriptionTerm,
  Divider,
  Heading,
  Link,
  Text,
} from '@repo/ui';
import { auth } from 'app/auth';
import { ClaimButton } from 'components/claim-button';
import { DeleteButton } from 'components/delete-button';
import { EditButton } from 'components/edit-button';
import { getGiftById, getUserWithGiftsById } from 'lib/prisma-ssr';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface PageProps {
  params: { [K in string]: string };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const gift = await getGiftById(params.id);
  return {
    title: gift?.name || 'Gift',
    description: gift?.description || 'A gift',
  };
}

const GiftPage = async ({ params }: PageProps) => {
  const session = await auth();
  const gift = await getGiftById(params.id, true, true, true);
  if (!gift || !session) {
    notFound();
  }
  const user = await getUserWithGiftsById(gift.ownerId);
  return (
    <>
      <div className="flex w-full flex-wrap items-end justify-between gap-4">
        <div>
          <Heading>{gift.name}</Heading>
          <Text>
            {user?.name || user?.email || user?.id}{' '}
            {gift.ownerId === session.user.id ? 'is giving' : 'wants'} this gift
          </Text>
        </div>
        <div className="flex gap-4">
          <ClaimButton gift={gift} currentUserId={session.user.id} />
          <EditButton gift={gift} currentUserId={session.user.id} />
          <DeleteButton gift={gift} currentUserId={session.user.id} />
        </div>
      </div>
      <Divider className="my-4" soft />
      <DescriptionList>
        <DescriptionTerm>Name</DescriptionTerm>
        <DescriptionDetails>{gift.name}</DescriptionDetails>
        <DescriptionTerm>Created By</DescriptionTerm>
        <DescriptionDetails>
          {gift.createdBy?.name || gift.createdBy?.email || gift.createdById}
        </DescriptionDetails>
        <DescriptionTerm>Owner</DescriptionTerm>
        <DescriptionDetails>
          {gift.owner?.name || gift.owner?.email || gift.ownerId}
        </DescriptionDetails>
        <DescriptionTerm>URL</DescriptionTerm>
        {gift.url ? (
          <DescriptionDetails>
            <Link href={gift.url}>{gift.url}</Link>
          </DescriptionDetails>
        ) : null}
        <DescriptionTerm>Description</DescriptionTerm>
        <DescriptionDetails>{gift.description}</DescriptionDetails>
      </DescriptionList>
    </>
  );
};

export default GiftPage;
