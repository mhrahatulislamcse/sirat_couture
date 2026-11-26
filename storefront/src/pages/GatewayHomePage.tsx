import React from 'react';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Ruler,
  UserCheck,
  Repeat,
  Compass,
  Layers,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { Product } from '../types/resale';
import { User } from '../types/auth';

interface GatewayHomePageProps {
  products: Product[];
  currentUser: User | null;
  onSelectDepartment: (dept: 'men' | 'women') => void;
  onNavigateToShop: (filters?: { gender?: string }) => void;
  onDemoSignIn: (identifier: string) => void;
  onOpenAuthModal: () => void;
}

export function GatewayHomePage({
  products,
  currentUser,
  onSelectDepartment,
  onNavigateToShop,
  onDemoSignIn,
  onOpenAuthModal
}: GatewayHomePageProps) {
  const menCount = products.filter((p) => p.gender === 'MEN' || p.gender === 'UNISEX').length;
  const womenCount = products.filter((p) => p.gender === 'WOMEN' || p.gender === 'UNISEX').length;

  return (
    <div className="w-full bg-[#FAF8F5]">
      {/* ========================================================================= */}
      {/* SPLIT EDITORIAL GATEWAY HERO (Men's Runway vs Women's Archival)           */}
      {/* ========================================================================= */}
      <section className="relative w-full border-b border-[#E8E2D8] bg-[#171513]">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[85vh]">
          {/* LEFT PORTAL: MEN'S RUNWAY & STREETWEAR */}
          <div
            onClick={() => onSelectDepartment('men')}
            className="group relative flex flex-col justify-between p-8 sm:p-12 lg:p-16 border-b lg:border-b-0 lg:border-r border-[#2C2722] overflow-hidden cursor-pointer bg-[#0D0C0A]"
          >
            {/* Background Image with Hover Scale */}
            <img
              src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1400&q=80"
              alt="Men's Runway Vault"
              className="absolute inset-0 w-full h-full object-cover object-center brightness-[0.55] contrast-[1.1] group-hover:scale-106 group-hover:brightness-[0.65] transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

            {/* Top Badge */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[11px] font-mono uppercase tracking-[0.2em] rounded-full">
                Department I
              </span>
              <span className="text-white/80 font-mono text-xs">
                {menCount} Vaulted Grails
              </span>
            </div>

            {/* Center / Bottom Content */}
            <div className="relative z-10 mt-32 space-y-4 text-white">
              <div className="text-xs font-mono uppercase tracking-[0.25em] text-[#E5B869] font-bold">
                Streetwear · Tailoring · Japanese Denim
              </div>

              <h2 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-white leading-tight">
                Men’s <span className="italic font-light">Runway Vault</span>
              </h2>

              <p className="font-sans text-sm text-white/80 max-w-md leading-relaxed">
                Curated archive from Raf Simons, Undercover, Rick Owens, and Visvim. Sized with manual flat dimensions.
              </p>

              <div className="pt-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectDepartment('men');
                  }}
                  className="px-6 py-3.5 bg-white text-[#171513] hover:bg-[#FAF5EB] font-aeonik font-bold text-xs uppercase tracking-widest transition-all rounded-xs shadow-lg cursor-pointer inline-flex items-center gap-2 group-hover:translate-x-1 duration-300"
                >
                  <span>Enter Men's Vault</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT PORTAL: WOMEN'S ARCHIVAL & HAUTE COUTURE */}
          <div
            onClick={() => onSelectDepartment('women')}
            className="group relative flex flex-col justify-between p-8 sm:p-12 lg:p-16 overflow-hidden cursor-pointer bg-[#140A0F]"
          >
            {/* Background Image with Hover Scale */}
            <img
              src="https://innovecouture.vamtam.com/wp-content/uploads/2024/01/pexels-cottonbro-studio-9836585-1-scaled.jpg"
              alt="Women's Archival Vault"
              className="absolute inset-0 w-full h-full object-cover object-center brightness-[0.55] contrast-[1.1] group-hover:scale-106 group-hover:brightness-[0.65] transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

            {/* Top Badge */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[11px] font-mono uppercase tracking-[0.2em] rounded-full">
                Department II
              </span>
              <span className="text-white/80 font-mono text-xs">
                {womenCount} Vaulted Grails
              </span>
            </div>

            {/* Center / Bottom Content */}
            <div className="relative z-10 mt-32 space-y-4 text-white">
              <div className="text-xs font-mono uppercase tracking-[0.25em] text-[#F3D5DE] font-bold">
                Haute Couture · Luxury Bags · Archival Silk
              </div>

              <h2 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-white leading-tight">
                Women’s <span className="italic font-light">Archival Vault</span>
              </h2>

              <p className="font-sans text-sm text-white/80 max-w-md leading-relaxed">
                Phoebe Philo tailoring, vintage Vivienne Westwood corsetry, and rare Hermès leather authenticated in Dhaka.
              </p>

              <div className="pt-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectDepartment('women');
                  }}
                  className="px-6 py-3.5 bg-white text-[#171513] hover:bg-[#FAF5EB] font-aeonik font-bold text-xs uppercase tracking-widest transition-all rounded-xs shadow-lg cursor-pointer inline-flex items-center gap-2 group-hover:translate-x-1 duration-300"
                >
                  <span>Enter Women's Vault</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* INTERACTIVE PERSONA & REDIRECTION TEST SUITE (Post-Login Routing Logic)    */}
      {/* ========================================================================= */}
      <section className="border-b border-[#E8E2D8] bg-[#FAF5EB] py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-[#E0D7C9] rounded-xs p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E2D8]">
              <div>
                <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-[#9E7D47] font-semibold">
                  <UserCheck className="w-4 h-4" />
                  <span>Interactive Authentication & Gender Redirection Test Suite</span>
                </div>
                <h3 className="font-aeonik text-xl sm:text-2xl font-bold text-[#171513] mt-1">
                  Test Post-Login Routing Logic
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenAuthModal}
                  className="px-4 py-2 bg-[#171513] text-[#FAF5EB] text-xs font-mono uppercase tracking-wider rounded-xs hover:bg-[#9E7D47] transition-colors cursor-pointer"
                >
                  Open Profile / Register
                </button>
              </div>
            </div>

            <p className="font-sans text-xs sm:text-sm text-[#5C5449] leading-relaxed">
              Click any profile below to verify instant automated redirection driven by customer profile gender & preferences, stored seamlessly in cookies (<code className="font-mono bg-[#FAF8F5] px-1 py-0.5 border border-[#DDD5C7]">preferred_storefront=men|women</code>):
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Persona 1: Men's Collector */}
              <button
                onClick={() => onDemoSignIn('usr_tariq_men')}
                className="p-4 border border-[#DDD5C7] hover:border-[#171513] hover:bg-[#FAF8F5] rounded-xs text-left transition-all cursor-pointer group flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-aeonik font-bold text-sm text-[#171513]">
                      Tariq Rahman
                    </span>
                    <span className="px-2 py-0.5 bg-[#171513] text-white text-[9px] font-mono rounded-2xs font-semibold">
                      GENDER: MEN
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-[#7A7165]">
                    tariq.rahman@menswear.com
                  </div>
                  <p className="text-xs text-[#5C5449] pt-1">
                    Automated Action: Signs in and immediately routes to <code className="text-[#9E7D47] font-bold">/men</code>.
                  </p>
                </div>
                <div className="text-xs font-mono text-[#171513] font-bold uppercase tracking-wider flex items-center gap-1 group-hover:text-[#9E7D47]">
                  <span>Sign In & Route to /men</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>

              {/* Persona 2: Women's Curator */}
              <button
                onClick={() => onDemoSignIn('usr_zara_women')}
                className="p-4 border border-[#DDD5C7] hover:border-[#171513] hover:bg-[#FAF8F5] rounded-xs text-left transition-all cursor-pointer group flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-aeonik font-bold text-sm text-[#171513]">
                      Zara Huq
                    </span>
                    <span className="px-2 py-0.5 bg-[#4A1521] text-white text-[9px] font-mono rounded-2xs font-semibold">
                      GENDER: WOMEN
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-[#7A7165]">
                    zara.huq@hautevault.com
                  </div>
                  <p className="text-xs text-[#5C5449] pt-1">
                    Automated Action: Signs in and immediately routes to <code className="text-[#9E7D47] font-bold">/women</code>.
                  </p>
                </div>
                <div className="text-xs font-mono text-[#171513] font-bold uppercase tracking-wider flex items-center gap-1 group-hover:text-[#9E7D47]">
                  <span>Sign In & Route to /women</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>

              {/* Persona 3: Unspecified Explorer */}
              <button
                onClick={() => onDemoSignIn('usr_alex_unspecified')}
                className="p-4 border border-[#DDD5C7] hover:border-[#171513] hover:bg-[#FAF8F5] rounded-xs text-left transition-all cursor-pointer group flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-aeonik font-bold text-sm text-[#171513]">
                      Alex Roy
                    </span>
                    <span className="px-2 py-0.5 bg-[#5C5449] text-white text-[9px] font-mono rounded-2xs font-semibold">
                      GENDER: UNSPECIFIED
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-[#7A7165]">
                    alex.roy@archivegateway.com
                  </div>
                  <p className="text-xs text-[#5C5449] pt-1">
                    Automated Action: Remains on <code className="text-[#9E7D47] font-bold">/</code> (Gateway Page with quick selectors).
                  </p>
                </div>
                <div className="text-xs font-mono text-[#171513] font-bold uppercase tracking-wider flex items-center gap-1 group-hover:text-[#9E7D47]">
                  <span>Sign In & Stay on Gateway (/)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* QUICK SELECTORS & COMBINED CATALOG CTA                                    */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-20 border-b border-[#E8E2D8] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#9E7D47] font-semibold">
              Unified Vault Access
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl text-[#171513] font-normal tracking-tight">
              Or browse the <span className="italic">complete archival catalog</span>
            </h2>
            <p className="font-sans text-xs sm:text-sm text-[#5C5449] leading-relaxed">
              Prefer to cross-browse without filtering by gender? Filter by condition grade, era, brand, or size measurements.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onSelectDepartment('men')}
              className="px-6 py-3 bg-[#171513] text-[#FAF5EB] hover:bg-[#9E7D47] text-xs font-aeonik font-bold uppercase tracking-widest rounded-xs transition-colors cursor-pointer"
            >
              Men’s Vault ({menCount})
            </button>
            <button
              onClick={() => onSelectDepartment('women')}
              className="px-6 py-3 bg-[#171513] text-[#FAF5EB] hover:bg-[#9E7D47] text-xs font-aeonik font-bold uppercase tracking-widest rounded-xs transition-colors cursor-pointer"
            >
              Women’s Vault ({womenCount})
            </button>
            <button
              onClick={() => onNavigateToShop({ gender: 'ALL' })}
              className="px-6 py-3 bg-[#FAF5EB] text-[#171513] border border-[#DED7CB] hover:border-[#171513] text-xs font-aeonik font-bold uppercase tracking-widest rounded-xs transition-colors cursor-pointer"
            >
              Combined Vault ({products.length})
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
