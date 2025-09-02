import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  ShoppingCart, 
  Package, 
  ShoppingBag, 
  BarChart3, 
  Settings, 
  CreditCard,
  Coffee,
  Users,
  Gift,
  FileX,
  ArrowUpDown
} from 'lucide-react';
import { useSectorFeatures } from '@/hooks/useSectorFeatures';
import { cn } from '@/lib/utils';

const navigationIcons: Record<string, any> = {
  'Dashboard': Home,
  'PDV': ShoppingCart,
  'Estoque': Package,
  'Compras': ShoppingBag,
  'Compras (XML)': FileX,
  'Relatórios': BarChart3,
  'Configurações': Settings,
  'Plano & Pagamentos': CreditCard,
  'Produção do Dia': Coffee,
  'Comandas': Users,
  'Clube': Gift,
  'Promoções': Gift,
  'Movimentos': ArrowUpDown,
};

const navigationRoutes: Record<string, string> = {
  'Dashboard': '/dashboard',
  'PDV': '/dashboard/pdv',
  'Estoque': '/dashboard/inventory',
  'Compras': '/dashboard/purchases',
  'Compras (XML)': '/dashboard/purchases/xml',
  'Relatórios': '/dashboard/reports',
  'Configurações': '/dashboard/settings',
  'Plano & Pagamentos': '/dashboard/plano',
  'Produção do Dia': '/dashboard/production',
  'Comandas': '/dashboard/tabs',
  'Clube': '/dashboard/club',
  'Promoções': '/dashboard/promotions',
  'Movimentos': '/dashboard/movements',
};

export function DynamicNavigation() {
  const { getNavigation } = useSectorFeatures();
  const location = useLocation();
  const navigation = getNavigation();

  if (navigation.length === 0) {
    // Fallback navigation if no sector is configured
    return (
      <nav className="space-y-1">
        <Link
          to="/dashboard"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
            location.pathname === '/dashboard'
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Home className="h-4 w-4" />
          Dashboard
        </Link>
      </nav>
    );
  }

  return (
    <nav className="space-y-1">
      {navigation.map((item) => {
        const IconComponent = navigationIcons[item] || Package;
        const route = navigationRoutes[item] || '/dashboard';
        const isActive = location.pathname === route;

        return (
          <Link
            key={item}
            to={route}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <IconComponent className="h-4 w-4" />
            {item}
          </Link>
        );
      })}
    </nav>
  );
}