'use server';

import { getSession } from '@/app/auth';
import db from '@/lib/db/client';
import { revalidateTag } from 'next/cache';
import { z } from 'zod';

const revalidateGiftRelatedCaches = () => {
  revalidateTag('gifts');
  revalidateTag('users');
  revalidateTag('wishlists');
};

const GiftSchema = z.object({
  recipientId: z.string().min(1, 'Recipient is required'),
  name: z.string().min(1, 'Gift name is required'),
  url: z.string().url().optional().or(z.literal('')),
  description: z.string().optional(),
});

export type GiftFormData = z.infer<typeof GiftSchema>;

export const addGift = async (prevState: any, formData: GiftFormData) => {
  const validatedFields = GiftSchema.safeParse(formData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to add gift. Please check the form for errors.',
    };
  }

  try {
    const { user } = await getSession();
    const wishlists = await db.wishlist.findMany({
      select: {
        id: true,
      },
      where: {
        members: {
          some: {
            id: user.id,
          },
        },
      },
    });

    const wishlistIds = wishlists.map((wishlist) => ({ id: wishlist.id }));
    await db.gift.create({
      data: {
        name: validatedFields.data.name,
        url: validatedFields.data.url,
        description: validatedFields.data.description,
        owner: {
          connect: {
            id: validatedFields.data.recipientId,
          },
        },
        createdBy: {
          connect: {
            id: user.id,
          },
        },
        wishlists: {
          connect: wishlistIds,
        },
      },
    });
    revalidateGiftRelatedCaches();
    return {
      success: true,
      message: `${validatedFields.data.name} has been added to the wishlist.`,
    };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Something went wrong in the server action' };
  }
};

export const deleteGift = async (id: string) => {
  try {
    const { user } = await getSession();
    const gift = await db.gift.findUnique({
      where: {
        id,
      },
      select: {
        ownerId: true,
        createdById: true,
      },
    });
    const isOwner = gift?.ownerId === user.id;
    const isCreator = gift?.createdById === user.id;
    if (!isOwner && !isCreator) {
      return { error: 'You are not the owner or creator of this gift' };
    }
    await db.gift.delete({
      where: {
        id,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Something went wrong in the server action' };
  }
  revalidateGiftRelatedCaches();
};

export const updateGift = async ({
  id,
  name,
  description,
  url,
}: {
  id: string;
  name: string;
  description: string;
  url: string;
}) => {
  try {
    const { user } = await getSession();
    const gift = await db.gift.findUnique({
      where: {
        id,
      },
      select: {
        ownerId: true,
        createdById: true,
      },
    });
    const isOwner = gift?.ownerId === user.id;
    const isCreator = gift?.createdById === user.id;
    if (isOwner || isCreator) {
      await db.gift.update({
        where: {
          id,
        },
        data: {
          name,
          url,
          description,
        },
      });
    } else {
      return { error: 'You are not the owner or creator of this gift' };
    }
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Something went wrong in the server action' };
  }
  revalidateGiftRelatedCaches();
};

export const claimGift = async (id: string) => {
  try {
    const { user } = await getSession();
    const gift = await db.gift.findUnique({
      where: {
        id,
      },
      select: {
        claimedBy: true,
        ownerId: true,
        name: true,
      },
    });

    if (!gift) {
      return { error: 'Gift not found' };
    }

    // determine if the gift has been claimed by someone else
    const isClaimed = Boolean(gift?.claimedBy);
    if (isClaimed) {
      return { error: 'This gift has already been claimed' };
    }

    // determine if the gift is owned by the current user
    const isOwner = gift?.ownerId === user.id;
    if (isOwner) {
      return { error: 'You cannot claim your own gift' };
    }

    await db.gift.update({
      where: {
        id,
      },
      data: {
        claimed: true,
        claimedBy: {
          connect: {
            id: user.id,
          },
        },
      },
    });
    revalidateGiftRelatedCaches();
    return { success: true, message: `You claimed ${gift?.name}` };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Something went wrong in the server action' };
  }
};

export const unclaimGift = async (id: string) => {
  try {
    const { user } = await getSession();
    const gift = await db.gift.findUnique({
      where: {
        id,
      },
      select: {
        claimedById: true,
        name: true,
      },
    });
    const isClaimed = gift?.claimedById === user.id;
    if (!isClaimed) {
      return { error: 'You have not claimed this gift' };
    }

    await db.gift.update({
      where: {
        id,
      },
      data: {
        claimed: false,
        claimedBy: {
          disconnect: true,
        },
      },
    });
    revalidateGiftRelatedCaches();
    return { success: true, message: `You unclaimed ${gift?.name}` };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Something went wrong in the server action' };
  }
};
