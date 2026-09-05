import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ── Category Data ──────────────────────────────────────────────

const categories = [
  {
    name: "Draperii Catifea",
    slug: "draperii-catifea",
    description:
      "Draperii din catifea premium — materiale dense, catifelate, cu cădere impecabilă. Ideale pentru dormitoare și living-uri elegante, oferă izolație termică și fonică excelentă.",
    imageUrl:
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=2070&auto=format&fit=crop",
    sortOrder: 1,
  },
  {
    name: "Draperii Blackout",
    slug: "draperii-blackout",
    description:
      "Draperii cu proprietăți blackout — blochează complet lumina solară. Perfecte pentru dormitoare, camere home-cinema sau birouri unde aveți nevoie de întuneric total.",
    imageUrl:
      "https://images.unsplash.com/photo-1615874959474-d609969a20ed?q=80&w=2080&auto=format&fit=crop",
    sortOrder: 2,
  },
  {
    name: "Perdele Voal",
    slug: "perdele-voal",
    description:
      "Perdele din voal fin și transparent — filtrează lumina natural și oferă intimitate, păstrând luminozitatea camerei. Texturi delicate, ideale pentru orice cameră.",
    imageUrl:
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2069&auto=format&fit=crop",
    sortOrder: 3,
  },
  {
    name: "Perdele In",
    slug: "perdele-in",
    description:
      "Perdele din in natural și amestecuri de bumbac — texturi organice, aspect rustic-elegant. Perfecte pentru stilul scandinav, boho sau minimalist.",
    imageUrl:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=2070&auto=format&fit=crop",
    sortOrder: 4,
  },
  {
    name: "Accesorii",
    slug: "accesorii",
    description:
      "Accesorii pentru perdele și draperii — galerii, bare, cârlige, inele, și elemente decorative pentru montaj și finisare.",
    imageUrl:
      "https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=2080&auto=format&fit=crop",
    sortOrder: 5,
  },
];

// ── Product Data ───────────────────────────────────────────────

interface SeedProduct {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  pricePerUnit: number;
  originalPrice?: number;
  pricingUnit: string;
  minQuantity: number;
  fabricType?: string;
  opacity?: string;
  color: string;
  colorHex: string;
  pattern?: string;
  defaultHeightCm: number;
  minHeightCm: number;
  maxHeightCm: number;
  weightGsm?: number;
  composition?: string;
  inStock: boolean;
  isFeatured: boolean;
  isOnSale: boolean;
  sku: string;
  categorySlug: string;
  images: { url: string; alt: string }[];
}

