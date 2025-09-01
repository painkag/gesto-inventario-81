import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { InventoryTabs } from "@/components/inventory/InventoryTabs";

const Inventory = () => {
  return (
    <DashboardLayout title="Estoque">
      <InventoryTabs />
    </DashboardLayout>
  );
};

export default Inventory;