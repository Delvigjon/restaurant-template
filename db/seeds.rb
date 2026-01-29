puts "🧹 Nettoyage des plats..."
Dish.destroy_all

puts "🍽️ Création des plats..."

Dish.create!([

  # ================== ENTRÉES
  {
    name: "Velouté de butternut",
    description: "Crème légère, noisette torréfiée, huile d’herbes",
    price: 9.00,
    category: "Entrée"
  },
  {
    name: "Œuf parfait",
    description: "Champignons, espuma parmesan, crumble",
    price: 11.00,
    category: "Entrée"
  },
  {
    name: "Tartare de saumon",
    description: "Citron, aneth, pickles d’oignon rouge",
    price: 13.00,
    category: "Entrée"
  },

  # ================== PLATS
  {
    name: "Volaille fermière",
    description: "Jus réduit, purée maison, légumes de saison",
    price: 19.00,
    category: "Plat"
  },
  {
    name: "Filet de bar",
    description: "Sauce vierge, riz basmati, herbes fraîches",
    price: 22.00,
    category: "Plat"
  },
  {
    name: "Risotto aux champignons",
    description: "Parmesan affiné, champignons sauvages",
    price: 18.00,
    category: "Plat"
  },

  # ================== DESSERTS
  {
    name: "Crème brûlée",
    description: "Vanille bourbon, caramel fin",
    price: 8.00,
    category: "Dessert"
  },
  {
    name: "Tarte tatin",
    description: "Pommes confites, crème crue",
    price: 9.00,
    category: "Dessert"
  },
  {
    name: "Assiette de fromages",
    description: "Sélection du moment",
    price: 11.00,
    category: "Dessert"
  },

  # ================== COCKTAILS (AJOUT IMPORTANT)
  {
    name: "Spritz maison",
    description: "Apéritif italien, orange fraîche",
    price: 9.00,
    category: "Cocktail"
  },
  {
    name: "Negroni",
    description: "Gin, vermouth rouge, Campari",
    price: 10.00,
    category: "Cocktail"
  },
  {
    name: "Mocktail fruits rouges",
    description: "Sans alcool, fruits frais et tonic",
    price: 7.00,
    category: "Cocktail"
  },

  # ================== BOISSONS
  {
    name: "Verre de vin (12cl)",
    description: "Blanc / rouge / rosé — sélection de la semaine",
    price: 6.00,
    category: "Boisson"
  },
  {
    name: "Bière artisanale",
    description: "Pression ou bouteille selon arrivage",
    price: 7.00,
    category: "Boisson"
  },
  {
    name: "Eau plate / gazeuse",
    description: "75cl",
    price: 5.00,
    category: "Boisson"
  }

])

puts "✅ Seeds terminés !"