const products: SeedProduct[] = [
  // ── Draperii Catifea (7 products) ───────────────────
  {
    name: "Draperie Catifea Royal Smarald",
    slug: "draperie-catifea-royal-smarald",
    shortDescription: "Catifea densă cu cădere perfectă, nuanță smarald intens",
    description:
      "Draperie din catifea premium în nuanța smarald profund. Material gros cu cădere impecabilă, ideal pentru living-uri elegante. Oferă izolație termică și fonică excelentă. Materialul are o textură catifelată la atingere și un luciu subtil care captează lumina.",
    pricePerUnit: 120,
    originalPrice: 150,
    pricingUnit: "ml",
    minQuantity: 0.5,
    fabricType: "catifea",
    opacity: "blackout",
    color: "Smarald",
    colorHex: "#2E8B57",
    pattern: "uni",
    defaultHeightCm: 280,
    minHeightCm: 200,
    maxHeightCm: 300,
    weightGsm: 350,
    composition: "100% poliester",
    inStock: true,
    isFeatured: true,
    isOnSale: true,
    sku: "DC-SMR-001",
    categorySlug: "draperii-catifea",
    images: [
      {
        url: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=2070&auto=format&fit=crop",
        alt: "Draperie catifea smarald în living elegant",
      },
      {
        url: "https://images.unsplash.com/photo-1631049552057-403cdb8f0658?q=80&w=2070&auto=format&fit=crop",
        alt: "Detaliu textură catifea smarald",
      },
    ],
  },
  {
    name: "Draperie Catifea Bordo Imperial",
    slug: "draperie-catifea-bordo-imperial",
    shortDescription: "Catifea premium bordo cu reflexii calde",
    description:
      "Draperie din catifea de lux în nuanța bordo intens. Material bogat, cu reflexii calde la lumina naturală. Perfectă pentru dormitoare și săli de oaspeți cu un aer clasic, regal.",
    pricePerUnit: 135,
    pricingUnit: "ml",
    minQuantity: 0.5,
    fabricType: "catifea",
    opacity: "blackout",
    color: "Bordo",
    colorHex: "#800020",
    pattern: "uni",
    defaultHeightCm: 280,
    minHeightCm: 200,
    maxHeightCm: 300,
    weightGsm: 380,
    composition: "100% poliester",
    inStock: true,
    isFeatured: true,
    isOnSale: false,
    sku: "DC-BRD-002",
    categorySlug: "draperii-catifea",
    images: [
      {
        url: "https://images.unsplash.com/photo-1615874959474-d609969a20ed?q=80&w=2080&auto=format&fit=crop",
        alt: "Draperie catifea bordo în dormitor elegant",
      },
      {
        url: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=2080&auto=format&fit=crop",
        alt: "Detaliu falduri catifea bordo",
      },
    ],
  },
  {
    name: "Draperie Catifea Bleumarin Noapte",
    slug: "draperie-catifea-bleumarin-noapte",
    shortDescription: "Catifea densă bleumarin cu luciu satinat",
    description:
      "Draperie din catifea premium bleumarin profund. Cădere naturală, greutate echilibrată și un luciu satinat subtil. Ideală pentru dormitoare moderne și birouri home-office.",
    pricePerUnit: 125,
    originalPrice: 160,
    pricingUnit: "ml",
    minQuantity: 0.5,
    fabricType: "catifea",
    opacity: "blackout",
    color: "Bleumarin",
    colorHex: "#1B3A5C",
    pattern: "uni",
    defaultHeightCm: 280,
    minHeightCm: 200,
    maxHeightCm: 300,
    weightGsm: 360,
    composition: "100% poliester",
    inStock: true,
    isFeatured: false,
    isOnSale: true,
    sku: "DC-BLM-003",
    categorySlug: "draperii-catifea",
    images: [
      {
        url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop",
        alt: "Draperie catifea bleumarin în cameră modernă",
      },
    ],
  },
  {
    name: "Draperie Catifea Gri Perla",
    slug: "draperie-catifea-gri-perla",
    shortDescription: "Catifea elegantă în nuanță gri perla, versatilă",
    description:
      "Draperie din catifea fină în nuanța gri perla. Tonul neutru o face extrem de versatilă, integrându-se perfect în orice decor. Material gros, cu proprietăți excelente de izolare.",
    pricePerUnit: 110,
    pricingUnit: "ml",
    minQuantity: 0.5,
    fabricType: "catifea",
    opacity: "blackout",
    color: "Gri Perla",
    colorHex: "#B8B8B8",
    pattern: "uni",
    defaultHeightCm: 280,
    minHeightCm: 200,
    maxHeightCm: 300,
    weightGsm: 340,
    composition: "100% poliester",
    inStock: true,
    isFeatured: true,
    isOnSale: false,
    sku: "DC-GRP-004",
    categorySlug: "draperii-catifea",
    images: [
      {
        url: "https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=2027&auto=format&fit=crop",
        alt: "Draperie catifea gri perla într-un living minimalist",
      },
    ],
  },
  {
    name: "Draperie Catifea Auriu Champagne",
    slug: "draperie-catifea-auriu-champagne",
    shortDescription: "Catifea cu reflexii aurii, lux accesibil",
    description:
      "Draperie din catifea premium în nuanța auriu champagne. Reflexii calde și sofisticate care transformă orice cameră într-un spațiu de lux. Material dens cu cădere bogată.",
    pricePerUnit: 145,
    pricingUnit: "ml",
    minQuantity: 0.5,
    fabricType: "catifea",
    opacity: "blackout",
    color: "Auriu Champagne",
    colorHex: "#C9A96E",
    pattern: "uni",
    defaultHeightCm: 280,
    minHeightCm: 200,
    maxHeightCm: 300,
    weightGsm: 370,
    composition: "100% poliester",
    inStock: true,
    isFeatured: true,
    isOnSale: false,
    sku: "DC-AUR-005",
    categorySlug: "draperii-catifea",
    images: [
      {
        url: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=2032&auto=format&fit=crop",
        alt: "Draperie catifea auriu champagne în living elegant",
      },
    ],
  },
  {
    name: "Draperie Catifea Negru Onyx",
    slug: "draperie-catifea-negru-onyx",
    shortDescription: "Catifea neagră intensă, blackout total",
    description:
      "Draperie din catifea neagră intensă — blocaj total al luminii și un aspect dramatic. Perfectă pentru home cinema, dormitoare sau spații care necesită întuneric complet.",
    pricePerUnit: 130,
    pricingUnit: "ml",
    minQuantity: 0.5,
    fabricType: "catifea",
    opacity: "blackout",
    color: "Negru",
    colorHex: "#1A1A1A",
    pattern: "uni",
    defaultHeightCm: 280,
    minHeightCm: 200,
    maxHeightCm: 300,
    weightGsm: 400,
    composition: "100% poliester",
    inStock: true,
    isFeatured: false,
    isOnSale: false,
    sku: "DC-NGR-006",
    categorySlug: "draperii-catifea",
    images: [
      {
        url: "https://images.unsplash.com/photo-1631049552057-403cdb8f0658?q=80&w=2070&auto=format&fit=crop",
        alt: "Draperie catifea neagră într-un decor modern",
      },
    ],
  },
  {
    name: "Draperie Catifea Verde Olive",
    slug: "draperie-catifea-verde-olive",
    shortDescription: "Catifea verde olive, tonuri naturale sofisticate",
    description:
      "Draperie din catifea verde olive cu reflexii naturale. Material premium cu greutate medie-mare, ideal pentru interioare cu accente botanice sau stilul mid-century modern.",
    pricePerUnit: 115,
    originalPrice: 140,
    pricingUnit: "ml",
    minQuantity: 0.5,
    fabricType: "catifea",
    opacity: "semi-opac",
    color: "Verde Olive",
    colorHex: "#556B2F",
    pattern: "uni",
    defaultHeightCm: 280,
    minHeightCm: 200,
    maxHeightCm: 300,
    weightGsm: 320,
    composition: "100% poliester",
    inStock: true,
    isFeatured: false,
    isOnSale: true,
    sku: "DC-VRD-007",
    categorySlug: "draperii-catifea",
    images: [
      {
        url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop",
        alt: "Draperie catifea verde olive în cameră cu plante",
      },
    ],
  },

  // ── Draperii Blackout (6 products) ──────────────────
  {
    name: "Draperie Blackout Gri Antracit",
    slug: "draperie-blackout-gri-antracit",
    shortDescription: "Blackout 100%, material mat gri antracit",
    description:
      "Draperie blackout din material mat, gri antracit. Blochează 100% lumina solară, perfectă pentru dormitoare. Material ușor de întreținut, lavabil la mașină la 30°C.",
    pricePerUnit: 85,
    pricingUnit: "ml",
    minQuantity: 0.5,
    fabricType: "poliester",
    opacity: "blackout",
    color: "Gri Antracit",
    colorHex: "#383838",
    pattern: "uni",
    defaultHeightCm: 280,
    minHeightCm: 200,
    maxHeightCm: 300,
    weightGsm: 280,
    composition: "100% poliester cu strat blackout",
    inStock: true,
    isFeatured: true,
    isOnSale: false,
    sku: "DB-GRA-001",
    categorySlug: "draperii-blackout",
    images: [
      {
        url: "https://images.unsplash.com/photo-1615874959474-d609969a20ed?q=80&w=2080&auto=format&fit=crop",
        alt: "Draperie blackout gri antracit în dormitor",
      },
    ],
  },
  {
    name: "Draperie Blackout Bej Natural",
    slug: "draperie-blackout-bej-natural",
    shortDescription: "Blackout în nuanță bej cald, aspect natural",
    description:
      "Draperie blackout în nuanță bej natural. Combină funcționalitatea blackout cu un aspect cald și primitor. Material cu textură fină, asemănătoare inului.",
    pricePerUnit: 90,
    pricingUnit: "ml",
    minQuantity: 0.5,
    fabricType: "poliester",
    opacity: "blackout",
    color: "Bej Natural",
    colorHex: "#D4C5A9",
    pattern: "uni",
    defaultHeightCm: 280,
    minHeightCm: 200,
    maxHeightCm: 300,
    weightGsm: 290,
    composition: "100% poliester cu strat blackout",
    inStock: true,
    isFeatured: false,
    isOnSale: false,
    sku: "DB-BEJ-002",
    categorySlug: "draperii-blackout",
    images: [
      {
        url: "https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=2027&auto=format&fit=crop",
        alt: "Draperie blackout bej într-un dormitor luminos",
      },
    ],
  },
  {
    name: "Draperie Blackout Alb Ivory",
    slug: "draperie-blackout-alb-ivory",
    shortDescription: "Blackout alb ivory, lumină filtrată elegant",
    description:
      "Draperie blackout în alb ivory — blochează lumina puternică păstrând un aspect luminos și aerisit. Perfectă pentru camere orientate spre sud sau vest.",
    pricePerUnit: 95,
    originalPrice: 120,
    pricingUnit: "ml",
    minQuantity: 0.5,
    fabricType: "poliester",
    opacity: "blackout",
    color: "Alb Ivory",
    colorHex: "#FFFFF0",
    pattern: "uni",
    defaultHeightCm: 280,
    minHeightCm: 200,
    maxHeightCm: 300,
    weightGsm: 270,
    composition: "100% poliester cu strat blackout",
    inStock: true,
    isFeatured: false,
    isOnSale: true,
    sku: "DB-ALB-003",
    categorySlug: "draperii-blackout",
    images: [
      {
        url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2069&auto=format&fit=crop",
        alt: "Draperie blackout alb ivory în cameră luminoasă",
      },
    ],
  },
  {
    name: "Draperie Blackout Bleumarin Mat",
    slug: "draperie-blackout-bleumarin-mat",
    shortDescription: "Blackout bleumarin cu finisaj mat modern",
    description:
      "Draperie blackout bleumarin cu finisaj mat. Design modern, fără luciu, perfectă pentru birouri home-office sau dormitoare contemporane. Material durabil și ușor de întreținut.",
    pricePerUnit: 88,
    pricingUnit: "ml",
    minQuantity: 0.5,
    fabricType: "poliester",
    opacity: "blackout",
    color: "Bleumarin",
    colorHex: "#1B3A5C",
    pattern: "uni",
    defaultHeightCm: 280,
    minHeightCm: 200,
    maxHeightCm: 300,
    weightGsm: 285,
    composition: "100% poliester cu strat blackout",
    inStock: true,
    isFeatured: false,
    isOnSale: false,
    sku: "DB-BLM-004",
    categorySlug: "draperii-blackout",
    images: [
      {
        url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop",
        alt: "Draperie blackout bleumarin în birou home-office",
      },
    ],
  },
  {
    name: "Draperie Blackout Ciocolatiu",
    slug: "draperie-blackout-ciocolatiu",
    shortDescription: "Blackout maro ciocolatiu, căldură și confort",
    description:
      "Draperie blackout maro ciocolatiu — tonuri calde și îmbrățișătoare. Blochează lumina complet, oferind un sentiment de cocoon confortabil. Ideală pentru dormitoare matrimoniale.",
    pricePerUnit: 92,
    pricingUnit: "ml",
    minQuantity: 0.5,
    fabricType: "poliester",
    opacity: "blackout",
    color: "Ciocolatiu",
    colorHex: "#5C3317",
    pattern: "uni",
    defaultHeightCm: 280,
    minHeightCm: 200,
    maxHeightCm: 300,
    weightGsm: 290,
    composition: "100% poliester cu strat blackout",
    inStock: true,
    isFeatured: false,
    isOnSale: false,
    sku: "DB-CIO-005",
    categorySlug: "draperii-blackout",
    images: [
      {
        url: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=2032&auto=format&fit=crop",
        alt: "Draperie blackout ciocolatiu în dormitor",
      },
    ],
  },
  {
    name: "Draperie Blackout Teracotă",
    slug: "draperie-blackout-teracota",
    shortDescription: "Blackout teracotă, tendință 2024",
    description:
      "Draperie blackout în nuanța teracotă — culoare la modă, caldă și pământească. Material cu textura subtilă, blochează complet lumina.",
    pricePerUnit: 98,
    originalPrice: 125,
    pricingUnit: "ml",
    minQuantity: 0.5,
    fabricType: "poliester",
    opacity: "blackout",
    color: "Teracotă",
    colorHex: "#CC5C3B",
    pattern: "uni",
    defaultHeightCm: 280,
    minHeightCm: 200,
    maxHeightCm: 300,
    weightGsm: 300,
    composition: "100% poliester cu strat blackout",
    inStock: true,
    isFeatured: true,
    isOnSale: true,
    sku: "DB-TRC-006",
    categorySlug: "draperii-blackout",
    images: [
      {
        url: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=2070&auto=format&fit=crop",
        alt: "Draperie blackout teracotă în cameră cu stil boho",
      },
    ],
  },

  // ── Perdele Voal (6 products) ───────────────────────
  {
    name: "Perdea Voal Alb Clasic",
    slug: "perdea-voal-alb-clasic",
    shortDescription: "Voal alb transparent, clasic și versatil",
    description:
      "Perdea din voal alb clasic — material fin, transparent, care filtrează lumina natural oferind intimitate discretă. Se potrivește oricărui tip de decor.",
    pricePerUnit: 45,
    pricingUnit: "ml",
    minQuantity: 0.5,
    fabricType: "voal",
    opacity: "transparent",
    color: "Alb",
    colorHex: "#FFFFFF",
    pattern: "uni",
    defaultHeightCm: 280,
    minHeightCm: 200,
    maxHeightCm: 300,
    weightGsm: 60,
    composition: "100% poliester",
    inStock: true,
    isFeatured: true,
    isOnSale: false,
    sku: "PV-ALB-001",
    categorySlug: "perdele-voal",
    images: [
      {
        url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2069&auto=format&fit=crop",
        alt: "Perdea voal alb clasic la fereastră",
      },
    ],
  },
  {
    name: "Perdea Voal Brodat Floral",
    slug: "perdea-voal-brodat-floral",
    shortDescription: "Voal alb cu broderie florală delicată",
    description:
      "Perdea din voal fin cu broderie florală delicată. Motivele florale sunt cusute cu fir alb pe fond transparent, adăugând un plus de eleganță și rafinament.",
    pricePerUnit: 75,
    pricingUnit: "ml",
    minQuantity: 0.5,
    fabricType: "voal",
    opacity: "transparent",
    color: "Alb",
    colorHex: "#FAFAFA",
    pattern: "brodat",
    defaultHeightCm: 280,
    minHeightCm: 200,
    maxHeightCm: 300,
    weightGsm: 85,
    composition: "100% poliester",
    inStock: true,
    isFeatured: false,
    isOnSale: false,
    sku: "PV-BRF-002",
    categorySlug: "perdele-voal",
    images: [
      {
        url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=2070&auto=format&fit=crop",
        alt: "Perdea voal brodat floral detaliu",
      },
    ],
  },
  {
    name: "Perdea Voal Ecru Elegant",
    slug: "perdea-voal-ecru-elegant",
    shortDescription: "Voal ecru cu luciu satinat delicat",
    description:
      "Perdea din voal ecru cu luciu satinat subtil. Nuanța ecru adaugă căldură spațiului fără a întuneca camera. Material fin cu cădere frumoasă.",
    pricePerUnit: 52,
    originalPrice: 65,
    pricingUnit: "ml",
    minQuantity: 0.5,
    fabricType: "voal",
    opacity: "transparent",
    color: "Ecru",
    colorHex: "#F5F5DC",
    pattern: "uni",
    defaultHeightCm: 280,
    minHeightCm: 200,
    maxHeightCm: 300,
    weightGsm: 65,
    composition: "100% poliester",
    inStock: true,
    isFeatured: false,
    isOnSale: true,
    sku: "PV-ECR-003",
    categorySlug: "perdele-voal",
    images: [
      {
        url: "https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=2027&auto=format&fit=crop",
        alt: "Perdea voal ecru în cameră luminoasă",
      },
    ],
  },
  {
    name: "Perdea Voal Gri Fumé",
    slug: "perdea-voal-gri-fume",
    shortDescription: "Voal gri fumé semi-transparent, modern",
    description:
      "Perdea din voal gri fumé — tendință modernă pentru interioare contemporane. Filtrează lumina adăugând o notă sofisticată fără a îngreuna spațiul vizual.",
    pricePerUnit: 55,
    pricingUnit: "ml",
    minQuantity: 0.5,
    fabricType: "voal",
    opacity: "semi-opac",
    color: "Gri Fumé",
    colorHex: "#8C8C8C",
    pattern: "uni",
    defaultHeightCm: 280,
    minHeightCm: 200,
    maxHeightCm: 300,
    weightGsm: 75,
    composition: "100% poliester",
    inStock: true,
    isFeatured: false,
    isOnSale: false,
    sku: "PV-GRF-004",
    categorySlug: "perdele-voal",
    images: [
      {
        url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop",
        alt: "Perdea voal gri fumé în living modern",
      },
    ],
  },
  {
    name: "Perdea Voal Cu Dungi Argintii",
    slug: "perdea-voal-dungi-argintii",
    shortDescription: "Voal alb cu dungi verticale argintii subtile",
    description:
      "Perdea din voal alb cu dungi verticale argintii, țesute în material. Efect elegant și modern, adaugă verticalitate și rafinament oricărei ferestre.",
    pricePerUnit: 68,
    pricingUnit: "ml",
    minQuantity: 0.5,
    fabricType: "voal",
    opacity: "transparent",
    color: "Alb/Argintiu",
    colorHex: "#E8E8E8",
    pattern: "imprimat",
    defaultHeightCm: 280,
    minHeightCm: 200,
    maxHeightCm: 300,
    weightGsm: 70,
    composition: "100% poliester",
    inStock: true,
    isFeatured: false,
    isOnSale: false,
    sku: "PV-DGA-005",
    categorySlug: "perdele-voal",
    images: [
      {
        url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2069&auto=format&fit=crop",
        alt: "Perdea voal cu dungi argintii",
      },
    ],
  },
  {
    name: "Perdea Voal Roz Pudrat",
    slug: "perdea-voal-roz-pudrat",
    shortDescription: "Voal roz pudrat delicat și romantic",
    description:
      "Perdea din voal roz pudrat — nuanță delicată, romantică, perfectă pentru dormitoare feminine sau camere de copii. Material fin cu cădere ușoară și fluidă.",
    pricePerUnit: 50,
    originalPrice: 60,
    pricingUnit: "ml",
    minQuantity: 0.5,
    fabricType: "voal",
    opacity: "transparent",
    color: "Roz Pudrat",
    colorHex: "#E8B4B8",
    pattern: "uni",
    defaultHeightCm: 280,
    minHeightCm: 200,
    maxHeightCm: 300,
    weightGsm: 60,
    composition: "100% poliester",
    inStock: true,
    isFeatured: false,
    isOnSale: true,
    sku: "PV-ROZ-006",
    categorySlug: "perdele-voal",
    images: [
      {
        url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=2070&auto=format&fit=crop",
        alt: "Perdea voal roz pudrat în dormitor",
      },
    ],
  },

  // ── Perdele In (6 products) ─────────────────────────
  {
    name: "Perdea In Natural Scandinav",
    slug: "perdea-in-natural-scandinav",
    shortDescription: "In natural, textură rustică, stil scandinav",
    description:
      "Perdea din in natural cu textură organică. Materialul are un aspect rustic-elegant specific stilului scandinav. Filtrează lumina creând o atmosferă caldă și naturală.",
    pricePerUnit: 95,
    pricingUnit: "ml",
    minQuantity: 0.5,
    fabricType: "in",
    opacity: "semi-opac",
    color: "Natural",
    colorHex: "#D2C6A5",
    pattern: "uni",
    defaultHeightCm: 270,
    minHeightCm: 200,
    maxHeightCm: 290,
    weightGsm: 180,
    composition: "80% in, 20% bumbac",
    inStock: true,
    isFeatured: true,
    isOnSale: false,
    sku: "PI-NAT-001",
    categorySlug: "perdele-in",
    images: [
      {
        url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=2070&auto=format&fit=crop",
        alt: "Perdea in natural într-un living scandinav",
      },
    ],
  },
  {
    name: "Perdea In Alb Spălat",
    slug: "perdea-in-alb-spalat",
    shortDescription: "In alb spălat, aspect lived-in și confortabil",
    description:
      "Perdea din in alb cu aspect spălat (washed linen). Textură moale și naturală, cu acel farmec relaxat și confortabil. Perfectă pentru case de vacanță sau dormitoare boho.",
    pricePerUnit: 105,
    pricingUnit: "ml",
    minQuantity: 0.5,
    fabricType: "in",
    opacity: "semi-opac",
    color: "Alb Spălat",
    colorHex: "#F0EDE5",
    pattern: "uni",
    defaultHeightCm: 270,
    minHeightCm: 200,
    maxHeightCm: 290,
    weightGsm: 190,
    composition: "100% in",
    inStock: true,
    isFeatured: false,
    isOnSale: false,
    sku: "PI-ALS-002",
    categorySlug: "perdele-in",
    images: [
      {
        url: "https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=2027&auto=format&fit=crop",
        alt: "Perdea in alb spălat în dormitor boho",
      },
    ],
  },
  {
    name: "Perdea In Gri Nisip",
    slug: "perdea-in-gri-nisip",
    shortDescription: "In gri nisip, ton cald neutru",
    description:
      "Perdea din in în nuanța gri nisip. Ton cald, neutru, care se integrează ușor în orice decor. Material natural cu textură distinctivă de in.",
    pricePerUnit: 100,
    originalPrice: 125,
    pricingUnit: "ml",
    minQuantity: 0.5,
    fabricType: "in",
    opacity: "semi-opac",
    color: "Gri Nisip",
    colorHex: "#C4B9A0",
    pattern: "uni",
    defaultHeightCm: 270,
    minHeightCm: 200,
    maxHeightCm: 290,
    weightGsm: 185,
    composition: "80% in, 20% bumbac",
    inStock: true,
    isFeatured: false,
    isOnSale: true,
    sku: "PI-GRN-003",
    categorySlug: "perdele-in",
    images: [
      {
        url: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=2032&auto=format&fit=crop",
        alt: "Perdea in gri nisip într-o cameră minimalistă",
      },
    ],
  },
  {
    name: "Perdea In Verde Salvie",
    slug: "perdea-in-verde-salvie",
    shortDescription: "In verde salvie, accent natural organic",
    description:
      "Perdea din in în nuanța verde salvie — culoare organică, calmantă. Ideală pentru dormitoare sau spații de meditație. Material natural cu cădere ușoară.",
    pricePerUnit: 110,
    pricingUnit: "ml",
    minQuantity: 0.5,
    fabricType: "in",
    opacity: "semi-opac",
    color: "Verde Salvie",
    colorHex: "#8F9779",
    pattern: "uni",
    defaultHeightCm: 270,
    minHeightCm: 200,
    maxHeightCm: 290,
    weightGsm: 185,
    composition: "80% in, 20% bumbac",
    inStock: true,
    isFeatured: false,
    isOnSale: false,
    sku: "PI-VRS-004",
    categorySlug: "perdele-in",
    images: [
      {
        url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop",
        alt: "Perdea in verde salvie într-un spațiu organic",
      },
    ],
  },
  {
    name: "Perdea In Cu Dungi Terracotta",
    slug: "perdea-in-dungi-terracotta",
    shortDescription: "In natural cu dungi teracotă, accent mediteranean",
    description:
      "Perdea din in natural cu dungi teracotă — accent mediteranean cald. Combină naturalețea inului cu energia culorii teracotă pentru un decor vibrant.",
    pricePerUnit: 120,
    pricingUnit: "ml",
    minQuantity: 0.5,
    fabricType: "in",
    opacity: "semi-opac",
    color: "Natural/Teracotă",
    colorHex: "#CC5C3B",
    pattern: "imprimat",
    defaultHeightCm: 270,
    minHeightCm: 200,
    maxHeightCm: 290,
    weightGsm: 195,
    composition: "70% in, 30% bumbac",
    inStock: true,
    isFeatured: false,
    isOnSale: false,
    sku: "PI-DGT-005",
    categorySlug: "perdele-in",
    images: [
      {
        url: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=2070&auto=format&fit=crop",
        alt: "Perdea in cu dungi teracotă",
      },
    ],
  },
  {
    name: "Perdea In Bleumarin Marin",
    slug: "perdea-in-bleumarin-marin",
    shortDescription: "In bleumarin, atmosferă maritimă și coastală",
    description:
      "Perdea din in bleumarin — inspirație maritimă pentru decor coastal sau clasic naval. Material natural premium cu textură distinctivă.",
    pricePerUnit: 108,
    originalPrice: 135,
    pricingUnit: "ml",
    minQuantity: 0.5,
    fabricType: "in",
    opacity: "semi-opac",
    color: "Bleumarin",
    colorHex: "#1B3A5C",
    pattern: "uni",
    defaultHeightCm: 270,
    minHeightCm: 200,
    maxHeightCm: 290,
    weightGsm: 185,
    composition: "80% in, 20% bumbac",
    inStock: true,
    isFeatured: false,
    isOnSale: true,
    sku: "PI-BLM-006",
    categorySlug: "perdele-in",
    images: [
      {
        url: "https://images.unsplash.com/photo-1615874959474-d609969a20ed?q=80&w=2080&auto=format&fit=crop",
        alt: "Perdea in bleumarin în cameră cu stil marin",
      },
    ],
  },

  // ── Accesorii (5 products, priced per piece) ────────
  {
    name: "Galerie Metalică Neagră 200cm",
    slug: "galerie-metalica-neagra-200cm",
    shortDescription: "Galerie din metal negru mat, 200cm, cu suporturi",
    description:
      "Galerie din metal negru mat, lungime 200cm. Include 2 suporturi de perete și set de inele. Design minimalist, potrivită pentru draperii grele (catifea, blackout).",
    pricePerUnit: 89,
    pricingUnit: "buc",
    minQuantity: 1,
    color: "Negru Mat",
    colorHex: "#1A1A1A",
    inStock: true,
    isFeatured: false,
    isOnSale: false,
    sku: "AC-GMN-001",
    categorySlug: "accesorii",
    defaultHeightCm: 280,
    minHeightCm: 200,
    maxHeightCm: 300,
    images: [
      {
        url: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=2080&auto=format&fit=crop",
        alt: "Galerie metalică neagră montată",
      },
    ],
  },
  {
    name: "Galerie Metalică Aurie 200cm",
    slug: "galerie-metalica-aurie-200cm",
    shortDescription: "Galerie din metal auriu satinat, 200cm",
    description:
      "Galerie din metal auriu satinat, lungime 200cm. Finisaj premium care completează orice draperie elegantă. Include suporturi și capete decorative.",
    pricePerUnit: 120,
    pricingUnit: "buc",
    minQuantity: 1,
    color: "Auriu Satinat",
    colorHex: "#C9A96E",
    inStock: true,
    isFeatured: false,
    isOnSale: false,
    sku: "AC-GMA-002",
    categorySlug: "accesorii",
    defaultHeightCm: 280,
    minHeightCm: 200,
    maxHeightCm: 300,
    images: [
      {
        url: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=2080&auto=format&fit=crop",
        alt: "Galerie metalică aurie montată",
      },
    ],
  },
  {
    name: "Set 10 Inele Metalice cu Clemă",
    slug: "set-inele-metalice-clema",
    shortDescription: "Set de 10 inele cu clemă pentru galerie, negru mat",
    description:
      "Set de 10 inele metalice cu clemă integrată. Se montează direct pe galerie fără a necesita cusătură pe perdea. Culoare: negru mat. Diametru interior: 35mm.",
    pricePerUnit: 35,
    pricingUnit: "buc",
    minQuantity: 1,
    color: "Negru Mat",
    colorHex: "#1A1A1A",
    inStock: true,
    isFeatured: false,
    isOnSale: false,
    sku: "AC-INL-003",
    categorySlug: "accesorii",
    defaultHeightCm: 280,
    minHeightCm: 200,
    maxHeightCm: 300,
    images: [
      {
        url: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=2080&auto=format&fit=crop",
        alt: "Set inele metalice cu clemă",
      },
    ],
  },
  {
    name: "Tieback Magnetic Perla",
    slug: "tieback-magnetic-perla",
    shortDescription: "Tieback magnetic decorativ cu perlă, set 2 buc",
    description:
      "Set de 2 tiebacks magnetice decorative cu perlă. Mențin draperia deschisă elegant, fără montare pe perete. Potrivite pentru orice tip de material.",
    pricePerUnit: 45,
    originalPrice: 55,
    pricingUnit: "buc",
    minQuantity: 1,
    color: "Perla/Auriu",
    colorHex: "#E8DCC8",
    inStock: true,
    isFeatured: false,
    isOnSale: true,
    sku: "AC-TBK-004",
    categorySlug: "accesorii",
    defaultHeightCm: 280,
    minHeightCm: 200,
    maxHeightCm: 300,
    images: [
      {
        url: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=2080&auto=format&fit=crop",
        alt: "Tieback magnetic decorativ cu perlă",
      },
    ],
  },
  {
    name: "Set 20 Cârlige Galerie Clasice",
    slug: "set-carlige-galerie-clasice",
    shortDescription: "Set de 20 cârlige din plastic pentru rejansă",
    description:
      "Set de 20 cârlige clasice din plastic rezistent. Se folosesc împreună cu rejansa pentru agățarea perdelelor și draperiilor pe galerie. Culoare: alb transparent.",
    pricePerUnit: 15,
    pricingUnit: "buc",
    minQuantity: 1,
    color: "Transparent",
    colorHex: "#F0F0F0",
    inStock: true,
    isFeatured: false,
    isOnSale: false,
    sku: "AC-CRG-005",
    categorySlug: "accesorii",
    defaultHeightCm: 280,
    minHeightCm: 200,
    maxHeightCm: 300,
    images: [
      {
        url: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=2080&auto=format&fit=crop",
        alt: "Set cârlige clasice din plastic",
      },
    ],
  },
];

