import { useCompany } from "./useCompany";
import { getSectorConfig, hasSectorFeature, featureMap, type SectorKey } from "@/config/sectorPresets";

export function useFeatureFlags() {
  const { data: company } = useCompany();
  const sector = company?.sector as SectorKey | null;

  const hasFeature = (feature: keyof typeof featureMap) => {
    return hasSectorFeature(sector, feature);
  };

  const getSectorFeatures = () => {
    const config = getSectorConfig(sector);
    return config?.features || [];
  };

  const getSectorNavigation = () => {
    const config = getSectorConfig(sector);
    return config?.nav || [];
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