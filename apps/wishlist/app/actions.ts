'use server';

import { auth } from 'app/auth';
import prisma from 'lib/prisma';
import { isAuthenticated } from 'lib/db/queries';
import { revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';

const revalidateGiftRelatedCaches = () => {
  revalidateTag('gifts');
  revalidateTag('users');
  revalidateTag('wishlists');
};

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
    revalidateGiftRelatedCaches();
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

export const leaveWishlist = async ({ wishlistId }: { wishlistId: string }) => {
  const { user } = await isAuthenticated();
  try {
    await prisma.user.update({
      where: {
        id: user.id,
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
  revalidateGiftRelatedCaches();
  redirect('/wishlists');
};

export const joinWishlist = async ({
  wishlistId,
  password,
}: {
  wishlistId: string;
  password: string;
}) => {
  const { user } = await isAuthenticated();
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
        id: user.id,
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
  revalidateGiftRelatedCaches();
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
  revalidateGiftRelatedCaches();
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
  revalidateGiftRelatedCaches();
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
      revalidateGiftRelatedCaches();
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
  revalidateGiftRelatedCaches();
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
  revalidateGiftRelatedCaches();
};

export const updateUserOnboardingStatus = async (
  userId: string,
  status: boolean,
) => {
  try {
    const { user } = await isAuthenticated();
    if (user.id !== userId) {
      throw new Error('You are not authorized to update this user');
    }
    await prisma.user.update({
      where: { id: userId },
      data: { hasCompletedOnboarding: status },
    });
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Something went wrong in the server action' };
  }
  revalidateTag('users');
};

export async function createSecretSantaEvent({
  name,
  createdById,
  participantIds,
}: { name: string; createdById: string; participantIds: string[] }) {
  try {
    const { user } = await isAuthenticated();
    if (user.id !== createdById) {
      throw new Error('You are not authorized to create this event');
    }
    const event = await prisma.secretSantaEvent.create({
      data: {
        name,
        createdById,
        participants: {
          create: participantIds.map((id) => ({ userId: id })),
        },
      },
    });
    revalidateTag('secretSanta');
    revalidateTag('users');
    return event;
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Something went wrong in the server action' };
  }
}

export async function assignSecretSanta(eventId: string) {
  const event = await prisma.secretSantaEvent.findUnique({
    where: { id: eventId },
    include: { participants: { include: { user: true } } },
  });

  if (!event) throw new Error('Event not found');

  const participants = event.participants;
  let assignments: { participantId: string; assignedToUserId: string }[] = [];
  let attempts = 0;
  const maxAttempts = 100;

  const avoidPairings = [
    [
      'e6a3ba24-26f9-4c5e-a061-a2d64b92ab99',
      'a4a9c829-a358-4857-8b27-051b471f305b',
    ], // jon, constance
    [
      '21220d21-212d-4e9e-b0a4-8719b2c88577',
      '24ed56c8-cd83-4147-a167-9e0941a328d3',
    ], // ethan, imogene
    [
      '8d571f97-d8b2-42c5-b379-e7f6790fe72a',
      '8075b8b9-a3be-4565-9b21-2610414a0c2e',
    ], // james, mathilda
    [
      '1b35649c-5657-4ab6-8778-21f41bde64b2',
      '42e90692-19ef-476d-b84f-9c5e63ea4e2c',
    ], // liam, paiper
    [
      '77489aa8-5444-4f61-8990-1ec1ced81c1c',
      '16554dbd-97f6-4717-9d9c-ae053f3bb932',
    ], // tania, jason1
    [
      '263fdb2c-2015-4a77-94e1-c2a0b43a4188',
      '7636e0ea-dab3-4ef0-8036-560707493b74',
    ], // nathalie, tim
  ];

  while (attempts < maxAttempts) {
    assignments = [];
    const availableRecipients = [...participants];

    for (const giver of participants) {
      const validRecipients = availableRecipients.filter(
        (recipient) =>
          recipient.id !== giver.id &&
          !avoidPairings.some(
            ([id1, id2]) =>
              (giver.userId === id1 && recipient.userId === id2) ||
              (giver.userId === id2 && recipient.userId === id1),
          ),
      );

      if (validRecipients.length === 0) {
        assignments = [];
        break;
      }

      const recipientIndex = Math.floor(Math.random() * validRecipients.length);
      const recipient = validRecipients[recipientIndex];
      if (!recipient) {
        throw new Error('No valid recipient found');
      }

      assignments.push({
        participantId: giver.id,
        assignedToUserId: recipient.userId,
      });
      availableRecipients.splice(
        availableRecipients.findIndex((r) => r.id === recipient.id),
        1,
      );
    }

    if (assignments.length === participants.length) {
      break;
    }

    attempts++;
  }

  if (assignments.length !== participants.length) {
    throw new Error(
      'Unable to generate valid assignments. Please check avoid pairings and try again.',
    );
  }

  try {
    await prisma.$transaction(
      assignments.map((assignment) =>
        prisma.secretSantaParticipant.update({
          where: { id: assignment.participantId },
          data: { assignedToId: assignment.assignedToUserId },
        }),
      ),
    );
  } catch (error) {
    console.error('Transaction error:', error);
    throw error;
  }

  const updatedEvent = await prisma.secretSantaEvent.findUnique({
    where: { id: eventId },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  revalidateTag('secretSanta');
  revalidateTag('users');
  return updatedEvent;
}

export async function joinSecretSanta(eventId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'You must be logged in to join a Secret Santa event.' };
  }

  try {
    const event = await prisma.secretSantaEvent.findUnique({
      where: { id: eventId },
      include: { participants: true },
    });

    if (!event) {
      return { error: 'Secret Santa event not found.' };
    }

    const alreadyParticipating = event.participants.some(
      (p) => p.userId === session.user.id,
    );

    if (alreadyParticipating) {
      return { error: 'You are already participating in this event.' };
    }

    await prisma.secretSantaParticipant.create({
      data: {
        userId: session.user.id,
        eventId: eventId,
      },
    });

    revalidateTag('secretSanta');
    revalidateTag('users');
    return { success: 'You have successfully joined the Secret Santa event!' };
  } catch (error) {
    console.error('Error joining Secret Santa event:', error);
    return {
      error: 'Failed to join the Secret Santa event. Please try again.',
    };
  }
}
