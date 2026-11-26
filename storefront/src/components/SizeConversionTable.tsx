import React, { useState } from 'react';
import {
  Globe,
  Ruler,
  CheckCircle,
  HelpCircle,
  ArrowRightLeft,
  Sparkles,
  Info
} from 'lucide-react';
import { Product } from '../types/resale';
import {
  calculateGarmentSizeEquivalents,
  determineGarmentType,
  getAllMatrices,
  GarmentType,
  SizeEquivalenceRow,
} from '../utils/sizeConversion';

interface SizeConversionTableProps {
  product: Product;
  unit: 'INCHES' | 'CM';
  onUnitToggle?: (unit: 'INCHES' | 'CM') => void;
}

export const SizeConversionTable: React.FC<SizeConversionTableProps> = ({
  product,
  unit,
  onUnitToggle,
}) => {
  const [internalUnit, setInternalUnit] = useState<'INCHES' | 'CM'>(unit);
  const currentUnit = onUnitToggle ? unit : internalUnit;

  const handleToggleUnit = (newUnit: 'INCHES' | 'CM') => {
    if (onUnitToggle) {
      onUnitToggle(newUnit);
    } else {
      setInternalUnit(newUnit);
    }
  };

  const calculated = calculateGarmentSizeEquivalents(product);
  const defaultGarmentType = determineGarmentType(product);
  const [activeCategoryTab, setActiveCategoryTab] = useState<GarmentType>(
    defaultGarmentType === 'ACCESSORIES' ? 'TOPS_OUTERWEAR' : defaultGarmentType
  );

  const matrices = getAllMatrices(product.gender);

  // Pick rows according to active tab
  let displayRows: SizeEquivalenceRow[] = [];
  if (activeCategoryTab === 'FOOTWEAR') {
    displayRows = matrices.footwear.map(r => ({
      ...r,
      isGarmentMatch: calculated.garmentType === 'FOOTWEAR' && calculated.matchedRow.alpha === r.alpha,
    }));
  } else if (activeCategoryTab === 'BOTTOMS') {
    displayRows = matrices.bottoms.map(r => ({
      ...r,
      isGarmentMatch: calculated.garmentType === 'BOTTOMS' && calculated.matchedRow.alpha === r.alpha,
    }));
  } else {
    displayRows = matrices.tops.map(r => ({
      ...r,
      isGarmentMatch: calculated.garmentType === 'TOPS_OUTERWEAR' && calculated.matchedRow.alpha === r.alpha,
    }));
  }

  const isMatchedInActiveTab = displayRows.some(r => r.isGarmentMatch);

  return (
    <div className="bg-[#FCFBF8] border border-[#E2DACD] rounded-xs p-4 sm:p-5 space-y-4">
      {/* Header & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8E2D8] pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#9B2226]" />
            <h3 className="font-editorial text-sm font-bold uppercase tracking-wider text-[#171513]">
              International Sizing & Conversion
            </h3>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-[#FAF5EB] border border-[#C9B28B]/50 text-[#8C6D37] rounded-3xs font-semibold">
              Live Measured
            </span>
          </div>
          <p className="text-xs text-[#7A7165]">
            Calculated directly from Dhaka vault flat measurements: US, EU, UK & JP equivalents.
          </p>
        </div>

        {/* Measurement Unit Toggle */}
        <div className="flex items-center self-start sm:self-auto bg-[#F2ECE4] p-0.5 rounded text-[11px] font-mono">
          <button
            type="button"
            onClick={() => handleToggleUnit('INCHES')}
            className={`px-2.5 py-1 rounded transition-all ${
              currentUnit === 'INCHES'
                ? 'bg-[#171513] text-white font-bold shadow-xs'
                : 'text-[#5C5449] hover:text-[#171513]'
            }`}
          >
            INCHES
          </button>
          <button
            type="button"
            onClick={() => handleToggleUnit('CM')}
            className={`px-2.5 py-1 rounded transition-all ${
              currentUnit === 'CM'
                ? 'bg-[#171513] text-white font-bold shadow-xs'
                : 'text-[#5C5449] hover:text-[#171513]'
            }`}
          >
            CM
          </button>
        </div>
      </div>

      {/* Calculated Highlight Card: The Garment's 4 Standards */}
      <div className="bg-white border border-[#E2DACD] rounded-xs p-3.5 sm:p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#171513]">
              Calculated Equivalent Fit:
            </span>
            <span className="px-2 py-0.5 text-xs font-mono font-bold bg-[#171513] text-white rounded-3xs">
              {calculated.matchedRow.alpha}
            </span>
          </div>

          <div className="text-[11px] font-mono text-[#7A7165]">
            Tagged: <strong className="text-[#171513]">{product.sizeTag}</strong>
          </div>
        </div>

        {/* 4 Standards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* US Standard */}
          <div className="p-2.5 bg-[#FAF8F5] border border-[#E8E2D8] rounded-xs text-center">
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#7A7165] mb-0.5">
              US Standard
            </div>
            <div className="font-editorial text-base sm:text-lg font-bold text-[#171513]">
              {calculated.matchedRow.us}
            </div>
            <div className="text-[9px] font-mono text-[#A89F91]">
              {calculated.garmentType === 'TOPS_OUTERWEAR' ? 'Chest Size' : calculated.garmentType === 'BOTTOMS' ? 'Waist' : 'Footwear'}
            </div>
          </div>

          {/* EU / IT Standard */}
          <div className="p-2.5 bg-[#FAF8F5] border border-[#E8E2D8] rounded-xs text-center ring-1 ring-[#C9B28B]/30">
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#8C6D37] mb-0.5 font-semibold">
              EU / IT Archive
            </div>
            <div className="font-editorial text-base sm:text-lg font-bold text-[#171513]">
              {calculated.matchedRow.eu}
            </div>
            <div className="text-[9px] font-mono text-[#A89F91]">
              Designer Baseline
            </div>
          </div>

          {/* UK Standard */}
          <div className="p-2.5 bg-[#FAF8F5] border border-[#E8E2D8] rounded-xs text-center">
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#7A7165] mb-0.5">
              UK Standard
            </div>
            <div className="font-editorial text-base sm:text-lg font-bold text-[#171513]">
              {calculated.matchedRow.uk}
            </div>
            <div className="text-[9px] font-mono text-[#A89F91]">
              British Tailoring
            </div>
          </div>

          {/* JP Standard */}
          <div className="p-2.5 bg-[#FAF8F5] border border-[#E8E2D8] rounded-xs text-center">
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#7A7165] mb-0.5">
              JP Standard
            </div>
            <div className="font-editorial text-base sm:text-lg font-bold text-[#171513]">
              {calculated.matchedRow.jp}
            </div>
            <div className="text-[9px] font-mono text-[#A89F91]">
              Harajuku / Tokyo
            </div>
          </div>
        </div>

        {/* Fit Advisory & Tag Comparison Callout */}
        <div className="flex items-start gap-2.5 pt-1 text-xs text-[#5C5449] font-sans bg-[#FAF5EB] p-2.5 rounded-xs border border-[#C9B28B]/30">
          <Sparkles className="w-4 h-4 text-[#8C6D37] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-medium text-[#171513] text-xs leading-snug">
              {calculated.fitAdvisory}
            </p>
            <p className="text-[11px] text-[#7A7165] font-mono">
              {calculated.tagComparison}
            </p>
          </div>
        </div>
      </div>

      {/* Category Tabs for Comparison */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono">
          <button
            type="button"
            onClick={() => setActiveCategoryTab('TOPS_OUTERWEAR')}
            className={`px-3 py-1.5 rounded-xs transition-colors whitespace-nowrap ${
              activeCategoryTab === 'TOPS_OUTERWEAR'
                ? 'bg-[#171513] text-white font-bold'
                : 'bg-white border border-[#E2DACD] text-[#7A7165] hover:text-[#171513]'
            }`}
          >
            Tops & Jackets {defaultGarmentType === 'TOPS_OUTERWEAR' && '●'}
          </button>

          <button
            type="button"
            onClick={() => setActiveCategoryTab('BOTTOMS')}
            className={`px-3 py-1.5 rounded-xs transition-colors whitespace-nowrap ${
              activeCategoryTab === 'BOTTOMS'
                ? 'bg-[#171513] text-white font-bold'
                : 'bg-white border border-[#E2DACD] text-[#7A7165] hover:text-[#171513]'
            }`}
          >
            Pants & Denim {defaultGarmentType === 'BOTTOMS' && '●'}
          </button>

          <button
            type="button"
            onClick={() => setActiveCategoryTab('FOOTWEAR')}
            className={`px-3 py-1.5 rounded-xs transition-colors whitespace-nowrap ${
              activeCategoryTab === 'FOOTWEAR'
                ? 'bg-[#171513] text-white font-bold'
                : 'bg-white border border-[#E2DACD] text-[#7A7165] hover:text-[#171513]'
            }`}
          >
            Footwear & Boots {defaultGarmentType === 'FOOTWEAR' && '●'}
          </button>
        </div>

        <span className="hidden sm:inline-block text-[10px] font-mono text-[#A89F91]">
          {product.gender} Sizing Scale
        </span>
      </div>

      {/* Full Sizing Matrix Table */}
      <div className="overflow-x-auto rounded-xs border border-[#E2DACD] bg-white">
        <table className="w-full text-left text-xs font-mono border-collapse">
          <thead>
            <tr className="bg-[#F7F5F0] border-b border-[#E8E2D8] text-[10px] uppercase text-[#7A7165] tracking-wider">
              <th className="py-2.5 px-3 font-semibold">Standard</th>
              <th className="py-2.5 px-3 font-semibold">US</th>
              <th className="py-2.5 px-3 font-semibold">EU / IT</th>
              <th className="py-2.5 px-3 font-semibold">UK</th>
              <th className="py-2.5 px-3 font-semibold">JP</th>
              <th className="py-2.5 px-3 font-semibold text-right">
                {activeCategoryTab === 'FOOTWEAR'
                  ? 'Foot Length'
                  : activeCategoryTab === 'BOTTOMS'
                  ? `Waist Span (${currentUnit})`
                  : `Chest Span (${currentUnit})`}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EFECE6]">
            {displayRows.map((row, idx) => {
              const isMatch = row.isGarmentMatch;
              return (
                <tr
                  key={`${row.alpha}-${idx}`}
                  className={`transition-colors ${
                    isMatch
                      ? 'bg-[#FAF5EB] font-bold text-[#171513] ring-1 ring-inset ring-[#C9B28B]/60'
                      : 'hover:bg-[#FBF9F6] text-[#5C5449]'
                  }`}
                >
                  <td className="py-2.5 px-3 flex items-center gap-1.5 whitespace-nowrap">
                    {isMatch && (
                      <span
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-3xs text-[9px] font-bold uppercase tracking-wider bg-[#171513] text-[#FAF5EB]"
                        title="Matches this piece's flat measurements"
                      >
                        Match
                      </span>
                    )}
                    <span className={isMatch ? 'text-[#171513] font-bold' : 'font-medium'}>
                      {row.alpha}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">{row.us}</td>
                  <td className="py-2.5 px-3 whitespace-nowrap font-medium text-[#171513]">
                    {row.eu}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">{row.uk}</td>
                  <td className="py-2.5 px-3 whitespace-nowrap">{row.jp}</td>
                  <td className="py-2.5 px-3 text-right whitespace-nowrap font-tabular text-[#171513]">
                    {currentUnit === 'INCHES' ? row.metricRangeIn : row.metricRangeCm}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Measurement Advice / Footnotes */}
      <div className="pt-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] font-mono text-[#7A7165] border-t border-[#E8E2D8]">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-[#C9B28B]" />
          <span>
            {activeCategoryTab === 'TOPS_OUTERWEAR'
              ? 'Chest span is measured flat armpit-to-armpit × 2.'
              : activeCategoryTab === 'BOTTOMS'
              ? 'Waist circumference is measured flat across waistband × 2.'
              : 'Footwear conversion follows EU designer shoe last standards.'}
          </span>
        </div>

        <div className="text-[10px] text-[#A89F91]">
          Questions? WhatsApp Dhaka Concierge: +880 1700-VAULT
        </div>
      </div>
    </div>
  );
};
