import { DashboardLayout } from "@/components/layout/DashboardLayout";

const Products = () => {
  return (
    <DashboardLayout title="Produtos">
      <div className="space-y-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-muted-foreground">
            Página de Produtos
          </h2>
          <p className="text-muted-foreground mt-2">
            Gerenciamento de produtos será implementado aqui
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Products;