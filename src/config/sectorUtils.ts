import { sectorPresets, type SectorKey } from "./sectors";

export const hasFeature = (f: string, list: string[]) => list.includes(f);

export function deriveFeatures(sector: SectorKey, stored?: string[]): string[] {
  return stored?.length ? stored : [...sectorPresets[sector].features];
}

export function deriveNav(sector: SectorKey): string[] {
  return [...sectorPresets[sector].nav];
}

// Helper para obter configuração do setor
export function getSectorConfig(sector: SectorKey | null | undefined) {
  if (!sector || !(sector in sectorPresets)) {
    return null;
  }
  return sectorPresets[sector];
}

// Helper para verificar se uma feature está ativa
export function hasSectorFeature(sector: SectorKey | null | undefined, feature: string) {
  const config = getSectorConfig(sector);
  if (!config) return false;
  return hasFeature(feature, [...config.features]);
}