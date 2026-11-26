import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Truck,
  Send,
  Printer,
  RefreshCw,
  ExternalLink,
  MapPin,
  CheckCircle2,
  Copy,
  Check,
  AlertTriangle,
  AlertOctagon,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  CheckCheck,
  Eye,
  Calculator,
  Scale,
  Clock,
  Zap,
  ArrowRightLeft
} from 'lucide-react';
import {
  Order,
  CourierProvider,
  DeliveryZone,
  ConsignmentNote,
  CourierRateQuote
} from '../types/resale';
import { adminApiRequest } from '../lib/adminApiClient';

export interface DispatchOptions {
  deliveryType?: 12 | 48;
  weightKg?: number;
  calculatedFeeBDT?: number;
}

interface AdminDispatchControlProps {
  order: Order;
  onDispatch: (
    orderId: string,
    courier: CourierProvider,
    deliveryZone: DeliveryZone,
    note?: string,
    options?: DispatchOptions
  ) => Promise<ConsignmentNote | null>;
  onOpenConsignmentNote: (
    consignmentNote: ConsignmentNote,
    initialMode?: 'PREVIEW_MOCK_4X6' | 'THERMAL_4X6' | 'A4_FULL'
  ) => void;
  onSyncCourierStatus: (orderId: string) => Promise<void>;
  onZoneChange?: (
    orderId: string,
    newZone: DeliveryZone,
    courier?: CourierProvider,
    options?: DispatchOptions
  ) => Promise<void>;
  isDispatching?: boolean;
  isSyncing?: boolean;
}

export interface CoverageValidationResult {
  isServiceable: boolean;
  status: 'COVERED' | 'OUT_OF_SERVICE' | 'MISMATCH_WARNING';
  hubTitle: string;
  warningTitle?: string;
  warningDetail?: string;
  recommendedCourier?: CourierProvider;
}

const WEIGHT_TIERS = [
  { value: 0.5, label: '0.5 kg (Light)' },
  { value: 1.0, label: '1.0 kg (Standard)' },
  { value: 1.5, label: '1.5 kg (Heavy Coat)' },
  { value: 2.0, label: '2.0 kg (Archive Box)' },
  { value: 3.0, label: '3.0 kg (Multi-Piece)' }
];

