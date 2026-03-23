'use client';

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarLink,
  SidebarGroup,
  useSidebar,
} from '@automatize/ui/web';
import {
  LayoutDashboard,
  FileText,
  Package,
  Users,
  Settings,
  LogOut,
} from 'lucide-react';

function Logo() {
  const { open, isMobile } = useSidebar();
  const isExpanded = open || isMobile;

  return (
    <div className="flex items-center gap-2 overflow-hidden">
      <div className="flex-shrink-0 size-8 rounded-lg bg-primary" />
      {isExpanded && (
        <span className="font-semibold text-sm whitespace-nowrap">
          Automatize
        </span>
      )}
    </div>
  );
}

export default function Navigation() {
  return (
    <Sidebar>
      <SidebarHeader className="flex items-center justify-between">
        <Logo />
        <SidebarTrigger />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup label="Menu">
          <SidebarLink
            icon={<LayoutDashboard className="size-5" />}
            label="Dashboard"
            href="/dashboard"
            active
          />
          <SidebarLink
            icon={<FileText className="size-5" />}
            label="Invoices"
            href="/invoices"
          />
          <SidebarLink
            icon={<Package className="size-5" />}
            label="Products"
            href="/products"
          />
          <SidebarLink
            icon={<Users className="size-5" />}
            label="Clients"
            href="/clients"
          />
        </SidebarGroup>

        <SidebarGroup label="System" className="mt-4">
          <SidebarLink
            icon={<Settings className="size-5" />}
            label="Settings"
            href="/settings"
          />
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarLink
          icon={
            <div className="size-5 rounded-full bg-sidebar-accent flex-shrink-0" />
          }
          label="John Doe"
          href="/profile"
        />
        <SidebarLink
          icon={<LogOut className="size-5" />}
          label="Logout"
          onClick={() => {}}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
