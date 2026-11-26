import React, { useRef, useState, useEffect } from 'react';
import {
  X,
  Printer,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Truck,
  FileText,
  Tag,
  QrCode,
  Eye,
  Box,
  Layers,
  ZoomIn,
  ZoomOut,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Ruler
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { SkuBarcode } from './SkuBarcode';
import { ConsignmentNote } from '../types/resale';
import {
  ThermalSlip1,
  ThermalSlip2,
  ThermalPerforationBreak,
  formatBDT,
  getProvenanceUrl,
  renderSvgBarcode
} from './ThermalConsignmentSlips';
import { PrintPreviewModal } from './PrintPreviewModal';

export type ConsignmentViewMode = 'PREVIEW_MOCK_4X6' | 'THERMAL_4X6' | 'A4_FULL';
export type MockBackgroundType = 'CARDBOARD' | 'POLYMAILER' | 'THERMAL_ROLL' | 'STUDIO';
export type SlipFilterType = 'ALL' | 'SLIP_1' | 'SLIP_2';

interface ConsignmentNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  consignmentNote: ConsignmentNote | null;
  initialMode?: ConsignmentViewMode;
  autoOpenPrintPreview?: boolean;
}

export const ConsignmentNoteModal: React.FC<ConsignmentNoteModalProps> = ({
  isOpen,
  onClose,
  consignmentNote,
  initialMode = 'PREVIEW_MOCK_4X6',
  autoOpenPrintPreview = false
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [viewMode, setViewMode] = useState<ConsignmentViewMode>(initialMode);
  const [mockBackground, setMockBackground] = useState<MockBackgroundType>('CARDBOARD');
  const [activeSlip, setActiveSlip] = useState<SlipFilterType>('ALL');
  const [zoomScale, setZoomScale] = useState<number>(100);
  const [showPreflightDetail, setShowPreflightDetail] = useState(false);
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState<boolean>(autoOpenPrintPreview);
  const printRef = useRef<HTMLDivElement>(null);

  // Sync initialMode / autoOpenPrintPreview if prop changes
  useEffect(() => {
    if (initialMode) {
      setViewMode(initialMode);
    }
  }, [initialMode]);

  useEffect(() => {
    if (isOpen && autoOpenPrintPreview) {
      setIsPrintPreviewOpen(true);
    } else if (!isOpen) {
      setIsPrintPreviewOpen(false);
    }
  }, [isOpen, autoOpenPrintPreview]);

  if (!isOpen || !consignmentNote) return null;

  const provenanceUrl = getProvenanceUrl(consignmentNote);

  const handlePrint = () => {
    // For thermal 4x6 modes, open the forced 4x6 Print Preview modal first before triggering browser print
    if (viewMode === 'PREVIEW_MOCK_4X6' || viewMode === 'THERMAL_4X6') {
      setIsPrintPreviewOpen(true);
      return;
    }
    window.print();
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyProvenanceLink = () => {
    navigator.clipboard.writeText(provenanceUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Background style helper for Mock Preview
  const getMockBackgroundClass = () => {
    switch (mockBackground) {
      case 'CARDBOARD':
        return 'bg-[#C2A27A] shadow-[inset_0_0_80px_rgba(80,50,20,0.35)]';
      case 'POLYMAILER':
        return 'bg-[#1C1E24] shadow-[inset_0_0_80px_rgba(0,0,0,0.7)]';
      case 'THERMAL_ROLL':
        return 'bg-[#EFE6C9] shadow-[inset_0_0_60px_rgba(150,130,80,0.25)]';
      case 'STUDIO':
      default:
        return 'bg-[#E5E7EB] shadow-[inset_0_0_60px_rgba(0,0,0,0.1)]';
    }
  };

  // Only one element in the DOM may own #printable-consignment-note during browser print
  const printableContainerId = isPrintPreviewOpen
    ? 'consignment-note-background'
    : 'printable-consignment-note';

  return (
    <>
      <div
        className={`fixed inset-0 z-60 bg-black/85 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200 ${
          isPrintPreviewOpen
            ? 'print:hidden'
            : 'print:bg-transparent print:p-0 print:static print:overflow-visible'
        }`}
      >
        {/* ========================================================================= */}
        {/* TOP DOCKED CONTROLS & ACTION BAR (Hidden in print)                        */}
        {/* ========================================================================= */}
        <header className="fixed top-3 left-3 right-3 sm:left-auto sm:right-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 z-70 print:hidden bg-neutral-900/95 backdrop-blur-md p-2.5 rounded-xl border border-neutral-700/80 shadow-2xl max-w-full sm:max-w-none">
          {/* Main View Mode Selector */}
          <div className="flex items-center bg-neutral-950 p-1 rounded-lg border border-neutral-800 text-xs font-mono overflow-x-auto">
            <button
              type="button"
              onClick={() => setViewMode('PREVIEW_MOCK_4X6')}
              className={`px-3 py-1.5 rounded-md font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                viewMode === 'PREVIEW_MOCK_4X6'
                  ? 'bg-amber-400 text-neutral-950 shadow-sm'
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Mock 4×6 Label</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('THERMAL_4X6')}
              className={`px-3 py-1.5 rounded-md font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                viewMode === 'THERMAL_4X6'
                  ? 'bg-amber-400 text-neutral-950 shadow-sm'
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Thermal 4×6″ (Raw)</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('A4_FULL')}
              className={`px-3 py-1.5 rounded-md font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                viewMode === 'A4_FULL'
                  ? 'bg-amber-400 text-neutral-950 shadow-sm'
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>A4 Document</span>
            </button>
          </div>

          {/* Mock Preview Specific Tools: Background & Slip Filters */}
          {viewMode === 'PREVIEW_MOCK_4X6' && (
            <div className="hidden lg:flex items-center gap-2 border-l border-neutral-700 pl-2">
              {/* Background Texture Switcher */}
              <div className="flex items-center bg-neutral-950 p-1 rounded-lg border border-neutral-800 text-[11px] font-mono">
                <span className="text-neutral-400 text-[10px] px-2 uppercase font-bold flex items-center gap-1">
                  <Box className="w-3 h-3 text-amber-400" /> Surface:
                </span>
                <button
                  type="button"
                  onClick={() => setMockBackground('CARDBOARD')}
                  className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                    mockBackground === 'CARDBOARD'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                  title="Kraft Corrugated Cardboard Shipping Box"
                >
                  Kraft Box
                </button>
                <button
                  type="button"
                  onClick={() => setMockBackground('POLYMAILER')}
                  className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                    mockBackground === 'POLYMAILER'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                  title="Courier Shipping Polymailer Bag"
                >
                  Polymailer
                </button>
                <button
                  type="button"
                  onClick={() => setMockBackground('THERMAL_ROLL')}
                  className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                    mockBackground === 'THERMAL_ROLL'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                  title="Continuous Thermal Label Roll with Yellow Liner"
                >
                  Roll Liner
                </button>
                <button
                  type="button"
                  onClick={() => setMockBackground('STUDIO')}
                  className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                    mockBackground === 'STUDIO'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                  title="Clean Studio Desktop"
                >
                  Studio
                </button>
              </div>

              {/* Slip Filter */}
              <div className="flex items-center bg-neutral-950 p-1 rounded-lg border border-neutral-800 text-[11px] font-mono">
                <span className="text-neutral-400 text-[10px] px-2 uppercase font-bold flex items-center gap-1">
                  <Layers className="w-3 h-3 text-emerald-400" /> Slips:
                </span>
                <button
                  type="button"
                  onClick={() => setActiveSlip('ALL')}
                  className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer ${
                    activeSlip === 'ALL' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Both
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSlip('SLIP_1')}
                  className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer ${
                    activeSlip === 'SLIP_1' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Label 1
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSlip('SLIP_2')}
                  className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer ${
                    activeSlip === 'SLIP_2' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Slip 2
                </button>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center bg-neutral-950 p-1 rounded-lg border border-neutral-800 text-[11px] font-mono">
                <button
                  type="button"
                  onClick={() => setZoomScale((prev) => Math.max(75, prev - 15))}
                  className="p-1 text-neutral-400 hover:text-white rounded cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="px-1.5 text-[10px] font-bold text-neutral-300 min-w-[38px] text-center">
                  {zoomScale}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomScale((prev) => Math.min(130, prev + 15))}
                  className="p-1 text-neutral-400 hover:text-white rounded cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomScale(100)}
                  className="p-1 text-neutral-400 hover:text-white rounded cursor-pointer"
                  title="Reset to 100% 4x6"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons: Forced 4x6 Print Preview, Direct Print, Provenance Link, Copy Code, Close */}
          <div className="flex items-center gap-1.5 ml-auto">
            {/* Explicit Forced 4x6 Aspect Ratio Print Preview Modal Trigger */}
            <button
              type="button"
              onClick={() => setIsPrintPreviewOpen(true)}
              className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
              title="Open forced 4x6 inch aspect ratio Print Preview modal before printing"
            >
              <Ruler className="w-3.5 h-3.5" />
              <span>Print Preview (4×6″)</span>
            </button>

            {/* Primary Print Button (Opens 4x6 Print Preview for thermal, direct print for A4) */}
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-sans font-bold flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
              title={
                viewMode === 'A4_FULL'
                  ? 'Print A4 manifest'
                  : 'Verify 4x6 aspect ratio in Print Preview before printing'
              }
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{viewMode === 'A4_FULL' ? 'Print A4' : 'Print Thermal'}</span>
            </button>

            {/* Provenance Link Copy */}
            <button
              type="button"
              onClick={handleCopyProvenanceLink}
              className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copy direct verification provenance URL"
            >
              {copiedLink ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <QrCode className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span className="hidden sm:inline">{copiedLink ? 'Copied' : 'QR Link'}</span>
            </button>

            {/* Copy Tracking Button */}
            <button
              type="button"
              onClick={() => handleCopy(consignmentNote.trackingCode)}
              className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copy tracking code"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Track #'}</span>
            </button>

            {/* Close Modal Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-lg border border-neutral-700 transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* MAIN CONTAINER                                                            */}
        {/* ========================================================================= */}
        <div className="w-full max-w-5xl my-auto pt-16 sm:pt-14 pb-8 flex flex-col items-center print:pt-0 print:pb-0 print:m-0 print:w-full">
          {/* ===================================================================== */}
          {/* VIEW 1: MOCK 4X6 SHIPPING LABEL PARCEL OVERLAY                        */}
          {/* ===================================================================== */}
          {viewMode === 'PREVIEW_MOCK_4X6' && (
            <div className="w-full space-y-4">
              {/* Pre-Flight Quality & Verification Checklist Bar */}
              <div className="w-full max-w-4xl mx-auto bg-neutral-900/90 border border-neutral-800 p-3 rounded-xl shadow-lg print:hidden text-xs font-mono">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      4×6 Thermal Pre-Flight Verification
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      · Ready for Zebra / Rollo / Munbyn 203–300 DPI
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPreflightDetail(!showPreflightDetail)}
                    className="text-[10px] text-amber-400 hover:text-amber-300 underline cursor-pointer"
                  >
                    {showPreflightDetail ? 'Collapse Checklist' : 'Inspect Quality Audit'}
                  </button>
                </div>

                {/* Status Chips */}
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-2 text-[10px]">
                  <div className="flex items-center gap-1.5 bg-neutral-950 p-1.5 rounded border border-neutral-800 text-neutral-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">1D Waybill: Crisp</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-neutral-950 p-1.5 rounded border border-neutral-800 text-neutral-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">SKU Barcode: Code-128</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-neutral-950 p-1.5 rounded border border-neutral-800 text-neutral-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">2D QR: Provenance</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-neutral-950 p-1.5 rounded border border-neutral-800 text-neutral-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">Courier: {consignmentNote.courier}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-neutral-950 p-1.5 rounded border border-neutral-800 text-neutral-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">
                      COD:{' '}
                      {consignmentNote.codAmountToCollectBDT > 0
                        ? formatBDT(consignmentNote.codAmountToCollectBDT)
                        : 'PREPAID'}
                    </span>
                  </div>
                  <div className="col-span-2 sm:col-span-1 flex items-center gap-1.5 bg-neutral-950 p-1.5 rounded border border-neutral-800 text-neutral-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">Driver Tel: Verified</span>
                  </div>
                </div>

                {/* Detailed Pre-Flight Audit (Expandable) */}
                {showPreflightDetail && (
                  <div className="mt-3 p-3 bg-neutral-950 rounded-lg border border-neutral-800 space-y-2 text-[10px] text-neutral-300">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <strong className="text-white block mb-0.5">Physical Label Dimensions:</strong>
                        <p>Standard 4.00&quot; × 6.00&quot; (101.6 mm × 152.4 mm). Aspect Ratio 2:3.</p>
                        <p className="text-neutral-400 mt-1">
                          Dual Slip Configuration: Outer Parcel Shipping Label (Slip 1) + Inner 1-of-1 Inventory Manifest (Slip 2).
                        </p>
                      </div>
                      <div>
                        <strong className="text-white block mb-0.5">Printer Calibration Guidelines:</strong>
                        <p>
                          In browser print dialog: Set paper size to &quot;4×6 in&quot; or &quot;100×150 mm&quot;, set Margins to &quot;None&quot;, and ensure &quot;Background graphics&quot; is enabled.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* REALISTIC MOCK SHIPPING PARCEL OVERLAY CONTAINER */}
              <div
                className={`w-full max-w-4xl mx-auto rounded-2xl p-6 sm:p-10 transition-all duration-300 relative overflow-hidden border border-neutral-700/60 ${getMockBackgroundClass()} print:bg-transparent print:p-0 print:border-none print:shadow-none`}
              >
                {mockBackground === 'CARDBOARD' && (
                  <>
                    <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-14 bg-amber-900/10 pointer-events-none border-x border-amber-900/15 print:hidden" />
                    <div className="absolute top-6 left-6 border-2 border-red-800/40 text-red-800/50 uppercase font-mono font-black text-[10px] px-2.5 py-1 rotate-[-6deg] tracking-widest pointer-events-none select-none print:hidden">
                      ★ SAIRAT COUTURE · VAULT PACKAGING 1-OF-1 ★
                    </div>
                    <div className="absolute bottom-6 right-6 border border-amber-950/30 text-amber-950/40 uppercase font-mono font-bold text-[9px] px-2 py-0.5 rotate-[4deg] tracking-wider pointer-events-none select-none print:hidden">
                      FRAGILE · ARCHIVAL LUXURY
                    </div>
                  </>
                )}

                {mockBackground === 'POLYMAILER' && (
                  <>
                    <div className="absolute top-0 left-0 right-0 h-4 bg-black/40 border-b border-white/5 pointer-events-none print:hidden" />
                    <div className="absolute bottom-0 left-0 right-0 h-4 bg-black/40 border-t border-white/5 pointer-events-none print:hidden" />
                    <div className="absolute top-6 left-6 text-neutral-500 font-mono text-[9px] uppercase tracking-widest pointer-events-none select-none print:hidden">
                      [ STEALTH AIR-SEALED COURIER SACK ]
                    </div>
                  </>
                )}

                {mockBackground === 'THERMAL_ROLL' && (
                  <>
                    <div className="absolute top-0 bottom-0 left-2 flex flex-col justify-around pointer-events-none print:hidden">
                      {[...Array(12)].map((_, i) => (
                        <div key={i} className="w-2.5 h-2.5 rounded-full bg-neutral-900/10 border border-neutral-900/20" />
                      ))}
                    </div>
                    <div className="absolute top-0 bottom-0 right-2 flex flex-col justify-around pointer-events-none print:hidden">
                      {[...Array(12)].map((_, i) => (
                        <div key={i} className="w-2.5 h-2.5 rounded-full bg-neutral-900/10 border border-neutral-900/20" />
                      ))}
                    </div>
                  </>
                )}

                <div
                  ref={printRef}
                  id={printableContainerId}
                  style={{
                    transform: zoomScale !== 100 ? `scale(${zoomScale / 100})` : undefined,
                    transformOrigin: 'top center'
                  }}
                  className="w-full transition-transform duration-200"
                >
                  {(activeSlip === 'ALL' || activeSlip === 'SLIP_1') && (
                    <ThermalSlip1 consignmentNote={consignmentNote} isMockPreview={true} />
                  )}

                  {activeSlip === 'ALL' && <ThermalPerforationBreak isMockPreview={true} />}

                  {(activeSlip === 'ALL' || activeSlip === 'SLIP_2') && (
                    <ThermalSlip2 consignmentNote={consignmentNote} isMockPreview={true} />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* VIEW 2: RAW THERMAL 4X6" DUAL SLIP VIEW                               */}
          {/* ===================================================================== */}
          {viewMode === 'THERMAL_4X6' && (
            <div
              ref={printRef}
              id={printableContainerId}
              className="w-full max-w-[440px] bg-white text-neutral-900 shadow-2xl rounded-xs p-4 sm:p-6 font-mono text-black print:border-none print:shadow-none print:p-0 print:m-0 print:w-full"
            >
              <ThermalSlip1 consignmentNote={consignmentNote} isMockPreview={false} />
              <ThermalPerforationBreak isMockPreview={false} />
              <ThermalSlip2 consignmentNote={consignmentNote} isMockPreview={false} />
            </div>
          )}

          {/* ===================================================================== */}
          {/* VIEW 3: STANDARD A4 DOCUMENT / OFFICIAL WAYBILL MANIFEST              */}
          {/* ===================================================================== */}
          {viewMode === 'A4_FULL' && (
            <div
              ref={printRef}
              id={printableContainerId}
              className="w-full max-w-4xl bg-white text-neutral-900 shadow-2xl rounded-xs p-6 sm:p-10 font-sans print:border-none print:shadow-none print:p-0 print:m-0 print:w-full"
            >
              {/* Document Header */}
              <div className="border-b-2 border-neutral-900 pb-5 mb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 relative">
                <div className="absolute top-0 right-0 left-0 h-[1.5px] bg-gradient-to-r from-[#9B7D4E]/80 via-[#C5A880] to-transparent print:hidden" />
                <div className="pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-display uppercase tracking-[0.25em] bg-neutral-950 text-[#F5F2EB] px-2 py-0.5 font-bold">
                      OFFICIAL WAYBILL
                    </span>
                    <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                      ARCHIVAL DISPATCH &amp; COURIER MANIFEST
                    </span>
                  </div>
                  <div className="mt-2 mb-1 flex items-center gap-3">
                    <img
                      src="/assets/sairat-couture-logo.png"
                      alt="SAIRAT COUTURE"
                      className="h-9 w-auto max-w-[200px] object-contain filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)] print:filter print:brightness-0"
                    />
                  </div>
                  <p className="text-[11px] text-neutral-600 font-classical italic">
                    Curated Luxury &amp; Archival Resale · Central Vault, Road 71, Gulshan-2, Dhaka 1212, Bangladesh
                  </p>
                </div>

                <div className="text-right sm:max-w-xs">
                  <div className="inline-block bg-neutral-100 border border-neutral-200 p-2 rounded-xs text-left font-mono">
                    <div className="text-[10px] text-neutral-500 uppercase">Assigned Carrier</div>
                    <div className="text-sm font-bold text-neutral-950 flex items-center gap-1.5 mt-0.5">
                      <Truck className="w-4 h-4 text-emerald-700" />
                      <span>
                        {consignmentNote.courier === 'STEADFAST'
                          ? 'Steadfast Courier Ltd.'
                          : consignmentNote.courier === 'PATHAO'
                          ? 'Pathao Courier Express'
                          : 'REDX Express'}
                      </span>
                    </div>
                    <div className="text-[10px] text-emerald-800 font-bold mt-0.5">
                      Zone: {consignmentNote.shippingAddress.deliveryZone} (Fee: {formatBDT(consignmentNote.deliveryFeeBDT)})
                    </div>
                  </div>
                </div>
              </div>

              {/* Consignment Identification Barcode + Provenance Verification QR Code */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-neutral-50 border border-neutral-200 p-4 rounded-xs mb-5">
                <div className="md:col-span-7">
                  <span className="text-[10px] font-mono uppercase text-neutral-500 block">
                    Consignment Identification &amp; Barcode
                  </span>
                  <div className="text-lg font-bold font-mono tracking-wider text-neutral-950">
                    {consignmentNote.consignmentId}
                  </div>
                  <div className="my-1.5 overflow-hidden">
                    {renderSvgBarcode(consignmentNote.consignmentId, 44)}
                  </div>
                  <div className="text-[10px] font-mono text-neutral-500 text-center tracking-widest">
                    {consignmentNote.barcodeValue}
                  </div>
                </div>

                <div className="md:col-span-5 flex items-center gap-3 border-t md:border-t-0 md:border-l border-neutral-200 pt-3 md:pt-0 md:pl-4 bg-white p-3 rounded-xs border border-neutral-300">
                  <div className="p-1.5 bg-white border border-neutral-300 rounded shrink-0 shadow-2xs">
                    <QRCodeSVG
                      value={provenanceUrl}
                      size={76}
                      level="M"
                      fgColor="#000000"
                      bgColor="#ffffff"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-neutral-950 uppercase font-mono">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Courier Provenance QR</span>
                    </div>
                    <p className="text-[10px] text-neutral-600 leading-tight">
                      Scan with smartphone camera to verify authentic 1-of-1 provenance &amp; Dhaka vault seal #{consignmentNote.vaultSealNumber}.
                    </p>
                    <div className="pt-1">
                      <a
                        href={provenanceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-mono text-emerald-800 font-bold underline hover:text-emerald-950 inline-flex items-center gap-1"
                      >
                        <span>Open Provenance Dossier</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Carrier Tracking Code & Manifest Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-neutral-50 border border-neutral-200 p-3 rounded-xs mb-5 text-xs font-mono">
                <div>
                  <span className="text-[10px] font-mono uppercase text-neutral-500 block">Carrier Tracking Code</span>
                  <div className="text-base font-bold font-mono text-emerald-900 tracking-wider">
                    {consignmentNote.trackingCode}
                  </div>
                  <div className="text-[11px] font-mono text-neutral-600 mt-0.5">
                    Order Invoice: <strong>{consignmentNote.orderNumber}</strong>
                  </div>
                </div>
                <div className="sm:text-right flex flex-col justify-between">
                  <div className="text-[11px] font-mono text-neutral-500">
                    Manifest Date: {new Date(consignmentNote.generatedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>
                  <div className="pt-1">
                    <a
                      href={consignmentNote.trackingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-neutral-900 font-bold underline hover:text-emerald-800 inline-flex items-center gap-1"
                    >
                      <span>Track Consignment on {consignmentNote.courier} Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Recipient & Shipper Addresses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div className="border border-neutral-200 p-4 rounded-xs">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 font-bold block mb-1">
                    RECIPIENT &amp; DELIVERY DESTINATION
                  </span>
                  <div className="text-sm font-bold text-neutral-950">{consignmentNote.customerName}</div>
                  <div className="text-sm font-bold font-mono text-neutral-900 mt-0.5">
                    Phone: {consignmentNote.customerPhone}
                  </div>
                  {consignmentNote.customerEmail && (
                    <div className="text-[11px] font-mono text-neutral-500">{consignmentNote.customerEmail}</div>
                  )}
                  <div className="mt-2 text-xs text-neutral-700 leading-relaxed font-sans">
                    <p className="font-semibold">{consignmentNote.shippingAddress.streetAddress}</p>
                    <p>Thana: {consignmentNote.shippingAddress.thana}</p>
                    <p>District: {consignmentNote.shippingAddress.district}, {consignmentNote.shippingAddress.division}</p>
                    <p className="font-bold text-neutral-900 uppercase text-[10px] mt-0.5 font-mono">
                      Bangladesh · Zone: {consignmentNote.shippingAddress.deliveryZone}
                    </p>
                  </div>
                </div>

                <div className="border border-neutral-200 p-4 rounded-xs flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 font-bold block mb-1">
                      DISPATCH ORIGIN (SEALED VAULT)
                    </span>
                    <div className="text-xs font-bold text-neutral-950 font-sans">SAIRAT COUTURE Bangladesh Logistics Hub</div>
                    <p className="text-[11px] text-neutral-600 mt-0.5 font-mono">
                      House 42, Road 71, Gulshan-2, Dhaka 1212<br />
                      Helpline: +880 1711-000000 · Return Hub ID: BD-GULSHAN-01
                    </p>
                  </div>

                  <div
                    className={`mt-3 p-3 rounded-xs border-2 ${
                      consignmentNote.codAmountToCollectBDT > 0
                        ? 'bg-amber-50 border-amber-500 text-amber-950'
                        : 'bg-emerald-50 border-emerald-500 text-emerald-950'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase font-bold tracking-wider">
                        {consignmentNote.codAmountToCollectBDT > 0 ? 'CASH TO COLLECT (COD)' : 'PREPAID CONSIGNMENT'}
                      </span>
                      <span className="text-[10px] font-mono font-bold">
                        {consignmentNote.paymentGateway}
                      </span>
                    </div>
                    <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight mt-0.5">
                      {consignmentNote.codAmountToCollectBDT > 0
                        ? formatBDT(consignmentNote.codAmountToCollectBDT)
                        : '৳0 (PAID IN FULL)'}
                    </div>
                    <div className="text-[10px] font-mono mt-0.5 opacity-90">
                      {consignmentNote.paymentStatus}
                    </div>
                  </div>
                </div>
              </div>

              {/* Manifested 1-of-1 Items Table */}
              <div className="border border-neutral-200 rounded-xs overflow-hidden mb-5">
                <div className="bg-neutral-100 px-4 py-2 border-b border-neutral-200 text-[10px] font-mono uppercase tracking-wider font-bold text-neutral-700 flex items-center justify-between">
                  <span>Archival Resale Manifest (1-of-1 Piece Inventory)</span>
                  <span>Total Units: {consignmentNote.items.length}</span>
                </div>

                <table className="w-full text-left text-xs">
                  <thead className="border-b border-neutral-200 bg-neutral-50 text-[10px] font-mono uppercase text-neutral-500">
                    <tr>
                      <th className="p-3">SKU &amp; Barcode (Code-128)</th>
                      <th className="p-3">Item Description</th>
                      <th className="p-3">Condition / Era</th>
                      <th className="p-3">Flat Measurements</th>
                      <th className="p-3 text-right">Value (BDT)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 font-mono">
                    {consignmentNote.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-neutral-50/50">
                        <td className="p-3">
                          <div className="font-bold text-neutral-950 font-mono text-xs mb-1">
                            {item.sku}
                          </div>
                          <div className="bg-white p-1 border border-neutral-300 rounded-xs inline-block shadow-2xs">
                            <SkuBarcode
                              value={item.sku}
                              height={28}
                              width={1.15}
                              displayValue={false}
                              className="max-w-[180px]"
                            />
                            <div className="text-[7.5px] font-mono text-neutral-800 text-center tracking-wider mt-0.5 font-bold">
                              *{item.sku}*
                            </div>
                          </div>
                          <div className="text-[7.5px] font-mono text-neutral-500 mt-0.5">
                            Dhaka Vault Scan Ready
                          </div>
                        </td>
                        <td className="p-3 font-sans">
                          <div className="font-bold text-neutral-950">{item.title}</div>
                          <div className="text-[11px] text-neutral-500 font-mono uppercase">
                            {item.brand} · Tag: {item.sizeTag || 'OS'}
                          </div>
                        </td>
                        <td className="p-3 text-[11px]">
                          <span className="font-bold text-neutral-900">{item.condition}</span>
                          <div className="text-neutral-500 text-[10px]">{item.era}</div>
                        </td>
                        <td className="p-3 text-[11px] text-neutral-600">
                          {item.measurementsSummary}
                        </td>
                        <td className="p-3 text-right font-bold text-neutral-950">
                          {formatBDT(item.priceBDT)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="bg-neutral-50 p-4 border-t border-neutral-200 font-mono text-xs flex flex-col sm:flex-row sm:justify-end gap-3 sm:gap-8">
                  <div className="space-y-1 sm:w-64 text-[11px]">
                    <div className="flex justify-between text-neutral-600">
                      <span>Subtotal Items:</span>
                      <span>{formatBDT(consignmentNote.subtotalBDT)}</span>
                    </div>
                    <div className="flex justify-between text-neutral-600">
                      <span>Courier Logistics Fee ({consignmentNote.shippingAddress.deliveryZone}):</span>
                      <span>{formatBDT(consignmentNote.deliveryFeeBDT)}</span>
                    </div>
                    {consignmentNote.isAdvanceDeliveryPaid && (
                      <div className="flex justify-between text-emerald-700 font-bold">
                        <span>Advance bKash Fee Paid:</span>
                        <span>-{formatBDT(consignmentNote.advancePaidAmountBDT)}</span>
                      </div>
                    )}
                    <div className="border-t border-neutral-300 pt-1.5 flex justify-between font-bold text-sm text-neutral-950">
                      <span>Total Invoice:</span>
                      <span>{formatBDT(consignmentNote.totalBDT)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Seals & Vault Signatures */}
              <div className="border border-neutral-200 p-4 rounded-xs bg-neutral-50/80 mb-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-[10px] uppercase text-neutral-500 font-bold block">
                      AUTHENTICITY VAULT SEAL
                    </span>
                    <div className="flex items-center gap-1.5 mt-1 text-emerald-900 font-bold">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      <span>{consignmentNote.vaultSealNumber}</span>
                    </div>
                    <span className="text-[10px] text-neutral-500 block mt-0.5">
                      Multi-Point Tactile Hologram Intact
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase text-neutral-500 font-bold block">
                      COURIER HANDOVER INSTRUCTIONS
                    </span>
                    <p className="text-[10px] text-neutral-600 leading-tight mt-1">
                      Collect recipient signature and mobile verification OTP. Do not bend or expose to moisture.
                    </p>
                  </div>

                  <div className="text-right sm:border-l border-neutral-200 sm:pl-4">
                    <span className="text-[10px] uppercase text-neutral-500 font-bold block">
                      VAULT INSPECTION OFFICER
                    </span>
                    <div className="font-editorial italic text-sm text-neutral-800 mt-1">
                      {consignmentNote.inspectorName}
                    </div>
                    <span className="text-[10px] text-neutral-400 block mt-0.5">
                      Authorized Signature &amp; Seal Approved
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer Notice */}
              <div className="text-[10px] font-mono text-neutral-400 text-center border-t border-neutral-200 pt-3">
                This document is generated by SAIRAT COUTURE Bangladesh Automated Dispatch Engine in integration with Steadfast &amp; Pathao APIs.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dedicated Forced 4x6 Aspect Ratio Print Preview Modal */}
      <PrintPreviewModal
        isOpen={isPrintPreviewOpen}
        onClose={() => setIsPrintPreviewOpen(false)}
        consignmentNote={consignmentNote}
      />
    </>
  );
};
