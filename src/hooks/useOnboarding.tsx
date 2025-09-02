import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "./useCompany";

type SectorType = 'padaria' | 'mercadinho' | 'adega';

export function useOnboarding() {
  const queryClient = useQueryClient();
  const { data: company } = useCompany();

  const updateSector = useMutation({
    mutationFn: async (sector: SectorType) => {
      if (!company?.id) {
        throw new Error("Empresa não encontrada");
      }

      // Features padrão por setor
      const sectorFeatures = {
        padaria: ['weight_control', 'recipes', 'production', 'custom_labels'],
        mercadinho: ['xml_import', 'promotions', 'barcode', 'multiple_units'],
        adega: ['commands', 'loyalty_club', 'batch_control', 'table_sales']
      };

      const { error } = await supabase
        .from('companies')
        .update({
          sector,
          sector_features: sectorFeatures[sector]
        })
        .eq('id', company.id);

      if (error) {
        throw error;
      }

      return { sector, features: sectorFeatures[sector] };
    },
    onSuccess: () => {
      // Invalidar cache da company para refletir as mudanças
      queryClient.invalidateQueries({ queryKey: ['company'] });
    },
  });

  return {
    updateSector: updateSector.mutateAsync,
    isUpdating: updateSector.isPending,
    error: updateSector.error
  };
}