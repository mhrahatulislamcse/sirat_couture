import { Product } from '../types/resale';

export interface LookRecommendation {
  product: Product;
  matchScore: number;
  matchReasons: string[];
  stylingRationale: string;
  paletteRelationship: string;
  archetypeSynergy: string;
}

// Brand archetype taxonomy clusters
const BRAND_ARCHETYPES: Record<string, string> = {
  // Antwerp & Avant-Garde Deconstruction
  'raf simons': 'ANTWERP_AVANT_GARDE',
  'maison margiela': 'ANTWERP_AVANT_GARDE',
  'rick owens': 'ANTWERP_AVANT_GARDE',
  'ann demeulemeester': 'ANTWERP_AVANT_GARDE',
  'dries van noten': 'ANTWERP_AVANT_GARDE',
  'dirk bikkembergs': 'ANTWERP_AVANT_GARDE',

  // Japanese Runway & Ura-Harajuku Streetwear
  'undercover': 'JAPANESE_ARCHIVE',
  'number (n)ine': 'JAPANESE_ARCHIVE',
  'yohji yamamoto': 'JAPANESE_ARCHIVE',
  'comme des garçons': 'JAPANESE_ARCHIVE',
  'issey miyake': 'JAPANESE_ARCHIVE',
  'visvim': 'JAPANESE_ARCHIVE',
  'bape': 'JAPANESE_ARCHIVE',
  'a bathing ape': 'JAPANESE_ARCHIVE',
  'neighborhood': 'JAPANESE_ARCHIVE',
  'wtaps': 'JAPANESE_ARCHIVE',
  'takahiro miyashita': 'JAPANESE_ARCHIVE',

  // Quiet Luxury & Modern Minimalist Tailoring
  'the row': 'QUIET_LUXURY_MINIMALISM',
  'khaite': 'QUIET_LUXURY_MINIMALISM',
  'jil sander': 'QUIET_LUXURY_MINIMALISM',
  'céline by phoebe philo': 'QUIET_LUXURY_MINIMALISM',
  'celine': 'QUIET_LUXURY_MINIMALISM',
  'lemaire': 'QUIET_LUXURY_MINIMALISM',
  'totême': 'QUIET_LUXURY_MINIMALISM',
  'bottega veneta': 'QUIET_LUXURY_MINIMALISM',

  // Technical Minimalist & Post-Industrial
  'prada': 'TECHNICAL_MINIMALISM',
  'prada sport': 'TECHNICAL_MINIMALISM',
  'helmut lang': 'TECHNICAL_MINIMALISM',
  'stone island': 'TECHNICAL_MINIMALISM',
  'c.p. company': 'TECHNICAL_MINIMALISM',
  'arc\'teryx': 'TECHNICAL_MINIMALISM',
  'arc\'teryx veilance': 'TECHNICAL_MINIMALISM',
  'acronym': 'TECHNICAL_MINIMALISM',

  // Heritage Couture & French Romanticism
  'chanel': 'HERITAGE_COUTURE',
  'saint laurent': 'HERITAGE_COUTURE',
  'yves saint laurent': 'HERITAGE_COUTURE',
  'christian dior': 'HERITAGE_COUTURE',
  'dior': 'HERITAGE_COUTURE',
  'hermès': 'HERITAGE_COUTURE',
  'balenciaga': 'HERITAGE_COUTURE',
  'givenchy': 'HERITAGE_COUTURE',

  // Gothic Silver & Artisanal Hardware
  'chrome hearts': 'GOTHIC_STERLING',
  'guidi': 'GOTHIC_STERLING',
  'werkstatt:münchen': 'GOTHIC_STERLING'
};

const ARCHETYPE_LABELS: Record<string, string> = {
  ANTWERP_AVANT_GARDE: 'Antwerp Six & Avant-Garde',
  JAPANESE_ARCHIVE: '90s Tokyo Ura-Harajuku Archive',
  QUIET_LUXURY_MINIMALISM: 'Pristine Quiet Luxury',
  TECHNICAL_MINIMALISM: 'Industrial Techwear & Utilitarian',
  HERITAGE_COUTURE: 'French Couture & Modern Tailoring',
  GOTHIC_STERLING: 'Artisanal Sterling Silver & Hardware',
  DEFAULT_ARCHIVAL: 'Curated Vault Relics'
};

