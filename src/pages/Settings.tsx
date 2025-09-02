import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompanySettingsTab } from "@/components/settings/CompanySettingsTab";
import { NFeSettingsTab } from "@/components/settings/NFeSettingsTab";
import { IntegrationsSettingsTab } from "@/components/settings/IntegrationsSettingsTab";
import { LGPDSettingsTab } from "@/components/settings/LGPDSettingsTab";
import { Building2, FileText, Plug, Shield } from "lucide-react";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("company");

  return (
    <DashboardLayout title="Configurações">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie as configurações da sua empresa, integrações e preferências.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="company" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Empresa
            </TabsTrigger>
            <TabsTrigger value="nfe" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              NF-e
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Plug className="h-4 w-4" />
              Integrações
            </TabsTrigger>
            <TabsTrigger value="lgpd" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Privacidade
            </TabsTrigger>
          </TabsList>

          <TabsContent value="company" className="space-y-6">
            <CompanySettingsTab />
          </TabsContent>

          <TabsContent value="nfe" className="space-y-6">
            <NFeSettingsTab />
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            <IntegrationsSettingsTab />
          </TabsContent>

          <TabsContent value="lgpd" className="space-y-6">
            <LGPDSettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;