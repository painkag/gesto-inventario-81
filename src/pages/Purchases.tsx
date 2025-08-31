import { DashboardLayout } from "@/components/layout/DashboardLayout";

const Purchases = () => {
  return (
    <DashboardLayout title="Compras">
      <div className="space-y-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-muted-foreground">
            Página de Compras
          </h2>
          <p className="text-muted-foreground mt-2">
            Sistema de compras será implementado aqui
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Purchases;