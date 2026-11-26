import React from 'react';
import {
  ArrowRight,
  Play,
  Sparkles,
  Ruler,
  ShieldCheck,
  Flame,
  CheckCircle2,
  Clock,
  Layers,
  Repeat
} from 'lucide-react';
import { Product } from '../types/resale';
import { ProductCard } from '../components/ProductCard';

interface MenHomePageProps {
  products: Product[];
  wishlist: Product[];
  onSelectProduct: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  onNavigateToShop: (filters?: { category?: string; gender?: string }) => void;
  onSwitchToWomen: () => void;
  onOpenVideoModal: () => void;
}

// 5 Curated Categories specified for Men's Homepage
const MEN_CURATED_CATEGORIES = [
  {
    id: 'streetwear_hoodies',
    title: 'Streetwear Hoodies',
    subtitle: 'Undercover · Raf Simons · Vetements',
    categoryKey: 'cat_tops',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    tag: 'Archive Grails'
  },
  {
    id: 'denim_raw',
    title: 'Denim & Raw Jeans',
    subtitle: 'Kapital · Visvim · Evisu Japan',
    categoryKey: 'cat_denim',
    image: 'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=800&q=80',
    tag: 'Japanese Selvedge'
  },
  {
    id: 'sneakers_boots',
    title: 'Sneakers & Boots',
    subtitle: 'Rick Owens Geobasket · Margiela · CCP',
    categoryKey: 'cat_boots',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
    tag: 'Deconstructed'
  },
  {
    id: 'vintage_sportswear',
    title: 'Vintage Sportswear',
    subtitle: 'Stone Island Marina · 90s Nike ACG',
    categoryKey: 'cat_outerwear',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
    tag: '90s Subculture'
  },
  {
    id: 'watches_accessories',
    title: 'Watches & Accessories',
    subtitle: 'Chrome Hearts Silver · Rolex Vintage',
    categoryKey: 'cat_silver',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
    tag: 'Horology & Silver'
  }
];

