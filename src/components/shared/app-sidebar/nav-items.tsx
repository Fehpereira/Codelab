'use client';

import { Separator } from '@/components/ui/separator';
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useUser } from '@clerk/nextjs';
import {
  BookOpen,
  BookUp2,
  ChartArea,
  LucideIcon,
  MessageCircle,
  SquareDashedBottomCode,
  Trophy,
  Users,
} from 'lucide-react';
import Link from 'next/link';

type NavItem = {
  label: string;
  path: string;
  icon: LucideIcon;
};

export const NavItems = () => {
  const { user } = useUser();

  const isAdmin = user?.publicMetadata.role === 'admin';

  const navItems: NavItem[] = [
    {
      label: 'Cursos',
      path: '/',
      icon: SquareDashedBottomCode,
    },
    {
      label: 'Meus Cursos',
      path: '/my-courses',
      icon: BookUp2,
    },
    {
      label: 'Ranking',
      path: '/rankin',
      icon: Trophy,
    },
  ];

  const adminNavItems: NavItem[] = [
    {
      label: 'Estatísticas',
      path: '/admin',
      icon: ChartArea,
    },
    {
      label: 'Gerenciar Cursos',
      path: '/admin/courses',
      icon: BookOpen,
    },
    {
      label: 'Gerenciar Usuários',
      path: '/admin/users',
      icon: Users,
    },
    {
      label: 'Gerenciar Comentários',
      path: '/admin/comments',
      icon: MessageCircle,
    },
  ];

  const renderNavItems = (items: NavItem[]) => {
    return items.map((item) => (
      <SidebarMenuItem key={item.label}>
        <SidebarMenuButton asChild tooltip={item.label}>
          <Link href={item.path}>
            <item.icon className="text-primary group-data-[collapisble=icon]:text-white hover:text-primary transition-all" />
            <span>{item.label}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ));
  };

  return (
    <SidebarGroup>
      <SidebarMenu>
        {renderNavItems(navItems)}
        {isAdmin && (
          <>
            <Separator className="my-2" />
            {renderNavItems(adminNavItems)}
          </>
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
};
