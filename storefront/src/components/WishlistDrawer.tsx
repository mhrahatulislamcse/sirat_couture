import React from 'react';
import { X, Heart, Trash2, ArrowRight } from 'lucide-react';
import { Product } from '../types/resale';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: Product[];
  onRemoveItem: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onSelectProduct,
  onAddToCart
}) => {
  if (!isOpen) return null;

  const formatPrice = (bdt: number) => {
    return `৳${bdt.toLocaleString('en-IN')}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-neutral-950/70 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-[#FAF8F5] h-full shadow-2xl flex flex-col justify-between border-l border-[#E2DACD] animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-[#E8E2D8] bg-[#FCFBF8] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-[#9B2226] fill-[#9B2226]" />
            <h2 className="font-aeonik text-lg font-bold uppercase tracking-wider text-[#171513]">
              Saved Grails
            </h2>
            <span className="font-mono text-xs text-[#7A7165]">
              ({items.length})
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#7A7165] hover:text-[#171513] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
              <Heart className="w-10 h-10 text-neutral-300 stroke-1" />
              <h3 className="font-aeonik text-lg font-bold uppercase text-neutral-700 tracking-tight">
                No Saved Pieces
              </h3>
              <p className="text-xs text-neutral-500 font-sans leading-relaxed">
                Click the heart on any archival piece to track its availability and price.
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-white border border-neutral-200 rounded-sm flex gap-4 relative"
              >
                <div
                  onClick={() => {
                    onSelectProduct(item);
                    onClose();
                  }}
                  className="w-20 h-24 bg-neutral-100 shrink-0 overflow-hidden cursor-pointer"
                >
                  {item.images && item.images[0] && (
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                <div className="flex flex-col justify-between flex-grow">
                  <div>
                    <div className="text-[10px] font-mono text-neutral-400 uppercase">
                      {item.brand} · {item.sizeTag}
                    </div>
                    <h4
                      onClick={() => {
                        onSelectProduct(item);
                        onClose();
                      }}
                      className="font-medium text-xs text-neutral-900 line-clamp-1 cursor-pointer hover:text-neutral-600 mt-0.5"
                    >
                      {item.title}
                    </h4>
                    <span className="font-editorial font-bold text-sm text-neutral-950 font-tabular mt-1 block">
                      {formatPrice(item.priceBDT)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                    <button
                      onClick={() => {
                        onAddToCart(item);
                        onClose();
                      }}
                      disabled={item.status === 'SOLD'}
                      className="text-[11px] font-mono uppercase font-bold text-neutral-900 hover:text-neutral-600 disabled:opacity-40"
                    >
                      {item.status === 'SOLD' ? 'Sold' : 'Reserve & Bag'}
                    </button>

                    <button
                      onClick={() => onRemoveItem(item)}
                      className="p-1 text-neutral-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
