import React from 'react';
import {
  ArrowRight,
  Play,
  Sparkles,
  Ruler,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  Repeat
} from 'lucide-react';
import { Product } from '../types/resale';
import { ProductCard } from '../components/ProductCard';

interface WomenHomePageProps {
  products: Product[];
  wishlist: Product[];
  onSelectProduct: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  onNavigateToShop: (filters?: { category?: string; gender?: string }) => void;
  onSwitchToMen: () => void;
  onOpenVideoModal: () => void;
}

// 5 Curated Categories specified for Women's Homepage
const WOMEN_CURATED_CATEGORIES = [
  {
    id: 'tops_blouses',
    title: 'Tops & Blouses',
    subtitle: 'Archival Celine · Phoebe Philo · The Row',
    categoryKey: 'cat_tops',
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80',
    tag: 'Contemporary Tailoring'
  },
  {
    id: 'dresses_minis',
    title: 'Dresses & Minis',
    subtitle: 'Vivienne Westwood · Mugler · Alaïa',
    categoryKey: 'cat_dresses',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80',
    tag: 'Runway Silhouettes'
  },
  {
    id: 'luxury_bags_leather',
    title: 'Luxury Bags & Leather',
    subtitle: 'Hermès Birkin · Chanel Classic Flap · Bottega',
    categoryKey: 'cat_totes',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
    tag: 'Investment Leather'
  },
  {
    id: 'heels_footwear',
    title: 'Heels & Footwear',
    subtitle: 'Manolo Blahnik · Louboutin · Margiela Tabi',
    categoryKey: 'cat_boots',
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80',
    tag: 'Haute Footwear'
  },
  {
    id: 'y2k_vintage_archives',
    title: 'Y2K / Vintage Archives',
    subtitle: '2000s Dior by Galliano · Tom Ford Gucci',
    categoryKey: 'cat_outerwear',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
    tag: 'Curated Resale Specials'
  }
];

