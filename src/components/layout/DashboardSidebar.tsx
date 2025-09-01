import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  Package, 
  BarChart3, 
  ShoppingCart, 
  Truck, 
  Archive,
  FileText,
  Settings,
  ChevronDown,
  Home
} from "lucide-react";
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
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/hooks/usePermissions";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
    isActive: true
  }
];

const managementItems = [
  {
    title: "Produtos",
    url: "/dashboard/products",
    icon: Package,
  },
  {
    title: "Estoque",
    url: "/dashboard/inventory", 
    icon: Archive,
  },
  {
    title: "Vendas",
    url: "/dashboard/sales",
    icon: ShoppingCart,
  },
  {
    title: "Compras", 
    url: "/dashboard/purchases",
    icon: Truck,
  }
];

const reportItems = [
  {
    title: "Relatórios",
    url: "/dashboard/reports",
    icon: BarChart3,
  },
  {
    title: "Movimentações",
    url: "/dashboard/movements",
    icon: FileText,
  }
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { canAccessSettings } = usePermissions(); // EM_EDIT: RBAC
  const [isManagementOpen, setIsManagementOpen] = useState(true);
  const [isReportsOpen, setIsReportsOpen] = useState(true);

  const isCollapsed = state === "collapsed";
  const isActive = (path: string) => location.pathname === path;
  
  const getNavCls = (path: string) =>
    isActive(path) 
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground";

  return (
    <Sidebar className={cn("border-r border-sidebar-border", isCollapsed ? "w-14" : "w-64")}>
      <SidebarContent className="bg-sidebar">
        {/* Navigation Principal */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70">
            {!isCollapsed && "Início"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls(item.url)}>
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Gestão */}
        <SidebarGroup>
          <Collapsible open={isManagementOpen} onOpenChange={setIsManagementOpen}>
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="flex items-center justify-between cursor-pointer text-sidebar-foreground/70 hover:text-sidebar-foreground">
                {!isCollapsed && "Gestão"}
                {!isCollapsed && (
                  <ChevronDown className={cn(
                    "h-4 w-4 transition-transform",
                    isManagementOpen && "rotate-180"
                  )} />
                )}
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {managementItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink to={item.url} className={getNavCls(item.url)}>
                          <item.icon className="h-4 w-4" />
                          {!isCollapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>

        {/* Relatórios */}
        <SidebarGroup>
          <Collapsible open={isReportsOpen} onOpenChange={setIsReportsOpen}>
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="flex items-center justify-between cursor-pointer text-sidebar-foreground/70 hover:text-sidebar-foreground">
                {!isCollapsed && "Relatórios"}
                {!isCollapsed && (
                  <ChevronDown className={cn(
                    "h-4 w-4 transition-transform",
                    isReportsOpen && "rotate-180"
                  )} />
                )}
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {reportItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink to={item.url} className={getNavCls(item.url)}>
                          <item.icon className="h-4 w-4" />
                          {!isCollapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>

        {/* Configurações - EM_EDIT: Só para OWNER */}
        {canAccessSettings && (
          <SidebarGroup className="mt-auto">
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/dashboard/settings" className={getNavCls("/dashboard/settings")}>
                      <Settings className="h-4 w-4" />
                      {!isCollapsed && <span>Configurações</span>}
                    </NavLink>
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