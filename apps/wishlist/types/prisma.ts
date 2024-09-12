import type { Prisma } from '@prisma/client';

export type UserWithGifts = Prisma.UserGetPayload<{
  include: { gifts: true };
}>;

export type UserWithGiftsAndWishlists = Prisma.UserGetPayload<{
  include: { gifts: true; wishlists: true };
}>;

export type UserWithGiftsWithOwners = Prisma.UserGetPayload<{
  include: {
    gifts: {
      include: {
        owner: true;
      };
    };
  };
}>;

export type AllVisibleGiftsForUserWithOwners = Prisma.UserGetPayload<{
  include: {
    gifts: {
      include: {
        owner: true;
        claimedBy: true;
      };
    };
  };
}>;

export type GiftWithOwner = Prisma.GiftGetPayload<{
  include: { owner: true };
}>;

export type GiftWithOwnerAndWishlistIds = Prisma.GiftGetPayload<{
  include: { owner: true; wishlists: { select: { id: true } } };
}>;

export type GiftWithOwnerAndClaimedBy = Prisma.GiftGetPayload<{
  include: {
    owner: true;
    claimedBy: true;
  };
}>;
