export const sectorPresets = {
  padaria: {
    features: ["sellByKg","recipes","productionOrders","labels","expiryShort"],
    nav: ["Dashboard","PDV","Produção do Dia","Estoque","Compras","Relatórios","Configurações","Plano & Pagamentos"]
  },
  mercadinho: {
    features: ["fefo","eanScanner","nfePurchaseXml","promotions","lossesByExpiry"],
    nav: ["Dashboard","PDV","Estoque","Compras (XML)","Promoções","Relatórios","Configurações","Plano & Pagamentos"]
  },
  adega: {
    features: ["kits","clubSubscription","barTabs","tastingNotes","fefoCerveja"],
    nav: ["Dashboard","PDV","Comandas","Clube","Estoque","Relatórios","Configurações","Plano & Pagamentos"]
  }
} as const;

export type SectorKey = keyof typeof sectorPresets;

// Mapeamento de features para funcionalidades
export const featureMap = {
  // Padaria
  sellByKg: {
    name: "Venda por KG",
    description: "Controle de peso e vendas fracionadas",
    component: "WeightControl"
  },
  recipes: {
    name: "Receitas",
    description: "Gestão de receitas e ingredientes",
    component: "RecipeManager"
  },
  productionOrders: {
    name: "Ordens de Produção",
    description: "Planejamento da produção diária",
    component: "ProductionOrders"
  },
  labels: {
    name: "Etiquetas Personalizadas",
    description: "Impressão de etiquetas customizadas",
    component: "CustomLabels"
  },
  expiryShort: {
    name: "Validade Curta",
    description: "Alertas para produtos de padaria",
    component: "ExpiryAlerts"
  },
  
  // Mercadinho
  fefo: {
    name: "FEFO (First Expired, First Out)",
    description: "Controle automático de validade",
    component: "FEFOControl"
  },
  eanScanner: {
    name: "Scanner EAN",
    description: "Leitura de códigos de barras",
    component: "BarcodeScanner"
  },
  nfePurchaseXml: {
    name: "Importação XML NFe",
    description: "Importar compras via XML da nota",
    component: "XMLImporter"
  },
  promotions: {
    name: "Promoções",
    description: "Gestão de ofertas e descontos",
    component: "PromotionManager"
  },
  lossesByExpiry: {
    name: "Perdas por Vencimento",
    description: "Relatório de perdas por validade",
    component: "ExpiryLossReport"
  },
  
  // Adega
  kits: {
    name: "Kits de Produtos",
    description: "Venda de conjuntos de bebidas",
    component: "ProductKits"
  },
  clubSubscription: {
    name: "Clube de Assinatura",
    description: "Gestão de membros e benefícios",
    component: "ClubManager"
  },
  barTabs: {
    name: "Comandas de Bar",
    description: "Controle de consumo por mesa",
    component: "BarTabs"
  },
  tastingNotes: {
    name: "Notas de Degustação",
    description: "Avaliações e descrições de vinhos",
    component: "TastingNotes"
  },
  fefoCerveja: {
    name: "FEFO para Cervejas",
    description: "Controle especial para bebidas",
    component: "BeverageFEFO"
  }
} as const;

// Mapeamento de navegação para rotas
export const navRouteMap = {
  "Dashboard": "/dashboard",
  "PDV": "/sales",
  "Produção do Dia": "/production",
  "Estoque": "/inventory",
  "Compras": "/purchases",
  "Compras (XML)": "/purchases/xml",
  "Promoções": "/promotions",
  "Comandas": "/bar-tabs",
  "Clube": "/club",
  "Relatórios": "/reports",
  "Configurações": "/settings",
  "Plano & Pagamentos": "/plans"
} as const;