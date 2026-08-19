export type ArtType =
  | "espresso"
  | "cappuccino"
  | "latte"
  | "iced"
  | "mocktail"
  | "tea"
  | "shake"
  | "dessert"
  | "snack"
  | "combo"
  | "hero-espresso"
  | "hero-latte"
  | "hero-iced"
  | "hero-beans";

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  art: ArtType;
  badge?: string;
  image?: string;
};

export type Category = {
  id: string;
  num: string;
  name: string;
  tagline: string;
  products: Product[];
};

export type SizeOption = {
  id: string;
  label: string;
  delta: number;
};

export type CustomizationOption = {
  id: string;
  label: string;
  delta: number;
};

export type OrderType = "delivery" | "pickup";

export type LocationOption = {
  id: string;
  name: string;
  area: string;
};

// Service areas for delivery + pickup. Ordered from nearest to the shop.
export const LOCATIONS: LocationOption[] = [
  { id: "bole", name: "Bole", area: "Bole, near Edna Mall" },
  { id: "bole-medhanealem", name: "Bole Medhanealem", area: "Bole Medhanealem" },
  { id: "cmc", name: "CMC", area: "CMC Road" },
  { id: "megenagna", name: "Megenagna", area: "Megenagna" },
  { id: "gerji", name: "Gerji", area: "Gerji" },
  { id: "summit", name: "Summit", area: "Summit" },
  { id: "old-airport", name: "Old Airport", area: "Old Airport" },
  { id: "kazanchis", name: "Kazanchis", area: "Kazanchis" },
  { id: "sarbet", name: "Sarbet", area: "Sarbet" },
  { id: "22-mazoria", name: "22 Mazoria", area: "22 Mazoria" },
];

export const SIZE_OPTIONS: SizeOption[] = [
  { id: "Small", label: "Small", delta: 0 },
  { id: "Medium", label: "Medium", delta: 70 },
  { id: "Large", label: "Large", delta: 140 },
];

export const DEFAULT_SIZE = "Small";

export const CUSTOMIZATIONS: CustomizationOption[] = [
  { id: "Extra Shot", label: "Extra Shot", delta: 50 },
  { id: "Almond Milk", label: "Almond Milk", delta: 100 },
  { id: "Vanilla", label: "Vanilla", delta: 50 },
  { id: "Caramel", label: "Caramel", delta: 60 },
  { id: "Whipped Cream", label: "Whipped Cream", delta: 80 },
];

export const DELIVERY_FEE = 150;
export const FREE_DELIVERY_THRESHOLD = 1500;

