import { checkRole } from '@/lib/clerk';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/auth/sign-in?redirect_url=/admin');
  }

  const isAdmin = await checkRole('admin');

  if (!isAdmin) {
    redirect('/');
  }

  return children;
}
