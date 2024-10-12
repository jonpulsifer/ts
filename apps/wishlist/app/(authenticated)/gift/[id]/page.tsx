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
import { BackButton } from 'components/back-button';
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
    title: gift.name,
    description: gift.description || 'A gift',
  };
}

const GiftPage = async ({ params }: PageProps) => {
  const session = await auth();
  if (!params.id) {
    notFound();
  }

  const gift = await getGiftById(params.id, true, true, true);
  if (!gift || !session) {
    notFound();
  }
  const user = await getUserWithGiftsById(gift.ownerId);
  const ownerName = user?.name || user?.email || user?.id;
  const creatorName =
    gift.createdBy?.name || gift.createdBy?.email || gift.createdBy?.id;

  return (
    <>
      <div className="flex w-full flex-wrap items-end justify-between gap-4">
        <div>
          <Heading>{gift.name}</Heading>
          <Text>
            {gift.ownerId === gift.createdById
              ? `${ownerName} wants this gift`
              : `${creatorName} recommends this gift for ${ownerName}`}
          </Text>
        </div>
        <div className="flex gap-4">
          <BackButton />
          <ClaimButton gift={gift} currentUserId={session.user.id} />
          <EditButton gift={gift} currentUserId={session.user.id} />
          <DeleteButton gift={gift} currentUserId={session.user.id} />
        </div>
      </div>
      <Divider className="my-4" soft />
      <DescriptionList>
        <DescriptionTerm>Name</DescriptionTerm>
        <DescriptionDetails>{gift.name}</DescriptionDetails>
        {gift.url ? (
          <>
            <DescriptionTerm>URL</DescriptionTerm>
            <DescriptionDetails>
              <Link
                target="_blank"
                rel="noreferrer"
                href={gift.url}
                className="block max-w-full break-all"
              >
                {gift.url}
              </Link>
            </DescriptionDetails>
          </>
        ) : null}
        {gift.description ? (
          <>
            <DescriptionTerm>Description</DescriptionTerm>
            <DescriptionDetails>{gift.description}</DescriptionDetails>
          </>
        ) : null}
      </DescriptionList>
    </>
  );
};

export default GiftPage;