// Color family classification
export type ColorFamily =
  | 'NOIR_MONOCHROME'
  | 'EARTH_UTILITY'
  | 'CHALK_MINIMAL'
  | 'INDIGO_DENIM'
  | 'MINT_PASTEL'
  | 'METALLIC_SILVER'
  | 'WARM_RICH'
  | 'MUTED_OTHER';

export function getColorFamily(colorway: string = ''): ColorFamily {
  const c = colorway.toLowerCase();
  if (
    c.includes('black') ||
    c.includes('noir') ||
    c.includes('charcoal') ||
    c.includes('anthracite') ||
    c.includes('gray') ||
    c.includes('grey') ||
    c.includes('nero') ||
    c.includes('09') ||
    c.includes('crow')
  ) {
    return 'NOIR_MONOCHROME';
  }
  if (
    c.includes('olive') ||
    c.includes('military') ||
    c.includes('khaki') ||
    c.includes('brown') ||
    c.includes('espresso') ||
    c.includes('saddle') ||
    c.includes('tan') ||
    c.includes('sand') ||
    c.includes('beige') ||
    c.includes('camel')
  ) {
    return 'EARTH_UTILITY';
  }
  if (
    c.includes('white') ||
    c.includes('bianchetto') ||
    c.includes('chalk') ||
    c.includes('cream') ||
    c.includes('ecru') ||
    c.includes('oatmeal') ||
    c.includes('gesso')
  ) {
    return 'CHALK_MINIMAL';
  }
  if (c.includes('indigo') || c.includes('denim') || c.includes('blue') || c.includes('navy')) {
    return 'INDIGO_DENIM';
  }
  if (c.includes('mint') || c.includes('sage') || c.includes('lavender') || c.includes('pastel')) {
    return 'MINT_PASTEL';
  }
  if (c.includes('silver') || c.includes('palladium') || c.includes('oxidized') || c.includes('metal')) {
    return 'METALLIC_SILVER';
  }
  if (c.includes('burgundy') || c.includes('red') || c.includes('gold') || c.includes('wine')) {
    return 'WARM_RICH';
  }
  return 'MUTED_OTHER';
}

// Major garment role classification
export type GarmentRole = 'TOP_OUTER' | 'BOTTOM' | 'ONE_PIECE' | 'FOOTWEAR' | 'ACCESSORY';

export function getGarmentRole(product: Product): GarmentRole {
  const cat = (product.categoryId || '').toLowerCase();
  const name = (product.categoryName || '').toLowerCase();
  const title = product.title.toLowerCase();

  if (
    cat.includes('dresses') ||
    name.includes('dress') ||
    title.includes('dress') ||
    title.includes('gown')
  ) {
    return 'ONE_PIECE';
  }

  if (
    cat.includes('trousers') ||
    cat.includes('denim') ||
    cat.includes('skirts') ||
    name.includes('trouser') ||
    name.includes('pant') ||
    name.includes('denim') ||
    name.includes('skirt') ||
    name.includes('jean') ||
    title.includes('trouser') ||
    title.includes('pant') ||
    title.includes('jean') ||
    title.includes('skirt')
  ) {
    return 'BOTTOM';
  }

  if (
    cat.includes('footwear') ||
    cat.includes('boots') ||
    cat.includes('derbies') ||
    cat.includes('sneakers') ||
    name.includes('footwear') ||
    name.includes('shoe') ||
    name.includes('boot') ||
    title.includes('boot') ||
    title.includes('tabi') ||
    title.includes('flat') ||
    title.includes('sneaker') ||
    title.includes('derby')
  ) {
    return 'FOOTWEAR';
  }

  if (
    cat.includes('bags') ||
    cat.includes('totes') ||
    cat.includes('crossbody') ||
    cat.includes('wallets') ||
    cat.includes('accessories') ||
    cat.includes('silver') ||
    cat.includes('belts') ||
    cat.includes('eyewear') ||
    cat.includes('scarves') ||
    name.includes('bag') ||
    name.includes('jewelry') ||
    name.includes('accessory') ||
    title.includes('bag') ||
    title.includes('tote') ||
    title.includes('bracelet') ||
    title.includes('ring') ||
    title.includes('belt')
  ) {
    return 'ACCESSORY';
  }

  return 'TOP_OUTER';
}

