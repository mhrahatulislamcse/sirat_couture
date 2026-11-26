import React, { useState, useRef, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Heart,
  User as UserIcon,
  ChevronDown,
  ArrowRight,
  Sparkles,
  Layers,
  Repeat,
  Truck,
  ShieldCheck,
  Compass,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { User } from '../types/auth';

interface HeaderNavProps {
  currentStorefront: 'men' | 'women';
  currentPath: string; // '/' | '/men' | '/women' | '/shop'
  currentUser: User | null;
  cartCount: number;
  wishlistCount: number;
  onNavigate: (path: string) => void;
  onSwitchStorefront: (target: 'men' | 'women') => void;
  onOpenAuth: () => void;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenSearch: () => void;
  onOpenOrderTracking: () => void;
  onOpenAdmin: () => void;
  onSelectCategory?: (categoryId: string) => void;
}

export function HeaderNav({
  currentStorefront,
  currentPath,
  currentUser,
  cartCount,
  wishlistCount,
  onNavigate,
  onSwitchStorefront,
  onOpenAuth,
  onOpenCart,
  onOpenWishlist,
  onOpenSearch,
  onOpenOrderTracking,
  onOpenAdmin,
  onSelectCategory
}: HeaderNavProps) {
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [activeMegaTab, setActiveMegaTab] = useState<'categories' | 'grails' | 'services'>('categories');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close mega menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsMegaMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isMen = currentStorefront === 'men';
  const oppositeStorefront = isMen ? 'women' : 'men';

  return (
    <>
      {/* Sticky Luxury Navigation Bar */}
      <header
        ref={dropdownRef}
        className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E8E2D8] transition-all font-sans shadow-[0_2px_12px_rgba(23,21,19,0.03)]"
        onMouseLeave={() => setIsMegaMenuOpen(false)}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Left Column: Brand Wordmark + Storefront Pill */}
            <div className="flex items-center gap-6">
              <button
                onClick={() => onNavigate('/')}
                className="group text-left cursor-pointer flex items-center gap-3"
                aria-label="SAIRAT COUTURE Home"
              >
                <img
                  src="/assets/sairat-couture-logo.png"
                  alt="SAIRAT COUTURE"
                  className="h-9 sm:h-10 md:h-11 w-auto max-w-[190px] sm:max-w-[230px] md:max-w-[260px] object-contain filter drop-shadow-[0_1px_2px_rgba(23,21,19,0.35)] group-hover:scale-[1.02] transition-transform"
                />
              </button>

              {/* Persistent Active Department Indicator */}
              <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-[#E8E2D8]">
                <div
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider rounded-xs border font-semibold ${
                    isMen
                      ? 'bg-[#171513] text-[#FAF5EB] border-[#171513]'
                      : 'bg-[#4A1521] text-[#FFF0F2] border-[#4A1521]'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
                  <span>{isMen ? "Men's Runway" : "Women's Archival"}</span>
                </div>
              </div>
            </div>

            {/* Center Column: Primary Department Nav & Switcher */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              {/* Men's Homepage Link */}
              <button
                onClick={() => {
                  onSwitchStorefront('men');
                  onNavigate('/men');
                }}
                className={`relative px-3.5 py-2 text-xs font-aeonik font-bold uppercase tracking-widest transition-all cursor-pointer rounded-xs ${
                  currentPath === '/men'
                    ? 'text-[#171513] bg-[#FAF5EB] border-b-2 border-[#171513]'
                    : 'text-[#5C5449] hover:text-[#171513] hover:bg-[#F5EFE6]'
                }`}
              >
                <span>Men's Vault</span>
                {currentPath === '/men' && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#9E7D47]" />
                )}
              </button>

              {/* Women's Homepage Link */}
              <button
                onClick={() => {
                  onSwitchStorefront('women');
                  onNavigate('/women');
                }}
                className={`relative px-3.5 py-2 text-xs font-aeonik font-bold uppercase tracking-widest transition-all cursor-pointer rounded-xs ${
                  currentPath === '/women'
                    ? 'text-[#171513] bg-[#FAF5EB] border-b-2 border-[#171513]'
                    : 'text-[#5C5449] hover:text-[#171513] hover:bg-[#F5EFE6]'
                }`}
              >
                <span>Women's Vault</span>
                {currentPath === '/women' && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#9E7D47]" />
                )}
              </button>

              {/* Curated Mega Menu Trigger */}
              <button
                onMouseEnter={() => setIsMegaMenuOpen(true)}
                onClick={() => setIsMegaMenuOpen((prev) => !prev)}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-aeonik font-bold uppercase tracking-widest transition-colors cursor-pointer rounded-xs ${
                  isMegaMenuOpen ? 'text-[#9E7D47] bg-[#FAF5EB]' : 'text-[#5C5449] hover:text-[#171513]'
                }`}
              >
                <span>{isMen ? "Men's Hierarchy" : "Women's Hierarchy"}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    isMegaMenuOpen ? 'rotate-180 text-[#9E7D47]' : ''
                  }`}
                />
              </button>

              {/* Full Curated Shop Catalog Link */}
              <button
                onClick={() => onNavigate('/shop')}
                className={`px-3.5 py-2 text-xs font-aeonik font-bold uppercase tracking-widest transition-colors cursor-pointer rounded-xs ${
                  currentPath === '/shop' ? 'text-[#171513] bg-[#FAF5EB]' : 'text-[#5C5449] hover:text-[#171513]'
                }`}
              >
                <span>Curated Shop</span>
              </button>

              {/* Gateway Root Page Link */}
              <button
                onClick={() => onNavigate('/')}
                className="px-3 py-2 text-xs font-mono uppercase tracking-wider text-[#7A7165] hover:text-[#171513] transition-colors cursor-pointer"
                title="Unified Landing Gateway"
              >
                <span>Gateway</span>
              </button>

              {/* One-Click Department Switcher Button */}
              <button
                onClick={() => {
                  onSwitchStorefront(oppositeStorefront);
                  onNavigate(`/${oppositeStorefront}`);
                }}
                className="ml-2 flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF5EB] hover:bg-[#F0E8D9] text-[#171513] border border-[#DED7CB] rounded-xs text-[11px] font-mono uppercase tracking-wider transition-all cursor-pointer shadow-2xs group"
                title={`Switch to ${oppositeStorefront.toUpperCase()} storefront (persistent cookie)`}
              >
                <Repeat className="w-3 h-3 text-[#9E7D47] group-hover:rotate-180 transition-transform duration-300" />
                <span>Switch to {isMen ? 'Women' : 'Men'}</span>
              </button>
            </nav>

            {/* Right Column: Search, Wishlist, Cart, User Profile Trigger */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search Button */}
              <button
                onClick={onOpenSearch}
                className="p-2 text-[#171513] hover:text-[#9E7D47] transition-colors cursor-pointer"
                aria-label="Search Vault"
                title="Search garments & archives"
              >
                <Search className="w-5 h-5 stroke-[1.75]" />
              </button>

              {/* Wishlist Button */}
              <button
                onClick={onOpenWishlist}
                className="relative p-2 text-[#171513] hover:text-[#9E7D47] transition-colors cursor-pointer"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5 stroke-[1.75]" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#171513] text-white text-[10px] font-mono flex items-center justify-center font-bold">
                    {wishlistCount}
                  </span>
                )}
              </button>

              {/* Cart Slide-over Trigger */}
              <button
                onClick={onOpenCart}
                className="relative p-2 text-[#171513] hover:text-[#9E7D47] transition-colors cursor-pointer flex items-center gap-1.5"
                aria-label="Shopping Cart"
              >
                <ShoppingBag className="w-5 h-5 stroke-[1.75]" />
                {cartCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-[#9E7D47] text-white text-[10px] font-mono flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* User Authentication & Profile Trigger */}
              <button
                onClick={onOpenAuth}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xs border transition-all cursor-pointer text-xs font-mono ${
                  currentUser
                    ? 'bg-[#FAF5EB] border-[#C9B28B] text-[#171513] hover:border-[#171513]'
                    : 'bg-[#171513] text-[#FAF5EB] border-[#171513] hover:bg-[#2C2722]'
                }`}
                title={
                  currentUser
                    ? `Logged in as ${currentUser.name} (${currentUser.profile.gender})`
                    : 'Sign in to access gender-adaptive routing'
                }
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {currentUser ? currentUser.name.split(' ')[0] : 'Sign In'}
                </span>
                {currentUser && (
                  <span className="px-1.5 py-0.2 bg-[#171513] text-[#FAF5EB] rounded-2xs text-[9px] uppercase font-bold">
                    {currentUser.profile.gender}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CURATED DUAL MEGA-MENU (Separate Men vs Women Hierarchy)                  */}
        {/* ========================================================================= */}
        {isMegaMenuOpen && (
          <div
            className="border-t border-[#E8E2D8] bg-[#FAF8F5] shadow-xl animate-in fade-in slide-in-from-top-2 duration-200"
            onMouseEnter={() => setIsMegaMenuOpen(true)}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Department Header in Mega Menu */}
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#E8E2D8]">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs uppercase tracking-widest text-[#9E7D47] font-semibold">
                    Curated Department Hierarchy:
                  </span>
                  <span className="font-editorial text-lg text-[#171513] font-medium">
                    {isMen ? "Men's Runway, Streetwear & Horology" : "Women's Archival, Haute Couture & Leather"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onSwitchStorefront(oppositeStorefront);
                    }}
                    className="text-xs font-mono text-[#9E7D47] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Repeat className="w-3 h-3" />
                    <span>View {oppositeStorefront.toUpperCase()} Mega-Menu</span>
                  </button>
                  <button
                    onClick={() => setIsMegaMenuOpen(false)}
                    className="p-1 text-[#7A7165] hover:text-[#171513] cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* MEN'S CURATED MEGA-MENU HIERARCHY */}
              {isMen ? (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                  {/* Column 1: Ready-To-Wear */}
                  <div className="space-y-3">
                    <h4 className="font-aeonik text-xs font-bold uppercase tracking-widest text-[#171513] pb-2 border-b border-[#E8E2D8]">
                      Ready-to-Wear
                    </h4>
                    <ul className="space-y-2 text-xs font-sans text-[#5C5449]">
                      <li>
                        <button
                          onClick={() => {
                            if (onSelectCategory) onSelectCategory('cat_outerwear');
                            onNavigate('/shop');
                            setIsMegaMenuOpen(false);
                          }}
                          className="hover:text-[#171513] hover:underline cursor-pointer transition-colors block text-left"
                        >
                          Jackets & Bombers
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => {
                            if (onSelectCategory) onSelectCategory('cat_denim');
                            onNavigate('/shop');
                            setIsMegaMenuOpen(false);
                          }}
                          className="hover:text-[#171513] hover:underline cursor-pointer transition-colors block text-left font-semibold text-[#9E7D47]"
                        >
                          Denim & Raw Jeans
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => {
                            if (onSelectCategory) onSelectCategory('cat_knitwear');
                            onNavigate('/shop');
                            setIsMegaMenuOpen(false);
                          }}
                          className="hover:text-[#171513] hover:underline cursor-pointer transition-colors block text-left"
                        >
                          Cashmere & Knitwear
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => {
                            if (onSelectCategory) onSelectCategory('cat_tops');
                            onNavigate('/shop');
                            setIsMegaMenuOpen(false);
                          }}
                          className="hover:text-[#171513] hover:underline cursor-pointer transition-colors block text-left"
                        >
                          Streetwear Hoodies & Tees
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => {
                            if (onSelectCategory) onSelectCategory('cat_trousers');
                            onNavigate('/shop');
                            setIsMegaMenuOpen(false);
                          }}
                          className="hover:text-[#171513] hover:underline cursor-pointer transition-colors block text-left"
                        >
                          Deconstructed Trousers
                        </button>
                      </li>
                    </ul>
                  </div>

                  {/* Column 2: Footwear */}
                  <div className="space-y-3">
                    <h4 className="font-aeonik text-xs font-bold uppercase tracking-widest text-[#171513] pb-2 border-b border-[#E8E2D8]">
                      Footwear
                    </h4>
                    <ul className="space-y-2 text-xs font-sans text-[#5C5449]">
                      <li>
                        <button
                          onClick={() => {
                            if (onSelectCategory) onSelectCategory('cat_boots');
                            onNavigate('/shop');
                            setIsMegaMenuOpen(false);
                          }}
                          className="hover:text-[#171513] hover:underline cursor-pointer transition-colors block text-left font-semibold"
                        >
                          Combat & Tabi Boots
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => {
                            if (onSelectCategory) onSelectCategory('cat_sneakers');
                            onNavigate('/shop');
                            setIsMegaMenuOpen(false);
                          }}
                          className="hover:text-[#171513] hover:underline cursor-pointer transition-colors block text-left"
                        >
                          Runners & High-Tops
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => {
                            if (onSelectCategory) onSelectCategory('cat_derbies');
                            onNavigate('/shop');
                            setIsMegaMenuOpen(false);
                          }}
                          className="hover:text-[#171513] hover:underline cursor-pointer transition-colors block text-left"
                        >
                          Derbies & Leather Loafers
                        </button>
                      </li>
                    </ul>
                  </div>

                  {/* Column 3: Bags */}
                  <div className="space-y-3">
                    <h4 className="font-aeonik text-xs font-bold uppercase tracking-widest text-[#171513] pb-2 border-b border-[#E8E2D8]">
                      Bags & Luggage
                    </h4>
                    <ul className="space-y-2 text-xs font-sans text-[#5C5449]">
                      <li>
                        <button
                          onClick={() => {
                            if (onSelectCategory) onSelectCategory('cat_crossbody');
                            onNavigate('/shop');
                            setIsMegaMenuOpen(false);
                          }}
                          className="hover:text-[#171513] hover:underline cursor-pointer transition-colors block text-left"
                        >
                          Crossbody & Holsters
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => {
                            if (onSelectCategory) onSelectCategory('cat_totes');
                            onNavigate('/shop');
                            setIsMegaMenuOpen(false);
                          }}
                          className="hover:text-[#171513] hover:underline cursor-pointer transition-colors block text-left"
                        >
                          Structured Duffle & Totes
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => {
                            if (onSelectCategory) onSelectCategory('cat_wallets');
                            onNavigate('/shop');
                            setIsMegaMenuOpen(false);
                          }}
                          className="hover:text-[#171513] hover:underline cursor-pointer transition-colors block text-left"
                        >
                          Wallets & Cardholders
                        </button>
                      </li>
                    </ul>
                  </div>

                  {/* Column 4: Accessories & Horology */}
                  <div className="space-y-3">
                    <h4 className="font-aeonik text-xs font-bold uppercase tracking-widest text-[#171513] pb-2 border-b border-[#E8E2D8]">
                      Accessories
                    </h4>
                    <ul className="space-y-2 text-xs font-sans text-[#5C5449]">
                      <li>
                        <button
                          onClick={() => {
                            if (onSelectCategory) onSelectCategory('cat_silver');
                            onNavigate('/shop');
                            setIsMegaMenuOpen(false);
                          }}
                          className="hover:text-[#171513] hover:underline cursor-pointer transition-colors block text-left font-semibold text-[#9E7D47]"
                        >
                          Watches & Horology
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => {
                            if (onSelectCategory) onSelectCategory('cat_silver');
                            onNavigate('/shop');
                            setIsMegaMenuOpen(false);
                          }}
                          className="hover:text-[#171513] hover:underline cursor-pointer transition-colors block text-left"
                        >
                          Sterling Silver & Chains
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => {
                            if (onSelectCategory) onSelectCategory('cat_belts');
                            onNavigate('/shop');
                            setIsMegaMenuOpen(false);
                          }}
                          className="hover:text-[#171513] hover:underline cursor-pointer transition-colors block text-left"
                        >
                          Hardware Belts
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => {
                            if (onSelectCategory) onSelectCategory('cat_eyewear');
                            onNavigate('/shop');
                            setIsMegaMenuOpen(false);
                          }}
                          className="hover:text-[#171513] hover:underline cursor-pointer transition-colors block text-left"
                        >
                          Titanium Eyewear
                        </button>
                      </li>
                    </ul>
                  </div>

                  {/* Column 5: Archive Grails */}
                  <div className="bg-[#171513] text-white p-4 rounded-xs space-y-3">
                    <span className="inline-block px-2 py-0.5 bg-[#9E7D47] text-white text-[9px] font-mono uppercase tracking-widest rounded-2xs font-bold">
                      Men's Vault Grails
                    </span>
                    <h5 className="font-aeonik text-sm font-bold tracking-tight">
                      Archival 1-of-1s
                    </h5>
                    <p className="text-[11px] text-[#C9B28B] leading-relaxed">
                      Museum-grade Raf Simons, Number (N)ine, undercover, & Visvim available in Bangladesh.
                    </p>
                    <button
                      onClick={() => {
                        onNavigate('/shop');
                        setIsMegaMenuOpen(false);
                      }}
                      className="text-xs font-mono text-white underline hover:text-[#C9B28B] cursor-pointer flex items-center gap-1 pt-1"
                    >
                      <span>Explore Men's Vault</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ) : (
                /* WOMEN'S CURATED MEGA-MENU HIERARCHY */
                <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                  {/* Column 1: Ready-To-Wear */}
                  <div className="space-y-3">
                    <h4 className="font-aeonik text-xs font-bold uppercase tracking-widest text-[#171513] pb-2 border-b border-[#E8E2D8]">
                      Ready-to-Wear
                    </h4>
                    <ul className="space-y-2 text-xs font-sans text-[#5C5449]">
                      <li>
                        <button
                          onClick={() => {
                            if (onSelectCategory) onSelectCategory('cat_dresses');
                            onNavigate('/shop');
                            setIsMegaMenuOpen(false);
                          }}
                          className="hover:text-[#171513] hover:underline cursor-pointer transition-colors block text-left font-semibold text-[#9E7D47]"
                        >
                          Dresses & Minis
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => {
                            if (onSelectCategory) onSelectCategory('cat_tops');
                            onNavigate('/shop');
                            setIsMegaMenuOpen(false);
                          }}
                          className="hover:text-[#171513] hover:underline cursor-pointer transition-colors block text-left"
                        >
                          Tops & Blouses
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => {
                            if (onSelectCategory) onSelectCategory('cat_outerwear');
                            onNavigate('/shop');
                            setIsMegaMenuOpen(false);
                          }}
                          className="hover:text-[#171513] hover:underline cursor-pointer transition-colors block text-left"
                        >
                          Contemporary Tailoring & Blazers
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => {
                            if (onSelectCategory) onSelectCategory('cat_skirts');
                            onNavigate('/shop');
                            setIsMegaMenuOpen(false);
                          }}
                          className="hover:text-[#171513] hover:underline cursor-pointer transition-colors block text-left"
                        >
                          Silk & Pleated Skirts
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => {
                            if (onSelectCategory) onSelectCategory('cat_knitwear');
                            onNavigate('/shop');
                            setIsMegaMenuOpen(false);
                          }}
                          className="hover:text-[#171513] hover:underline cursor-pointer transition-colors block text-left"
                        >
                          Cashmere & Wool Yarns
                        </button>
                      </li>
                    </ul>
                  </div>

                  {/* Column 2: Footwear */}
                  <div className="space-y-3">
                    <h4 className="font-aeonik text-xs font-bold uppercase tracking-widest text-[#171513] pb-2 border-b border-[#E8E2D8]">
                      Footwear
                    </h4>
                    <ul className="space-y-2 text-xs font-sans text-[#5C5449]">
                      <li>
                        <button
                          onClick={() => {
                            if (onSelectCategory) onSelectCategory('cat_boots');
                            onNavigate('/shop');
                            setIsMegaMenuOpen(false);
                          }}
                          className="hover:text-[#171513] hover:underline cursor-pointer transition-colors block text-left font-semibold"
                        >
                          Heels & Designer Pumps
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => {
                            if (onSelectCategory) onSelectCategory('cat_boots');
                            onNavigate('/shop');
                            setIsMegaMenuOpen(false);
                          }}
                          className="hover:text-[#171513] hover:underline cursor-pointer transition-colors block text-left"
                        >
                          Archival Tabi & Boots
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => {
                            if (onSelectCategory) onSelectCategory('cat_derbies');
                            onNavigate('/shop');
                            setIsMegaMenuOpen(false);
                          }}
                          className="hover:text-[#171513] hover:underline cursor-pointer transition-colors block text-left"
                        >
                          Slingbacks & Mules
                        </button>
                      </li>
                    </ul>
                  </div>

                  {/* Column 3: Luxury Bags & Leather */}
                  <div className="space-y-3">
                    <h4 className="font-aeonik text-xs font-bold uppercase tracking-widest text-[#171513] pb-2 border-b border-[#E8E2D8]">
                      Luxury Bags
                    </h4>
                    <ul className="space-y-2 text-xs font-sans text-[#5C5449]">
                      <li>
                        <button
                          onClick={() => {
                            if (onSelectCategory) onSelectCategory('cat_totes');
                            onNavigate('/shop');
                            setIsMegaMenuOpen(false);
                          }}
                          className="hover:text-[#171513] hover:underline cursor-pointer transition-colors block text-left font-semibold text-[#9E7D47]"
                        >
                          Luxury Bags & Leather
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => {
                            if (onSelectCategory) onSelectCategory('cat_crossbody');
                            onNavigate('/shop');
                            setIsMegaMenuOpen(false);
                          }}
                          className="hover:text-[#171513] hover:underline cursor-pointer transition-colors block text-left"
                        >
                          Evening Clutches
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => {
                            if (onSelectCategory) onSelectCategory('cat_wallets');
                            onNavigate('/shop');
                            setIsMegaMenuOpen(false);
                          }}
                          className="hover:text-[#171513] hover:underline cursor-pointer transition-colors block text-left"
                        >
                          Small Leather Relics
                        </button>
                      </li>
                    </ul>
                  </div>

                  {/* Column 4: Accessories */}
                  <div className="space-y-3">
                    <h4 className="font-aeonik text-xs font-bold uppercase tracking-widest text-[#171513] pb-2 border-b border-[#E8E2D8]">
                      Accessories
                    </h4>
                    <ul className="space-y-2 text-xs font-sans text-[#5C5449]">
                      <li>
                        <button
                          onClick={() => {
                            if (onSelectCategory) onSelectCategory('cat_scarves');
                            onNavigate('/shop');
                            setIsMegaMenuOpen(false);
                          }}
                          className="hover:text-[#171513] hover:underline cursor-pointer transition-colors block text-left"
                        >
                          Hermès Silk Carré Scarves
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => {
                            if (onSelectCategory) onSelectCategory('cat_silver');
                            onNavigate('/shop');
                            setIsMegaMenuOpen(false);
                          }}
                          className="hover:text-[#171513] hover:underline cursor-pointer transition-colors block text-left"
                        >
                          High Jewelry & Pearls
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => {
                            if (onSelectCategory) onSelectCategory('cat_belts');
                            onNavigate('/shop');
                            setIsMegaMenuOpen(false);
                          }}
                          className="hover:text-[#171513] hover:underline cursor-pointer transition-colors block text-left"
                        >
                          Corsetry & Waist Belts
                        </button>
                      </li>
                    </ul>
                  </div>

                  {/* Column 5: Curated Resale Specials */}
                  <div className="bg-[#3D141D] text-white p-4 rounded-xs space-y-3">
                    <span className="inline-block px-2 py-0.5 bg-[#D4AF37] text-[#171513] text-[9px] font-mono uppercase tracking-widest rounded-2xs font-bold">
                      Curated Resale Specials
                    </span>
                    <h5 className="font-aeonik text-sm font-bold tracking-tight">
                      Y2K / Vintage Archives
                    </h5>
                    <p className="text-[11px] text-[#F3D5DE] leading-relaxed">
                      Hand-inspected Chanel tweed, Dior by Galliano, and Phoebe Philo Celine archival drops.
                    </p>
                    <button
                      onClick={() => {
                        onNavigate('/shop');
                        setIsMegaMenuOpen(false);
                      }}
                      className="text-xs font-mono text-[#D4AF37] underline hover:text-white cursor-pointer flex items-center gap-1 pt-1"
                    >
                      <span>Explore Women's Vault</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
