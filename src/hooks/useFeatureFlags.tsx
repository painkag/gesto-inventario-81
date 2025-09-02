import { useCompany } from "./useCompany";
import { getSectorConfig, hasSectorFeature, deriveNav, deriveFeatures } from "@/config/sectorUtils";
import { featureMap, type SectorKey } from "@/config/sectors";

export function useFeatureFlags() {
  const { data: company } = useCompany();
  const sector = company?.sector as SectorKey | null;

  const hasFeature = (feature: keyof typeof featureMap) => {
    return hasSectorFeature(sector, feature);
  };

  const getSectorFeatures = () => {
    if (!sector) return [];
    return deriveFeatures(sector, company?.sector_features as string[]);
  };

  const getSectorNavigation = () => {
    if (!sector) return [];
    return deriveNav(sector);
  };

  const getFeatureConfig = (feature: keyof typeof featureMap) => {
    return featureMap[feature];
  };

  return {
    hasFeature,
    getSectorFeatures,
    getSectorNavigation,
    getFeatureConfig,
    sector,
    isLoaded: !!company
  };
}