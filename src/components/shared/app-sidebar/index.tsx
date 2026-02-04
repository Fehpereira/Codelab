import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { ComponentProps } from 'react';

type AppSidebarProps = ComponentProps<typeof Sidebar>;

export const AppSidebar = ({ ...props }: AppSidebarProps) => {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="py-4">
        <Link href={'/'} />
        <p>LOGO</p>
      </SidebarHeader>
      <SidebarContent>{/* NAV ITEMS */}</SidebarContent>
      <SidebarFooter>{/* NAV USER */}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};
