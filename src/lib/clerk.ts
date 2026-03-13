import { Roles } from '@/@types/clerk';
import { auth, currentUser } from '@clerk/nextjs/server';

export const checkRole = async (role: Roles) => {
  const { sessionClaims, userId } = await auth();

  if (!userId) {
    return false;
  }

  if (sessionClaims?.metadata?.role === role) {
    return true;
  }

  const user = await currentUser();

  return user?.publicMetadata?.role === role;
};
