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
  const gift = await getGiftById(params.id);
  if (!gift || !session?.user) {
    notFound();
  }
  const user = await getUserWithGiftsById(gift.ownerId);
  return (
    <>
      <Heading>{gift.name}</Heading>
      <Text>{user.name}</Text>
      <Divider className="my-4" soft />
      <DescriptionList>
        <DescriptionTerm>Name</DescriptionTerm>
        <DescriptionDetails>{gift.name}</DescriptionDetails>
        <DescriptionTerm>URL</DescriptionTerm>
        {gift.url ? (
          <DescriptionDetails>
            <Link href={gift.url}>{gift.url}</Link>
          </DescriptionDetails>
        ) : null}
        <DescriptionTerm>Description</DescriptionTerm>
        <DescriptionDetails>{gift.description}</DescriptionDetails>
      </DescriptionList>
      <div className="flex gap-4">
        <EditButton gift={gift} currentUserId={session.user.id} />
        <ClaimButton gift={gift} currentUserId={session.user.id} />
        <DeleteButton gift={gift} currentUserId={session.user.id} />
      </div>
    </>
  );
};

export default GiftPage;
