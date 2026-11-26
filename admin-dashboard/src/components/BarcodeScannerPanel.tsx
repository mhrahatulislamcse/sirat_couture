import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Barcode,
  Camera,
  CameraOff,
  CheckCircle2,
  AlertCircle,
  Truck,
  PackageCheck,
  Send,
  Volume2,
  VolumeX,
  Eye,
  Printer,
  Trash2,
  Search,
  Upload,
  RefreshCw
} from 'lucide-react';
import {
  Order,
  CourierProvider,
  ConsignmentNote,
  BarcodeScanResult
} from '../types/resale';
import { SkuBarcode } from './SkuBarcode';
import { QRCodeSVG } from 'qrcode.react';
import { adminApiRequest } from '../lib/adminApiClient';

interface BarcodeScannerPanelProps {
  orders: Order[];
  onOrderUpdated: (updatedOrder?: Order) => void;
  onOpenConsignmentNote: (
    note: ConsignmentNote,
    initialMode?: 'PREVIEW_MOCK_4X6' | 'THERMAL_4X6' | 'A4_FULL'
  ) => void;
}

interface ScanHistoryEntry {
  id: string;
  timestamp: string;
  scannedCode: string;
  success: boolean;
  matchedBy?: string;
  orderNumber?: string;
  itemSku?: string;
  itemTitle?: string;
  previousStatus?: string;
  newStatus?: string;
  message: string;
  consignmentNote?: ConsignmentNote;
}

// Type augmentation for experimental Chromium BarcodeDetector API
interface DetectedBarcode {
  rawValue: string;
  format: string;
}

interface NativeBarcodeDetector {
  detect(source: ImageBitmapSource): Promise<DetectedBarcode[]>;
}

declare global {
  interface Window {
    BarcodeDetector?: {
      new (options?: { formats?: string[] }): NativeBarcodeDetector;
      getSupportedFormats?: () => Promise<string[]>;
    };
  }
}

