import React, { useState } from 'react';
import {
  Sparkles,
  ShoppingBag,
  ArrowRight,
  CheckCircle2,
  Layers,
  Palette,
  ShieldCheck,
  Eye,
  Plus
} from 'lucide-react';
import { Product } from '../types/resale';
import {
  getComplementaryLook,
  LookRecommendation,
  getColorFamily,
  getGarmentRole
} from '../utils/lookRecommender';

interface CompleteTheLookProps {
  currentProduct: Product;
  catalog: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const CompleteTheLook: React.FC<CompleteTheLookProps> = ({
  currentProduct,
  catalog,
  onSelectProduct,
  onAddToCart
}) => {
  const [addingId, setAddingId] = useState<string | null>(null);
  const [isBundlingAll, setIsBundlingAll] = useState(false);
  const [bundleSuccess, setBundleSuccess] = useState(false);

  const recommendations: LookRecommendation[] = getComplementaryLook(currentProduct, catalog);

  if (recommendations.length === 0) return null;

  const formatBDT = (amount: number) => `৳${amount.toLocaleString('en-BD')}`;

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    setAddingId(product.id);
    onAddToCart(product);
    setTimeout(() => {
      setAddingId(null);
    }, 900);
  };

  const handleBundleAll = () => {
    setIsBundlingAll(true);
    // Add all 3 complementary items
    recommendations.forEach((rec, idx) => {
      setTimeout(() => {
        onAddToCart(rec.product);
      }, idx * 150);
    });

    setTimeout(() => {
      setIsBundlingAll(false);
      setBundleSuccess(true);
      setTimeout(() => setBundleSuccess(false), 4000);
    }, recommendations.length * 150 + 200);
  };

  const totalOutfitPrice =
    currentProduct.priceBDT + recommendations.reduce((acc, r) => acc + r.product.priceBDT, 0);

  return (
    <section className="pt-10 border-t border-[#E8E2D8] mt-10">
      {/* Editorial Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase text-[#8C6D37] mb-1.5 font-bold">
            <Layers className="w-3.5 h-3.5" />
            <span>Curated Ensemble · Complete the Look</span>
          </div>
          <h3 className="font-editorial text-xl sm:text-2xl font-bold text-[#171513] tracking-tight">
            Archival Styling Recommendations
          </h3>
          <p className="text-xs text-[#5C5449] font-mono mt-1 max-w-2xl leading-relaxed">
            Forensically paired from our Dhaka inspection vault based on harmonized color palettes,
            complementary silhouette proportions, and corresponding brand design archetypes.
          </p>
        </div>

        {/* Bundle Action Button */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={handleBundleAll}
            disabled={isBundlingAll}
            className="w-full sm:w-auto px-4 py-2.5 bg-[#171513] hover:bg-[#8C6D37] text-[#FAF5EB] text-xs font-mono font-bold uppercase tracking-wider rounded-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-[0.98]"
            title="Add all 3 curated complementary pieces to your shopping bag"
          >
            {isBundlingAll ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 animate-spin text-[#C9B28B]" />
                <span>Assembling Vault Look...</span>
              </>
            ) : bundleSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>3 Pieces Added to Bag</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 text-[#C9B28B]" />
                <span>Bundle Look ({formatBDT(totalOutfitPrice)})</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3 Suggested Pieces Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {recommendations.map(({ product, matchReasons, stylingRationale, paletteRelationship }, index) => {
          const role = getGarmentRole(product);
          const isAdding = addingId === product.id;
          const isSold = product.status === 'SOLD';

          return (
            <div
              key={product.id}
              onClick={() => onSelectProduct(product)}
              className="group bg-white border border-[#DDD5C7] hover:border-[#171513] transition-all rounded-xs overflow-hidden flex flex-col justify-between cursor-pointer shadow-2xs hover:shadow-md"
            >
              {/* Product Visual & Matching Tag */}
              <div>
                <div className="relative aspect-[3/4] bg-[#F7F5F0] overflow-hidden">
                  <img
                    src={product.images[0] || 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80'}
                    alt={product.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Curated Ensemble Slot Label */}
                  <div className="absolute top-2.5 left-2.5 bg-[#171513]/90 backdrop-blur-xs text-[#FAF5EB] px-2 py-0.5 text-[9px] font-mono uppercase tracking-widest font-bold rounded-3xs border border-[#C9B28B]/40">
                    Piece 0{index + 1} · {role.replace('_', ' ')}
                  </div>

                  {/* Authenticated Stamp */}
                  <div className="absolute bottom-2.5 left-2.5 bg-[#FAF5EB]/95 backdrop-blur-xs text-[#171513] px-2 py-0.5 text-[9px] font-mono font-medium rounded-3xs border border-[#DDD5C7] flex items-center gap-1 shadow-2xs">
                    <ShieldCheck className="w-3 h-3 text-emerald-700" />
                    <span>Verified 1-of-1</span>
                  </div>

                  {/* Hover Inspect Overlay */}
                  <div className="absolute inset-0 bg-[#171513]/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <span className="px-3 py-1.5 bg-[#171513] text-[#FAF5EB] text-[10px] font-mono uppercase tracking-wider rounded-3xs flex items-center gap-1 shadow-md">
                      <Eye className="w-3 h-3 text-[#C9B28B]" />
                      <span>Inspect Piece</span>
                    </span>
                  </div>
                </div>

                {/* Garment Details & Rationale */}
                <div className="p-4 space-y-2.5">
                  {/* Brand & Category Clean Metadata */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#7A7165] uppercase">
                    <span className="font-bold text-[#171513]">{product.brand}</span>
                    <span>{product.sizeTag}</span>
                  </div>

                  <h4 className="font-aeonik text-sm font-bold text-[#171513] leading-snug line-clamp-2 group-hover:text-[#8C6D37] transition-colors">
                    {product.title}
                  </h4>

                  {/* Pricing */}
                  <div className="flex items-baseline gap-2 pt-0.5 font-mono">
                    <span className="font-aeonik text-base font-bold text-[#171513] font-tabular">
                      {formatBDT(product.priceBDT)}
                    </span>
                    {product.originalRetailBDT && (
                      <span className="text-[11px] text-neutral-400 line-through font-tabular">
                        Est. {formatBDT(product.originalRetailBDT)}
                      </span>
                    )}
                  </div>

                  {/* Styling Match Rationale */}
                  <div className="pt-2 border-t border-[#F0EBE1] space-y-1.5 text-[11px] font-mono">
                    <div className="flex items-center gap-1.5 text-[#8C6D37] font-semibold">
                      <Palette className="w-3 h-3 shrink-0" />
                      <span className="truncate">{matchReasons[0] || 'Color Harmony'}</span>
                    </div>
                    <p className="text-[10px] text-[#5C5449] leading-relaxed line-clamp-2">
                      {stylingRationale}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="p-4 pt-0">
                {isSold ? (
                  <button
                    disabled
                    className="w-full py-2 bg-[#F2EDE2] text-[#8C8377] font-mono text-[11px] uppercase tracking-wider font-semibold rounded-xs border border-[#DDD5C7] cursor-not-allowed"
                  >
                    Sold Out
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => handleQuickAdd(product, e)}
                    disabled={isAdding}
                    className="w-full py-2 px-3 bg-[#FAF5EB] hover:bg-[#171513] text-[#171513] hover:text-[#FAF5EB] border border-[#DDD5C7] hover:border-[#171513] font-mono text-xs uppercase tracking-wider font-bold rounded-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs"
                  >
                    {isAdding ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 animate-spin text-[#8C6D37]" />
                        <span>Added</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add to Bag</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
