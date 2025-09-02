import { useCompany } from './useCompany';
import { hasFeature, getSectorNavigation, type SectorKey, type FeatureFlag } from '@/lib/sectors';

export function useSectorFeatures() {
  const { data: company } = useCompany();
  const sector = company?.sector as SectorKey | undefined;

  const checkFeature = (feature: FeatureFlag): boolean => {
    if (!sector) return false;
    return hasFeature(sector, feature);
  };

  const getNavigation = (): readonly string[] => {
    if (!sector) return [];
    return getSectorNavigation(sector);
  };

  const getSectorData = () => {
    return {
      sector,
      features: company?.sector_features || [],
      navigation: getNavigation(),
    };
  };

  return {
    sector,
    hasFeature: checkFeature,
    getNavigation,
    getSectorData,
    // Common feature checks
    canSellByWeight: checkFeature('sellByKg'),
    canUseBarcodeScanner: checkFeature('eanScanner'),
    canImportXML: checkFeature('nfePurchaseXml'),
    canUsePromotion: checkFeature('promotions'),
    canUseFEFO: checkFeature('fefo'),
    canUseRecipes: checkFeature('recipes'),
    canUseTabs: checkFeature('barTabs'),
    canUseClub: checkFeature('clubSubscription'),
  };
}