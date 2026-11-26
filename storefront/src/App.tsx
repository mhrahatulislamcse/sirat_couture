import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle2,
  Lock,
  Clock,
  Layers,
  ChevronDown,
  Ruler,
  RefreshCw,
  ShoppingBag,
  ExternalLink,
  SlidersHorizontal,
  Archive,
  Play,
  X,
  MapPin,
  Heart
} from 'lucide-react';
import { Product, Gender, CategoryItem, Order, UserProfile, UserGender, StorefrontConfig } from './types/resale';
import { TAXONOMY, INITIAL_PRODUCTS } from './data/initialCatalog';
import { Header } from './components/Header';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { SearchModal } from './components/SearchModal';
import { WishlistDrawer } from './components/WishlistDrawer';
import { SEOManager } from './components/SEOManager';
import { OrderTracking } from './components/OrderTracking';
import { UserProfileModal } from './components/UserProfileModal';
import { MenHomePage } from './components/MenHomePage';
import { StyleQuizModal, AestheticId } from './components/StyleQuizModal';
import { PriceDropToast } from './components/PriceDropToast';
import { evaluatePriceDropAlerts, dispatchPriceDropEvent } from './utils/priceAlerts';
import { customerApiRequest } from './lib/apiClient';

export default function App() {
  // Session & User ID
  const [userId, setUserId] = useState<string>('');

  // Catalog State
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [storefrontConfig, setStorefrontConfig] = useState<StorefrontConfig | null>(null);

  // View Routing: 'HOME' (Editorial Landing) vs 'SHOP' (Curated Vault Catalog)
  const [currentView, setCurrentView] = useState<'HOME' | 'SHOP'>('HOME');

  // Filters
  const [selectedGender, setSelectedGender] = useState<Gender | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedCondition, setSelectedCondition] = useState<string>('ALL');
  const [selectedEra, setSelectedEra] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<string>('featured');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Drawers
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderTrackingOpen, setIsOrderTrackingOpen] = useState(false);
  const [trackingInitialQuery, setTrackingInitialQuery] = useState('');
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isStyleQuizOpen, setIsStyleQuizOpen] = useState(false);

  // User Profile & Preferences State (Gender & Preferred Home)
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: '',
    gender: 'UNSPECIFIED',
    preferredHome: 'HOME'
  });

  // Newsletter State
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  // Cart State (Direct Bag Addition without expiring hold timer)
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [isAddingToBag, setIsAddingToBag] = useState(false);
  const [holdErrorBanner, setHoldErrorBanner] = useState<string | null>(null);

  // Wishlist State
  const [wishlist, setWishlist] = useState<Product[]>([]);

  // Courier Provenance Verification Notice (from QR Code Scan)
  const [provenanceNotice, setProvenanceNotice] = useState<{ seal: string; order?: string } | null>(null);

  // Initialize or restore session ID and User Profile Preferences
  useEffect(() => {
    let session = localStorage.getItem('innove_user_session');
    if (!session) {
      session = `usr_${Math.random().toString(36).substring(2, 10)}`;
      localStorage.setItem('innove_user_session', session);
    }
    setUserId(session);

    // 1. Restore User Profile & Preferences from session
    let initialProfile: UserProfile = {
      id: session,
      gender: 'UNSPECIFIED',
      preferredHome: 'HOME'
    };

    const savedProfileStr = localStorage.getItem('innove_user_profile') || sessionStorage.getItem('innove_user_profile');
    if (savedProfileStr) {
      try {
        const parsed = JSON.parse(savedProfileStr);
        initialProfile = { ...initialProfile, ...parsed };
      } catch (e) {
        console.error('Error parsing stored user profile:', e);
      }
    }

    setUserProfile(initialProfile);

    // Respect user's preferred home landing preference
    if (initialProfile.preferredHome === 'SHOP') {
      setCurrentView('SHOP');
    } else {
      setCurrentView('HOME');
    }

    // Respect user's gender preference for initial catalog curation
    if (initialProfile.gender === 'WOMEN') {
      setSelectedGender('WOMEN');
    } else if (initialProfile.gender === 'MEN') {
      setSelectedGender('MEN');
    }

    // Sync with backend API profile session
    customerApiRequest(`/api/user/profile/${session}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.profile) {
          setUserProfile((prev) => {
            const merged = { ...prev, ...data.profile };
            localStorage.setItem('innove_user_profile', JSON.stringify(merged));
            sessionStorage.setItem('innove_user_profile', JSON.stringify(merged));
            return merged;
          });
        }
      })
      .catch((err) => {
        console.warn('Backend user profile session sync:', err);
      });

    // Restore wishlist
    const savedWishlist = localStorage.getItem('innove_wishlist');
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch (e) {
        console.error(e);
      }
    }

    // Fetch initial storefront announcement & campaign config
    fetchStorefrontConfig();

    // Check if user or courier arrived via Provenance Verification QR scan
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const verifyParam = urlParams.get('verify');
      const orderParam = urlParams.get('order');
      if (verifyParam) {
        setProvenanceNotice({ seal: verifyParam, order: orderParam || undefined });
      }
    } catch (e) {
      console.warn('Could not parse verification query params', e);
    }
  }, []);

  // Persist User Profile Updates to session and server
  const handleUpdateUserProfile = async (updates: Partial<UserProfile>) => {
    const updated: UserProfile = {
      ...userProfile,
      ...updates,
      id: userId || userProfile.id,
      updatedAt: new Date().toISOString()
    };

    // Update React state
    setUserProfile(updated);

    // Persist in client-side session storages
    localStorage.setItem('innove_user_profile', JSON.stringify(updated));
    sessionStorage.setItem('innove_user_profile', JSON.stringify(updated));

    // Reactively update current view if preferredHome was updated
    if (updates.preferredHome && (updates.preferredHome === 'HOME' || updates.preferredHome === 'SHOP')) {
      setCurrentView(updates.preferredHome as 'HOME' | 'SHOP');
    }

    // Reactively update active department filter if gender was updated
    if (updates.gender) {
      if (updates.gender === 'WOMEN') {
        setSelectedGender('WOMEN');
      } else if (updates.gender === 'MEN') {
        setSelectedGender('MEN');
      } else if (updates.gender === 'UNSPECIFIED') {
        setSelectedGender('ALL');
      }
    }

    // Persist to backend user session endpoint
    try {
      await customerApiRequest('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId || userProfile.id,
          gender: updated.gender,
          preferredHome: updated.preferredHome,
          name: updated.name,
          phone: updated.phone,
          email: updated.email,
          notes: updated.notes
        })
      });
    } catch (err) {
      console.error('Error persisting profile to API session:', err);
    }
  };

  // Fetch catalog from backend
  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const params = new URLSearchParams();
      if (selectedGender !== 'ALL') params.set('gender', selectedGender);
      if (selectedCategory !== 'ALL') params.set('category', selectedCategory);
      if (selectedCondition !== 'ALL') params.set('condition', selectedCondition);
      if (selectedEra !== 'ALL') params.set('era', selectedEra);
      if (sortOrder !== 'featured') params.set('sort', sortOrder);
      if (searchQuery.trim()) params.set('query', searchQuery.trim());

      const res = await customerApiRequest(`/api/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        const loadedProducts = data.products || [];
        setProducts(loadedProducts);
        // Automatically verify if any stored price drop alerts have been satisfied
        const triggered = evaluatePriceDropAlerts(loadedProducts);
        for (const ev of triggered) {
          dispatchPriceDropEvent(ev);
        }

        // If arrived via Provenance QR Code (?item=...), open item modal
        try {
          const urlParams = new URLSearchParams(window.location.search);
          const itemParam = urlParams.get('item');
          if (itemParam) {
            const matched = loadedProducts.find(
              (p: Product) => p.id === itemParam || p.slug === itemParam || p.sku.toLowerCase() === itemParam.toLowerCase()
            );
            if (matched) {
              setSelectedProduct(matched);
            }
          }
        } catch (e) {
          console.warn('Error checking item URL param:', e);
        }
      }
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Fetch live storefront marketing & fee configuration
  const fetchStorefrontConfig = async () => {
    try {
      const res = await customerApiRequest('/api/storefront/config');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.config) {
          setStorefrontConfig(data.config);
        }
      }
    } catch (err) {
      console.warn('Backend storefront configuration sync:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedGender, selectedCategory, selectedCondition, selectedEra, sortOrder, searchQuery]);

  // Direct Bag Addition
  const handleAddToCart = async (product: Product) => {
    setIsAddingToBag(true);
    setHoldErrorBanner(null);

    try {
      // Direct addition without 10-minute hold restriction
      setCartItems((prev) => {
        const exists = prev.find((p) => p.id === product.id);
        if (exists) return prev;
        return [...prev, product];
      });

      // Notify backend cart session
      customerApiRequest('/api/cart/hold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          userId
        })
      }).catch(() => {});

      setIsCartOpen(true);
    } catch (err: any) {
      setHoldErrorBanner(err.message || 'Error adding piece to bag.');
    } finally {
      setIsAddingToBag(false);
    }
  };

  // Remove from bag
  const handleRemoveFromCart = async (productId: string) => {
    try {
      await customerApiRequest(`/api/cart/hold/${productId}`, { method: 'DELETE' });
    } catch (e) {
      console.error(e);
    }

    const updated = cartItems.filter((item) => item.id !== productId);
    setCartItems(updated);
  };

  // Toggle wishlist
  const handleToggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      let updated: Product[];
      if (exists) {
        updated = prev.filter((p) => p.id !== product.id);
      } else {
        updated = [...prev, product];
      }
      localStorage.setItem('innove_wishlist', JSON.stringify(updated));
      return updated;
    });
  };

  // Handle successful order completion
  const handleOrderCompleted = (order: Order) => {
    setCartItems([]);
    fetchProducts();
  };

  // Handle Style Quiz aesthetic discovery filter
  const handleExploreAestheticShop = (archetypeId: AestheticId) => {
    if (archetypeId === 'archive_streetwear') {
      setSelectedCategory('cat_vintage_streetwear');
      setCurrentView('SHOP');
    } else if (archetypeId === 'vintage_tailoring') {
      setSelectedCategory('cat_tailoring');
      setCurrentView('SHOP');
    } else if (archetypeId === 'minimalist') {
      setSelectedCategory('cat_rtw');
      setCurrentView('SHOP');
    } else if (archetypeId === 'avant_garde') {
      setSelectedCategory('cat_footwear');
      setCurrentView('SHOP');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6] text-[#121212] selection:bg-neutral-900 selection:text-white">
      {/* Dynamic SEO & Social OpenGraph Metadata Manager */}
      <SEOManager
        selectedProduct={selectedProduct}
        selectedCategory={selectedCategory}
        selectedGender={selectedGender}
        totalProductsCount={products.length}
      />

      {/* Courier Provenance QR Verification Banner */}
      {provenanceNotice && (
        <div className="bg-[#171513] text-[#FAF5EB] px-4 py-2.5 border-b border-[#C9B28B]/50 flex items-center justify-between text-xs font-mono animate-in fade-in z-50 sticky top-0 shadow-lg">
          <div className="flex items-center gap-2.5 mx-auto max-w-7xl">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="leading-snug">
              <span className="text-amber-300 font-bold uppercase tracking-wider mr-2">
                COURIER PROVENANCE VERIFIED:
              </span>
              <span>
                Vault Seal <span className="font-bold underline text-white">{provenanceNotice.seal}</span> officially verified for physical authentic intake at Dhaka Vault Salon
                {provenanceNotice.order ? ` · Order #${provenanceNotice.order}` : ''}.
              </span>
            </div>
          </div>
          <button
            onClick={() => setProvenanceNotice(null)}
            className="text-[#A89F91] hover:text-white p-1 cursor-pointer transition-colors"
            title="Dismiss verification banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Dynamic Expiration / Error Notification Toast */}
      {holdErrorBanner && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 max-w-lg w-full px-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="p-3.5 bg-neutral-950 text-white border border-neutral-800 rounded-sm shadow-2xl flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{holdErrorBanner}</span>
            </div>
            <button
              onClick={() => setHoldErrorBanner(null)}
              className="text-neutral-400 hover:text-white p-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Global Luxury Header */}
      <Header
        currentGender={selectedGender}
        currentView={currentView}
        onSelectView={(view) => setCurrentView(view)}
        onSelectGender={(g) => {
          setSelectedGender(g);
          setSelectedCategory('ALL');
        }}
        onSelectCategory={(c) => setSelectedCategory(c)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenOrderTracking={() => {
          setTrackingInitialQuery('');
          setIsOrderTrackingOpen(true);
        }}
        onSearchQuery={(q) => {
          setSearchQuery(q);
          setCurrentView('SHOP');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        userProfile={userProfile}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onQuickUpdateProfile={handleUpdateUserProfile}
        cartCount={cartItems.length}
        wishlistCount={wishlist.length}
        storefrontConfig={storefrontConfig}
        onOpenStyleQuiz={() => setIsStyleQuizOpen(true)}
      />

      {/* Conditional View Routing: Clean Editorial Home vs Curated Shop Catalog */}
      {currentView === 'HOME' ? (
        selectedGender === 'MEN' ? (
          <MenHomePage
            onExploreShop={(cat) => {
              if (cat && cat !== 'ALL') setSelectedCategory(cat);
              setSelectedGender('MEN');
              setCurrentView('SHOP');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSelectGender={(g) => {
              setSelectedGender(g);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onWatchVideo={() => setIsVideoModalOpen(true)}
            storefrontConfig={storefrontConfig}
            onOpenStyleQuiz={() => setIsStyleQuizOpen(true)}
          />
        ) : (
          <>
            {/* ========================================================================= */}
            {/* SECTION 1: HERO CAMPAIGN ("Minimalism and fantasy" with Play button)     */}
            {/* ========================================================================= */}
      <section className="relative w-full min-h-[82vh] lg:min-h-[90vh] flex items-center justify-center overflow-hidden bg-black">
        {/* Full-width editorial background image from Innove Couture template */}
        <img
          src={storefrontConfig?.heroImageUrl || "https://innovecouture.vamtam.com/wp-content/uploads/2024/01/pexels-cottonbro-studio-9836585-1-scaled.jpg"}
          alt={storefrontConfig?.heroHeadline || "Minimalism and fantasy"}
          className="absolute inset-0 w-full h-full object-cover object-center brightness-[0.88] contrast-[1.05]"
        />

        {/* Subtle vignette gradient for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/30 pointer-events-none" />

        {/* Center Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center text-white space-y-7 animate-in fade-in duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[11px] font-mono tracking-[0.2em] uppercase text-white/90">
            <span>{storefrontConfig?.heroTag || "Archive Capsule 2026"}</span>
          </div>

          <h1 className="font-editorial text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-normal tracking-tight text-white leading-[1.05] drop-shadow-md">
            {storefrontConfig?.heroHeadline ? (
              <span>{storefrontConfig.heroHeadline}</span>
            ) : (
              <>
                Minimalism and <span className="italic font-light">fantasy</span>
              </>
            )}
          </h1>

          {storefrontConfig?.heroSubheadline && (
            <p className="max-w-xl mx-auto font-sans text-xs sm:text-sm text-neutral-300 font-light tracking-wide">
              {storefrontConfig.heroSubheadline}
            </p>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-3">
            <button
              onClick={() => {
                setCurrentView('SHOP');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-8 py-3.5 bg-white text-[#171513] hover:bg-[#FAF5EB] font-aeonik font-bold text-xs uppercase tracking-widest transition-all rounded-xs shadow-lg cursor-pointer flex items-center gap-2 group"
            >
              <span>Explore collection</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => setIsVideoModalOpen(true)}
              className="px-6 py-3.5 bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/30 text-white font-aeonik font-medium text-xs uppercase tracking-widest transition-all rounded-xs cursor-pointer flex items-center gap-2.5 group"
            >
              <div className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-2.5 h-2.5 fill-black ml-0.5" />
              </div>
              <span>Watch Film</span>
            </button>

            <button
              onClick={() => setIsStyleQuizOpen(true)}
              className="px-6 py-3.5 bg-[#FAF5EB]/15 hover:bg-[#FAF5EB]/25 backdrop-blur-md border border-[#C9B28B]/60 text-[#FAF5EB] font-aeonik font-bold text-xs uppercase tracking-widest transition-all rounded-xs cursor-pointer flex items-center gap-2 group shadow-sm hover:border-[#C9B28B]"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C9B28B] group-hover:rotate-12 transition-transform" />
              <span>Style Diagnostic</span>
            </button>
          </div>
        </div>

        {/* Bottom Right Floating Play Pill */}
        <button
          onClick={() => setIsVideoModalOpen(true)}
          className="absolute bottom-8 right-8 z-20 hidden md:flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/30 text-white text-xs font-aeonik uppercase tracking-wider rounded-full transition-all cursor-pointer group"
        >
          <Play className="w-3.5 h-3.5 fill-white group-hover:scale-110 transition-transform" />
          <span>Play Reel</span>
        </button>
      </section>

      {/* ========================================================================= */}
      {/* LUXURY TRUST VAULT PILLARS (Natural Editorial & User Eye-Attracting)      */}
      {/* ========================================================================= */}
      <section className="border-b border-[#E8E2D8] bg-[#FCFBF9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 divide-y md:divide-y-0 md:divide-x divide-[#E8E2D8]">
            {/* Pillar 1: 1-of-1 Pieces */}
            <div className="flex items-start gap-4 pt-4 md:pt-0 md:px-6 first:pl-0">
              <div className="w-10 h-10 rounded-full bg-[#FAF5EB] border border-[#C9B28B]/50 flex items-center justify-center shrink-0 text-[#9E7D47] shadow-2xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-editorial text-lg sm:text-xl font-normal text-[#171513] tracking-tight">
                  1-of-1 <span className="italic">Pieces</span>
                </h3>
                <p className="font-sans text-xs text-[#5C5449] leading-relaxed">
                  Individual authenticated archival garments with real-time reservation locks to prevent duplicate checkout.
                </p>
              </div>
            </div>

            {/* Pillar 2: Flat Measure */}
            <div className="flex items-start gap-4 pt-4 md:pt-0 md:px-6">
              <div className="w-10 h-10 rounded-full bg-[#FAF5EB] border border-[#C9B28B]/50 flex items-center justify-center shrink-0 text-[#9E7D47] shadow-2xs">
                <Ruler className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-editorial text-lg sm:text-xl font-normal text-[#171513] tracking-tight">
                  Flat <span className="italic">Measure</span>
                </h3>
                <p className="font-sans text-xs text-[#5C5449] leading-relaxed">
                  Manual millimeter-accurate flat tailoring dimensions for shoulders, chest, and length. Zero sizing ambiguity.
                </p>
              </div>
            </div>

            {/* Pillar 3: 100% Proven */}
            <div className="flex items-start gap-4 pt-4 md:pt-0 md:px-6 last:pr-0">
              <div className="w-10 h-10 rounded-full bg-[#FAF5EB] border border-[#C9B28B]/50 flex items-center justify-center shrink-0 text-[#9E7D47] shadow-2xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-editorial text-lg sm:text-xl font-normal text-[#171513] tracking-tight">
                  100% <span className="italic">Proven</span>
                </h3>
                <p className="font-sans text-xs text-[#5C5449] leading-relaxed">
                  Physical atelier multi-point authentication inspection in Dhaka & New York. Permanent lifetime guarantee.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: "the story" EDITORIAL TWO-COLUMN SECTION                       */}
      {/* ========================================================================= */}
      <section className="border-b border-[#E8E2D8] bg-[#FAF8F5] py-20 lg:py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Column: Image + Story Headline + Narrative */}
            <div className="lg:col-span-6 space-y-8">
              <div className="relative overflow-hidden rounded-xs border border-[#E2DACD] shadow-sm aspect-[4/5] max-w-md mx-auto lg:mx-0 group">
                <img
                  src="https://innovecouture.vamtam.com/wp-content/uploads/2023/12/GettyImages-1402673175.jpg"
                  alt="One Vintage - The Story"
                  className="w-full h-full object-cover object-top group-hover:scale-103 transition-transform duration-700"
                />
              </div>

              <div className="space-y-4 max-w-lg">
                <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#171513] lowercase">
                  the <span className="italic">story</span>
                </h2>
                <p className="font-sans text-sm sm:text-base text-[#5C5449] leading-relaxed">
                  One Vintage is a distinctive luxury brand founded by Simone Myson in 2010. This avant-garde label ingeniously revitalizes antique textiles and relics, seamlessly weaving them into contemporary and modern masterpieces.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setCurrentView('SHOP');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-2 text-xs font-aeonik font-bold uppercase tracking-widest text-[#171513] border-b-2 border-[#171513] pb-1 hover:text-[#9E7D47] hover:border-[#9E7D47] transition-all cursor-pointer"
                  >
                    <span>Discover more</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Large High-Fashion Atmosphere Visual */}
            <div className="lg:col-span-6">
              <div className="relative overflow-hidden rounded-xs border border-[#E2DACD] shadow-md aspect-[4/5] group bg-[#EFE9DF]">
                <img
                  src="https://innovecouture.vamtam.com/wp-content/uploads/2023/12/GettyImages-1402673190.jpg"
                  alt="Runway Haute Couture Atelier"
                  className="w-full h-full object-cover object-center group-hover:scale-104 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-6 left-6 right-6 text-white text-xs font-mono uppercase tracking-widest flex items-center justify-between">
                  <span>Atelier Vault Archival</span>
                  <span>100% Provenance</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 4: "Fall collection" / "Cashmere — wool yarns" SPLIT SECTION     */}
      {/* ========================================================================= */}
      <section className="border-b border-[#E8E2D8] bg-[#FAF8F5] py-20 lg:py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Column: Image with floating "Cashmere — wool yarns" pill */}
            <div className="lg:col-span-6 relative">
              <div className="relative overflow-hidden rounded-xs border border-[#E2DACD] shadow-md aspect-[4/5] group bg-[#EFE9DF]">
                <img
                  src="https://innovecouture.vamtam.com/wp-content/uploads/2023/12/GettyImages-1402673190.jpg"
                  alt="Cashmere and wool yarns"
                  className="w-full h-full object-cover object-center group-hover:scale-104 transition-transform duration-700"
                />
                <div className="absolute bottom-6 left-6 z-10">
                  <span className="px-4 py-2 bg-white/90 backdrop-blur-md text-[#171513] border border-[#E2DACD] font-mono text-xs uppercase tracking-wider rounded-xs shadow-sm font-semibold">
                    Cashmere — wool yarns
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Collection details */}
            <div className="lg:col-span-6 space-y-6">
              <div className="text-xs font-mono tracking-[0.2em] uppercase text-[#9E7D47] font-semibold">
                Fall/Winter 23
              </div>

              <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#171513]">
                Fall <span className="italic font-normal">collection</span>
              </h2>

              <p className="font-sans text-sm sm:text-base text-[#5C5449] leading-relaxed max-w-xl">
                Our new Fall/Winter 2023 Collection features vibrant hues and varied textures in charming plaids and floral prints that pair back to easy-fitting and thoughtfully tailored silhouettes.
              </p>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setSelectedEra('ERA_90S');
                    setCurrentView('SHOP');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 text-xs font-aeonik font-bold uppercase tracking-widest text-[#171513] border-b-2 border-[#171513] pb-1 hover:text-[#9E7D47] hover:border-[#9E7D47] transition-all cursor-pointer"
                >
                  <span>Explore collection</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 5: EDITORIAL THREE-CARD SHOWCASE TRIPTYCH                         */}
      {/* ========================================================================= */}
      <section className="border-b border-[#E8E2D8] bg-white py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Top Quote */}
          <div className="text-center max-w-2xl mx-auto">
            <p className="font-editorial text-xl sm:text-2xl md:text-3xl text-[#171513] leading-relaxed italic font-normal">
              "Is about you being confident self, no matter what others say or think"
            </p>
          </div>

          {/* 3 Column Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Ready to wear */}
            <div
              onClick={() => {
                setSelectedCategory('cat_rtw');
                setCurrentView('SHOP');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="group cursor-pointer flex flex-col space-y-4"
            >
              <div className="relative overflow-hidden rounded-xs border border-[#E2DACD] aspect-[3/4] bg-[#F5EFE6]">
                <img
                  src="https://innovecouture.vamtam.com/wp-content/uploads/2023/12/farol-106-pnSxWxfVJs8-unsplash-705x1024.jpg"
                  alt="Ready to wear"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="flex items-center justify-between border-b border-[#E2DACD] pb-2">
                <span className="font-aeonik font-bold text-base uppercase tracking-wider text-[#171513] group-hover:text-[#9E7D47] transition-colors">
                  Ready to wear
                </span>
                <ArrowRight className="w-4 h-4 text-[#171513] group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 2: Accessories */}
            <div
              onClick={() => {
                setSelectedCategory('cat_accessories');
                setCurrentView('SHOP');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="group cursor-pointer flex flex-col space-y-4"
            >
              <div className="relative overflow-hidden rounded-xs border border-[#E2DACD] aspect-[3/4] bg-[#F5EFE6]">
                <img
                  src="https://innovecouture.vamtam.com/wp-content/uploads/2023/12/jonathan-sanchez-KTF4MPh6kos-unsplash-705x1024.jpg"
                  alt="Accessories"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="flex items-center justify-between border-b border-[#E2DACD] pb-2">
                <span className="font-aeonik font-bold text-base uppercase tracking-wider text-[#171513] group-hover:text-[#9E7D47] transition-colors">
                  Accessories
                </span>
                <ArrowRight className="w-4 h-4 text-[#171513] group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 3: On sale now */}
            <div
              onClick={() => {
                setSelectedCategory('cat_sale');
                setCurrentView('SHOP');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="group cursor-pointer flex flex-col space-y-4"
            >
              <div className="relative overflow-hidden rounded-xs border border-[#E2DACD] aspect-[3/4] bg-[#171513] flex items-center justify-center p-6 text-center">
                <div className="space-y-4 text-white">
                  <span className="inline-block px-3 py-1 bg-[#9B2226] text-white text-[10px] font-mono uppercase tracking-widest rounded-2xs font-bold">
                    Seasonal Archive
                  </span>
                  <div className="font-aeonik text-3xl font-bold tracking-tight">
                    Archival Grails On Sale
                  </div>
                  <p className="text-xs text-[#C9B28B] font-mono">
                    Special pricing on authenticated designer archive
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between border-b border-[#E2DACD] pb-2">
                <span className="font-aeonik font-bold text-base uppercase tracking-wider text-[#9B2226] group-hover:text-[#701D2B] transition-colors">
                  On sale now
                </span>
                <ArrowRight className="w-4 h-4 text-[#9B2226] group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* STYLE QUIZ: EDITORIAL AESTHETIC DISCOVERY SHOWCASE                       */}
      {/* ========================================================================= */}
      <section className="border-b border-[#E8E2D8] bg-[#171513] text-white py-14 sm:py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-[#1E1B18] to-black opacity-90 pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 bg-[#231F1C]/80 border border-[#C9B28B]/30 p-8 sm:p-12 rounded-xs shadow-xl">
            <div className="space-y-3.5 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 rounded-full text-[10px] font-mono tracking-widest uppercase text-[#C9B28B]">
                <Sparkles className="w-3.5 h-3.5 text-[#C9B28B]" />
                <span>Curated Archival Diagnostic</span>
              </div>
              <h3 className="font-editorial text-2xl sm:text-3xl lg:text-4xl text-white leading-tight font-normal">
                Which Archival Aesthetic <span className="italic font-light">Commands Your Silhouette?</span>
              </h3>
              <p className="text-xs sm:text-sm text-[#D5CFC6] leading-relaxed font-sans">
                Take our 60-second diagnostic to decode whether your style leans Minimalist Luxury (The Row, Lemaire), Cult Archive Streetwear (Raf Simons, Undercover), Savile Row Tailoring, or Avant-Garde Darkwear (Rick Owens, Margiela) — and receive direct authenticated vault recommendations.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono text-[#C9B28B]">
                <span className="px-2.5 py-1 bg-black/40 border border-[#C9B28B]/30 rounded-2xs">Minimalist Luxury</span>
                <span className="px-2.5 py-1 bg-black/40 border border-[#C9B28B]/30 rounded-2xs">Archive Streetwear</span>
                <span className="px-2.5 py-1 bg-black/40 border border-[#C9B28B]/30 rounded-2xs">Vintage Tailoring</span>
                <span className="px-2.5 py-1 bg-black/40 border border-[#C9B28B]/30 rounded-2xs">Avant-Garde Darkwear</span>
              </div>
            </div>

            <div className="shrink-0 w-full sm:w-auto">
              <button
                onClick={() => setIsStyleQuizOpen(true)}
                className="w-full sm:w-auto px-8 py-4 bg-[#C9B28B] hover:bg-[#D9C49F] text-[#171513] font-aeonik font-bold text-xs uppercase tracking-widest transition-all rounded-xs shadow-lg cursor-pointer flex items-center justify-center gap-2.5 group"
              >
                <Sparkles className="w-4 h-4 text-[#171513]" />
                <span>Take the Style Quiz</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 6: SUSTAINABILITY & "EVERY DETAIL MATTER"                         */}
      {/* ========================================================================= */}
      <section className="border-b border-[#E8E2D8] bg-[#FAF8F5] py-20 lg:py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="lg:col-span-5 space-y-6">
              <div className="text-xs font-mono tracking-[0.2em] uppercase text-[#9E7D47] font-semibold">
                Sustainability
              </div>

              <h2 className="font-classical text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-[0.08em] text-[#171513] uppercase">
                EVERY DETAIL MATTERS
              </h2>

              <p className="font-sans text-sm sm:text-base text-[#5C5449] leading-relaxed">
                Since 2012, Innove Couture products have been made to last across generations, with a no-compromises approach to quality.
              </p>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setCurrentView('SHOP');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 text-xs font-aeonik font-bold uppercase tracking-widest text-[#171513] border-b-2 border-[#171513] pb-1 hover:text-[#9E7D47] hover:border-[#9E7D47] transition-all cursor-pointer"
                >
                  <span>Explore Archive</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right Image: Craftsmanship Detail */}
            <div className="lg:col-span-7">
              <div className="relative overflow-hidden rounded-xs border border-[#E2DACD] shadow-md aspect-[16/9] group bg-[#EFE9DF]">
                <img
                  src="https://innovecouture.vamtam.com/wp-content/uploads/2023/12/GettyImages-1068216038.jpg"
                  alt="High-fashion craftsmanship"
                  className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-700"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 7: FLAGSHIP VAULT / PHYSICAL SHOWROOM LOCATION                    */}
      {/* ========================================================================= */}
      <section className="border-b border-[#E8E2D8] bg-white py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Location Info */}
            <div className="lg:col-span-5 space-y-6">
              <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#171513]">
                Innove Couture <span className="italic font-normal text-[#9E7D47]">Salons</span>
              </h2>

              <div className="space-y-2 text-[#5C5449] font-sans text-sm sm:text-base leading-relaxed">
                <p>217 Tueri Junction, New York, NY 10002</p>
                <p>House 42, Road 71, Gulshan-2, Dhaka 1212</p>
                <p className="font-mono text-xs text-[#7A7165]">10:00 am – 7:00 pm Daily</p>
              </div>

              <div className="pt-2">
                <a
                  href="https://maps.app.goo.gl/XwxmgqXeZwrbee8Y7"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-aeonik font-bold uppercase tracking-widest text-[#171513] border-b-2 border-[#171513] pb-1 hover:text-[#9E7D47] hover:border-[#9E7D47] transition-all cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#9E7D47]" />
                  <span>Get direction</span>
                </a>
              </div>
            </div>

            {/* Right Storefront Visual */}
            <div className="lg:col-span-7">
              <div className="relative overflow-hidden rounded-xs border border-[#E2DACD] shadow-md aspect-[16/9] group bg-[#EFE9DF]">
                <img
                  src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=80"
                  alt="Innove Couture Storefront"
                  className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-6 left-6 text-white text-xs font-mono uppercase tracking-widest">
                  VIP Fitting & Archival Consignment Salons
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
          </>
        )
      ) : (
        /* ========================================================================= */
        /* DEDICATED SHOP CATALOG VIEW ("What’s new" Archival Collection & Vault)   */
        /* ========================================================================= */
        <section id="catalog-vault" className="border-b border-[#E8E2D8] bg-white py-10 sm:py-16 min-h-[70vh]">
          {/* Top Breadcrumb Navigation Bar */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 pb-4 border-b border-[#E8E2D8] flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-[#7A7165]">
              <button
                onClick={() => {
                  setCurrentView('HOME');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-[#171513] transition-colors cursor-pointer"
              >
                Home
              </button>
              <span>/</span>
              <span className="text-[#171513] font-bold">Curated Vault Catalog</span>
              {selectedGender !== 'ALL' && (
                <>
                  <span>/</span>
                  <span className="text-[#9E7D47] font-semibold">{selectedGender}</span>
                </>
              )}
            </div>

            <button
              onClick={() => {
                setCurrentView('HOME');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-xs font-aeonik font-bold uppercase tracking-wider text-[#9E7D47] hover:text-[#171513] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>← Back to Editorial Home</span>
            </button>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header: "What's new" + "View all" */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-[#E8E2D8]">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#9E7D47] font-semibold mb-1">
                  Freshly Vaulted Consignments
                </div>
                <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#171513]">
                  What’s <span className="italic font-normal">new</span>
                </h2>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    setSelectedGender('ALL');
                    setSelectedCategory('ALL');
                    setSelectedCondition('ALL');
                    setSelectedEra('ALL');
                  }}
                  className="text-xs font-aeonik font-bold uppercase tracking-widest text-[#171513] border-b border-[#171513] pb-0.5 hover:text-[#9E7D47] hover:border-[#9E7D47] transition-all cursor-pointer"
                >
                  View all ({products.length})
                </button>
              </div>
            </div>

            {/* Department Filter Bar */}
            <div className="mb-8 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Department Segmented Controls */}
                <div className="flex items-center gap-1 p-1 bg-[#ECE5DB] rounded-xs border border-[#E0D7C9] w-fit">
                  <button
                    onClick={() => setSelectedGender('ALL')}
                    className={`px-4 py-1.5 text-xs font-mono uppercase tracking-wider rounded-2xs transition-all cursor-pointer ${
                      selectedGender === 'ALL'
                        ? 'bg-[#171513] text-[#FAF5EB] font-bold shadow-xs'
                        : 'text-[#5C5449] hover:text-[#171513]'
                    }`}
                  >
                    All Departments
                  </button>
                  <button
                    onClick={() => setSelectedGender('WOMEN')}
                    className={`px-4 py-1.5 text-xs font-mono uppercase tracking-wider rounded-2xs transition-all cursor-pointer ${
                      selectedGender === 'WOMEN'
                        ? 'bg-[#171513] text-[#FAF5EB] font-bold shadow-xs'
                        : 'text-[#5C5449] hover:text-[#171513]'
                    }`}
                  >
                    Women's Archival
                  </button>
                  <button
                    onClick={() => setSelectedGender('MEN')}
                    className={`px-4 py-1.5 text-xs font-mono uppercase tracking-wider rounded-2xs transition-all cursor-pointer ${
                      selectedGender === 'MEN'
                        ? 'bg-[#171513] text-[#FAF5EB] font-bold shadow-xs'
                        : 'text-[#5C5449] hover:text-[#171513]'
                    }`}
                  >
                    Men's Runway
                  </button>
                </div>

                {/* Category / Condition / Sort Dropdowns */}
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-1.5 text-xs font-mono bg-[#FAF8F5] text-[#171513] border border-[#DED7CB] hover:border-[#9E7D47] rounded-xs focus:outline-none focus:border-[#171513] transition-colors shadow-2xs"
                  >
                    <option value="ALL">All Categories</option>
                    {TAXONOMY.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedCondition}
                    onChange={(e) => setSelectedCondition(e.target.value)}
                    className="px-3 py-1.5 text-xs font-mono bg-[#FAF8F5] text-[#171513] border border-[#DED7CB] hover:border-[#9E7D47] rounded-xs focus:outline-none focus:border-[#171513] transition-colors shadow-2xs"
                  >
                    <option value="ALL">All Condition Grades</option>
                    <option value="BRAND_NEW_WITH_TAGS">Brand New w/ Tags</option>
                    <option value="EXCELLENT">Excellent Vintage</option>
                    <option value="GENTLY_USED">Gently Used</option>
                    <option value="VINTAGE_FLAWS">Vintage Patina</option>
                  </select>

                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="px-3 py-1.5 text-xs font-mono bg-[#FAF8F5] text-[#171513] border border-[#DED7CB] hover:border-[#9E7D47] rounded-xs focus:outline-none focus:border-[#171513] transition-colors shadow-2xs"
                  >
                    <option value="featured">Sort: Curated Vault</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="newest">Recently Listed</option>
                  </select>
                </div>
              </div>

              {/* Active Filters Bar */}
              {(selectedCategory !== 'ALL' || selectedCondition !== 'ALL' || selectedEra !== 'ALL' || selectedGender !== 'ALL') && (
                <div className="flex items-center gap-2 text-xs font-mono text-[#7A7165] pt-1">
                  <span>Active filters:</span>
                  {selectedGender !== 'ALL' && <span className="text-[#171513] font-bold">{selectedGender}</span>}
                  {selectedCategory !== 'ALL' && (
                    <span>· {TAXONOMY.find((t) => t.id === selectedCategory)?.name || selectedCategory}</span>
                  )}
                  {selectedCondition !== 'ALL' && <span>· {selectedCondition.replace(/_/g, ' ')}</span>}
                  <button
                    onClick={() => {
                      setSelectedGender('ALL');
                      setSelectedCategory('ALL');
                      setSelectedCondition('ALL');
                      setSelectedEra('ALL');
                    }}
                    className="ml-2 text-[11px] underline text-[#9E7D47] hover:text-[#171513] cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                </div>
              )}
            </div>

            {/* Products Loop Grid (4 columns matching the template) */}
            {isLoadingProducts ? (
              <div className="py-24 text-center">
                <RefreshCw className="w-6 h-6 animate-spin text-[#9E7D47] mx-auto mb-3" />
                <p className="text-xs font-mono text-[#7A7165] uppercase tracking-widest">
                  Synchronizing Consignment Relational State...
                </p>
              </div>
            ) : products.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-[#DDD5C7] rounded-xs p-8 bg-[#FAF8F5]/80">
                <Archive className="w-10 h-10 text-[#9E7D47] mx-auto mb-3 stroke-1" />
                <h3 className="font-aeonik text-lg font-bold text-[#171513]">
                  No Pieces Match the Selected Filter Criteria
                </h3>
                <p className="text-xs text-[#7A7165] font-mono mt-1 mb-4">
                  Try adjusting your category, condition grade, or era filters.
                </p>
                <button
                  onClick={() => {
                    setSelectedGender('ALL');
                    setSelectedCategory('ALL');
                    setSelectedCondition('ALL');
                    setSelectedEra('ALL');
                  }}
                  className="px-5 py-2.5 bg-[#171513] text-[#FAF5EB] hover:bg-[#9E7D47] text-xs font-mono uppercase tracking-wider font-bold transition-colors shadow-xs"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={(p) => setSelectedProduct(p)}
                    isWishlisted={wishlist.some((w) => w.id === product.id)}
                    onToggleWishlist={handleToggleWishlist}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* SECTION 8: TEMPLATE-MATCHING FOOTER (Newsletter, Links, Legal)            */}
      {/* ========================================================================= */}
      <footer className="border-t border-[#E0D7C9] bg-[#FAF8F5] pt-16 pb-12 text-[#5C5449] font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Row 1: Brand Wordmark + Newsletter Subscription */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-12 border-b border-[#E8E2D8]">
            {/* Wordmark & Brand Logo */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <img
                src="/assets/sairat-couture-logo.png"
                alt="SAIRAT COUTURE"
                className="h-11 sm:h-12 w-auto max-w-[220px] sm:max-w-[260px] object-contain filter drop-shadow-[0_1px_2px_rgba(23,21,19,0.35)]"
              />
              <div className="border-l-0 sm:border-l sm:border-[#DDD5C7] sm:pl-4">
                <p className="text-xs text-[#7A7165] font-mono">
                  Luxury Resale Vault · New York · Paris · Dhaka
                </p>
                <p className="text-[11px] text-[#9E7D47] font-mono mt-0.5">
                  1-of-1 Authenticated Runway Relics
                </p>
              </div>
            </div>

            {/* Newsletter Form */}
            <div className="w-full lg:max-w-md space-y-3">
              <p className="text-xs font-aeonik font-bold uppercase tracking-wider text-[#171513]">
                Sign Up to Get 10% Off Your First Order
              </p>

              {newsletterSubmitted ? (
                <div className="p-3 bg-[#FAF5EB] border border-[#C9B28B]/40 text-[#1A4231] text-xs font-mono rounded-xs">
                  ✓ Thank you. Your 10% archival welcome code has been sent.
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (newsletterEmail.trim()) {
                      setNewsletterSubmitted(true);
                    }
                  }}
                  className="flex items-center border border-[#DED7CB] focus-within:border-[#171513] bg-white rounded-xs overflow-hidden transition-colors"
                >
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    className="w-full px-4 py-2.5 text-xs text-[#171513] placeholder-[#8C8377] bg-transparent focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-[#171513] text-white hover:bg-[#9E7D47] transition-colors cursor-pointer shrink-0"
                    aria-label="Subscribe"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Row 2: Navigation Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-aeonik font-bold uppercase tracking-widest text-[#524B43]">
            <button
              onClick={() => {
                setCurrentView('SHOP');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-[#171513] transition-colors cursor-pointer"
            >
              Shop
            </button>
            <button
              onClick={() => {
                setCurrentView('HOME');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-[#171513] transition-colors cursor-pointer"
            >
              Maison
            </button>
            <button
              onClick={() => {
                setTrackingInitialQuery('');
                setIsOrderTrackingOpen(true);
              }}
              className="hover:text-[#171513] transition-colors cursor-pointer"
            >
              Delivery &amp; Returns
            </button>
            <button
              onClick={() => {
                setTrackingInitialQuery('');
                setIsOrderTrackingOpen(true);
              }}
              className="hover:text-[#171513] transition-colors cursor-pointer"
            >
              Order Status
            </button>
          </div>

          {/* Row 3: Socials & Copyright */}
          <div className="pt-8 border-t border-[#E8E2D8] flex flex-col sm:flex-row items-center justify-between text-xs text-[#7A7165] font-mono gap-4">
            <div className="flex items-center gap-6">
              <a
                href="https://www.instagram.com/innovecouture.vamtam/"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#171513] transition-colors"
              >
                Instagram
              </a>
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#171513] transition-colors"
              >
                Facebook
              </a>
              <a
                href="https://www.pinterest.com/"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#171513] transition-colors"
              >
                Pinterest
              </a>
            </div>

            <div className="flex items-center gap-4 text-[11px]">
              <span>© {new Date().getFullYear()} SAIRAT COUTURE. All rights reserved.</span>
              <span>·</span>
              <button
                onClick={() => {
                  setTrackingInitialQuery('');
                  setIsOrderTrackingOpen(true);
                }}
                className="hover:text-[#171513] underline cursor-pointer"
              >
                Consignment Policies
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* VIDEO LIGHTBOX MODAL (Plays the template's campaign film)                 */}
      {/* ========================================================================= */}
      {isVideoModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsVideoModalOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl bg-black rounded-xs overflow-hidden shadow-2xl border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#141210] text-white">
              <span className="font-aeonik text-xs font-bold uppercase tracking-widest text-[#FAF5EB]">
                Innove Couture Campaign Reel · Cottonbro Studio
              </span>
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer rounded-xs"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video w-full bg-black">
              <video
                src="https://innovecouture.vamtam.com/wp-content/uploads/2023/12/pexels-cottonbro-9836597-2160p.mp4"
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Slide-over Shopping Bag Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onRemoveItem={handleRemoveFromCart}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Slide-over Saved Wishlist Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        items={wishlist}
        onRemoveItem={handleToggleWishlist}
        onSelectProduct={(p) => setSelectedProduct(p)}
        onAddToCart={handleAddToCart}
      />

      {/* Predictive Real-time Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={products}
        onSelectProduct={(p) => setSelectedProduct(p)}
      />

      {/* Resale Product Detail Modal (PDP) */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          isWishlisted={wishlist.some((w) => w.id === selectedProduct.id)}
          onToggleWishlist={handleToggleWishlist}
          isAddingToBag={isAddingToBag}
          allProducts={products}
          onSelectProduct={(p) => setSelectedProduct(p)}
          onProductPriceUpdated={(updatedProduct) => {
            setProducts((prev) =>
              prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
            );
            setSelectedProduct(updatedProduct);
          }}
        />
      )}

      {/* Checkout Modal (Address, Card Simulation & Order Receipt) */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        onOrderCompleted={handleOrderCompleted}
        onTrackOrder={(orderNum) => {
          setTrackingInitialQuery(orderNum);
          setIsOrderTrackingOpen(true);
        }}
      />

      {/* Order Tracking & Provenance Modal */}
      <OrderTracking
        isOpen={isOrderTrackingOpen}
        onClose={() => setIsOrderTrackingOpen(false)}
        initialQuery={trackingInitialQuery}
      />

      {/* User Profile & Preferences Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userId={userId}
        currentProfile={userProfile}
        onSaveProfile={handleUpdateUserProfile}
      />

      {/* Archival Style Diagnostic Quiz Modal */}
      <StyleQuizModal
        isOpen={isStyleQuizOpen}
        onClose={() => setIsStyleQuizOpen(false)}
        products={products}
        onSelectProduct={(p) => setSelectedProduct(p)}
        onAddToCart={handleAddToCart}
        onExploreAestheticShop={handleExploreAestheticShop}
      />

      {/* Realtime Price Drop Toast Notification System */}
      <PriceDropToast
        products={products}
        onSelectProduct={(p) => setSelectedProduct(p)}
      />
    </div>
  );
}
