import React, { useState } from 'react';
import {
  X,
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  Copy,
  Check,
  MapPin,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { Order, OrderTrackingCheckpoint } from '../types/resale';
import { customerApiRequest } from '../lib/apiClient';

interface OrderTrackingProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export const OrderTracking: React.FC<OrderTrackingProps> = ({
  isOpen,
  onClose,
  initialQuery = ''
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [isLoading, setIsLoading] = useState(false);
  const [searchedOrders, setSearchedOrders] = useState<Order[] | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedTracking, setCopiedTracking] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (e?: React.FormEvent, directQuery?: string) => {
    if (e) e.preventDefault();
    const searchTerm = directQuery !== undefined ? directQuery : query;
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);
    setSelectedOrder(null);

    try {
      const res = await customerApiRequest(`/api/orders/lookup?query=${encodeURIComponent(searchTerm.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to locate order records.');
      }

      if (data.orders && data.orders.length > 0) {
        setSearchedOrders(data.orders);
        setSelectedOrder(data.orders[0]); // Default to first match
      } else {
        setSearchedOrders([]);
        setErrorMessage(`No archival order found matching "${searchTerm}". Please verify your order number or email.`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error communicating with consignment order registry.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (bdt: number) => {
    return `৳${bdt.toLocaleString('en-IN')}`;
  };

  const handleCopy = (tracking: string) => {
    navigator.clipboard?.writeText(tracking);
    setCopiedTracking(tracking);
    setTimeout(() => setCopiedTracking(null), 2000);
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '—';
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-[#faf9f6] border border-neutral-300 shadow-2xl rounded-sm overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-6 py-4 bg-white border-b border-neutral-200 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-neutral-900" />
            <div>
              <h2 className="font-editorial text-lg font-bold uppercase tracking-wider text-neutral-950 leading-none">
                Order Tracking & Provenance Log
              </h2>
              <span className="text-[10px] font-mono text-neutral-500 uppercase mt-0.5 block">
                White-Glove Archival Courier Verification
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-grow p-6 space-y-6">
          {/* Search Form */}
          <form onSubmit={(e) => handleSearch(e)} className="space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-grow">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Enter order number (e.g. INV-2026-9042) or email..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-300 rounded-sm text-xs font-mono focus:outline-none focus:border-neutral-950"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 bg-neutral-950 text-white font-mono text-xs uppercase tracking-wider font-bold rounded-sm hover:bg-neutral-800 transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? 'Locating...' : 'Track Order'}
              </button>
            </div>

            {/* Quick Demo Pre-fill Pills */}
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-neutral-500">
              <span>Quick inspect examples:</span>
              <button
                type="button"
                onClick={() => {
                  setQuery('INV-2026-9042');
                  handleSearch(undefined, 'INV-2026-9042');
                }}
                className="px-2 py-0.5 bg-white border border-neutral-200 rounded hover:border-neutral-400 text-neutral-800 transition-colors cursor-pointer"
              >
                INV-2026-9042 (In Transit)
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuery('INV-2026-8814');
                  handleSearch(undefined, 'INV-2026-8814');
                }}
                className="px-2 py-0.5 bg-white border border-neutral-200 rounded hover:border-neutral-400 text-neutral-800 transition-colors cursor-pointer"
              >
                INV-2026-8814 (Delivered)
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuery('client@sairat-couture.com');
                  handleSearch(undefined, 'client@sairat-couture.com');
                }}
                className="px-2 py-0.5 bg-white border border-neutral-200 rounded hover:border-neutral-400 text-neutral-800 transition-colors cursor-pointer"
              >
                client@sairat-couture.com
              </button>
            </div>
          </form>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-sm text-xs font-mono text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Multi-Order Results Selector if search returned multiple matches */}
          {searchedOrders && searchedOrders.length > 1 && (
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
                Found {searchedOrders.length} Matching Purchase Records:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {searchedOrders.map((ord) => (
                  <button
                    key={ord.id}
                    onClick={() => setSelectedOrder(ord)}
                    className={`p-3 text-left border rounded-sm transition-all font-mono text-xs ${
                      selectedOrder?.id === ord.id
                        ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                        : 'bg-white border-neutral-200 text-neutral-800 hover:border-neutral-400'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold">{ord.orderNumber}</span>
                      <span className="text-[10px] opacity-80 uppercase">{ord.status}</span>
                    </div>
                    <div className="text-[11px] opacity-75 truncate">
                      {ord.items.map((i) => i.product.title).join(', ')}
                    </div>
                    <div className="text-[10px] opacity-60 mt-1">
                      {formatDate(ord.createdAt)} · {formatPrice(ord.totalBDT)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Selected Order Comprehensive View */}
          {selectedOrder && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Order Header Summary Banner */}
              <div className="p-5 bg-white border border-neutral-200 rounded-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block">
                      Archival Receipt
                    </span>
                    <h3 className="font-editorial text-2xl font-bold text-neutral-950">
                      {selectedOrder.orderNumber}
                    </h3>
                    <span className="text-xs font-mono text-neutral-500">
                      Placed on {formatDate(selectedOrder.createdAt)}
                    </span>
                  </div>

                  <div className="flex flex-col sm:items-end">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-bold uppercase ${
                        selectedOrder.status === 'DELIVERED'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : selectedOrder.status === 'DISPATCHED_COURIER'
                          ? 'bg-sky-50 text-sky-800 border border-sky-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      <Truck className="w-3.5 h-3.5" />
                      {selectedOrder.status}
                    </span>
                    {selectedOrder.estimatedDelivery && (
                      <span className="text-[11px] font-mono text-neutral-500 mt-1">
                        Est. Delivery: {new Date(selectedOrder.estimatedDelivery).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Waybill & Carrier Strip */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1 font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-neutral-400 uppercase block">Courier</span>
                    <span className="font-bold text-neutral-900">{selectedOrder.courier}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-neutral-400 uppercase block">Tracking Waybill</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-neutral-900">{selectedOrder.trackingCode}</span>
                      <button
                        onClick={() => handleCopy(selectedOrder.trackingCode)}
                        className="p-1 text-neutral-400 hover:text-neutral-900 transition-colors"
                        title="Copy tracking"
                      >
                        {copiedTracking === selectedOrder.trackingCode ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center md:justify-end">
                    {selectedOrder.trackingUrl && (
                      <a
                        href={selectedOrder.trackingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded transition-colors text-xs font-bold uppercase"
                      >
                        <span>Official Carrier Portal</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Transit Checkpoints Stepper / Timeline */}
              {selectedOrder.checkpoints && selectedOrder.checkpoints.length > 0 && (
                <div className="p-5 bg-white border border-neutral-200 rounded-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                    <h4 className="font-editorial text-sm font-bold uppercase tracking-wider text-neutral-900">
                      Live Chain of Custody & Transit Milestones
                    </h4>
                    <span className="text-[10px] font-mono text-emerald-800 flex items-center gap-1 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Archival Security Guarantee
                    </span>
                  </div>

                  <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200">
                    {selectedOrder.checkpoints.map((cp: OrderTrackingCheckpoint, idx: number) => (
                      <div key={idx} className="relative group">
                        {/* Status Icon */}
                        <div
                          className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center border ${
                            cp.isCompleted
                              ? 'bg-neutral-950 text-white border-neutral-950'
                              : 'bg-white text-neutral-400 border-neutral-300'
                          }`}
                        >
                          {cp.isCompleted ? (
                            <CheckCircle2 className="w-3 h-3 text-white" />
                          ) : (
                            <Clock className="w-3 h-3 text-neutral-400" />
                          )}
                        </div>

                        {/* Checkpoint Detail */}
                        <div className="text-xs font-mono space-y-0.5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <span className={`font-bold ${cp.isCompleted ? 'text-neutral-900' : 'text-neutral-500'}`}>
                              {cp.title}
                            </span>
                            <span className="text-[10px] text-neutral-400">
                              {formatDate(cp.timestamp)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-neutral-500">
                            <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                            <span>{cp.location}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Purchase History & Itemized Pieces Card */}
              <div className="p-5 bg-white border border-neutral-200 rounded-sm space-y-4">
                <h4 className="font-editorial text-sm font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-100 pb-2">
                  Acquired 1-of-1 Consignment Pieces
                </h4>

                <div className="divide-y divide-neutral-100">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="py-4 flex gap-4 first:pt-0 last:pb-0">
                      {/* Image Thumbnail */}
                      <div className="w-20 h-24 bg-neutral-100 shrink-0 overflow-hidden rounded-xs border border-neutral-200">
                        {item.product?.images?.[0] ? (
                          <img
                            src={item.product.images[0]}
                            alt={item.product.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : null}
                      </div>

                      {/* Item Specs */}
                      <div className="flex flex-col justify-between flex-grow text-xs font-mono">
                        <div>
                          <div className="flex items-center justify-between text-[10px] text-neutral-400 uppercase">
                            <span>{item.product?.brand}</span>
                            <span>SKU: {item.product?.sku}</span>
                          </div>
                          <h5 className="font-bold text-neutral-900 text-sm mt-0.5 font-sans">
                            {item.product?.title}
                          </h5>
                          <div className="text-[11px] text-neutral-500 mt-1 flex flex-wrap gap-2">
                            <span>Tagged: <strong className="text-neutral-800">{item.product?.sizeTag}</strong></span>
                            <span>·</span>
                            <span>Condition: <strong className="text-neutral-800">{item.product?.condition?.replace(/_/g, ' ')}</strong></span>
                            <span>·</span>
                            <span>Origin: <strong className="text-neutral-800">{item.product?.madeIn}</strong></span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-neutral-100 mt-2">
                          <span className="text-[11px] text-emerald-800 flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Ownership Certificate ID: #{item.id.slice(-6).toUpperCase()}
                          </span>
                          <span className="font-editorial font-bold text-sm text-neutral-950 font-tabular">
                            {formatPrice(item.priceBDT)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Financial Breakdown */}
                <div className="pt-4 border-t border-neutral-200 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-neutral-600">
                    <span>Subtotal</span>
                    <span className="font-tabular">{formatPrice(selectedOrder.subtotalBDT)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Delivery ({selectedOrder.shippingAddress.deliveryZone === 'INSIDE_DHAKA' ? 'Inside Dhaka ৳80' : 'Outside Dhaka ৳150'})</span>
                    <span className="font-tabular">{formatPrice(selectedOrder.deliveryFeeBDT)}</span>
                  </div>
                  {selectedOrder.paymentGateway === 'CASH_ON_DELIVERY' && (
                    <div className="p-2 bg-amber-50 border border-amber-200 text-amber-900 rounded text-[11px] space-y-1">
                      <div className="flex justify-between">
                        <span>Advance Delivery Fee (Paid via bKash):</span>
                        <span className="font-bold">{formatPrice(selectedOrder.advancePaidAmountBDT)}</span>
                      </div>
                      <div className="flex justify-between text-amber-800 font-bold">
                        <span>Balance Payable on Delivery to Courier:</span>
                        <span>{formatPrice(selectedOrder.codPayableAmountBDT)}</span>
                      </div>
                    </div>
                  )}
                  <div className="pt-2 border-t border-neutral-200 flex justify-between font-bold text-neutral-950 text-sm">
                    <span>Total Amount</span>
                    <span className="font-editorial text-base font-tabular">
                      {formatPrice(selectedOrder.totalBDT)}
                    </span>
                  </div>
                </div>

                {/* Delivery Address Summary */}
                <div className="p-3 bg-neutral-50 rounded text-xs font-mono text-neutral-600 space-y-1">
                  <span className="text-[10px] text-neutral-400 uppercase block font-bold">
                    Delivery Destination ({selectedOrder.shippingAddress.deliveryZone.replace(/_/g, ' ')})
                  </span>
                  <div className="font-semibold text-neutral-900">{selectedOrder.customerName} ({selectedOrder.customerPhone})</div>
                  <div>{selectedOrder.shippingAddress.streetAddress}</div>
                  <div>
                    {selectedOrder.shippingAddress.thana}, {selectedOrder.shippingAddress.district}, {selectedOrder.shippingAddress.division}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
