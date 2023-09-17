import { prisma } from '../lib/prisma';

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

  const alice = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      email: 'alice@example.com',
      name: 'Alice',
      gifts: {
        create: {
          name: 'Red Mittens',
          url: 'https://www.example.com/mittens',
          published: true,
        },
      },
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

  console.log({ alice, bob, carol });
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
