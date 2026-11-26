import React from 'react';
import { Scissors, Barcode as BarcodeIcon } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { SkuBarcode } from './SkuBarcode';
import { ConsignmentNote } from '../types/resale';

export const formatBDT = (amount: number): string => {
  return `৳${amount.toLocaleString('en-IN')}`;
};

export const getProvenanceUrl = (consignmentNote: ConsignmentNote): string => {
  const primaryItem = consignmentNote.items[0];
  const originUrl =
    typeof window !== 'undefined' ? window.location.origin : 'https://sairat-couture.com';

  return primaryItem
    ? `${originUrl}/?item=${encodeURIComponent(primaryItem.id)}&verify=${encodeURIComponent(consignmentNote.vaultSealNumber)}&order=${encodeURIComponent(consignmentNote.orderNumber)}`
    : `${originUrl}/?verify=${encodeURIComponent(consignmentNote.vaultSealNumber)}&order=${encodeURIComponent(consignmentNote.orderNumber)}`;
};

// Generate deterministic SVG Barcode lines with crispEdges for thermal print heads
export const renderSvgBarcode = (code: string, height: number = 42) => {
  const bars: { width: number; isBlack: boolean }[] = [];

  // Guard bars
  bars.push({ width: 3, isBlack: true });
  bars.push({ width: 2, isBlack: false });
  bars.push({ width: 3, isBlack: true });

  for (let i = 0; i < code.length; i++) {
    const charCode = code.charCodeAt(i);
    bars.push({ width: (charCode % 3) + 1, isBlack: false });
    bars.push({ width: ((charCode * 3) % 4) + 2, isBlack: true });
    bars.push({ width: (charCode % 2) + 1, isBlack: false });
    bars.push({ width: ((charCode * 7) % 3) + 2, isBlack: true });
  }

  // Stop guard
  bars.push({ width: 3, isBlack: true });
  bars.push({ width: 2, isBlack: false });
  bars.push({ width: 4, isBlack: true });

  let currentX = 8;
  return (
    <svg
      className="w-full"
      style={{ height: `${height}px`, shapeRendering: 'crispEdges' }}
      viewBox="0 0 380 48"
      preserveAspectRatio="none"
    >
      {bars.map((bar, idx) => {
        const rect = bar.isBlack ? (
          <rect
            key={idx}
            x={currentX}
            y="0"
            width={bar.width * 2}
            height="48"
            fill="#000000"
          />
        ) : null;
        currentX += bar.width * 2;
        return rect;
      })}
    </svg>
  );
};

interface ThermalSlipProps {
  consignmentNote: ConsignmentNote;
  isMockPreview?: boolean;
  isStrictPreview?: boolean;
}

