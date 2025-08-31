import { DashboardLayout } from "@/components/layout/DashboardLayout";

const Settings = () => {
  return (
    <DashboardLayout title="Configurações">
      <div className="space-y-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-muted-foreground">
            Página de Configurações
          </h2>
          <p className="text-muted-foreground mt-2">
            Configurações do sistema serão implementadas aqui
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;