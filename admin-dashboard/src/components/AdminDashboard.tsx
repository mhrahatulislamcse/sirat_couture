import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  RefreshCw,
  Search,
  Filter,
  CheckSquare,
  Square,
  DollarSign,
  TrendingUp,
  Tag,
  Clock,
  Layers,
  Archive,
  BarChart3,
  Barcode,
  Sparkles,
  Database,
  Truck,
  Box,
  ExternalLink,
  Phone,
  CheckCircle2,
  Printer,
  Settings,
  Edit2,
  Send,
  FileText,
  ShieldCheck,
  Check,
  Trash2,
  Store,
  ShoppingBag,
  Eye,
  AlertCircle,
  ArrowUpRight,
  ArrowRight,
  User,
  MapPin,
  CreditCard,
  ChevronRight,
  SlidersHorizontal,
  Image as ImageIcon,
  AlertTriangle,
  RotateCcw,
  Save,
  Calculator,
  QrCode,
  Maximize2,
  Download
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Product,
  ProductStatus,
  AdminStats,
  Order,
  InventoryLock,
  CourierProvider,
  DeliveryZone,
  ConsignmentNote,
  CourierApiConfig,
  StorefrontConfig,
  Gender
} from '../types/resale';
import { ConsignmentNoteModal } from './ConsignmentNoteModal';
import { CourierConfigModal } from './CourierConfigModal';
import { AdminDispatchControl, DispatchOptions } from './AdminDispatchControl';
import { BarcodeScannerPanel } from './BarcodeScannerPanel';
import { CourierAnalyticsPanel } from './CourierAnalyticsPanel';
import { SkuBarcode } from './SkuBarcode';
import { TAXONOMY } from '../data/initialCatalog';
import { generateInventoryQrSheetPdf } from '../utils/qrTagPdfGenerator';
import { AdminUser } from '../types/auth';
import { adminApiRequest } from '../lib/adminApiClient';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onRefreshData: () => void;
  onOpenArchitecture: () => void;
  storefrontConfig?: StorefrontConfig | null;
  onRefreshStorefront?: () => void;
  adminUser?: AdminUser | null;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  products,
  onRefreshData,
  onOpenArchitecture,
  storefrontConfig: initialStorefrontConfig,
  onRefreshStorefront,
  adminUser
}) => {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'INVENTORY' | 'ADD_PRODUCT' | 'ORDERS' | 'SCANNER' | 'ANALYTICS' | 'STOREFRONT' | 'HOLDS'>('OVERVIEW');

  // Dashboard Data
  const [dashboardData, setDashboardData] = useState<{
    stats?: AdminStats;
    recentOrders?: Order[];
    activeLocks?: InventoryLock[];
  }>({});
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Inventory Management State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [brandFilter, setBrandFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [genderFilter, setGenderFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [skuFilter, setSkuFilter] = useState<string>('');
  const [batchUpdating, setBatchUpdating] = useState(false);
  const [isExportingQrPdf, setIsExportingQrPdf] = useState(false);
  const [qrPdfNotice, setQrPdfNotice] = useState<string | null>(null);

  // Edit Product Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Delete Product Confirmation State
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Mobile Staff SKU QR & Barcode Label Modal State
  const [labelModalProduct, setLabelModalProduct] = useState<Product | null>(null);

  // Product Add / Intake Studio State
  const [addTitle, setAddTitle] = useState('');
  const [addBrand, setAddBrand] = useState('Raf Simons');
  const [addGender, setAddGender] = useState<'MEN' | 'WOMEN' | 'UNSPECIFIED'>('MEN');
  const [addCategory, setAddCategory] = useState('cat_outerwear');
  const [addCogsBDT, setAddCogsBDT] = useState('45000');
  const [addPriceBDT, setAddPriceBDT] = useState('85000');
  const [addOriginalRetailBDT, setAddOriginalRetailBDT] = useState('110000');
  const [addCondition, setAddCondition] = useState<'BRAND_NEW_TAGS' | 'EXCELLENT_VINTAGE' | 'MINOR_FLAWS'>('EXCELLENT_VINTAGE');
  const [addEra, setAddEra] = useState<'ERA_90S' | 'Y2K' | 'MODERN'>('ERA_90S');
  const [addSizeTag, setAddSizeTag] = useState('EU 50 / Fits Oversized XL');
  const [addColorway, setAddColorway] = useState('Faded Military Olive');
  const [addComposition, setAddComposition] = useState('100% Japanese Cotton / Silk Lining');
  const [addMadeIn, setAddMadeIn] = useState('Japan');
  const [addChest, setAddChest] = useState('23.5');
  const [addLength, setAddLength] = useState('28.0');
  const [addShoulder, setAddShoulder] = useState('20.5');
  const [addSleeve, setAddSleeve] = useState('26.0');
  const [addWaist, setAddWaist] = useState('');
  const [addInseam, setAddInseam] = useState('');
  const [addRise, setAddRise] = useState('');
  const [addDescription, setAddDescription] = useState('Authenticated archival piece preserved in Dhaka vault.');
  const [addNotes, setAddNotes] = useState('Verified original Lampo hardware teeth & basting stitches.');
  const [addImageUrl, setAddImageUrl] = useState('https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1200&q=80');
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);
  const [addSuccessMsg, setAddSuccessMsg] = useState<string | null>(null);

  // Orders Management State
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('ALL');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [dispatchSuccessMsg, setDispatchSuccessMsg] = useState<string | null>(null);
  const [batchDispatching, setBatchDispatching] = useState(false);
  const [expandedDispatchOrderId, setExpandedDispatchOrderId] = useState<string | null>(null);
  const [dispatchingOrderId, setDispatchingOrderId] = useState<string | null>(null);
  const [syncingOrderId, setSyncingOrderId] = useState<string | null>(null);

  // Manual Order Creation State (Walk-in / Phone clients in Dhaka)
  const [isManualOrderModalOpen, setIsManualOrderModalOpen] = useState(false);
  const [manualCustomerName, setManualCustomerName] = useState('');
  const [manualCustomerPhone, setManualCustomerPhone] = useState('01711982341');
  const [manualCustomerEmail, setManualCustomerEmail] = useState('');
  const [manualProductId, setManualProductId] = useState('');
  const [manualDeliveryZone, setManualDeliveryZone] = useState<'INSIDE_DHAKA' | 'OUTSIDE_DHAKA'>('INSIDE_DHAKA');
  const [manualStreetAddress, setManualStreetAddress] = useState('House 14, Road 11, Banani');
  const [manualThana, setManualThana] = useState('Banani');
  const [manualDistrict, setManualDistrict] = useState('Dhaka (Metropolitan)');
  const [manualDivision, setManualDivision] = useState('Dhaka');
  const [manualPaymentGateway, setManualPaymentGateway] = useState<'BKASH' | 'NAGAD' | 'CASH_ON_DELIVERY'>('BKASH');
  const [manualPaymentTrxId, setManualPaymentTrxId] = useState('');
  const [isSubmittingManualOrder, setIsSubmittingManualOrder] = useState(false);

  // Storefront Maintenance State
  const [storefrontForm, setStorefrontForm] = useState<StorefrontConfig>({
    announcementText: 'COMPLIMENTARY WHITE-GLOVE BANANI & GULSHAN SAME-DAY HAND DELIVERY · VERIFIED 1-OF-1 ARCHIVE PIECES',
    isAnnouncementVisible: true,
    heroHeadline: 'Minimalism and fantasy',
    heroSubheadline: 'Curated 1-of-1 archival relics verified with forensic authenticity and flat-measured to the millimeter.',
    heroTag: 'Archive Capsule 2026',
    heroImageUrl: 'https://innovecouture.vamtam.com/wp-content/uploads/2024/01/pexels-cottonbro-studio-9836585-1-scaled.jpg',
    menHeroHeadline: 'Minimalism and fantasy',
    menHeroSubheadline: 'Curated 1-of-1 relics from the Antwerp Six, 1990s Tokyo Ura-Harajuku, and bespoke Savile Row tailoring. Every garment verified with forensic authenticity and flat-measured to the half-inch.',
    menHeroImageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=2200&q=85',
    insideDhakaDeliveryFeeBDT: 80,
    outsideDhakaDeliveryFeeBDT: 150,
    conciergePhone: '+880 1711-982341',
    isMaintenanceMode: false,
    activeCampaignName: 'Autumn / Winter Archival Capsule 2026',
    updatedAt: new Date().toISOString()
  });
  const [isSavingStorefront, setIsSavingStorefront] = useState(false);
  const [storefrontSuccessMsg, setStorefrontSuccessMsg] = useState<string | null>(null);

  // Courier Gateways & Consignment Modals state
  const [courierConfig, setCourierConfig] = useState<CourierApiConfig | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [activeConsignmentNote, setActiveConsignmentNote] = useState<ConsignmentNote | null>(null);
  const [isConsignmentModalOpen, setIsConsignmentModalOpen] = useState(false);
  const [consignmentModalMode, setConsignmentModalMode] = useState<'PREVIEW_MOCK_4X6' | 'THERMAL_4X6' | 'A4_FULL'>('PREVIEW_MOCK_4X6');
  const [openPrintPreviewOnMount, setOpenPrintPreviewOnMount] = useState(false);

  // Holds Management State
  const [isReleasingHolds, setIsReleasingHolds] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchDashboardStats();
      fetchCourierConfig();
      fetchStorefrontConfig();
    }
  }, [isOpen]);

  const fetchCourierConfig = async () => {
    try {
      const res = await adminApiRequest('/api/admin/courier/config');
      if (res.ok) {
        const data = await res.json();
        setCourierConfig(data.config);
      }
    } catch (e) {
      console.error('Failed to load courier gateway config', e);
    }
  };

  const fetchStorefrontConfig = async () => {
    try {
      const res = await adminApiRequest('/api/storefront/config');
      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          setStorefrontForm(data.config);
        }
      }
    } catch (e) {
      console.error('Failed to load storefront config', e);
    }
  };

  const fetchDashboardStats = async () => {
    setIsLoadingStats(true);
    try {
      const res = await adminApiRequest('/api/admin/dashboard');
      if (res.ok) {
        const data = await res.json();
        setDashboardData(data);
      }
    } catch (e) {
      console.error('Failed to load dashboard stats', e);
    } finally {
      setIsLoadingStats(false);
    }
  };

  if (!isOpen) return null;

  const formatBDT = (amount: number) => {
    return `৳${(amount || 0).toLocaleString('en-IN')}`;
  };

  const calculateMargin = (price: number, cogs: number) => {
    if (!price || price <= 0) return '0.0%';
    return `${(((price - (cogs || 0)) / price) * 100).toFixed(1)}%`;
  };

  // Preset Image URLs for fast archival intake
  const PRESET_IMAGES = [
    { label: "Raf Simons Riot Bomber", url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1200&q=80" },
    { label: "Yohji Gabardine Tailoring", url: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1200&q=80" },
    { label: "Cashmere Wool Overcoat", url: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=1200&q=80" },
    { label: "Undercover 85 Selvedge Denim", url: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=1200&q=80" },
    { label: "High-Fashion Leather Boots", url: "https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=1200&q=80" },
    { label: "Archival Suiting Jacket", url: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=1200&q=80" }
  ];

  // =========================================================================
  // HANDLERS: INVENTORY & STATUS
  // =========================================================================

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map((p) => p.id));
    }
  };

  const handleBatchStatus = async (status: ProductStatus) => {
    if (selectedIds.length === 0) return;
    setBatchUpdating(true);
    try {
      const res = await adminApiRequest('/api/admin/products/batch-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds: selectedIds, status })
      });
      if (res.ok) {
        setSelectedIds([]);
        onRefreshData();
        fetchDashboardStats();
      }
    } catch (err) {
      console.error('Failed to batch update', err);
    } finally {
      setBatchUpdating(false);
    }
  };

  const handleExportQrSheetPdf = async (mode: 'FILTERED' | 'SELECTED' = 'FILTERED') => {
    const targetProducts =
      mode === 'SELECTED'
        ? products.filter((p) => selectedIds.includes(p.id))
        : filteredProducts;

    if (targetProducts.length === 0) return;

    setIsExportingQrPdf(true);
    setQrPdfNotice(null);
    try {
      const activeSummaryParts: string[] = [];
      if (mode === 'SELECTED') {
        activeSummaryParts.push('Selected batch');
      } else {
        if (normalizedSkuFilter) activeSummaryParts.push(`SKU:${skuFilter.trim()}`);
        if (brandFilter !== 'ALL') activeSummaryParts.push(brandFilter);
        if (genderFilter !== 'ALL') activeSummaryParts.push(genderFilter);
        if (statusFilter !== 'ALL') activeSummaryParts.push(statusFilter);
      }

      const result = await generateInventoryQrSheetPdf(
        targetProducts,
        activeSummaryParts.join(' · ') || 'Full Visible Inventory'
      );
      setQrPdfNotice(
        `Downloaded ${result.pages}-page PDF sheet (${result.count} SKU QR tag${result.count === 1 ? '' : 's'})`
      );
      setTimeout(() => setQrPdfNotice(null), 5000);
    } catch (err) {
      console.error('Failed to generate printable SKU QR PDF sheet', err);
      setQrPdfNotice('Could not generate QR tag PDF sheet. Please try again.');
      setTimeout(() => setQrPdfNotice(null), 5000);
    } finally {
      setIsExportingQrPdf(false);
    }
  };

  const handleInlineStatusToggle = async (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatus: Record<ProductStatus, ProductStatus> = {
      ACTIVE: 'IN_CART_HOLD',
      IN_CART_HOLD: 'SOLD',
      SOLD: 'ARCHIVED',
      ARCHIVED: 'ACTIVE'
    };
    const targetStatus = nextStatus[product.status] || 'ACTIVE';

    try {
      await adminApiRequest('/api/admin/products/batch-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds: [product.id], status: targetStatus })
      });
      onRefreshData();
      fetchDashboardStats();
    } catch (err) {
      console.error(err);
    }
  };

  // Open Edit Product Modal
  const handleOpenEdit = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProduct({ ...product });
    setIsEditModalOpen(true);
  };

  // Submit Product Edit
  const handleSaveEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setIsSavingEdit(true);

    try {
      const res = await adminApiRequest(`/api/admin/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProduct)
      });
      if (res.ok) {
        setIsEditModalOpen(false);
        setEditingProduct(null);
        onRefreshData();
        fetchDashboardStats();
      }
    } catch (err) {
      console.error('Failed to update product', err);
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Delete Product
  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    setIsDeleting(true);

    try {
      const res = await adminApiRequest(`/api/admin/products/${deletingProduct.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setDeletingProduct(null);
        onRefreshData();
        fetchDashboardStats();
      }
    } catch (err) {
      console.error('Failed to delete product', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // =========================================================================
  // HANDLERS: ADD PRODUCT (INTAKE STUDIO)
  // =========================================================================
  const handleSubmitAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addTitle.trim() || !addBrand.trim() || !addPriceBDT) return;

    setIsSubmittingAdd(true);
    setAddSuccessMsg(null);

    const categoryObj = TAXONOMY.find((c) => c.id === addCategory);
    const categoryName = categoryObj ? categoryObj.name : 'Archival Piece';

    const payload = {
      title: addTitle.trim(),
      brand: addBrand.trim(),
      gender: addGender,
      cogsBDT: parseFloat(addCogsBDT) || 0,
      priceBDT: parseFloat(addPriceBDT) || 0,
      originalRetailBDT: parseFloat(addOriginalRetailBDT) || Math.round(parseFloat(addPriceBDT) * 1.25),
      condition: addCondition,
      era: addEra,
      categoryId: addCategory,
      categoryName,
      sizeTag: addSizeTag,
      colorway: addColorway,
      composition: addComposition,
      madeIn: addMadeIn,
      description: addDescription,
      measurements: {
        chestWidthIn: parseFloat(addChest) || undefined,
        lengthIn: parseFloat(addLength) || undefined,
        shoulderWidthIn: parseFloat(addShoulder) || undefined,
        sleeveLengthIn: parseFloat(addSleeve) || undefined,
        waistIn: parseFloat(addWaist) || undefined,
        inseamIn: parseFloat(addInseam) || undefined,
        riseIn: parseFloat(addRise) || undefined
      },
      wearDetails: {
        fabricIntegrity: 98,
        seamTension: 98,
        hardwarePatina: 95,
        labelLegibility: 98,
        defectsSummary: addNotes
      },
      images: [addImageUrl.trim()]
    };

    try {
      const res = await adminApiRequest('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setAddSuccessMsg(`Piece "${data.product.title}" (${data.sku}) listed into archive with ${data.grossMarginPercentage}% margin.`);
        onRefreshData();
        fetchDashboardStats();
        // Reset form to sensible defaults
        setAddTitle('');
        setAddPriceBDT('');
        setAddCogsBDT('');
        setTimeout(() => setAddSuccessMsg(null), 6000);
      }
    } catch (err) {
      console.error('Failed to add product', err);
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  // =========================================================================
  // HANDLERS: ORDERS & LOGISTICS
  // =========================================================================
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await adminApiRequest(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchDashboardStats();
      }
    } catch (err) {
      console.error('Failed to update order status', err);
    }
  };

  const handleManualOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCustomerName || !manualCustomerPhone || !manualProductId) return;

    setIsSubmittingManualOrder(true);
    try {
      const res = await adminApiRequest('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: manualCustomerName,
          customerPhone: manualCustomerPhone,
          customerEmail: manualCustomerEmail,
          productId: manualProductId,
          deliveryZone: manualDeliveryZone,
          streetAddress: manualStreetAddress,
          thana: manualThana,
          district: manualDistrict,
          division: manualDivision,
          paymentGateway: manualPaymentGateway,
          paymentTrxId: manualPaymentTrxId
        })
      });
      if (res.ok) {
        setIsManualOrderModalOpen(false);
        setManualCustomerName('');
        setManualCustomerEmail('');
        setManualPaymentTrxId('');
        fetchDashboardStats();
        onRefreshData();
      }
    } catch (err) {
      console.error('Failed to create manual order', err);
    } finally {
      setIsSubmittingManualOrder(false);
    }
  };

  const handleDispatchOrder = async (
    orderId: string,
    courier: CourierProvider,
    deliveryZone: DeliveryZone,
    note?: string,
    options?: DispatchOptions
  ): Promise<ConsignmentNote | null> => {
    setDispatchingOrderId(orderId);
    try {
      const res = await adminApiRequest(`/api/admin/orders/${orderId}/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courier,
          deliveryZone,
          note,
          deliveryType: options?.deliveryType,
          weightKg: options?.weightKg
        })
      });
      const data = await res.json();
      if (res.ok) {
        setDispatchSuccessMsg(data.message);
        if (data.consignmentNote) {
          setActiveConsignmentNote(data.consignmentNote);
          setConsignmentModalMode('PREVIEW_MOCK_4X6');
          setOpenPrintPreviewOnMount(true);
          setIsConsignmentModalOpen(true);
        }
        fetchDashboardStats();
        fetchCourierConfig();
        setTimeout(() => setDispatchSuccessMsg(null), 6000);
        return data.consignmentNote || null;
      }
      return null;
    } catch (err) {
      console.error('Failed to dispatch order', err);
      return null;
    } finally {
      setDispatchingOrderId(null);
    }
  };

  const handleZoneChangeOrder = async (
    orderId: string,
    newZone: DeliveryZone,
    courier?: CourierProvider,
    options?: DispatchOptions
  ): Promise<void> => {
    try {
      const res = await adminApiRequest(`/api/admin/orders/${orderId}/delivery-zone`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deliveryZone: newZone,
          courier,
          deliveryType: options?.deliveryType,
          weightKg: options?.weightKg
        })
      });
      const data = await res.json();
      if (res.ok && data.order) {
        setDashboardData((prev) => ({
          ...prev,
          recentOrders: (prev.recentOrders || []).map((o) => (o.id === orderId ? data.order : o))
        }));
      }
    } catch (err) {
      console.error('Failed to update delivery zone', err);
    }
  };

  const handleSyncCourierStatus = async (orderId: string): Promise<void> => {
    setSyncingOrderId(orderId);
    try {
      const res = await adminApiRequest(`/api/admin/orders/${orderId}/courier-status`, {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok) {
        setDispatchSuccessMsg(data.message);
        fetchDashboardStats();
        setTimeout(() => setDispatchSuccessMsg(null), 5000);
      }
    } catch (err) {
      console.error('Failed to sync courier status', err);
    } finally {
      setSyncingOrderId(null);
    }
  };

  const handleViewConsignmentNote = async (
    orderId: string,
    initialMode: 'PREVIEW_MOCK_4X6' | 'THERMAL_4X6' | 'A4_FULL' = 'PREVIEW_MOCK_4X6',
    openPreviewModal: boolean = false
  ) => {
    try {
      const res = await adminApiRequest(`/api/admin/orders/${orderId}/consignment-note`);
      if (res.ok) {
        const data = await res.json();
        setActiveConsignmentNote(data.consignmentNote);
        setConsignmentModalMode(initialMode);
        setOpenPrintPreviewOnMount(openPreviewModal);
        setIsConsignmentModalOpen(true);
      }
    } catch (err) {
      console.error('Failed to fetch consignment note', err);
    }
  };

  // =========================================================================
  // HANDLERS: STOREFRONT MAINTENANCE
  // =========================================================================
  const handleSaveStorefront = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingStorefront(true);
    setStorefrontSuccessMsg(null);

    try {
      const res = await adminApiRequest('/api/admin/storefront/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storefrontForm)
      });
      const data = await res.json();
      if (res.ok) {
        setStorefrontSuccessMsg('Storefront settings updated and live across client sessions.');
        if (onRefreshStorefront) onRefreshStorefront();
        setTimeout(() => setStorefrontSuccessMsg(null), 5000);
      }
    } catch (err) {
      console.error('Failed to save storefront config', err);
    } finally {
      setIsSavingStorefront(false);
    }
  };

  // =========================================================================
  // HANDLERS: HOLDS RELEASE
  // =========================================================================
  const handleReleaseHold = async (productId: string) => {
    try {
      await adminApiRequest(`/api/cart/hold/${productId}`, { method: 'DELETE' });
      fetchDashboardStats();
      onRefreshData();
    } catch (err) {
      console.error('Failed to release hold', err);
    }
  };

  const handleReleaseAllHolds = async () => {
    setIsReleasingHolds(true);
    try {
      await adminApiRequest('/api/admin/holds/all', { method: 'DELETE' });
      fetchDashboardStats();
      onRefreshData();
    } catch (err) {
      console.error('Failed to release all holds', err);
    } finally {
      setIsReleasingHolds(false);
    }
  };

  // =========================================================================
  // FILTERING LOGIC
  // =========================================================================
  const brands = Array.from(new Set(products.map((p) => p.brand)));

  let filteredProducts = [...products];
  if (brandFilter !== 'ALL') {
    filteredProducts = filteredProducts.filter((p) => p.brand.toLowerCase() === brandFilter.toLowerCase());
  }
  if (statusFilter !== 'ALL') {
    filteredProducts = filteredProducts.filter((p) => p.status === statusFilter);
  }
  if (genderFilter !== 'ALL') {
    filteredProducts = filteredProducts.filter((p) => p.gender === genderFilter || p.gender === 'UNISEX');
  }
  if (categoryFilter !== 'ALL') {
    filteredProducts = filteredProducts.filter((p) => p.categoryId === categoryFilter);
  }
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredProducts = filteredProducts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q)
    );
  }
  const normalizedSkuFilter = (() => {
    const raw = skuFilter.trim();
    if (!raw) return '';
    const urlMatch = raw.match(/(?:^|[?&])sku=([^&\s]+)/i);
    if (urlMatch && urlMatch[1]) {
      return decodeURIComponent(urlMatch[1]).replace(/^\*+|\*+$/g, '').trim().toLowerCase();
    }
    return raw
      .replace(/^sku:\s*/i, '')
      .replace(/^\*+|\*+$/g, '')
      .trim()
      .toLowerCase();
  })();
  if (normalizedSkuFilter) {
    filteredProducts = filteredProducts.filter((p) =>
      p.sku.toLowerCase().includes(normalizedSkuFilter)
    );
  }

  const hasActiveInventoryFilters =
    brandFilter !== 'ALL' ||
    categoryFilter !== 'ALL' ||
    statusFilter !== 'ALL' ||
    genderFilter !== 'ALL' ||
    Boolean(searchQuery.trim()) ||
    Boolean(normalizedSkuFilter);

  const handleResetInventoryFilters = () => {
    setBrandFilter('ALL');
    setCategoryFilter('ALL');
    setStatusFilter('ALL');
    setGenderFilter('ALL');
    setSearchQuery('');
    setSkuFilter('');
  };

  // Filter Orders
  const ordersList: Order[] = dashboardData.recentOrders || [];
  let filteredOrders = [...ordersList];
  if (orderStatusFilter !== 'ALL') {
    filteredOrders = filteredOrders.filter((o) => o.status === orderStatusFilter);
  }
  if (orderSearchQuery.trim()) {
    const q = orderSearchQuery.toLowerCase();
    filteredOrders = filteredOrders.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.includes(q) ||
        (o.paymentTrxId && o.paymentTrxId.toLowerCase().includes(q)) ||
        o.shippingAddress.thana.toLowerCase().includes(q) ||
        (o.items && o.items.some((item) => item.product?.sku.toLowerCase().includes(q)))
    );
  }

  // Financial metrics for filtered inventory
  const totalFilteredValue = filteredProducts.reduce((sum, p) => sum + p.priceBDT, 0);
  const totalFilteredCost = filteredProducts.reduce((sum, p) => sum + p.cogsBDT, 0);

  return (
    <div className="min-h-screen w-full bg-[#FAF8F5] flex flex-col text-[#171513]">
      <div className="w-full max-w-[1440px] mx-auto bg-[#FAF8F5] min-h-screen flex flex-col">
        {/* ========================================================================= */}
        {/* TOP BAR / BRAND HEADER                                                    */}
        {/* ========================================================================= */}
        <div className="px-6 py-4 bg-[#171513] text-white flex items-center justify-between sticky top-0 z-20 border-b border-[#2E2A26]">
          <div className="flex items-center gap-4">
            <img
              src="/assets/sairat-couture-logo.png"
              alt="SAIRAT COUTURE"
              className="h-10 w-auto max-w-[180px] object-contain"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-classical text-lg sm:text-xl tracking-wide uppercase font-bold text-[#FAF5EB]">
                  Operations Console
                </h2>
                <span className="text-[9px] font-mono uppercase bg-[#C9B28B]/20 px-2 py-0.5 rounded-2xs border border-[#C9B28B]/40 text-[#E5BA6A] font-bold">
                  {adminUser?.role || 'STAFF'}
                </span>
              </div>
              <p className="text-[11px] font-mono text-[#A89F91]">
                {adminUser ? `${adminUser.name} (${adminUser.email}) · ` : ''}Storefront Control · Orders · Inventory · Steadfast &amp; Pathao APIs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsConfigModalOpen(true)}
              className="px-3 py-1.5 text-xs font-mono uppercase border border-white/20 rounded-xs hover:bg-white/10 flex items-center gap-1.5 transition-colors text-white/90 cursor-pointer"
              title="Configure Steadfast & Pathao APIs"
            >
              <Settings className="w-3.5 h-3.5 text-[#E5BA6A]" />
              <span className="hidden md:inline">Courier APIs</span>
            </button>

            <button
              onClick={onOpenArchitecture}
              className="px-3 py-1.5 text-xs font-mono uppercase border border-white/20 rounded-xs hover:bg-white/10 flex items-center gap-1.5 transition-colors text-white/90 cursor-pointer"
            >
              <Database className="w-3.5 h-3.5 text-[#C9B28B]" />
              <span className="hidden md:inline">Prisma Docs</span>
            </button>

            <button
              onClick={() => {
                fetchDashboardStats();
                onRefreshData();
              }}
              className="p-1.5 text-white/80 hover:text-white rounded-xs transition-colors cursor-pointer hover:bg-white/10"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingStats ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-mono uppercase border border-white/20 text-white/90 hover:bg-white/10 rounded-xs transition-colors cursor-pointer ml-1"
              title="Sign Out"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MODULE NAVIGATION TABS STRIP                                              */}
        {/* ========================================================================= */}
        <div className="flex border-b border-[#E8E2D8] bg-[#F5EFE6] px-6 text-xs sm:text-sm font-sans overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`py-3 px-4 border-b-2 font-bold tracking-wider uppercase transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'OVERVIEW'
                ? 'border-[#171513] text-[#171513] bg-white shadow-xs'
                : 'border-transparent text-[#7A7165] hover:text-[#171513]'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-[#9E7D47]" />
            <span>Overview &amp; KPIs</span>
          </button>

          <button
            onClick={() => setActiveTab('INVENTORY')}
            className={`py-3 px-4 border-b-2 font-bold tracking-wider uppercase transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'INVENTORY'
                ? 'border-[#171513] text-[#171513] bg-white shadow-xs'
                : 'border-transparent text-[#7A7165] hover:text-[#171513]'
            }`}
          >
            <Layers className="w-4 h-4 text-[#9E7D47]" />
            <span>Inventory Master ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ADD_PRODUCT')}
            className={`py-3 px-4 border-b-2 font-bold tracking-wider uppercase transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'ADD_PRODUCT'
                ? 'border-[#171513] text-[#171513] bg-white shadow-xs'
                : 'border-transparent text-[#7A7165] hover:text-[#171513]'
            }`}
          >
            <Plus className="w-4 h-4 text-[#9E7D47]" />
            <span>Product Intake Studio</span>
          </button>

          <button
            onClick={() => setActiveTab('ORDERS')}
            className={`py-3 px-4 border-b-2 font-bold tracking-wider uppercase transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'ORDERS'
                ? 'border-[#171513] text-[#171513] bg-white shadow-xs'
                : 'border-transparent text-[#7A7165] hover:text-[#171513]'
            }`}
          >
            <Truck className="w-4 h-4 text-[#9E7D47]" />
            <span>Orders &amp; Courier ({ordersList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('SCANNER')}
            className={`py-3 px-4 border-b-2 font-bold tracking-wider uppercase transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'SCANNER'
                ? 'border-[#171513] text-[#171513] bg-white shadow-xs'
                : 'border-transparent text-[#7A7165] hover:text-[#171513]'
            }`}
          >
            <Barcode className="w-4 h-4 text-[#9E7D47]" />
            <span>Barcode Scanner</span>
          </button>

          <button
            onClick={() => setActiveTab('ANALYTICS')}
            className={`py-3 px-4 border-b-2 font-bold tracking-wider uppercase transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'ANALYTICS'
                ? 'border-[#171513] text-[#171513] bg-white shadow-xs'
                : 'border-transparent text-[#7A7165] hover:text-[#171513]'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-[#9E7D47]" />
            <span>Courier Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('STOREFRONT')}
            className={`py-3 px-4 border-b-2 font-bold tracking-wider uppercase transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'STOREFRONT'
                ? 'border-[#171513] text-[#171513] bg-white shadow-xs'
                : 'border-transparent text-[#7A7165] hover:text-[#171513]'
            }`}
          >
            <Store className="w-4 h-4 text-[#9E7D47]" />
            <span>Maintain Storefront</span>
          </button>

          <button
            onClick={() => setActiveTab('HOLDS')}
            className={`py-3 px-4 border-b-2 font-bold tracking-wider uppercase transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'HOLDS'
                ? 'border-[#171513] text-[#171513] bg-white shadow-xs'
                : 'border-transparent text-[#7A7165] hover:text-[#171513]'
            }`}
          >
            <Clock className="w-4 h-4 text-[#9E7D47]" />
            <span>10-Min Cart Leases ({dashboardData.activeLocks?.length || 0})</span>
          </button>
        </div>

        {/* Global Dispatch Notification Banner */}
        {dispatchSuccessMsg && (
          <div className="bg-[#FAF5EB] border-b border-[#C9B28B] px-6 py-2.5 text-xs font-mono text-[#1A4231] flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-[#1A4231]" />
              <span>{dispatchSuccessMsg}</span>
            </div>
            <button onClick={() => setDispatchSuccessMsg(null)} className="text-[#7A7165] hover:text-[#171513]">
              ✕
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MAIN MODULE CONTENT VIEWPORT                                              */}
        {/* ========================================================================= */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-[#FAF8F5]">

          {/* ===================================================================== */}
          {/* TAB 1: OVERVIEW & EXECUTIVE FINANCIAL KPIS                            */}
          {/* ===================================================================== */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              {/* Financial Metric KPI Cards (Live Analytics Core Module) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* 1. Realized Sales Revenue (Total Revenue) */}
                <div className="bg-white p-4.5 rounded-xs border border-[#E8E2D8] shadow-xs">
                  <div className="flex items-center justify-between text-xs font-mono text-[#7A7165] uppercase">
                    <span>Total Revenue (Gross)</span>
                    <TrendingUp className="w-4 h-4 text-[#1A4231]" />
                  </div>
                  <div className="font-editorial text-2xl font-bold text-[#1A4231] mt-2">
                    {formatBDT(dashboardData.stats?.realizedSalesBDT || 0)}
                  </div>
                  <div className="text-[10px] font-mono text-[#7A7165] mt-1 flex items-center justify-between">
                    <span>Fulfilled Sales</span>
                    <span className="text-[#1A4231] font-bold">▲ Trend Healthy</span>
                  </div>
                </div>

                {/* 2. Order Count */}
                <div className="bg-white p-4.5 rounded-xs border border-[#E8E2D8] shadow-xs">
                  <div className="flex items-center justify-between text-xs font-mono text-[#7A7165] uppercase">
                    <span>Order Count</span>
                    <ShoppingBag className="w-4 h-4 text-[#9E7D47]" />
                  </div>
                  <div className="font-editorial text-2xl font-bold text-[#171513] mt-2">
                    {ordersList.length} Orders
                  </div>
                  <div className="text-[10px] font-mono text-[#7A7165] mt-1">
                    {dashboardData.stats?.soldCount || 0} completed · {ordersList.length - (dashboardData.stats?.soldCount || 0)} in pipeline
                  </div>
                </div>

                {/* 3. Average Order Value (AOV) */}
                <div className="bg-white p-4.5 rounded-xs border border-[#E8E2D8] shadow-xs">
                  <div className="flex items-center justify-between text-xs font-mono text-[#7A7165] uppercase">
                    <span>Average Order Value (AOV)</span>
                    <DollarSign className="w-4 h-4 text-[#9E7D47]" />
                  </div>
                  <div className="font-editorial text-2xl font-bold text-[#171513] mt-2">
                    {formatBDT(
                      (dashboardData.stats?.realizedSalesBDT || 0) > 0 && (dashboardData.stats?.soldCount || 0) > 0
                        ? Math.round((dashboardData.stats?.realizedSalesBDT || 0) / (dashboardData.stats?.soldCount || 1))
                        : ordersList.length > 0
                        ? Math.round(ordersList.reduce((acc, o) => acc + o.totalBDT, 0) / ordersList.length)
                        : 245000
                    )}
                  </div>
                  <div className="text-[10px] font-mono text-[#7A7165] mt-1">
                    Per customer order checkout
                  </div>
                </div>

                {/* 4. Total Vault Asset Valuation */}
                <div className="bg-white p-4.5 rounded-xs border border-[#E8E2D8] shadow-xs">
                  <div className="flex items-center justify-between text-xs font-mono text-[#7A7165] uppercase">
                    <span>Vault Asset Valuation</span>
                    <Box className="w-4 h-4 text-[#9E7D47]" />
                  </div>
                  <div className="font-editorial text-2xl font-bold text-[#171513] mt-2">
                    {formatBDT(dashboardData.stats?.totalAssetValueBDT || products.reduce((acc, p) => acc + p.priceBDT, 0))}
                  </div>
                  <div className="text-[10px] font-mono text-[#7A7165] mt-1">
                    Across {products.length} authenticated 1-of-1 pieces
                  </div>
                </div>

                {/* 5. Average Gross Margin */}
                <div className="bg-white p-4.5 rounded-xs border border-[#E8E2D8] shadow-xs">
                  <div className="flex items-center justify-between text-xs font-mono text-[#7A7165] uppercase">
                    <span>Average Gross Margin</span>
                    <Sparkles className="w-4 h-4 text-[#9E7D47]" />
                  </div>
                  <div className="font-editorial text-2xl font-bold text-[#171513] mt-2">
                    {dashboardData.stats?.averageMarginPercentage || 43}%
                  </div>
                  <div className="text-[10px] font-mono text-[#7A7165] mt-1">
                    Intake COGS vs Luxury Listing Price
                  </div>
                </div>
              </div>

              {/* Quick Operation Action Portals */}
              <div className="space-y-3">
                <span className="text-xs font-mono uppercase tracking-wider text-[#171513] font-bold block">
                  Quick Operations Shortcuts
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <button
                    onClick={() => setActiveTab('ADD_PRODUCT')}
                    className="p-4 bg-white border border-[#E8E2D8] hover:border-[#9E7D47] rounded-xs text-left transition-all group cursor-pointer hover:shadow-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="font-aeonik font-bold text-sm text-[#171513] group-hover:text-[#9E7D47] uppercase">
                        + Intake New Piece
                      </div>
                      <p className="text-xs text-[#7A7165] mt-0.5">List 1-of-1 archival garment</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#9E7D47] group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={() => setActiveTab('STOREFRONT')}
                    className="p-4 bg-white border border-[#E8E2D8] hover:border-[#9E7D47] rounded-xs text-left transition-all group cursor-pointer hover:shadow-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="font-aeonik font-bold text-sm text-[#171513] group-hover:text-[#9E7D47] uppercase">
                        Maintain Storefront
                      </div>
                      <p className="text-xs text-[#7A7165] mt-0.5">Hero campaigns &amp; tickers</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#9E7D47] group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={() => setActiveTab('ORDERS')}
                    className="p-4 bg-white border border-[#E8E2D8] hover:border-[#9E7D47] rounded-xs text-left transition-all group cursor-pointer hover:shadow-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="font-aeonik font-bold text-sm text-[#171513] group-hover:text-[#9E7D47] uppercase">
                        Collect &amp; Dispatch Orders
                      </div>
                      <p className="text-xs text-[#7A7165] mt-0.5">Steadfast &amp; bKash audit</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#9E7D47] group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={() => setIsConfigModalOpen(true)}
                    className="p-4 bg-white border border-[#E8E2D8] hover:border-[#9E7D47] rounded-xs text-left transition-all group cursor-pointer hover:shadow-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="font-aeonik font-bold text-sm text-[#171513] group-hover:text-[#9E7D47] uppercase">
                        Courier Balances &amp; APIs
                      </div>
                      <p className="text-xs text-[#7A7165] mt-0.5">Steadfast &amp; Pathao keys</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#9E7D47] group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={onOpenArchitecture}
                    className="p-4 bg-white border border-[#E8E2D8] hover:border-[#9E7D47] rounded-xs text-left transition-all group cursor-pointer hover:shadow-xs flex items-center justify-between col-span-1 sm:col-span-2 lg:col-span-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xs bg-[#FAF5EB] border border-[#C9B28B]/40 flex items-center justify-center text-[#9E7D47]">
                        <Layers className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-aeonik font-bold text-sm text-[#171513] group-hover:text-[#9E7D47] uppercase flex items-center gap-2">
                          <span>Inspect Decoupled System Architecture Blueprint</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                            Live Module Matrix
                          </span>
                        </div>
                        <p className="text-xs text-[#7A7165] mt-0.5">
                          Examine the segregation between Storefront (Customer UI) and Backend Dashboard (Admin UI), REST contracts, and PostgreSQL models.
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#9E7D47] group-hover:translate-x-1 transition-transform shrink-0" />
                  </button>
                </div>
              </div>

              {/* Recent Orders Overview */}
              <div className="bg-white p-6 rounded-xs border border-[#E8E2D8] shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#F0EAE1] pb-3">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#9E7D47]" />
                    <h3 className="font-aeonik font-bold text-sm uppercase tracking-wider text-[#171513]">
                      Recent Customer Orders &amp; Dispatch Waybills
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('ORDERS')}
                    className="text-xs font-mono text-[#9E7D47] hover:underline cursor-pointer"
                  >
                    View All Orders →
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#F0EAE1] text-[#7A7165] font-mono uppercase text-[10px]">
                        <th className="py-2">Order #</th>
                        <th>Client</th>
                        <th>Phone</th>
                        <th>Gateway</th>
                        <th>Amount BDT</th>
                        <th>Status</th>
                        <th>Courier</th>
                        <th className="text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0EAE1]">
                      {ordersList.slice(0, 5).map((order) => (
                        <tr key={order.id} className="hover:bg-[#FAF8F5]">
                          <td className="py-3 font-mono font-bold text-[#171513]">{order.orderNumber}</td>
                          <td className="font-medium text-[#171513]">{order.customerName}</td>
                          <td className="font-mono text-[#7A7165]">{order.customerPhone}</td>
                          <td>
                            <span className="font-mono text-[10px] px-2 py-0.5 rounded-2xs bg-[#FAF5EB] border border-[#C9B28B]/40 text-[#9E7D47]">
                              {order.paymentGateway}
                            </span>
                          </td>
                          <td className="font-mono font-bold text-[#171513]">{formatBDT(order.totalBDT)}</td>
                          <td>
                            <span
                              className={`font-mono text-[9px] px-2 py-0.5 rounded-2xs font-bold ${
                                order.status === 'PAID_FULL'
                                  ? 'bg-[#EBF7F0] text-[#1A4231]'
                                  : order.status === 'DISPATCHED_COURIER'
                                  ? 'bg-[#FAF5EB] text-[#9E7D47]'
                                  : 'bg-neutral-100 text-neutral-700'
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="font-mono text-xs">{order.courier}</td>
                          <td className="text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleViewConsignmentNote(order.id, 'PREVIEW_MOCK_4X6', true)}
                                className="px-2 py-1 text-[10px] font-mono bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold rounded-2xs cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                                title="Open forced 4x6 Print Preview modal before printing"
                              >
                                <Eye className="w-3 h-3 text-neutral-950" />
                                <span>Print Preview</span>
                              </button>
                              <button
                                onClick={() => handleViewConsignmentNote(order.id, 'THERMAL_4X6', false)}
                                className="px-2 py-1 text-[10px] font-mono border border-[#DED7CB] rounded-2xs hover:bg-[#FAF8F5] cursor-pointer"
                                title="Open consignment waybill"
                              >
                                Waybill
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 2: INVENTORY MASTER & STORE INVENTORY MANAGEMENT                   */}
          {/* ===================================================================== */}
          {activeTab === 'INVENTORY' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Search & Multi-Filters Toolbar */}
              <div className="bg-white p-4 rounded-xs border border-[#E8E2D8] shadow-xs space-y-4">
                <div className="flex flex-col xl:flex-row gap-3 items-stretch xl:items-center justify-between">
                  <div className="flex flex-col sm:flex-row gap-2.5 w-full xl:max-w-2xl">
                    {/* Dedicated SKU Filter Input for Dispatch Staff */}
                    <div className="relative w-full sm:w-64 shrink-0">
                      <Barcode className="w-4 h-4 text-[#9E7D47] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="inventory-sku-filter"
                        type="text"
                        value={skuFilter}
                        onChange={(e) => setSkuFilter(e.target.value)}
                        placeholder="Filter by SKU (e.g. RAFS-OUT...)"
                        aria-label="Filter inventory by SKU"
                        className="w-full pl-9 pr-8 py-2 text-xs font-mono bg-[#FAF8F5] border border-[#DED7CB] rounded-xs focus:outline-none focus:border-[#171513] text-[#171513] placeholder:text-[#8A8175]"
                      />
                      {skuFilter && (
                        <button
                          type="button"
                          onClick={() => setSkuFilter('')}
                          aria-label="Clear SKU filter"
                          title="Clear SKU filter"
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8A8175] hover:text-[#171513] cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* General Title / Brand / Category Search */}
                    <div className="relative flex-1 min-w-0">
                      <Search className="w-4 h-4 text-[#8A8175] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search title, brand, or category..."
                        aria-label="Search inventory by title, brand, or category"
                        className="w-full pl-9 pr-8 py-2 text-xs bg-[#FAF8F5] border border-[#DED7CB] rounded-xs focus:outline-none focus:border-[#171513] text-[#171513]"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          aria-label="Clear search query"
                          title="Clear search query"
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8A8175] hover:text-[#171513] cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto xl:justify-end">
                    {/* Brand Filter */}
                    <select
                      value={brandFilter}
                      onChange={(e) => setBrandFilter(e.target.value)}
                      className="px-3 py-1.5 text-xs font-mono bg-[#FAF8F5] border border-[#DED7CB] rounded-xs focus:outline-none text-[#171513]"
                    >
                      <option value="ALL">All Brands ({brands.length})</option>
                      {brands.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>

                    {/* Gender Filter */}
                    <select
                      value={genderFilter}
                      onChange={(e) => setGenderFilter(e.target.value)}
                      className="px-3 py-1.5 text-xs font-mono bg-[#FAF8F5] border border-[#DED7CB] rounded-xs focus:outline-none text-[#171513]"
                    >
                      <option value="ALL">All Genders</option>
                      <option value="MEN">Men's Archive</option>
                      <option value="WOMEN">Women's Couture</option>
                      <option value="UNISEX">Unisex Pieces</option>
                    </select>

                    {/* Status Filter */}
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-1.5 text-xs font-mono bg-[#FAF8F5] border border-[#DED7CB] rounded-xs focus:outline-none text-[#171513]"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="ACTIVE">ACTIVE (Available)</option>
                      <option value="IN_CART_HOLD">IN_CART_HOLD</option>
                      <option value="SOLD">SOLD</option>
                      <option value="ARCHIVED">ARCHIVED</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => handleExportQrSheetPdf('FILTERED')}
                      disabled={isExportingQrPdf || filteredProducts.length === 0}
                      title="Download A4 PDF sheet with printable QR hangtags for all currently visible/filtered SKUs"
                      className="px-3.5 py-1.5 bg-[#FAF5EB] border border-[#C9B28B] text-[#171513] hover:bg-[#171513] hover:text-[#FAF5EB] hover:border-[#171513] text-xs font-mono font-bold uppercase rounded-xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-45 disabled:cursor-not-allowed"
                    >
                      <Download className="w-3.5 h-3.5 text-[#9E7D47]" />
                      <span>
                        {isExportingQrPdf
                          ? 'Generating PDF...'
                          : `QR Sheet PDF (${filteredProducts.length})`}
                      </span>
                    </button>

                    <button
                      onClick={() => setActiveTab('ADD_PRODUCT')}
                      className="px-4 py-1.5 bg-[#171513] text-[#FAF5EB] hover:bg-[#9E7D47] text-xs font-aeonik font-bold uppercase rounded-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>New Piece</span>
                    </button>
                  </div>
                </div>

                {qrPdfNotice && (
                  <div className="px-3 py-2 bg-[#EBF7F0] border border-[#A8DFC5] text-[#1A4231] text-xs font-mono rounded-xs flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>{qrPdfNotice}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setQrPdfNotice(null)}
                      className="text-[#1A4231] hover:opacity-70 cursor-pointer"
                      aria-label="Dismiss PDF notice"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Filtered Inventory Metrics Banner */}
                <div className="pt-3 border-t border-[#F0EAE1] flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[#7A7165]">
                  <div className="flex flex-wrap items-center gap-4">
                    <span>Showing <strong className="text-[#171513]">{filteredProducts.length}</strong> of {products.length} pieces</span>
                    <span>· Valuation: <strong className="text-[#171513]">{formatBDT(totalFilteredValue)}</strong></span>
                    <span>· Cost: <strong className="text-[#171513]">{formatBDT(totalFilteredCost)}</strong></span>
                    {hasActiveInventoryFilters && (
                      <button
                        type="button"
                        onClick={handleResetInventoryFilters}
                        className="inline-flex items-center gap-1 text-[11px] font-mono text-[#9E7D47] hover:text-[#171513] underline underline-offset-4 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset Filters</span>
                      </button>
                    )}
                  </div>

                  {selectedIds.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-[#171513]">{selectedIds.length} Selected:</span>
                      <button
                        type="button"
                        onClick={() => handleExportQrSheetPdf('SELECTED')}
                        disabled={isExportingQrPdf}
                        className="px-2 py-1 text-[10px] font-mono bg-[#171513] text-[#FAF5EB] rounded-2xs hover:bg-[#9E7D47] cursor-pointer inline-flex items-center gap-1 disabled:opacity-50"
                      >
                        <QrCode className="w-3 h-3" />
                        <span>Export Selected QR PDF</span>
                      </button>
                      <button
                        onClick={() => handleBatchStatus('ACTIVE')}
                        disabled={batchUpdating}
                        className="px-2 py-1 text-[10px] font-mono bg-[#EBF7F0] text-[#1A4231] rounded-2xs hover:bg-[#D4EFE1] cursor-pointer"
                      >
                        Mark Active
                      </button>
                      <button
                        onClick={() => handleBatchStatus('SOLD')}
                        disabled={batchUpdating}
                        className="px-2 py-1 text-[10px] font-mono bg-[#FAF5EB] text-[#9E7D47] rounded-2xs hover:bg-[#F3E7D3] cursor-pointer"
                      >
                        Mark Sold
                      </button>
                      <button
                        onClick={() => handleBatchStatus('ARCHIVED')}
                        disabled={batchUpdating}
                        className="px-2 py-1 text-[10px] font-mono bg-neutral-200 text-neutral-800 rounded-2xs hover:bg-neutral-300 cursor-pointer"
                      >
                        Archive
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Inventory Table */}
              <div className="bg-white rounded-xs border border-[#E8E2D8] shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#FAF8F5] border-b border-[#E8E2D8] text-[#7A7165] font-mono uppercase text-[10px]">
                        <th className="py-3 px-4 w-10">
                          <button onClick={handleSelectAll} className="cursor-pointer">
                            {selectedIds.length === filteredProducts.length && filteredProducts.length > 0 ? (
                              <CheckSquare className="w-4 h-4 text-[#171513]" />
                            ) : (
                              <Square className="w-4 h-4 text-[#8A8175]" />
                            )}
                          </button>
                        </th>
                        <th>Piece / Title</th>
                        <th>Brand &amp; Dept</th>
                        <th>SKU Barcode &amp; QR</th>
                        <th>Condition / Era</th>
                        <th>Cost (৳)</th>
                        <th>Price (৳)</th>
                        <th>Margin %</th>
                        <th>Status</th>
                        <th className="text-right px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0EAE1]">
                      {filteredProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-[#FAF8F5] transition-colors">
                          <td className="py-3 px-4">
                            <button onClick={() => handleToggleSelect(p.id)} className="cursor-pointer">
                              {selectedIds.includes(p.id) ? (
                                <CheckSquare className="w-4 h-4 text-[#171513]" />
                              ) : (
                                <Square className="w-4 h-4 text-[#8A8175]" />
                              )}
                            </button>
                          </td>
                          <td className="py-2.5">
                            <div className="flex items-center gap-3">
                              <img
                                src={p.images[0] || 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=150&q=80'}
                                alt={p.title}
                                className="w-10 h-13 object-cover rounded-2xs border border-[#E8E2D8] shrink-0"
                              />
                              <div>
                                <div className="font-bold text-[#171513] hover:text-[#9E7D47] transition-colors line-clamp-1 max-w-xs">
                                  {p.title}
                                </div>
                                <div className="text-[10px] font-mono text-[#7A7165]">
                                  {p.categoryName} · {p.sizeTag}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="font-bold text-[#171513]">{p.brand}</div>
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-2xs bg-[#FAF5EB] text-[#9E7D47] border border-[#C9B28B]/30 uppercase">
                              {p.gender}
                            </span>
                          </td>
                          <td className="py-2 pr-3">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setLabelModalProduct(p);
                              }}
                              className="group flex items-center gap-2.5 p-1.5 bg-white border border-[#E8E2D8] hover:border-[#9E7D47] rounded-2xs transition-colors cursor-pointer text-left"
                              title="Enlarge SKU QR Code & Code-128 Barcode for mobile staff scan"
                            >
                              <div className="shrink-0 bg-white p-0.5 border border-[#F0EAE1] rounded-2xs">
                                <QRCodeSVG
                                  value={p.sku}
                                  size={44}
                                  level="M"
                                  bgColor="#FFFFFF"
                                  fgColor="#171513"
                                />
                              </div>
                              <div className="min-w-0 flex flex-col items-start gap-0.5">
                                <SkuBarcode
                                  value={p.sku}
                                  height={22}
                                  width={1.0}
                                  displayValue={false}
                                  lineColor="#171513"
                                />
                                <div className="flex items-center gap-1 text-[10px] font-mono text-[#5C5449] group-hover:text-[#171513]">
                                  <span>{p.sku}</span>
                                  <Maximize2 className="w-2.5 h-2.5 text-[#9E7D47]" />
                                </div>
                              </div>
                            </button>
                          </td>
                          <td>
                            <div className="text-[11px] font-medium text-[#171513]">
                              {p.condition.replace(/_/g, ' ')}
                            </div>
                            <span className="text-[10px] font-mono text-[#7A7165]">{p.era}</span>
                          </td>
                          <td className="font-mono text-[#7A7165]">{formatBDT(p.cogsBDT)}</td>
                          <td className="font-mono font-bold text-[#171513]">{formatBDT(p.priceBDT)}</td>
                          <td className="font-mono text-[#1A4231] font-bold">{calculateMargin(p.priceBDT, p.cogsBDT)}</td>
                          <td>
                            <button
                              onClick={(e) => handleInlineStatusToggle(p, e)}
                              className={`px-2.5 py-1 text-[9px] font-mono font-bold rounded-2xs uppercase tracking-wider cursor-pointer border transition-colors ${
                                p.status === 'ACTIVE'
                                  ? 'bg-[#EBF7F0] border-[#A8DFC5] text-[#1A4231] hover:bg-[#D4EFE1]'
                                  : p.status === 'IN_CART_HOLD'
                                  ? 'bg-[#FAF5EB] border-[#C9B28B] text-[#9E7D47] hover:bg-[#F3E7D3]'
                                  : p.status === 'SOLD'
                                  ? 'bg-neutral-900 border-neutral-900 text-white'
                                  : 'bg-neutral-100 border-neutral-300 text-neutral-600'
                              }`}
                              title="Click to advance status"
                            >
                              {p.status}
                            </button>
                          </td>
                          <td className="text-right px-4">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOrderSearchQuery(p.sku);
                                  setOrderStatusFilter('ALL');
                                  setActiveTab('ORDERS');
                                }}
                                className="p-1.5 text-[#7A7165] hover:text-[#1A4231] hover:bg-[#EBF7F0] rounded-2xs transition-colors cursor-pointer"
                                title="Locate Dispatch Orders for this SKU"
                              >
                                <Truck className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setLabelModalProduct(p);
                                }}
                                className="p-1.5 text-[#7A7165] hover:text-[#171513] hover:bg-[#EFE9DF] rounded-2xs transition-colors cursor-pointer"
                                title="View Mobile Scan QR & Barcode Tag"
                              >
                                <QrCode className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => handleOpenEdit(p, e)}
                                className="p-1.5 text-[#7A7165] hover:text-[#171513] hover:bg-[#EFE9DF] rounded-2xs transition-colors cursor-pointer"
                                title="Edit Product Details"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeletingProduct(p);
                                }}
                                className="p-1.5 text-[#7A7165] hover:text-red-600 hover:bg-red-50 rounded-2xs transition-colors cursor-pointer"
                                title="Delete Piece from Catalog"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredProducts.length === 0 && (
                        <tr>
                          <td colSpan={10} className="py-12 px-6 text-center">
                            <div className="max-w-md mx-auto space-y-3">
                              <p className="text-sm font-medium text-[#171513]">
                                No inventory items matched
                                {normalizedSkuFilter ? (
                                  <>
                                    {' '}SKU <span className="font-mono font-bold text-[#9E7D47]">{skuFilter.trim()}</span>
                                  </>
                                ) : (
                                  ' your current filters'
                                )}
                                .
                              </p>
                              <p className="text-xs font-mono text-[#7A7165]">
                                Verify the SKU code on the Dhaka Vault hangtag or clear active filters to view all {products.length} pieces.
                              </p>
                              <button
                                type="button"
                                onClick={handleResetInventoryFilters}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#171513] text-[#FAF5EB] hover:bg-[#9E7D47] text-xs font-mono uppercase rounded-xs transition-colors cursor-pointer"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Clear Filters</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 3: PRODUCT INTAKE STUDIO (ADD NEW 1-OF-1 PIECE)                   */}
          {/* ===================================================================== */}
          {activeTab === 'ADD_PRODUCT' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-200">
              {/* Form Input Column */}
              <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-xs border border-[#E8E2D8] shadow-xs space-y-6">
                <div>
                  <h3 className="font-editorial text-2xl font-normal text-[#171513]">
                    Archival Product <span className="italic">intake studio</span>
                  </h3>
                  <p className="text-xs font-mono text-[#7A7165] mt-1">
                    Enter garment provenance, flat measurements, and intake financials in Bangladeshi Taka (৳).
                  </p>
                </div>

                {addSuccessMsg && (
                  <div className="p-3 bg-[#FAF5EB] border border-[#C9B28B] text-[#1A4231] text-xs font-mono rounded-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#1A4231]" />
                    <span>{addSuccessMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSubmitAddProduct} className="space-y-6">
                  {/* Basic Identifiers */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-mono uppercase text-[#7A7165] block mb-1">
                        Garment Title *
                      </label>
                      <input
                        type="text"
                        value={addTitle}
                        onChange={(e) => setAddTitle(e.target.value)}
                        placeholder="e.g. AW2001 Riot Oversized Patch Bomber"
                        required
                        className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DED7CB] rounded-xs focus:outline-none focus:border-[#171513]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-mono uppercase text-[#7A7165] block mb-1">
                        Designer / Brand *
                      </label>
                      <input
                        type="text"
                        value={addBrand}
                        onChange={(e) => setAddBrand(e.target.value)}
                        placeholder="e.g. Raf Simons, Yohji Yamamoto, Undercover"
                        required
                        className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DED7CB] rounded-xs focus:outline-none focus:border-[#171513]"
                      />
                    </div>
                  </div>

                  {/* Department & Taxonomy */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[11px] font-mono uppercase text-[#7A7165] block mb-1">
                        Department / Gender *
                      </label>
                      <select
                        value={addGender}
                        onChange={(e) => setAddGender(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs font-mono bg-[#FAF8F5] border border-[#DED7CB] rounded-xs focus:outline-none"
                      >
                        <option value="MEN">MEN (Men's Archive)</option>
                        <option value="WOMEN">WOMEN (Women's Couture)</option>
                        <option value="UNISEX">UNISEX</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-mono uppercase text-[#7A7165] block mb-1">
                        Taxonomy Category *
                      </label>
                      <select
                        value={addCategory}
                        onChange={(e) => setAddCategory(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-mono bg-[#FAF8F5] border border-[#DED7CB] rounded-xs focus:outline-none"
                      >
                        {TAXONOMY.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-mono uppercase text-[#7A7165] block mb-1">
                        Condition Grade *
                      </label>
                      <select
                        value={addCondition}
                        onChange={(e) => setAddCondition(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs font-mono bg-[#FAF8F5] border border-[#DED7CB] rounded-xs focus:outline-none"
                      >
                        <option value="EXCELLENT_VINTAGE">Excellent Vintage</option>
                        <option value="BRAND_NEW_TAGS">Brand New with Tags</option>
                        <option value="MINOR_FLAWS">Minor Era Flaws</option>
                      </select>
                    </div>
                  </div>

                  {/* Financials & Live Margin Calculation */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-[#FAF8F5] border border-[#E8E2D8] rounded-xs">
                    <div>
                      <label className="text-[11px] font-mono uppercase text-[#7A7165] block mb-1">
                        Intake COGS (BDT ৳) *
                      </label>
                      <input
                        type="number"
                        value={addCogsBDT}
                        onChange={(e) => setAddCogsBDT(e.target.value)}
                        placeholder="45000"
                        required
                        className="w-full px-3 py-2 text-xs font-mono bg-white border border-[#DED7CB] rounded-xs focus:outline-none font-bold text-[#171513]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-mono uppercase text-[#7A7165] block mb-1">
                        Listing Price (BDT ৳) *
                      </label>
                      <input
                        type="number"
                        value={addPriceBDT}
                        onChange={(e) => setAddPriceBDT(e.target.value)}
                        placeholder="85000"
                        required
                        className="w-full px-3 py-2 text-xs font-mono bg-white border border-[#DED7CB] rounded-xs focus:outline-none font-bold text-[#171513]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-mono uppercase text-[#7A7165] block mb-1">
                        Estimated Gross Margin
                      </label>
                      <div className="h-9 px-3 bg-white border border-[#DED7CB] rounded-xs flex items-center justify-between font-mono font-bold text-xs">
                        <span className="text-[#1A4231]">{calculateMargin(parseFloat(addPriceBDT) || 0, parseFloat(addCogsBDT) || 0)}</span>
                        <span className="text-[10px] text-[#7A7165]">Profit: {formatBDT((parseFloat(addPriceBDT) || 0) - (parseFloat(addCogsBDT) || 0))}</span>
                      </div>
                    </div>
                  </div>

                  {/* Garment Flat Measurements in Inches */}
                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase tracking-wider text-[#171513] font-bold block">
                      Flat Garment Measurements (Inches)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <span className="text-[10px] font-mono text-[#7A7165] block">Chest (Pit-to-Pit)</span>
                        <input
                          type="text"
                          value={addChest}
                          onChange={(e) => setAddChest(e.target.value)}
                          placeholder="22.5"
                          className="w-full px-2.5 py-1.5 text-xs font-mono bg-[#FAF8F5] border border-[#DED7CB] rounded-xs focus:outline-none"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] font-mono text-[#7A7165] block">Back Length</span>
                        <input
                          type="text"
                          value={addLength}
                          onChange={(e) => setAddLength(e.target.value)}
                          placeholder="28.0"
                          className="w-full px-2.5 py-1.5 text-xs font-mono bg-[#FAF8F5] border border-[#DED7CB] rounded-xs focus:outline-none"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] font-mono text-[#7A7165] block">Shoulder Width</span>
                        <input
                          type="text"
                          value={addShoulder}
                          onChange={(e) => setAddShoulder(e.target.value)}
                          placeholder="19.5"
                          className="w-full px-2.5 py-1.5 text-xs font-mono bg-[#FAF8F5] border border-[#DED7CB] rounded-xs focus:outline-none"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] font-mono text-[#7A7165] block">Sleeve Length</span>
                        <input
                          type="text"
                          value={addSleeve}
                          onChange={(e) => setAddSleeve(e.target.value)}
                          placeholder="25.5"
                          className="w-full px-2.5 py-1.5 text-xs font-mono bg-[#FAF8F5] border border-[#DED7CB] rounded-xs focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sizing, Materials & Origin */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[10px] font-mono uppercase text-[#7A7165] block mb-1">Size Tag</label>
                      <input
                        type="text"
                        value={addSizeTag}
                        onChange={(e) => setAddSizeTag(e.target.value)}
                        placeholder="EU 50"
                        className="w-full px-2.5 py-1.5 text-xs font-mono bg-[#FAF8F5] border border-[#DED7CB] rounded-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono uppercase text-[#7A7165] block mb-1">Colorway</label>
                      <input
                        type="text"
                        value={addColorway}
                        onChange={(e) => setAddColorway(e.target.value)}
                        placeholder="Charcoal"
                        className="w-full px-2.5 py-1.5 text-xs font-mono bg-[#FAF8F5] border border-[#DED7CB] rounded-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono uppercase text-[#7A7165] block mb-1">Composition</label>
                      <input
                        type="text"
                        value={addComposition}
                        onChange={(e) => setAddComposition(e.target.value)}
                        placeholder="100% Wool"
                        className="w-full px-2.5 py-1.5 text-xs font-mono bg-[#FAF8F5] border border-[#DED7CB] rounded-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono uppercase text-[#7A7165] block mb-1">Made In</label>
                      <input
                        type="text"
                        value={addMadeIn}
                        onChange={(e) => setAddMadeIn(e.target.value)}
                        placeholder="Japan / Italy"
                        className="w-full px-2.5 py-1.5 text-xs font-mono bg-[#FAF8F5] border border-[#DED7CB] rounded-xs"
                      />
                    </div>
                  </div>

                  {/* Media Gallery URL & Quick Presets */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-mono uppercase text-[#7A7165] block mb-1">
                      Primary Archival Image URL *
                    </label>
                    <input
                      type="url"
                      value={addImageUrl}
                      onChange={(e) => setAddImageUrl(e.target.value)}
                      required
                      placeholder="https://..."
                      className="w-full px-3 py-2 text-xs font-mono bg-[#FAF8F5] border border-[#DED7CB] rounded-xs focus:outline-none"
                    />

                    <div className="pt-1">
                      <span className="text-[10px] font-mono text-[#7A7165] block mb-1">Quick Photography Presets:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {PRESET_IMAGES.map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => setAddImageUrl(preset.url)}
                            className="px-2 py-0.5 text-[10px] font-mono bg-[#F5EFE6] hover:bg-[#EFE9DF] text-[#171513] rounded-2xs border border-[#E8E2D8] cursor-pointer"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Description & Verification */}
                  <div>
                    <label className="text-[11px] font-mono uppercase text-[#7A7165] block mb-1">
                      Curatorial Description &amp; Provenance Notes
                    </label>
                    <textarea
                      rows={3}
                      value={addDescription}
                      onChange={(e) => setAddDescription(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DED7CB] rounded-xs focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingAdd}
                    className="w-full py-3 bg-[#171513] hover:bg-[#9E7D47] text-[#FAF5EB] font-aeonik font-bold text-xs uppercase tracking-widest transition-all rounded-xs shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSubmittingAdd ? 'Publishing 1-of-1 Piece...' : 'Publish 1-of-1 Piece to Live Catalog'}</span>
                  </button>
                </form>
              </div>

              {/* Live Preview Card Column */}
              <div className="lg:col-span-4 space-y-4">
                <span className="text-xs font-mono uppercase tracking-wider text-[#171513] font-bold block">
                  Live Storefront Preview
                </span>
                <div className="bg-white border border-[#E8E2D8] rounded-xs p-4 shadow-sm space-y-3">
                  <div className="relative aspect-[3/4] bg-[#F5EFE6] rounded-xs overflow-hidden border border-[#E8E2D8]">
                    <img
                      src={addImageUrl || 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80'}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-[#171513] text-[#FAF5EB] text-[9px] font-mono px-2 py-0.5 rounded-2xs uppercase">
                      1-of-1 Relic
                    </div>
                    <div className="absolute top-2 right-2 bg-white/90 text-[#171513] text-[9px] font-mono px-2 py-0.5 rounded-2xs border border-[#E8E2D8]">
                      {addGender}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[10px] font-mono uppercase text-[#9E7D47] font-bold">
                      {addBrand || 'Brand'}
                    </div>
                    <h4 className="font-editorial text-base text-[#171513] font-bold line-clamp-1">
                      {addTitle || 'Garment Title'}
                    </h4>
                    <div className="flex items-center justify-between pt-1">
                      <span className="font-mono text-sm font-bold text-[#171513]">
                        {formatBDT(parseFloat(addPriceBDT) || 0)}
                      </span>
                      <span className="text-[10px] font-mono text-[#7A7165]">
                        {addSizeTag}
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-[#FAF8F5] rounded-xs border border-[#E8E2D8] text-[10px] font-mono space-y-1 text-[#7A7165]">
                    <div>Chest: {addChest || '—'}" · Length: {addLength || '—'}"</div>
                    <div>Condition: {addCondition.replace(/_/g, ' ')}</div>
                    <div>Era: {addEra}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 4: ORDERS & COURIER LOGISTICS (COLLECTION MANAGEMENT)             */}
          {/* ===================================================================== */}
          {activeTab === 'ORDERS' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Orders Header & Search Bar */}
              <div className="bg-white p-4 rounded-xs border border-[#E8E2D8] shadow-xs space-y-4">
                <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                  <div className="relative w-full md:max-w-md">
                    <Search className="w-4 h-4 text-[#8A8175] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={orderSearchQuery}
                      onChange={(e) => setOrderSearchQuery(e.target.value)}
                      placeholder="Search order #, customer, phone (017...), or bKash TrxID..."
                      className="w-full pl-9 pr-4 py-2 text-xs bg-[#FAF8F5] border border-[#DED7CB] rounded-xs focus:outline-none focus:border-[#171513] text-[#171513]"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                    <select
                      value={orderStatusFilter}
                      onChange={(e) => setOrderStatusFilter(e.target.value)}
                      className="px-3 py-1.5 text-xs font-mono bg-[#FAF8F5] border border-[#DED7CB] rounded-xs focus:outline-none text-[#171513]"
                    >
                      <option value="ALL">All Order Statuses</option>
                      <option value="PENDING_PAYMENT">Pending Payment</option>
                      <option value="PAID_FULL">Paid in Full</option>
                      <option value="PARTIAL_COD_CONFIRMED">Partial COD Confirmed</option>
                      <option value="READY_FOR_PICKUP">Ready for Pickup</option>
                      <option value="DISPATCHED_COURIER">Dispatched via Courier</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => setActiveTab('SCANNER')}
                      className="px-3.5 py-1.5 bg-[#FAF5EB] hover:bg-[#F1E6D2] text-[#171513] border border-[#C9B28B] text-xs font-aeonik font-bold uppercase rounded-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <Barcode className="w-3.5 h-3.5 text-[#9E7D47]" />
                      <span>Scan SKU Barcode</span>
                    </button>

                    <button
                      onClick={() => setIsManualOrderModalOpen(true)}
                      className="px-4 py-1.5 bg-[#171513] text-[#FAF5EB] hover:bg-[#9E7D47] text-xs font-aeonik font-bold uppercase rounded-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Manual Client Order</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Orders Table */}
              <div className="bg-white rounded-xs border border-[#E8E2D8] shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#FAF8F5] border-b border-[#E8E2D8] text-[#7A7165] font-mono uppercase text-[10px]">
                        <th className="py-3 px-4">Order Details</th>
                        <th>Client &amp; Contact</th>
                        <th>Delivery Destination</th>
                        <th>Financials (BDT)</th>
                        <th>Payment &amp; TrxID</th>
                        <th>Status</th>
                        <th>Logistics / Courier</th>
                        <th className="text-right px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0EAE1]">
                      {filteredOrders.map((order) => (
                        <React.Fragment key={order.id}>
                          <tr className="hover:bg-[#FAF8F5] transition-colors">
                            <td className="py-3 px-4">
                              <div className="font-mono font-bold text-[#171513] text-sm">{order.orderNumber}</div>
                              <div className="text-[10px] font-mono text-[#7A7165] mt-0.5">
                                {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </div>
                              <div className="text-[11px] text-[#5C5449] mt-1 font-medium">
                                {order.items?.map((it) => it.product?.title || 'Archival Garment').join(', ')}
                              </div>
                            </td>

                            <td>
                              <div className="font-bold text-[#171513]">{order.customerName}</div>
                              <div className="font-mono text-[11px] text-[#7A7165] flex items-center gap-1">
                                <Phone className="w-3 h-3 text-[#9E7D47]" />
                                <span>{order.customerPhone}</span>
                              </div>
                              {order.customerEmail && (
                                <div className="text-[10px] font-mono text-[#7A7165] truncate max-w-xs">{order.customerEmail}</div>
                              )}
                            </td>

                            <td>
                              <div className="font-medium text-[#171513]">{order.shippingAddress.thana}, {order.shippingAddress.district}</div>
                              <div className="text-[10px] text-[#7A7165] line-clamp-1">{order.shippingAddress.streetAddress}</div>
                              <span className="text-[9px] font-mono text-[#9E7D47] uppercase font-bold">
                                {order.shippingAddress.deliveryZone.replace(/_/g, ' ')}
                              </span>
                            </td>

                            <td>
                              <div className="font-mono font-bold text-[#171513] text-sm">{formatBDT(order.totalBDT)}</div>
                              <div className="text-[10px] font-mono text-[#7A7165]">Subtotal: {formatBDT(order.subtotalBDT)}</div>
                              <div className="text-[10px] font-mono text-[#7A7165]">Fee: {formatBDT(order.deliveryFeeBDT)}</div>
                            </td>

                            <td>
                              <span className="font-mono text-[10px] px-2 py-0.5 rounded-2xs bg-[#FAF5EB] text-[#9E7D47] border border-[#C9B28B]/30 font-bold block w-fit">
                                {order.paymentGateway}
                              </span>
                              {order.paymentTrxId && (
                                <div className="font-mono text-[10px] text-[#171513] font-bold mt-1">
                                  TRX: {order.paymentTrxId}
                                </div>
                              )}
                              <div className="text-[10px] font-mono text-[#7A7165] mt-0.5">
                                COD Door: {formatBDT(order.codPayableAmountBDT)}
                              </div>
                            </td>

                            <td>
                              <span
                                className={`font-mono text-[9px] px-2 py-1 rounded-2xs font-bold block w-fit ${
                                  order.status === 'PAID_FULL'
                                    ? 'bg-[#EBF7F0] text-[#1A4231] border border-[#A8DFC5]'
                                    : order.status === 'READY_FOR_PICKUP'
                                    ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                    : order.status === 'DISPATCHED_COURIER'
                                    ? 'bg-[#FAF5EB] text-[#9E7D47] border border-[#C9B28B]'
                                    : order.status === 'DELIVERED'
                                    ? 'bg-neutral-900 text-white'
                                    : 'bg-neutral-100 text-neutral-700'
                                }`}
                              >
                                {order.status}
                              </span>

                              {/* Quick Status Update */}
                              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                {order.status !== 'PAID_FULL' && order.status !== 'DELIVERED' && (
                                  <button
                                    onClick={() => handleUpdateOrderStatus(order.id, 'PAID_FULL')}
                                    className="text-[9px] font-mono text-[#1A4231] hover:underline cursor-pointer"
                                  >
                                    Mark Paid
                                  </button>
                                )}
                                {order.status !== 'READY_FOR_PICKUP' && order.status !== 'DELIVERED' && (
                                  <button
                                    onClick={() => handleUpdateOrderStatus(order.id, 'READY_FOR_PICKUP')}
                                    className="text-[9px] font-mono text-blue-700 hover:underline cursor-pointer"
                                  >
                                    Ready Pickup
                                  </button>
                                )}
                                {order.status !== 'DELIVERED' && (
                                  <button
                                    onClick={() => handleUpdateOrderStatus(order.id, 'DELIVERED')}
                                    className="text-[9px] font-mono text-[#7A7165] hover:underline cursor-pointer"
                                  >
                                    Mark Delivered
                                  </button>
                                )}
                              </div>
                            </td>

                            <td>
                              <div className="font-mono font-bold text-xs">{order.courier}</div>
                              {order.trackingCode && (
                                <div className="font-mono text-[10px] text-[#7A7165] mt-0.5">
                                  Waybill: {order.trackingCode}
                                </div>
                              )}
                            </td>

                            <td className="text-right px-4">
                              <div className="flex flex-col items-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedDispatchOrderId(
                                      expandedDispatchOrderId === order.id ? null : order.id
                                    )
                                  }
                                  className={`px-2.5 py-1 text-[10px] font-mono rounded-2xs transition-colors cursor-pointer flex items-center gap-1 font-bold border ${
                                    expandedDispatchOrderId === order.id
                                      ? 'bg-[#9E7D47] text-white border-[#9E7D47]'
                                      : 'bg-[#FAF8F5] hover:bg-[#FAF5EB] text-[#171513] border-[#DED7CB]'
                                  }`}
                                  title="Open dynamic shipping cost calculator and courier dispatch console"
                                >
                                  <Calculator className="w-3 h-3" />
                                  <span>{expandedDispatchOrderId === order.id ? 'Hide Calculator' : 'Rates & Dispatch'}</span>
                                </button>

                                {order.status !== 'DISPATCHED_COURIER' && order.status !== 'DELIVERED' ? (
                                  <button
                                    onClick={() => handleDispatchOrder(order.id, 'STEADFAST', order.shippingAddress.deliveryZone)}
                                    className="px-2.5 py-1 text-[10px] font-mono bg-[#171513] hover:bg-[#9E7D47] text-[#FAF5EB] rounded-2xs transition-colors cursor-pointer flex items-center gap-1 font-bold"
                                  >
                                    <Send className="w-3 h-3" />
                                    <span>Dispatch Steadfast</span>
                                  </button>
                                ) : (
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      onClick={() => handleViewConsignmentNote(order.id, 'PREVIEW_MOCK_4X6', true)}
                                      className="px-2.5 py-1 text-[10px] font-mono bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold rounded-2xs transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                                      title="Open forced 4x6 Print Preview modal before printing"
                                    >
                                      <Eye className="w-3 h-3 text-neutral-950" />
                                      <span>Print Preview</span>
                                    </button>
                                    <button
                                      onClick={() => handleViewConsignmentNote(order.id, 'THERMAL_4X6', false)}
                                      className="px-2 py-1 text-[10px] font-mono border border-[#DED7CB] hover:bg-[#FAF8F5] text-[#171513] rounded-2xs transition-colors cursor-pointer flex items-center gap-1"
                                      title="Open consignment waybill"
                                    >
                                      <Printer className="w-3 h-3 text-[#9E7D47]" />
                                      <span>Waybill</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>

                          {expandedDispatchOrderId === order.id && (
                            <tr className="bg-[#FAF8F5]">
                              <td colSpan={8} className="p-4 border-t border-[#E8E2D8]">
                                <AdminDispatchControl
                                  order={order}
                                  onDispatch={handleDispatchOrder}
                                  onZoneChange={handleZoneChangeOrder}
                                  onSyncCourierStatus={handleSyncCourierStatus}
                                  isDispatching={dispatchingOrderId === order.id}
                                  isSyncing={syncingOrderId === order.id}
                                  onOpenConsignmentNote={(note, mode = 'PREVIEW_MOCK_4X6') => {
                                    setActiveConsignmentNote(note);
                                    setConsignmentModalMode(mode);
                                    setOpenPrintPreviewOnMount(mode === 'PREVIEW_MOCK_4X6');
                                    setIsConsignmentModalOpen(true);
                                  }}
                                />
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 4B: BARCODE SCANNER (SKU PICKUP & DISPATCH STATION)               */}
          {/* ===================================================================== */}
          {activeTab === 'SCANNER' && (
            <BarcodeScannerPanel
              orders={ordersList}
              onOrderUpdated={(updatedOrder) => {
                if (updatedOrder) {
                  setDispatchSuccessMsg(
                    `Order ${updatedOrder.orderNumber} updated to ${updatedOrder.status.replace(/_/g, ' ')}.`
                  );
                  setDashboardData((prev) => ({
                    ...prev,
                    recentOrders: (prev.recentOrders || []).map((o) =>
                      o.id === updatedOrder.id ? updatedOrder : o
                    )
                  }));
                  setTimeout(() => setDispatchSuccessMsg(null), 5000);
                }
                fetchDashboardStats();
              }}
              onOpenConsignmentNote={(note, mode = 'PREVIEW_MOCK_4X6') => {
                setActiveConsignmentNote(note);
                setConsignmentModalMode(mode);
                setOpenPrintPreviewOnMount(mode === 'PREVIEW_MOCK_4X6');
                setIsConsignmentModalOpen(true);
              }}
            />
          )}

          {/* ===================================================================== */}
          {/* TAB 4C: COURIER ANALYTICS (D3 STEADFAST VS PATHAO PERFORMANCE)        */}
          {/* ===================================================================== */}
          {activeTab === 'ANALYTICS' && (
            <CourierAnalyticsPanel orders={ordersList} />
          )}

          {/* ===================================================================== */}
          {/* TAB 5: MAINTAIN STOREFRONT (CAMPAIGNS, TICKERS, RATES & COPY)         */}
          {/* ===================================================================== */}
          {activeTab === 'STOREFRONT' && (
            <div className="max-w-4xl mx-auto bg-white p-6 sm:p-8 rounded-xs border border-[#E8E2D8] shadow-xs space-y-8 animate-in fade-in duration-200">
              <div className="border-b border-[#F0EAE1] pb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-editorial text-2xl font-normal text-[#171513]">
                    Maintain Live <span className="italic">storefront</span>
                  </h3>
                  <p className="text-xs font-mono text-[#7A7165] mt-1">
                    Control the promotional marquee, seasonal hero campaigns, delivery fee matrices, and concierge numbers in real time.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 text-xs font-aeonik font-bold uppercase tracking-wider border border-[#DED7CB] hover:bg-[#FAF8F5] rounded-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-[#9E7D47]" />
                  <span>View Live Store</span>
                </button>
              </div>

              {storefrontSuccessMsg && (
                <div className="p-3 bg-[#FAF5EB] border border-[#C9B28B] text-[#1A4231] text-xs font-mono rounded-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1A4231]" />
                  <span>{storefrontSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveStorefront} className="space-y-6">
                {/* 1. Header Announcement Ticker */}
                <div className="space-y-3 p-4 bg-[#FAF8F5] border border-[#E8E2D8] rounded-xs">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono uppercase tracking-wider text-[#171513] font-bold">
                      Top Announcement Marquee Ticker
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-mono">
                      <input
                        type="checkbox"
                        checked={storefrontForm.isAnnouncementVisible}
                        onChange={(e) => setStorefrontForm({ ...storefrontForm, isAnnouncementVisible: e.target.checked })}
                        className="rounded-2xs"
                      />
                      <span>Show on Storefront</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    value={storefrontForm.announcementText}
                    onChange={(e) => setStorefrontForm({ ...storefrontForm, announcementText: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-[#DED7CB] rounded-xs focus:outline-none"
                    placeholder="e.g. COMPLIMENTARY BANANI & GULSHAN SAME-DAY HAND DELIVERY"
                  />
                </div>

                {/* 2. Primary / Women's Hero Campaign */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#171513] font-bold">
                    <Sparkles className="w-4 h-4 text-[#9E7D47]" />
                    <span>Primary Editorial Hero Campaign</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-mono uppercase text-[#7A7165] block mb-1">
                        Hero Campaign Tag
                      </label>
                      <input
                        type="text"
                        value={storefrontForm.heroTag}
                        onChange={(e) => setStorefrontForm({ ...storefrontForm, heroTag: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DED7CB] rounded-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-mono uppercase text-[#7A7165] block mb-1">
                        Hero Headline Title
                      </label>
                      <input
                        type="text"
                        value={storefrontForm.heroHeadline}
                        onChange={(e) => setStorefrontForm({ ...storefrontForm, heroHeadline: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DED7CB] rounded-xs focus:outline-none font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono uppercase text-[#7A7165] block mb-1">
                      Hero Subheadline Description
                    </label>
                    <input
                      type="text"
                      value={storefrontForm.heroSubheadline}
                      onChange={(e) => setStorefrontForm({ ...storefrontForm, heroSubheadline: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DED7CB] rounded-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono uppercase text-[#7A7165] block mb-1">
                      Hero Background Image URL
                    </label>
                    <input
                      type="url"
                      value={storefrontForm.heroImageUrl}
                      onChange={(e) => setStorefrontForm({ ...storefrontForm, heroImageUrl: e.target.value })}
                      className="w-full px-3 py-2 text-xs font-mono bg-[#FAF8F5] border border-[#DED7CB] rounded-xs focus:outline-none"
                    />
                  </div>
                </div>

                {/* 3. Men's Hero Campaign */}
                <div className="space-y-4 pt-4 border-t border-[#F0EAE1]">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#171513] font-bold">
                    <User className="w-4 h-4 text-[#9E7D47]" />
                    <span>Men's Dedicated Home Campaign</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-mono uppercase text-[#7A7165] block mb-1">
                        Men's Hero Headline
                      </label>
                      <input
                        type="text"
                        value={storefrontForm.menHeroHeadline}
                        onChange={(e) => setStorefrontForm({ ...storefrontForm, menHeroHeadline: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DED7CB] rounded-xs focus:outline-none font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-mono uppercase text-[#7A7165] block mb-1">
                        Men's Background Image URL
                      </label>
                      <input
                        type="url"
                        value={storefrontForm.menHeroImageUrl}
                        onChange={(e) => setStorefrontForm({ ...storefrontForm, menHeroImageUrl: e.target.value })}
                        className="w-full px-3 py-2 text-xs font-mono bg-[#FAF8F5] border border-[#DED7CB] rounded-xs focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Bangladesh Logistics Delivery Rates */}
                <div className="space-y-4 pt-4 border-t border-[#F0EAE1]">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#171513] font-bold">
                    <Truck className="w-4 h-4 text-[#9E7D47]" />
                    <span>Bangladesh Logistics Delivery Fees</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[11px] font-mono uppercase text-[#7A7165] block mb-1">
                        Inside Dhaka Delivery (৳)
                      </label>
                      <input
                        type="number"
                        value={storefrontForm.insideDhakaDeliveryFeeBDT}
                        onChange={(e) => setStorefrontForm({ ...storefrontForm, insideDhakaDeliveryFeeBDT: Number(e.target.value) })}
                        className="w-full px-3 py-2 text-xs font-mono bg-[#FAF8F5] border border-[#DED7CB] rounded-xs font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-mono uppercase text-[#7A7165] block mb-1">
                        Outside Dhaka Delivery (৳)
                      </label>
                      <input
                        type="number"
                        value={storefrontForm.outsideDhakaDeliveryFeeBDT}
                        onChange={(e) => setStorefrontForm({ ...storefrontForm, outsideDhakaDeliveryFeeBDT: Number(e.target.value) })}
                        className="w-full px-3 py-2 text-xs font-mono bg-[#FAF8F5] border border-[#DED7CB] rounded-xs font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-mono uppercase text-[#7A7165] block mb-1">
                        VIP Concierge Phone
                      </label>
                      <input
                        type="text"
                        value={storefrontForm.conciergePhone}
                        onChange={(e) => setStorefrontForm({ ...storefrontForm, conciergePhone: e.target.value })}
                        className="w-full px-3 py-2 text-xs font-mono bg-[#FAF8F5] border border-[#DED7CB] rounded-xs font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* Maintenance Mode */}
                <div className="pt-4 border-t border-[#F0EAE1] flex items-center justify-between">
                  <div>
                    <div className="text-xs font-mono font-bold uppercase text-[#171513]">Storefront Maintenance Mode</div>
                    <p className="text-[11px] text-[#7A7165]">Display temporary private maintenance banner for vault inventory audits.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={storefrontForm.isMaintenanceMode}
                    onChange={(e) => setStorefrontForm({ ...storefrontForm, isMaintenanceMode: e.target.checked })}
                    className="w-4 h-4 cursor-pointer"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSavingStorefront}
                  className="w-full py-3 bg-[#171513] hover:bg-[#9E7D47] text-[#FAF5EB] font-aeonik font-bold text-xs uppercase tracking-widest transition-all rounded-xs shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingStorefront ? 'Saving Changes...' : 'Save & Deploy Storefront Updates'}</span>
                </button>
              </form>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 6: 10-MINUTE CART LEASES & CONCURRENCY HOLDS                      */}
          {/* ===================================================================== */}
          {activeTab === 'HOLDS' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-white p-6 rounded-xs border border-[#E8E2D8] shadow-xs flex items-center justify-between">
                <div>
                  <h3 className="font-editorial text-xl font-normal text-[#171513]">
                    Active 10-Minute Cart Reservation Leases
                  </h3>
                  <p className="text-xs font-mono text-[#7A7165] mt-1">
                    Prevents concurrent checkout collisions in 1-of-1 luxury resale. Holds automatically expire after 10 minutes.
                  </p>
                </div>

                <button
                  onClick={handleReleaseAllHolds}
                  disabled={isReleasingHolds || (dashboardData.activeLocks?.length || 0) === 0}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-mono uppercase font-bold rounded-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Release All Holds</span>
                </button>
              </div>

              <div className="bg-white rounded-xs border border-[#E8E2D8] shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[#FAF8F5] border-b border-[#E8E2D8] text-[#7A7165] font-mono uppercase text-[10px]">
                      <th className="py-3 px-4">Lock ID</th>
                      <th>Product Piece</th>
                      <th>Customer Phone</th>
                      <th>Locked At</th>
                      <th>Expires At</th>
                      <th>Status</th>
                      <th className="text-right px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0EAE1]">
                    {(!dashboardData.activeLocks || dashboardData.activeLocks.length === 0) ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-neutral-400 font-mono">
                          No active 10-minute customer cart holds at this moment. All inventory is active.
                        </td>
                      </tr>
                    ) : (
                      dashboardData.activeLocks.map((lock) => {
                        const product = products.find((p) => p.id === lock.productId);
                        return (
                          <tr key={lock.id} className="hover:bg-[#FAF8F5]">
                            <td className="py-3 px-4 font-mono font-bold text-[#171513]">{lock.id}</td>
                            <td>
                              <div className="font-bold text-[#171513]">{product?.title || lock.productId}</div>
                              <div className="text-[10px] font-mono text-[#7A7165]">{product?.sku}</div>
                            </td>
                            <td className="font-mono">{lock.phone}</td>
                            <td className="font-mono text-[10px] text-[#7A7165]">{new Date(lock.lockedAt).toLocaleTimeString()}</td>
                            <td className="font-mono text-[10px] text-[#9E7D47] font-bold">{new Date(lock.expiresAt).toLocaleTimeString()}</td>
                            <td>
                              <span className="font-mono text-[9px] px-2 py-0.5 rounded-2xs bg-[#FAF5EB] text-[#9E7D47] border border-[#C9B28B]/40 font-bold">
                                ACTIVE LEASE
                              </span>
                            </td>
                            <td className="text-right px-4">
                              <button
                                onClick={() => handleReleaseHold(lock.productId)}
                                className="px-3 py-1 text-xs font-mono text-red-600 hover:bg-red-50 rounded-2xs border border-red-200 cursor-pointer"
                              >
                                Release Now
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: EDIT PRODUCT DETAILS                                             */}
      {/* ========================================================================= */}
      {isEditModalOpen && editingProduct && (
        <div className="fixed inset-0 z-60 overflow-y-auto bg-black/70 flex items-center justify-center p-3 animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-white border border-[#E8E2D8] rounded-xs shadow-2xl p-6 space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-[#F0EAE1] pb-3">
              <h3 className="font-editorial text-xl font-normal text-[#171513]">
                Edit Archival Piece: <span className="font-mono font-bold">{editingProduct.sku}</span>
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-[#7A7165] hover:text-[#171513]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-[#FAF8F5] border border-[#E8E2D8] rounded-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-white border border-[#DED7CB] rounded-2xs shrink-0">
                  <QRCodeSVG
                    value={editingProduct.sku}
                    size={56}
                    level="M"
                    bgColor="#FFFFFF"
                    fgColor="#171513"
                  />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#171513]">Mobile Inventory QR &amp; Code-128 Tag</div>
                  <div className="text-[11px] font-mono text-[#7A7165]">SKU: {editingProduct.sku}</div>
                </div>
              </div>
              <div className="bg-white px-3 py-1.5 border border-[#DED7CB] rounded-2xs">
                <SkuBarcode
                  value={editingProduct.sku}
                  height={32}
                  width={1.2}
                  displayValue={true}
                  fontSize={10}
                />
              </div>
            </div>

            <form onSubmit={handleSaveEditProduct} className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] font-mono uppercase text-[#7A7165] block mb-1">Title</label>
                <input
                  type="text"
                  value={editingProduct.title}
                  onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DED7CB] rounded-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase text-[#7A7165] block mb-1">Brand</label>
                  <input
                    type="text"
                    value={editingProduct.brand}
                    onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DED7CB] rounded-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-[#7A7165] block mb-1">Price (৳)</label>
                  <input
                    type="number"
                    value={editingProduct.priceBDT}
                    onChange={(e) => setEditingProduct({ ...editingProduct, priceBDT: Number(e.target.value) })}
                    className="w-full px-3 py-2 font-mono bg-[#FAF8F5] border border-[#DED7CB] rounded-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-[#7A7165] block mb-1">COGS (৳)</label>
                  <input
                    type="number"
                    value={editingProduct.cogsBDT}
                    onChange={(e) => setEditingProduct({ ...editingProduct, cogsBDT: Number(e.target.value) })}
                    className="w-full px-3 py-2 font-mono bg-[#FAF8F5] border border-[#DED7CB] rounded-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase text-[#7A7165] block mb-1">Gender</label>
                  <select
                    value={editingProduct.gender}
                    onChange={(e) => setEditingProduct({ ...editingProduct, gender: e.target.value as any })}
                    className="w-full px-3 py-2 font-mono bg-[#FAF8F5] border border-[#DED7CB] rounded-xs"
                  >
                    <option value="MEN">MEN</option>
                    <option value="WOMEN">WOMEN</option>
                    <option value="UNISEX">UNISEX</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-[#7A7165] block mb-1">Status</label>
                  <select
                    value={editingProduct.status}
                    onChange={(e) => setEditingProduct({ ...editingProduct, status: e.target.value as any })}
                    className="w-full px-3 py-2 font-mono bg-[#FAF8F5] border border-[#DED7CB] rounded-xs"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="IN_CART_HOLD">IN_CART_HOLD</option>
                    <option value="SOLD">SOLD</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-[#7A7165] block mb-1">Size Tag</label>
                  <input
                    type="text"
                    value={editingProduct.sizeTag}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sizeTag: e.target.value })}
                    className="w-full px-3 py-2 font-mono bg-[#FAF8F5] border border-[#DED7CB] rounded-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F0EAE1]">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-[#DED7CB] rounded-xs hover:bg-[#FAF8F5] font-mono cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-5 py-2 bg-[#171513] hover:bg-[#9E7D47] text-[#FAF5EB] font-aeonik font-bold uppercase rounded-xs transition-colors cursor-pointer"
                >
                  {isSavingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CONFIRM DELETE PRODUCT                                           */}
      {/* ========================================================================= */}
      {deletingProduct && (
        <div className="fixed inset-0 z-60 overflow-y-auto bg-black/70 flex items-center justify-center p-3 animate-in fade-in">
          <div className="relative w-full max-w-md bg-white border border-[#E8E2D8] rounded-xs shadow-2xl p-6 space-y-4 my-auto">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-aeonik font-bold text-base uppercase text-[#171513]">
                Confirm Permanent Removal
              </h3>
            </div>
            <p className="text-xs text-[#5C5449] leading-relaxed">
              Are you sure you want to permanently remove <strong className="text-[#171513]">{deletingProduct.title}</strong> (SKU: <span className="font-mono">{deletingProduct.sku}</span>) from the archive inventory catalog? This action cannot be reversed.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                className="px-4 py-2 border border-[#DED7CB] rounded-xs hover:bg-[#FAF8F5] text-xs font-mono cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-mono text-xs uppercase font-bold rounded-xs cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Piece'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: MANUAL ORDER INTAKE (FOR BANANI/GULSHAN VIP WALK-IN CLIENTS)     */}
      {/* ========================================================================= */}
      {isManualOrderModalOpen && (
        <div className="fixed inset-0 z-60 overflow-y-auto bg-black/70 flex items-center justify-center p-3 animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white border border-[#E8E2D8] rounded-xs shadow-2xl p-6 space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-[#F0EAE1] pb-3">
              <div>
                <h3 className="font-editorial text-xl font-normal text-[#171513]">
                  Manual VIP Order <span className="italic">collection</span>
                </h3>
                <p className="text-[10px] font-mono text-[#7A7165]">Collect salon walk-in or telephone orders in Dhaka</p>
              </div>
              <button onClick={() => setIsManualOrderModalOpen(false)} className="text-[#7A7165] hover:text-[#171513]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualOrderSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase text-[#7A7165] block mb-1">Customer Name *</label>
                  <input
                    type="text"
                    value={manualCustomerName}
                    onChange={(e) => setManualCustomerName(e.target.value)}
                    required
                    placeholder="e.g. Nafis Chowdhury"
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DED7CB] rounded-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-[#7A7165] block mb-1">BD Phone *</label>
                  <input
                    type="tel"
                    value={manualCustomerPhone}
                    onChange={(e) => setManualCustomerPhone(e.target.value)}
                    required
                    placeholder="01711982341"
                    className="w-full px-3 py-2 font-mono bg-[#FAF8F5] border border-[#DED7CB] rounded-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-[#7A7165] block mb-1">Select Inventory Piece *</label>
                <select
                  value={manualProductId}
                  onChange={(e) => setManualProductId(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs font-mono bg-[#FAF8F5] border border-[#DED7CB] rounded-xs"
                >
                  <option value="">Select available piece...</option>
                  {products.filter((p) => p.status === 'ACTIVE').map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.sku}) — {formatBDT(p.priceBDT)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase text-[#7A7165] block mb-1">Payment Method</label>
                  <select
                    value={manualPaymentGateway}
                    onChange={(e) => setManualPaymentGateway(e.target.value as any)}
                    className="w-full px-3 py-2 font-mono bg-[#FAF8F5] border border-[#DED7CB] rounded-xs"
                  >
                    <option value="BKASH">bKash</option>
                    <option value="NAGAD">Nagad</option>
                    <option value="CASH_ON_DELIVERY">Cash on Delivery (Salon)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-[#7A7165] block mb-1">TrxID (Optional)</label>
                  <input
                    type="text"
                    value={manualPaymentTrxId}
                    onChange={(e) => setManualPaymentTrxId(e.target.value)}
                    placeholder="BKASH-TRX-XXXX"
                    className="w-full px-3 py-2 font-mono bg-[#FAF8F5] border border-[#DED7CB] rounded-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F0EAE1]">
                <button
                  type="button"
                  onClick={() => setIsManualOrderModalOpen(false)}
                  className="px-4 py-2 border border-[#DED7CB] rounded-xs hover:bg-[#FAF8F5] font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingManualOrder || !manualProductId}
                  className="px-5 py-2 bg-[#171513] hover:bg-[#9E7D47] text-[#FAF5EB] font-aeonik font-bold uppercase rounded-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingManualOrder ? 'Logging Order...' : 'Log & Complete Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Consignment Waybill Modal */}
      {isConsignmentModalOpen && activeConsignmentNote && (
        <ConsignmentNoteModal
          isOpen={isConsignmentModalOpen}
          onClose={() => {
            setIsConsignmentModalOpen(false);
            setOpenPrintPreviewOnMount(false);
          }}
          consignmentNote={activeConsignmentNote}
          initialMode={consignmentModalMode}
          autoOpenPrintPreview={openPrintPreviewOnMount}
        />
      )}

      {/* Courier API Gateways Configuration Modal */}
      {isConfigModalOpen && courierConfig && (
        <CourierConfigModal
          isOpen={isConfigModalOpen}
          onClose={() => setIsConfigModalOpen(false)}
          config={courierConfig}
          onSaveConfig={async (updated: Partial<CourierApiConfig>) => {
            const res = await adminApiRequest('/api/admin/courier/config', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updated)
            });
            if (res.ok) {
              const data = await res.json();
              setCourierConfig(data.config);
            }
          }}
        />
      )}

      {/* MODAL 4: MOBILE STAFF SKU QR CODE & CODE-128 BARCODE HANGTAG */}
      {labelModalProduct && (
        <div
          className="fixed inset-0 z-60 overflow-y-auto bg-black/70 flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setLabelModalProduct(null)}
        >
          <div
            className="relative w-full max-w-md bg-white border border-[#E8E2D8] rounded-xs shadow-2xl p-6 space-y-5 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-[#F0EAE1] pb-3">
              <div>
                <h3 className="font-editorial text-xl font-normal text-[#171513]">
                  Inventory SKU <span className="italic">scan tag</span>
                </h3>
                <p className="text-xs text-[#7A7165] mt-0.5">
                  Scannable QR code &amp; Code-128 barcode for mobile vault staff
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLabelModalProduct(null)}
                className="text-[#7A7165] hover:text-[#171513] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 bg-[#FAF8F5] border border-[#E8E2D8] rounded-xs">
              <img
                src={labelModalProduct.images[0] || 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=150&q=80'}
                alt={labelModalProduct.title}
                className="w-12 h-14 object-cover rounded-2xs border border-[#DED7CB] shrink-0"
              />
              <div className="min-w-0">
                <div className="text-[11px] font-mono font-bold text-[#9E7D47] uppercase">
                  {labelModalProduct.brand}
                </div>
                <div className="text-sm font-bold text-[#171513] truncate">
                  {labelModalProduct.title}
                </div>
                <div className="text-xs font-mono text-[#5C5449]">
                  {formatBDT(labelModalProduct.priceBDT)} · {labelModalProduct.sizeTag} · {labelModalProduct.status}
                </div>
              </div>
            </div>

            <div className="p-5 bg-white border-2 border-[#171513] rounded-xs flex flex-col items-center gap-4 text-center">
              <div className="p-2 bg-white border border-[#E8E2D8] rounded-xs">
                <QRCodeSVG
                  value={labelModalProduct.sku}
                  size={156}
                  level="H"
                  includeMargin={true}
                  bgColor="#FFFFFF"
                  fgColor="#171513"
                />
              </div>

              <div className="w-full pt-3 border-t border-[#E8E2D8] flex flex-col items-center">
                <SkuBarcode
                  value={labelModalProduct.sku}
                  height={48}
                  width={1.6}
                  displayValue={true}
                  fontSize={12}
                  lineColor="#171513"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setLabelModalProduct(null);
                  setActiveTab('SCANNER');
                }}
                className="px-4 py-2 bg-[#171513] hover:bg-[#9E7D47] text-[#FAF5EB] text-xs font-bold uppercase rounded-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Barcode className="w-3.5 h-3.5" />
                <span>Open Scanner Tab</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 border border-[#DED7CB] hover:bg-[#FAF8F5] text-[#171513] text-xs font-mono font-bold rounded-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-[#9E7D47]" />
                <span>Print Tag</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

