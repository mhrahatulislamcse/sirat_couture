import { Product, CategoryItem } from '../types/resale';

export const TAXONOMY: CategoryItem[] = [
  {
    id: 'cat_rtw',
    slug: 'ready-to-wear',
    name: 'Ready To Wear',
    subcategories: [
      { id: 'cat_dresses', slug: 'dresses', name: 'Dresses' },
      { id: 'cat_outerwear', slug: 'outerwear', name: 'Jackets & Coats' },
      { id: 'cat_knitwear', slug: 'knitwear', name: 'Knitwear & Sweaters' },
      { id: 'cat_tops', slug: 'tops-tees', name: 'Tops & Shirts' },
      { id: 'cat_skirts', slug: 'skirts', name: 'Skirts' },
      { id: 'cat_trousers', slug: 'trousers', name: 'Pants & Tailoring' },
      { id: 'cat_denim', slug: 'denim', name: 'Archival Denim' }
    ]
  },
  {
    id: 'cat_footwear',
    slug: 'footwear',
    name: 'Footwear',
    subcategories: [
      { id: 'cat_boots', slug: 'boots', name: 'Combat & Tabi Boots' },
      { id: 'cat_derbies', slug: 'derbies-loafers', name: 'Derbies & Loafers' },
      { id: 'cat_sneakers', slug: 'sneakers', name: 'Archive Runners' }
    ]
  },
  {
    id: 'cat_bags',
    slug: 'bags-leather',
    name: 'Bags & Leather',
    subcategories: [
      { id: 'cat_totes', slug: 'totes-carryalls', name: 'Structured Totes' },
      { id: 'cat_crossbody', slug: 'crossbody', name: 'Messenger & Slings' },
      { id: 'cat_wallets', slug: 'small-leather-goods', name: 'Small Leather Goods' }
    ]
  },
  {
    id: 'cat_accessories',
    slug: 'accessories-jewelry',
    name: 'Accessories & Jewelry',
    subcategories: [
      { id: 'cat_belts', slug: 'belts', name: 'Belts & Buckles' },
      { id: 'cat_silver', slug: 'sterling-silver', name: 'Sterling Silver Jewelry' },
      { id: 'cat_eyewear', slug: 'eyewear', name: 'Titanium Eyewear' },
      { id: 'cat_scarves', slug: 'scarves-hats', name: 'Headwear & Silk Scarves' }
    ]
  },
  {
    id: 'cat_archive',
    slug: 'curated-archive-drops',
    name: 'Curated Archive Vault',
    subcategories: [
      { id: 'cat_drop_antwerp', slug: 'antwerp-six', name: 'Antwerp Six & Belgian Vision' },
      { id: 'cat_drop_tokyo', slug: 'tokyo-underground', name: '90s Tokyo Ura-Harajuku' },
      { id: 'cat_drop_runway', slug: 'museum-runway', name: 'Museum Runway 1-of-1s' }
    ]
  },
  {
    id: 'cat_tailoring',
    slug: 'tailoring',
    name: 'Tailoring & Suiting'
  },
  {
    id: 'cat_vintage_streetwear',
    slug: 'vintage-streetwear',
    name: 'Vintage Streetwear & Grails'
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod_raf_01',
    sku: 'RAFS-OUT-2001-9F2A',
    title: 'AW2001 "Riot Riot Riot" Oversized Patch Bomber',
    slug: 'raf-simons-aw2001-riot-bomber',
    description: 'Iconic runway piece from Raf Simons Autumn/Winter 2001-2002. Constructed with industrial washed olive nylon twill, oversized dropped shoulder silhouette, original wire-reinforced collar, and hand-stitched Manic Street Preachers patch accents. One-of-a-kind museum grail available for direct delivery in Bangladesh.',
    brand: 'Raf Simons',
    gender: 'MEN',
    priceBDT: 385000,
    cogsBDT: 215000,
    originalRetailBDT: 460000,
    condition: 'MINOR_FLAWS',
    era: 'ERA_90S',
    authenticityStatus: 'VERIFIED',
    authenticityNotes: 'Physical basting stitch and Lampo zipper verification passed at Dhaka intake hub.',
    wearDetails: {
      fabricIntegrity: 92,
      seamTension: 96,
      hardwarePatina: 82,
      labelLegibility: 90,
      defectsSummary: 'Natural era-specific collar patina, slight distressing at lower cuff ribbing, patches fully intact.'
    },
    measurements: {
      chestWidthIn: 28.5,
      lengthIn: 29.0,
      shoulderWidthIn: 24.0,
      sleeveLengthIn: 26.5
    },
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=80'
    ],
    status: 'ACTIVE',
    isUniquePiece: true,
    categoryId: 'cat_outerwear',
    categoryName: 'Outerwear',
    sizeTag: 'EU 50 (Fits Oversized XL)',
    colorway: 'Faded Military Olive',
    composition: '100% Nylon Shell, Quilted Silk/Viscose Fill',
    madeIn: 'Belgium',
    createdAt: new Date('2026-08-10T10:00:00Z').toISOString(),
    updatedAt: new Date('2026-08-10T10:00:00Z').toISOString()
  },
  {
    id: 'prod_margiela_02',
    sku: 'MM6-FOO-1999-7A8B',
    title: 'SS1999 Artisanal Painted Flat Sole Tabi Boot',
    slug: 'maison-margiela-ss1999-painted-tabi',
    description: 'Original early Martin Margiela 1999 production. Hand-dipped white gesso bianchetto paint over rich espresso calf leather. As worn, the white paint naturally micro-cracks to reveal the dark leather grain beneath.',
    brand: 'Maison Margiela',
    gender: 'UNISEX',
    priceBDT: 195000,
    cogsBDT: 110000,
    originalRetailBDT: 230000,
    condition: 'EXCELLENT_VINTAGE',
    era: 'ERA_90S',
    authenticityStatus: 'VERIFIED',
    authenticityNotes: 'Protective half-sole added by high-end cobbler; authentic bianchetto paint crackle.',
    wearDetails: {
      fabricIntegrity: 98,
      seamTension: 100,
      hardwarePatina: 95,
      labelLegibility: 96,
      defectsSummary: 'Delicate intentional artisanal paint flaking; no leather dehydration.'
    },
    measurements: {
      waistIn: 0,
      lengthIn: 0
    },
    images: [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80'
    ],
    status: 'ACTIVE',
    isUniquePiece: true,
    categoryId: 'cat_boots',
    categoryName: 'Footwear',
    sizeTag: 'IT 42 (US Men 9 / Women 10.5)',
    colorway: 'Bianchetto White over Espresso',
    composition: '100% Hand-Dyed Calfskin Leather',
    madeIn: 'Italy',
    createdAt: new Date('2026-08-12T14:30:00Z').toISOString(),
    updatedAt: new Date('2026-08-12T14:30:00Z').toISOString()
  },
  {
    id: 'prod_row_03',
    sku: 'TROW-BAG-2023-3C1E',
    title: 'The Margaux 15 in Polished Saddle Box Calf',
    slug: 'the-row-margaux-15-box-calf',
    description: 'The definitive quiet-luxury heirloom tote from The Row. Streamlined belted side gussets with discreet palladium buckle fasteners. Sourced from a private collector, pristine condition with original micro-suede dust bag.',
    brand: 'The Row',
    gender: 'WOMEN',
    priceBDT: 590000,
    cogsBDT: 370000,
    originalRetailBDT: 650000,
    condition: 'BRAND_NEW_TAGS',
    era: 'MODERN',
    authenticityStatus: 'VERIFIED',
    authenticityNotes: 'Uncarried condition with protective plastic film still affixed to base feet hardware.',
    wearDetails: {
      fabricIntegrity: 100,
      seamTension: 100,
      hardwarePatina: 100,
      labelLegibility: 100,
      defectsSummary: 'Flawless condition; zero hairline scuffs.'
    },
    measurements: {
      chestWidthIn: 15.0,
      lengthIn: 11.0,
      shoulderWidthIn: 9.0
    },
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=80'
    ],
    status: 'ACTIVE',
    isUniquePiece: true,
    categoryId: 'cat_totes',
    categoryName: 'Bags & Leather',
    sizeTag: '15-Inch Medium',
    colorway: 'Deep Black / Palladium Hardware',
    composition: 'Full-Grain Box Calf Leather, Lambskin Nappa Lining',
    madeIn: 'Italy',
    createdAt: new Date('2026-08-14T09:15:00Z').toISOString(),
    updatedAt: new Date('2026-08-14T09:15:00Z').toISOString()
  },
  {
    id: 'prod_rick_04',
    sku: 'RICK-TRO-2018-D49F',
    title: 'SS2018 "Dirt" Heavy Drop-Crotch Bela Trousers',
    slug: 'rick-owens-ss18-dirt-bela-trousers',
    description: 'Sculptural dropped-crotch trousers crafted from TE crisp cotton weave. Features the exaggerated industrial silver front zip fly with dual press studs and signature elongated parchment cotton drawstring.',
    brand: 'Rick Owens',
    gender: 'UNISEX',
    priceBDT: 115000,
    cogsBDT: 62000,
    originalRetailBDT: 140000,
    condition: 'EXCELLENT_VINTAGE',
    era: 'MODERN',
    authenticityStatus: 'VERIFIED',
    authenticityNotes: 'Worn twice for editorial photoshoot. Pristine crisp fabric hand with no knee bagging.',
    wearDetails: {
      fabricIntegrity: 98,
      seamTension: 98,
      hardwarePatina: 97,
      labelLegibility: 99,
      defectsSummary: 'Negligible micro-linting on inside pocket bag.'
    },
    measurements: {
      waistIn: 32.0,
      riseIn: 21.0,
      inseamIn: 27.5,
      legOpeningIn: 8.5
    },
    images: [
      'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=1200&q=80'
    ],
    status: 'ACTIVE',
    isUniquePiece: true,
    categoryId: 'cat_trousers',
    categoryName: 'Trousers',
    sizeTag: 'IT 48 (Waist 31-33)',
    colorway: '09 Black',
    composition: '97% Cotton, 3% Elastane (TE Fabric)',
    madeIn: 'Italy',
    createdAt: new Date('2026-08-15T11:45:00Z').toISOString(),
    updatedAt: new Date('2026-08-15T11:45:00Z').toISOString()
  },
  {
    id: 'prod_undercover_05',
    sku: 'UCVR-DEN-2005-55A1',
    title: 'SS2005 "But Beautiful II" 85 68 Yarn-Darned Denim',
    slug: 'undercover-ss2005-85-denim',
    description: 'Jun Takahashi masterpiece from the But Beautiful II collection. Featuring obsessive sashiko stitching, raw thread loops, customized hand-distressing, and asymmetric patchwork repairs. One of the top 5 vintage denim pieces in streetwear history.',
    brand: 'Undercover',
    gender: 'MEN',
    priceBDT: 260000,
    cogsBDT: 145000,
    originalRetailBDT: 310000,
    condition: 'MINOR_FLAWS',
    era: 'Y2K',
    authenticityStatus: 'VERIFIED',
    authenticityNotes: 'All archival hand-stitched yarns intact; verified factory distressing.',
    wearDetails: {
      fabricIntegrity: 95,
      seamTension: 96,
      hardwarePatina: 90,
      labelLegibility: 88,
      defectsSummary: 'Archival wear pattern consistent with Jun Takahashi original distressing.'
    },
    measurements: {
      waistIn: 31.5,
      riseIn: 10.5,
      inseamIn: 33.0,
      legOpeningIn: 7.2
    },
    images: [
      'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=1200&q=80'
    ],
    status: 'ACTIVE',
    isUniquePiece: true,
    categoryId: 'cat_denim',
    categoryName: 'Archival Denim',
    sizeTag: 'Size 2 (Waist 31)',
    colorway: 'Indigo Wash / Multi-Color Thread',
    composition: '100% Japanese Selvedge Cotton Denim',
    madeIn: 'Japan',
    createdAt: new Date('2026-08-16T16:00:00Z').toISOString(),
    updatedAt: new Date('2026-08-16T16:00:00Z').toISOString()
  },
  {
    id: 'prod_prada_06',
    sku: 'PRDA-OUT-1999-98F1',
    title: 'FW1999 Linea Rossa GORE-TEX Storm Balaclava Jacket',
    slug: 'prada-sport-fw1999-linea-rossa-balaclava',
    description: 'Archival Prada Sport technical jacket from late 90s minimalism. Features the signature red latex tab at the cuff, integrated zip-out wind storm hood balaclava, taped waterproof seams, and ergonomic articulated elbow sleeves.',
    brand: 'Prada Sport',
    gender: 'MEN',
    priceBDT: 175000,
    cogsBDT: 85000,
    originalRetailBDT: 210000,
    condition: 'EXCELLENT_VINTAGE',
    era: 'ERA_90S',
    authenticityStatus: 'VERIFIED',
    authenticityNotes: 'Taped seams fully bonded with no delamination. Red rubber logo tab crisp.',
    wearDetails: {
      fabricIntegrity: 96,
      seamTension: 97,
      hardwarePatina: 93,
      labelLegibility: 95,
      defectsSummary: 'Minor micro-creasing on inner fleece neck guard.'
    },
    measurements: {
      chestWidthIn: 22.5,
      lengthIn: 27.0,
      shoulderWidthIn: 19.5,
      sleeveLengthIn: 26.0
    },
    images: [
      'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=1200&q=80'
    ],
    status: 'ACTIVE',
    isUniquePiece: true,
    categoryId: 'cat_outerwear',
    categoryName: 'Outerwear',
    sizeTag: 'IT 50 (Fits Slim L)',
    colorway: 'Matte Anthracite Gray',
    composition: '3-Layer GORE-TEX Polyamide Membrane',
    madeIn: 'Italy',
    createdAt: new Date('2026-08-18T12:20:00Z').toISOString(),
    updatedAt: new Date('2026-08-18T12:20:00Z').toISOString()
  },
  {
    id: 'prod_chrome_07',
    sku: 'CHRM-JEW-2015-88BC',
    title: 'Heavy .925 Sterling Silver Dagger ID Bracelet',
    slug: 'chrome-hearts-dagger-id-bracelet',
    description: 'Substantial 128-gram solid sterling silver link bracelet featuring the iconic sculpted dagger hallmark across the central curved box clasp plate. Hand-chiseled lettering and deep blackened oxidization.',
    brand: 'Chrome Hearts',
    gender: 'UNISEX',
    priceBDT: 295000,
    cogsBDT: 168000,
    originalRetailBDT: 340000,
    condition: 'EXCELLENT_VINTAGE',
    era: 'MODERN',
    authenticityStatus: 'VERIFIED',
    authenticityNotes: 'Crisp hand-engraved hallmarks: 1995, .925, and CH script. Solid slide-lock mechanism.',
    wearDetails: {
      fabricIntegrity: 100,
      seamTension: 100,
      hardwarePatina: 94,
      labelLegibility: 98,
      defectsSummary: 'Rich authentic patina in crevices; hand-polished silver surface.'
    },
    measurements: {
      lengthIn: 8.25,
      chestWidthIn: 0.65
    },
    images: [
      'https://images.unsplash.com/photo-1611591475155-42e9fba5ce55?auto=format&fit=crop&w=1200&q=80'
    ],
    status: 'ACTIVE',
    isUniquePiece: true,
    categoryId: 'cat_silver',
    categoryName: 'Sterling Silver Jewelry',
    sizeTag: '13-Link Standard (7.5" - 8.25" Wrist)',
    colorway: 'Antique Oxidized Silver',
    composition: '.925 Solid Sterling Silver (128 Grams)',
    madeIn: 'United States',
    createdAt: new Date('2026-08-19T15:10:00Z').toISOString(),
    updatedAt: new Date('2026-08-19T15:10:00Z').toISOString()
  },
  {
    id: 'prod_yohji_08',
    sku: 'YOHJ-RTW-1996-22DF',
    title: 'SS1996 Pour Homme Draped Deconstructed Gabardine Blazer',
    slug: 'yohji-yamamoto-1996-gabardine-blazer',
    description: 'Poetic unstructured tailoring cut from signature high-twist 100/2 wool gabardine that flows with unmatched fluid movement. Dual off-center horn buttons, raw hand-basted shoulder pads, and deep internal archivist pockets.',
    brand: 'Yohji Yamamoto',
    gender: 'MEN',
    priceBDT: 185000,
    cogsBDT: 92000,
    originalRetailBDT: 225000,
    condition: 'EXCELLENT_VINTAGE',
    era: 'ERA_90S',
    authenticityStatus: 'VERIFIED',
    authenticityNotes: 'Flawless wool drape with no shine. All original engraved buffalo horn buttons intact.',
    wearDetails: {
      fabricIntegrity: 98,
      seamTension: 99,
      hardwarePatina: 96,
      labelLegibility: 97,
      defectsSummary: 'Stored in climate-guarded cedar archive vault in Dhaka.'
    },
    measurements: {
      chestWidthIn: 24.5,
      lengthIn: 32.5,
      shoulderWidthIn: 21.0,
      sleeveLengthIn: 25.5
    },
    images: [
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1200&q=80'
    ],
    status: 'ACTIVE',
    isUniquePiece: true,
    categoryId: 'cat_outerwear',
    categoryName: 'Outerwear',
    sizeTag: 'Size 3 (Relaxed 48-52)',
    colorway: 'Signature Crow Black',
    composition: '100% High-Twist Wool Gabardine, Cupro Lining',
    madeIn: 'Japan',
    createdAt: new Date('2026-08-20T17:40:00Z').toISOString(),
    updatedAt: new Date('2026-08-20T17:40:00Z').toISOString()
  },
  {
    id: 'prod_celine_09',
    sku: 'CELN-DRS-2017-8B1A',
    title: 'SS2017 Pleated Silk Georgette Asymmetrical Midi Dress',
    slug: 'celine-phoebe-philo-ss2017-pleated-silk-dress',
    description: 'Iconic Phoebe Philo era Céline masterpiece from Summer 2017. Cut from featherweight silk georgette with micro-knife accordion pleating and fluid bias-draped hemline. Pristine archival condition with internal silk crepe slip lining.',
    brand: 'Céline by Phoebe Philo',
    gender: 'WOMEN',
    priceBDT: 245000,
    cogsBDT: 135000,
    originalRetailBDT: 310000,
    condition: 'EXCELLENT_VINTAGE',
    era: 'MODERN',
    authenticityStatus: 'VERIFIED',
    authenticityNotes: 'Complete branded mother-of-pearl rear neck loop buttons; internal Céline Paris grosgrain tag verified.',
    wearDetails: {
      fabricIntegrity: 99,
      seamTension: 100,
      hardwarePatina: 98,
      labelLegibility: 100,
      defectsSummary: 'Archival museum vault preservation; zero silk pulls or hem fraying.'
    },
    measurements: {
      chestWidthIn: 18.0,
      waistIn: 15.5,
      lengthIn: 48.0,
      shoulderWidthIn: 15.0
    },
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80'
    ],
    status: 'ACTIVE',
    isUniquePiece: true,
    categoryId: 'cat_dresses',
    categoryName: 'Dresses',
    sizeTag: 'FR 38 (US Women 4-6)',
    colorway: 'Soft Mint Green / Sage',
    composition: '100% Mulberry Silk Georgette, Silk Crepe Slip',
    madeIn: 'France',
    createdAt: new Date('2026-08-21T11:00:00Z').toISOString(),
    updatedAt: new Date('2026-08-21T11:00:00Z').toISOString()
  },
  {
    id: 'prod_chanel_10',
    sku: 'CHAN-JKT-1996-5C9D',
    title: '1996 Autumn Runway Pastel Mint Tweed Bouclé Cropped Jacket',
    slug: 'chanel-1996-pastel-mint-tweed-jacket',
    description: 'Rare Karl Lagerfeld archival Chanel piece from Autumn 1996. Woven from pastel mint, cream, and lavender bouclé tweed ribbons with hand-applied braided fringe borders and 24K gold-plated lion head CC Gripoix buttons.',
    brand: 'Chanel',
    gender: 'WOMEN',
    priceBDT: 420000,
    cogsBDT: 260000,
    originalRetailBDT: 520000,
    condition: 'EXCELLENT_VINTAGE',
    era: 'ERA_90S',
    authenticityStatus: 'VERIFIED',
    authenticityNotes: 'Heavy signature interior hem weighted brass chain verified. Chanel 96A label intact.',
    wearDetails: {
      fabricIntegrity: 97,
      seamTension: 98,
      hardwarePatina: 95,
      labelLegibility: 96,
      defectsSummary: 'Pristine bouclé texture; interior camellia silk lining clean.'
    },
    measurements: {
      chestWidthIn: 19.0,
      lengthIn: 21.0,
      shoulderWidthIn: 16.0,
      sleeveLengthIn: 23.5
    },
    images: [
      'https://images.unsplash.com/photo-1548624149-f9b1859aa9d0?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=80'
    ],
    status: 'ACTIVE',
    isUniquePiece: true,
    categoryId: 'cat_outerwear',
    categoryName: 'Jackets & Coats',
    sizeTag: 'FR 38 (Small)',
    colorway: 'Pastel Mint & Lavender Cream Tweed',
    composition: 'Wool, Mohair, Silk Tweed Blend with 100% Silk Camellia Jacquard Lining',
    madeIn: 'France',
    createdAt: new Date('2026-08-22T13:30:00Z').toISOString(),
    updatedAt: new Date('2026-08-22T13:30:00Z').toISOString()
  },
  {
    id: 'prod_prada_11',
    sku: 'PRDA-SKT-2022-77AA',
    title: 'Re-Nylon High-Waisted Accordion Pleat Midi Skirt',
    slug: 'prada-re-nylon-pleated-midi-skirt',
    description: 'Contemporary architectural tailoring from Miuccia Prada & Raf Simons. Constructed from sustainable regenerated ocean nylon with structured permanent heat-set knife pleats and iconic enamelled metal triangle logo plaque.',
    brand: 'Prada',
    gender: 'WOMEN',
    priceBDT: 135000,
    cogsBDT: 74000,
    originalRetailBDT: 175000,
    condition: 'BRAND_NEW_TAGS',
    era: 'MODERN',
    authenticityStatus: 'VERIFIED',
    authenticityNotes: 'Enamel triangle plaque rivets verified. Original Milano tags attached.',
    wearDetails: {
      fabricIntegrity: 100,
      seamTension: 100,
      hardwarePatina: 100,
      labelLegibility: 100,
      defectsSummary: 'Deadstock condition; flawless crisp pleating.'
    },
    measurements: {
      waistIn: 27.0,
      lengthIn: 31.5
    },
    images: [
      'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=1200&q=80'
    ],
    status: 'ACTIVE',
    isUniquePiece: true,
    categoryId: 'cat_skirts',
    categoryName: 'Skirts',
    sizeTag: 'IT 40 (Waist 26-28)',
    colorway: 'Signature Prada Nero Black',
    composition: '100% Regenerated Econyl Nylon Gabardine',
    madeIn: 'Italy',
    createdAt: new Date('2026-08-23T15:00:00Z').toISOString(),
    updatedAt: new Date('2026-08-23T15:00:00Z').toISOString()
  },
  {
    id: 'prod_khaite_12',
    sku: 'KHTE-KNT-2023-99CC',
    title: '"The Scarlet" Heavyweight Ribbed Cashmere Cardigan',
    slug: 'khaite-the-scarlet-cashmere-cardigan',
    description: 'The defining luxury knit of the modern wardrobe. Spun from ultra-plush 7-gauge Mongolian cashmere with wide architectural fisherman ribbing, deep V-neckline, horn buttons, and exaggerated flared sleeves.',
    brand: 'Khaite',
    gender: 'WOMEN',
    priceBDT: 165000,
    cogsBDT: 95000,
    originalRetailBDT: 215000,
    condition: 'EXCELLENT_VINTAGE',
    era: 'MODERN',
    authenticityStatus: 'VERIFIED',
    authenticityNotes: 'Dense heavy gauge cashmere with no pilling; verified genuine horn buttons.',
    wearDetails: {
      fabricIntegrity: 98,
      seamTension: 100,
      hardwarePatina: 98,
      labelLegibility: 99,
      defectsSummary: 'Gently handled for one seasonal campaign; stored folded flat in cedar.'
    },
    measurements: {
      chestWidthIn: 22.0,
      lengthIn: 25.5,
      shoulderWidthIn: 20.0,
      sleeveLengthIn: 24.0
    },
    images: [
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=1200&q=80'
    ],
    status: 'ACTIVE',
    isUniquePiece: true,
    categoryId: 'cat_knitwear',
    categoryName: 'Knitwear',
    sizeTag: 'Size S (Relaxed Drape)',
    colorway: 'Oatmeal Heather / Ecru',
    composition: '100% Grade-A Mongolian Cashmere (7-Gauge)',
    madeIn: 'Mongolia / Italy',
    createdAt: new Date('2026-08-24T16:15:00Z').toISOString(),
    updatedAt: new Date('2026-08-24T16:15:00Z').toISOString()
  },
  {
    id: 'prod_ysl_13',
    sku: 'YSL-TOP-2016-11FF',
    title: 'Sheer Silk Georgette Lavallière Pussy-Bow Blouse',
    slug: 'saint-laurent-silk-lavalliere-blouse',
    description: 'Hedi Slimane era Saint Laurent Paris rock-chic silhouette. Crafted in Lyon from featherweight translucent black silk georgette with sweeping elongated tie scarf collar, French cuffs, and mother-of-pearl buttons.',
    brand: 'Saint Laurent',
    gender: 'WOMEN',
    priceBDT: 98000,
    cogsBDT: 52000,
    originalRetailBDT: 140000,
    condition: 'BRAND_NEW_TAGS',
    era: 'MODERN',
    authenticityStatus: 'VERIFIED',
    authenticityNotes: 'Original Saint Laurent Paris hanger and tags present. MOP button hallmarks intact.',
    wearDetails: {
      fabricIntegrity: 100,
      seamTension: 100,
      hardwarePatina: 100,
      labelLegibility: 100,
      defectsSummary: 'Deadstock condition; pristine silk weave.'
    },
    measurements: {
      chestWidthIn: 18.5,
      lengthIn: 26.0,
      shoulderWidthIn: 15.0,
      sleeveLengthIn: 25.0
    },
    images: [
      'https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&w=1200&q=80'
    ],
    status: 'ACTIVE',
    isUniquePiece: true,
    categoryId: 'cat_tops',
    categoryName: 'Tops & Shirts',
    sizeTag: 'FR 36 (US 2-4)',
    colorway: 'Midnight Sheer Noir',
    composition: '100% Silk Mousseline Georgette',
    madeIn: 'France',
    createdAt: new Date('2026-08-25T12:00:00Z').toISOString(),
    updatedAt: new Date('2026-08-25T12:00:00Z').toISOString()
  },
  {
    id: 'prod_tabi_15',
    sku: 'MM6-SHO-2022-44BB',
    title: 'Artisanal Split-Toe Tabi Ballerina Flats in Nappa',
    slug: 'maison-margiela-tabi-ballerina-flats',
    description: 'The defining silhouette of Maison Margiela avant-garde footwear. Handcrafted in Italy from buttery soft lambskin nappa featuring the signature Japanese split toe, delicate leather bow accent, and signature white arch stitch on the heel.',
    brand: 'Maison Margiela',
    gender: 'WOMEN',
    priceBDT: 110000,
    cogsBDT: 65000,
    originalRetailBDT: 145000,
    condition: 'EXCELLENT_VINTAGE',
    era: 'MODERN',
    authenticityStatus: 'VERIFIED',
    authenticityNotes: 'Margiela numbered shoe sole stamped; Vibram half-sole applied for archival protection.',
    wearDetails: {
      fabricIntegrity: 98,
      seamTension: 100,
      hardwarePatina: 99,
      labelLegibility: 100,
      defectsSummary: 'Pristine upper nappa; no creasing across split toe box.'
    },
    measurements: {
      lengthIn: 10.0,
      chestWidthIn: 3.5
    },
    images: [
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1200&q=80'
    ],
    status: 'ACTIVE',
    isUniquePiece: true,
    categoryId: 'cat_footwear',
    categoryName: 'Shoes',
    sizeTag: 'EU 38 (US Women 7.5-8)',
    colorway: 'Chalk White / Gesso',
    composition: '100% Lambskin Nappa Leather, Calf Leather Sole',
    madeIn: 'Italy',
    createdAt: new Date('2026-08-26T14:45:00Z').toISOString(),
    updatedAt: new Date('2026-08-26T14:45:00Z').toISOString()
  },
  {
    id: 'prod_numbernine_17',
    sku: 'NNIN-TOP-2002-33AA',
    title: 'AW2002 "Nowhere Man" George Harrison Graphic T-Shirt',
    slug: 'number-nine-aw2002-nowhere-man-tshirt',
    description: 'Takahiro Miyashita seminal rock archive tee from the iconic Autumn/Winter 2002 "Nowhere Man" runway. Features heavy enzyme wash distressed jersey, hand-applied bullet-hole perforations, and signature dual tonal armhole ventilation eyelets.',
    brand: 'Number (N)ine',
    gender: 'MEN',
    priceBDT: 45000,
    cogsBDT: 22000,
    originalRetailBDT: 65000,
    condition: 'EXCELLENT_VINTAGE',
    era: 'Y2K',
    authenticityStatus: 'VERIFIED',
    authenticityNotes: 'Original woven music staff neck tag verified; authentic factory distressing by Takahiro Miyashita.',
    wearDetails: {
      fabricIntegrity: 96,
      seamTension: 98,
      hardwarePatina: 95,
      labelLegibility: 99,
      defectsSummary: 'Intentional factory collar distressing; zero aftermarket stains or shrinkage.'
    },
    measurements: {
      chestWidthIn: 21.0,
      lengthIn: 27.5,
      shoulderWidthIn: 18.5,
      sleeveLengthIn: 8.5
    },
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80'
    ],
    status: 'ACTIVE',
    isUniquePiece: true,
    categoryId: 'cat_tops',
    categoryName: 'T-Shirts',
    sizeTag: 'Size 3 (Medium / Slim Large)',
    colorway: 'Faded Charcoal Washed Black',
    composition: '100% Japanese Slub Cotton Jersey',
    madeIn: 'Japan',
    createdAt: new Date('2026-08-27T10:00:00Z').toISOString(),
    updatedAt: new Date('2026-08-27T10:00:00Z').toISOString()
  },
  {
    id: 'prod_helmut_18',
    sku: 'HLMT-DEN-1998-77BB',
    title: '1998 Painter Jeans in Raw Mylar Coated Indigo Denim',
    slug: 'helmut-lang-1998-classic-raw-painter-jeans',
    description: 'The archetype of high-fashion utilitarian denim designed by Helmut Lang in 1998. Straight classic 5-pocket cut crafted from rigid Italian selvedge denim with original artisanal white gesso paint splatter across the thighs and rear pockets.',
    brand: 'Helmut Lang',
    gender: 'MEN',
    priceBDT: 140000,
    cogsBDT: 78000,
    originalRetailBDT: 180000,
    condition: 'EXCELLENT_VINTAGE',
    era: 'ERA_90S',
    authenticityStatus: 'VERIFIED',
    authenticityNotes: 'Original 1998 classic cut Helmut Lang jeans tag; verified original factory paint application.',
    wearDetails: {
      fabricIntegrity: 99,
      seamTension: 100,
      hardwarePatina: 97,
      labelLegibility: 98,
      defectsSummary: 'Pristine raw hand; no heel drag or selvedge cuff fraying.'
    },
    measurements: {
      waistIn: 32.0,
      riseIn: 11.0,
      inseamIn: 32.5,
      legOpeningIn: 8.0
    },
    images: [
      'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=1200&q=80'
    ],
    status: 'ACTIVE',
    isUniquePiece: true,
    categoryId: 'cat_denim',
    categoryName: 'Jeans',
    sizeTag: 'Waist 32 / Length 32',
    colorway: 'Raw Deep Indigo with White Paint',
    composition: '100% Cotton Rigid Italian Selvedge Denim',
    madeIn: 'Italy',
    createdAt: new Date('2026-08-28T12:00:00Z').toISOString(),
    updatedAt: new Date('2026-08-28T12:00:00Z').toISOString()
  }
];
