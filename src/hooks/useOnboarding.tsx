import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "./useCompany";
import { sectorPresets, type SectorKey } from "@/config/sectorPresets";

type SectorType = SectorKey;

export function useOnboarding() {
  const queryClient = useQueryClient();
  const { data: company } = useCompany();

  const updateSector = useMutation({
    mutationFn: async (sector: SectorType) => {
      if (!company?.id) {
        throw new Error("Empresa não encontrada");
      }

      // Features do setor selecionado (convertidas para array)
      const sectorFeatures = [...sectorPresets[sector].features];

      const { error } = await supabase
        .from('companies')
        .update({
          sector,
          sector_features: sectorFeatures
        })
        .eq('id', company.id);

      if (error) {
        throw error;
      }

      return { sector, features: sectorFeatures };
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