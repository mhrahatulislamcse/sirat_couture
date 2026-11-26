import React, { useState, useEffect } from 'react';
import {
  BellRing,
  X,
  TrendingDown,
  Mail,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { PriceDropNotificationEvent } from '../types/priceAlert';
import { Product } from '../types/resale';

interface PriceDropToastProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const PriceDropToast: React.FC<PriceDropToastProps> = ({
  products,
  onSelectProduct
}) => {
  const [activeToast, setActiveToast] = useState<PriceDropNotificationEvent | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    const handlePriceDropAlert = (customEvent: Event) => {
      const event = (customEvent as CustomEvent<PriceDropNotificationEvent>).detail;
      if (event && event.channels.includes('TOAST')) {
        setActiveToast(event);
        setIsVisible(true);
      }
    };

    window.addEventListener('innove:price-drop-alert', handlePriceDropAlert);

    return () => {
      window.removeEventListener('innove:price-drop-alert', handlePriceDropAlert);
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      setActiveToast(null);
    }, 300);
  };

  const handleViewProduct = () => {
    if (!activeToast) return;
    const prod = products.find((p) => p.id === activeToast.productId);
    if (prod) {
      // Create product with updated price
      const updated: Product = {
        ...prod,
        priceBDT: activeToast.newPriceBDT,
        salePriceBDT: activeToast.newPriceBDT
      };
      onSelectProduct(updated);
    }
    handleClose();
  };

  if (!activeToast || !isVisible) return null;

  const formatBDT = (amount: number) => `৳${amount.toLocaleString('en-BD')}`;

  return (
    <aside
      aria-label="Price drop notification"
      className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-slide-up shadow-2xl"
    >
      <div className="bg-[#171513] text-[#FAF5EB] border-2 border-[#C9B28B] p-4 rounded-xs shadow-2xl relative overflow-hidden backdrop-blur-md">
        {/* Subtle Luxury Gold Highlight Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8C6D37] via-[#E8D7B5] to-[#8C6D37]" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          aria-label="Close notification"
          className="absolute top-3 right-3 p-1 text-neutral-400 hover:text-white transition-colors cursor-pointer rounded-full hover:bg-neutral-800"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Tag */}
        <div className="flex items-center gap-2 mb-2.5">
          <div className="w-6 h-6 rounded-full bg-[#C9B28B]/20 flex items-center justify-center border border-[#C9B28B]/50 animate-pulse">
            <BellRing className="w-3.5 h-3.5 text-[#C9B28B]" />
          </div>
          <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-[#C9B28B] flex items-center gap-1.5">
            <span>Price Drop Triggered</span>
            <span>·</span>
            <span className="text-emerald-400 flex items-center gap-0.5">
              <TrendingDown className="w-3 h-3" />
              -{activeToast.discountPercentage}%
            </span>
          </span>
        </div>

        {/* Garment Details Card */}
        <div className="flex items-center gap-3.5 bg-neutral-900/80 p-2.5 rounded-xs border border-neutral-800 mb-3">
          <img
            src={activeToast.productImage}
            alt={activeToast.productTitle}
            className="w-14 h-14 object-cover rounded-3xs bg-neutral-800 border border-neutral-700 shrink-0"
          />
          <div className="min-w-0 flex-1 font-mono">
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider block truncate">
              {activeToast.productBrand}
            </span>
            <h4 className="font-aeonik text-xs font-bold text-[#FAF5EB] truncate">
              {activeToast.productTitle}
            </h4>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-sm font-bold text-[#FAF5EB] font-tabular">
                {formatBDT(activeToast.newPriceBDT)}
              </span>
              <span className="text-xs text-neutral-500 line-through font-tabular">
                {formatBDT(activeToast.previousPriceBDT)}
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold font-tabular">
                Save {formatBDT(activeToast.discountAmountBDT)}
              </span>
            </div>
          </div>
        </div>

        {/* Email Dispatched Status Badge */}
        {activeToast.channels.includes('EMAIL') && activeToast.emailRecipient && (
          <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-400 mb-3 bg-neutral-900/50 px-2.5 py-1.5 rounded-3xs border border-neutral-800/80">
            <Mail className="w-3 h-3 text-[#C9B28B] shrink-0" />
            <span className="truncate">
              Dispatched to: <strong className="text-neutral-200">{activeToast.emailRecipient}</strong>
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={handleViewProduct}
            className="flex-1 py-2 px-3 bg-[#FAF5EB] hover:bg-[#C9B28B] text-[#171513] font-bold rounded-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <span>Inspect & Claim Piece</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleClose}
            className="py-2 px-3 text-neutral-400 hover:text-white border border-neutral-700 hover:border-neutral-500 rounded-xs transition-colors cursor-pointer text-[11px]"
          >
            Dismiss
          </button>
        </div>
      </div>
    </aside>
  );
};
