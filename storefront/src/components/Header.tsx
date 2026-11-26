import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  ShoppingBag,
  Heart,
  Headphones,
  User,
  ChevronDown,
  Menu,
  X,
  ArrowRight,
  ShieldCheck,
  Truck,
  Database,
  SlidersHorizontal,
  Sparkles,
  Phone,
  Mail,
  HelpCircle,
  Clock,
  ExternalLink,
  Settings
} from 'lucide-react';
import { Gender, UserProfile, UserGender, StorefrontConfig } from '../types/resale';

interface HeaderProps {
  currentGender: Gender | 'ALL';
  currentView?: 'HOME' | 'SHOP';
  onSelectView?: (view: 'HOME' | 'SHOP') => void;
  onSelectGender: (gender: Gender | 'ALL') => void;
  onSelectCategory: (categoryId: string) => void;
  onOpenSearch: () => void;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenOrderTracking: () => void;
  onSearchQuery?: (query: string) => void;
  userProfile?: UserProfile;
  onOpenProfileModal?: () => void;
  onQuickUpdateProfile?: (updates: Partial<UserProfile>) => void;
  cartCount: number;
  cartRemainingSeconds?: number | null;
  wishlistCount: number;
  storefrontConfig?: StorefrontConfig | null;
  onOpenStyleQuiz?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentGender,
  currentView = 'HOME',
  onSelectView,
  onSelectGender,
  onSelectCategory,
  onOpenSearch,
  onOpenCart,
  onOpenWishlist,
  onOpenOrderTracking,
  onSearchQuery,
  userProfile,
  onOpenProfileModal,
  onQuickUpdateProfile,
  cartCount,
  wishlistCount,
  storefrontConfig,
  onOpenStyleQuiz
}) => {
  const [activeMegaMenu, setActiveMegaMenu] = useState<'SHOP' | 'WOMEN' | 'MEN' | 'SALE' | 'BRANDS' | null>('WOMEN');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [helpDropdownOpen, setHelpDropdownOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const menuTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const handleMouseEnter = (menu: 'SHOP' | 'WOMEN' | 'MEN' | 'SALE' | 'BRANDS') => {
    if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
    setActiveMegaMenu(menu);
  };

  const handleMouseLeave = () => {
    menuTimeoutRef.current = setTimeout(() => {
      setActiveMegaMenu(null);
    }, 240);
  };

  useEffect(() => {
    return () => {
      if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
    };
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setHelpDropdownOpen(false);
        setAccountDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSelectView) onSelectView('SHOP');
    if (searchInput.trim()) {
      if (onSearchQuery) {
        onSearchQuery(searchInput.trim());
      } else {
        onOpenSearch();
      }
    } else {
      onOpenSearch();
    }
  };

  // Women Category Click Handler
  const handleWomenCategoryClick = (categoryId: string) => {
    onSelectGender('WOMEN');
    onSelectCategory(categoryId);
    setActiveMegaMenu(null);
    if (onSelectView) onSelectView('SHOP');
    const catalogElem = document.getElementById('catalog-vault');
    if (catalogElem) {
      catalogElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Men Category Click Handler
  const handleMenCategoryClick = (categoryId: string) => {
    onSelectGender('MEN');
    onSelectCategory(categoryId);
    setActiveMegaMenu(null);
    if (onSelectView) onSelectView('SHOP');
    const catalogElem = document.getElementById('catalog-vault');
    if (catalogElem) {
      catalogElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Live Storefront Announcement Ticker Bar */}
      {storefrontConfig?.isAnnouncementVisible !== false && storefrontConfig?.announcementText && (
        <div className="bg-[#171513] text-[#FAF5EB] text-[11px] font-mono tracking-wider py-2 px-4 text-center border-b border-[#2C2925] flex items-center justify-center gap-2 sm:gap-4 relative z-50">
          <span className="w-1.5 h-1.5 rounded-full bg-[#9E7D47] animate-pulse shrink-0"></span>
          <span className="font-medium tracking-wide">{storefrontConfig.announcementText}</span>
          {storefrontConfig.insideDhakaDeliveryFeeBDT !== undefined && (
            <span className="hidden md:inline-flex items-center gap-2 text-[#A69E93] text-[10px] pl-3 border-l border-[#3D3833]">
              <span>Dhaka: ৳{storefrontConfig.insideDhakaDeliveryFeeBDT}</span>
              <span>•</span>
              <span>Nationwide: ৳{storefrontConfig.outsideDhakaDeliveryFeeBDT}</span>
            </span>
          )}
        </div>
      )}

      {/* Main Sticky Header */}
      <header
        ref={dropdownRef}
        className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E8E2D8] transition-all font-sans shadow-[0_2px_12px_rgba(23,21,19,0.03)]"
        onMouseLeave={handleMouseLeave}
      >
        {/* Tier 1: Logo, Search Bar & Utility Icons */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4 sm:gap-8">
          {/* Brand Wordmark (Natural, Eye-Attracting Classical Haute-Couture Typography) */}
          <div className="flex items-center shrink-0">
            <button
              onClick={() => {
                onSelectGender('ALL');
                onSelectCategory('ALL');
                setActiveMegaMenu(null);
                if (onSelectView) onSelectView('HOME');
              }}
              className="text-left group cursor-pointer focus:outline-none flex items-center gap-2.5"
              aria-label="Sairat Couture Home"
            >
              <img
                src="/assets/sairat-couture-logo.png"
                alt="SAIRAT COUTURE"
                className="h-9 sm:h-10 md:h-11 w-auto max-w-[190px] sm:max-w-[230px] md:max-w-[260px] object-contain filter drop-shadow-[0_1px_2px_rgba(23,21,19,0.35)] group-hover:scale-[1.02] transition-transform"
              />
              <span className="hidden xl:inline-block text-[9px] font-mono tracking-widest uppercase text-[#9E7D47] px-1.5 py-0.5 bg-[#FAF5EB] border border-[#C9B28B]/30 rounded-xs">
                Vault
              </span>
            </button>
          </div>

          {/* Centered Search Bar */}
          <div className="flex-1 max-w-lg hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search archival grails, brands, outerwear..."
                className="w-full pl-9 pr-4 py-2 text-xs text-[#171513] placeholder-[#8A8175] bg-[#FAF7F2] hover:bg-white border border-[#E2DCD2] hover:border-[#C9B28B] rounded-xs focus:outline-none focus:border-[#171513] focus:bg-white transition-all shadow-2xs"
              />
              <Search
                className="w-4 h-4 text-[#8A8175] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              />
            </form>
          </div>

          {/* Right Utilities (24/7 Help, Your Account, Wishlist, Bag) */}
          <div className="flex items-center gap-3 sm:gap-6 text-xs text-[#524B43] font-medium">
            {/* 24/7 Help Dropdown */}
            <div className="relative hidden lg:block">
              <button
                type="button"
                onClick={() => {
                  setHelpDropdownOpen(!helpDropdownOpen);
                  setAccountDropdownOpen(false);
                }}
                className="flex items-center gap-1.5 hover:text-[#171513] cursor-pointer uppercase text-[11px] tracking-wider py-1 transition-colors"
              >
                <Headphones className="w-3.5 h-3.5 text-[#7A7165]" />
                <span>24/7 HELP</span>
                <ChevronDown className="w-3 h-3 text-[#A69E93]" />
              </button>
              {helpDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-[#E5DFD5] shadow-xl rounded-xs p-4 text-xs space-y-3 z-50 animate-in fade-in">
                  <div className="border-b border-[#F0EAE1] pb-2">
                    <span className="text-[10px] text-[#8C8377] uppercase font-mono block font-bold">Dhaka VIP Concierge</span>
                    <strong className="text-[#171513] block mt-0.5 font-sans font-bold">
                      {storefrontConfig?.conciergePhone || '+880 1711-982341'}
                    </strong>
                    <span className="text-[10px] text-[#7A7165]">24/7 WhatsApp & Voice Support</span>
                  </div>
                  <div className="space-y-1.5 text-[11px] text-[#524B43]">
                    <button
                      onClick={() => {
                        onOpenOrderTracking();
                        setHelpDropdownOpen(false);
                      }}
                      className="w-full text-left hover:text-[#9E7D47] block py-1 cursor-pointer transition-colors"
                    >
                      • Track Active Parcel via Courier
                    </button>
                    <div className="text-[#7A7165]">• Same-Day Dhaka Hand Delivery</div>
                    <div className="text-[#7A7165]">• 100% Genuine Resale Vault Guarantee</div>
                  </div>
                </div>
              )}
            </div>

            {/* Your Account Dropdown */}
            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={() => {
                  setAccountDropdownOpen(!accountDropdownOpen);
                  setHelpDropdownOpen(false);
                }}
                className="flex items-center gap-1.5 hover:text-[#171513] cursor-pointer uppercase text-[11px] tracking-wider py-1 transition-colors"
              >
                <User className="w-3.5 h-3.5 text-[#7A7165]" />
                <span>YOUR ACCOUNT</span>
              </button>

              {accountDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E5DFD5] shadow-xl rounded-xs p-3 text-xs space-y-2 z-50 animate-in fade-in">
                  <div className="border-b border-[#F0EAE1] pb-2">
                    <span className="text-[10px] text-[#8C8377] uppercase font-mono font-bold block">Account & Preferences</span>
                    <div className="text-[#171513] font-bold font-sans flex items-center justify-between">
                      <span>{userProfile?.name || 'VIP Client Session'}</span>
                      <span className="text-[9px] font-mono text-[#9E7D47] px-1 py-0.2 bg-[#FAF5EB] rounded-2xs border border-[#C9B28B]/30">
                        {userProfile?.gender || 'UNSPECIFIED'}
                      </span>
                    </div>

                    {/* Quick Gender Preference Selector */}
                    <div className="mt-2 pt-2 border-t border-[#F5EFE6]">
                      <div className="flex items-center justify-between text-[10px] font-mono text-[#7A7165] mb-1">
                        <span>GENDER PREFERENCE:</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        {(['WOMEN', 'MEN', 'UNSPECIFIED'] as const).map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => onQuickUpdateProfile?.({ gender: g })}
                            className={`py-1 text-[9px] font-mono rounded-2xs transition-colors cursor-pointer ${
                              userProfile?.gender === g
                                ? 'bg-[#171513] text-[#FAF5EB] font-bold'
                                : 'bg-[#FAF8F5] text-[#5C5449] hover:bg-[#EFE9DF]'
                            }`}
                          >
                            {g === 'UNSPECIFIED' ? 'ALL' : g}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quick Preferred Home Selector */}
                    <div className="mt-2 pt-1.5 border-t border-[#F5EFE6]">
                      <div className="flex items-center justify-between text-[10px] font-mono text-[#7A7165] mb-1">
                        <span>DEFAULT HOME:</span>
                        <span className="text-[#9E7D47] font-bold">{userProfile?.preferredHome || 'HOME'}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        <button
                          type="button"
                          onClick={() => onQuickUpdateProfile?.({ preferredHome: 'HOME' })}
                          className={`py-1 text-[9px] font-mono rounded-2xs transition-colors cursor-pointer ${
                            (userProfile?.preferredHome || 'HOME') === 'HOME'
                              ? 'bg-[#171513] text-[#FAF5EB] font-bold'
                              : 'bg-[#FAF8F5] text-[#5C5449] hover:bg-[#EFE9DF]'
                          }`}
                        >
                          Story Home
                        </button>
                        <button
                          type="button"
                          onClick={() => onQuickUpdateProfile?.({ preferredHome: 'SHOP' })}
                          className={`py-1 text-[9px] font-mono rounded-2xs transition-colors cursor-pointer ${
                            userProfile?.preferredHome === 'SHOP'
                              ? 'bg-[#171513] text-[#FAF5EB] font-bold'
                              : 'bg-[#FAF8F5] text-[#5C5449] hover:bg-[#EFE9DF]'
                          }`}
                        >
                          Shop Catalog
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onOpenProfileModal?.();
                      setAccountDropdownOpen(false);
                    }}
                    className="w-full text-left py-1 hover:text-[#9E7D47] text-[#171513] font-medium cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <span>Manage Profile & Details</span>
                    <Settings className="w-3.5 h-3.5 text-[#9E7D47]" />
                  </button>

                  <button
                    onClick={() => {
                      onOpenOrderTracking();
                      setAccountDropdownOpen(false);
                    }}
                    className="w-full text-left py-1 hover:text-[#9E7D47] text-[#524B43] cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <span>My Consignments & Orders</span>
                    <Truck className="w-3 h-3 text-[#9E7D47]" />
                  </button>
                  <button
                    onClick={() => {
                      onOpenWishlist();
                      setAccountDropdownOpen(false);
                    }}
                    className="w-full text-left py-1 hover:text-[#9E7D47] text-[#524B43] cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <span>Saved Wishlist ({wishlistCount})</span>
                    <Heart className="w-3 h-3 text-[#9E7D47]" />
                  </button>
                  {onOpenStyleQuiz && (
                    <button
                      onClick={() => {
                        onOpenStyleQuiz();
                        setAccountDropdownOpen(false);
                      }}
                      className="w-full text-left py-1 hover:text-[#9E7D47] text-[#524B43] cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <span className="flex items-center gap-1.5 font-semibold text-[#8B6E3D]">
                        <Sparkles className="w-3 h-3 text-[#9E7D47]" />
                        <span>Style Diagnostic Quiz</span>
                      </span>
                      <span className="text-[9px] font-mono uppercase bg-[#FAF5EB] text-[#9E7D47] px-1 rounded-2xs border border-[#C9B28B]/30">Aesthetic</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Wishlist Button */}
            <button
              type="button"
              onClick={onOpenWishlist}
              className="flex items-center gap-1.5 hover:text-[#171513] cursor-pointer uppercase text-[11px] tracking-wider py-1 relative transition-colors"
              title="Saved Items"
            >
              <Heart className="w-3.5 h-3.5 text-[#7A7165]" />
              <span className="hidden sm:inline">WISHLIST</span>
              {wishlistCount > 0 && (
                <span className="bg-[#9E7D47] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Bag Drawer Trigger */}
            <button
              type="button"
              onClick={onOpenCart}
              className="flex items-center gap-1.5 hover:text-[#171513] cursor-pointer uppercase text-[11px] tracking-wider py-1 font-bold transition-colors"
              title="Shopping Bag"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 text-[#171513]" />
                <span className="absolute -top-1.5 -right-2 bg-[#171513] text-[#FAF5EB] text-[9px] min-w-3.5 h-3.5 px-0.5 rounded-full flex items-center justify-center font-mono border border-[#C9B28B]/50">
                  {cartCount}
                </span>
              </div>
            </button>

            {/* Mobile Search Button */}
            <button
              onClick={onOpenSearch}
              className="md:hidden p-1.5 text-[#524B43] hover:text-[#171513] cursor-pointer"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Mobile Drawer Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 text-[#524B43] hover:text-[#171513] cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Tier 2: Main Navigation Bar (HOME, SHOP, WOMEN, MEN, SALE, BRANDS, BLOG) */}
        <div className="border-t border-[#EFE9E0] bg-[#FAF8F5]/90 backdrop-blur-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center justify-center gap-6 sm:gap-10 text-[12px] font-medium tracking-widest uppercase text-[#524B43] overflow-x-auto no-scrollbar">
              {/* HOME */}
              <button
                onClick={() => {
                  onSelectGender('ALL');
                  onSelectCategory('ALL');
                  setActiveMegaMenu(null);
                  if (onSelectView) onSelectView('HOME');
                }}
                className={`py-3.5 hover:text-[#171513] transition-colors border-b-2 cursor-pointer ${
                  currentView === 'HOME' && activeMegaMenu === null
                    ? 'border-[#171513] text-[#171513] font-bold'
                    : 'border-transparent'
                }`}
              >
                HOME
              </button>

              {/* SHOP */}
              <button
                onClick={() => {
                  onSelectCategory('ALL');
                  setActiveMegaMenu(null);
                  if (onSelectView) onSelectView('SHOP');
                }}
                onMouseEnter={() => handleMouseEnter('SHOP')}
                className={`py-3.5 hover:text-[#171513] transition-colors border-b-2 cursor-pointer ${
                  currentView === 'SHOP' && currentGender === 'ALL' && activeMegaMenu === null
                    ? 'border-[#171513] text-[#171513] font-bold'
                    : 'border-transparent'
                }`}
              >
                SHOP
              </button>

              {/* WOMEN */}
              <button
                onClick={() => {
                  onSelectGender('WOMEN');
                  onSelectCategory('ALL');
                  setActiveMegaMenu(activeMegaMenu === 'WOMEN' ? null : 'WOMEN');
                  if (onSelectView) onSelectView('HOME');
                }}
                onMouseEnter={() => handleMouseEnter('WOMEN')}
                className={`py-3.5 hover:text-[#171513] transition-colors border-b-2 cursor-pointer font-bold ${
                  currentGender === 'WOMEN'
                    ? 'border-[#171513] text-[#171513]'
                    : 'border-transparent'
                }`}
              >
                WOMEN
              </button>

              {/* MEN */}
              <button
                onClick={() => {
                  onSelectGender('MEN');
                  onSelectCategory('ALL');
                  setActiveMegaMenu(activeMegaMenu === 'MEN' ? null : 'MEN');
                  if (onSelectView) onSelectView('HOME');
                }}
                onMouseEnter={() => handleMouseEnter('MEN')}
                className={`py-3.5 hover:text-[#171513] transition-colors border-b-2 cursor-pointer ${
                  currentGender === 'MEN'
                    ? 'border-[#171513] text-[#171513] font-bold'
                    : 'border-transparent'
                }`}
              >
                MEN
              </button>

              {/* SALE */}
              <button
                onClick={() => {
                  onSelectCategory('cat_sale');
                  setActiveMegaMenu(null);
                  if (onSelectView) onSelectView('SHOP');
                }}
                className="py-3.5 text-[#9B2226] hover:text-[#701D2B] transition-colors border-b-2 border-transparent font-bold cursor-pointer"
              >
                SALE
              </button>

              {/* BRANDS */}
              <button
                onClick={() => {
                  onOpenSearch();
                  setActiveMegaMenu(null);
                }}
                className="py-3.5 hover:text-[#171513] transition-colors border-b-2 border-transparent cursor-pointer"
              >
                BRANDS
              </button>

              {/* STYLE QUIZ / AESTHETIC FINDER */}
              {onOpenStyleQuiz && (
                <button
                  onClick={() => {
                    setActiveMegaMenu(null);
                    onOpenStyleQuiz();
                  }}
                  className="py-3.5 hover:text-[#171513] text-[#8B6E3D] transition-colors border-b-2 border-transparent cursor-pointer font-bold inline-flex items-center gap-1.5 group"
                  title="Discover your archival fashion aesthetic"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#9E7D47] group-hover:rotate-12 transition-transform" />
                  <span>STYLE QUIZ</span>
                  <span className="hidden xl:inline text-[9px] font-mono uppercase bg-[#FAF5EB] text-[#9E7D47] px-1 py-0.2 rounded-2xs border border-[#C9B28B]/40">
                    FIND AESTHETIC
                  </span>
                </button>
              )}

              {/* BLOG / ARCHIVE STORIES */}
              <button
                onClick={() => {
                  setActiveMegaMenu(null);
                  const el = document.getElementById('curated-stories');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="py-3.5 hover:text-[#171513] transition-colors border-b-2 border-transparent cursor-pointer"
              >
                BLOG
              </button>
            </nav>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* LUXURY MEGA MENU DROPDOWN (Matches uploaded user screenshot for WOMEN)   */}
        {/* ========================================================================= */}
        {activeMegaMenu === 'WOMEN' && (
          <div
            className="absolute left-0 w-full bg-[#FCFBF8] border-b border-[#E2DACD] shadow-[0_20px_45px_rgba(23,21,19,0.08)] transition-all animate-in fade-in duration-200 z-50 text-[#171513]"
            onMouseEnter={() => {
              if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
            }}
            onMouseLeave={handleMouseLeave}
          >
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-9">
              <div className="grid grid-cols-12 gap-6 lg:gap-8 items-start">
                {/* Column 1: READY TO WEAR */}
                <div className="col-span-2 space-y-3.5">
                  <h3 className="text-[12px] font-bold text-[#171513] tracking-wider uppercase font-aeonik">
                    READY TO WEAR
                  </h3>
                  <ul className="space-y-2.5 text-[11px] text-[#6B6357] font-medium">
                    <li>
                      <button
                        onClick={() => handleWomenCategoryClick('cat_tops')}
                        className="hover:text-[#9E7D47] transition-colors uppercase text-left block cursor-pointer"
                      >
                        TOPS
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleWomenCategoryClick('cat_denim')}
                        className="hover:text-[#9E7D47] transition-colors uppercase text-left block cursor-pointer"
                      >
                        DENIM
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleWomenCategoryClick('cat_dresses')}
                        className="hover:text-[#9E7D47] transition-colors uppercase text-left block cursor-pointer"
                      >
                        DRESSES
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleWomenCategoryClick('cat_outerwear')}
                        className="hover:text-[#9E7D47] transition-colors uppercase text-left block cursor-pointer"
                      >
                        JACKETS & COATS
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleWomenCategoryClick('cat_knitwear')}
                        className="hover:text-black transition-colors uppercase text-left block cursor-pointer"
                      >
                        KNITWEAR
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleWomenCategoryClick('cat_trousers')}
                        className="hover:text-black transition-colors uppercase text-left block cursor-pointer"
                      >
                        TROUSERS
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleWomenCategoryClick('cat_skirts')}
                        className="hover:text-black transition-colors uppercase text-left block cursor-pointer"
                      >
                        SKIRTS
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleWomenCategoryClick('cat_tops')}
                        className="hover:text-black transition-colors uppercase text-left block cursor-pointer"
                      >
                        T-SHIRTS & SWEATSHIRTS
                      </button>
                    </li>
                    <li className="pt-1 border-t border-neutral-100">
                      <button
                        onClick={() => handleWomenCategoryClick('cat_rtw')}
                        className="hover:text-black font-semibold text-neutral-900 uppercase text-left block cursor-pointer"
                      >
                        VIEW ALL
                      </button>
                    </li>
                  </ul>
                </div>

                {/* Column 2: ACCESSORIES */}
                <div className="col-span-2 space-y-3.5">
                  <h3 className="text-[12px] font-bold text-neutral-900 tracking-wider uppercase font-sans">
                    ACCESSORIES
                  </h3>
                  <ul className="space-y-2.5 text-[11px] text-neutral-600 font-medium">
                    <li>
                      <button
                        onClick={() => handleWomenCategoryClick('cat_bags')}
                        className="hover:text-black transition-colors uppercase text-left block cursor-pointer"
                      >
                        BAGS
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleWomenCategoryClick('cat_belts')}
                        className="hover:text-black transition-colors uppercase text-left block cursor-pointer"
                      >
                        BELTS
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleWomenCategoryClick('cat_eyewear')}
                        className="hover:text-black transition-colors uppercase text-left block cursor-pointer"
                      >
                        EYEWEAR
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleWomenCategoryClick('cat_scarves')}
                        className="hover:text-black transition-colors uppercase text-left block cursor-pointer"
                      >
                        HATS & SCARVES
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleWomenCategoryClick('cat_footwear')}
                        className="hover:text-black transition-colors uppercase text-left block cursor-pointer"
                      >
                        SHOES
                      </button>
                    </li>
                    <li className="pt-1 border-t border-neutral-100">
                      <button
                        onClick={() => handleWomenCategoryClick('cat_accessories')}
                        className="hover:text-black font-semibold text-neutral-900 uppercase text-left block cursor-pointer"
                      >
                        VIEW ALL
                      </button>
                    </li>
                  </ul>
                </div>

                {/* Column 3: GIFTS */}
                <div className="col-span-2 space-y-3.5">
                  <h3 className="text-[12px] font-bold text-neutral-900 tracking-wider uppercase font-sans">
                    GIFTS
                  </h3>
                  <ul className="space-y-2.5 text-[11px] text-neutral-600 font-medium">
                    <li>
                      <button
                        onClick={() => handleWomenCategoryClick('ALL')}
                        className="hover:text-black transition-colors uppercase text-left block cursor-pointer"
                      >
                        GIFTS FOR HER
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => {
                          onOpenSearch();
                          setActiveMegaMenu(null);
                        }}
                        className="hover:text-black transition-colors uppercase text-left block cursor-pointer"
                      >
                        GIFT CARD
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleWomenCategoryClick('cat_under_100')}
                        className="hover:text-black transition-colors uppercase text-left block cursor-pointer"
                      >
                        GIFTS UNDER $100
                      </button>
                    </li>
                    <li className="pt-1 border-t border-neutral-100">
                      <button
                        onClick={() => handleWomenCategoryClick('ALL')}
                        className="hover:text-black font-semibold text-neutral-900 uppercase text-left block cursor-pointer"
                      >
                        VIEW ALL
                      </button>
                    </li>
                  </ul>
                </div>

                {/* Column 4: DISCOVER */}
                <div className="col-span-2 space-y-3.5">
                  <h3 className="text-[12px] font-bold text-neutral-900 tracking-wider uppercase font-sans">
                    DISCOVER
                  </h3>
                  <ul className="space-y-2.5 text-[11px] text-neutral-600 font-medium">
                    <li>
                      <button
                        onClick={() => {
                          onSelectGender('WOMEN');
                          onSelectCategory('ALL');
                          setActiveMegaMenu(null);
                          const el = document.getElementById('catalog-vault');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="hover:text-black transition-colors uppercase text-left block cursor-pointer"
                      >
                        NEW ARRIVALS
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => {
                          onSelectGender('WOMEN');
                          onSelectCategory('ALL');
                          setActiveMegaMenu(null);
                          const el = document.getElementById('catalog-vault');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="hover:text-black transition-colors uppercase text-left block cursor-pointer"
                      >
                        BEST SELLERS
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => {
                          onSelectGender('WOMEN');
                          onSelectCategory('cat_sale');
                          setActiveMegaMenu(null);
                          const el = document.getElementById('catalog-vault');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="hover:text-rose-700 transition-colors uppercase text-left block cursor-pointer font-bold text-rose-700"
                      >
                        ON SALE NOW
                      </button>
                    </li>
                  </ul>
                </div>

                {/* Column 5: Featured Editorial Showcase Card (Matches screenshot layout) */}
                <div className="col-span-4 pl-4 border-l border-neutral-100">
                  <div className="group relative overflow-hidden rounded-xs bg-neutral-100">
                    <img
                      src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80"
                      alt="Women's Editorial Resale Capsule"
                      className="w-full h-52 object-cover object-top group-hover:scale-102 transition-transform duration-500"
                    />
                    <div className="p-3 bg-white border border-t-0 border-neutral-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 block">
                          Women's Archive Collection
                        </span>
                        <div className="text-xs font-bold text-neutral-900 mt-0.5">
                          Phoebe Philo & Modern Heirloom Vault
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          onSelectGender('WOMEN');
                          onSelectCategory('ALL');
                          setActiveMegaMenu(null);
                          const el = document.getElementById('catalog-vault');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="text-[11px] font-bold uppercase tracking-wider text-neutral-950 underline underline-offset-4 hover:text-neutral-600 transition-colors cursor-pointer shrink-0 ml-2"
                      >
                        SHOP NOW
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* LUXURY MEGA MENU DROPDOWN (Matches uploaded user screenshot for MEN)     */}
        {/* ========================================================================= */}
        {activeMegaMenu === 'MEN' && (
          <div
            className="absolute left-0 w-full bg-[#FCFBF8] border-b border-[#E2DACD] shadow-[0_20px_45px_rgba(23,21,19,0.08)] transition-all animate-in fade-in duration-200 z-50 text-[#171513]"
            onMouseEnter={() => {
              if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
            }}
            onMouseLeave={handleMouseLeave}
          >
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-9">
              <div className="grid grid-cols-12 gap-6 lg:gap-8 items-start">
                {/* Column 1: READY TO WEAR */}
                <div className="col-span-2 space-y-3.5">
                  <h3 className="text-[12px] font-bold text-[#171513] tracking-wider uppercase font-aeonik">
                    READY TO WEAR
                  </h3>
                  <ul className="space-y-2.5 text-[11px] text-[#6B6357] font-medium">
                    <li>
                      <button
                        onClick={() => handleMenCategoryClick('cat_blazers')}
                        className="hover:text-[#9E7D47] transition-colors uppercase text-left block cursor-pointer"
                      >
                        BLAZERS & SPORT COATS
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleMenCategoryClick('cat_tops')}
                        className="hover:text-[#9E7D47] transition-colors uppercase text-left block cursor-pointer"
                      >
                        T-SHIRTS
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleMenCategoryClick('cat_denim')}
                        className="hover:text-[#9E7D47] transition-colors uppercase text-left block cursor-pointer"
                      >
                        JEANS
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleMenCategoryClick('cat_shirts')}
                        className="hover:text-black transition-colors uppercase text-left block cursor-pointer"
                      >
                        SHIRTS
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleMenCategoryClick('cat_trousers')}
                        className="hover:text-black transition-colors uppercase text-left block cursor-pointer"
                      >
                        PANTS
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleMenCategoryClick('cat_polos')}
                        className="hover:text-black transition-colors uppercase text-left block cursor-pointer"
                      >
                        POLOS
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleMenCategoryClick('cat_suits')}
                        className="hover:text-black transition-colors uppercase text-left block cursor-pointer"
                      >
                        SUITS
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleMenCategoryClick('cat_hoodies')}
                        className="hover:text-black transition-colors uppercase text-left block cursor-pointer"
                      >
                        SWEATSHIRTS & HOODIES
                      </button>
                    </li>
                    <li className="pt-1 border-t border-neutral-100">
                      <button
                        onClick={() => handleMenCategoryClick('cat_rtw')}
                        className="hover:text-black font-semibold text-neutral-900 uppercase text-left block cursor-pointer"
                      >
                        VIEW ALL
                      </button>
                    </li>
                  </ul>
                </div>

                {/* Column 2: ACCESSORIES */}
                <div className="col-span-2 space-y-3.5">
                  <h3 className="text-[12px] font-bold text-neutral-900 tracking-wider uppercase font-sans">
                    ACCESSORIES
                  </h3>
                  <ul className="space-y-2.5 text-[11px] text-neutral-600 font-medium">
                    <li>
                      <button
                        onClick={() => handleMenCategoryClick('cat_bags')}
                        className="hover:text-black transition-colors uppercase text-left block cursor-pointer"
                      >
                        BAGS
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleMenCategoryClick('cat_belts')}
                        className="hover:text-black transition-colors uppercase text-left block cursor-pointer"
                      >
                        BELTS
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleMenCategoryClick('cat_silver')}
                        className="hover:text-black transition-colors uppercase text-left block cursor-pointer"
                      >
                        JEWELRY
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleMenCategoryClick('cat_footwear')}
                        className="hover:text-black transition-colors uppercase text-left block cursor-pointer"
                      >
                        SHOES
                      </button>
                    </li>
                    <li className="pt-1 border-t border-neutral-100">
                      <button
                        onClick={() => handleMenCategoryClick('cat_accessories')}
                        className="hover:text-black font-semibold text-neutral-900 uppercase text-left block cursor-pointer"
                      >
                        VIEW ALL
                      </button>
                    </li>
                  </ul>
                </div>

                {/* Column 3: GIFTS */}
                <div className="col-span-2 space-y-3.5">
                  <h3 className="text-[12px] font-bold text-neutral-900 tracking-wider uppercase font-sans">
                    GIFTS
                  </h3>
                  <ul className="space-y-2.5 text-[11px] text-neutral-600 font-medium">
                    <li>
                      <button
                        onClick={() => handleMenCategoryClick('ALL')}
                        className="hover:text-black transition-colors uppercase text-left block cursor-pointer"
                      >
                        GIFTS FOR HIM
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => {
                          onOpenSearch();
                          setActiveMegaMenu(null);
                        }}
                        className="hover:text-black transition-colors uppercase text-left block cursor-pointer"
                      >
                        GIFT CARD
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleMenCategoryClick('cat_under_100')}
                        className="hover:text-black transition-colors uppercase text-left block cursor-pointer"
                      >
                        GIFTS UNDER $100
                      </button>
                    </li>
                    <li className="pt-1 border-t border-neutral-100">
                      <button
                        onClick={() => handleMenCategoryClick('ALL')}
                        className="hover:text-black font-semibold text-neutral-900 uppercase text-left block cursor-pointer"
                      >
                        VIEW ALL
                      </button>
                    </li>
                  </ul>
                </div>

                {/* Column 4: DISCOVER */}
                <div className="col-span-2 space-y-3.5">
                  <h3 className="text-[12px] font-bold text-neutral-900 tracking-wider uppercase font-sans">
                    DISCOVER
                  </h3>
                  <ul className="space-y-2.5 text-[11px] text-neutral-600 font-medium">
                    <li>
                      <button
                        onClick={() => {
                          onSelectGender('MEN');
                          onSelectCategory('ALL');
                          setActiveMegaMenu(null);
                          const el = document.getElementById('catalog-vault');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="hover:text-black transition-colors uppercase text-left block cursor-pointer"
                      >
                        NEW ARRIVALS
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => {
                          onSelectGender('MEN');
                          onSelectCategory('ALL');
                          setActiveMegaMenu(null);
                          const el = document.getElementById('catalog-vault');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="hover:text-black transition-colors uppercase text-left block cursor-pointer"
                      >
                        BEST SELLERS
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => {
                          onSelectGender('MEN');
                          onSelectCategory('cat_sale');
                          setActiveMegaMenu(null);
                          const el = document.getElementById('catalog-vault');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="hover:text-rose-700 transition-colors uppercase text-left block cursor-pointer font-bold text-rose-700"
                      >
                        ON SALE NOW
                      </button>
                    </li>
                  </ul>
                </div>

                {/* Column 5: Featured Editorial Showcase Card (Matches screenshot layout) */}
                <div className="col-span-4 pl-4 border-l border-neutral-100">
                  <div className="group relative overflow-hidden rounded-xs bg-neutral-100">
                    <img
                      src="https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=1000&q=80"
                      alt="Men's Editorial Resale Capsule"
                      className="w-full h-52 object-cover object-top group-hover:scale-102 transition-transform duration-500"
                    />
                    <div className="p-3 bg-white border border-t-0 border-neutral-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 block">
                          Men's Archive Collection
                        </span>
                        <div className="text-xs font-bold text-neutral-900 mt-0.5">
                          Relaxed Tailoring & Archival Streetwear
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          onSelectGender('MEN');
                          onSelectCategory('ALL');
                          setActiveMegaMenu(null);
                          const el = document.getElementById('catalog-vault');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="text-[11px] font-bold uppercase tracking-wider text-neutral-950 underline underline-offset-4 hover:text-neutral-600 transition-colors cursor-pointer shrink-0 ml-2"
                      >
                        SHOP NOW
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-neutral-200 px-6 py-6 space-y-5 animate-in slide-in-from-top-2">
            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search catalog..."
                className="w-full pl-9 pr-4 py-2 text-xs border border-neutral-300 rounded-xs"
              />
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </form>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onSelectGender('WOMEN');
                  onSelectCategory('ALL');
                  setMobileMenuOpen(false);
                }}
                className={`py-2 text-xs font-bold tracking-wider uppercase border text-center ${
                  currentGender === 'WOMEN' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-800'
                }`}
              >
                Women's Vault
              </button>
              <button
                onClick={() => {
                  onSelectGender('MEN');
                  onSelectCategory('ALL');
                  setMobileMenuOpen(false);
                }}
                className={`py-2 text-xs font-bold tracking-wider uppercase border text-center ${
                  currentGender === 'MEN' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-800'
                }`}
              >
                Men's Vault
              </button>
            </div>

            {/* Mobile Style Quiz CTA Banner */}
            {onOpenStyleQuiz && (
              <div
                onClick={() => {
                  onOpenStyleQuiz();
                  setMobileMenuOpen(false);
                }}
                className="p-3 bg-gradient-to-r from-[#171513] to-[#2B2724] text-white rounded-xs border border-[#C9B28B]/40 flex items-center justify-between cursor-pointer shadow-sm hover:brightness-110 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#FAF5EB]/10 border border-[#C9B28B]/40 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-[#C9B28B]" />
                  </div>
                  <div>
                    <span className="text-[9px] font-mono uppercase tracking-wider text-[#C9B28B] font-bold block">
                      ARCHIVE DIAGNOSTIC
                    </span>
                    <strong className="text-xs font-aeonik font-bold text-white block">
                      Find Your Style Aesthetic
                    </strong>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#C9B28B]" />
              </div>
            )}

            {/* Women Categories List in Mobile */}
            <div className="space-y-2 border-t border-neutral-100 pt-3">
              <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase font-bold">
                WOMEN'S CATEGORIES
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs text-neutral-700">
                <button onClick={() => { handleWomenCategoryClick('cat_dresses'); setMobileMenuOpen(false); }} className="text-left py-1 hover:text-black">
                  • Dresses
                </button>
                <button onClick={() => { handleWomenCategoryClick('cat_outerwear'); setMobileMenuOpen(false); }} className="text-left py-1 hover:text-black">
                  • Jackets & Coats
                </button>
                <button onClick={() => { handleWomenCategoryClick('cat_knitwear'); setMobileMenuOpen(false); }} className="text-left py-1 hover:text-black">
                  • Knitwear
                </button>
                <button onClick={() => { handleWomenCategoryClick('cat_skirts'); setMobileMenuOpen(false); }} className="text-left py-1 hover:text-black">
                  • Skirts
                </button>
                <button onClick={() => { handleWomenCategoryClick('cat_bags'); setMobileMenuOpen(false); }} className="text-left py-1 hover:text-black">
                  • Bags
                </button>
                <button onClick={() => { handleWomenCategoryClick('cat_footwear'); setMobileMenuOpen(false); }} className="text-left py-1 hover:text-black">
                  • Shoes
                </button>
              </div>
            </div>

            {/* Men Categories List in Mobile */}
            <div className="space-y-2 border-t border-neutral-100 pt-3">
              <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase font-bold">
                MEN'S CATEGORIES
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs text-neutral-700">
                <button onClick={() => { handleMenCategoryClick('cat_blazers'); setMobileMenuOpen(false); }} className="text-left py-1 hover:text-black">
                  • Blazers & Sport Coats
                </button>
                <button onClick={() => { handleMenCategoryClick('cat_tops'); setMobileMenuOpen(false); }} className="text-left py-1 hover:text-black">
                  • T-Shirts
                </button>
                <button onClick={() => { handleMenCategoryClick('cat_denim'); setMobileMenuOpen(false); }} className="text-left py-1 hover:text-black">
                  • Jeans
                </button>
                <button onClick={() => { handleMenCategoryClick('cat_shirts'); setMobileMenuOpen(false); }} className="text-left py-1 hover:text-black">
                  • Shirts
                </button>
                <button onClick={() => { handleMenCategoryClick('cat_trousers'); setMobileMenuOpen(false); }} className="text-left py-1 hover:text-black">
                  • Pants
                </button>
                <button onClick={() => { handleMenCategoryClick('cat_hoodies'); setMobileMenuOpen(false); }} className="text-left py-1 hover:text-black">
                  • Sweatshirts & Hoodies
                </button>
                <button onClick={() => { handleMenCategoryClick('cat_bags'); setMobileMenuOpen(false); }} className="text-left py-1 hover:text-black">
                  • Bags
                </button>
                <button onClick={() => { handleMenCategoryClick('cat_footwear'); setMobileMenuOpen(false); }} className="text-left py-1 hover:text-black">
                  • Shoes
                </button>
              </div>
            </div>

            {/* Quick Tracking link */}
            <div className="border-t border-neutral-100 pt-3 flex flex-col gap-2 text-xs">
              <button
                onClick={() => {
                  onOpenOrderTracking();
                  setMobileMenuOpen(false);
                }}
                className="text-left font-bold text-neutral-800 flex items-center gap-1.5"
              >
                <Truck className="w-4 h-4 text-neutral-600" />
                Track Courier Consignment
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
