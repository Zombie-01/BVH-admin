'use client';
import {
  Store,
  Users,
  BarChart3,
  Settings,
  Shield,
  Building2,
  Map,
  MessageSquare,
  Tags,
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';

const operationItems = [
  { title: 'Live газрын зураг', url: '/operation/live', icon: Map },
  { title: 'Чат түүх', url: '/operation/chats', icon: MessageSquare },
  { title: 'Дэлгүүрүүд', url: '/operation/stores', icon: Store },
  { title: 'Ажилчид', url: '/operation/workers', icon: Users },
  { title: 'Ангилал & Тэмдэг', url: '/operation/categories', icon: Tags },
  { title: 'Тайлан', url: '/operation/reports', icon: BarChart3 },
];

const adminItems = [
  { title: 'Хяналтын самбар', url: '/admin', icon: Building2 },
  { title: 'Хэрэглэгчид', url: '/admin/users', icon: Users },
  { title: 'Тохиргоо', url: '/admin/settings', icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const currentPath = usePathname();

  const isActive = (path: string) => currentPath === path || currentPath.startsWith(path + '/');

  return (
    <Sidebar className={collapsed ? 'w-14' : 'w-60'} collapsible="icon">
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <Shield className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && <span className="font-bold text-sidebar-foreground">Удирдлага</span>}
        </div>
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60">
            {!collapsed && 'Үйл ажиллагаа'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {operationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink
                      href={item.url}
                      className="flex items-center gap-3 hover:bg-sidebar-accent rounded-md px-3 py-2"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
                    >
                      <item.icon className="w-5 h-5 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60">
            {!collapsed && 'Админ'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink
                      href={item.url}
                      className="flex items-center gap-3 hover:bg-sidebar-accent rounded-md px-3 py-2"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
                    >
                      <item.icon className="w-5 h-5 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