export function MenHomePage({
  products,
  wishlist,
  onSelectProduct,
  onToggleWishlist,
  onNavigateToShop,
  onSwitchToWomen,
  onOpenVideoModal
}: MenHomePageProps) {
  // Filter products specifically for Men
  const menProducts = products.filter(
    (p) => p.gender === 'MEN' || p.gender === 'UNISEX'
  );

  return (
    <div className="w-full bg-[#FAF8F5]">
      {/* ========================================================================= */}
      {/* SECTION 1: MEN'S HERO BANNER (Streetwear, Tailoring & Vintage Menswear)  */}
      {/* ========================================================================= */}
      <section className="relative w-full min-h-[82vh] lg:min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#0F0E0C]">
        {/* Tailored Photography for Streetwear & Menswear */}
        <img
          src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=2000&q=85"
          alt="Men's Streetwear and Tailoring Vault"
          className="absolute inset-0 w-full h-full object-cover object-center brightness-[0.72] contrast-[1.12]"
        />

        {/* High-Contrast Editorial Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/30 pointer-events-none" />

        {/* Hero Copywriting */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center text-white space-y-7 animate-in fade-in duration-700">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[11px] font-mono tracking-[0.25em] uppercase text-white/95">
            <span className="w-2 h-2 rounded-full bg-[#E5B869] animate-pulse" />
            <span>Men's Runway Vault · Dhaka & Tokyo Archive</span>
          </div>

          <h1 className="font-editorial text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-normal tracking-tight text-white leading-[1.05] drop-shadow-lg">
            Streetwear archive & <span className="italic font-light">tailored grails</span>
          </h1>

          <p className="font-sans text-sm sm:text-base md:text-lg text-white/85 max-w-2xl mx-auto leading-relaxed">
            Curated runway outerwear, raw Japanese selvedge denim, vintage sportswear, and horological rarities. Each piece authenticated with millimeter-accurate flat tailoring measurements.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3">
            <button
              onClick={() => onNavigateToShop({ gender: 'MEN' })}
              className="px-8 py-3.5 bg-white text-[#171513] hover:bg-[#FAF5EB] font-aeonik font-bold text-xs uppercase tracking-widest transition-all rounded-xs shadow-xl cursor-pointer flex items-center gap-2 group"
            >
              <span>Explore Men's Vault ({menProducts.length})</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onOpenVideoModal}
              className="px-6 py-3.5 bg-black/50 hover:bg-black/70 backdrop-blur-md border border-white/30 text-white font-aeonik font-medium text-xs uppercase tracking-widest transition-all rounded-xs cursor-pointer flex items-center gap-2.5 group"
            >
              <div className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-2.5 h-2.5 fill-black ml-0.5" />
              </div>
              <span>Watch Runway Film</span>
            </button>

            {/* Quick Department Switch Pill */}
            <button
              onClick={onSwitchToWomen}
              className="px-4 py-3.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/25 text-white/90 font-mono text-xs uppercase tracking-wider rounded-xs cursor-pointer flex items-center gap-1.5 transition-all"
              title="One-click switch to Women's storefront"
            >
              <Repeat className="w-3.5 h-3.5 text-[#E5B869]" />
              <span>Switch to Women</span>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* TRUST PILLARS (Tailoring flat measurements & Dhaka authenticity inspection) */}
      {/* ========================================================================= */}
      <section className="border-b border-[#E8E2D8] bg-[#FCFBF9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 divide-y md:divide-y-0 md:divide-x divide-[#E8E2D8]">
            <div className="flex items-start gap-4 pt-4 md:pt-0 md:px-6 first:pl-0">
              <div className="w-10 h-10 rounded-full bg-[#FAF5EB] border border-[#C9B28B]/50 flex items-center justify-center shrink-0 text-[#9E7D47]">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-editorial text-lg sm:text-xl font-normal text-[#171513]">
                  1-of-1 <span className="italic">Grails</span>
                </h3>
                <p className="font-sans text-xs text-[#5C5449] leading-relaxed">
                  Single archival items from Raf Simons, Undercover, and Kapital with reservation locks.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 pt-4 md:pt-0 md:px-6">
              <div className="w-10 h-10 rounded-full bg-[#FAF5EB] border border-[#C9B28B]/50 flex items-center justify-center shrink-0 text-[#9E7D47]">
                <Ruler className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-editorial text-lg sm:text-xl font-normal text-[#171513]">
                  Flat <span className="italic">Measurements</span>
                </h3>
                <p className="font-sans text-xs text-[#5C5449] leading-relaxed">
                  Manual pit-to-pit, shoulder width, sleeve, and total length measurements on all outerwear and denim.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 pt-4 md:pt-0 md:px-6 last:pr-0">
              <div className="w-10 h-10 rounded-full bg-[#FAF5EB] border border-[#C9B28B]/50 flex items-center justify-center shrink-0 text-[#9E7D47]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-editorial text-lg sm:text-xl font-normal text-[#171513]">
                  100% <span className="italic">Dhaka Provenance</span>
                </h3>
                <p className="font-sans text-xs text-[#5C5449] leading-relaxed">
                  Banani & Gulshan physical inspection salons. Steadfast hand-to-hand delivery with advance BDT 80 lock.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: MEN'S CURATED CATEGORY GRID (5 SPECIFIED CATEGORIES)           */}
      {/* ========================================================================= */}
      <section className="py-20 lg:py-28 border-b border-[#E8E2D8] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#E8E2D8]">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#9E7D47] font-semibold mb-1">
                Men's Department Curation
              </div>
              <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#171513]">
                Curated <span className="italic font-normal">categories</span>
              </h2>
            </div>

            <button
              onClick={() => onNavigateToShop({ gender: 'MEN' })}
              className="text-xs font-aeonik font-bold uppercase tracking-widest text-[#171513] border-b-2 border-[#171513] pb-1 hover:text-[#9E7D47] hover:border-[#9E7D47] transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <span>View All Men's Drops</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 5-Item Category Grid (Featured first 2 large, next 3 grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {MEN_CURATED_CATEGORIES.map((cat, idx) => (
              <div
                key={cat.id}
                onClick={() => onNavigateToShop({ category: cat.categoryKey, gender: 'MEN' })}
                className={`group cursor-pointer flex flex-col space-y-3 ${
                  idx === 0 || idx === 1 ? 'lg:col-span-2' : 'lg:col-span-1'
                }`}
              >
                <div className="relative overflow-hidden rounded-xs border border-[#E2DACD] aspect-[4/5] bg-[#171513]">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 brightness-[0.92]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />

                  {/* Category Tag Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-mono uppercase tracking-widest rounded-2xs border border-white/20">
                      {cat.tag}
                    </span>
                  </div>

                  {/* Bottom Title on Image */}
                  <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                    <h3 className="font-aeonik text-lg sm:text-xl font-bold tracking-tight">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-[#E5B869] font-mono">
                      {cat.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-b border-[#E8E2D8] pb-2 pt-1">
                  <span className="font-mono text-xs text-[#7A7165] uppercase tracking-wider group-hover:text-[#171513]">
                    Explore Archive
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#171513] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: MEN'S FILTERED RUNWAY PRODUCTS SHOWCASE                         */}
      {/* ========================================================================= */}
      <section className="py-20 lg:py-28 border-b border-[#E8E2D8] bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#E8E2D8]">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#9E7D47] font-semibold mb-1">
                Authenticated Runway Garments
              </div>
              <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#171513]">
                Men’s <span className="italic font-normal">vault grails</span>
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-[#7A7165]">
                {menProducts.length} archival pieces currently vaulted
              </span>
              <button
                onClick={() => onNavigateToShop({ gender: 'MEN' })}
                className="px-4 py-2 bg-[#171513] text-[#FAF5EB] hover:bg-[#9E7D47] text-xs font-mono uppercase tracking-wider rounded-xs transition-colors cursor-pointer"
              >
                View Full Catalog
              </button>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {menProducts.slice(0, 8).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={(p) => onSelectProduct(p)}
                isWishlisted={wishlist.some((w) => w.id === product.id)}
                onToggleWishlist={onToggleWishlist}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 4: EDITORIAL NARRATIVE (Raw Japanese Denim & Belgian Deconstruction) */}
      {/* ========================================================================= */}
      <section className="border-b border-[#E8E2D8] bg-white py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="text-xs font-mono tracking-[0.2em] uppercase text-[#9E7D47] font-semibold">
                Menswear Philosophy
              </div>

              <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#171513]">
                Deconstructed tailoring & <span className="italic">shuttle-loom denim</span>
              </h2>

              <p className="font-sans text-sm sm:text-base text-[#5C5449] leading-relaxed">
                Menswear at INNOVÉ is built on subcultural heritage and artisanal integrity. From rare Raf Simons Riot bombers to hand-distressed Kojima selvedge, every item has been physically vetted for fabric tension, hardware patina, and authentic tags at our Dhaka Vault Salon.
              </p>

              <div className="pt-2 flex items-center gap-4">
                <button
                  onClick={() => onNavigateToShop({ gender: 'MEN' })}
                  className="inline-flex items-center gap-2 text-xs font-aeonik font-bold uppercase tracking-widest text-[#171513] border-b-2 border-[#171513] pb-1 hover:text-[#9E7D47] hover:border-[#9E7D47] transition-all cursor-pointer"
                >
                  <span>Explore Men’s Archive</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative overflow-hidden rounded-xs border border-[#E2DACD] shadow-md aspect-[4/5] bg-[#171513] group">
                <img
                  src="https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=1200&q=80"
                  alt="Men's Tailoring Atelier"
                  className="w-full h-full object-cover object-center group-hover:scale-104 transition-transform duration-700 brightness-[0.88]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-6 left-6 right-6 text-white text-xs font-mono uppercase tracking-widest flex items-center justify-between">
                  <span>Banani Fitting Salon</span>
                  <span>Dhaka 1213</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
