import { Link, Outlet, useLocation } from "react-router-dom";
import { useCompany } from "@/hooks/useCompany";

interface DashboardLayoutProps {
  children?: React.ReactNode;
  title?: string;
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const { company, sector_features } = useCompany();
  const loc = useLocation();
  const items = [
    { label: "Dashboard", to: "/dashboard" },
    { label: "PDV", to: "/sales" },
    { label: "Estoque", to: "/inventory" }
  ];
  return (
    <div className="min-h-screen flex bg-white">
      <aside className="w-64 border-r p-4">
        <div className="font-semibold mb-4">{company?.name || "Minha Empresa"}</div>
        <nav className="space-y-2">
          {items.map(i => (
            <Link key={i.to} to={i.to} className={`block rounded px-3 py-2 ${loc.pathname===i.to ? "bg-black text-white" : "hover:bg-gray-100"}`}>
              {i.label}
            </Link>
          ))}
        </nav>
        <div className="mt-6 text-xs text-gray-500">Features: {sector_features?.join(", ")}</div>
      </aside>
      <main className="flex-1 p-6">
        {children || <Outlet />}
      </main>
    </div>
  );
}