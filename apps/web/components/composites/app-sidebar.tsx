import {
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  Settings,
  Plus,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '../ui/sidebar';
import { Button } from '../ui/button';

interface AppSidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onCreateInvoice: () => void;
}

const navigation = [
  {
    title: 'Overview',
    items: [
      { title: 'Dashboard', icon: LayoutDashboard, page: 'dashboard' },
      { title: 'Invoices', icon: FileText, page: 'invoices' },
      { title: 'Clients', icon: Users, page: 'clients' },
      { title: 'Reports', icon: BarChart3, page: 'reports' },
    ],
  },
  {
    title: 'Settings',
    items: [{ title: 'Settings', icon: Settings, page: 'settings' }],
  },
];

export function AppSidebar({
  currentPage,
  onNavigate,
  onCreateInvoice,
}: AppSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <div className="bg-sidebar-primary p-2 rounded-lg" aria-hidden="true">
            <FileText className="size-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h2 className="text-sm">Invoice Manager</h2>
            <p className="text-xs text-sidebar-foreground/60">Pro Edition</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <div className="px-3 py-2">
          <Button onClick={onCreateInvoice} className="w-full gap-2" size="sm">
            <Plus className="size-4" aria-hidden="true" />
            New Invoice
          </Button>
        </div>

        {navigation.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.page}>
                    <SidebarMenuButton
                      onClick={() => onNavigate(item.page)}
                      isActive={currentPage === item.page}
                      tooltip={item.title}
                    >
                      <item.icon className="size-4" aria-hidden="true" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-full bg-sidebar-accent flex items-center justify-center">
            <span className="text-sm">U</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm truncate">User Account</p>
            <p className="text-xs text-sidebar-foreground/60 truncate">
              user@company.com
            </p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