export const ThermalSlip1: React.FC<ThermalSlipProps> = ({
  consignmentNote,
  isMockPreview = false,
  isStrictPreview = false
}) => {
  const primaryItem = consignmentNote.items[0];
  const provenanceUrl = getProvenanceUrl(consignmentNote);

  return (
    <div
      className={`thermal-page-block thermal-4x6-slip text-black text-[11px] leading-tight transition-all select-text ${
        isStrictPreview
          ? 'bg-white space-y-1.5 font-mono'
          : isMockPreview
          ? 'w-full max-w-[410px] mx-auto p-4 sm:p-5 rounded-xl border border-neutral-300 shadow-md relative bg-[#FCFCFA] space-y-2.5'
          : 'border-2 border-black p-3 bg-white space-y-2.5'
      }`}
    >
      {/* Mock Peel Corner Highlight in Preview Mode */}
      {isMockPreview && !isStrictPreview && (
        <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none overflow-hidden print:hidden">
          <div className="absolute -top-4 -right-4 w-8 h-8 bg-neutral-300/60 rotate-45 border-b border-l border-neutral-400 shadow-xs" />
        </div>
      )}

      {/* Thermal Header Bar */}
      <div className="flex items-center justify-between border-b-2 border-black pb-1.5">
        <div className="flex items-center gap-2">
          <img
            src="/assets/sairat-couture-logo.png"
            alt="SAIRAT COUTURE"
            className="thermal-monochrome-logo h-6 w-auto max-w-[125px] object-contain filter brightness-0"
          />
          <span className="text-[8.5px] font-bold uppercase tracking-wider block font-mono">
            DHAKA LOGISTICS
          </span>
        </div>
        <div className="bg-black text-white px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-right font-mono">
          {consignmentNote.courier === 'STEADFAST' ? 'STEADFAST COURIER' : 'PATHAO COURIER'}
        </div>
      </div>

      {/* Carrier Routing & Destination Zone */}
      <div className="flex items-center justify-between bg-black text-white px-2 py-1 font-bold uppercase text-[10px] font-mono">
        <span>DESTINATION ROUTING:</span>
        <span className="tracking-widest">{consignmentNote.shippingAddress.deliveryZone}</span>
      </div>

      {/* Dual Barcode + Provenance Verification QR Code */}
      <div className="border border-black p-1.5 bg-white">
        <div className="text-[8px] uppercase tracking-widest text-neutral-800 font-bold mb-1 text-center font-mono">
          PARCEL ROUTING &amp; COURIER PROVENANCE VERIFICATION
        </div>
        <div className="grid grid-cols-12 gap-2 items-center">
          {/* Linear Barcode for Sorting Conveyors (8 cols) */}
          <div className="col-span-8 text-center border-r border-black pr-2">
            <div className="my-0.5 overflow-hidden">
              {renderSvgBarcode(consignmentNote.trackingCode, 34)}
            </div>
            <div className="text-xs font-bold tracking-wider font-mono">
              {consignmentNote.trackingCode}
            </div>
            <div className="text-[8.5px] font-mono text-neutral-800">
              Invoice: {consignmentNote.orderNumber}
            </div>
          </div>

          {/* High-Contrast QR Code for Instant Courier Verification (4 cols) */}
          <div className="col-span-4 flex flex-col items-center justify-center text-center">
            <div className="p-0.5 bg-white border border-black inline-block">
              <QRCodeSVG
                value={provenanceUrl}
                size={54}
                level="M"
                fgColor="#000000"
                bgColor="#ffffff"
              />
            </div>
            <span className="text-[7px] font-bold uppercase tracking-wider block mt-0.5 leading-tight text-neutral-900 font-mono">
              SCAN PROVENANCE
            </span>
            <span className="text-[6.5px] font-mono text-neutral-600 block">
              Seal #{consignmentNote.vaultSealNumber.slice(-6)}
            </span>
          </div>
        </div>
      </div>

      {/* RECIPIENT DESTINATION (Largest for Delivery Driver) */}
      <div className="border-2 border-black p-2 bg-white space-y-0.5">
        <span className="text-[8.5px] font-bold uppercase tracking-widest block text-neutral-700 font-mono">
          SHIP TO / RECIPIENT:
        </span>
        <div className="text-xs font-bold text-black uppercase font-sans">
          {consignmentNote.customerName}
        </div>
        <div className="text-sm font-extrabold font-mono tracking-wider text-black bg-neutral-100 px-1.5 py-0.5 border border-black inline-block">
          TEL: {consignmentNote.customerPhone}
        </div>
        <div className="text-[10px] font-semibold text-black pt-0.5 leading-snug font-sans">
          <p>{consignmentNote.shippingAddress.streetAddress}</p>
          <p>Thana: {consignmentNote.shippingAddress.thana}</p>
          <p className="font-bold text-[10.5px] uppercase font-mono">
            District: {consignmentNote.shippingAddress.district}, {consignmentNote.shippingAddress.division}
          </p>
        </div>
      </div>

      {/* CASH ON DELIVERY (COD) HIGH-VISIBILITY THERMAL BOX */}
      <div className="border-2 border-black p-1.5 text-center bg-white">
        <div className="bg-black text-white text-[9px] font-bold uppercase py-0.5 px-1 tracking-wider font-mono">
          {consignmentNote.codAmountToCollectBDT > 0
            ? 'CASH TO COLLECT (COD BEFORE UNSEALING)'
            : 'PREPAID ORDER · DO NOT COLLECT CASH'}
        </div>
        <div className="text-xl font-black font-mono tracking-tight mt-0.5">
          {consignmentNote.codAmountToCollectBDT > 0
            ? formatBDT(consignmentNote.codAmountToCollectBDT)
            : '৳0 (PAID IN FULL)'}
        </div>
        <div className="text-[8.5px] uppercase font-bold text-neutral-800 font-mono">
          Method: {consignmentNote.paymentGateway} · {consignmentNote.paymentStatus}
        </div>
      </div>

      {/* Enclosed Garment Verification SKU Barcode */}
      {primaryItem && (
        <div className="border border-black p-1 bg-neutral-50/70">
          <div className="flex items-center justify-between text-[7.5px] font-mono font-bold uppercase mb-0.5">
            <span className="flex items-center gap-1">
              <BarcodeIcon className="w-2.5 h-2.5" />
              ITEM SKU SCAN (CODE-128):
            </span>
            <span className="bg-black text-white px-1 rounded-2xs">
              {primaryItem.sku}
            </span>
          </div>
          <div className="bg-white p-0.5 border border-black flex flex-col items-center justify-center">
            <SkuBarcode
              value={primaryItem.sku}
              height={18}
              width={1.1}
              displayValue={false}
              className="w-full max-w-[240px]"
            />
            <div className="text-[7px] font-mono text-neutral-800 font-bold tracking-wider">
              *{primaryItem.sku}* · {primaryItem.brand} {primaryItem.sizeTag ? `(${primaryItem.sizeTag})` : ''}
            </div>
          </div>
        </div>
      )}

      {/* Shipper Origin / Return Hub */}
      <div className="border border-black p-1 text-[8px] font-mono leading-tight">
        <span className="font-bold uppercase block">RETURN / DISPATCH ORIGIN:</span>
        <p>SAIRAT COUTURE VAULT · House 42, Rd 71, Gulshan-2, Dhaka 1212 · +880 1711-000000</p>
        <div className="mt-0.5 pt-0.5 border-t border-neutral-400 flex items-center justify-between text-[7.5px]">
          <span>Seal: {consignmentNote.vaultSealNumber}</span>
          <span>1-of-1 Sealed Luxury</span>
        </div>
      </div>

      {/* Bottom Mock 4x6 Die-Cut Stamp */}
      {isMockPreview && !isStrictPreview && (
        <div className="flex items-center justify-between pt-1 border-t border-neutral-200 text-[8px] font-mono text-neutral-500 print:hidden">
          <span>DIE-CUT SPEC: 4.00" × 6.00" (101.6 × 152.4 mm)</span>
          <span>THERMAL 203 DPI VERIFIED</span>
        </div>
      )}
    </div>
  );
};

