export const sectorPresets = {
  padaria: {
    features: ["sellByKg","recipes","productionOrders","labels","expiryShort"] as const,
    nav: ["Dashboard","PDV","Produção do Dia","Estoque","Compras","Relatórios","Configurações","Plano & Pagamentos"] as const
  },
  mercadinho: {
    features: ["fefo","eanScanner","nfePurchaseXml","promotions","lossesByExpiry"] as const,
    nav: ["Dashboard","PDV","Estoque","Compras (XML)","Promoções","Relatórios","Configurações","Plano & Pagamentos"] as const
  },
  adega: {
    features: ["kits","clubSubscription","barTabs","tastingNotes","fefoCerveja"] as const,
    nav: ["Dashboard","PDV","Comandas","Clube","Estoque","Relatórios","Configurações","Plano & Pagamentos"] as const
  }
} as const;

export type SectorKey = keyof typeof sectorPresets;

export const sectorDisplayNames: Record<SectorKey, string> = {
  padaria: "Mini Padaria",
  mercadinho: "Mercadinho", 
  adega: "Adega/Bar"
};

export const sectorDescriptions: Record<SectorKey, string> = {
  padaria: "Gestão de produção diária, vendas por peso, receitas e controle de validade curta",
  mercadinho: "Scanner de códigos, XML de compras, promoções e controle FEFO de estoque",
  adega: "Comandas, clube de vinhos, kits especiais e notas de degustação"
};

// Feature flags per sector
export type FeatureFlag = 
  | "sellByKg" | "recipes" | "productionOrders" | "labels" | "expiryShort"
  | "fefo" | "eanScanner" | "nfePurchaseXml" | "promotions" | "lossesByExpiry"
  | "kits" | "clubSubscription" | "barTabs" | "tastingNotes" | "fefoCerveja";

export function hasFeature(sector: SectorKey, feature: FeatureFlag): boolean {
  const sectorFeatures = sectorPresets[sector].features;
  return (sectorFeatures as readonly string[]).includes(feature);
}

export function getSectorNavigation(sector: SectorKey): readonly string[] {
  return sectorPresets[sector].nav;
}