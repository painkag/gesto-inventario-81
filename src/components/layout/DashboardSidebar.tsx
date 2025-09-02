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
  Cake,
  Wine,
  UtensilsCrossed,
  Layers,
  Users,
  ClipboardList
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
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/hooks/usePermissions";
import { useCompany } from "@/hooks/useCompany";
import { deriveFeatures, deriveNav, hasFeature } from "@/config/sectorUtils";

export function DashboardSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { canAccessSettings } = usePermissions();
  const { data: company } = useCompany();
  const [isManagementOpen, setIsManagementOpen] = useState(true);
  const [isReportsOpen, setIsReportsOpen] = useState(true);

  const isCollapsed = state === "collapsed";
  const isActive = (path: string) => location.pathname === path;
  
  const getNavCls = (path: string) =>
    isActive(path) 
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground";

  // Dynamic sector-based navigation
  const sector = (company?.sector ?? "mercadinho") as any;
  const features = deriveFeatures(sector, company?.sector_features || []);
  const nav = deriveNav(sector);

  // Route mapping for navigation items
  const routeMap: Record<string, string> = {
    "Dashboard": "/dashboard",
    "PDV": "/dashboard/pdv",
    "Produção do Dia": "/dashboard/production",
    "Estoque": "/dashboard/inventory",
    "Compras": "/dashboard/purchases",
    "Compras (XML)": "/dashboard/purchases/xml",
    "Promoções": "/dashboard/promotions",
    "Relatórios": "/dashboard/reports",
    "Comandas": "/dashboard/bartabs",
    "Clube": "/dashboard/club",
    "Configurações": "/dashboard/settings",
    "Plano & Pagamentos": "/dashboard/plano",
  };

  // Icon mapping for navigation items
  const iconMap: Record<string, any> = {
    "Dashboard": Home,
    "PDV": ShoppingCart,
    "Produção do Dia": UtensilsCrossed,
    "Estoque": Archive,
    "Compras": Truck,
    "Compras (XML)": FileText,
    "Promoções": BarChart3,
    "Comandas": Wine,
    "Clube": Users,
    "Relatórios": BarChart3,
    "Configurações": Settings,
    "Plano & Pagamentos": CreditCard
  };

  // Generate navigation items from sector configuration
  const getNavItems = () => {
    return nav.map(navItem => ({
      title: navItem,
      url: routeMap[navItem] || "/dashboard",
      icon: iconMap[navItem] || Home
    }));
  };

  const navItems = getNavItems();
  
  // Group navigation items
  const mainItems = navItems.filter(item => ["Dashboard", "PDV"].includes(item.title));
  const managementItems = navItems.filter(item => 
    ["Estoque", "Compras", "Compras (XML)", "Produção do Dia", "Promoções", "Comandas", "Clube"].includes(item.title)
  );
  const reportItems = navItems.filter(item => ["Relatórios"].includes(item.title));
  const settingsItems = navItems.filter(item => 
    ["Configurações", "Plano & Pagamentos"].includes(item.title)
  );

  const getSectorBadge = () => {
    if (!company?.sector || isCollapsed) return null;
    
    const sectorConfig = {
      padaria: { label: "Padaria", icon: Cake, className: "bg-orange-100 text-orange-800 border-orange-200" },
      mercadinho: { label: "Mercado", icon: ShoppingCart, className: "bg-blue-100 text-blue-800 border-blue-200" },
      adega: { label: "Adega/Bar", icon: Wine, className: "bg-purple-100 text-purple-800 border-purple-200" }
    };
    
    const config = sectorConfig[company.sector as keyof typeof sectorConfig];
    if (!config) return null;
    
    const SectorIcon = config.icon;
    
    return (
      <div className="px-3 mb-3">
        <Badge variant="outline" className={cn("w-full justify-start gap-2", config.className)}>
          <SectorIcon className="h-3 w-3" />
          <span className="text-xs font-medium">{config.label}</span>
        </Badge>
      </div>
    );
  };

  return (
    <Sidebar className={cn("border-r border-sidebar-border", isCollapsed ? "w-14" : "w-64")}>
      <SidebarContent className="bg-sidebar">
        {/* Sector Badge */}
        {getSectorBadge()}

        {/* Navigation Principal */}
        {mainItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/70">
              {!isCollapsed && "Início"}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainItems.map((item) => (
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
        )}

        {/* Gestão */}
        {managementItems.length > 0 && (
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
        )}

        {/* Relatórios */}
        {reportItems.length > 0 && (
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
        )}

        {/* Settings */}
        {canAccessSettings && settingsItems.length > 0 && (
          <SidebarGroup className="mt-auto">
            <SidebarGroupContent>
              <SidebarMenu>
                {settingsItems.map((item) => (
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
        )}
      </SidebarContent>
    </Sidebar>
  );
}