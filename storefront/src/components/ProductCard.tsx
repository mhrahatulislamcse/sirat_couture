import React from 'react';
import { Heart, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { Product } from '../types/resale';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  isWishlisted,
  onToggleWishlist
}) => {
  const formatBDT = (amount: number) => {
    return `৳${amount.toLocaleString('en-IN')}`;
  };

  const getConditionLabel = (grade: string) => {
    switch (grade) {
      case 'BRAND_NEW_TAGS':
        return 'Brand New w/ Tags';
      case 'EXCELLENT_VINTAGE':
        return 'Excellent Vintage';
      case 'MINOR_FLAWS':
        return 'Minor Era Flaws';
      default:
        return grade.replace(/_/g, ' ');
    }
  };

  const getEraLabel = (era: string) => {
    switch (era) {
      case 'ERA_90S':
        return "1990s Golden Age";
      case 'Y2K':
        return "Y2K Era (2000s)";
      case 'MODERN':
        return "Modern Runway";
      default:
        return era;
    }
  };

  const isSold = product.status === 'SOLD';

  const imageUrl = typeof product.images?.[0] === 'string'
    ? product.images[0]
    : (product.images?.[0] as any)?.url || 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1200&q=80';

  return (
    <div className="group relative flex flex-col bg-white border border-[#E2DACD] hover:border-[#9E7D47] transition-all duration-300 shadow-[0_2px_8px_rgba(23,21,19,0.03)] hover:shadow-[0_12px_30px_rgba(23,21,19,0.08)] rounded-xs overflow-hidden">
      {/* Visual Canvas Container */}
      <div
        onClick={() => onSelect(product)}
        className="relative w-full aspect-[4/5] bg-[#F4EFEB] overflow-hidden cursor-pointer"
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.title}
            referrerPolicy="no-referrer"
            className={`w-full h-full object-cover object-center group-hover:scale-104 transition-transform duration-500 ${
              isSold ? 'grayscale contrast-75 opacity-70' : ''
            }`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#ECE5DB] p-6 text-center">
            <span className="font-editorial text-lg text-[#7A7165] font-bold tracking-widest uppercase">
              {product.brand}
            </span>
            <span className="text-xs font-mono text-[#9E9589] mt-2">Archival Specimen</span>
          </div>
        )}

        {/* Scarcity & Inventory Status Flag */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {isSold ? (
            <span className="bg-[#171513]/90 text-[#F5EDE1] text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 backdrop-blur-xs rounded-2xs border border-[#3A332B]">
              Sold & Delivered
            </span>
          ) : (
            <span className="bg-[#FAF8F5]/95 text-[#171513] text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 backdrop-blur-xs border border-[#C9B28B]/50 rounded-2xs font-bold shadow-2xs">
              1 of 1 in BD
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          className="absolute top-3 right-3 p-2 rounded-full bg-[#FAF8F5]/90 hover:bg-white text-[#5C5449] hover:text-[#9B2226] transition-colors shadow-xs backdrop-blur-xs z-10 border border-[#E2DACD]"
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isWishlisted ? 'fill-[#9B2226] text-[#9B2226]' : 'text-[#5C5449]'
            }`}
          />
        </button>

        {/* Hover Quick Action */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-[#141210]/85 via-[#141210]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between">
          <span className="text-[11px] font-medium tracking-wider uppercase text-[#FAF8F5] font-mono">
            View Garment Specs
          </span>
          <span className="text-[10px] font-mono text-[#C9B28B]">
            {product.sku}
          </span>
        </div>
      </div>

      {/* Product Information Body */}
      <div className="p-4 flex flex-col flex-grow justify-between bg-white">
        <div>
          {/* Brand & Era unboxed metadata */}
          <div className="flex items-center justify-between text-[11px] text-[#7A7165] mb-1 tracking-wider uppercase font-mono">
            <span className="font-semibold text-[#171513]">{product.brand}</span>
            <span className="text-[#9E7D47] font-semibold">{getEraLabel(product.era)}</span>
          </div>

          {/* Product Title */}
          <h3
            onClick={() => onSelect(product)}
            className="font-medium text-sm text-[#171513] leading-snug line-clamp-1 hover:text-[#9E7D47] cursor-pointer transition-colors"
          >
            {product.title}
          </h3>

          {/* Resale Condition & Sizing with Flat Measurements Badge */}
          <div className="mt-2.5 space-y-1.5">
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
              <span className="font-bold text-[#171513] px-1.5 py-0.5 bg-[#FAF5EB] border border-[#DDD5C7] rounded-2xs text-[10px]">
                {product.sizeTag}
              </span>
              <span className={`px-2 py-0.5 rounded-2xs text-[10px] font-semibold uppercase tracking-wider ${
                product.condition === 'BRAND_NEW_TAGS'
                  ? 'bg-[#1A4231] text-[#FAF5EB]'
                  : product.condition === 'EXCELLENT_VINTAGE'
                  ? 'bg-[#171513] text-[#FAF5EB]'
                  : 'bg-[#9E7D47] text-white'
              }`}>
                {getConditionLabel(product.condition)}
              </span>
            </div>

            {/* Flat Measurements Direct Badge */}
            {(product.measurements?.chestWidthIn || product.measurements?.waistIn) && (
              <div className="text-[11px] font-mono text-[#7A7165] bg-[#FAF8F5] px-2 py-1 rounded-2xs border border-[#E8E2D8] flex items-center justify-between">
                <span className="text-[#9E7D47] font-semibold">Flat Measure:</span>
                <span>
                  {product.measurements.chestWidthIn
                    ? `${product.measurements.chestWidthIn}" Chest · ${product.measurements.lengthIn || 28}" Length`
                    : `${product.measurements.waistIn}" Waist`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Price & Authenticity Seal */}
        <div className="mt-4 pt-3 border-t border-[#F0EAE1] flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-aeonik text-lg font-bold text-[#171513] font-tabular">
                {formatBDT(product.priceBDT)}
              </span>
              {product.originalRetailBDT && product.originalRetailBDT > 0 && (
                <span className="text-xs text-[#A39B8F] line-through font-tabular">
                  {formatBDT(product.originalRetailBDT)}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-mono text-[#1A4231] bg-[#FAF5EB] px-2 py-0.5 rounded-2xs border border-[#C9B28B]/30 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#1A4231]" />
            <span>Verified BD</span>
          </div>
        </div>
      </div>
    </div>
  );
};
