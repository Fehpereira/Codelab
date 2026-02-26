'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export const getUser = async () => {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) throw new Error('Unauthorized');

  const user = await prisma.user.findUnique({
    where: {
      clerkUserId: clerkUserId,
    },
  });

  if (!user) throw new Error('User not found');

  return {
    user,
    clerkUserId,
    userId: user.id,
  };
};
