import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellRing,
  X,
  CheckCircle2,
  Mail,
  Zap,
  Trash2,
  ArrowRight,
  TrendingDown,
  Sparkles,
  Info
} from 'lucide-react';
import { Product } from '../types/resale';
import { PriceDropCondition, PriceDropAlert } from '../types/priceAlert';
import {
  getPriceAlertForProduct,
  savePriceAlert,
  removePriceAlert,
  simulateImmediatePriceDrop,
  DEFAULT_ALERT_EMAIL
} from '../utils/priceAlerts';

interface PriceDropModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onProductPriceUpdated?: (updatedProduct: Product) => void;
}

export const PriceDropModal: React.FC<PriceDropModalProps> = ({
  isOpen,
  onClose,
  product,
  onProductPriceUpdated
}) => {
  const [existingAlert, setExistingAlert] = useState<PriceDropAlert | undefined>(undefined);
  const [condition, setCondition] = useState<PriceDropCondition>('ANY_DROP');
  const [customPrice, setCustomPrice] = useState<string>('');
  const [notifyViaToast, setNotifyViaToast] = useState<boolean>(true);
  const [notifyViaEmail, setNotifyViaEmail] = useState<boolean>(true);
  const [email, setEmail] = useState<string>(DEFAULT_ALERT_EMAIL);
  const [isSavedSuccess, setIsSavedSuccess] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationLog, setSimulationLog] = useState<{
    oldPrice: number;
    newPrice: number;
    discountPct: number;
    emailSentTo: string;
  } | null>(null);

  // Sync state when opened or product changes
  useEffect(() => {
    if (isOpen) {
      const alert = getPriceAlertForProduct(product.id);
      setExistingAlert(alert);
      if (alert) {
        setCondition(alert.condition);
        setNotifyViaToast(alert.notifyViaToast);
        setNotifyViaEmail(alert.notifyViaEmail);
        setEmail(alert.email || DEFAULT_ALERT_EMAIL);
        if (alert.condition === 'CUSTOM' && alert.targetPriceBDT) {
          setCustomPrice(alert.targetPriceBDT.toString());
        }
      } else {
        setCondition('ANY_DROP');
        setNotifyViaToast(true);
        setNotifyViaEmail(true);
        setEmail(DEFAULT_ALERT_EMAIL);
        setCustomPrice(Math.round(product.priceBDT * 0.9).toString());
      }
      setIsSavedSuccess(false);
      setSimulationLog(null);
    }
  }, [isOpen, product]);

  if (!isOpen) return null;

  const formatBDT = (amount: number) => {
    return `৳${amount.toLocaleString('en-BD')}`;
  };

  const calculatedTargetPrice = () => {
    if (condition === 'PERCENT_10') return Math.round(product.priceBDT * 0.9);
    if (condition === 'PERCENT_20') return Math.round(product.priceBDT * 0.8);
    if (condition === 'CUSTOM' && Number(customPrice) > 0) return Number(customPrice);
    return product.priceBDT - 1; // Any drop
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyViaToast && !notifyViaEmail) {
      alert('Please select at least one notification channel (Toast or Email).');
      return;
    }

    const saved = savePriceAlert({
      product,
      condition,
      targetPriceBDT: calculatedTargetPrice(),
      notifyViaToast,
      notifyViaEmail,
      email: email.trim() || DEFAULT_ALERT_EMAIL
    });

    setExistingAlert(saved);
    setIsSavedSuccess(true);
    setTimeout(() => {
      setIsSavedSuccess(false);
    }, 3000);
  };

  const handleUnsubscribe = () => {
    removePriceAlert(product.id);
    setExistingAlert(undefined);
    setIsSavedSuccess(false);
    setSimulationLog(null);
  };

  const handleSimulateDrop = (pct: number) => {
    setIsSimulating(true);
    // Ensure alert exists so user gets both channels
    if (!existingAlert) {
      savePriceAlert({
        product,
        condition,
        targetPriceBDT: calculatedTargetPrice(),
        notifyViaToast,
        notifyViaEmail,
        email: email.trim() || DEFAULT_ALERT_EMAIL
      });
    }

    setTimeout(() => {
      const { updatedProduct, event } = simulateImmediatePriceDrop(product, pct);
      setIsSimulating(false);
      setSimulationLog({
        oldPrice: event.previousPriceBDT,
        newPrice: event.newPriceBDT,
        discountPct: event.discountPercentage,
        emailSentTo: event.emailRecipient || DEFAULT_ALERT_EMAIL
      });

      if (onProductPriceUpdated) {
        onProductPriceUpdated(updatedProduct);
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#FAF5EB] text-[#171513] border border-[#C9B28B] shadow-2xl rounded-xs overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#171513] text-[#FAF5EB] border-b border-[#2C2824]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#C9B28B]/20 flex items-center justify-center border border-[#C9B28B]/40">
              <BellRing className="w-4 h-4 text-[#C9B28B]" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest text-[#C9B28B] uppercase block">
                Archival Price Intelligence
              </span>
              <h2 className="text-base font-editorial font-bold tracking-wide">
                Notify Me of Price Drop
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs font-mono">
          {/* Active Product Summary */}
          <div className="p-3.5 bg-white border border-[#E8E2D8] rounded-xs flex items-center gap-4 shadow-2xs">
            <img
              src={product.images[0] || 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=300&q=80'}
              alt={product.title}
              className="w-16 h-16 object-cover bg-neutral-100 rounded-3xs border border-[#DDD5C7]"
            />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase font-bold text-[#8C6D37] tracking-wider block truncate">
                {product.brand} · Tagged {product.sizeTag}
              </span>
              <h3 className="font-aeonik text-sm font-bold text-[#171513] truncate">
                {product.title}
              </h3>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-sm font-bold text-[#171513]">
                  {formatBDT(product.priceBDT)}
                </span>
                {product.originalRetailBDT && (
                  <span className="text-[11px] text-neutral-400 line-through">
                    Est. {formatBDT(product.originalRetailBDT)}
                  </span>
                )}
                <span className="text-[10px] px-1.5 py-0.2 bg-[#F3EDE2] text-[#8C6D37] font-semibold border border-[#E5DAC6] rounded-3xs ml-auto">
                  1-of-1 Vault Piece
                </span>
              </div>
            </div>
          </div>

          {/* Active Status Badge if already registered */}
          {existingAlert && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xs flex items-start justify-between gap-3 text-emerald-950">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-xs">
                    Price Alert Active: Trigger at &le; {formatBDT(existingAlert.targetPriceBDT)}
                  </p>
                  <p className="text-[11px] text-emerald-800">
                    Channels:{' '}
                    {existingAlert.notifyViaToast && 'Toast Notification'}
                    {existingAlert.notifyViaToast && existingAlert.notifyViaEmail && ' & '}
                    {existingAlert.notifyViaEmail && `Email (${existingAlert.email})`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleUnsubscribe}
                className="text-[11px] text-red-700 hover:text-red-900 underline cursor-pointer shrink-0 font-medium flex items-center gap-1"
                title="Cancel subscription"
              >
                <Trash2 className="w-3 h-3" />
                <span>Remove</span>
              </button>
            </div>
          )}

          {/* Configuration Form */}
          <form onSubmit={handleSave} className="space-y-4">
            {/* 1. Price Threshold Condition */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#171513] uppercase tracking-wider flex items-center gap-1.5">
                <TrendingDown className="w-3.5 h-3.5 text-[#8C6D37]" />
                <span>1. Select Price Drop Trigger</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                {/* Option: Any Drop */}
                <button
                  type="button"
                  onClick={() => setCondition('ANY_DROP')}
                  className={`p-3 text-left border rounded-xs transition-all cursor-pointer ${
                    condition === 'ANY_DROP'
                      ? 'border-[#171513] bg-[#171513] text-[#FAF5EB] shadow-xs'
                      : 'border-[#DDD5C7] bg-white text-[#5C5449] hover:border-[#8C6D37]'
                  }`}
                >
                  <span className="block font-bold text-xs">Any Reduction</span>
                  <span className={`text-[10px] block mt-0.5 ${condition === 'ANY_DROP' ? 'text-[#C9B28B]' : 'text-neutral-500'}`}>
                    Notify on any price cut (&gt;৳0)
                  </span>
                </button>

                {/* Option: 10% Markdown */}
                <button
                  type="button"
                  onClick={() => setCondition('PERCENT_10')}
                  className={`p-3 text-left border rounded-xs transition-all cursor-pointer ${
                    condition === 'PERCENT_10'
                      ? 'border-[#171513] bg-[#171513] text-[#FAF5EB] shadow-xs'
                      : 'border-[#DDD5C7] bg-white text-[#5C5449] hover:border-[#8C6D37]'
                  }`}
                >
                  <span className="block font-bold text-xs">10% Markdown</span>
                  <span className={`text-[10px] block mt-0.5 ${condition === 'PERCENT_10' ? 'text-[#C9B28B]' : 'text-neutral-500'}`}>
                    Target: &le; {formatBDT(Math.round(product.priceBDT * 0.9))}
                  </span>
                </button>

                {/* Option: 20% Markdown */}
                <button
                  type="button"
                  onClick={() => setCondition('PERCENT_20')}
                  className={`p-3 text-left border rounded-xs transition-all cursor-pointer ${
                    condition === 'PERCENT_20'
                      ? 'border-[#171513] bg-[#171513] text-[#FAF5EB] shadow-xs'
                      : 'border-[#DDD5C7] bg-white text-[#5C5449] hover:border-[#8C6D37]'
                  }`}
                >
                  <span className="block font-bold text-xs">20% Archive Sale</span>
                  <span className={`text-[10px] block mt-0.5 ${condition === 'PERCENT_20' ? 'text-[#C9B28B]' : 'text-neutral-500'}`}>
                    Target: &le; {formatBDT(Math.round(product.priceBDT * 0.8))}
                  </span>
                </button>

                {/* Option: Custom Price */}
                <button
                  type="button"
                  onClick={() => setCondition('CUSTOM')}
                  className={`p-3 text-left border rounded-xs transition-all cursor-pointer ${
                    condition === 'CUSTOM'
                      ? 'border-[#171513] bg-[#171513] text-[#FAF5EB] shadow-xs'
                      : 'border-[#DDD5C7] bg-white text-[#5C5449] hover:border-[#8C6D37]'
                  }`}
                >
                  <span className="block font-bold text-xs">Custom Target</span>
                  <span className={`text-[10px] block mt-0.5 ${condition === 'CUSTOM' ? 'text-[#C9B28B]' : 'text-neutral-500'}`}>
                    Set your own price (৳)
                  </span>
                </button>
              </div>

              {/* Custom Price Input if selected */}
              {condition === 'CUSTOM' && (
                <div className="pt-2">
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-neutral-500">৳</span>
                    <input
                      type="number"
                      value={customPrice}
                      onChange={(e) => setCustomPrice(e.target.value)}
                      placeholder="Enter target price in BDT"
                      className="w-full pl-8 pr-3 py-2 bg-white border border-[#C9B28B] text-xs font-mono rounded-xs focus:outline-hidden focus:ring-1 focus:ring-[#171513]"
                      min="1000"
                      max={product.priceBDT - 1}
                      required
                    />
                  </div>
                  <p className="text-[10px] text-neutral-500 mt-1">
                    Alert will fire once the item reaches {formatBDT(Number(customPrice) || 0)} or lower.
                  </p>
                </div>
              )}
            </div>

            {/* 2. Notification Delivery Channels */}
            <div className="space-y-2 pt-2 border-t border-[#E8E2D8]">
              <label className="text-[11px] font-bold text-[#171513] uppercase tracking-wider flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-[#8C6D37]" />
                <span>2. Notification Channels</span>
              </label>

              <div className="space-y-2">
                {/* Channel 1: In-App Toast */}
                <label className="flex items-center gap-3 p-3 bg-white border border-[#DDD5C7] rounded-xs cursor-pointer hover:border-[#8C6D37] transition-all">
                  <input
                    type="checkbox"
                    checked={notifyViaToast}
                    onChange={(e) => setNotifyViaToast(e.target.checked)}
                    className="accent-[#171513] w-4 h-4 cursor-pointer"
                  />
                  <div className="flex-1">
                    <span className="font-bold text-xs text-[#171513] block">
                      In-App Realtime Toast Notification
                    </span>
                    <span className="text-[10px] text-neutral-500 block">
                      Instant luxury banner notification popup on this device when the price drops.
                    </span>
                  </div>
                  <Zap className="w-4 h-4 text-[#8C6D37]" />
                </label>

                {/* Channel 2: Email Alert */}
                <label className="flex items-start gap-3 p-3 bg-white border border-[#DDD5C7] rounded-xs cursor-pointer hover:border-[#8C6D37] transition-all">
                  <input
                    type="checkbox"
                    checked={notifyViaEmail}
                    onChange={(e) => setNotifyViaEmail(e.target.checked)}
                    className="accent-[#171513] w-4 h-4 mt-0.5 cursor-pointer"
                  />
                  <div className="flex-1">
                    <span className="font-bold text-xs text-[#171513] block">
                      Email Notification Dispatch
                    </span>
                    <span className="text-[10px] text-neutral-500 block">
                      Immediate archival markdown notification delivered straight to your inbox.
                    </span>
                    {notifyViaEmail && (
                      <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                        <div className="relative">
                          <Mail className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your.email@domain.com"
                            className="w-full pl-8 pr-3 py-1.5 bg-[#FAF5EB] border border-[#DDD5C7] rounded-3xs text-xs font-mono focus:outline-hidden focus:border-[#171513]"
                            required
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <Mail className="w-4 h-4 text-[#8C6D37]" />
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 bg-[#171513] hover:bg-[#9E7D47] text-[#FAF5EB] transition-colors font-mono text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md rounded-xs"
              >
                <BellRing className="w-4 h-4 text-[#C9B28B]" />
                <span>{existingAlert ? 'Update Alert Preferences' : 'Save Price Drop Alert'}</span>
                <ArrowRight className="w-4 h-4 text-[#C9B28B]" />
              </button>

              {isSavedSuccess && (
                <div className="mt-2 p-2.5 bg-emerald-100 border border-emerald-400 text-emerald-900 text-[11px] rounded-xs flex items-center gap-2 animate-fade-in font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Price drop alert saved! We will notify you via {notifyViaToast && 'Toast'}{notifyViaToast && notifyViaEmail && ' & '}{notifyViaEmail && `Email (${email})`}.</span>
                </div>
              )}
            </div>
          </form>

          {/* Interactive Simulation Sandbox */}
          <div className="p-4 bg-[#F2EDE2] border border-[#DDD5C7] rounded-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#171513] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#8C6D37]" />
                <span>Test & Experience Price Drop in Real-Time</span>
              </span>
              <span className="text-[9px] uppercase px-1.5 py-0.5 bg-[#171513] text-[#FAF5EB] font-bold rounded-3xs">
                Dev & Demo
              </span>
            </div>
            <p className="text-[11px] text-[#5C5449] leading-relaxed">
              Verify the instant toast trigger and email alert dispatch now. Clicking below markdown-prices this 1-of-1 piece by <strong>10%</strong> (from {formatBDT(product.priceBDT)} to {formatBDT(Math.round(product.priceBDT * 0.9))}) and immediately fires the notification.
            </p>

            <button
              type="button"
              onClick={() => handleSimulateDrop(10)}
              disabled={isSimulating}
              className="w-full py-2.5 px-4 bg-white hover:bg-[#FAF5EB] text-[#171513] border border-[#C9B28B] font-mono text-xs font-bold rounded-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.99]"
            >
              <Zap className="w-4 h-4 text-[#8C6D37]" />
              <span>{isSimulating ? 'Triggering Price Drop Event...' : 'Simulate -10% Price Markdown Now'}</span>
            </button>

            {/* Simulation Log Confirmation */}
            {simulationLog && (
              <div className="p-3 bg-white border border-[#C9B28B] rounded-xs space-y-1.5 text-[11px] animate-fade-in">
                <div className="flex items-center justify-between font-bold text-emerald-800">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Price Drop Event Triggered!
                  </span>
                  <span className="text-[10px] bg-emerald-50 px-1.5 py-0.5 border border-emerald-200 rounded-3xs">
                    -{simulationLog.discountPct}% Discount
                  </span>
                </div>
                <div className="text-neutral-700">
                  Previous: <span className="line-through">{formatBDT(simulationLog.oldPrice)}</span> &rarr; Current:{' '}
                  <strong className="text-neutral-900">{formatBDT(simulationLog.newPrice)}</strong>
                </div>
                <div className="text-neutral-600 flex items-center gap-1.5 pt-1 border-t border-neutral-100">
                  <Mail className="w-3.5 h-3.5 text-neutral-400" />
                  <span>VIP Email dispatched to: <strong>{simulationLog.emailSentTo}</strong></span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#F0EBE1] border-t border-[#E0D8CB] flex items-center justify-between text-[11px] text-[#7A7165]">
          <span className="flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-[#8C6D37]" />
            Saved in your vault browser profile
          </span>
          <button
            onClick={onClose}
            className="text-[#171513] hover:text-[#8C6D37] font-bold cursor-pointer transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
