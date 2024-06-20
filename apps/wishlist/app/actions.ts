'use server';

import { prisma } from 'lib/prisma';
import { isAuthenticated } from 'lib/prisma-ssr';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export const updateUser = async (_state: unknown, formData: FormData) => {
  const { user } = await isAuthenticated();
  const name = formData.get('name') as string;
  const address = formData.get('address') as string;
  const shirt_size = formData.get('shirt_size') as string;
  const pant_size = formData.get('pant_size') as string;
  const shoe_size = formData.get('shoe_size') as string;
  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        address,
        shirt_size,
        pant_size,
        shoe_size,
      },
    });
    revalidatePath(`/user/${user.id}`, 'layout');
    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      return { error: error.message };
    }
    console.error(error);
    return { error: 'Something went wrong in the server action' };
  }
};

export const leaveWishlist = async ({
  userId,
  wishlistId,
}: {
  userId: string;
  wishlistId: string;
}) => {
  try {
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        wishlists: {
          disconnect: {
            id: wishlistId,
          },
        },
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Something went wrong in the server action' };
  }
  revalidatePath(`/`, 'layout');
  redirect('/wishlists');
};

export const joinWishlist = async ({
  userId,
  wishlistId,
  password,
}: {
  userId: string;
  wishlistId: string;
  password: string;
}) => {
  try {
    const wishlist = await prisma.wishlist.findUniqueOrThrow({
      where: {
        id: wishlistId,
      },
    });

    if (wishlist.password !== password) {
      throw new Error('Pin does not match');
    }

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        wishlists: {
          connect: {
            id: wishlistId,
          },
        },
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Something went wrong in the server action' };
  }
  revalidatePath(`/`, 'layout');
  redirect('/wishlists');
};

export const addGift = async ({
  name,
  description,
  url,
  recipient,
}: {
  name: string;
  description: string;
  url: string;
  recipient: string;
}) => {
  try {
    const { user } = await isAuthenticated();
    const wishlists = await prisma.wishlist.findMany({
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
    await prisma.gift.create({
      data: {
        name,
        url,
        description,
        owner: {
          connect: {
            id: recipient,
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
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Something went wrong in the server action' };
  }
  revalidatePath(`/`, 'layout');
};

export const deleteGift = async (id: string) => {
  try {
    const { user } = await isAuthenticated();
    const gift = await prisma.gift.findUnique({
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
      throw new Error('You are not the owner or creator of this gift');
    }
    await prisma.gift.delete({
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
  revalidatePath('/', 'layout');
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
    const { user } = await isAuthenticated();
    const gift = await prisma.gift.findUnique({
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
      await prisma.gift.update({
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
      throw new Error('You are not the owner or creator of this gift');
    }
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Something went wrong in the server action' };
  }
  revalidatePath(`/gift`, 'layout');
};

export const claimGift = async (id: string) => {
  try {
    const { user } = await isAuthenticated();
    const gift = await prisma.gift.findUnique({
      where: {
        id,
      },
      select: {
        claimedBy: true,
        ownerId: true,
      },
    });

    // determine if the gift has been claimed by someone else
    const isClaimed = Boolean(gift?.claimedBy);
    if (isClaimed) {
      revalidatePath(`/gift`, 'layout');
      revalidatePath('/gifts');
      throw new Error('This gift has already been claimed');
    }

    // determine if the gift is owned by the current user
    const isOwner = gift?.ownerId === user.id;
    if (isOwner) {
      throw new Error('You cannot claim your own gift');
    }

    await prisma.gift.update({
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
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Something went wrong in the server action' };
  }
  revalidatePath(`/gift`, 'layout');
  revalidatePath('/gifts');
};

export const unclaimGift = async (id: string) => {
  try {
    const { user } = await isAuthenticated();
    const gift = await prisma.gift.findUnique({
      where: {
        id,
      },
      select: {
        claimedById: true,
      },
    });
    const isClaimed = gift?.claimedById === user.id;
    if (!isClaimed) {
      throw new Error('You have not claimed this gift');
    }

    await prisma.gift.update({
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
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Something went wrong in the server action' };
  }
  revalidatePath('/gift/[id]/page', 'page');
  revalidatePath('/gifts');
};