export const BarcodeScannerPanel: React.FC<BarcodeScannerPanelProps> = ({
  orders,
  onOrderUpdated,
  onOpenConsignmentNote
}) => {
  const [barcodeInput, setBarcodeInput] = useState('');
  const [targetAction, setTargetAction] = useState<'READY_FOR_PICKUP' | 'DISPATCHED_COURIER'>(
    'DISPATCHED_COURIER'
  );
  const [selectedCourier, setSelectedCourier] = useState<CourierProvider>('STEADFAST');
  const [autoApplyOnScan, setAutoApplyOnScan] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<BarcodeScanResult | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanHistoryEntry[]>([]);

  // Live Camera Scanner State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [hasNativeDetector, setHasNativeDetector] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorIntervalRef = useRef<number | null>(null);
  const lastCooldownScanRef = useRef<{ code: string; at: number }>({ code: '', at: 0 });

  useEffect(() => {
    setHasNativeDetector(typeof window !== 'undefined' && 'BarcodeDetector' in window);
  }, []);

  // Keep USB / Bluetooth barcode wedge input focused
  useEffect(() => {
    const timer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => window.clearTimeout(timer);
  }, []);

  const playBeep = useCallback(
    (isSuccess: boolean) => {
      if (!soundEnabled || typeof window === 'undefined') return;
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = isSuccess ? 'sine' : 'sawtooth';
        osc.frequency.setValueAtTime(isSuccess ? 980 : 260, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (isSuccess ? 0.14 : 0.25));
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + (isSuccess ? 0.15 : 0.26));
      } catch {
        // Ignore audio context restriction errors
      }
    },
    [soundEnabled]
  );

  const stopCamera = useCallback(() => {
    if (detectorIntervalRef.current) {
      window.clearInterval(detectorIntervalRef.current);
      detectorIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const executeScan = useCallback(
    async (
      rawCode: string,
      overrideStatus?: 'READY_FOR_PICKUP' | 'DISPATCHED_COURIER',
      overrideAutoApply?: boolean
    ) => {
      const cleaned = rawCode.trim();
      if (!cleaned) return;

      const effectiveTarget = overrideStatus || targetAction;
      const effectiveAutoApply = overrideAutoApply !== undefined ? overrideAutoApply : autoApplyOnScan;

      setIsProcessing(true);
      try {
        const res = await adminApiRequest('/api/admin/orders/scan-barcode', {
          method: 'POST',
          body: JSON.stringify({
            code: cleaned,
            targetStatus: effectiveTarget,
            courier: selectedCourier,
            autoApply: effectiveAutoApply
          })
        });

        const data: BarcodeScanResult = await res.json();
        setLastResult(data);

        if (res.ok && data.success) {
          playBeep(true);
          setBarcodeInput('');
          if (data.applied) {
            onOrderUpdated(data.order);
          }
          setScanHistory((prev) => [
            {
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              timestamp: new Date().toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              }),
              scannedCode: data.scannedCode,
              success: true,
              matchedBy: data.matchedBy,
              orderNumber: data.order?.orderNumber,
              itemSku: data.matchedItem?.sku,
              itemTitle: data.matchedItem?.title,
              previousStatus: data.previousStatus,
              newStatus: data.newStatus,
              message: data.message,
              consignmentNote: data.consignmentNote
            },
            ...prev.slice(0, 24)
          ]);
        } else {
          playBeep(false);
          setScanHistory((prev) => [
            {
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              timestamp: new Date().toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              }),
              scannedCode: cleaned,
              success: false,
              message: data.message || 'Unrecognized SKU barcode'
            },
            ...prev.slice(0, 24)
          ]);
        }
      } catch (err) {
        console.error('Barcode scan request failed', err);
        playBeep(false);
        setLastResult({
          success: false,
          scannedCode: cleaned,
          message: 'Network error communicating with warehouse dispatch endpoint.'
        });
      } finally {
        setIsProcessing(false);
        inputRef.current?.focus();
      }
    },
    [targetAction, autoApplyOnScan, selectedCourier, playBeep, onOrderUpdated]
  );

  const startCamera = async () => {
    setCameraError(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera access is unavailable in this browser context. Use a USB scanner or enter the SKU manually.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      setIsCameraActive(true);

      // Attach stream on next tick after video mounts
      window.setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 60);

      if (window.BarcodeDetector) {
        const detector = new window.BarcodeDetector({
          formats: ['code_128', 'ean_13', 'ean_8', 'code_39', 'qr_code']
        });

        detectorIntervalRef.current = window.setInterval(async () => {
          const videoEl = videoRef.current;
          if (!videoEl || videoEl.readyState < 2) return;
          try {
            const barcodes = await detector.detect(videoEl);
            if (barcodes && barcodes.length > 0) {
              const detectedVal = barcodes[0].rawValue?.trim();
              if (!detectedVal) return;

              const now = Date.now();
              if (
                lastCooldownScanRef.current.code === detectedVal &&
                now - lastCooldownScanRef.current.at < 2500
              ) {
                return;
              }
              lastCooldownScanRef.current = { code: detectedVal, at: now };
              setBarcodeInput(detectedVal);
              await executeScan(detectedVal);
            }
          } catch {
            // Skip frame detection errors cleanly
          }
        }, 350);
      } else {
        setCameraError(
          'Live viewfinder opened, but this browser lacks the native BarcodeDetector API for optical decoding. Use Chrome/Edge or enter/scan the SKU via USB reader.'
        );
      }
    } catch {
      setCameraError(
        'Camera permission was denied or no camera device was detected. You can still scan directly using any USB/Bluetooth barcode gun or type an item SKU.'
      );
      stopCamera();
    }
  };

  const handleImageUploadScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.BarcodeDetector) {
      setCameraError('Image barcode decoding requires Chromium BarcodeDetector support. Enter the SKU manually or use Chrome/Edge.');
      return;
    }

    try {
      const bitmap = await createImageBitmap(file);
      const detector = new window.BarcodeDetector({
        formats: ['code_128', 'ean_13', 'ean_8', 'code_39', 'qr_code']
      });
      const codes = await detector.detect(bitmap);
      if (codes.length > 0 && codes[0].rawValue) {
        const scannedVal = codes[0].rawValue.trim();
        setBarcodeInput(scannedVal);
        await executeScan(scannedVal);
      } else {
        playBeep(false);
        setLastResult({
          success: false,
          scannedCode: file.name,
          message: 'No readable Code-128 or EAN-13 SKU barcode detected in the uploaded image.'
        });
      }
    } catch {
      setCameraError('Could not decode barcode from image.');
    } finally {
      e.target.value = '';
    }
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    executeScan(barcodeInput);
  };

  // Extract order items with SKUs so warehouse staff can test or click-to-scan quickly
  const quickScanItems = orders
    .flatMap((ord) =>
      (ord.items || []).map((it) => ({
        orderId: ord.id,
        orderNumber: ord.orderNumber,
        status: ord.status,
        sku: it.product?.sku || '',
        title: it.product?.title || 'Archival Garment',
        customerName: ord.customerName
      }))
    )
    .filter((entry) => Boolean(entry.sku));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Main Scanner Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Scanner Input, Target Action Mode & Result Verification (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-[#E8E2D8] rounded-xs p-5 sm:p-6 shadow-xs space-y-5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0EAE1] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xs bg-[#171513] text-[#FAF5EB] flex items-center justify-center shrink-0">
                <Barcode className="w-5 h-5 text-[#E5BA6A]" />
              </div>
              <div>
                <h3 className="font-editorial text-xl font-normal text-[#171513]">
                  Consignment SKU <span className="italic">barcode scanner</span>
                </h3>
                <p className="text-xs text-[#7A7165]">
                  Scan any Code-128 item SKU or consignment barcode to update Dhaka Vault dispatch status
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="px-3 py-1.5 border border-[#DED7CB] rounded-xs text-xs font-medium text-[#171513] hover:bg-[#FAF8F5] flex items-center gap-1.5 cursor-pointer self-start sm:self-center"
              title="Toggle scanner audio beep feedback"
            >
              {soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-[#1A4231]" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-[#7A7165]" />
              )}
              <span>{soundEnabled ? 'Beep On' : 'Muted'}</span>
            </button>
          </div>

          {/* Step 1: Target Status Mode Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#171513]">
                1. Action on Barcode Scan
              </label>
              <label className="flex items-center gap-2 text-xs text-[#5C5449] cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoApplyOnScan}
                  onChange={(e) => setAutoApplyOnScan(e.target.checked)}
                  className="accent-[#171513] cursor-pointer"
                />
                <span>Instant auto-update on scan</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTargetAction('READY_FOR_PICKUP')}
                className={`p-3.5 rounded-xs border text-left transition-all cursor-pointer flex items-start gap-3 ${
                  targetAction === 'READY_FOR_PICKUP'
                    ? 'border-[#1A4231] bg-[#EBF7F0]/70 ring-1 ring-[#1A4231]'
                    : 'border-[#DED7CB] bg-white hover:bg-[#FAF8F5]'
                }`}
              >
                <PackageCheck
                  className={`w-5 h-5 shrink-0 mt-0.5 ${
                    targetAction === 'READY_FOR_PICKUP' ? 'text-[#1A4231]' : 'text-[#7A7165]'
                  }`}
                />
                <div>
                  <div className="text-xs font-bold text-[#171513] uppercase tracking-wide">
                    Mark Ready for Pickup
                  </div>
                  <div className="text-[11px] text-[#7A7165] mt-0.5">
                    Garment verified, sealed &amp; staged for courier rider collection
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTargetAction('DISPATCHED_COURIER')}
                className={`p-3.5 rounded-xs border text-left transition-all cursor-pointer flex items-start gap-3 ${
                  targetAction === 'DISPATCHED_COURIER'
                    ? 'border-[#171513] bg-[#FAF5EB] ring-1 ring-[#171513]'
                    : 'border-[#DED7CB] bg-white hover:bg-[#FAF8F5]'
                }`}
              >
                <Truck
                  className={`w-5 h-5 shrink-0 mt-0.5 ${
                    targetAction === 'DISPATCHED_COURIER' ? 'text-[#9E7D47]' : 'text-[#7A7165]'
                  }`}
                />
                <div>
                  <div className="text-xs font-bold text-[#171513] uppercase tracking-wide">
                    Mark Dispatched
                  </div>
                  <div className="text-[11px] text-[#7A7165] mt-0.5">
                    Handed over to courier fleet &amp; logs tracking consignment
                  </div>
                </div>
              </button>
            </div>

            {targetAction === 'DISPATCHED_COURIER' && (
              <div className="flex items-center justify-between pt-1 text-xs text-[#5C5449]">
                <span>Assign courier if not yet booked:</span>
                <div className="flex items-center gap-1 p-0.5 bg-[#FAF8F5] border border-[#DED7CB] rounded-xs">
                  {(['STEADFAST', 'PATHAO'] as CourierProvider[]).map((carrier) => (
                    <button
                      key={carrier}
                      type="button"
                      onClick={() => setSelectedCourier(carrier)}
                      className={`px-3 py-1 text-[11px] font-mono font-bold rounded-2xs cursor-pointer transition-colors ${
                        selectedCourier === carrier
                          ? 'bg-[#171513] text-[#FAF5EB]'
                          : 'text-[#7A7165] hover:text-[#171513]'
                      }`}
                    >
                      {carrier}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Step 2: USB Wedge / Keyboard Barcode Input */}
          <form onSubmit={handleSubmitForm} className="space-y-2">
            <label htmlFor="sku-barcode-input" className="text-xs font-semibold text-[#171513] block">
              2. Scan Consignment SKU Barcode or Enter Code
            </label>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#9E7D47] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="sku-barcode-input"
                  ref={inputRef}
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  placeholder="Scan SKU (e.g. MM6-FOO-1999-7A8B) or Consignment ID..."
                  autoComplete="off"
                  className="w-full pl-9 pr-4 py-2.5 text-sm font-mono bg-[#FAF8F5] border border-[#DED7CB] rounded-xs text-[#171513] focus:outline-none focus:border-[#171513] focus:bg-white transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isProcessing || !barcodeInput.trim()}
                className="px-5 py-2.5 bg-[#171513] hover:bg-[#9E7D47] disabled:bg-neutral-300 text-[#FAF5EB] text-xs font-bold uppercase tracking-wider rounded-xs transition-colors cursor-pointer flex items-center justify-center gap-2 shrink-0"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Scanning...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>{autoApplyOnScan ? 'Scan & Apply' : 'Lookup Order'}</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick-Scan Consignment Note SKU Buttons from Active Orders */}
          {quickScanItems.length > 0 && (
            <div className="space-y-2 pt-1">
              <div className="text-[11px] font-medium text-[#7A7165]">
                Quick-scan SKUs from current pipeline orders:
              </div>
              <div className="flex flex-wrap gap-2">
                {quickScanItems.map((entry) => (
                  <button
                    key={`${entry.orderId}-${entry.sku}`}
                    type="button"
                    onClick={() => {
                      setBarcodeInput(entry.sku);
                      executeScan(entry.sku);
                    }}
                    className="px-3 py-1.5 bg-[#FAF8F5] hover:bg-[#FAF5EB] border border-[#DED7CB] hover:border-[#9E7D47] rounded-xs text-left transition-colors cursor-pointer"
                  >
                    <div className="font-mono text-[11px] font-bold text-[#171513]">{entry.sku}</div>
                    <div className="text-[10px] text-[#7A7165]">
                      {entry.orderNumber} · {entry.status.replace(/_/g, ' ')}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Scan Result Feedback Card */}
          {lastResult && (
            <div
              className={`p-4 rounded-xs border space-y-3 ${
                lastResult.success
                  ? 'bg-[#EBF7F0]/70 border-[#A8DFC5] text-[#171513]'
                  : 'bg-rose-50 border-rose-200 text-rose-950'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  {lastResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-[#1A4231] shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="text-sm font-bold">{lastResult.message}</div>
                    {lastResult.matchedBy && (
                      <div className="text-[11px] font-mono text-[#5C5449] mt-0.5">
                        Matched via {lastResult.matchedBy.replace(/_/g, ' ')} · Code: {lastResult.scannedCode}
                      </div>
                    )}
                  </div>
                </div>

                {lastResult.consignmentNote && (
                  <button
                    type="button"
                    onClick={() => onOpenConsignmentNote(lastResult.consignmentNote!, 'PREVIEW_MOCK_4X6')}
                    className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs rounded-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>4×6 Preview</span>
                  </button>
                )}
              </div>

              {lastResult.success && lastResult.order && (
                <div className="pt-2 border-t border-black/10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-[#5C5449] block">
                      Order &amp; Client
                    </span>
                    <span className="font-bold font-mono">{lastResult.order.orderNumber}</span>
                    <div className="text-[11px] text-[#5C5449]">{lastResult.order.customerName}</div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono text-[#5C5449] block">
                      Scanned Item
                    </span>
                    <span className="font-mono font-bold">{lastResult.matchedItem?.sku}</span>
                    <div className="text-[11px] text-[#5C5449] truncate">
                      {lastResult.matchedItem?.title}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono text-[#5C5449] block">
                      Order Status
                    </span>
                    <span className="font-mono font-bold text-[#1A4231]">
                      {lastResult.previousStatus !== lastResult.newStatus
                        ? `${lastResult.previousStatus} → ${lastResult.newStatus}`
                        : lastResult.newStatus}
                    </span>
                    {lastResult.order.trackingCode && (
                      <div className="text-[10px] font-mono text-[#5C5449]">
                        {lastResult.order.courier}: {lastResult.order.trackingCode}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Explicit Action Buttons (useful if Auto-Apply is off or staff wants to toggle) */}
              {lastResult.success && lastResult.order && (
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => executeScan(lastResult.scannedCode, 'READY_FOR_PICKUP', true)}
                    disabled={isProcessing}
                    className="px-3.5 py-1.5 bg-[#1A4231] hover:bg-[#143326] text-white text-xs font-semibold rounded-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <PackageCheck className="w-3.5 h-3.5" />
                    <span>Mark Ready for Pickup</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => executeScan(lastResult.scannedCode, 'DISPATCHED_COURIER', true)}
                    disabled={isProcessing}
                    className="px-3.5 py-1.5 bg-[#171513] hover:bg-[#9E7D47] text-[#FAF5EB] text-xs font-semibold rounded-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Mark Dispatched ({selectedCourier})</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Live Camera Viewfinder & Reference Sample Barcode (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white border border-[#E8E2D8] rounded-xs p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#F0EAE1] pb-3">
              <div>
                <h4 className="text-sm font-bold text-[#171513]">Optical Camera Scanner</h4>
                <p className="text-[11px] text-[#7A7165]">
                  {hasNativeDetector
                    ? 'Code-128 & EAN-13 live camera decoding ready'
                    : 'USB wedge & manual entry active; upload or open camera'}
                </p>
              </div>
              {isCameraActive ? (
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <CameraOff className="w-3.5 h-3.5" />
                  <span>Stop Camera</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-3 py-1.5 bg-[#171513] hover:bg-[#9E7D47] text-[#FAF5EB] text-xs font-semibold rounded-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Start Camera</span>
                </button>
              )}
            </div>

            <div className="relative aspect-video bg-[#171513] rounded-xs overflow-hidden flex items-center justify-center border border-[#2E2A26]">
              {isCameraActive ? (
                <>
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* Aiming Reticle */}
                  <div className="absolute inset-x-10 inset-y-8 border-2 border-[#E5BA6A]/80 rounded-xs pointer-events-none flex items-center justify-center">
                    <div className="w-full h-0.5 bg-rose-500/80 animate-pulse" />
                  </div>
                </>
              ) : (
                <div className="text-center px-6 space-y-2 text-[#A89F91]">
                  <Camera className="w-8 h-8 mx-auto text-[#C9B28B]" />
                  <p className="text-xs text-[#FAF5EB] font-medium">
                    Point webcam or mobile camera at the consignment SKU barcode
                  </p>
                  <p className="text-[11px] text-[#A89F91]">
                    Or scan directly with a handheld USB/Bluetooth scanner into the input box on the left.
                  </p>
                </div>
              )}
            </div>

            {cameraError && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xs text-[11px] text-amber-900">
                {cameraError}
              </div>
            )}

            <div className="flex items-center justify-between pt-1 border-t border-[#F0EAE1]">
              <span className="text-[11px] text-[#7A7165]">Or upload a photo of a consignment label:</span>
              <label className="px-3 py-1.5 bg-[#FAF8F5] hover:bg-[#FAF5EB] border border-[#DED7CB] rounded-xs text-xs font-medium text-[#171513] cursor-pointer flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-[#9E7D47]" />
                <span>Decode Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUploadScan}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Live Code-128 Barcode & QR Code Reference Card */}
          {quickScanItems[0] && (
            <div className="bg-white border border-[#E8E2D8] rounded-xs p-4 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#171513]">Consignment SKU Barcode &amp; QR Reference</span>
                <span className="font-mono text-[11px] text-[#7A7165]">Code-128 + QR</span>
              </div>
              <div className="p-3 bg-[#FAF8F5] border border-[#E8E2D8] rounded-xs flex flex-col sm:flex-row items-center justify-center gap-4">
                <div className="p-2 bg-white border border-[#E8E2D8] rounded-xs shrink-0">
                  <QRCodeSVG
                    value={barcodeInput.trim() || quickScanItems[0].sku}
                    size={72}
                    level="M"
                    bgColor="#FFFFFF"
                    fgColor="#171513"
                  />
                </div>
                <div className="flex flex-col items-center gap-1.5 min-w-0">
                  <SkuBarcode
                    value={barcodeInput.trim() || quickScanItems[0].sku}
                    height={42}
                    width={1.4}
                    displayValue={true}
                    fontSize={11}
                  />
                  <span className="text-[11px] text-[#7A7165] text-center">
                    {barcodeInput.trim()
                      ? `Previewing entered code: ${barcodeInput.trim()}`
                      : `${quickScanItems[0].orderNumber} · ${quickScanItems[0].title}`}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Session Scan Activity Log */}
      <div className="bg-white border border-[#E8E2D8] rounded-xs shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#F0EAE1] flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-[#171513]">Dispatch Shift Scan Ledger</h4>
            <p className="text-[11px] text-[#7A7165]">
              Chronological audit log of SKU scans during this admin session
            </p>
          </div>
          {scanHistory.length > 0 && (
            <button
              type="button"
              onClick={() => setScanHistory([])}
              className="text-xs text-[#7A7165] hover:text-rose-700 flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Log</span>
            </button>
          )}
        </div>

        {scanHistory.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#7A7165]">
            No consignment SKUs scanned yet in this shift. Use the scanner input or tap a quick-scan SKU above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#E8E2D8] text-[#7A7165] font-mono uppercase text-[10px]">
                  <th className="py-2.5 px-4">Time</th>
                  <th>Scanned Code</th>
                  <th>Order &amp; Item</th>
                  <th>Status Result</th>
                  <th className="text-right px-4">Waybill</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EAE1]">
                {scanHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FAF8F5]">
                    <td className="py-2.5 px-4 font-mono text-[#7A7165]">{item.timestamp}</td>
                    <td className="font-mono font-bold text-[#171513]">{item.scannedCode}</td>
                    <td>
                      {item.orderNumber ? (
                        <div>
                          <span className="font-mono font-semibold text-[#171513]">
                            {item.orderNumber}
                          </span>
                          <div className="text-[11px] text-[#7A7165] truncate max-w-xs">
                            {item.itemTitle}
                          </div>
                        </div>
                      ) : (
                        <span className="text-rose-700">{item.message}</span>
                      )}
                    </td>
                    <td>
                      {item.success ? (
                        <span className="font-mono font-semibold text-[#1A4231]">
                          {item.newStatus}
                        </span>
                      ) : (
                        <span className="font-mono text-rose-700">Not Found</span>
                      )}
                    </td>
                    <td className="text-right px-4">
                      {item.consignmentNote && (
                        <button
                          type="button"
                          onClick={() => onOpenConsignmentNote(item.consignmentNote!, 'THERMAL_4X6')}
                          className="px-2.5 py-1 text-[11px] border border-[#DED7CB] hover:bg-white rounded-xs text-[#171513] cursor-pointer inline-flex items-center gap-1"
                        >
                          <Printer className="w-3 h-3 text-[#9E7D47]" />
                          <span>Label</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