export function getBrandArchetype(brand: string): string {
  const clean = brand.toLowerCase().trim();
  for (const [key, archetype] of Object.entries(BRAND_ARCHETYPES)) {
    if (clean.includes(key) || key.includes(clean)) {
      return archetype;
    }
  }
  return 'DEFAULT_ARCHIVAL';
}

/**
 * Calculates outfit complementarity score between reference product and a candidate product.
 */
function scoreOutfitPair(
  target: Product,
  candidate: Product
): {
  score: number;
  reasons: string[];
  stylingRationale: string;
  paletteRelationship: string;
  archetypeSynergy: string;
} {
  let score = 0;
  const reasons: string[] = [];

  const targetRole = getGarmentRole(target);
  const candRole = getGarmentRole(candidate);

  const targetColorFamily = getColorFamily(target.colorway);
  const candColorFamily = getColorFamily(candidate.colorway);

  const targetArchetype = getBrandArchetype(target.brand);
  const candArchetype = getBrandArchetype(candidate.brand);

  // 1. OUTFIT COMPLEMENTARITY BONUS (Different silhouette roles)
  if (targetRole !== candRole) {
    if (
      (targetRole === 'TOP_OUTER' && candRole === 'BOTTOM') ||
      (targetRole === 'BOTTOM' && candRole === 'TOP_OUTER')
    ) {
      score += 45;
      reasons.push('Proportional Top & Bottom Balance');
    } else if (
      (targetRole === 'TOP_OUTER' && candRole === 'FOOTWEAR') ||
      (targetRole === 'FOOTWEAR' && candRole === 'TOP_OUTER')
    ) {
      score += 38;
      reasons.push('Sculptural Footwear Grounding');
    } else if (
      (targetRole === 'BOTTOM' && candRole === 'FOOTWEAR') ||
      (targetRole === 'FOOTWEAR' && candRole === 'BOTTOM')
    ) {
      score += 40;
      reasons.push('Complementary Hem-to-Boot Ratio');
    } else if (targetRole === 'ONE_PIECE') {
      if (candRole === 'FOOTWEAR') score += 45;
      else if (candRole === 'ACCESSORY') score += 40;
      else if (candRole === 'TOP_OUTER') score += 35;
      else score += 25;
      reasons.push('Editorial Silhouette Pairing');
    } else if (candRole === 'ACCESSORY' || targetRole === 'ACCESSORY') {
      score += 32;
      reasons.push('Curated Hardware & Leather Accent');
    } else {
      score += 25;
      reasons.push('Layered Outfit Composition');
    }
  } else {
    // Same category role: lower points unless accessories/outerwear layers
    if (targetRole === 'ACCESSORY' && candRole === 'ACCESSORY') {
      score += 15;
      reasons.push('Layered Metal & Leather Accent');
    } else {
      score += 5;
    }
  }

  // 2. BRAND ARCHETYPE & AESTHETIC HARMONY
  let archetypeSynergy = '';
  if (target.brand.toLowerCase() === candidate.brand.toLowerCase()) {
    score += 40;
    reasons.push(`Total ${target.brand} Runway Vision`);
    archetypeSynergy = `Complete ${target.brand} house silhouette continuity`;
  } else if (targetArchetype === candArchetype && targetArchetype !== 'DEFAULT_ARCHIVAL') {
    score += 32;
    const label = ARCHETYPE_LABELS[targetArchetype] || 'Shared Vision';
    reasons.push(`${label} Synergy`);
    archetypeSynergy = `Shared aesthetic philosophy in ${label.toLowerCase()}`;
  } else if (
    (targetArchetype === 'ANTWERP_AVANT_GARDE' && candArchetype === 'JAPANESE_ARCHIVE') ||
    (targetArchetype === 'JAPANESE_ARCHIVE' && candArchetype === 'ANTWERP_AVANT_GARDE')
  ) {
    score += 26;
    reasons.push('Antwerp & Tokyo Deconstruction Cross');
    archetypeSynergy = 'Deconstructed proportions bridging Belgian tailoring and Japanese archive';
  } else if (
    (targetArchetype === 'QUIET_LUXURY_MINIMALISM' && candArchetype === 'HERITAGE_COUTURE') ||
    (targetArchetype === 'HERITAGE_COUTURE' && candArchetype === 'QUIET_LUXURY_MINIMALISM')
  ) {
    score += 28;
    reasons.push('Couture & Quiet Luxury Harmony');
    archetypeSynergy = 'Understated sartorial elegance with museum-level craftsmanship';
  } else if (
    (targetArchetype === 'TECHNICAL_MINIMALISM' && candArchetype === 'ANTWERP_AVANT_GARDE') ||
    (targetArchetype === 'ANTWERP_AVANT_GARDE' && candArchetype === 'TECHNICAL_MINIMALISM')
  ) {
    score += 25;
    reasons.push('Post-Industrial Utilitarian Fusion');
    archetypeSynergy = 'Rigid functional textiles contrasted against fluid drape';
  } else if (candArchetype === 'GOTHIC_STERLING') {
    score += 24;
    reasons.push('Raw Sterling Silver Hardware Touch');
    archetypeSynergy = 'Sculptural precious metal puncturing clean textile lines';
  } else {
    score += 10;
    archetypeSynergy = 'Eclectic archival high-low styling contrast';
  }

  // 3. COLOR PALETTE HARMONY
  let paletteRelationship = '';
  if (targetColorFamily === candColorFamily) {
    score += 30;
    reasons.push(`Tonal ${targetColorFamily.replace('_', ' ')} Palette`);
    paletteRelationship = `Monochromatic resonance in ${target.colorway.split('/')[0].trim()} and ${candidate.colorway.split('/')[0].trim()}`;
  } else if (
    (targetColorFamily === 'NOIR_MONOCHROME' && candColorFamily === 'CHALK_MINIMAL') ||
    (targetColorFamily === 'CHALK_MINIMAL' && candColorFamily === 'NOIR_MONOCHROME')
  ) {
    score += 28;
    reasons.push('High-Contrast Bianchetto / Noir Dynamic');
    paletteRelationship = 'Classic archival dichotomy: stark chalkboard contrast';
  } else if (
    (targetColorFamily === 'NOIR_MONOCHROME' && candColorFamily === 'METALLIC_SILVER') ||
    (targetColorFamily === 'METALLIC_SILVER' && candColorFamily === 'NOIR_MONOCHROME')
  ) {
    score += 28;
    reasons.push('Oxidized Silver on Deep Noir');
    paletteRelationship = 'Heavy hand-chiseled silver gleaming against matte fabric drape';
  } else if (
    (targetColorFamily === 'EARTH_UTILITY' && candColorFamily === 'INDIGO_DENIM') ||
    (targetColorFamily === 'INDIGO_DENIM' && candColorFamily === 'EARTH_UTILITY')
  ) {
    score += 26;
    reasons.push('Military Olive & Raw Indigo Grounding');
    paletteRelationship = 'Utilitarian workwear harmony between washed earth tones and deep denim';
  } else if (
    (targetColorFamily === 'EARTH_UTILITY' && candColorFamily === 'NOIR_MONOCHROME') ||
    (targetColorFamily === 'NOIR_MONOCHROME' && candColorFamily === 'EARTH_UTILITY')
  ) {
    score += 24;
    reasons.push('Subdued Earth & Shadow Contrast');
    paletteRelationship = 'Deep weathered tones balancing organic field hues';
  } else if (
    (targetColorFamily === 'MINT_PASTEL' && candColorFamily === 'CHALK_MINIMAL') ||
    (targetColorFamily === 'CHALK_MINIMAL' && candColorFamily === 'MINT_PASTEL')
  ) {
    score += 28;
    reasons.push('Pastel Mint & Cream Harmony');
    paletteRelationship = 'Delicate runway palette: ethereal mint kissed with warm ivory';
  } else if (
    (targetColorFamily === 'EARTH_UTILITY' && candColorFamily === 'CHALK_MINIMAL') ||
    (targetColorFamily === 'CHALK_MINIMAL' && candColorFamily === 'EARTH_UTILITY')
  ) {
    score += 22;
    reasons.push('Oatmeal & Deep Espresso Warmth');
    paletteRelationship = 'Warm neutral depth between chalk highlights and rich leather grains';
  } else {
    score += 10;
    paletteRelationship = 'Curated tonal tension between unexpected color values';
  }

  // 4. GENDER / SILHOUETTE COMPATIBILITY
  if (target.gender === candidate.gender || candidate.gender === 'UNISEX' || target.gender === 'UNISEX') {
    score += 15;
  } else {
    score += 4; // Fluid styling allows cross-gender wear
  }

  // 5. ERA / DECADE HARMONY
  if (target.era === candidate.era) {
    score += 10;
    reasons.push(`Period-Correct ${target.era.replace('ERA_', '')} Provenance`);
  }

  // 6. AVAILABILITY BIAS (Active items prioritized)
  if (candidate.status === 'ACTIVE') {
    score += 12;
  }

  // 7. Generate a bespoke editorial styling rationale
  const targetLabel = target.brand;
  const candLabel = candidate.brand;
  const targetSnippet = target.title.split('"')[1] || target.title.split(' ')[0];
  const candSnippet = candidate.title.split('"')[1] || candidate.title.split(' ')[0];

  const stylingRationale = `${candLabel} ${candSnippet} complements the ${targetLabel} silhouette through ${paletteRelationship.toLowerCase()} and ${archetypeSynergy.toLowerCase()}.`;

  return {
    score,
    reasons,
    stylingRationale,
    paletteRelationship,
    archetypeSynergy
  };
}

