'use server';

import { prisma } from '@/lib/prisma';
import { auth, clerkClient } from '@clerk/nextjs/server';

type ClerkUserForSync = {
  primaryEmailAddressId: string | null;
  emailAddresses: Array<{ id: string; emailAddress: string }>;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string;
};

const getPrimaryEmail = (clerkUser: ClerkUserForSync) => {
  return (
    clerkUser.emailAddresses.find(
      (email) => email.id === clerkUser.primaryEmailAddressId,
    )?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress
  );
};

export const getUser = async () => {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) throw new Error('Unauthorized');

  let user = await prisma.user.findUnique({
    where: {
      clerkUserId: clerkUserId,
    },
  });

  if (!user) {
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(clerkUserId);
    const email = getPrimaryEmail(clerkUser);

    if (!email) throw new Error('User email not found');

    user = await prisma.user.upsert({
      where: {
        clerkUserId,
      },
      update: {
        email,
        firstName: clerkUser.firstName ?? email.split('@')[0],
        lastName: clerkUser.lastName,
        imageUrl: clerkUser.imageUrl,
      },
      create: {
        clerkUserId,
        email,
        firstName: clerkUser.firstName ?? email.split('@')[0],
        lastName: clerkUser.lastName,
        imageUrl: clerkUser.imageUrl,
      },
    });
  }

  if (!user) throw new Error('User not found');

  return {
    user,
    clerkUserId,
    userId: user.id,
  };
};
