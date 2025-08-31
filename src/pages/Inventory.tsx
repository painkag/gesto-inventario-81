import { DashboardLayout } from "@/components/layout/DashboardLayout";

const Inventory = () => {
  return (
    <DashboardLayout title="Estoque">
      <div className="space-y-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-muted-foreground">
            Página de Estoque
          </h2>
          <p className="text-muted-foreground mt-2">
            Controle de estoque será implementado aqui
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Inventory;