export const categories: Category[] = [
  {
    id: "coffee",
    num: "01",
    name: "Coffee",
    tagline: "Slow-roasted, double-pulled and poured with intention.",
    products: [
      {
        id: "americano",
        name: "Americano",
        description: "Bold double shot over hot water. Clean, strong, honest.",
        price: 350,
        art: "espresso",
      },
      {
        id: "espresso",
        name: "Espresso",
        description: "A rich, concentrated shot crowned with golden crema.",
        price: 300,
        art: "espresso",
        badge: "Bestseller",
      },
      {
        id: "cafe-mocha",
        name: "Café Mocha",
        description: "Espresso, steamed milk and dark chocolate in balance.",
        price: 520,
        art: "latte",
        badge: "Popular",
      },
      {
        id: "flat-white",
        name: "Flat White",
        description: "Velvety microfoam poured over a double ristretto.",
        price: 480,
        art: "latte",
      },
    ],
  },
  {
    id: "cappuccino",
    num: "02",
    name: "Cappuccino",
    tagline: "Airy foam, silky milk and a strong heart of espresso.",
    products: [
      {
        id: "classic-cappuccino",
        name: "Classic Cappuccino",
        description: "Equal parts espresso, steamed milk and cloud-like foam.",
        price: 450,
        art: "cappuccino",
        badge: "Bestseller",
      },
      {
        id: "hazelnut-cappuccino",
        name: "Hazelnut Cappuccino",
        description: "Toasty hazelnut syrup folded into a classic capp.",
        price: 520,
        art: "cappuccino",
        badge: "New",
      },
      {
        id: "caramel-cappuccino",
        name: "Caramel Cappuccino",
        description: "Buttery caramel ribbons through foam and milk.",
        price: 520,
        art: "cappuccino",
      },
      {
        id: "irish-cappuccino",
        name: "Irish Cappuccino",
        description: "Whisky-kissed cream over a warm spiced espresso base.",
        price: 560,
        art: "cappuccino",
      },
    ],
  },
  {
    id: "latte",
    num: "03",
    name: "Latte",
    tagline: "Silky, gently sweet and endlessly customizable.",
    products: [
      {
        id: "classic-latte",
        name: "Classic Latte",
        description: "Espresso meets a generous pour of smooth steamed milk.",
        price: 450,
        art: "latte",
      },
      {
        id: "vanilla-latte",
        name: "Vanilla Latte",
        description: "Madagascar vanilla softened into silky steamed milk.",
        price: 500,
        art: "latte",
      },
      {
        id: "caramel-latte",
        name: "Caramel Latte",
        description: "Golden caramel syrup swirled through warm milk.",
        price: 520,
        art: "latte",
        badge: "Popular",
      },
      {
        id: "matcha-latte",
        name: "Matcha Latte",
        description: "Ceremonial-grade matcha whisked into creamy milk.",
        price: 580,
        art: "latte",
        badge: "New",
      },
    ],
  },
  {
    id: "iced-coffee",
    num: "04",
    name: "Iced Coffee",
    tagline: "Chilled, refreshing and brewed for the heat.",
    products: [
      {
        id: "iced-americano",
        name: "Iced Americano",
        description: "Double espresso over ice with a splash of water.",
        price: 380,
        art: "iced",
      },
      {
        id: "cold-brew",
        name: "Cold Brew",
        description: "Steeped 18 hours for a smooth, naturally sweet cup.",
        price: 480,
        art: "iced",
        badge: "Popular",
      },
      {
        id: "iced-caramel-latte",
        name: "Iced Caramel Latte",
        description: "Chilled milk, espresso and a ribbon of caramel.",
        price: 560,
        art: "iced",
        badge: "Bestseller",
      },
      {
        id: "iced-mocha",
        name: "Iced Mocha",
        description: "Espresso, chocolate and milk over crushed ice.",
        price: 550,
        art: "iced",
      },
    ],
  },
  {
    id: "mocktails",
    num: "05",
    name: "Mocktails",
    tagline: "Crafted coolers — zero alcohol, full flavour.",
    products: [
      {
        id: "strawberry-sunrise",
        name: "Strawberry Sunrise",
        description: "Fresh strawberries, citrus and a peachy glow.",
        price: 390,
        art: "mocktail",
        badge: "New",
      },
      {
        id: "blue-lagoon",
        name: "Blue Lagoon",
        description: "Citrus, soda and a striking sapphire swirl.",
        price: 370,
        art: "mocktail",
      },
      {
        id: "peach-iced-tea",
        name: "Peach Iced Tea",
        description: "Ruby peach tea poured tall over ice.",
        price: 350,
        art: "mocktail",
      },
      {
        id: "virgin-mojito",
        name: "Virgin Mojito",
        description: "Mint, lime and soda — shaken, not stirred.",
        price: 320,
        art: "mocktail",
      },
    ],
  },
  {
    id: "tea",
    num: "06",
    name: "Tea",
    tagline: "From treasured classics to calm green brews.",
    products: [
      {
        id: "kashmiri-chai",
        name: "Kashmiri Chai",
        description: "Rose-pink, nutty and delicately spiced.",
        price: 320,
        art: "tea",
        badge: "Bestseller",
      },
      {
        id: "doodh-patti",
        name: "Doodh Patti",
        description: "Strong milk tea brewed low and slow.",
        price: 250,
        art: "tea",
      },
      {
        id: "green-tea",
        name: "Green Tea",
        description: "Light, floral and quietly energizing.",
        price: 260,
        art: "tea",
      },
      {
        id: "masala-chai",
        name: "Masala Chai",
        description: "Ginger, cardamom and clove in every steep.",
        price: 280,
        art: "tea",
        badge: "Popular",
      },
    ],
  },
  {
    id: "shakes",
    num: "07",
    name: "Shakes",
    tagline: "Thick, frosty and dangerously drinkable.",
    products: [
      {
        id: "nutella-shake",
        name: "Nutella Shake",
        description: "Hazelnut chocolate blended thick with cream.",
        price: 590,
        art: "shake",
        badge: "Bestseller",
      },
      {
        id: "oreo-shake",
        name: "Oreo Shake",
        description: "Crushed cookies churned through vanilla ice cream.",
        price: 540,
        art: "shake",
        badge: "Popular",
      },
      {
        id: "salted-caramel-shake",
        name: "Salted Caramel Shake",
        description: "Sea salt, burnt sugar and cold cream.",
        price: 620,
        art: "shake",
        badge: "New",
      },
      {
        id: "strawberry-shake",
        name: "Strawberry Shake",
        description: "Ripe berries blended into pink perfection.",
        price: 490,
        art: "shake",
      },
    ],
  },
  {
    id: "desserts",
    num: "08",
    name: "Desserts",
    tagline: "Made fresh daily in small batches.",
    products: [
      {
        id: "chocolate-lava-cake",
        name: "Chocolate Lava Cake",
        description: "Molten centre under a soft, warm chocolate dome.",
        price: 480,
        art: "dessert",
        badge: "Bestseller",
      },
      {
        id: "tiramisu",
        name: "Tiramisu",
        description: "Espresso-soaked layers with mascarpone cream.",
        price: 520,
        art: "dessert",
        badge: "Popular",
      },
      {
        id: "blueberry-cheesecake",
        name: "Blueberry Cheesecake",
        description: "Silky baked cheesecake with a berry compote.",
        price: 560,
        art: "dessert",
      },
      {
        id: "belgian-waffle",
        name: "Belgian Waffle",
        description: "Crisp golden waffle, dusted sugar, berry finish.",
        price: 490,
        art: "dessert",
        badge: "New",
      },
    ],
  },
  {
    id: "snacks",
    num: "09",
    name: "Snacks",
    tagline: "Hot, savoury sides for the table in between."
    ,
    products: [
      {
        id: "chicken-sandwich",
        name: "Chicken Sandwich",
        description: "Grilled chicken, pesto and melted cheddar.",
        price: 480,
        art: "snack",
        badge: "Popular",
      },
      {
        id: "garlic-bread",
        name: "Garlic Bread",
        description: "Toasted sourdough, roasted garlic butter.",
        price: 350,
        art: "snack",
      },
      {
        id: "fries",
        name: "Truffle Fries",
        description: "Crispy fries tossed in truffle oil and parmesan.",
        price: 380,
        art: "snack",
      },
      {
        id: "chicken-quesadilla",
        name: "Chicken Quesadilla",
        description: "Spiced chicken, cheese and charred tortilla.",
        price: 520,
        art: "snack",
        badge: "New",
      },
    ],
  },
  {
    id: "combos",
    num: "10",
    name: "Combos",
    tagline: "Pairings made for the way you actually order.",
    products: [
      {
        id: "morning-ritual",
        name: "Morning Ritual",
        description: "Espresso, buttery croissant and a fresh orange juice.",
        price: 799,
        art: "combo",
        badge: "Save Br 250",
      },
      {
        id: "coffee-and-cake",
        name: "Coffee & Cake",
        description: "Any latte of your choice with a classic tiramisu slice.",
        price: 899,
        art: "combo",
        badge: "Popular",
      },
      {
        id: "date-night",
        name: "Date Night For Two",
        description: "Two drinks, one dessert and a bag of whole beans.",
        price: 1299,
        art: "combo",
        badge: "Save Br 400",
      },
      {
        id: "family-brunch",
        name: "Family Brunch",
        description: "Four drinks, two snacks and a waffle to share.",
        price: 1799,
        art: "combo",
        badge: "Save Br 600",
      },
    ],
  },
];