/**
 * Returns 3 complementary products from the provided catalog for the given target product.
 */
export function getComplementaryLook(
  targetProduct: Product,
  allProducts: Product[]
): LookRecommendation[] {
  if (!targetProduct || !Array.isArray(allProducts) || allProducts.length <= 1) {
    return [];
  }

  // Exclude current piece
  const candidates = allProducts.filter((p) => p.id !== targetProduct.id);
  if (candidates.length === 0) return [];

  // Score each candidate
  const scoredCandidates = candidates.map((candidate) => {
    const analysis = scoreOutfitPair(targetProduct, candidate);
    return {
      product: candidate,
      matchScore: analysis.score,
      matchReasons: analysis.reasons,
      stylingRationale: analysis.stylingRationale,
      paletteRelationship: analysis.paletteRelationship,
      archetypeSynergy: analysis.archetypeSynergy
    };
  });

  // Sort by match score descending
  scoredCandidates.sort((a, b) => b.matchScore - a.matchScore);

  // To build a genuine editorial "Complete the Look" ensemble (e.g. Top + Bottom + Shoes or Top + Bag + Trouser),
  // select candidates with diverse garment roles whenever possible!
  const selected: LookRecommendation[] = [];
  const chosenRoles = new Set<string>();

  // Pass 1: Select the highest-scoring candidate for each distinct garment role
  for (const item of scoredCandidates) {
    const role = getGarmentRole(item.product);
    if (!chosenRoles.has(role)) {
      selected.push(item);
      chosenRoles.add(role);
      if (selected.length === 3) break;
    }
  }

  // Pass 2: If we couldn't get 3 distinct roles, fill remaining slots from the highest scoring candidates
  if (selected.length < 3) {
    for (const item of scoredCandidates) {
      if (!selected.some((s) => s.product.id === item.product.id)) {
        selected.push(item);
        if (selected.length === 3) break;
      }
    }
  }

  return selected.slice(0, 3);
}
