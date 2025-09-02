import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { XmlImportComponent } from "@/components/purchases/XmlImportComponent";

const XmlImport = () => {
  return (
    <DashboardLayout title="Importação XML">
      <XmlImportComponent />
    </DashboardLayout>
  );
};

export default XmlImport;