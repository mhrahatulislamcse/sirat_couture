import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { Product } from '../types/resale';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatPrice = (bdt: number) => {
    return `৳${bdt.toLocaleString('en-IN')}`;
  };

  const results = query.trim() === ''
    ? []
    : products.filter((p) => {
        const q = query.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q) ||
          p.era.toLowerCase().includes(q)
        );
      });

  const popularSearches = [
    'Raf Simons Riot',
    'Maison Margiela Tabi',
    'The Row Margaux',
    'Rick Owens Bela',
    'Undercover 85',
    'Prada Sport Linea Rossa',
    'Outerwear',
    'ERA_90S'
  ];

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/70 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[#faf9f6] border border-neutral-300 shadow-2xl rounded-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 bg-white border-b border-neutral-200 flex items-center gap-3">
          <Search className="w-5 h-5 text-neutral-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search archival pieces, brands, eras, or SKUs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-sm font-sans placeholder-neutral-400 bg-transparent focus:outline-none text-neutral-900"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-neutral-400 hover:text-neutral-700 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="text-[10px] font-mono px-2 py-0.5 bg-neutral-100 rounded text-neutral-500 border border-neutral-200 shrink-0">
            ESC
          </kbd>
        </div>

        {/* Results or Suggested Searches */}
        <div className="max-h-[60vh] overflow-y-auto p-4">
          {query.trim() === '' ? (
            <div className="space-y-4 py-2">
              <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase block">
                Trending Archival Queries
              </span>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-3 py-1.5 bg-white border border-neutral-200 hover:border-neutral-400 rounded-sm text-xs font-mono text-neutral-700 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center text-neutral-500 text-xs font-mono">
              No verified archival pieces found for "{query}".
            </div>
          ) : (
            <div className="space-y-2">
              <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase block mb-2">
                Predictive Catalog Results ({results.length})
              </span>
              {results.map((product) => (
                <div
                  key={product.id}
                  onClick={() => {
                    onSelectProduct(product);
                    onClose();
                  }}
                  className="p-3 bg-white border border-neutral-200/80 hover:border-neutral-400 rounded-sm flex items-center justify-between gap-4 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-14 bg-neutral-100 shrink-0 overflow-hidden rounded-xs">
                      {product.images && product.images[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : null}
                    </div>

                    <div>
                      <div className="text-[10px] font-mono text-neutral-400 uppercase">
                        {product.brand} · {product.sku}
                      </div>
                      <h4 className="text-xs font-semibold text-neutral-900 group-hover:text-neutral-600 transition-colors line-clamp-1">
                        {product.title}
                      </h4>
                      <div className="text-[10px] font-mono text-neutral-500">
                        {product.condition.replace(/_/g, ' ')} · {product.sizeTag}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-editorial text-sm font-bold text-neutral-950 font-tabular block">
                      {formatPrice(product.priceBDT)}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-700 flex items-center gap-1 justify-end">
                      <ShieldCheck className="w-3 h-3" />
                      Verified
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
