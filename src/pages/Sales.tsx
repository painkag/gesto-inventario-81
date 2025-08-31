import { DashboardLayout } from "@/components/layout/DashboardLayout";

const Sales = () => {
  return (
    <DashboardLayout title="Vendas">
      <div className="space-y-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-muted-foreground">
            Página de Vendas
          </h2>
          <p className="text-muted-foreground mt-2">
            Sistema de vendas será implementado aqui
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Sales;