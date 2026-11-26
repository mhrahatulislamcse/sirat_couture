import { GarmentMeasurements, Gender, Product } from '../types/resale';

export type GarmentType = 'TOPS_OUTERWEAR' | 'BOTTOMS' | 'FOOTWEAR' | 'ACCESSORIES';

export interface SizeEquivalenceRow {
  alpha: string;
  us: string;
  eu: string;
  uk: string;
  jp: string;
  metricRangeIn: string;
  metricRangeCm: string;
  isGarmentMatch?: boolean;
}

export interface CalculatedGarmentSize {
  garmentType: GarmentType;
  primaryMetricName: string;
  primaryValueIn: number;
  primaryValueCm: number;
  circumferenceIn?: number;
  circumferenceCm?: number;
  matchedRow: SizeEquivalenceRow;
  conversionMatrix: SizeEquivalenceRow[];
  fitAdvisory: string;
  tagComparison: string;
}

/**
 * Determine the garment type from product category and measurements.
 */
export function determineGarmentType(product: Product): GarmentType {
  const cat = (product.categoryName || product.categoryId || '').toLowerCase();
  
  if (
    cat.includes('boot') ||
    cat.includes('shoe') ||
    cat.includes('footwear') ||
    cat.includes('derb') ||
    cat.includes('loafer') ||
    cat.includes('sneaker')
  ) {
    return 'FOOTWEAR';
  }

  if (
    cat.includes('trouser') ||
    cat.includes('pant') ||
    cat.includes('denim') ||
    cat.includes('skirt') ||
    cat.includes('jean') ||
    cat.includes('short')
  ) {
    return 'BOTTOMS';
  }

  if (
    cat.includes('bag') ||
    cat.includes('tote') ||
    cat.includes('leather') ||
    cat.includes('eyewear') ||
    cat.includes('silver') ||
    cat.includes('jewelry') ||
    cat.includes('belt') ||
    cat.includes('scarf')
  ) {
    return 'ACCESSORIES';
  }

  // Default to Tops / Outerwear / Suiting / Knitwear / Dresses
  return 'TOPS_OUTERWEAR';
}

/**
 * Standard International Sizing Matrix for Tops / Outerwear (Men / Unisex)
 */
const MEN_TOPS_MATRIX: Omit<SizeEquivalenceRow, 'isGarmentMatch'>[] = [
  { alpha: 'XS', us: '34', eu: '44', uk: '34', jp: '1 (S)', metricRangeIn: '34" - 36"', metricRangeCm: '86 - 91 cm' },
  { alpha: 'S', us: '36', eu: '46', uk: '36', jp: '2 (M)', metricRangeIn: '36" - 38"', metricRangeCm: '91 - 97 cm' },
  { alpha: 'M', us: '38 - 40', eu: '48 - 50', uk: '38 - 40', jp: '3 (L)', metricRangeIn: '38" - 41"', metricRangeCm: '97 - 104 cm' },
  { alpha: 'L', us: '42', eu: '52', uk: '42', jp: '4 (XL)', metricRangeIn: '41" - 44"', metricRangeCm: '104 - 112 cm' },
  { alpha: 'XL', us: '44', eu: '54', uk: '44', jp: '5 (XXL)', metricRangeIn: '44" - 47"', metricRangeCm: '112 - 119 cm' },
  { alpha: 'XXL+', us: '46 - 48', eu: '56 - 58', uk: '46 - 48', jp: '6 (3XL)', metricRangeIn: '47"+', metricRangeCm: '119+ cm' },
];

/**
 * Standard International Sizing Matrix for Tops / Outerwear (Women)
 */
const WOMEN_TOPS_MATRIX: Omit<SizeEquivalenceRow, 'isGarmentMatch'>[] = [
  { alpha: 'XS', us: '0 - 2', eu: '34 - 36 (IT 38)', uk: '4 - 6', jp: '5 - 7', metricRangeIn: '30" - 32"', metricRangeCm: '76 - 81 cm' },
  { alpha: 'S', us: '4 - 6', eu: '36 - 38 (IT 40)', uk: '8 - 10', jp: '7 - 9', metricRangeIn: '32" - 34.5"', metricRangeCm: '81 - 88 cm' },
  { alpha: 'M', us: '8 - 10', eu: '38 - 40 (IT 42)', uk: '10 - 12', jp: '9 - 11', metricRangeIn: '34.5" - 37.5"', metricRangeCm: '88 - 95 cm' },
  { alpha: 'L', us: '12 - 14', eu: '42 - 44 (IT 46)', uk: '14 - 16', jp: '13 - 15', metricRangeIn: '37.5" - 40.5"', metricRangeCm: '95 - 103 cm' },
  { alpha: 'XL', us: '16', eu: '46 (IT 48)', uk: '18', jp: '17', metricRangeIn: '40.5"+', metricRangeCm: '103+ cm' },
];

