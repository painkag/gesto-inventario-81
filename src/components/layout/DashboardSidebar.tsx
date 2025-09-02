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
  const { canAccessSettings } = usePermissions();
  const { data: company } = useCompany();
  const [isManagementOpen, setIsManagementOpen] = useState(true);
  const [isReportsOpen, setIsReportsOpen] = useState(true);
  const [isSectorOpen, setIsSectorOpen] = useState(true);

  const isCollapsed = state === "collapsed";
  const isActive = (path: string) => location.pathname === path;
  
  const getNavCls = (path: string) =>
    isActive(path) 
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground";

  // Sector-specific menu items
  const getSectorItems = () => {
    if (!company?.sector) return [];

    const sectorItems = {
      padaria: [
        { title: "Receitas", url: "/dashboard/recipes", icon: Cake },
        { title: "Produção", url: "/dashboard/production", icon: UtensilsCrossed },
        { title: "Etiquetas", url: "/dashboard/labels", icon: ClipboardList }
      ],
      mercadinho: [
        { title: "Import XML", url: "/dashboard/xml-import", icon: FileText },
        { title: "Promoções", url: "/dashboard/promotions", icon: BarChart3 }
      ],
      adega: [
        { title: "Comandas", url: "/dashboard/commands", icon: Wine },
        { title: "Mesas", url: "/dashboard/tables", icon: Layers },
        { title: "Clube Fidelidade", url: "/dashboard/loyalty", icon: Users }
      ]
    };

    return sectorItems[company.sector as keyof typeof sectorItems] || [];
  };

  const getSectorLabel = () => {
    const sectorLabels = {
      padaria: "Padaria",
      mercadinho: "Mercado", 
      adega: "Adega/Bar"
    };
    return company?.sector ? sectorLabels[company.sector as keyof typeof sectorLabels] : null;
  };

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

  const sectorItems = getSectorItems();
  const sectorLabel = getSectorLabel();

  return (
    <Sidebar className={cn("border-r border-sidebar-border", isCollapsed ? "w-14" : "w-64")}>
      <SidebarContent className="bg-sidebar">
        {/* Sector Badge */}
        {getSectorBadge()}

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

        {/* Sector-Specific Features */}
        {sectorItems.length > 0 && (
          <SidebarGroup>
            <Collapsible open={isSectorOpen} onOpenChange={setIsSectorOpen}>
              <CollapsibleTrigger asChild>
                <SidebarGroupLabel className="flex items-center justify-between cursor-pointer text-sidebar-foreground/70 hover:text-sidebar-foreground">
                  {!isCollapsed && sectorLabel}
                  {!isCollapsed && (
                    <ChevronDown className={cn(
                      "h-4 w-4 transition-transform",
                      isSectorOpen && "rotate-180"
                    )} />
                  )}
                </SidebarGroupLabel>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {sectorItems.map((item) => (
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
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/dashboard/plano" className={getNavCls("/dashboard/plano")}>
                      <CreditCard className="h-4 w-4" />
                      {!isCollapsed && <span>Planos</span>}
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