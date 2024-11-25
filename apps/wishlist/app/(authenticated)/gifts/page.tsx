import { Divider, Heading, Strong, Text } from '@repo/ui';
import { GiftTable } from 'components/gift-table';
import { getSortedVisibleGiftsForUser } from 'lib/db/queries-cached';
import { isAuthenticated } from 'lib/db/queries';
import type { GiftWithOwnerAndClaimedByAndCreatedBy } from 'lib/db/types';

export default async function Gifts({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { user } = await isAuthenticated();
  const gifts = await getSortedVisibleGiftsForUser({
    userId: user.id,
    direction: searchParams.direction as 'asc' | 'desc' | undefined,
    column: searchParams.column as 'name' | 'owner' | undefined,
  });

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading>Gifts</Heading>
      </div>

      <Divider className="my-4" soft />

      <div className="mb-4">
        <Text>
          The gifts in this list include: <Strong>Claimable gifts</Strong>,{' '}
          <Strong>Gifts that you have created</Strong>, and{' '}
          <Strong>Gifts that you have already claimed</Strong>.
        </Text>
        <Text className="mt-2">
          Any gifts that you have created or claimed will not have the option to
          claim them.
        </Text>
      </div>

      <GiftTable
        gifts={gifts as GiftWithOwnerAndClaimedByAndCreatedBy[]}
        currentUserId={user.id}
        showGiftOwner
      />
    </>
  );
}