/**
 * Standard International Sizing Matrix for Trousers & Pants (Men / Unisex)
 */
const MEN_BOTTOMS_MATRIX: Omit<SizeEquivalenceRow, 'isGarmentMatch'>[] = [
  { alpha: 'XS', us: '28 - 29', eu: '44', uk: '28 - 29', jp: '1', metricRangeIn: '28" - 29.5"', metricRangeCm: '71 - 75 cm' },
  { alpha: 'S', us: '30 - 31', eu: '46', uk: '30 - 31', jp: '2', metricRangeIn: '29.5" - 31.5"', metricRangeCm: '75 - 80 cm' },
  { alpha: 'M', us: '32 - 33', eu: '48', uk: '32 - 33', jp: '3', metricRangeIn: '31.5" - 33.5"', metricRangeCm: '80 - 85 cm' },
  { alpha: 'L', us: '34 - 35', eu: '50', uk: '34 - 35', jp: '4', metricRangeIn: '33.5" - 35.5"', metricRangeCm: '85 - 90 cm' },
  { alpha: 'XL', us: '36 - 37', eu: '52', uk: '36 - 37', jp: '5', metricRangeIn: '35.5" - 37.5"', metricRangeCm: '90 - 95 cm' },
  { alpha: 'XXL', us: '38+', eu: '54+', uk: '38+', jp: '6', metricRangeIn: '37.5"+', metricRangeCm: '95+ cm' },
];

/**
 * Standard International Sizing Matrix for Trousers & Bottoms (Women)
 */
const WOMEN_BOTTOMS_MATRIX: Omit<SizeEquivalenceRow, 'isGarmentMatch'>[] = [
  { alpha: 'XS', us: '24 - 25 (US 0-2)', eu: '34 - 36 (IT 38)', uk: '4 - 6', jp: '3 - 5', metricRangeIn: '24" - 25.5"', metricRangeCm: '61 - 65 cm' },
  { alpha: 'S', us: '26 - 27 (US 4)', eu: '36 - 38 (IT 40)', uk: '8', jp: '7', metricRangeIn: '25.5" - 27.5"', metricRangeCm: '65 - 70 cm' },
  { alpha: 'M', us: '28 - 29 (US 6-8)', eu: '38 - 40 (IT 42)', uk: '10', jp: '9', metricRangeIn: '27.5" - 29.5"', metricRangeCm: '70 - 75 cm' },
  { alpha: 'L', us: '30 - 31 (US 10)', eu: '40 - 42 (IT 44)', uk: '12', jp: '11', metricRangeIn: '29.5" - 31.5"', metricRangeCm: '75 - 80 cm' },
  { alpha: 'XL', us: '32+ (US 12+)', eu: '44+ (IT 46+)', uk: '14+', jp: '13', metricRangeIn: '31.5"+', metricRangeCm: '80+ cm' },
];

/**
 * Standard Footwear Conversion Matrix
 */
const FOOTWEAR_MATRIX: Omit<SizeEquivalenceRow, 'isGarmentMatch'>[] = [
  { alpha: 'EU 39', us: 'US Men 6.5 / Women 8', eu: 'IT/EU 39', uk: 'UK 5.5', jp: '24.5 cm', metricRangeIn: '9.6" insole', metricRangeCm: '24.5 cm' },
  { alpha: 'EU 40', us: 'US Men 7.5 / Women 9', eu: 'IT/EU 40', uk: 'UK 6.5', jp: '25.5 cm', metricRangeIn: '10.0" insole', metricRangeCm: '25.5 cm' },
  { alpha: 'EU 41', us: 'US Men 8.0 / Women 9.5', eu: 'IT/EU 41', uk: 'UK 7.0', jp: '26.0 cm', metricRangeIn: '10.2" insole', metricRangeCm: '26.0 cm' },
  { alpha: 'EU 42', us: 'US Men 9.0 / Women 10.5', eu: 'IT/EU 42', uk: 'UK 8.0', jp: '27.0 cm', metricRangeIn: '10.6" insole', metricRangeCm: '27.0 cm' },
  { alpha: 'EU 43', us: 'US Men 10.0 / Women 11.5', eu: 'IT/EU 43', uk: 'UK 9.0', jp: '28.0 cm', metricRangeIn: '11.0" insole', metricRangeCm: '28.0 cm' },
  { alpha: 'EU 44', us: 'US Men 11.0 / Women 12.5', eu: 'IT/EU 44', uk: 'UK 10.0', jp: '28.5 cm', metricRangeIn: '11.2" insole', metricRangeCm: '28.5 cm' },
  { alpha: 'EU 45', us: 'US Men 12.0 / Women 13.5', eu: 'IT/EU 45', uk: 'UK 11.0', jp: '29.5 cm', metricRangeIn: '11.6" insole', metricRangeCm: '29.5 cm' },
];

