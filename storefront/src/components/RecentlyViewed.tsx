import React, { useRef, useState, useEffect } from 'react';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Eye,
  Plus,
  CheckCircle2,
  ShieldCheck,
  History
} from 'lucide-react';
import { Product } from '../types/resale';
import { getRecentlyViewed } from '../utils/recentlyViewed';

interface RecentlyViewedProps {
  currentProductId: string;
  fallbackCatalog?: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const RecentlyViewed: React.FC<RecentlyViewedProps> = ({
  currentProductId,
  fallbackCatalog = [],
  onSelectProduct,
  onAddToCart
}) => {
  const [recentItems, setRecentItems] = useState<Product[]>([]);
  const [addingId, setAddingId] = useState<string | null>(null);
  const scrollRailRef = useRef<HTMLDivElement>(null);

  const loadRecentItems = () => {
    const items = getRecentlyViewed(currentProductId, 4);
    if (items.length > 0) {
      setRecentItems(items);
    } else if (fallbackCatalog.length > 0) {
      // If user is opening their first product, show recent intake highlights
      const fallbacks = fallbackCatalog
        .filter((p) => p.id !== currentProductId)
        .slice(0, 4);
      setRecentItems(fallbacks);
    } else {
      setRecentItems([]);
    }
  };

  useEffect(() => {
    loadRecentItems();

    const handleUpdate = () => {
      loadRecentItems();
    };

    window.addEventListener('innove:recently-viewed-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('innove:recently-viewed-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [currentProductId, fallbackCatalog]);

  if (recentItems.length === 0) return null;

  const formatBDT = (amount: number) => `৳${amount.toLocaleString('en-BD')}`;

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRailRef.current) return;
    const distance = 280;
    scrollRailRef.current.scrollBy({
      left: direction === 'left' ? -distance : distance,
      behavior: 'smooth'
    });
  };

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    setAddingId(product.id);
    onAddToCart(product);
    setTimeout(() => {
      setAddingId(null);
    }, 900);
  };

  return (
    <section className="pt-8 border-t border-[#E8E2D8] mt-8">
      {/* Header with Navigation Arrows */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-widest uppercase text-[#8C6D37] font-bold mb-1">
            <History className="w-3.5 h-3.5" />
            <span>Discovery Journey · Session History</span>
          </div>
          <h3 className="font-editorial text-lg sm:text-xl font-bold text-[#171513] tracking-tight">
            Recently Viewed Relics
          </h3>
        </div>

        {/* Scroll Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => scroll('left')}
            aria-label="Scroll recently viewed left"
            className="w-8 h-8 rounded-xs border border-[#DDD5C7] bg-white hover:bg-[#FAF5EB] hover:border-[#171513] text-[#171513] flex items-center justify-center transition-all cursor-pointer shadow-3xs active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            aria-label="Scroll recently viewed right"
            className="w-8 h-8 rounded-xs border border-[#DDD5C7] bg-white hover:bg-[#FAF5EB] hover:border-[#171513] text-[#171513] flex items-center justify-center transition-all cursor-pointer shadow-3xs active:scale-95"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Rail */}
      <div
        ref={scrollRailRef}
        className="flex items-stretch gap-4 overflow-x-auto pb-4 pt-1 snap-x scroll-smooth scrollbar-thin scrollbar-thumb-[#DDD5C7] scrollbar-track-transparent"
        style={{ scrollbarWidth: 'thin' }}
      >
        {recentItems.map((product) => {
          const isAdding = addingId === product.id;
          const isSold = product.status === 'SOLD';

          return (
            <div
              key={product.id}
              onClick={() => onSelectProduct(product)}
              className="group min-w-[210px] sm:min-w-[240px] max-w-[240px] shrink-0 bg-white border border-[#DDD5C7] hover:border-[#171513] transition-all rounded-xs overflow-hidden flex flex-col justify-between cursor-pointer shadow-2xs hover:shadow-md snap-start"
            >
              {/* Product Visual */}
              <div>
                <div className="relative aspect-[3/4] bg-[#F7F5F0] overflow-hidden">
                  <img
                    src={product.images[0] || 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80'}
                    alt={product.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* 1-of-1 Micro Stamp */}
                  <div className="absolute top-2 left-2 bg-[#171513]/90 text-[#FAF5EB] px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-widest font-semibold rounded-3xs border border-[#C9B28B]/30">
                    1-of-1
                  </div>

                  {/* Hover Quick Inspect Icon */}
                  <div className="absolute inset-0 bg-[#171513]/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <span className="px-2.5 py-1 bg-[#171513] text-[#FAF5EB] text-[9px] font-mono uppercase tracking-wider rounded-3xs flex items-center gap-1 shadow-md">
                      <Eye className="w-3 h-3 text-[#C9B28B]" />
                      <span>Inspect</span>
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-3 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#7A7165] uppercase">
                    <span className="font-bold text-[#171513] truncate max-w-[120px]">{product.brand}</span>
                    <span>{product.sizeTag}</span>
                  </div>

                  <h4 className="font-aeonik text-xs font-bold text-[#171513] leading-snug line-clamp-1 group-hover:text-[#8C6D37] transition-colors">
                    {product.title}
                  </h4>

                  <div className="flex items-baseline gap-1.5 font-mono pt-0.5">
                    <span className="font-aeonik text-sm font-bold text-[#171513] font-tabular">
                      {formatBDT(product.priceBDT)}
                    </span>
                    {product.originalRetailBDT && (
                      <span className="text-[10px] text-neutral-400 line-through font-tabular">
                        {formatBDT(product.originalRetailBDT)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="p-3 pt-0">
                {isSold ? (
                  <button
                    disabled
                    className="w-full py-1.5 bg-[#F2EDE2] text-[#8C8377] font-mono text-[10px] uppercase tracking-wider font-semibold rounded-xs border border-[#DDD5C7] cursor-not-allowed"
                  >
                    Sold Out
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => handleQuickAdd(product, e)}
                    disabled={isAdding}
                    className="w-full py-1.5 px-2 bg-[#FAF5EB] hover:bg-[#171513] text-[#171513] hover:text-[#FAF5EB] border border-[#DDD5C7] hover:border-[#171513] font-mono text-[11px] uppercase tracking-wider font-bold rounded-xs transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-3xs"
                  >
                    {isAdding ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 animate-spin text-[#8C6D37]" />
                        <span>Added</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3" />
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
