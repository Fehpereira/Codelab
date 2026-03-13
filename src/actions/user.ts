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

type FilledUser = {
  user: NonNullable<Awaited<ReturnType<typeof prisma.user.findUnique>>>;
  clerkUserId: string;
  userId: string;
};

type EmptyUser = {
  user: null;
  clerkUserId: null;
  userId: null;
};

const getPrimaryEmail = (clerkUser: ClerkUserForSync) => {
  return (
    clerkUser.emailAddresses.find(
      (email) => email.id === clerkUser.primaryEmailAddressId,
    )?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress
  );
};

export async function getUser(throwError?: true): Promise<FilledUser>;
export async function getUser(
  throwError: false,
): Promise<FilledUser | EmptyUser>;
export async function getUser(
  throwError = true,
): Promise<FilledUser | EmptyUser> {
  const { userId: clerkUserId } = await auth();

  const emptyUser: EmptyUser = { user: null, clerkUserId: null, userId: null };

  if (!clerkUserId) {
    if (!throwError) return emptyUser;
    throw new Error('Unauthorized');
  }

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

  if (!user) {
    if (!throwError) return emptyUser;

    throw new Error('User not found');
  }

  return {
    user,
    clerkUserId,
    userId: user.id,
  };
}
