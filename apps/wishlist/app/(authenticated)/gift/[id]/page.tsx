import {
  DescriptionDetails,
  DescriptionList,
  DescriptionTerm,
  Divider,
  Heading,
  Link,
  Text,
} from '@repo/ui';
import { BackButton } from 'components/back-button';
import { ClaimButton } from 'components/claim-button';
import { DeleteButton } from 'components/delete-button';
import { EditButton } from 'components/edit-button';
import {
  getGiftWithOwnerClaimedByAndCreatedBy,
  getGiftsWithOwnerClaimedByAndCreatedBy,
} from 'lib/db/queries-cached';
import { isAuthenticated } from 'lib/db/queries';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface PageProps {
  params: { [K in string]: string };
}

export const generateStaticParams = async () => {
  const gifts = await getGiftsWithOwnerClaimedByAndCreatedBy();
  return gifts.map((gift) => ({ id: gift.id }));
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  if (!params.id) {
    return {
      title: 'Gift Not Found',
      description: 'The requested gift could not be found.',
    };
  }

  const gift = await getGiftWithOwnerClaimedByAndCreatedBy(params.id);
  if (!gift) {
    notFound();
  }

  return {
    title: gift.name,
    description: gift.description || 'A gift',
  };
}

const GiftPage = async ({ params }: PageProps) => {
  if (!params.id) {
    notFound();
  }

  const gift = await getGiftWithOwnerClaimedByAndCreatedBy(params.id);
  if (!gift) {
    notFound();
  }

  const ownerName = gift.owner.name || gift.owner.email || gift.owner.id;
  const creatorName =
    gift.createdBy?.name || gift.createdBy?.email || gift.createdBy?.id;
  const { user: currentUser } = await isAuthenticated();

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
          <ClaimButton gift={gift} currentUserId={currentUser.id} />
          <EditButton gift={gift} currentUserId={currentUser.id} />
          <DeleteButton gift={gift} currentUserId={currentUser.id} />
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
