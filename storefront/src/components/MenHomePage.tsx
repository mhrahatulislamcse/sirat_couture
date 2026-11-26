import React from 'react';
import {
  ArrowRight,
  Play,
  Sparkles,
  Ruler,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  ExternalLink,
  Scissors,
  Flame
} from 'lucide-react';
import { Gender, StorefrontConfig } from '../types/resale';

interface MenHomePageProps {
  onExploreShop: (category?: string) => void;
  onWatchVideo: () => void;
  onSelectGender?: (gender: Gender | 'ALL') => void;
  storefrontConfig?: StorefrontConfig | null;
  onOpenStyleQuiz?: () => void;
}

export const MenHomePage: React.FC<MenHomePageProps> = ({
  onExploreShop,
  onWatchVideo,
  onSelectGender,
  storefrontConfig,
  onOpenStyleQuiz
}) => {
  return (
    <div className="w-full bg-[#FAF8F5] text-[#171513]">
      {/* ========================================================================= */}
      {/* SECTION 1: HERO CAMPAIGN ("Minimalism and fantasy" with Men's Hero Image)  */}
      {/* ========================================================================= */}
      <section className="relative w-full min-h-[82vh] lg:min-h-[90vh] flex items-center justify-center overflow-hidden bg-black">
        {/* Full-width editorial background image with High-Fashion Men's Image */}
        <img
          src={storefrontConfig?.menHeroImageUrl || "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=2200&q=85"}
          alt="Minimalism and fantasy - Menswear Editorial"
          className="absolute inset-0 w-full h-full object-cover object-center brightness-[0.85] contrast-[1.08]"
        />

        {/* Subtle vignette gradient for readability matching template */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/30 pointer-events-none" />

        {/* Center Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center text-white space-y-7 animate-in fade-in duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[11px] font-mono tracking-[0.2em] uppercase text-white/90">
            <span>{storefrontConfig?.menHeroSubheadline || "Archive Capsule 2026 · Men's Edition"}</span>
          </div>

          <h1 className="font-editorial text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-normal tracking-tight text-white leading-[1.05] drop-shadow-md">
            {storefrontConfig?.menHeroHeadline ? (
              <span>{storefrontConfig.menHeroHeadline}</span>
            ) : (
              <>
                Minimalism and <span className="italic font-light">fantasy</span>
              </>
            )}
          </h1>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-3">
            <button
              onClick={() => onExploreShop('ALL')}
              className="px-8 py-3.5 bg-white text-[#171513] hover:bg-[#FAF5EB] font-aeonik font-bold text-xs uppercase tracking-widest transition-all rounded-xs shadow-lg cursor-pointer flex items-center gap-2 group"
            >
              <span>Explore collection</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onWatchVideo}
              className="px-6 py-3.5 bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/30 text-white font-aeonik font-medium text-xs uppercase tracking-widest transition-all rounded-xs cursor-pointer flex items-center gap-2.5 group"
            >
              <div className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-2.5 h-2.5 fill-black ml-0.5" />
              </div>
              <span>Watch Film</span>
            </button>

            {onOpenStyleQuiz && (
              <button
                onClick={onOpenStyleQuiz}
                className="px-6 py-3.5 bg-[#FAF5EB]/15 hover:bg-[#FAF5EB]/25 backdrop-blur-md border border-[#C9B28B]/60 text-[#FAF5EB] font-aeonik font-bold text-xs uppercase tracking-widest transition-all rounded-xs cursor-pointer flex items-center gap-2 group shadow-sm hover:border-[#C9B28B]"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C9B28B] group-hover:rotate-12 transition-transform" />
                <span>Style Diagnostic</span>
              </button>
            )}
          </div>

          {/* Quick department toggle link */}
          {onSelectGender && (
            <div className="pt-2 text-xs font-mono text-white/70">
              <button
                onClick={() => onSelectGender('WOMEN')}
                className="hover:text-white underline transition-colors cursor-pointer"
              >
                ← Switch to Women's Collection
              </button>
            </div>
          )}
        </div>

        {/* Bottom Right Floating Play Pill (Matches template lightbox action) */}
        <button
          onClick={onWatchVideo}
          className="absolute bottom-8 right-8 z-20 hidden md:flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/30 text-white text-xs font-aeonik uppercase tracking-wider rounded-full transition-all cursor-pointer group"
        >
          <Play className="w-3.5 h-3.5 fill-white group-hover:scale-110 transition-transform" />
          <span>Play Reel</span>
        </button>
      </section>

      {/* ========================================================================= */}
      {/* LUXURY TRUST VAULT PILLARS                                                */}
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
                  Individual authenticated archival menswear garments with real-time reservation locks to prevent duplicate checkout.
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
                  Physical atelier multi-point authentication inspection in Dhaka &amp; New York. Permanent lifetime guarantee.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FEATURED CAMPAIGNS: TWO HERO-STYLE BANNERS WITH HOVER-ZOOM               */}
      {/* ========================================================================= */}
      <section className="border-b border-[#E8E2D8] bg-[#FAF8F5] py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#FAF5EB] border border-[#C9B28B]/40 rounded-full text-[11px] font-mono tracking-[0.22em] uppercase text-[#9E7D47] font-semibold mb-4 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#9E7D47]" />
              <span>Curated Campaigns · 2026 Archive</span>
            </div>
            <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#171513]">
              Featured <span className="italic font-normal">campaigns</span>
            </h2>
            <p className="font-sans text-sm sm:text-base text-[#5C5449] mt-3 leading-relaxed">
              Explore the two defining pillars of modern menswear: the rigorous architectural drape of bespoke tailoring, and the raw living patina of 1990s archival streetwear.
            </p>
          </div>

          {/* Two Hero-Style Campaign Banners with Hover-Zoom */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
            {/* Campaign 1: Tailoring */}
            <div
              onClick={() => onExploreShop('cat_tailoring')}
              className="group relative overflow-hidden rounded-xs border border-[#E2DACD] shadow-md bg-[#100E0D] cursor-pointer min-h-[500px] sm:min-h-[560px] lg:min-h-[600px] flex flex-col justify-between p-7 sm:p-10 transition-all duration-500 hover:shadow-2xl hover:border-[#9E7D47]"
            >
              {/* Hero Image with Smooth Hover-Zoom Effect */}
              <img
                src="https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1600&q=85"
                alt="Men's Tailoring Campaign"
                className="absolute inset-0 w-full h-full object-cover object-center brightness-[0.82] contrast-[1.08] group-hover:scale-108 transition-transform duration-700 ease-out"
              />

              {/* Cinematic Vignette Gradients */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/40 to-black/25 pointer-events-none group-hover:from-black/95 transition-colors duration-500" />
              <div className="absolute inset-0 bg-radial from-transparent via-black/20 to-black/50 pointer-events-none" />

              {/* Top Floating Badge */}
              <div className="relative z-10 flex items-center justify-between w-full">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-md border border-white/20 text-[#FAF5EB] text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.2em] rounded-xs shadow-sm">
                  <Scissors className="w-3.5 h-3.5 text-[#C9B28B]" />
                  <span>Campaign 01 · Artisanal Craft</span>
                </span>
                <span className="text-[11px] font-mono uppercase text-white/70 tracking-widest hidden sm:inline-block">
                  Sartorial Discipline
                </span>
              </div>

              {/* Bottom Editorial Content */}
              <div className="relative z-10 space-y-4 pt-16">
                <div className="space-y-2">
                  <div className="text-[11px] font-mono tracking-[0.22em] uppercase text-[#C9B28B] font-semibold">
                    Haute Tailoring &amp; Suiting
                  </div>
                  <h3 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-normal text-white leading-tight drop-shadow-sm">
                    Tailoring
                  </h3>
                </div>

                <p className="font-sans text-xs sm:text-sm text-[#DDD5C7] leading-relaxed max-w-md font-light">
                  Deconstructed Japanese wool gabardine, Savile Row structured shoulders, and raw horn buttons. Preserving museum-grade 1-of-1 silhouettes with millimeter flat measurements.
                </p>

                <div className="pt-2">
                  <span className="inline-flex items-center gap-2.5 px-6 py-3 bg-white text-[#171513] group-hover:bg-[#FAF5EB] group-hover:text-black font-aeonik font-bold text-xs uppercase tracking-widest transition-all rounded-xs shadow-lg">
                    <span>Explore Tailoring</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
                  </span>
                </div>
              </div>
            </div>

            {/* Campaign 2: Vintage Streetwear */}
            <div
              onClick={() => onExploreShop('cat_vintage_streetwear')}
              className="group relative overflow-hidden rounded-xs border border-[#E2DACD] shadow-md bg-[#100E0D] cursor-pointer min-h-[500px] sm:min-h-[560px] lg:min-h-[600px] flex flex-col justify-between p-7 sm:p-10 transition-all duration-500 hover:shadow-2xl hover:border-[#9E7D47]"
            >
              {/* Hero Image with Smooth Hover-Zoom Effect */}
              <img
                src="https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1600&q=85"
                alt="Men's Vintage Streetwear Campaign"
                className="absolute inset-0 w-full h-full object-cover object-center brightness-[0.82] contrast-[1.08] group-hover:scale-108 transition-transform duration-700 ease-out"
              />

              {/* Cinematic Vignette Gradients */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/40 to-black/25 pointer-events-none group-hover:from-black/95 transition-colors duration-500" />
              <div className="absolute inset-0 bg-radial from-transparent via-black/20 to-black/50 pointer-events-none" />

              {/* Top Floating Badge */}
              <div className="relative z-10 flex items-center justify-between w-full">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-md border border-white/20 text-[#FAF5EB] text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.2em] rounded-xs shadow-sm">
                  <Flame className="w-3.5 h-3.5 text-[#C9B28B]" />
                  <span>Campaign 02 · Living Patina</span>
                </span>
                <span className="text-[11px] font-mono uppercase text-white/70 tracking-widest hidden sm:inline-block">
                  Subcultural Relics
                </span>
              </div>

              {/* Bottom Editorial Content */}
              <div className="relative z-10 space-y-4 pt-16">
                <div className="space-y-2">
                  <div className="text-[11px] font-mono tracking-[0.22em] uppercase text-[#C9B28B] font-semibold">
                    Cult Grails &amp; Archive Subversion
                  </div>
                  <h3 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-normal text-white leading-tight drop-shadow-sm">
                    Vintage Streetwear
                  </h3>
                </div>

                <p className="font-sans text-xs sm:text-sm text-[#DDD5C7] leading-relaxed max-w-md font-light">
                  1990s Tokyo Ura-Harajuku, Raf Simons early runway bombers, and hand-darned sashiko selvedge denim with verified era distressing and physical intake seal.
                </p>

                <div className="pt-2">
                  <span className="inline-flex items-center gap-2.5 px-6 py-3 bg-white text-[#171513] group-hover:bg-[#FAF5EB] group-hover:text-black font-aeonik font-bold text-xs uppercase tracking-widest transition-all rounded-xs shadow-lg">
                    <span>Explore Vintage Streetwear</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* STYLE QUIZ ARCHIVE AESTHETIC DISCOVERY SECTION                            */}
      {/* ========================================================================= */}
      {onOpenStyleQuiz && (
        <section className="border-b border-[#E8E2D8] bg-[#171513] text-white py-14 sm:py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-black via-[#1E1B18] to-black opacity-90 pointer-events-none" />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8 bg-[#231F1C]/80 border border-[#C9B28B]/30 p-8 sm:p-12 rounded-xs shadow-xl">
              <div className="space-y-3.5 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 rounded-full text-[10px] font-mono tracking-widest uppercase text-[#C9B28B]">
                  <Sparkles className="w-3.5 h-3.5 text-[#C9B28B]" />
                  <span>Aesthetic Studio Diagnostic</span>
                </div>
                <h3 className="font-editorial text-2xl sm:text-3xl lg:text-4xl text-white leading-tight font-normal">
                  Find Your Archival <span className="italic font-light">Aesthetic Archetype</span>
                </h3>
                <p className="text-xs sm:text-sm text-[#D5CFC6] leading-relaxed font-sans">
                  Whether drawn to the architectural restraint of Minimalist Luxury, the lived-in rebellion of 90s Archive Streetwear, or the razor lines of Savile Row Tailoring — our interactive questionnaire decodes your signature silhouette and matches authenticated vault pieces.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono text-[#C9B28B]">
                  <span className="px-2.5 py-1 bg-black/40 border border-[#C9B28B]/30 rounded-2xs">Minimalist</span>
                  <span className="px-2.5 py-1 bg-black/40 border border-[#C9B28B]/30 rounded-2xs">Archive Streetwear</span>
                  <span className="px-2.5 py-1 bg-black/40 border border-[#C9B28B]/30 rounded-2xs">Vintage Tailoring</span>
                  <span className="px-2.5 py-1 bg-black/40 border border-[#C9B28B]/30 rounded-2xs">Avant-Garde</span>
                </div>
              </div>

              <div className="shrink-0 w-full sm:w-auto">
                <button
                  onClick={onOpenStyleQuiz}
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
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: "the story" EDITORIAL SECTION (With Men's Images)              */}
      {/* ========================================================================= */}
      <section className="border-b border-[#E8E2D8] bg-[#FAF8F5] py-20 lg:py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Column: Men's Portrait + Story Narrative (Matches Template Layout) */}
            <div className="lg:col-span-6 space-y-8">
              <div className="relative overflow-hidden rounded-xs border border-[#E2DACD] shadow-sm aspect-[4/5] max-w-md mx-auto lg:mx-0 group bg-[#EFE9DF]">
                {/* Man's Editorial Portrait Image */}
                <img
                  src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1200&q=85"
                  alt="One Vintage Menswear - The Story"
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
                    onClick={() => onExploreShop('ALL')}
                    className="inline-flex items-center gap-2 text-xs font-aeonik font-bold uppercase tracking-widest text-[#171513] border-b-2 border-[#171513] pb-1 hover:text-[#9E7D47] hover:border-[#9E7D47] transition-all cursor-pointer"
                  >
                    <span>Discover more</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: High-Fashion Menswear Runway Visual */}
            <div className="lg:col-span-6">
              <div className="relative overflow-hidden rounded-xs border border-[#E2DACD] shadow-md aspect-[4/5] group bg-[#EFE9DF]">
                <img
                  src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=1400&q=85"
                  alt="Runway Haute Couture Menswear Atelier"
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
      {/* SECTION 3: "Fall collection" / "Cashmere — wool yarns" (Men's Image)     */}
      {/* ========================================================================= */}
      <section className="border-b border-[#E8E2D8] bg-[#FAF8F5] py-20 lg:py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Column: Men's Image with floating "Cashmere — wool yarns" pill */}
            <div className="lg:col-span-6 relative">
              <div className="relative overflow-hidden rounded-xs border border-[#E2DACD] shadow-md aspect-[4/5] group bg-[#EFE9DF]">
                {/* Man's Luxury Cashmere Overcoat Image */}
                <img
                  src="https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=1200&q=85"
                  alt="Cashmere and wool yarns - Menswear"
                  className="w-full h-full object-cover object-center group-hover:scale-104 transition-transform duration-700"
                />
                <div className="absolute bottom-6 left-6 z-10">
                  <span className="px-4 py-2 bg-white/90 backdrop-blur-md text-[#171513] border border-[#E2DACD] font-mono text-xs uppercase tracking-wider rounded-xs shadow-sm font-semibold">
                    Cashmere — wool yarns
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Collection details (Matches Template Content) */}
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
                  onClick={() => onExploreShop('cat_outerwear')}
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
      {/* SECTION 4: EDITORIAL THREE-CARD SHOWCASE TRIPTYCH (Men's Images)          */}
      {/* ========================================================================= */}
      <section className="border-b border-[#E8E2D8] bg-white py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Top Quote (Exact quote from template) */}
          <div className="text-center max-w-2xl mx-auto">
            <p className="font-editorial text-xl sm:text-2xl md:text-3xl text-[#171513] leading-relaxed italic font-normal">
              "Is about you being confident self, no matter what others say or think"
            </p>
          </div>

          {/* 3 Column Grid Cards (Matches template structure with Men's photos) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Ready to wear (Men's Suiting/Tailoring) */}
            <div
              onClick={() => onExploreShop('cat_rtw')}
              className="group cursor-pointer flex flex-col space-y-4"
            >
              <div className="relative overflow-hidden rounded-xs border border-[#E2DACD] aspect-[3/4] bg-[#F5EFE6]">
                <img
                  src="https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=1000&q=85"
                  alt="Men's Ready to wear"
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

            {/* Card 2: Accessories (Men's Boots & Leather) */}
            <div
              onClick={() => onExploreShop('cat_accessories')}
              className="group cursor-pointer flex flex-col space-y-4"
            >
              <div className="relative overflow-hidden rounded-xs border border-[#E2DACD] aspect-[3/4] bg-[#F5EFE6]">
                <img
                  src="https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=1000&q=85"
                  alt="Men's Accessories"
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

            {/* Card 3: On sale now (Men's Archival Bombers & Grails) */}
            <div
              onClick={() => onExploreShop('cat_sale')}
              className="group cursor-pointer flex flex-col space-y-4"
            >
              <div className="relative overflow-hidden rounded-xs border border-[#E2DACD] aspect-[3/4] bg-[#F5EFE6]">
                <img
                  src="https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1000&q=85"
                  alt="Men's Archival Grails On sale now"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="flex items-center justify-between border-b border-[#E2DACD] pb-2">
                <span className="font-aeonik font-bold text-base uppercase tracking-wider text-[#171513] group-hover:text-[#9E7D47] transition-colors">
                  On sale now
                </span>
                <ArrowRight className="w-4 h-4 text-[#171513] group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 5: SUSTAINABILITY ("EVERY DETAIL MATTER")                         */}
      {/* ========================================================================= */}
      <section className="border-b border-[#E8E2D8] bg-[#FAF8F5] py-20 lg:py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Column: Sustainability Narrative */}
            <div className="lg:col-span-5 space-y-6">
              <div className="text-xs font-mono tracking-[0.2em] uppercase text-[#9E7D47] font-semibold">
                Sustainability
              </div>

              <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#171513] uppercase">
                EVERY DETAIL MATTER
              </h2>

              <p className="font-sans text-sm sm:text-base text-[#5C5449] leading-relaxed">
                Since 2012, Sairat Couture products have been made to last across generations, with a no-compromises approach to quality.
              </p>

              <div className="pt-2">
                <button
                  onClick={() => onExploreShop('ALL')}
                  className="inline-flex items-center gap-2 text-xs font-aeonik font-bold uppercase tracking-widest text-[#171513] border-b-2 border-[#171513] pb-1 hover:text-[#9E7D47] hover:border-[#9E7D47] transition-all cursor-pointer"
                >
                  <span>Learn more</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right Column: Menswear Tailoring & Craftsmanship Image */}
            <div className="lg:col-span-7">
              <div className="relative overflow-hidden rounded-xs border border-[#E2DACD] shadow-md aspect-[16/9] group bg-[#EFE9DF]">
                <img
                  src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1600&q=85"
                  alt="Every Detail Matter - Menswear Tailoring Atelier"
                  className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-700"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 6: FLAGSHIP STOREFRONT ("Innove Couture New York")                 */}
      {/* ========================================================================= */}
      <section className="bg-white py-20 lg:py-28 border-b border-[#E8E2D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Column: Location & Hours Details */}
            <div className="lg:col-span-5 space-y-6">
              <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#171513]">
                Sairat Couture New York
              </h2>

              <div className="space-y-1 font-sans text-sm sm:text-base text-[#5C5449]">
                <p>217 Tueri Junction, New York, NY 10002</p>
                <p>10:00 am – 7:00 pm Daily</p>
                <p className="text-xs font-mono text-[#9E7D47] pt-2">
                  Road 11, Banani Archival Vault &amp; Salons, Dhaka
                </p>
              </div>

              <div className="pt-2">
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-aeonik font-bold uppercase tracking-widest text-[#171513] border-b-2 border-[#171513] pb-1 hover:text-[#9E7D47] hover:border-[#9E7D47] transition-all cursor-pointer"
                >
                  <span>Get direction</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Right Column: Storefront Visual */}
            <div className="lg:col-span-7">
              <div className="relative overflow-hidden rounded-xs border border-[#E2DACD] shadow-md aspect-[16/9] group bg-[#EFE9DF]">
                <img
                  src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=85"
                  alt="Sairat Couture Storefront"
                  className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-6 left-6 text-white text-xs font-mono uppercase tracking-widest">
                  VIP Fitting &amp; Archival Consignment Salons
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
