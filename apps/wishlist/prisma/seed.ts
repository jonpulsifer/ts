import { faker } from '@faker-js/faker';
import { User, Wishlist } from '@prisma/client';

import { prisma } from '../lib/prisma';

const createRandomGift = async (
  user: User,
  wishlist: Wishlist,
  recipient?: User,
) => {
  console.log('creating gift for', user, wishlist);
  const sender = recipient ? recipient : user;
  return prisma.gift.upsert({
    where: { id: faker.string.uuid() },
    update: {},
    create: {
      name: faker.commerce.productName(),
      description: `${faker.commerce.productName()} - ${faker.commerce.productDescription()}`,
      url: faker.internet.url(),
      owner: { connect: user },
      createdBy: { connect: sender },
      wishlists: { connect: wishlist },
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
      name: `Alice ${faker.person.fullName()}`,
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
      name: `Bob ${faker.person.fullName()}`,
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
      name: `Carol ${faker.person.fullName()}`,
    },
  });

  const dave = await prisma.user.upsert({
    where: { email: 'dave@example.com' },
    update: {},
    create: {
      email: 'dave@example.com',
      wishlists: { connect: christmasWishlist },
    },
  });

  const emily = await prisma.user.upsert({
    where: { email: 'emily@example.com' },
    update: {},
    create: {
      email: 'emily@example.com',
      name: `Emily ${faker.person.fullName()}`,
      wishlists: { connect: [christmasWishlist, birthdayWishlist] },
    },
  });

  const jonathan = await prisma.user.upsert({
    where: { email: 'jonathan@pulsifer.ca' },
    update: {},
    create: {
      email: 'jonathan@pulsifer.ca',
      name: 'Jonathan Seedifer',
      wishlists: { connect: [christmasWishlist] },
    },
  });

  await Promise.all([
    createRandomGift(alice, christmasWishlist),
    createRandomGift(alice, christmasWishlist),
    createRandomGift(alice, christmasWishlist),
    createRandomGift(alice, christmasWishlist),
    createRandomGift(alice, christmasWishlist),
    // bob
    createRandomGift(bob, christmasWishlist),
    createRandomGift(bob, christmasWishlist),
    createRandomGift(bob, christmasWishlist),
    createRandomGift(bob, christmasWishlist),
    // carol
    createRandomGift(carol, christmasWishlist),
    createRandomGift(carol, christmasWishlist),
    createRandomGift(carol, christmasWishlist),
    createRandomGift(carol, christmasWishlist),
    // dave
    createRandomGift(dave, christmasWishlist),
    createRandomGift(dave, christmasWishlist),
    // emily
    createRandomGift(emily, birthdayWishlist),
    createRandomGift(emily, birthdayWishlist),
    createRandomGift(emily, birthdayWishlist),
    // jonathan
    createRandomGift(jonathan, christmasWishlist),
    createRandomGift(jonathan, christmasWishlist),
    createRandomGift(jonathan, christmasWishlist),
    createRandomGift(jonathan, christmasWishlist),
    createRandomGift(alice, christmasWishlist, jonathan),
    createRandomGift(alice, christmasWishlist, jonathan),
    createRandomGift(bob, christmasWishlist, jonathan),
  ]);
  console.log({ alice, bob, carol, dave, emily, jonathan });
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
