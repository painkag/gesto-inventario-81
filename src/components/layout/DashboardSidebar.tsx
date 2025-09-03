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
  Home,
  CreditCard,
  Tag,
  ChefHat,
  Factory,
  LucideIcon
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/hooks/usePermissions";
import { useCompany } from "@/hooks/useCompany";
import { getSectorMenuItems } from "@/utils/sectorConfig";

// Icon mapping for string-based icons
const iconMap: Record<string, LucideIcon> = {
  Package,
  Archive,
  ShoppingCart,
  CreditCard,
  Truck,
  BarChart3,
  FileText,
  Tag,
  ChefHat,
  Factory,
  Home,
  Settings
};

const navigationItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
    isActive: true
  }
];

export function DashboardSidebar() {
  // Initialize sidebar state with proper error handling
  let sidebarState = "expanded";
  try {
    const sidebar = useSidebar();
    sidebarState = sidebar.state;
  } catch (error) {
    // Fallback if not in sidebar context
    sidebarState = "expanded";
  }

  let location;
  let canAccessSettings = false;
  let company = null;
  
  try {
    location = useLocation();
  } catch (error) {
    // Fallback if not in router context
    location = { pathname: '/dashboard' };
  }
  
  try {
    const permissions = usePermissions();
    canAccessSettings = permissions.canAccessSettings;
  } catch (error) {
    // Fallback if not in query context
    canAccessSettings = false;
  }
  
  try {
    const { data } = useCompany();
    company = data;
  } catch (error) {
    // Fallback if not in query context
    company = null;
  }
  
  const [isManagementOpen, setIsManagementOpen] = useState(true);
  const [isReportsOpen, setIsReportsOpen] = useState(true);

  // Get dynamic menu items based on sector
  const menuItems = getSectorMenuItems(company?.sector, company?.sector_features);

  const isCollapsed = sidebarState === "collapsed";
  const isActive = (path: string) => location?.pathname === path;
  
  const getNavCls = (path: string) =>
    cn(
      "flex items-center gap-2 px-2 py-1.5 text-sm rounded-md transition-colors w-full",
      isActive(path) 
        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
    );

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
                  <NavLink to={item.url} className={getNavCls(item.url)}>
                    <item.icon className="h-4 w-4" />
                    {!isCollapsed && <span>{item.title}</span>}
                  </NavLink>
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
                  {menuItems.management.map((item) => {
                    const IconComponent = typeof item.icon === 'string' ? iconMap[item.icon] : item.icon;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <NavLink to={item.url} className={getNavCls(item.url)}>
                          {IconComponent && <IconComponent className="h-4 w-4" />}
                          {!isCollapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuItem>
                    );
                  })}
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
                  {menuItems.reports.map((item) => {
                    const IconComponent = typeof item.icon === 'string' ? iconMap[item.icon] : item.icon;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <NavLink to={item.url} className={getNavCls(item.url)}>
                          {IconComponent && <IconComponent className="h-4 w-4" />}
                          {!isCollapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>

        {canAccessSettings && (
          <SidebarGroup className="mt-auto">
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <NavLink to="/dashboard/settings" className={getNavCls("/dashboard/settings")}>
                    <Settings className="h-4 w-4" />
                    {!isCollapsed && <span>Configurações</span>}
                  </NavLink>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <NavLink to="/dashboard/plano" className={getNavCls("/dashboard/plano")}>
                    <CreditCard className="h-4 w-4" />
                    {!isCollapsed && <span>Planos</span>}
                  </NavLink>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}