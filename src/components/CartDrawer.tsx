import React from 'react';
import { X, Clock, Trash2, ArrowRight, ShieldCheck, Lock, Truck } from 'lucide-react';
import { Product } from '../types/resale';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: Product[];
  onRemoveItem: (productId: string) => void;
  remainingSeconds?: number | null;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onProceedToCheckout
}) => {
  if (!isOpen) return null;

  const formatBDT = (amount: number) => {
    return `৳${amount.toLocaleString('en-IN')}`;
  };

  const subtotalBDT = items.reduce((acc, item) => acc + item.priceBDT, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-neutral-950/70 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-[#FAF8F5] h-full shadow-2xl flex flex-col justify-between border-l border-[#E2DACD] animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="p-5 border-b border-[#E8E2D8] bg-[#FCFBF8] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-aeonik text-lg font-bold uppercase tracking-wider text-[#171513]">
              Shopping Bag
            </h2>
            <span className="font-mono text-xs text-[#7A7165]">
              ({items.length} {items.length === 1 ? 'Piece' : 'Pieces'})
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#7A7165] hover:text-[#171513] rounded-xs transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Luxury Assurance & Direct Checkout Banner */}
        {items.length > 0 && (
          <div className="p-3.5 border-b bg-[#171513] text-[#FAF5EB] border-[#2C2722]">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 text-xs font-mono font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C9B28B]" />
                <span className="uppercase tracking-wider text-[#F5EDE1]">
                  1-of-1 Archival Piece
                </span>
              </div>
              <span className="font-mono text-[10px] text-[#C9B28B] uppercase tracking-widest flex items-center gap-1">
                <Truck className="w-3 h-3 text-[#C9B28B]" /> Steadfast & Pathao
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-[#D6CCC0] font-sans">
              Hand-inspected luxury item in your shopping bag. Ready for instant checkout with bKash, Nagad, Card, or Partial COD with automatic consignment tracking.
            </p>
          </div>
        )}

        {/* Items List Container */}
        <div className="flex-grow overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
              <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-aeonik text-lg font-bold uppercase text-neutral-800 tracking-tight">
                Your Bag Is Empty
              </h3>
              <p className="text-xs text-neutral-500 max-w-xs font-sans leading-relaxed">
                Explore our curated vault of verified archival and luxury resale pieces in Bangladesh to place a 10-minute hold.
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-6 py-2.5 bg-neutral-900 text-white text-xs font-mono uppercase tracking-wider font-semibold hover:bg-neutral-800 transition-colors"
              >
                Browse Catalog
              </button>
            </div>
          ) : (
            items.map((item) => {
              const imgUrl = typeof item.images?.[0] === 'string'
                ? item.images[0]
                : (item.images?.[0] as any)?.url || '';

              return (
                <div
                  key={item.id}
                  className="p-3 bg-white border border-neutral-200 rounded-sm flex gap-4 relative group"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-24 bg-neutral-100 shrink-0 overflow-hidden relative border border-neutral-100">
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : null}
                    <span className="absolute bottom-1 left-1 bg-black/80 text-[8px] font-mono text-white px-1 py-0.2">
                      1-of-1 BD
                    </span>
                  </div>

                  {/* Details */}
                  <div className="flex flex-col justify-between flex-grow">
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 uppercase">
                        <span>{item.brand}</span>
                        <span>{item.sizeTag}</span>
                      </div>

                      <h4 className="font-medium text-xs text-neutral-900 line-clamp-2 mt-0.5 font-sans">
                        {item.title}
                      </h4>

                      <div className="text-[10px] font-mono text-neutral-500 mt-1">
                        Condition: {item.condition.replace(/_/g, ' ')}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                      <span className="font-editorial font-bold text-sm text-neutral-950 font-tabular">
                        {formatBDT(item.priceBDT)}
                      </span>

                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="p-1 text-neutral-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Release hold"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Summary & Checkout Action */}
        {items.length > 0 && (
          <div className="p-5 bg-white border-t border-[#E8E2D8] space-y-4">
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-[#5C5449]">
                <span>Subtotal ({items.length} item)</span>
                <span className="font-bold text-[#171513] font-tabular">{formatBDT(subtotalBDT)}</span>
              </div>
              <div className="flex justify-between text-[#5C5449]">
                <span>Steadfast & Pathao Rate</span>
                <span className="text-[#171513] font-bold text-[11px]">৳80 (Dhaka) / ৳150 (Outside)</span>
              </div>
              <div className="pt-2 border-t border-[#E8E2D8] flex justify-between text-sm font-bold text-[#171513]">
                <span>Estimated Total</span>
                <span className="font-aeonik text-base font-bold font-tabular text-[#171513]">{formatBDT(subtotalBDT)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-mono text-[#5C5449] bg-[#FAF5EB] p-2.5 rounded-xs border border-[#C9B28B]/40">
              <Truck className="w-4 h-4 text-[#9E7D47] shrink-0" />
              <span>Full buyer authenticity guarantee & Steadfast tracking code dispatched with every order.</span>
            </div>

            <button
              onClick={onProceedToCheckout}
              className="w-full py-4 bg-[#171513] hover:bg-[#9E7D47] text-[#FAF5EB] transition-colors font-mono text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 group cursor-pointer shadow-md rounded-xs"
            >
              <span>Proceed to BD Checkout</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#C9B28B]" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