// ── Seed execution ─────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding database...\n");

  // Clear existing product data (in correct order for FK constraints)
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  console.log("  ✓ Cleared existing product data");

  // Create categories
  const categoryMap = new Map<string, string>();

  for (const cat of categories) {
    const created = await prisma.category.create({ data: cat });
    categoryMap.set(cat.slug, created.id);
    console.log(`  ✓ Category: ${created.name}`);
  }

  console.log("");

  // Create products with images
  for (const product of products) {
    const categoryId = categoryMap.get(product.categorySlug);
    if (!categoryId) {
      throw new Error(`Category not found: ${product.categorySlug}`);
    }

    const { categorySlug, images, ...productData } = product;

    const created = await prisma.product.create({
      data: {
        ...productData,
        categoryId,
        images: {
          create: images.map((img, index) => ({
            url: img.url,
            alt: img.alt,
            sortOrder: index,
          })),
        },
      },
    });

    console.log(`  ✓ Product: ${created.name} (${images.length} images)`);
  }

  const totalProducts = await prisma.product.count();
  const totalCategories = await prisma.category.count();
  const totalImages = await prisma.productImage.count();

  console.log(
    `\n🎉 Seed complete: ${totalCategories} categories, ${totalProducts} products, ${totalImages} images\n`
  );
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
