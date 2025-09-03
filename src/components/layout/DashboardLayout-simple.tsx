import { ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {title && (
        <header className="border-b px-6 py-4 bg-white">
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        </header>
      )}
      
      <main className="p-6">
        {children}
      </main>
    </div>
  );
}