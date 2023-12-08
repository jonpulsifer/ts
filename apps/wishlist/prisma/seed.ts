import { faker } from '@faker-js/faker';

import { prisma } from '../lib/prisma';

const createRandomGift = async (userId: string, wishlistId: string) => {
  console.log('creating gift for', userId, wishlistId);
  return prisma.gift.upsert({
    where: { id: faker.string.uuid() },
    update: {},
    create: {
      name: faker.commerce.productName(),
      description: `${faker.commerce.productName()} - ${faker.commerce.productDescription()}`,
      url: faker.internet.url(),
      owner: {
        connect: {
          id: userId,
        },
      },
      wishlists: {
        connect: {
          id: wishlistId,
        },
      },
    },
  });
};

async function drop() {
  return Promise.all([
    prisma.gift.deleteMany(),
    prisma.user.deleteMany(),
    prisma.wishlist.deleteMany(),
  ]);
}

async function main() {
  await drop();
  const christmasWishlist = await prisma.wishlist.upsert({
    where: { name: 'Christmas Wishlist' },
    update: {},
    create: {
      name: 'Christmas Wishlist',
      password: '1234',
    },
  });

  const birthdayWishlist = await prisma.wishlist.upsert({
    where: { name: 'Birthday Wishlist' },
    update: {},
    create: {
      name: 'Birthday Wishlist',
      password: '1234',
    },
  });

  const alice = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      email: 'alice@example.com',
      name: 'Alice',
      wishlists: {
        connect: christmasWishlist,
      },
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      email: 'bob@example.com',
      name: 'Bob',
      wishlists: {
        connect: christmasWishlist,
      },
    },
  });

  const carol = await prisma.user.upsert({
    where: { email: 'carol@example.com' },
    update: {},
    create: {
      email: 'carol@example.com',
      name: 'Carol',
    },
  });

  const dave = await prisma.user.upsert({
    where: { email: 'dave@example.com' },
    update: {},
    create: {
      email: 'dave@example.com',
      name: 'Dave',
      wishlists: { connect: christmasWishlist },
    },
  });

  const emily = await prisma.user.upsert({
    where: { email: 'emily@example.com' },
    update: {},
    create: {
      email: 'emily@example.com',
      name: 'Emily',
      wishlists: { connect: [christmasWishlist, birthdayWishlist] },
    },
  });

  await Promise.all([
    createRandomGift(alice.id, christmasWishlist.id),
    createRandomGift(alice.id, christmasWishlist.id),
    createRandomGift(alice.id, christmasWishlist.id),
    createRandomGift(alice.id, christmasWishlist.id),
    createRandomGift(alice.id, christmasWishlist.id),
    // bob
    createRandomGift(bob.id, christmasWishlist.id),
    createRandomGift(bob.id, christmasWishlist.id),
    createRandomGift(bob.id, christmasWishlist.id),
    createRandomGift(bob.id, christmasWishlist.id),
    // carol
    createRandomGift(carol.id, christmasWishlist.id),
    createRandomGift(carol.id, christmasWishlist.id),
    createRandomGift(carol.id, christmasWishlist.id),
    createRandomGift(carol.id, christmasWishlist.id),
    // dave
    createRandomGift(dave.id, christmasWishlist.id),
    createRandomGift(dave.id, christmasWishlist.id),
    // emily
    createRandomGift(emily.id, birthdayWishlist.id),
    createRandomGift(emily.id, birthdayWishlist.id),
    createRandomGift(emily.id, birthdayWishlist.id),
  ]);
  console.log({ alice, bob, carol, dave, emily });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