/**
 * Calculate the exact size equivalence and conversion matrix for a product.
 */
export function calculateGarmentSizeEquivalents(product: Product): CalculatedGarmentSize {
  const gType = determineGarmentType(product);
  const isWomen = product.gender === 'WOMEN';
  const m = product.measurements || {};

  if (gType === 'FOOTWEAR') {
    // Sourced from sizeTag (e.g. IT 42, 41, etc.)
    const tag = (product.sizeTag || '').toUpperCase();
    let matchIndex = 3; // Default EU 42
    if (tag.includes('39')) matchIndex = 0;
    else if (tag.includes('40')) matchIndex = 1;
    else if (tag.includes('41')) matchIndex = 2;
    else if (tag.includes('42')) matchIndex = 3;
    else if (tag.includes('43')) matchIndex = 4;
    else if (tag.includes('44')) matchIndex = 5;
    else if (tag.includes('45')) matchIndex = 6;

    const matrix = FOOTWEAR_MATRIX.map((row, idx) => ({
      ...row,
      isGarmentMatch: idx === matchIndex,
    }));

    return {
      garmentType: 'FOOTWEAR',
      primaryMetricName: 'Insole Footwear Spec',
      primaryValueIn: parseFloat(matrix[matchIndex].metricRangeIn),
      primaryValueCm: parseFloat(matrix[matchIndex].metricRangeCm),
      matchedRow: matrix[matchIndex],
      conversionMatrix: matrix,
      fitAdvisory: 'Italian luxury cobbler sizing runs true to standard European designer lasts.',
      tagComparison: `Tagged ${product.sizeTag} matches standard European luxury scale.`,
    };
  }

  if (gType === 'BOTTOMS') {
    const rawWaist = m.waistIn || 0;
    // If waist is measured flat (e.g., 16 in), double it to get circumference (32 in).
    // If already recorded as circumference (e.g. 32 in), keep as-is.
    const effectiveWaistIn = rawWaist < 24 && rawWaist > 0 ? rawWaist * 2 : rawWaist;
    const effectiveWaistCm = Math.round(effectiveWaistIn * 2.54 * 10) / 10;
    const baseMatrix = isWomen ? WOMEN_BOTTOMS_MATRIX : MEN_BOTTOMS_MATRIX;

    let matchedIndex = 2; // Default M
    if (isWomen) {
      if (effectiveWaistIn < 25.5) matchedIndex = 0; // XS
      else if (effectiveWaistIn < 27.5) matchedIndex = 1; // S
      else if (effectiveWaistIn < 29.5) matchedIndex = 2; // M
      else if (effectiveWaistIn < 31.5) matchedIndex = 3; // L
      else matchedIndex = 4; // XL
    } else {
      if (effectiveWaistIn < 29.5) matchedIndex = 0; // XS
      else if (effectiveWaistIn < 31.5) matchedIndex = 1; // S
      else if (effectiveWaistIn < 33.5) matchedIndex = 2; // M
      else if (effectiveWaistIn < 35.5) matchedIndex = 3; // L
      else if (effectiveWaistIn < 37.5) matchedIndex = 4; // XL
      else matchedIndex = 5; // XXL
    }

    const conversionMatrix = baseMatrix.map((row, idx) => ({
      ...row,
      isGarmentMatch: idx === matchedIndex,
    }));

    const matchedRow = conversionMatrix[matchedIndex];
    const flatWaistDisplay = rawWaist < 24 && rawWaist > 0 ? rawWaist : Math.round(rawWaist / 2 * 10) / 10;

    // Check tag vs measurement fit advice
    let fitAdvisory = 'Fits true to tailored waist measurement.';
    const tagUpper = (product.sizeTag || '').toUpperCase();
    if (tagUpper.includes('46') && matchedRow.alpha === 'M') {
      fitAdvisory = 'Garment fits slightly relaxed compared to vintage tag (fits closer to modern EU 48).';
    } else if (tagUpper.includes('50') && matchedRow.alpha === 'M') {
      fitAdvisory = 'Garment fits slim/tailored compared to vintage tag.';
    }

    return {
      garmentType: 'BOTTOMS',
      primaryMetricName: 'Waist Circumference',
      primaryValueIn: flatWaistDisplay,
      primaryValueCm: Math.round(flatWaistDisplay * 2.54 * 10) / 10,
      circumferenceIn: effectiveWaistIn,
      circumferenceCm: effectiveWaistCm,
      matchedRow,
      conversionMatrix,
      fitAdvisory,
      tagComparison: `Flat waist is ${flatWaistDisplay}" (${effectiveWaistIn}" total circ.), aligning with ${matchedRow.alpha} (${matchedRow.eu} EU / ${matchedRow.us} US).`,
    };
  }

  // TOPS / OUTERWEAR / KNITWEAR / DRESSES / SUITING
  const pitToPitIn = m.chestWidthIn || 20; // Default to 20" if unspecified
  const chestCircIn = pitToPitIn * 2;
  const chestCircCm = Math.round(chestCircIn * 2.54 * 10) / 10;
  const baseMatrix = isWomen ? WOMEN_TOPS_MATRIX : MEN_TOPS_MATRIX;

  let matchedIndex = 2; // Default M
  if (isWomen) {
    if (chestCircIn < 32) matchedIndex = 0; // XS
    else if (chestCircIn < 34.5) matchedIndex = 1; // S
    else if (chestCircIn < 37.5) matchedIndex = 2; // M
    else if (chestCircIn < 40.5) matchedIndex = 3; // L
    else matchedIndex = 4; // XL
  } else {
    if (chestCircIn < 36) matchedIndex = 0; // XS
    else if (chestCircIn < 38.5) matchedIndex = 1; // S
    else if (chestCircIn < 41.5) matchedIndex = 2; // M
    else if (chestCircIn < 44.5) matchedIndex = 3; // L
    else if (chestCircIn < 47.5) matchedIndex = 4; // XL
    else matchedIndex = 5; // XXL+
  }

  const conversionMatrix = baseMatrix.map((row, idx) => ({
    ...row,
    isGarmentMatch: idx === matchedIndex,
  }));

  const matchedRow = conversionMatrix[matchedIndex];

  // Calculate fit comparison with tagged size
  let fitAdvisory = 'Garment measures true to international size standard.';
  const tagUpper = (product.sizeTag || '').toUpperCase();
  if (chestCircIn >= 48) {
    fitAdvisory = 'Substantial oversized runway silhouette; drops generous volume through the torso.';
  } else if (tagUpper.includes('XL') && matchedRow.alpha === 'M') {
    fitAdvisory = 'Fits significantly smaller than label suggests (vintage archive Japanese/Belgian cut).';
  } else if (tagUpper.includes('S') && (matchedRow.alpha === 'L' || matchedRow.alpha === 'XL')) {
    fitAdvisory = 'Designed with an intentional boxy drop-shoulder cut; measures like a modern L/XL.';
  }

  return {
    garmentType: 'TOPS_OUTERWEAR',
    primaryMetricName: 'Chest Circumference',
    primaryValueIn: pitToPitIn,
    primaryValueCm: Math.round(pitToPitIn * 2.54 * 10) / 10,
    circumferenceIn: chestCircIn,
    circumferenceCm: chestCircCm,
    matchedRow,
    conversionMatrix,
    fitAdvisory,
    tagComparison: `Pit-to-pit flat measurement is ${pitToPitIn}" (${chestCircIn}" chest), translating to standard ${matchedRow.alpha} (${matchedRow.eu} EU / ${matchedRow.us} US / ${matchedRow.jp} JP).`,
  };
}

export function getAllMatrices(gender: Gender) {
  return {
    tops: gender === 'WOMEN' ? WOMEN_TOPS_MATRIX : MEN_TOPS_MATRIX,
    bottoms: gender === 'WOMEN' ? WOMEN_BOTTOMS_MATRIX : MEN_BOTTOMS_MATRIX,
    footwear: FOOTWEAR_MATRIX,
  };
}
