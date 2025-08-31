import { DashboardLayout } from "@/components/layout/DashboardLayout";

const Reports = () => {
  return (
    <DashboardLayout title="Relatórios">
      <div className="space-y-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-muted-foreground">
            Página de Relatórios
          </h2>
          <p className="text-muted-foreground mt-2">
            Relatórios e análises serão implementados aqui
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;