export const AdminDispatchControl: React.FC<AdminDispatchControlProps> = ({
  order,
  onDispatch,
  onOpenConsignmentNote,
  onSyncCourierStatus,
  onZoneChange,
  isDispatching = false,
  isSyncing = false
}) => {
  const [selectedCourier, setSelectedCourier] = useState<CourierProvider>(
    order.courier || 'STEADFAST'
  );
  const [selectedZone, setSelectedZone] = useState<DeliveryZone>(
    order.shippingAddress.deliveryZone || 'INSIDE_DHAKA'
  );
  const [weightKg, setWeightKg] = useState<number>(() => {
    const count = order.items?.length || 1;
    return count > 1 ? Math.min(3.0, Number((count * 0.8).toFixed(1))) : 1.0;
  });
  const [pathaoDeliveryType, setPathaoDeliveryType] = useState<12 | 48>(48);
  const [instructionNote, setInstructionNote] = useState<string>(
    'Fragile 1-of-1 archival garment. Verify tamper-evident hologram seal before handover.'
  );
  const [showNotesField, setShowNotesField] = useState(false);
  const [copiedTracking, setCopiedTracking] = useState(false);
  const [isUpdatingZone, setIsUpdatingZone] = useState(false);

  // Live Rate Calculator State
  const [rateQuote, setRateQuote] = useState<CourierRateQuote | null>(null);
  const [zoneMatrix, setZoneMatrix] = useState<Record<DeliveryZone, CourierRateQuote> | null>(null);
  const [courierMatrix, setCourierMatrix] = useState<{
    STEADFAST: CourierRateQuote;
    PATHAO: CourierRateQuote;
  } | null>(null);
  const [isCalculatingRate, setIsCalculatingRate] = useState<boolean>(false);
  const [rateError, setRateError] = useState<string | null>(null);

  // Real-Time Coverage Validation Toggle & Simulation
  const [isCoverageValidationEnabled, setIsCoverageValidationEnabled] = useState<boolean>(true);
  const [simulateOutOfService, setSimulateOutOfService] = useState<boolean>(false);

  useEffect(() => {
    if (order.shippingAddress?.deliveryZone) {
      setSelectedZone(order.shippingAddress.deliveryZone);
    }
    if (order.courier) {
      setSelectedCourier(order.courier);
    }
  }, [order.shippingAddress?.deliveryZone, order.courier]);

  // Fetch Real-Time Delivery Rates from Backend Tariff Service
  const fetchRealTimeRate = useCallback(
    async (signal?: AbortSignal) => {
      setIsCalculatingRate(true);
      setRateError(null);
      try {
        const res = await adminApiRequest('/api/admin/courier/calculate-rate', {
          method: 'POST',
          signal,
          body: JSON.stringify({
            courier: selectedCourier,
            deliveryZone: selectedZone,
            district: order.shippingAddress.district,
            thana: order.shippingAddress.thana,
            weightKg,
            deliveryType: selectedCourier === 'PATHAO' && selectedZone === 'INSIDE_DHAKA' ? pathaoDeliveryType : 48,
            codAmountBDT: order.paymentGateway === 'CASH_ON_DELIVERY' ? order.subtotalBDT : 0
          })
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        if (data.quote) setRateQuote(data.quote);
        if (data.zoneMatrix) setZoneMatrix(data.zoneMatrix);
        if (data.courierMatrix) setCourierMatrix(data.courierMatrix);
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
        console.error('Failed to fetch real-time courier rate', err);
        setRateError('Unable to reach live courier tariff API; using fallback schedule.');
      } finally {
        if (!signal?.aborted) {
          setIsCalculatingRate(false);
        }
      }
    },
    [
      selectedCourier,
      selectedZone,
      order.shippingAddress.district,
      order.shippingAddress.thana,
      order.paymentGateway,
      order.subtotalBDT,
      weightKg,
      pathaoDeliveryType
    ]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchRealTimeRate(controller.signal);
    return () => controller.abort();
  }, [fetchRealTimeRate]);

  const isDispatched =
    !!order.consignmentId ||
    order.status === 'DISPATCHED_COURIER' ||
    order.status === 'DELIVERED';

  // Live Calculated Delivery Fee & Settlement Totals
  const fallbackFee = selectedZone === 'INSIDE_DHAKA' ? 120 : 200;
  const deliveryFee = rateQuote?.totalDeliveryFeeBDT ?? fallbackFee;
  const recalculatedTotal = order.subtotalBDT + deliveryFee;
  const recalculatedCodAmount =
    order.paymentGateway === 'CASH_ON_DELIVERY'
      ? order.isAdvanceDeliveryPaid
        ? Math.max(0, recalculatedTotal - (order.advancePaidAmountBDT || 0))
        : recalculatedTotal
      : 0;

  // Real-time Courier Coverage Cross-Check
  const coverageResult: CoverageValidationResult = useMemo(() => {
    if (!isCoverageValidationEnabled) {
      return {
        isServiceable: true,
        status: 'COVERED',
        hubTitle: 'Coverage Validation Bypassed'
      };
    }

    if (simulateOutOfService) {
      return {
        isServiceable: false,
        status: 'OUT_OF_SERVICE',
        hubTitle: `${selectedCourier === 'STEADFAST' ? 'Steadfast' : 'Pathao'} Hub Inactive`,
        warningTitle: `Zone Out of Service: ${selectedCourier} Fleet Unavailable`,
        warningDetail: `${selectedCourier === 'PATHAO' ? 'Pathao Express' : 'Steadfast'} does not currently provide courier delivery to ${order.shippingAddress.district || 'this destination'} in the ${selectedZone === 'INSIDE_DHAKA' ? 'Inside Dhaka' : 'Outside Dhaka'} zone.`,
        recommendedCourier: selectedCourier === 'PATHAO' ? 'STEADFAST' : 'PATHAO'
      };
    }

    const district = (order.shippingAddress.district || '').toLowerCase().trim();
    const thana = (order.shippingAddress.thana || '').toLowerCase().trim();

    if (selectedZone === 'INSIDE_DHAKA') {
      const isOutsideDhakaDistrict = [
        'chittagong', 'chattogram', 'sylhet', 'rajshahi', 'khulna', 'barisal', 'barishal',
        'rangpur', 'mymensingh', 'comilla', 'cumilla', "cox's bazar", 'bogura', 'bogra',
        'jessore', 'jashore', 'dinajpur', 'tangail', 'feni', 'noakhali', 'kushtia',
        'pabna', 'sirajganj', 'faridpur', 'jamalpur', 'brahmanbaria'
      ].some(city => district.includes(city) || thana.includes(city));

      if (isOutsideDhakaDistrict) {
        const outsideFee = zoneMatrix?.OUTSIDE_DHAKA?.totalDeliveryFeeBDT ?? 200;
        const insideFee = zoneMatrix?.INSIDE_DHAKA?.totalDeliveryFeeBDT ?? 120;
        return {
          isServiceable: false,
          status: 'MISMATCH_WARNING',
          hubTitle: 'Zone Routing Conflict',
          warningTitle: 'Zone Mismatch: Order Address is Outside Dhaka',
          warningDetail: `Order destination is ${order.shippingAddress.district || 'outside Dhaka'}, but 'Inside Dhaka' (৳${insideFee}) is selected. Recalculate to Outside Dhaka (৳${outsideFee}) to ensure automated courier acceptance.`,
          recommendedCourier: 'STEADFAST'
        };
      }

      return {
        isServiceable: true,
        status: 'COVERED',
        hubTitle: rateQuote?.hubName || (
          selectedCourier === 'STEADFAST'
            ? 'Steadfast Tejgaon Hub (100% Dhaka Metro Coverage)'
            : 'Pathao Aladdin Metro Fleet (Same-Day Dhaka Delivery)'
        )
      };
    }

    if (selectedZone === 'OUTSIDE_DHAKA') {
      if (selectedCourier === 'PATHAO') {
        const isPathaoSupportedOutsideCity = [
          'chittagong', 'chattogram', 'sylhet', 'gazipur', 'narayanganj', 'savar'
        ].some(city => district.includes(city) || thana.includes(city));

        if (!isPathaoSupportedOutsideCity) {
          return {
            isServiceable: false,
            status: 'OUT_OF_SERVICE',
            hubTitle: 'Pathao Regional Hub Offline',
            warningTitle: `Zone Out of Service: Pathao Express Does Not Cover ${order.shippingAddress.district || 'Outside Dhaka'}`,
            warningDetail: `Pathao Courier's direct merchant API does not service regional thanas in ${order.shippingAddress.district || 'this district'}. Consignments booked with Pathao in this zone risk rejection or indefinite delay.`,
            recommendedCourier: 'STEADFAST'
          };
        }
      }

      return {
        isServiceable: true,
        status: 'COVERED',
        hubTitle: rateQuote?.hubName || (
          selectedCourier === 'STEADFAST'
            ? `Steadfast Nationwide Hub (${order.shippingAddress.district || 'Regional'} Center · 64 Districts Active)`
            : `Pathao Regional Express Hub (${order.shippingAddress.district || 'Major City'} Center)`
        )
      };
    }

    return {
      isServiceable: true,
      status: 'COVERED',
      hubTitle: 'Courier Transit Center Verified'
    };
  }, [
    isCoverageValidationEnabled,
    simulateOutOfService,
    selectedCourier,
    selectedZone,
    order.shippingAddress,
    zoneMatrix,
    rateQuote?.hubName
  ]);

  // Handle courier switch with optional zone-change synchronization
  const handleCourierSelect = async (courier: CourierProvider) => {
    setSelectedCourier(courier);
    if (onZoneChange && courier !== order.courier) {
      setIsUpdatingZone(true);
      try {
        await onZoneChange(order.id, selectedZone, courier, {
          deliveryType: courier === 'PATHAO' && selectedZone === 'INSIDE_DHAKA' ? pathaoDeliveryType : 48,
          weightKg
        });
      } finally {
        setIsUpdatingZone(false);
      }
    }
  };

  // Handle immediate Delivery Zone toggle with auto fee update
  const handleZoneSelect = async (zone: DeliveryZone) => {
    setSelectedZone(zone);
    if (onZoneChange && zone !== order.shippingAddress.deliveryZone) {
      setIsUpdatingZone(true);
      try {
        await onZoneChange(order.id, zone, selectedCourier, {
          deliveryType: selectedCourier === 'PATHAO' && zone === 'INSIDE_DHAKA' ? pathaoDeliveryType : 48,
          weightKg
        });
      } finally {
        setIsUpdatingZone(false);
      }
    }
  };

  // Handle Dispatch & Instant Consignment Modal Trigger
  const handleTriggerDispatch = async () => {
    const consignmentNote = await onDispatch(
      order.id,
      selectedCourier,
      selectedZone,
      instructionNote,
      {
        deliveryType: selectedCourier === 'PATHAO' && selectedZone === 'INSIDE_DHAKA' ? pathaoDeliveryType : 48,
        weightKg,
        calculatedFeeBDT: deliveryFee
      }
    );
    if (consignmentNote) {
      onOpenConsignmentNote(consignmentNote, 'PREVIEW_MOCK_4X6');
    }
  };

  const handleCopyTracking = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  const steadfastDisplayFee = courierMatrix?.STEADFAST?.totalDeliveryFeeBDT ?? (selectedZone === 'INSIDE_DHAKA' ? 120 : 200);
  const pathaoDisplayFee = courierMatrix?.PATHAO?.totalDeliveryFeeBDT ?? (selectedZone === 'INSIDE_DHAKA' ? 100 : 180);
  const insideDhakaFee = zoneMatrix?.INSIDE_DHAKA?.totalDeliveryFeeBDT ?? (selectedCourier === 'PATHAO' ? 100 : 120);
  const outsideDhakaFee = zoneMatrix?.OUTSIDE_DHAKA?.totalDeliveryFeeBDT ?? (selectedCourier === 'PATHAO' ? 180 : 200);

  return (
    <div
      className={`bg-white text-neutral-800 rounded-xl p-5 sm:p-6 border shadow-sm space-y-5 font-aeonik font-sans transition-all ${
        !coverageResult.isServiceable && isCoverageValidationEnabled
          ? 'border-rose-300 ring-2 ring-rose-100'
          : 'border-neutral-200/90'
      }`}
    >
      {/* Control Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
              !coverageResult.isServiceable && isCoverageValidationEnabled
                ? 'bg-rose-50 text-rose-600 border-rose-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}
          >
            <Truck className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-base font-semibold text-neutral-900 tracking-tight">
                Courier Dispatch & Dynamic Shipping Calculator
              </h4>
              <span className="text-xs font-medium px-2 py-0.5 rounded-sm bg-neutral-100 text-neutral-700 border border-neutral-200">
                Live Tariff API
              </span>
            </div>
            <div className="text-xs text-neutral-500 flex items-center gap-2 mt-0.5 flex-wrap">
              <span>
                Order: <strong className="text-neutral-800 font-semibold">{order.orderNumber}</strong>
              </span>
              <span>·</span>
              <span>
                Customer: <strong className="text-neutral-800 font-semibold">{order.customerName}</strong>
              </span>
              <span>·</span>
              <span className="text-neutral-700 font-medium">
                {order.shippingAddress.thana ? `${order.shippingAddress.thana}, ` : ''}
                {order.shippingAddress.district || 'Dhaka'}
              </span>
            </div>
          </div>
        </div>

        {isDispatched ? (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1 rounded-sm bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Dispatched via {order.courier}
            </span>
          </div>
        ) : (
          <span className="text-xs font-medium px-3 py-1 rounded-sm bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            Ready for Courier Assignment
          </span>
        )}
      </div>

      {/* Real-Time Coverage Validation Toggle Bar */}
      <div className="p-3.5 bg-neutral-50 rounded-lg border border-neutral-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsCoverageValidationEnabled(!isCoverageValidationEnabled)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isCoverageValidationEnabled ? 'bg-emerald-600' : 'bg-neutral-300'
            }`}
            title="Toggle Real-Time Courier Coverage Validation"
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                isCoverageValidationEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-neutral-800">
                Real-Time Coverage Validation
              </span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-sm font-medium ${
                  isCoverageValidationEnabled
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-neutral-200 text-neutral-700'
                }`}
              >
                {isCoverageValidationEnabled ? 'Active' : 'Bypassed'}
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Cross-checks {selectedCourier} hub coverage for{' '}
              {order.shippingAddress.district || 'destination'} (
              {selectedZone === 'INSIDE_DHAKA' ? 'Inside Dhaka' : 'Outside Dhaka'})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            type="button"
            onClick={() => setSimulateOutOfService(!simulateOutOfService)}
            className={`text-xs px-3 py-1 rounded-md border font-medium cursor-pointer transition-colors ${
              simulateOutOfService
                ? 'bg-rose-100 border-rose-300 text-rose-800'
                : 'bg-white border-neutral-300 text-neutral-600 hover:text-neutral-900 hover:border-neutral-400'
            }`}
            title="Simulate an out-of-service location to test the warning interface"
          >
            {simulateOutOfService ? '● Simulating Out-of-Service' : 'Test Out-of-Service Zone'}
          </button>
        </div>
      </div>

      {/* Out-Of-Service Warning Notice */}
      {isCoverageValidationEnabled && !coverageResult.isServiceable && (
        <div className="p-4 bg-rose-50/90 rounded-lg border-2 border-rose-300 text-rose-950 space-y-2.5 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-rose-100 rounded-md text-rose-700 shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            </div>

            <div className="flex-grow space-y-1">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h5 className="text-sm font-bold text-rose-900 flex items-center gap-1.5">
                  <AlertOctagon className="w-4 h-4 text-rose-600" />
                  <span>{coverageResult.warningTitle || 'Zone Out of Service'}</span>
                </h5>
                <span className="text-xs uppercase bg-rose-200 text-rose-900 px-2.5 py-0.5 rounded-sm font-bold">
                  Carrier Unserviceable
                </span>
              </div>

              <p className="text-xs text-rose-800 leading-relaxed">
                {coverageResult.warningDetail}
              </p>

              {coverageResult.recommendedCourier && (
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-rose-900 font-medium">Suggested Solution:</span>
                  <button
                    type="button"
                    onClick={() => handleCourierSelect(coverageResult.recommendedCourier!)}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <CheckCheck className="w-4 h-4" />
                    <span>Switch to {coverageResult.recommendedCourier} (Full Coverage)</span>
                  </button>

                  {coverageResult.status === 'MISMATCH_WARNING' && (
                    <button
                      type="button"
                      onClick={() => handleZoneSelect('OUTSIDE_DHAKA')}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold transition-all cursor-pointer shadow-xs"
                    >
                      Update to Outside Dhaka (৳{zoneMatrix?.OUTSIDE_DHAKA?.totalDeliveryFeeBDT ?? 200})
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Coverage Confirmed Badge */}
      {isCoverageValidationEnabled && coverageResult.isServiceable && (
        <div className="px-3.5 py-2.5 bg-emerald-50/70 rounded-lg border border-emerald-200 text-emerald-900 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium text-xs text-emerald-900">
              Coverage Confirmed: <strong>{coverageResult.hubTitle}</strong>
            </span>
          </div>
          <span className="text-xs text-emerald-700 font-medium hidden sm:inline">
            Active Hub (Est. {rateQuote?.estimatedSla || '24–48h'} Delivery)
          </span>
        </div>
      )}

      {/* Main Dual Grid: Courier Selection & Delivery Zone Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Courier Provider Selection (Steadfast vs Pathao) */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-neutral-700 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-neutral-500" />
              1. Select Courier Gateway
            </span>
            <span className="text-xs text-neutral-400">Live Tariff Quote</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {/* Steadfast Courier Button */}
            <button
              type="button"
              onClick={() => handleCourierSelect('STEADFAST')}
              className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between relative group ${
                selectedCourier === 'STEADFAST'
                  ? isCoverageValidationEnabled && !coverageResult.isServiceable
                    ? 'border-rose-400 bg-rose-50/60 ring-2 ring-rose-200 text-neutral-900 shadow-xs'
                    : 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20 text-neutral-900 shadow-xs'
                  : 'border-neutral-200 bg-white text-neutral-700 hover:border-emerald-300 hover:bg-emerald-50/20'
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="font-semibold text-sm flex items-center gap-1.5 text-emerald-800">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  Steadfast
                </span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-200">
                  ৳{steadfastDisplayFee}
                </span>
              </div>
              <div className="mt-2 space-y-0.5">
                <div className="text-xs font-medium text-emerald-900 flex items-center justify-between">
                  <span>Nationwide 64 Districts</span>
                  {selectedCourier === 'STEADFAST' && (
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                  )}
                </div>
                <div className="text-[11px] text-neutral-500">
                  {courierMatrix?.STEADFAST?.estimatedSla || '18–48 Hours'} · /create_order
                </div>
              </div>
            </button>

            {/* Pathao Express Courier Button */}
            <button
              type="button"
              onClick={() => handleCourierSelect('PATHAO')}
              className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between relative group ${
                selectedCourier === 'PATHAO'
                  ? isCoverageValidationEnabled && !coverageResult.isServiceable
                    ? 'border-rose-400 bg-rose-50/60 ring-2 ring-rose-200 text-neutral-900 shadow-xs'
                    : 'border-rose-600 bg-rose-50/60 ring-2 ring-rose-500/20 text-neutral-900 shadow-xs'
                  : 'border-neutral-200 bg-white text-neutral-700 hover:border-rose-300 hover:bg-rose-50/20'
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="font-semibold text-sm flex items-center gap-1.5 text-rose-700">
                  <Send className="w-4 h-4 text-rose-600" />
                  Pathao
                </span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-900 border border-rose-200">
                  ৳{pathaoDisplayFee}
                </span>
              </div>
              <div className="mt-2 space-y-0.5">
                <div className="text-xs font-medium text-rose-900 flex items-center justify-between">
                  <span>Pathao Express</span>
                  {selectedCourier === 'PATHAO' && (
                    <Check className="w-3.5 h-3.5 text-rose-700" />
                  )}
                </div>
                <div className="text-[11px] text-neutral-500">
                  {courierMatrix?.PATHAO?.estimatedSla || 'Same-Day / Tier-1'}
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* 2. Delivery Zone Selection (Live Courier-Specific Rates) */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-neutral-700 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-neutral-500" />
              2. Choose Delivery Destination Zone
            </span>
            {isUpdatingZone || isCalculatingRate ? (
              <span className="text-xs text-blue-600 animate-pulse font-medium">
                Syncing live rates...
              </span>
            ) : (
              <span className="text-xs text-neutral-400">
                Rates for {selectedCourier} ({weightKg} kg)
              </span>
            )}
          </label>
          <div className="grid grid-cols-2 gap-3">
            {/* Inside Dhaka */}
            <button
              type="button"
              onClick={() => handleZoneSelect('INSIDE_DHAKA')}
              className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                selectedZone === 'INSIDE_DHAKA'
                  ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20 text-neutral-900 shadow-xs'
                  : 'border-neutral-200 bg-white text-neutral-700 hover:border-blue-300 hover:bg-blue-50/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-neutral-900">Inside Dhaka</span>
                <span className="font-semibold font-mono text-xs text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-md border border-blue-200">
                  ৳{insideDhakaFee}
                </span>
              </div>
              <div className="mt-2">
                <div className="text-xs font-medium text-neutral-700">Dhaka Metropolitan</div>
                <div className="text-[11px] text-neutral-500 mt-0.5">
                  {zoneMatrix?.INSIDE_DHAKA?.estimatedSla || 'Same-day / Next-day'}
                </div>
              </div>
            </button>

            {/* Outside Dhaka */}
            <button
              type="button"
              onClick={() => handleZoneSelect('OUTSIDE_DHAKA')}
              className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                selectedZone === 'OUTSIDE_DHAKA'
                  ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20 text-neutral-900 shadow-xs'
                  : 'border-neutral-200 bg-white text-neutral-700 hover:border-indigo-300 hover:bg-indigo-50/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-neutral-900">Outside Dhaka</span>
                <span className="font-semibold font-mono text-xs text-indigo-800 bg-indigo-100 px-2.5 py-0.5 rounded-md border border-indigo-200">
                  ৳{outsideDhakaFee}
                </span>
              </div>
              <div className="mt-2">
                <div className="text-xs font-medium text-neutral-700">Inter-District BD</div>
                <div className="text-[11px] text-neutral-500 mt-0.5">
                  {zoneMatrix?.OUTSIDE_DHAKA?.estimatedSla || '48–72h nationwide'}
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Shipping Cost Calculator Panel */}
      <div className="p-4 bg-[#FAF8F5] rounded-lg border border-[#E2D9CB] space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8E0D4] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[#171513] text-[#FAF5EB] flex items-center justify-center shrink-0">
              <Calculator className="w-4 h-4 text-[#C9B28B]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h5 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                  Dynamic Shipping Cost Calculator
                </h5>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white border border-[#DED7CB] text-[#7A7165]">
                  {rateQuote?.rateSource || 'LIVE_TARIFF_ENGINE'}
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                {rateQuote?.serviceTier || `${selectedCourier} Courier Tariff`} ·{' '}
                {order.shippingAddress.district || 'Dhaka'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Parcel Weight Selector */}
            <label className="flex items-center gap-1.5 bg-white border border-[#DED7CB] rounded-md px-2.5 py-1 text-xs">
              <Scale className="w-3.5 h-3.5 text-[#9E7D47]" />
              <span className="text-[11px] text-neutral-500 font-medium">Weight:</span>
              <select
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className="bg-transparent font-mono font-semibold text-neutral-900 text-xs focus:outline-none cursor-pointer"
              >
                {WEIGHT_TIERS.map((tier) => (
                  <option key={tier.value} value={tier.value}>
                    {tier.label}
                  </option>
                ))}
              </select>
            </label>

            {/* Pathao Express vs Normal Delivery Type Toggle (Inside Dhaka) */}
            {selectedCourier === 'PATHAO' && selectedZone === 'INSIDE_DHAKA' && (
              <div className="inline-flex rounded-md border border-[#DED7CB] bg-white p-0.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setPathaoDeliveryType(48)}
                  className={`px-2.5 py-1 rounded cursor-pointer font-medium transition-colors ${
                    pathaoDeliveryType === 48
                      ? 'bg-neutral-900 text-white'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Normal (48h)
                </button>
                <button
                  type="button"
                  onClick={() => setPathaoDeliveryType(12)}
                  className={`px-2.5 py-1 rounded cursor-pointer font-medium transition-colors flex items-center gap-1 ${
                    pathaoDeliveryType === 12
                      ? 'bg-rose-600 text-white'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <Zap className="w-3 h-3" />
                  <span>Same-Day (12h)</span>
                </button>
              </div>
            )}

            {/* Manual Refresh Live Tariff */}
            <button
              type="button"
              onClick={() => fetchRealTimeRate()}
              disabled={isCalculatingRate}
              className="px-2.5 py-1.5 bg-white hover:bg-neutral-100 border border-[#DED7CB] rounded-md text-xs font-medium text-neutral-700 flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Re-query real-time courier rate API"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#9E7D47] ${isCalculatingRate ? 'animate-spin' : ''}`} />
              <span>{isCalculatingRate ? 'Fetching...' : 'Refresh Rate'}</span>
            </button>
          </div>
        </div>

        {rateError && (
          <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded">
            {rateError}
          </div>
        )}

        {/* Itemized Real-Time Rate Breakdown Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
          <div className="bg-white p-2.5 rounded border border-[#E8E2D8]">
            <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">
              Base Zone Tariff
            </div>
            <div className="font-mono font-bold text-sm text-neutral-900 mt-0.5">
              ৳{rateQuote?.baseRateBDT ?? fallbackFee}
            </div>
            <div className="text-[10px] text-neutral-400">Up to 1.0 kg</div>
          </div>

          <div className="bg-white p-2.5 rounded border border-[#E8E2D8]">
            <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">
              Weight Adjustment
            </div>
            <div className="font-mono font-bold text-sm text-neutral-900 mt-0.5">
              {rateQuote && rateQuote.weightSurchargeBDT > 0
                ? `+৳${rateQuote.weightSurchargeBDT}`
                : '৳0'}
            </div>
            <div className="text-[10px] text-neutral-400">Parcel: {weightKg} kg</div>
          </div>

          <div className="bg-white p-2.5 rounded border border-[#E8E2D8]">
            <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">
              Express / COD Fee
            </div>
            <div className="font-mono font-bold text-sm text-neutral-900 mt-0.5">
              ৳
              {(rateQuote?.expressSurchargeBDT || 0) + (rateQuote?.codHandlingFeeBDT || 0)}
            </div>
            <div className="text-[10px] text-neutral-400">
              {rateQuote?.expressSurchargeBDT
                ? 'Same-Day 12h Priority'
                : rateQuote?.codHandlingFeeBDT
                ? 'Inter-City COD Fee'
                : 'VIP COD Waived'}
            </div>
          </div>

          <div className="bg-white p-2.5 rounded border border-[#E8E2D8]">
            <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#9E7D47]" />
              Est. Transit SLA
            </div>
            <div className="font-semibold text-xs text-neutral-900 mt-1">
              {rateQuote?.estimatedSla || '24–48 Hours'}
            </div>
            <div className="text-[10px] text-neutral-400 truncate">
              {selectedZone === 'INSIDE_DHAKA' ? 'Dhaka Metro' : 'Regional Fleet'}
            </div>
          </div>

          <div className="bg-[#171513] text-[#FAF5EB] p-2.5 rounded border border-[#171513] col-span-2 sm:col-span-1">
            <div className="text-[10px] uppercase tracking-wider text-[#C9B28B] font-semibold">
              Live Quoted Rate
            </div>
            <div className="font-mono font-bold text-base text-white mt-0.5">
              ৳{deliveryFee}
            </div>
            <div className="text-[10px] text-neutral-300">
              {selectedCourier} · {selectedZone === 'INSIDE_DHAKA' ? 'DHK' : 'BD'}
            </div>
          </div>
        </div>

        {/* Side-by-Side Carrier Comparison Strip */}
        {rateQuote?.comparison && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white px-3.5 py-2.5 rounded border border-[#E8E2D8] text-xs">
            <div className="flex items-center gap-2 text-neutral-700">
              <ArrowRightLeft className="w-3.5 h-3.5 text-[#9E7D47] shrink-0" />
              <span>
                {rateQuote.comparison.savingsBDT > 0 ? (
                  <>
                    <strong className="text-emerald-700">{selectedCourier}</strong> is{' '}
                    <strong className="font-mono">৳{rateQuote.comparison.savingsBDT}</strong> less
                    expensive than{' '}
                    <strong>{rateQuote.comparison.alternateCourier}</strong> (৳
                    {rateQuote.comparison.alternateTotalFeeBDT} ·{' '}
                    {rateQuote.comparison.alternateEstimatedSla}).
                  </>
                ) : rateQuote.comparison.savingsBDT < 0 ? (
                  <>
                    <strong>{rateQuote.comparison.alternateCourier}</strong> is{' '}
                    <strong className="font-mono text-emerald-700">
                      ৳{Math.abs(rateQuote.comparison.savingsBDT)} cheaper
                    </strong>{' '}
                    (৳{rateQuote.comparison.alternateTotalFeeBDT} ·{' '}
                    {rateQuote.comparison.alternateEstimatedSla})
                    {!rateQuote.comparison.alternateServiceable &&
                      ' — limited regional coverage'}
                    .
                  </>
                ) : (
                  <>
                    Rate parity with{' '}
                    <strong>{rateQuote.comparison.alternateCourier}</strong> at{' '}
                    <strong className="font-mono">
                      ৳{rateQuote.comparison.alternateTotalFeeBDT}
                    </strong>
                    .
                  </>
                )}
              </span>
            </div>

            {rateQuote.comparison.savingsBDT < 0 && rateQuote.comparison.alternateServiceable && (
              <button
                type="button"
                onClick={() => handleCourierSelect(rateQuote.comparison!.alternateCourier)}
                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded text-[11px] font-semibold cursor-pointer transition-colors shrink-0"
              >
                Switch to {rateQuote.comparison.alternateCourier} (৳
                {rateQuote.comparison.alternateTotalFeeBDT})
              </button>
            )}
          </div>
        )}
      </div>

      {/* Financial Settlement & Live Fee Recalculation Summary */}
      <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200/90 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
          <div>
            <span className="text-[11px] text-neutral-500 uppercase tracking-wide block font-medium">
              Subtotal
            </span>
            <span className="text-neutral-900 font-bold text-sm">
              ৳{order.subtotalBDT.toLocaleString()}
            </span>
          </div>

          <span className="text-neutral-300 hidden sm:inline">|</span>

          <div>
            <span className="text-[11px] text-neutral-500 uppercase tracking-wide block font-medium">
              Shipping ({selectedCourier} · {selectedZone === 'INSIDE_DHAKA' ? 'Inside' : 'Outside'})
            </span>
            <span className="text-blue-700 font-bold text-sm font-mono">
              ৳{deliveryFee}
            </span>
          </div>

          <span className="text-neutral-300 hidden sm:inline">|</span>

          <div>
            <span className="text-[11px] text-neutral-500 uppercase tracking-wide block font-medium">
              Recalculated Total
            </span>
            <span className="text-neutral-900 font-bold text-sm">
              ৳{recalculatedTotal.toLocaleString()}
            </span>
          </div>
        </div>

        {order.paymentGateway === 'CASH_ON_DELIVERY' ? (
          <div className="px-3.5 py-1.5 bg-amber-100/80 border border-amber-300 text-amber-900 rounded-md font-semibold flex items-center gap-2 shadow-xs">
            <span className="text-xs uppercase tracking-wide text-amber-800">COD To Collect:</span>
            <span className="text-base font-bold text-amber-950 font-mono">
              ৳{recalculatedCodAmount.toLocaleString()}
            </span>
            {order.isAdvanceDeliveryPaid && (
              <span className="text-[11px] text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded font-medium border border-emerald-300">
                Advance ৳{order.advancePaidAmountBDT || 120} Cleared
              </span>
            )}
          </div>
        ) : (
          <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-800 font-medium text-xs flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Prepaid in Full via {order.paymentGateway} (৳0 COD)</span>
          </div>
        )}
      </div>

      {/* Collapsible Courier Special Instructions */}
      <div>
        <button
          type="button"
          onClick={() => setShowNotesField(!showNotesField)}
          className="text-xs font-medium text-neutral-600 hover:text-neutral-900 flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          {showNotesField ? (
            <ChevronUp className="w-4 h-4 text-neutral-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-neutral-500" />
          )}
          <span>
            {showNotesField
              ? 'Hide Courier Delivery Instructions'
              : 'Add Special Delivery Instructions / Rider Notes'}
          </span>
        </button>

        {showNotesField && (
          <div className="mt-2">
            <textarea
              rows={2}
              value={instructionNote}
              onChange={(e) => setInstructionNote(e.target.value)}
              placeholder="e.g. Fragile 1-of-1 archival garment. Verify customer phone number before handover."
              className="w-full bg-white border border-neutral-300 rounded-lg p-3 text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 transition-all font-sans"
            />
          </div>
        )}
      </div>

      {/* Active Consignment & Live Tracking Details (When Already Dispatched) */}
      {isDispatched && (
        <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200/90 flex flex-wrap items-center justify-between gap-3 text-xs font-sans">
          <div className="space-y-1">
            <div className="text-[11px] uppercase tracking-wide text-neutral-500 font-semibold">
              Official Consignment & Tracking Code
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-neutral-950 font-bold text-sm tracking-wide font-mono">
                {order.trackingCode || 'Tracking Code Pending'}
              </span>
              {order.trackingCode && (
                <button
                  type="button"
                  onClick={() => handleCopyTracking(order.trackingCode)}
                  className="p-1 hover:bg-neutral-200 rounded text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
                  title="Copy Tracking ID"
                >
                  {copiedTracking ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              )}
              {order.consignmentId && (
                <span className="text-xs text-neutral-600 bg-white border border-neutral-200 px-2.5 py-0.5 rounded font-mono">
                  CID: {order.consignmentId}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {order.trackingUrl && (
              <a
                href={order.trackingUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-300 rounded-md font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <span>{order.courier} Portal</span>
                <ExternalLink className="w-3.5 h-3.5 text-neutral-500" />
              </a>
            )}

            <button
              type="button"
              onClick={() => onSyncCourierStatus(order.id)}
              disabled={isSyncing}
              className="px-3.5 py-1.5 bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-300 rounded-md font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="Query live Steadfast or Pathao API"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-neutral-500 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Checkpoint'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Primary Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-3 border-t border-neutral-100">
        {isDispatched && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={async () => {
                try {
                  const res = await adminApiRequest(`/api/admin/orders/${order.id}/consignment-note`);
                  if (res.ok) {
                    const data = await res.json();
                    onOpenConsignmentNote(data.consignmentNote, 'PREVIEW_MOCK_4X6');
                  }
                } catch (e) {
                  console.error('Failed to open consignment note preview', e);
                }
              }}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs tracking-wide rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
              title="Inspect consignment on mock 4x6 shipping label background"
            >
              <Eye className="w-4 h-4 text-neutral-950" />
              <span>Print Preview (4×6 Label)</span>
            </button>

            <button
              type="button"
              onClick={async () => {
                try {
                  const res = await adminApiRequest(`/api/admin/orders/${order.id}/consignment-note`);
                  if (res.ok) {
                    const data = await res.json();
                    onOpenConsignmentNote(data.consignmentNote, 'THERMAL_4X6');
                  }
                } catch (e) {
                  console.error('Failed to open consignment note', e);
                }
              }}
              className="px-3.5 py-2.5 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 rounded-lg font-semibold text-xs tracking-wide flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs hover:border-neutral-400"
              title="Print standard thermal waybill"
            >
              <Printer className="w-4 h-4 text-neutral-600" />
              <span>Waybill</span>
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={handleTriggerDispatch}
          disabled={isDispatching}
          className={`px-6 py-2.5 rounded-lg font-semibold text-xs tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
            isCoverageValidationEnabled && !coverageResult.isServiceable
              ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200'
              : selectedCourier === 'STEADFAST'
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 disabled:bg-emerald-300'
              : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200 disabled:bg-rose-300'
          }`}
        >
          {isDispatching ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              <span>Connecting {selectedCourier} Logistics API...</span>
            </>
          ) : (
            <>
              {isCoverageValidationEnabled && !coverageResult.isServiceable ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-white" />
                  <span>
                    Warning: Out of Service · Override Dispatch ({selectedCourier} · ৳{deliveryFee})
                  </span>
                </>
              ) : selectedCourier === 'STEADFAST' ? (
                <>
                  <Truck className="w-4 h-4 text-white" />
                  <span>
                    {isDispatched
                      ? `Re-Dispatch & Generate Note (${selectedCourier} · ৳${deliveryFee})`
                      : `Dispatch & Generate Note (${selectedCourier} · ৳${deliveryFee})`}
                  </span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-white" />
                  <span>
                    {isDispatched
                      ? `Re-Dispatch & Generate Note (${selectedCourier} · ৳${deliveryFee})`
                      : `Dispatch & Generate Note (${selectedCourier} · ৳${deliveryFee})`}
                  </span>
                </>
              )}
            </>
          )}
        </button>
      </div>
    </div>
  );
};
