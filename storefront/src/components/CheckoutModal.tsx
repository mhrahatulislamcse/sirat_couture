import React, { useState, useId } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Truck,
  CreditCard,
  ArrowRight,
  Package,
  Phone,
  MapPin,
  AlertCircle,
  HelpCircle,
  Smartphone
} from 'lucide-react';
import { Product, Order, PaymentGateway, DeliveryZone } from '../types/resale';
import { BANGLADESH_DIVISIONS, DELIVERY_RATES } from '../data/bangladeshLocations';
import { customerApiRequest } from '../lib/apiClient';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: Product[];
  onOrderCompleted: (order: Order) => void;
  onTrackOrder?: (orderNumber: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  onOrderCompleted,
  onTrackOrder
}) => {
  // Form fields
  const [name, setName] = useState('Nafis Chowdhury');
  const [phone, setPhone] = useState('01711982341');
  const [email, setEmail] = useState('nafis@gulshan-vault.com');

  // Address fields
  const [selectedDivisionId, setSelectedDivisionId] = useState('div_dhaka');
  const [selectedDistrictId, setSelectedDistrictId] = useState('dist_dhaka_city');
  const [selectedThanaId, setSelectedThanaId] = useState('thana_gulshan');
  const [streetAddress, setStreetAddress] = useState('House 42, Road 71, Gulshan-2');

  // Payment method
  const [paymentGateway, setPaymentGateway] = useState<PaymentGateway>('BKASH');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Simulated bKash interactive dialog state
  const [isBkashModalOpen, setIsBkashModalOpen] = useState(false);
  const [bkashStep, setBkashStep] = useState<'PHONE' | 'OTP' | 'PIN'>('PHONE');
  const [bkashPhone, setBkashPhone] = useState('01711982341');
  const [bkashOtp, setBkashOtp] = useState('1234');
  const [bkashPin, setBkashPin] = useState('');
  const [isBkashProcessing, setIsBkashProcessing] = useState(false);

  if (!isOpen) return null;

  // Formatting currency in Bangladeshi Taka
  const formatBDT = (amount: number) => {
    return `৳${amount.toLocaleString('en-IN')}`;
  };

  const currentDivision = BANGLADESH_DIVISIONS.find((d) => d.id === selectedDivisionId) || BANGLADESH_DIVISIONS[0];
  const currentDistrict = currentDivision.districts.find((d) => d.id === selectedDistrictId) || currentDivision.districts[0];
  const thanaList = currentDistrict.thanas;

  // Determine delivery zone & fee dynamically
  const isDhaka = currentDistrict.isDhakaCity || currentDistrict.name.toLowerCase().includes('dhaka');
  const deliveryZone: DeliveryZone = isDhaka ? 'INSIDE_DHAKA' : 'OUTSIDE_DHAKA';
  const deliveryFeeBDT = isDhaka ? DELIVERY_RATES.INSIDE_DHAKA.fee : DELIVERY_RATES.OUTSIDE_DHAKA.fee;

  const subtotalBDT = items.reduce((acc, item) => acc + item.priceBDT, 0);
  const totalBDT = subtotalBDT + deliveryFeeBDT;

  // Phone validation for Bangladesh (013-019)
  const isValidBDPhone = (num: string) => {
    const cleaned = num.replace(/[^0-9]/g, '');
    return /^01[3-9]\d{8}$/.test(cleaned);
  };

  const handleDivisionChange = (divId: string) => {
    setSelectedDivisionId(divId);
    const div = BANGLADESH_DIVISIONS.find((d) => d.id === divId);
    if (div && div.districts.length > 0) {
      setSelectedDistrictId(div.districts[0].id);
      if (div.districts[0].thanas.length > 0) {
        setSelectedThanaId(div.districts[0].thanas[0].id);
      }
    }
  };

  const handleDistrictChange = (distId: string) => {
    setSelectedDistrictId(distId);
    const dist = currentDivision.districts.find((d) => d.id === distId);
    if (dist && dist.thanas.length > 0) {
      setSelectedThanaId(dist.thanas[0].id);
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!isValidBDPhone(phone)) {
      setErrorMsg('Please enter a valid 11-digit Bangladesh mobile number (e.g., 01712345678).');
      return;
    }

    // If user chose bKash, open the authentic bKash interactive portal
    if (paymentGateway === 'BKASH') {
      setBkashPhone(phone);
      setIsBkashModalOpen(true);
      setBkashStep('PHONE');
      return;
    }

    // Otherwise, simulate direct processing (Nagad, SSLCommerz, Partial COD)
    await processOrderPayment(paymentGateway);
  };

  const processOrderPayment = async (gateway: PaymentGateway, trxId?: string) => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const selectedThanaName = thanaList.find((t) => t.id === selectedThanaId)?.name || 'Gulshan';

      const response = await customerApiRequest('/api/checkout/simulate', {
        method: 'POST',
        body: JSON.stringify({
          productIds: items.map((i) => i.id),
          customerName: name,
          customerPhone: phone,
          customerEmail: email,
          shippingAddress: {
            division: currentDivision.name,
            district: currentDistrict.name,
            thana: selectedThanaName,
            streetAddress,
            deliveryZone
          },
          paymentGateway: gateway,
          isAdvanceDeliveryPaid: gateway === 'CASH_ON_DELIVERY', // Advance delivery fee collected
          advancePaidAmountBDT: gateway === 'CASH_ON_DELIVERY' ? deliveryFeeBDT : 0
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete checkout');
      }

      setConfirmedOrder(data.order);
      onOrderCompleted(data.order);
    } catch (err: any) {
      setErrorMsg(err.message || 'Payment simulation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBkashExecution = async () => {
    setIsBkashProcessing(true);
    try {
      const selectedThanaName = thanaList.find((t) => t.id === selectedThanaId)?.name || 'Gulshan';

      const response = await customerApiRequest('/api/payment/bkash/execute', {
        method: 'POST',
        body: JSON.stringify({
          paymentID: `BKASH_${Date.now()}`,
          otp: bkashOtp,
          pin: bkashPin || '12345',
          productIds: items.map((i) => i.id),
          customerName: name,
          customerPhone: bkashPhone,
          customerEmail: email,
          shippingAddress: {
            division: currentDivision.name,
            district: currentDistrict.name,
            thana: selectedThanaName,
            streetAddress,
            deliveryZone
          },
          deliveryZone
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'bKash payment capture failed');
      }

      setIsBkashModalOpen(false);
      setConfirmedOrder(data.order);
      onOrderCompleted(data.order);
    } catch (err: any) {
      setErrorMsg(err.message || 'bKash gateway rejected payment.');
      setIsBkashModalOpen(false);
    } finally {
      setIsBkashProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl bg-[#faf9f6] border border-neutral-300 shadow-2xl rounded-sm overflow-hidden my-auto max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-6 py-4 bg-white border-b border-neutral-200 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-neutral-800" />
            <span className="font-editorial text-sm font-bold tracking-wider text-neutral-900 uppercase">
              Encrypted Checkout & Consignment Transfer (Bangladesh)
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {confirmedOrder ? (
          /* Success Receipt View */
          <div className="p-8 sm:p-12 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-800 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[11px] font-mono tracking-widest text-emerald-800 uppercase font-bold block mb-1">
                Order Confirmed · Automated Courier Booking Activated
              </span>
              <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-neutral-950">
                Invoice #{confirmedOrder.orderNumber}
              </h2>
              <p className="text-xs text-neutral-600 mt-2 font-mono">
                SMS dispatch confirmation sent to <strong className="text-neutral-900">{confirmedOrder.customerPhone}</strong>
              </p>
            </div>

            {/* Courier & Tracking Waybill Details */}
            <div className="max-w-lg mx-auto p-5 bg-white border border-neutral-200 rounded-sm text-left space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-neutral-500 uppercase">Automated Courier</span>
                <span className="font-bold text-neutral-900 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-neutral-700" />
                  {confirmedOrder.courier} Courier Services
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500 uppercase">Consignment ID</span>
                <span className="font-bold text-neutral-900">{confirmedOrder.consignmentId || 'STDF-CN-8941'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500 uppercase">Tracking Code</span>
                <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {confirmedOrder.trackingCode}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500 uppercase">Payment Settlement</span>
                <span className="font-bold text-neutral-900">
                  {confirmedOrder.paymentGateway === 'CASH_ON_DELIVERY' ? (
                    <span className="text-amber-800">
                      Partial COD (৳{confirmedOrder.codPayableAmountBDT.toLocaleString()} to pay courier)
                    </span>
                  ) : (
                    <span className="text-emerald-800">
                      Paid in Full ({confirmedOrder.paymentGateway})
                    </span>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                <span className="text-neutral-500 uppercase">Total Settled</span>
                <span className="font-bold text-neutral-950 font-editorial text-base">
                  {formatBDT(confirmedOrder.totalBDT)}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <button
                type="button"
                onClick={() => {
                  if (onTrackOrder) onTrackOrder(confirmedOrder.orderNumber);
                  onClose();
                }}
                className="px-6 py-3 bg-neutral-950 text-white font-mono text-xs uppercase tracking-wider font-bold hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Truck className="w-3.5 h-3.5 text-neutral-300" />
                <span>Track via Steadfast Courier</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-white border border-neutral-300 text-neutral-800 font-mono text-xs uppercase tracking-wider font-bold hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                Return to Digital Showroom
              </button>
            </div>
          </div>
        ) : (
          /* Form Checkout View */
          <form onSubmit={handleCheckoutSubmit} className="p-6 sm:p-8 space-y-6 overflow-y-auto">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-mono rounded flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Customer & Bangladesh Delivery Location */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-neutral-200 pb-2">
                  <MapPin className="w-4 h-4 text-neutral-700" />
                  <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-900">
                    1. Bangladesh Shipping Address
                  </h3>
                </div>

                <div className="space-y-3">
                  {/* Full Name */}
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">
                      Full Recipient Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-sm text-xs font-sans focus:outline-none focus:border-neutral-900"
                    />
                  </div>

                  {/* BD Phone Number */}
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1 flex items-center justify-between">
                      <span>Mobile Number (bKash & Courier SMS)</span>
                      <span className="text-emerald-700 font-bold">11 Digits</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-2 text-xs font-mono text-neutral-500 font-semibold">
                        +88
                      </div>
                      <input
                        type="tel"
                        required
                        placeholder="01712345678"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-12 pr-3 py-2 bg-white border border-neutral-300 rounded-sm text-xs font-mono focus:outline-none focus:border-neutral-900 font-bold"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">
                      Email Address (Optional - for Certificate PDF)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-sm text-xs font-sans focus:outline-none focus:border-neutral-900"
                    />
                  </div>

                  {/* Division -> District -> Thana Dropdowns */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">
                        Division
                      </label>
                      <select
                        value={selectedDivisionId}
                        onChange={(e) => handleDivisionChange(e.target.value)}
                        className="w-full px-2.5 py-2 bg-white border border-neutral-300 rounded-sm text-xs font-sans focus:outline-none focus:border-neutral-900"
                      >
                        {BANGLADESH_DIVISIONS.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">
                        District
                      </label>
                      <select
                        value={selectedDistrictId}
                        onChange={(e) => handleDistrictChange(e.target.value)}
                        className="w-full px-2.5 py-2 bg-white border border-neutral-300 rounded-sm text-xs font-sans focus:outline-none focus:border-neutral-900"
                      >
                        {currentDivision.districts.map((dst) => (
                          <option key={dst.id} value={dst.id}>
                            {dst.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">
                      Thana / Area (Police Station)
                    </label>
                    <select
                      value={selectedThanaId}
                      onChange={(e) => setSelectedThanaId(e.target.value)}
                      className="w-full px-2.5 py-2 bg-white border border-neutral-300 rounded-sm text-xs font-sans focus:outline-none focus:border-neutral-900"
                    >
                      {thanaList.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Street Address */}
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">
                      Street Address (House, Road, Block, Sector)
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-sm text-xs font-sans focus:outline-none focus:border-neutral-900"
                    />
                  </div>

                  {/* Automated Courier Rate Badge */}
                  <div className="p-3 bg-neutral-100 rounded-sm text-xs font-mono flex items-center justify-between border border-neutral-200">
                    <span className="text-neutral-600">Fulfillment Method</span>
                    <span className="font-bold text-neutral-900">
                      Steadfast Courier ({deliveryZone === 'INSIDE_DHAKA' ? 'Inside Dhaka ৳80' : 'Outside Dhaka ৳150'})
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Localized Payment Method & Order Summary */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-neutral-200 pb-2">
                  <CreditCard className="w-4 h-4 text-neutral-700" />
                  <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-900">
                    2. Payment Gateway
                  </h3>
                </div>

                {/* Payment Gateway Radio Cards */}
                <div className="space-y-2">
                  {/* bKash */}
                  <label
                    className={`flex items-center justify-between p-3.5 border rounded-sm cursor-pointer transition-all ${
                      paymentGateway === 'BKASH'
                        ? 'border-[#E2136E] bg-pink-50/50 shadow-xs ring-1 ring-[#E2136E]'
                        : 'border-neutral-200 bg-white hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentGateway"
                        checked={paymentGateway === 'BKASH'}
                        onChange={() => setPaymentGateway('BKASH')}
                        className="accent-[#E2136E]"
                      />
                      <div>
                        <div className="font-bold text-xs text-neutral-900 font-mono flex items-center gap-1.5">
                          <span>bKash Tokenized Checkout</span>
                          <span className="bg-[#E2136E] text-white text-[9px] px-1.5 py-0.2 rounded font-mono font-bold">
                            Instant
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-500 font-sans">
                          Pay directly from your bKash personal account with OTP/PIN.
                        </p>
                      </div>
                    </div>
                    <span className="font-editorial font-bold text-xs text-[#E2136E]">bKash</span>
                  </label>

                  {/* Nagad */}
                  <label
                    className={`flex items-center justify-between p-3.5 border rounded-sm cursor-pointer transition-all ${
                      paymentGateway === 'NAGAD'
                        ? 'border-[#F7941D] bg-orange-50/50 shadow-xs ring-1 ring-[#F7941D]'
                        : 'border-neutral-200 bg-white hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentGateway"
                        checked={paymentGateway === 'NAGAD'}
                        onChange={() => setPaymentGateway('NAGAD')}
                        className="accent-[#F7941D]"
                      />
                      <div>
                        <div className="font-bold text-xs text-neutral-900 font-mono">
                          Nagad Direct Gateway
                        </div>
                        <p className="text-[11px] text-neutral-500 font-sans">
                          Fast mobile financial settlement via Nagad.
                        </p>
                      </div>
                    </div>
                    <span className="font-editorial font-bold text-xs text-[#F7941D]">Nagad</span>
                  </label>

                  {/* SSLCommerz */}
                  <label
                    className={`flex items-center justify-between p-3.5 border rounded-sm cursor-pointer transition-all ${
                      paymentGateway === 'SSLCOMMERZ'
                        ? 'border-neutral-900 bg-neutral-100 shadow-xs ring-1 ring-neutral-900'
                        : 'border-neutral-200 bg-white hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentGateway"
                        checked={paymentGateway === 'SSLCOMMERZ'}
                        onChange={() => setPaymentGateway('SSLCOMMERZ')}
                        className="accent-neutral-900"
                      />
                      <div>
                        <div className="font-bold text-xs text-neutral-900 font-mono">
                          SSLCommerz Cards & Banking
                        </div>
                        <p className="text-[11px] text-neutral-500 font-sans">
                          Visa, Mastercard, Amex, City Bank, Brac Bank.
                        </p>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold text-neutral-700">Cards</span>
                  </label>

                  {/* Cash on Delivery with Advance Delivery Fee */}
                  <label
                    className={`flex items-start justify-between p-3.5 border rounded-sm cursor-pointer transition-all ${
                      paymentGateway === 'CASH_ON_DELIVERY'
                        ? 'border-neutral-900 bg-neutral-100 shadow-xs ring-1 ring-neutral-900'
                        : 'border-neutral-200 bg-white hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="paymentGateway"
                        checked={paymentGateway === 'CASH_ON_DELIVERY'}
                        onChange={() => setPaymentGateway('CASH_ON_DELIVERY')}
                        className="accent-neutral-900 mt-1"
                      />
                      <div>
                        <div className="font-bold text-xs text-neutral-900 font-mono flex items-center gap-1.5">
                          <span>Cash on Delivery (Partial COD)</span>
                        </div>
                        <p className="text-[11px] text-neutral-600 font-sans leading-relaxed mt-0.5">
                          Advance delivery fee (<strong>{formatBDT(deliveryFeeBDT)}</strong>) collected via bKash to secure the 1-of-1 archive hold. Remaining garment balance paid to Steadfast courier at your doorstep.
                        </p>
                      </div>
                    </div>
                  </label>
                </div>

                {/* Financial Summary */}
                <div className="p-4 bg-white border border-neutral-200 rounded-sm space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-neutral-600">
                    <span>Archival Items ({items.length})</span>
                    <span className="font-tabular font-bold">{formatBDT(subtotalBDT)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Steadfast Delivery ({isDhaka ? 'Inside Dhaka' : 'Outside Dhaka'})</span>
                    <span className="font-tabular font-bold text-neutral-900">{formatBDT(deliveryFeeBDT)}</span>
                  </div>
                  <div className="pt-2 border-t border-neutral-200 flex justify-between font-bold text-neutral-900 text-sm">
                    <span>Total Amount</span>
                    <span className="font-editorial text-base font-tabular">{formatBDT(totalBDT)}</span>
                  </div>

                  {paymentGateway === 'CASH_ON_DELIVERY' && (
                    <div className="pt-2 border-t border-dashed border-neutral-200 text-[11px] text-neutral-600 space-y-1">
                      <div className="flex justify-between">
                        <span>Due via bKash now (Advance Courier):</span>
                        <span className="font-bold text-neutral-900">{formatBDT(deliveryFeeBDT)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Payable to Courier on Arrival:</span>
                        <span className="font-bold text-amber-800">{formatBDT(subtotalBDT)}</span>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-neutral-950 text-white hover:bg-neutral-800 transition-colors font-mono text-xs uppercase tracking-widest font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Processing Bangladesh Gateway...</span>
                  ) : paymentGateway === 'BKASH' ? (
                    <>
                      <span>Pay with bKash ({formatBDT(totalBDT)})</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : paymentGateway === 'CASH_ON_DELIVERY' ? (
                    <>
                      <span>Confirm COD Order (Pay {formatBDT(deliveryFeeBDT)} Delivery)</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>Complete Checkout ({formatBDT(totalBDT)})</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Interactive bKash Payment Modal (Simulation) */}
      {isBkashModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-lg shadow-2xl max-w-sm w-full overflow-hidden border border-neutral-200">
            {/* bKash Header */}
            <div className="bg-[#E2136E] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                <span className="font-bold font-mono tracking-wide text-sm">bKash Payment Gateway</span>
              </div>
              <button
                onClick={() => setIsBkashModalOpen(false)}
                className="text-white hover:opacity-80 p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 font-sans text-xs">
              <div className="bg-neutral-50 p-3 rounded border border-neutral-200 flex justify-between items-center font-mono">
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase block">Merchant</span>
                  <span className="font-bold text-neutral-900">SAIRAT COUTURE BD</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-neutral-500 uppercase block">Amount</span>
                  <span className="font-bold text-[#E2136E] text-sm">{formatBDT(totalBDT)}</span>
                </div>
              </div>

              {bkashStep === 'PHONE' && (
                <div className="space-y-3">
                  <label className="block text-neutral-700 font-medium">
                    Your bKash Account Number
                  </label>
                  <input
                    type="tel"
                    value={bkashPhone}
                    onChange={(e) => setBkashPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded font-mono text-sm focus:border-[#E2136E] focus:outline-none"
                    placeholder="e.g. 017XXXXXXXX"
                  />
                  <button
                    type="button"
                    onClick={() => setBkashStep('OTP')}
                    className="w-full py-2.5 bg-[#E2136E] text-white rounded font-bold font-mono hover:opacity-95 transition-opacity"
                  >
                    Confirm & Send Verification Code
                  </button>
                </div>
              )}

              {bkashStep === 'OTP' && (
                <div className="space-y-3">
                  <label className="block text-neutral-700 font-medium">
                    Enter Verification Code (SMS OTP)
                  </label>
                  <input
                    type="text"
                    value={bkashOtp}
                    onChange={(e) => setBkashOtp(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded font-mono text-sm text-center tracking-widest focus:border-[#E2136E] focus:outline-none"
                    placeholder="4-digit code"
                  />
                  <p className="text-[11px] text-neutral-400 text-center font-mono">
                    Demo OTP: <strong className="text-neutral-700">1234</strong>
                  </p>
                  <button
                    type="button"
                    onClick={() => setBkashStep('PIN')}
                    className="w-full py-2.5 bg-[#E2136E] text-white rounded font-bold font-mono hover:opacity-95 transition-opacity"
                  >
                    Verify Code
                  </button>
                </div>
              )}

              {bkashStep === 'PIN' && (
                <div className="space-y-3">
                  <label className="block text-neutral-700 font-medium">
                    Enter bKash PIN
                  </label>
                  <input
                    type="password"
                    maxLength={5}
                    value={bkashPin}
                    onChange={(e) => setBkashPin(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded font-mono text-sm text-center tracking-widest focus:border-[#E2136E] focus:outline-none"
                    placeholder="•••••"
                  />
                  <p className="text-[11px] text-neutral-400 text-center font-mono">
                    Any 5-digit PIN for demo simulation
                  </p>
                  <button
                    type="button"
                    disabled={isBkashProcessing}
                    onClick={handleBkashExecution}
                    className="w-full py-2.5 bg-[#E2136E] text-white rounded font-bold font-mono hover:opacity-95 transition-opacity flex items-center justify-center gap-2"
                  >
                    {isBkashProcessing ? 'Processing Transaction...' : `Confirm Payment ${formatBDT(totalBDT)}`}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
