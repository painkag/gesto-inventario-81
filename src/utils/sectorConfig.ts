export const getSectorMenuItems = (sector: string | null, sectorFeatures: string[] | null) => {
  // Base items that appear for all sectors
  const baseItems = [
    {
      title: "Produtos",
      url: "/dashboard/products",
      icon: "Package",
      group: "management"
    },
    {
      title: "Estoque", 
      url: "/dashboard/inventory",
      icon: "Archive",
      group: "management"
    },
    {
      title: "Vendas",
      url: "/dashboard/sales",
      icon: "ShoppingCart", 
      group: "management"
    },
    {
      title: "PDV",
      url: "/dashboard/pdv",
      icon: "CreditCard", 
      group: "management"
    },
    {
      title: "Compras",
      url: "/dashboard/purchases", 
      icon: "Truck",
      group: "management"
    }
  ];

  const reportItems = [
    {
      title: "Relatórios",
      url: "/dashboard/reports",
      icon: "BarChart3",
      group: "reports"
    },
    {
      title: "Movimentações", 
      url: "/dashboard/movements",
      icon: "FileText",
      group: "reports"
    }
  ];

  // Sector-specific items
  const sectorSpecificItems: Record<string, any[]> = {
    mercadinho: [
      {
        title: "Promoções",
        url: "/dashboard/promotions",
        icon: "Tag",
        group: "management",
        feature: "promotions"
      },
      {
        title: "NF-e",
        url: "/dashboard/nfe",
        icon: "FileText",
        group: "management", 
        feature: "nfe_import"
      }
    ],
    padaria: [
      {
        title: "Receitas",
        url: "/dashboard/recipes",
        icon: "ChefHat",
        group: "management",
        feature: "bom_recipes"
      },
      {
        title: "Produção",
        url: "/dashboard/production", 
        icon: "Factory",
        group: "management",
        feature: "production"
      },
      {
        title: "Etiquetas",
        url: "/dashboard/labels",
        icon: "Tag",
        group: "management",
        feature: "labels"
      }
    ],
    adega: [
      {
        title: "Comandas",
        url: "/dashboard/tabs",
        icon: "Receipt",
        group: "management",
        feature: "digital_tabs"
      },
      {
        title: "Clube de Vinhos",
        url: "/dashboard/wine-club",
        icon: "Users",
        group: "management", 
        feature: "wine_club"
      },
      {
        title: "Degustações",
        url: "/dashboard/tastings",
        icon: "Wine",
        group: "management",
        feature: "tasting_notes"
      }
    ]
  };

  // Filter items based on sector features
  let allItems = [...baseItems, ...reportItems];
  
  if (sector && sectorSpecificItems[sector]) {
    const sectorItems = sectorSpecificItems[sector].filter(item => 
      !item.feature || (sectorFeatures && sectorFeatures.includes(item.feature))
    );
    
    // Insert sector-specific items after base management items
    const managementItems = allItems.filter(item => item.group === "management");
    const reportItems = allItems.filter(item => item.group === "reports");
    const lastManagementIndex = managementItems.length;
    
    if (sector && sectorSpecificItems[sector]) {
      const sectorItems = sectorSpecificItems[sector].filter(item => 
        !item.feature || (sectorFeatures && sectorFeatures.includes(item.feature))
      );
      
      // Combine all management items
      allItems = [...managementItems, ...sectorItems, ...reportItems];
    }
  }

  // Group items
  const groupedItems = {
    management: allItems.filter(item => item.group === "management"),
    reports: allItems.filter(item => item.group === "reports")
  };

  return groupedItems;
};