export type HeroSlide = {
  id: string;
  label: string;
  headline: string;
  description: string;
  art: ArtType;
  className: string;
};

export const heroSlides: HeroSlide[] = [
  {
    id: "slide-1",
    label: "✦ Crafted Fresh",
    headline: "Your Daily Ritual, Elevated.",
    description:
      "Small-batch roasts pulled to order and poured for you — in the heart of Bole.",
    art: "hero-espresso",
    className: "slide-gradient-1",
  },
  {
    id: "slide-2",
    label: "✦ Local Beans",
    headline: "From Roast to Ritual.",
    description:
      "Single-origin beans, roasted in-house every week for depth you can taste.",
    art: "hero-latte",
    className: "slide-gradient-2",
  },
  {
    id: "slide-3",
    label: "✦ Chilled & Ready",
    headline: "Cool Down, Lift Up.",
    description:
      "Slow-steeped cold brew and iced classics, made for Addis Ababa summers.",
    art: "hero-iced",
    className: "slide-gradient-3",
  },
  {
    id: "slide-4",
    label: "✦ Loved Locally",
    headline: "Rated 4.9 by 2,000+ Coffee Lovers.",
    description:
      "Join the ritual — order ahead, skip the queue and earn rewards.",
    art: "hero-beans",
    className: "slide-gradient-4",
  },
];