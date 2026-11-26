import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Ruler,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Share2,
  Heart,
  ChevronRight,
  Info,
  Truck,
  ZoomIn,
  ZoomOut,
  Globe,
  Bell,
  BellRing
} from 'lucide-react';
import { Product } from '../types/resale';
import { SizeConversionTable } from './SizeConversionTable';
import { calculateGarmentSizeEquivalents } from '../utils/sizeConversion';
import { PriceDropModal } from './PriceDropModal';
import { getPriceAlertForProduct } from '../utils/priceAlerts';
import { PriceDropAlert } from '../types/priceAlert';
import { CompleteTheLook } from './CompleteTheLook';
import { RecentlyViewed } from './RecentlyViewed';
import { recordProductView } from '../utils/recentlyViewed';
import { INITIAL_PRODUCTS } from '../data/initialCatalog';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
  isAddingToBag: boolean;
  onProductPriceUpdated?: (updatedProduct: Product) => void;
  allProducts?: Product[];
  onSelectProduct?: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product: initialProduct,
  onClose,
  onAddToCart,
  isWishlisted,
  onToggleWishlist,
  isAddingToBag,
  onProductPriceUpdated,
  allProducts,
  onSelectProduct
}) => {
  const [currentProduct, setCurrentProduct] = useState<Product>(initialProduct);
  const [isPriceDropModalOpen, setIsPriceDropModalOpen] = useState(false);
  const [activePriceAlert, setActivePriceAlert] = useState<PriceDropAlert | undefined>(undefined);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentProduct(initialProduct);
    setActivePriceAlert(getPriceAlertForProduct(initialProduct.id));
  }, [initialProduct]);

  useEffect(() => {
    if (currentProduct && currentProduct.id) {
      recordProductView(currentProduct);
    }
  }, [currentProduct]);

  useEffect(() => {
    const handleAlertChange = () => {
      setActivePriceAlert(getPriceAlertForProduct(currentProduct.id));
    };
    window.addEventListener('innove:price-drop-alert', handleAlertChange);
    window.addEventListener('storage', handleAlertChange);
    return () => {
      window.removeEventListener('innove:price-drop-alert', handleAlertChange);
      window.removeEventListener('storage', handleAlertChange);
    };
  }, [currentProduct.id]);

  const product = currentProduct;

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [measurementUnit, setMeasurementUnit] = useState<'INCHES' | 'CM'>('INCHES');
  const [activeMeasurementTab, setActiveMeasurementTab] = useState<'MEASUREMENTS' | 'CONVERSION' | 'BOTH'>('MEASUREMENTS');
  const [copiedLink, setCopiedLink] = useState(false);

  // International Size Calculation based on flat garment measurements
  const calculatedFit = calculateGarmentSizeEquivalents(product);

  // Hover-to-Zoom & Authentication Texture Inspection State
  const [isHoveringZoom, setIsHoveringZoom] = useState(false);
  const [isZoomLocked, setIsZoomLocked] = useState(false);
  const [zoomScale, setZoomScale] = useState<number>(2.5);
  const [zoomCoords, setZoomCoords] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const updateZoomPosition = (clientX: number, clientY: number) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
    setZoomCoords({ x, y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isZoomLocked) return;
    updateZoomPosition(e.clientX, e.clientY);
  };

  const handleMouseEnter = () => {
    setIsHoveringZoom(true);
  };

  const handleMouseLeave = () => {
    if (!isZoomLocked) {
      setIsHoveringZoom(false);
    }
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Toggle lock state on click so user can hold view or re-inspect
    updateZoomPosition(e.clientX, e.clientY);
    setIsZoomLocked(prev => !prev);
    setIsHoveringZoom(true);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches && e.touches.length > 0) {
      const touch = e.touches[0];
      updateZoomPosition(touch.clientX, touch.clientY);
      setIsHoveringZoom(true);
    }
  };

  const handleTouchEnd = () => {
    if (!isZoomLocked) {
      setIsHoveringZoom(false);
    }
  };

  const handleThumbnailSelect = (idx: number) => {
    setSelectedImageIndex(idx);
    setIsHoveringZoom(false);
    setIsZoomLocked(false);
  };

  const formatBDT = (amount: number) => {
    return `৳${amount.toLocaleString('en-IN')}`;
  };

  const convertUnit = (valInches?: number) => {
    if (valInches === undefined || valInches === null || valInches === 0) return '—';
    if (measurementUnit === 'INCHES') {
      return `${valInches}"`;
    }
    const cm = (valInches * 2.54).toFixed(1);
    return `${cm} cm`;
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const isSold = product.status === 'SOLD';

  const imageUrls = product.images.map((img: any) => (typeof img === 'string' ? img : img.url));
  const activeImageUrl = imageUrls[selectedImageIndex] || imageUrls[0];

  const getConditionLabel = (grade: string) => {
    switch (grade) {
      case 'BRAND_NEW_TAGS':
        return 'Brand New with Tags';
      case 'EXCELLENT_VINTAGE':
        return 'Excellent Vintage Condition';
      case 'MINOR_FLAWS':
        return 'Minor Vintage Flaws';
      default:
        return grade.replace(/_/g, ' ');
    }
  };

  const handleSelectComplementaryProduct = (newProduct: Product) => {
    setCurrentProduct(newProduct);
    setSelectedImageIndex(0);
    setIsZoomLocked(false);
    setIsHoveringZoom(false);
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    onSelectProduct?.(newProduct);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 lg:p-6 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-[#FAF5EB] rounded-xs shadow-2xl border border-[#D5CBB9] overflow-hidden flex flex-col max-h-[94vh]">
        {/* Top Sticky Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2DACD] bg-[#F7F2E7]/80 backdrop-blur-md z-10 shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-[#8C6D37] tracking-wider uppercase font-semibold">
              SKU: {product.sku}
            </span>
            <span className="text-[#C9B28B]">/</span>
            <div className="flex items-center gap-1.5 text-xs text-neutral-600 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Dhaka Intake Verified</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleWishlist(product)}
              className={`p-2 rounded-xs border transition-colors ${
                isWishlisted
                  ? 'border-[#9B2226]/30 bg-[#9B2226]/10 text-[#9B2226]'
                  : 'border-[#E2DACD] text-[#5C5449] hover:text-[#171513] hover:bg-white'
              }`}
              title="Save to Wishlist"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              className="p-2 rounded-xs border border-[#E2DACD] text-[#5C5449] hover:text-[#171513] hover:bg-white transition-colors"
              title="Share piece"
            >
              <Share2 className="w-4 h-4" />
            </button>
            {copiedLink && (
              <span className="text-[10px] font-mono text-[#171513] bg-[#FAF5EB] border border-[#C9B28B]/40 px-2 py-1 rounded-2xs">
                Copied
              </span>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xs text-[#7A7165] hover:text-[#171513] hover:bg-[#F2ECE4] transition-colors ml-2 cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Container */}
        <div ref={scrollContainerRef} className="overflow-y-auto flex-grow p-6 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* LEFT COLUMN: Gallery & Visuals (7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              {/* Primary Image Viewport with Hover-to-Zoom Macro Inspection */}
              <div
                ref={imageContainerRef}
                onMouseEnter={handleMouseEnter}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={handleImageClick}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className={`relative aspect-[4/5] bg-[#F7F5F0] border border-neutral-200 overflow-hidden flex items-center justify-center select-none transition-all ${
                  isHoveringZoom || isZoomLocked ? 'cursor-crosshair ring-1 ring-[#C9B28B]/50' : 'cursor-zoom-in'
                }`}
                title={isZoomLocked ? "Click to release locked zoom" : "Hover to zoom, click to pin inspection point"}
              >
                {activeImageUrl ? (
                  <img
                    src={activeImageUrl}
                    alt={product.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center pointer-events-none select-none will-change-transform"
                    style={{
                      transformOrigin: `${zoomCoords.x}% ${zoomCoords.y}%`,
                      transform: isHoveringZoom || isZoomLocked ? `scale(${zoomScale})` : 'scale(1)',
                      transition: isHoveringZoom ? 'transform 0.08s ease-out' : 'transform 0.25s ease-out',
                    }}
                  />
                ) : (
                  <div className="p-8 text-center">
                    <span className="font-editorial text-2xl font-bold uppercase text-neutral-400">
                      {product.brand}
                    </span>
                  </div>
                )}

                {/* Scarcity Banner Overlay */}
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
                  <span className="bg-neutral-900 text-white text-[10px] font-mono tracking-widest uppercase px-2.5 py-1 backdrop-blur-xs">
                    1-of-1 Vault Piece in Bangladesh
                  </span>
                  {isSold && (
                    <span className="bg-neutral-800 text-neutral-300 text-[10px] font-mono tracking-widest uppercase px-2.5 py-1">
                      Sold & Delivered in BD
                    </span>
                  )}
                </div>

                {/* Top-Right Macro Zoom HUD Controls */}
                <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                  <div className="bg-neutral-950/85 backdrop-blur-md p-1 rounded-2xs border border-white/10 flex items-center gap-1 shadow-md">
                    <button
                      type="button"
                      onClick={() => {
                        setZoomScale(2.5);
                        setIsHoveringZoom(true);
                      }}
                      className={`px-2 py-0.5 text-[10px] font-mono rounded-3xs transition-all ${
                        zoomScale === 2.5 && (isHoveringZoom || isZoomLocked)
                          ? 'bg-[#C9B28B] text-neutral-950 font-bold'
                          : 'text-neutral-300 hover:text-white'
                      }`}
                      title="2.5x Fabric & Weave Inspection"
                    >
                      2.5×
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setZoomScale(3.5);
                        setIsHoveringZoom(true);
                      }}
                      className={`px-2 py-0.5 text-[10px] font-mono rounded-3xs transition-all ${
                        zoomScale === 3.5 && (isHoveringZoom || isZoomLocked)
                          ? 'bg-[#C9B28B] text-neutral-950 font-bold'
                          : 'text-neutral-300 hover:text-white'
                      }`}
                      title="3.5x Ultra-Macro Hardware & Stitch Inspection"
                    >
                      3.5×
                    </button>
                    {(isHoveringZoom || isZoomLocked) && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsHoveringZoom(false);
                          setIsZoomLocked(false);
                        }}
                        className="px-1.5 py-0.5 text-[10px] font-mono text-neutral-400 hover:text-white border-l border-white/10 ml-0.5"
                        title="Reset Zoom"
                      >
                        <ZoomOut className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Bottom Inspection Indicator Badge */}
                <div className="absolute bottom-4 left-4 z-10 pointer-events-none">
                  {isHoveringZoom || isZoomLocked ? (
                    <div className="bg-neutral-950/90 backdrop-blur-md text-[#FAF8F5] text-[10px] font-mono tracking-wider uppercase px-3 py-1.5 border border-[#C9B28B]/50 rounded-2xs shadow-lg flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#C9B28B] animate-pulse" />
                      <span>
                        {zoomScale}× Authenticator Lens {isZoomLocked ? '• Locked (Click to release)' : '• Move to pan / Click to pin'}
                      </span>
                    </div>
                  ) : (
                    <div className="bg-neutral-950/75 backdrop-blur-sm text-[#FAF8F5] text-[10px] font-mono tracking-wider uppercase px-2.5 py-1.2 rounded-2xs border border-white/10 flex items-center gap-2 group-hover:bg-neutral-950/90 transition-colors">
                      <ZoomIn className="w-3.5 h-3.5 text-[#C9B28B]" />
                      <span>Hover or click to inspect weave & hardware</span>
                    </div>
                  )}
                </div>

                {/* Bottom-Right Coordinate Reticle when zoomed */}
                {(isHoveringZoom || isZoomLocked) && (
                  <div className="absolute bottom-4 right-4 z-10 pointer-events-none bg-neutral-950/70 backdrop-blur-xs text-[#C9B28B] text-[9px] font-mono tracking-widest px-2 py-1 rounded-2xs border border-white/10">
                    FOCUS {Math.round(zoomCoords.x)}% · {Math.round(zoomCoords.y)}%
                  </div>
                )}
              </div>

              {/* Thumbnail Strip */}
              {imageUrls.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {imageUrls.map((url, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleThumbnailSelect(idx)}
                      className={`relative w-20 aspect-square border-2 shrink-0 overflow-hidden transition-all ${
                        selectedImageIndex === idx
                          ? 'border-neutral-950 scale-102'
                          : 'border-neutral-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={url}
                        alt={`View ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Physical Authentication Certificate Badge */}
              <div className="mt-4 p-5 bg-white border border-neutral-200/90 rounded-sm">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-neutral-100 text-neutral-900 rounded-sm shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-editorial text-sm font-bold uppercase tracking-wider text-neutral-900">
                        Authenticated by SAIRAT Archivists (Banani, Dhaka)
                      </h4>
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    </div>
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      Every single piece intake passes through our physical Dhaka inspection vault for stitch tension verification, hardware serial authentication, and fabric density testing before being listed.
                    </p>
                    <div className="pt-2 text-[11px] font-mono text-neutral-500 flex items-center gap-4">
                      <span>Inspection ID: #SRT-BD-{product.id.slice(-6).toUpperCase()}</span>
                      <span>Origin: {product.madeIn}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Contiguous Purchase Module & Resale Specs (5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
              {/* Header Title & Pricing */}
              <div className="border-b border-neutral-200 pb-6">
                <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-neutral-500 mb-1">
                  <span>{product.brand}</span>
                  <span>{product.categoryName}</span>
                </div>

                <h1 className="font-aeonik text-2xl sm:text-3xl font-bold tracking-tight text-[#171513] leading-tight mb-3">
                  {product.title}
                </h1>

                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-baseline gap-3">
                    <span className="font-aeonik text-3xl font-bold text-[#171513] font-tabular">
                      {formatBDT(product.priceBDT)}
                    </span>
                    {product.originalRetailBDT && (
                      <span className="text-sm text-neutral-400 line-through font-tabular">
                        Est. Retail {formatBDT(product.originalRetailBDT)}
                      </span>
                    )}
                  </div>

                  {/* Notify me of price drop button */}
                  <button
                    type="button"
                    onClick={() => setIsPriceDropModalOpen(true)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xs text-xs font-mono transition-all cursor-pointer border ${
                      activePriceAlert
                        ? 'bg-[#171513] text-[#FAF5EB] border-[#C9B28B] shadow-2xs hover:bg-[#2C2824]'
                        : 'bg-[#FAF5EB] hover:bg-[#F0E8D9] text-[#8C6D37] border-[#C9B28B]/60 shadow-3xs'
                    }`}
                    title={activePriceAlert ? "Price drop alert is active for this item - click to manage" : "Notify me of price drop"}
                  >
                    {activePriceAlert ? (
                      <>
                        <BellRing className="w-3.5 h-3.5 text-[#C9B28B] animate-pulse" />
                        <span className="font-bold text-[11px] text-[#FAF5EB]">
                          Alert Active ({formatBDT(activePriceAlert.targetPriceBDT)})
                        </span>
                      </>
                    ) : (
                      <>
                        <Bell className="w-3.5 h-3.5 text-[#8C6D37]" />
                        <span className="font-semibold text-[11px]">Notify on Price Drop</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-2 mt-3 text-xs text-neutral-600 font-mono flex-wrap">
                  <span>Tagged Size: <strong className="text-neutral-900 font-semibold">{product.sizeTag}</strong></span>
                  <span>·</span>
                  <span>Colorway: <strong className="text-neutral-900 font-semibold">{product.colorway}</strong></span>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => setActiveMeasurementTab(prev => prev === 'CONVERSION' ? 'MEASUREMENTS' : 'CONVERSION')}
                    className="inline-flex items-center gap-1 text-[#8C6D37] hover:text-[#171513] font-medium transition-colors cursor-pointer group"
                    title="Click to view international sizing equivalents"
                  >
                    <Globe className="w-3.5 h-3.5 text-[#9B2226]" />
                    <span className="underline underline-offset-2">
                      Fit: {calculatedFit.matchedRow.alpha} (US {calculatedFit.matchedRow.us} / EU {calculatedFit.matchedRow.eu})
                    </span>
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-500 mb-2">
                  Archival Overview
                </h3>
                <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed font-sans">
                  {product.description}
                </p>
              </div>

              {/* Condition Grade & Wear Breakdown */}
              <div className="p-4 bg-white border border-neutral-200 rounded-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-neutral-700" />
                    Condition: {getConditionLabel(product.condition)}
                  </h3>
                  <span className="text-[10px] font-mono text-neutral-400 uppercase">
                    Grade {product.condition === 'BRAND_NEW_TAGS' ? '10/10' : product.condition === 'EXCELLENT_VINTAGE' ? '9/10' : '8/10'}
                  </span>
                </div>

                {/* Progress Indicators for Wear */}
                {product.wearDetails && (
                  <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-mono">
                    <div>
                      <div className="flex justify-between text-[11px] text-neutral-600 mb-1">
                        <span>Fabric Integrity</span>
                        <span className="font-semibold">{product.wearDetails.fabricIntegrity}%</span>
                      </div>
                      <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-neutral-900 h-full rounded-full"
                          style={{ width: `${product.wearDetails.fabricIntegrity}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-neutral-600 mb-1">
                        <span>Seam Tension</span>
                        <span className="font-semibold">{product.wearDetails.seamTension}%</span>
                      </div>
                      <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-neutral-900 h-full rounded-full"
                          style={{ width: `${product.wearDetails.seamTension}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-neutral-600 mb-1">
                        <span>Hardware Patina</span>
                        <span className="font-semibold">{product.wearDetails.hardwarePatina}%</span>
                      </div>
                      <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-neutral-900 h-full rounded-full"
                          style={{ width: `${product.wearDetails.hardwarePatina}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-neutral-600 mb-1">
                        <span>Label Legibility</span>
                        <span className="font-semibold">{product.wearDetails.labelLegibility}%</span>
                      </div>
                      <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-neutral-900 h-full rounded-full"
                          style={{ width: `${product.wearDetails.labelLegibility}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Flat Garment Measurements & International Size Conversion Module */}
              <div className="space-y-3">
                {/* Section Segmented Navigation Tabs */}
                <div className="flex items-center justify-between border-b border-[#E8E2D8] pb-2">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setActiveMeasurementTab('MEASUREMENTS')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-xs transition-all cursor-pointer ${
                        activeMeasurementTab === 'MEASUREMENTS'
                          ? 'bg-[#171513] text-white font-bold shadow-xs'
                          : 'text-[#7A7165] hover:text-[#171513] bg-[#F7F5F0]'
                      }`}
                    >
                      <Ruler className="w-3.5 h-3.5" />
                      <span>Flat Measurements</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveMeasurementTab('CONVERSION')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-xs transition-all cursor-pointer ${
                        activeMeasurementTab === 'CONVERSION'
                          ? 'bg-[#171513] text-white font-bold shadow-xs'
                          : 'text-[#7A7165] hover:text-[#171513] bg-[#F7F5F0]'
                      }`}
                    >
                      <Globe className="w-3.5 h-3.5 text-[#C9B28B]" />
                      <span>Int'l Size Table (US, EU, UK, JP)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveMeasurementTab('BOTH')}
                      className={`hidden sm:flex items-center gap-1 px-2.5 py-1.5 text-xs font-mono rounded-xs transition-all cursor-pointer ${
                        activeMeasurementTab === 'BOTH'
                          ? 'bg-[#171513] text-white font-bold shadow-xs'
                          : 'text-[#7A7165] hover:text-[#171513] bg-[#F7F5F0]'
                      }`}
                    >
                      <span>Show Both</span>
                    </button>
                  </div>

                  <span className="text-[10px] font-mono text-[#8C6D37] font-semibold uppercase hidden md:inline-block">
                    Dhaka Vault Authenticated
                  </span>
                </div>

                {/* VIEW 1: FLAT MEASUREMENTS (Shown on 'MEASUREMENTS' or 'BOTH') */}
                {(activeMeasurementTab === 'MEASUREMENTS' || activeMeasurementTab === 'BOTH') && (
                  <div className="p-4 bg-white border border-neutral-200 rounded-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Ruler className="w-4 h-4 text-neutral-700" />
                        <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-900">
                          Hand-Measured Flat Dimensions
                        </h3>
                      </div>

                      {/* Unit Toggle: INCHES vs CM */}
                      <div className="flex items-center bg-neutral-100 p-0.5 rounded text-[10px] font-mono">
                        <button
                          type="button"
                          onClick={() => setMeasurementUnit('INCHES')}
                          className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                            measurementUnit === 'INCHES'
                              ? 'bg-neutral-900 text-white font-bold shadow-xs'
                              : 'text-neutral-600 hover:text-neutral-950'
                          }`}
                        >
                          INCHES
                        </button>
                        <button
                          type="button"
                          onClick={() => setMeasurementUnit('CM')}
                          className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                            measurementUnit === 'CM'
                              ? 'bg-neutral-900 text-white font-bold shadow-xs'
                              : 'text-neutral-600 hover:text-neutral-950'
                          }`}
                        >
                          CM
                        </button>
                      </div>
                    </div>

                    {/* Measurements Data Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs">
                      {product.measurements.chestWidthIn ? (
                        <div className="p-2 bg-neutral-50 rounded border border-neutral-100">
                          <span className="text-[10px] text-neutral-500 uppercase block">Pit-to-Pit</span>
                          <span className="font-bold text-neutral-900">{convertUnit(product.measurements.chestWidthIn)}</span>
                        </div>
                      ) : null}

                      {product.measurements.lengthIn ? (
                        <div className="p-2 bg-neutral-50 rounded border border-neutral-100">
                          <span className="text-[10px] text-neutral-500 uppercase block">Length</span>
                          <span className="font-bold text-neutral-900">{convertUnit(product.measurements.lengthIn)}</span>
                        </div>
                      ) : null}

                      {product.measurements.shoulderWidthIn ? (
                        <div className="p-2 bg-neutral-50 rounded border border-neutral-100">
                          <span className="text-[10px] text-neutral-500 uppercase block">Shoulder</span>
                          <span className="font-bold text-neutral-900">{convertUnit(product.measurements.shoulderWidthIn)}</span>
                        </div>
                      ) : null}

                      {product.measurements.sleeveLengthIn ? (
                        <div className="p-2 bg-neutral-50 rounded border border-neutral-100">
                          <span className="text-[10px] text-neutral-500 uppercase block">Sleeve</span>
                          <span className="font-bold text-neutral-900">{convertUnit(product.measurements.sleeveLengthIn)}</span>
                        </div>
                      ) : null}

                      {product.measurements.waistIn ? (
                        <div className="p-2 bg-neutral-50 rounded border border-neutral-100">
                          <span className="text-[10px] text-neutral-500 uppercase block">Waist Flat</span>
                          <span className="font-bold text-neutral-900">{convertUnit(product.measurements.waistIn)}</span>
                        </div>
                      ) : null}

                      {product.measurements.inseamIn ? (
                        <div className="p-2 bg-neutral-50 rounded border border-neutral-100">
                          <span className="text-[10px] text-neutral-500 uppercase block">Inseam</span>
                          <span className="font-bold text-neutral-900">{convertUnit(product.measurements.inseamIn)}</span>
                        </div>
                      ) : null}

                      {product.measurements.riseIn ? (
                        <div className="p-2 bg-neutral-50 rounded border border-neutral-100">
                          <span className="text-[10px] text-neutral-500 uppercase block">Front Rise</span>
                          <span className="font-bold text-neutral-900">{convertUnit(product.measurements.riseIn)}</span>
                        </div>
                      ) : null}

                      {product.measurements.legOpeningIn ? (
                        <div className="p-2 bg-neutral-50 rounded border border-neutral-100">
                          <span className="text-[10px] text-neutral-500 uppercase block">Leg Opening</span>
                          <span className="font-bold text-neutral-900">{convertUnit(product.measurements.legOpeningIn)}</span>
                        </div>
                      ) : null}
                    </div>

                    {/* Quick Calculated International Equivalents Ribbon */}
                    <div className="p-2.5 bg-[#FAF5EB] rounded-xs border border-[#C9B28B]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-mono">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] uppercase font-bold text-[#8C6D37]">Equivalent:</span>
                        <span className="px-1.5 py-0.5 bg-[#171513] text-[#FAF5EB] text-[10px] font-bold rounded-3xs">
                          {calculatedFit.matchedRow.alpha}
                        </span>
                        <span className="text-[#5C5449]">
                          US {calculatedFit.matchedRow.us} · EU {calculatedFit.matchedRow.eu} · UK {calculatedFit.matchedRow.uk} · JP {calculatedFit.matchedRow.jp}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveMeasurementTab('CONVERSION')}
                        className="text-[11px] font-bold text-[#171513] hover:text-[#9B2226] flex items-center gap-1 underline underline-offset-2 cursor-pointer transition-colors"
                      >
                        <span>Conversion Table</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* VIEW 2: FULL INTERNATIONAL SIZE CONVERSION TABLE (Shown on 'CONVERSION' or 'BOTH') */}
                {(activeMeasurementTab === 'CONVERSION' || activeMeasurementTab === 'BOTH') && (
                  <SizeConversionTable
                    product={product}
                    unit={measurementUnit}
                    onUnitToggle={setMeasurementUnit}
                  />
                )}
              </div>

              {/* Bangladesh Delivery Logistics */}
              <div className="p-3 bg-[#FAF5EB] rounded-xs border border-[#C9B28B]/40 text-xs font-mono space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-2 font-bold text-[#171513]">
                  <Truck className="w-4 h-4 text-[#9E7D47]" />
                  <span>Steadfast & Pathao Courier Logistics:</span>
                </div>
                <div className="text-[#5C5449] text-[11px] leading-relaxed">
                  · <strong>Inside Dhaka:</strong> ৳80 delivery fee (1-2 Days Express)<br />
                  · <strong>Outside Dhaka:</strong> ৳150 delivery fee (2-4 Days Nationwide)<br />
                  · Payments accepted via <strong>bKash, Nagad, Cards & Partial COD</strong>
                </div>
              </div>

              {/* Primary Call-to-Action: Direct Bag Addition */}
              <div className="pt-2 border-t border-[#E8E2D8]">
                {isSold ? (
                  <div className="space-y-2">
                    <button
                      disabled
                      className="w-full py-4 bg-[#ECE5DB] text-[#8C8377] font-mono text-xs uppercase tracking-widest font-bold cursor-not-allowed rounded-xs border border-[#DDD5C7]"
                    >
                      Sold & Delivered to Collector in Bangladesh
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPriceDropModalOpen(true)}
                      className="w-full py-2.5 bg-white hover:bg-[#FAF5EB] text-[#8C6D37] border border-[#C9B28B] font-mono text-xs font-semibold rounded-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>Notify Me If Similar Relic Restocks or Drops</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={() => onAddToCart(product)}
                      disabled={isAddingToBag}
                      className="w-full py-4 bg-[#171513] hover:bg-[#9E7D47] text-[#FAF5EB] transition-colors font-mono text-xs uppercase tracking-widest font-bold shadow-md flex items-center justify-center gap-2 group cursor-pointer rounded-xs"
                    >
                      {isAddingToBag ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 animate-spin text-[#C9B28B]" />
                          <span>Adding to Shopping Bag...</span>
                        </>
                      ) : (
                        <>
                          <span>Add 1-of-1 Piece to Bag</span>
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#C9B28B]" />
                        </>
                      )}
                    </button>
                    <p className="text-[11px] text-[#7A7165] font-mono text-center">
                      1-of-1 unique archival item · Instant checkout via bKash, Nagad, or Partial COD · Direct courier dispatch
                    </p>
                    <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-[#8C6D37]">
                      <button
                        type="button"
                        onClick={() => setIsPriceDropModalOpen(true)}
                        className="inline-flex items-center gap-1.5 hover:text-[#171513] transition-colors cursor-pointer group"
                      >
                        {activePriceAlert ? (
                          <>
                            <BellRing className="w-3.5 h-3.5 text-[#C9B28B] animate-pulse" />
                            <span className="font-semibold underline underline-offset-2">
                              Price Drop Alert Active ({formatBDT(activePriceAlert.targetPriceBDT)})
                            </span>
                          </>
                        ) : (
                          <>
                            <Bell className="w-3.5 h-3.5 text-[#8C6D37] group-hover:scale-110 transition-transform" />
                            <span className="underline underline-offset-2">
                              Notify me of price drop (Toast or Email)
                            </span>
                          </>
                        )}
                      </button>
                      <span className="text-[10px] text-neutral-400">Dhaka Vault Guaranteed</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Complete the Look - Suggested Complementary Pieces */}
          <CompleteTheLook
            currentProduct={currentProduct}
            catalog={allProducts && allProducts.length > 0 ? allProducts : INITIAL_PRODUCTS}
            onSelectProduct={handleSelectComplementaryProduct}
            onAddToCart={onAddToCart}
          />

          {/* Recently Viewed - Horizontal Scroll History Section */}
          <RecentlyViewed
            currentProductId={currentProduct.id}
            fallbackCatalog={allProducts && allProducts.length > 0 ? allProducts : INITIAL_PRODUCTS}
            onSelectProduct={handleSelectComplementaryProduct}
            onAddToCart={onAddToCart}
          />
        </div>
      </div>

      {/* Price Drop Notification Modal */}
      <PriceDropModal
        isOpen={isPriceDropModalOpen}
        onClose={() => {
          setIsPriceDropModalOpen(false);
          setActivePriceAlert(getPriceAlertForProduct(currentProduct.id));
        }}
        product={currentProduct}
        onProductPriceUpdated={(updated) => {
          setCurrentProduct(updated);
          onProductPriceUpdated?.(updated);
        }}
      />
    </div>
  );
};