export const ThermalSlip2: React.FC<ThermalSlipProps> = ({
  consignmentNote,
  isMockPreview = false,
  isStrictPreview = false
}) => {
  const provenanceUrl = getProvenanceUrl(consignmentNote);

  return (
    <div
      className={`thermal-page-block thermal-4x6-slip text-black text-[11px] leading-tight transition-all select-text ${
        isStrictPreview
          ? 'bg-white space-y-1.5 font-mono'
          : isMockPreview
          ? 'w-full max-w-[410px] mx-auto p-4 sm:p-5 rounded-xl border border-neutral-300 shadow-md relative bg-[#FCFCFA] space-y-2.5'
          : 'border-2 border-black p-3 bg-white space-y-2.5'
      }`}
    >
      {/* Mock Peel Corner Highlight in Preview Mode */}
      {isMockPreview && !isStrictPreview && (
        <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none overflow-hidden print:hidden">
          <div className="absolute -top-4 -right-4 w-8 h-8 bg-neutral-300/60 rotate-45 border-b border-l border-neutral-400 shadow-xs" />
        </div>
      )}

      {/* Manifest Header */}
      <div className="border-b-2 border-black pb-1.5 text-center">
        <img
          src="/assets/sairat-couture-logo.png"
          alt="SAIRAT COUTURE"
          className="thermal-monochrome-logo h-6 w-auto mx-auto object-contain filter brightness-0"
        />
        <div className="text-[9.5px] font-bold uppercase tracking-widest mt-0.5 font-mono">
          ARCHIVAL PACKING SLIP &amp; INVENTORY MANIFEST
        </div>
        <div className="text-[8.5px] font-mono text-neutral-800">
          Invoice: {consignmentNote.orderNumber} · Tracking: {consignmentNote.trackingCode}
        </div>
      </div>

      {/* Recipient & Shipper Mini Manifest */}
      <div className="grid grid-cols-2 gap-2 text-[9.5px] border border-black p-1.5 font-mono">
        <div>
          <span className="font-bold uppercase text-[7.5px] text-neutral-600 block">CLIENT:</span>
          <div className="font-bold text-neutral-900">{consignmentNote.customerName}</div>
          <div>{consignmentNote.customerPhone}</div>
          <div className="truncate">{consignmentNote.shippingAddress.district}</div>
        </div>
        <div className="text-right border-l border-neutral-300 pl-2">
          <span className="font-bold uppercase text-[7.5px] text-neutral-600 block">DISPATCH DATE:</span>
          <div>{new Date(consignmentNote.generatedAt).toLocaleDateString('en-GB')}</div>
          <div className="font-bold text-neutral-900">{consignmentNote.courier} EXPRESS</div>
        </div>
      </div>

      {/* 1-of-1 Items Table */}
      <div className="border border-black">
        <div className="bg-black text-white px-2 py-0.5 text-[8.5px] font-bold uppercase flex justify-between font-mono">
          <span>ITEM DESCRIPTION &amp; SCANNABLE SKU BARCODE</span>
          <span>PRICE</span>
        </div>
        <div className="divide-y divide-black font-mono">
          {consignmentNote.items.map((item, idx) => (
            <div key={idx} className="p-1.5 space-y-1">
              <div className="flex justify-between items-start gap-2">
                <div className="font-bold text-[9.5px] uppercase leading-tight">
                  {item.brand} — {item.title}
                </div>
                <div className="font-bold text-[9.5px] shrink-0">{formatBDT(item.priceBDT)}</div>
              </div>
              <div className="text-[8.5px] text-neutral-700 flex justify-between">
                <span>Size: {item.sizeTag || 'OS'} · {item.condition}</span>
                <span>Era: {item.era}</span>
              </div>
              {item.measurementsSummary && (
                <div className="text-[7.5px] text-neutral-600 truncate">
                  Measurements: {item.measurementsSummary}
                </div>
              )}

              {/* Scannable Code-128 Barcode for Item SKU (Dhaka Vault Inventory Scanning) */}
              <div className="pt-1 pb-0.5 mt-0.5 bg-white p-1 border border-black">
                <div className="flex items-center justify-between text-[7px] font-mono font-bold mb-0.5">
                  <span className="text-neutral-900 uppercase tracking-wider flex items-center gap-1">
                    <BarcodeIcon className="w-2.5 h-2.5 text-black" />
                    VAULT SKU BARCODE (CODE-128):
                  </span>
                  <span className="font-mono text-black font-extrabold text-[7.5px] bg-neutral-100 px-1 border border-neutral-300">
                    {item.sku}
                  </span>
                </div>
                <div className="bg-white px-1 flex flex-col items-center justify-center">
                  <SkuBarcode
                    value={item.sku}
                    height={20}
                    width={1.15}
                    displayValue={false}
                    className="w-full max-w-[260px]"
                  />
                  <div className="text-[7.5px] font-mono tracking-widest text-black mt-0.5 font-bold">
                    *{item.sku}*
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Price Calculation Summary */}
      <div className="border border-black p-1.5 bg-neutral-50 text-[9px] font-mono space-y-0.5">
        <div className="flex justify-between">
          <span>Subtotal Items:</span>
          <span>{formatBDT(consignmentNote.subtotalBDT)}</span>
        </div>
        <div className="flex justify-between">
          <span>Courier Fee ({consignmentNote.shippingAddress.deliveryZone}):</span>
          <span>{formatBDT(consignmentNote.deliveryFeeBDT)}</span>
        </div>
        {consignmentNote.isAdvanceDeliveryPaid && (
          <div className="flex justify-between font-bold">
            <span>Advance bKash Paid:</span>
            <span>-{formatBDT(consignmentNote.advancePaidAmountBDT)}</span>
          </div>
        )}
        <div className="border-t border-black pt-0.5 flex justify-between font-bold text-[10.5px]">
          <span>Total Payable:</span>
          <span>{formatBDT(consignmentNote.totalBDT)}</span>
        </div>
      </div>

      {/* Vault Sign-off with Provenance QR Verification */}
      <div className="border border-black p-1.5 text-[8.5px] font-mono">
        <div className="grid grid-cols-12 gap-2 items-center">
          <div className="col-span-8 space-y-0.5">
            <div className="font-bold">VAULT SEAL: {consignmentNote.vaultSealNumber}</div>
            <p className="text-[7px] text-neutral-700 leading-tight">
              Tactile verified for authentic hardware, stitching, and grade at our Banani Salon.
            </p>
            <div className="pt-1 border-t border-neutral-300 flex justify-between items-end">
              <div>
                <span className="block text-[7px] text-neutral-500 uppercase">Inspector:</span>
                <span className="font-bold text-[8.5px]">{consignmentNote.inspectorName}</span>
              </div>
              <div className="border-b border-black w-16 text-center text-[6.5px] text-neutral-500 pb-0.5">
                Approved Sign
              </div>
            </div>
          </div>

          {/* QR Code on Packing Slip */}
          <div className="col-span-4 flex flex-col items-center justify-center text-center border-l border-black pl-1">
            <div className="p-0.5 bg-white border border-black inline-block">
              <QRCodeSVG
                value={provenanceUrl}
                size={48}
                level="M"
                fgColor="#000000"
                bgColor="#ffffff"
              />
            </div>
            <span className="text-[6.5px] font-bold uppercase tracking-wider block mt-0.5">
              DIGITAL LEDGER
            </span>
          </div>
        </div>
      </div>

      <div className="text-[7.5px] text-center font-mono text-neutral-600">
        Concierge &amp; Styling: WhatsApp +880 1711-000000
      </div>

      {isMockPreview && !isStrictPreview && (
        <div className="flex items-center justify-between pt-1 border-t border-neutral-200 text-[8px] font-mono text-neutral-500 print:hidden">
          <span>PACKING SLIP INSERT (PLACED INSIDE VAULT BOX)</span>
          <span>SLIP #2 OF 2</span>
        </div>
      )}
    </div>
  );
};

export const ThermalPerforationBreak: React.FC<{ isMockPreview?: boolean }> = ({
  isMockPreview = false
}) => (
  <div
    className={`thermal-page-break my-3 py-1.5 border-b-2 border-dashed text-center text-[10px] font-mono flex items-center justify-center gap-2 print:border-none print:m-0 print:p-0 print:h-0 ${
      isMockPreview
        ? 'border-neutral-400/80 text-neutral-700 bg-neutral-200/50 rounded-sm max-w-[410px] mx-auto shadow-inner'
        : 'border-neutral-400 text-neutral-500'
    }`}
  >
    <Scissors className="w-3.5 h-3.5" />
    <span className="font-bold tracking-wider">
      [ --- FORCED THERMAL PAGE BREAK · TEAR LINE --- ]
    </span>
    <Scissors className="w-3.5 h-3.5 rotate-180" />
  </div>
);
