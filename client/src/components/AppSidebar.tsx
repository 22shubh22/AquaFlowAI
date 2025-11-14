import { Home, Map, AlertTriangle, Users, Settings, FileText, Clock, Droplets, TrendingUp, Shield } from "lucide-react";
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
} from "@/components/ui/sidebar";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";

export function AppSidebar() {
  const [location, setLocation] = useLocation();
  const { role } = useAuth();

  const adminItems = [
    {
      title: "Dashboard",
      url: "/",
      icon: Home,
    },
    {
      title: "Zones",
      url: "/zones",
      icon: Map,
    },
    {
      title: "Pump Schedule",
      url: "/schedule",
      icon: Clock,
    },
    {
      title: "Citizen Reports",
      url: "/reports",
      icon: FileText,
    },
    {
      title: "Citizen Users",
      url: "/citizen-users",
      icon: Users,
    },
    {
      title: "Water Sources",
      url: "/sources",
      icon: Droplets,
    },
  ];

  const citizenItems = [
    {
      title: "Report Issue",
      url: "/reports",
      icon: FileText,
    },
    {
      title: "Water Schedule",
      url: "/schedule",
      icon: Clock,
    },
  ];

  const items = role === "admin" ? adminItems : citizenItems;

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold">A</span>
          </div>
          <div>
            <h2 className="font-semibold text-sm">AquaFlow</h2>
            <p className="text-xs text-muted-foreground">Water Management</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <a href={item.url} data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {/* Optionally add a settings link for admins if not already included */}
        {role === "admin" && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="/blockchain">
                      <Shield />
                      <span>Blockchain Verification</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={location === "/settings"}>
                    <a href="/settings" data-testid="link-settings">
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={location === "/analytics"}>
                    <a href="/analytics" data-testid="link-analytics">
                      <TrendingUp className="h-4 w-4" />
                      <span>Analytics</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}