export function WomenHomePage({
  products,
  wishlist,
  onSelectProduct,
  onToggleWishlist,
  onNavigateToShop,
  onSwitchToMen,
  onOpenVideoModal
}: WomenHomePageProps) {
  // Filter products specifically for Women
  const womenProducts = products.filter(
    (p) => p.gender === 'WOMEN' || p.gender === 'UNISEX'
  );

  return (
    <div className="w-full bg-[#FAF8F5]">
      {/* ========================================================================= */}
      {/* SECTION 1: WOMEN'S HIGH-CONTRAST EDITORIAL HERO BANNER                     */}
      {/* ========================================================================= */}
      <section className="relative w-full min-h-[82vh] lg:min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#120B0E]">
        {/* Editorial Photography for Contemporary Tailoring & Dresses */}
        <img
          src="https://innovecouture.vamtam.com/wp-content/uploads/2024/01/pexels-cottonbro-studio-9836585-1-scaled.jpg"
          alt="Women's Contemporary Tailoring & Haute Vault"
          className="absolute inset-0 w-full h-full object-cover object-center brightness-[0.85] contrast-[1.10]"
        />

        {/* High-Contrast Editorial Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/30 pointer-events-none" />

        {/* Hero Copywriting */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center text-white space-y-7 animate-in fade-in duration-700">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[11px] font-mono tracking-[0.25em] uppercase text-white/95">
            <span className="w-2 h-2 rounded-full bg-[#E5B869] animate-pulse" />
            <span>Women's Vault · Contemporary Tailoring & Archival Leather</span>
          </div>

          <h1 className="font-editorial text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-normal tracking-tight text-white leading-[1.05] drop-shadow-lg">
            Haute archival & <span className="italic font-light">contemporary elegance</span>
          </h1>

          <p className="font-sans text-sm sm:text-base md:text-lg text-white/85 max-w-2xl mx-auto leading-relaxed">
            Rare Hermès leather, archival Chanel tweed, Vivienne Westwood corsetry, and runway silhouettes. Authenticated and delivered throughout Bangladesh.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3">
            <button
              onClick={() => onNavigateToShop({ gender: 'WOMEN' })}
              className="px-8 py-3.5 bg-white text-[#171513] hover:bg-[#FAF5EB] font-aeonik font-bold text-xs uppercase tracking-widest transition-all rounded-xs shadow-xl cursor-pointer flex items-center gap-2 group"
            >
              <span>Explore Women's Vault ({womenProducts.length})</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onOpenVideoModal}
              className="px-6 py-3.5 bg-black/50 hover:bg-black/70 backdrop-blur-md border border-white/30 text-white font-aeonik font-medium text-xs uppercase tracking-widest transition-all rounded-xs cursor-pointer flex items-center gap-2.5 group"
            >
              <div className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-2.5 h-2.5 fill-black ml-0.5" />
              </div>
              <span>Watch Atelier Reel</span>
            </button>

            {/* Quick Department Switch Pill */}
            <button
              onClick={onSwitchToMen}
              className="px-4 py-3.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/25 text-white/90 font-mono text-xs uppercase tracking-wider rounded-xs cursor-pointer flex items-center gap-1.5 transition-all"
              title="One-click switch to Men's storefront"
            >
              <Repeat className="w-3.5 h-3.5 text-[#E5B869]" />
              <span>Switch to Men</span>
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
                  1-of-1 <span className="italic">Pieces</span>
                </h3>
                <p className="font-sans text-xs text-[#5C5449] leading-relaxed">
                  Individual authenticated garments with real-time reservation locks to prevent duplicate checkout.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 pt-4 md:pt-0 md:px-6">
              <div className="w-10 h-10 rounded-full bg-[#FAF5EB] border border-[#C9B28B]/50 flex items-center justify-center shrink-0 text-[#9E7D47]">
                <Ruler className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-editorial text-lg sm:text-xl font-normal text-[#171513]">
                  Flat <span className="italic">Measure</span>
                </h3>
                <p className="font-sans text-xs text-[#5C5449] leading-relaxed">
                  Manual millimeter-accurate flat tailoring dimensions for bust, waist, hips, and hem. Zero sizing ambiguity.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 pt-4 md:pt-0 md:px-6 last:pr-0">
              <div className="w-10 h-10 rounded-full bg-[#FAF5EB] border border-[#C9B28B]/50 flex items-center justify-center shrink-0 text-[#9E7D47]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-editorial text-lg sm:text-xl font-normal text-[#171513]">
                  100% <span className="italic">Proven</span>
                </h3>
                <p className="font-sans text-xs text-[#5C5449] leading-relaxed">
                  Physical inspection at our Dhaka Gulshan-2 & Banani salons. Lifetime provenance certificate.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: WOMEN'S CURATED CATEGORY GRID (5 SPECIFIED CATEGORIES)         */}
      {/* ========================================================================= */}
      <section className="py-20 lg:py-28 border-b border-[#E8E2D8] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#E8E2D8]">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#9E7D47] font-semibold mb-1">
                Women's Department Curation
              </div>
              <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#171513]">
                Curated <span className="italic font-normal">categories</span>
              </h2>
            </div>

            <button
              onClick={() => onNavigateToShop({ gender: 'WOMEN' })}
              className="text-xs font-aeonik font-bold uppercase tracking-widest text-[#171513] border-b-2 border-[#171513] pb-1 hover:text-[#9E7D47] hover:border-[#9E7D47] transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <span>View All Women's Drops</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 5-Item Category Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {WOMEN_CURATED_CATEGORIES.map((cat, idx) => (
              <div
                key={cat.id}
                onClick={() => onNavigateToShop({ category: cat.categoryKey, gender: 'WOMEN' })}
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
      {/* SECTION 3: WOMEN'S FILTERED RUNWAY PRODUCTS SHOWCASE                       */}
      {/* ========================================================================= */}
      <section className="py-20 lg:py-28 border-b border-[#E8E2D8] bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#E8E2D8]">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#9E7D47] font-semibold mb-1">
                Authenticated Haute Consignments
              </div>
              <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#171513]">
                Women’s <span className="italic font-normal">vault selection</span>
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-[#7A7165]">
                {womenProducts.length} archival pieces currently vaulted
              </span>
              <button
                onClick={() => onNavigateToShop({ gender: 'WOMEN' })}
                className="px-4 py-2 bg-[#171513] text-[#FAF5EB] hover:bg-[#9E7D47] text-xs font-mono uppercase tracking-wider rounded-xs transition-colors cursor-pointer"
              >
                View Full Catalog
              </button>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {womenProducts.slice(0, 8).map((product) => (
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
      {/* SECTION 4: EDITORIAL NARRATIVE ("The Story" & Cashmere Wool Yarns)         */}
      {/* ========================================================================= */}
      <section className="border-b border-[#E8E2D8] bg-white py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="text-xs font-mono tracking-[0.2em] uppercase text-[#9E7D47] font-semibold">
                Haute Couture Heritage
              </div>

              <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#171513]">
                the <span className="italic">story</span> of Simone Myson
              </h2>

              <p className="font-sans text-sm sm:text-base text-[#5C5449] leading-relaxed">
                One Vintage is a distinctive luxury brand founded by Simone Myson in 2010. This avant-garde label ingeniously revitalizes antique textiles, hand-embroidered silks, and Edwardian lace, seamlessly weaving them into contemporary masterpieces with modern flat tailoring.
              </p>

              <div className="pt-2 flex items-center gap-4">
                <button
                  onClick={() => onNavigateToShop({ gender: 'WOMEN' })}
                  className="inline-flex items-center gap-2 text-xs font-aeonik font-bold uppercase tracking-widest text-[#171513] border-b-2 border-[#171513] pb-1 hover:text-[#9E7D47] hover:border-[#9E7D47] transition-all cursor-pointer"
                >
                  <span>Discover Women's Collection</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative overflow-hidden rounded-xs border border-[#E2DACD] shadow-md aspect-[4/5] bg-[#EFE9DF] group">
                <img
                  src="https://innovecouture.vamtam.com/wp-content/uploads/2023/12/GettyImages-1402673175.jpg"
                  alt="Simone Myson One Vintage Atelier"
                  className="w-full h-full object-cover object-top group-hover:scale-104 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-6 left-6 right-6 text-white text-xs font-mono uppercase tracking-widest flex items-center justify-between">
                  <span>Archival Lace & Silk</span>
                  <span>100% Provenance</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
