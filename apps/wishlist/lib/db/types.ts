import type { Prisma } from '@prisma/client';

export type UserWithGifts = Prisma.UserGetPayload<{
  include: { gifts: true };
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

export type GiftWithOwnerAndClaimedByAndCreatedBy = Prisma.GiftGetPayload<{
  include: {
    owner: true;
    claimedBy: true;
    createdBy: true;
  };
}>;

export type UserWithGiftCount = Prisma.UserGetPayload<{
  select: {
    id: true;
    name: true;
    email: true;
    image: true;
    _count: { select: { gifts: true } };
  };
}>;

export type GiftRecommendation = {
  name: string;
  description: string;
  estimatedPrice?: string;
};
