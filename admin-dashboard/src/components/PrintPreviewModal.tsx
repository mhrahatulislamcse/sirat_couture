import React, { useState } from 'react';
import {
  X,
  Printer,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Ruler,
  Layers,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import { ConsignmentNote } from '../types/resale';
import {
  ThermalSlip1,
  ThermalSlip2,
  ThermalPerforationBreak
} from './ThermalConsignmentSlips';

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  consignmentNote: ConsignmentNote | null;
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  isOpen,
  onClose,
  consignmentNote
}) => {
  const [selectedPage, setSelectedPage] = useState<'ALL' | 'SLIP_1' | 'SLIP_2'>('ALL');
  const [zoomPercent, setZoomPercent] = useState<number>(100);

  if (!isOpen || !consignmentNote) return null;

  const handleTriggerBrowserPrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-70 bg-neutral-950/92 backdrop-blur-sm flex flex-col overflow-hidden animate-in fade-in duration-150 print:static print:bg-transparent print:overflow-visible"
      role="dialog"
      aria-modal="true"
      aria-label="4x6 Thermal Print Preview"
    >
      {/* ===================================================================== */}
      {/* MODAL TOOLBAR (Hidden during browser print)                           */}
      {/* ===================================================================== */}
      <div className="bg-neutral-900 border-b border-neutral-800 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 transition-colors cursor-pointer"
            title="Back to Consignment Note"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Print Preview · 4×6″ Thermal Label
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-400/15 text-amber-300 border border-amber-400/30 text-[10px] font-mono font-bold">
                <Ruler className="w-3 h-3" />
                4.00&quot; × 6.00&quot; (4:6 Aspect Ratio Locked)
              </span>
            </div>
            <p className="text-[11px] font-mono text-neutral-400 mt-0.5">
              Rendering via <code className="text-emerald-400">.thermal-4x6-slip</code> ·{' '}
              <code className="text-emerald-400">.thermal-page-block</code> ·{' '}
              <code className="text-emerald-400">.thermal-page-break</code> ·{' '}
              Order <strong className="text-neutral-200">{consignmentNote.orderNumber}</strong>
            </p>
          </div>
        </div>

        {/* Page Selector, Zoom Controls & Print Trigger */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Page Filter */}
          <div className="flex items-center bg-neutral-950 p-1 rounded-lg border border-neutral-800 text-[11px] font-mono">
            <span className="text-neutral-400 px-2 flex items-center gap-1">
              <Layers className="w-3 h-3 text-amber-400" />
              Pages:
            </span>
            <button
              type="button"
              onClick={() => setSelectedPage('ALL')}
              className={`px-2.5 py-1 rounded font-bold cursor-pointer transition-colors ${
                selectedPage === 'ALL'
                  ? 'bg-amber-400 text-neutral-950'
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              Both (2 Pages)
            </button>
            <button
              type="button"
              onClick={() => setSelectedPage('SLIP_1')}
              className={`px-2.5 py-1 rounded font-bold cursor-pointer transition-colors ${
                selectedPage === 'SLIP_1'
                  ? 'bg-amber-400 text-neutral-950'
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              1. Shipping Label
            </button>
            <button
              type="button"
              onClick={() => setSelectedPage('SLIP_2')}
              className={`px-2.5 py-1 rounded font-bold cursor-pointer transition-colors ${
                selectedPage === 'SLIP_2'
                  ? 'bg-amber-400 text-neutral-950'
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              2. Packing Slip
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center bg-neutral-950 p-1 rounded-lg border border-neutral-800 text-[11px] font-mono">
            <button
              type="button"
              onClick={() => setZoomPercent((z) => Math.max(75, z - 10))}
              className="p-1 text-neutral-400 hover:text-white cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-neutral-200 font-bold min-w-[44px] text-center">
              {zoomPercent}%
            </span>
            <button
              type="button"
              onClick={() => setZoomPercent((z) => Math.min(125, z + 10))}
              className="p-1 text-neutral-400 hover:text-white cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomPercent(100)}
              className="p-1 text-neutral-400 hover:text-white cursor-pointer"
              title="Reset Scale (100% True Size)"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Confirm & Trigger Browser Print Dialog */}
          <button
            type="button"
            onClick={handleTriggerBrowserPrint}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-sans font-bold flex items-center gap-2 shadow-lg transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Confirm &amp; Open Print Dialog</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-lg border border-neutral-700 transition-colors cursor-pointer"
            title="Close Print Preview"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* PRE-PRINT VERIFICATION STRIP (Hidden during browser print)            */}
      {/* ===================================================================== */}
      <div className="bg-neutral-900/70 border-b border-neutral-800/80 px-4 py-2 text-[10px] font-mono text-neutral-300 flex flex-wrap items-center justify-center gap-4 shrink-0 print:hidden">
        <span className="inline-flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          Aspect Ratio Forced: <strong className="text-white">4 : 6 (101.6 × 152.4 mm)</strong>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          Page Break Mode: <strong className="text-white">Active (.thermal-page-break)</strong>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          Target Printer Paper: <strong className="text-white">4×6 Thermal Roll / Zebra / Rollo</strong>
        </span>
      </div>

      {/* ===================================================================== */}
      {/* 4x6 FORCED ASPECT RATIO PREVIEW STAGE                                 */}
      {/* ===================================================================== */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-[#18181B] print:p-0 print:bg-transparent print:overflow-visible">
        <div
          id="printable-consignment-note"
          className="thermal-print-preview-stage mx-auto flex flex-col items-center print:block print:w-full"
          style={{
            transform: zoomPercent !== 100 ? `scale(${zoomPercent / 100})` : undefined,
            transformOrigin: 'top center'
          }}
        >
          {/* PAGE 1: EXTERIOR 4x6 SHIPPING LABEL */}
          {(selectedPage === 'ALL' || selectedPage === 'SLIP_1') && (
            <div className="flex flex-col items-center print:block">
              <div className="w-[4in] max-w-full flex items-center justify-between text-[10px] font-mono text-neutral-400 mb-1.5 px-0.5 print:hidden">
                <span className="font-bold text-amber-300 uppercase">
                  PAGE 1 · SHIPPING LABEL
                </span>
                <span>← 4.00 IN (384 PX) · 4:6 ASPECT →</span>
              </div>

              <ThermalSlip1
                consignmentNote={consignmentNote}
                isStrictPreview={true}
              />
            </div>
          )}

          {/* FORCED THERMAL PAGE BREAK */}
          {selectedPage === 'ALL' && (
            <ThermalPerforationBreak isMockPreview={false} />
          )}

          {/* PAGE 2: ARCHIVAL PACKING SLIP & SKU MANIFEST */}
          {(selectedPage === 'ALL' || selectedPage === 'SLIP_2') && (
            <div className="flex flex-col items-center print:block">
              <div className="w-[4in] max-w-full flex items-center justify-between text-[10px] font-mono text-neutral-400 mb-1.5 px-0.5 print:hidden">
                <span className="font-bold text-emerald-300 uppercase">
                  PAGE 2 · PACKING SLIP &amp; SKU BARCODES
                </span>
                <span>← 4.00 IN (384 PX) · 4:6 ASPECT →</span>
              </div>

              <ThermalSlip2
                consignmentNote={consignmentNote}
                isStrictPreview={true}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
