import React, { useState, useMemo } from 'react';
import {
  X,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  RefreshCw,
  ShoppingBag,
  Eye,
  Share2,
  Sliders,
  ShieldCheck,
  Compass,
  Layers,
  Palette,
  Footprints,
  History,
  Sparkle
} from 'lucide-react';
import { Product } from '../types/resale';

export type AestheticId = 'minimalist' | 'archive_streetwear' | 'vintage_tailoring' | 'avant_garde';

export interface AestheticArchetype {
  id: AestheticId;
  name: string;
  tagline: string;
  badge: string;
  quote: string;
  description: string;
  colorPalette: { name: string; hex: string }[];
  stylingTips: string[];
  keyDesigners: string[];
  heroImage: string;
}

export const AESTHETIC_ARCHETYPES: Record<AestheticId, AestheticArchetype> = {
  minimalist: {
    id: 'minimalist',
    name: 'Minimalist Luxury & Quiet Form',
    tagline: 'Understated elegance, architectural drape & pure tactile luxury',
    badge: 'ARCHETYPE 01 · QUIET PURIST',
    quote: '"Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away."',
    description: 'You believe in form unburdened by noise. Your wardrobe prioritizes sumptuous fabrications — double-faced cashmere, crisp virgin wools, unlined silks — paired with fluid, deliberate silhouettes and understated monochrome palettes.',
    colorPalette: [
      { name: 'Alabaster / Ecru', hex: '#F4EFE6' },
      { name: 'Warm Camel', hex: '#C29B38' },
      { name: 'Slate Charcoal', hex: '#3E3A37' },
      { name: 'Deep Obsidian', hex: '#171513' }
    ],
    stylingTips: [
      'Focus on fabric weight and movement rather than surface embellishment.',
      'Ground fluid, floor-sweeping trousers with structured leather loafers or sleek derbies.',
      'Invest in one sculptural leather carryall that outlasts ephemeral micro-trends.'
    ],
    keyDesigners: ['The Row', 'Jil Sander', 'Lemaire', 'Celine (Phoebe Philo Era)'],
    heroImage: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=80'
  },
  archive_streetwear: {
    id: 'archive_streetwear',
    name: 'Archive Streetwear & Cult Grails',
    tagline: 'Subcultural rebellion, raw Japanese denim & 90s/2000s runway grails',
    badge: 'ARCHETYPE 02 · CULT ARCHIVIST',
    quote: '"Clothes that carry the scars, manifestos, and industrial grit of youth subculture movements."',
    description: 'You see garments as historical artifacts. You crave the oversized proportions of turn-of-the-century Antwerp and Tokyo runways — distressed bombers, graphic screenprints, raw selvedge denim, and authentic military surplus details.',
    colorPalette: [
      { name: 'Faded Military Olive', hex: '#4B5320' },
      { name: 'Washed Carbon', hex: '#2B2B2B' },
      { name: 'Distressed Indigo', hex: '#2A3C4D' },
      { name: 'Sun-Bleached Bone', hex: '#E6DFC8' }
    ],
    stylingTips: [
      'Layer boxy, cropped outerwear over elongated vintage cotton tees and drop-shoulder knits.',
      'Balance heavyweight selvedge denim stacking with archival high-top trainers or combat boots.',
      'Embrace authentic patina, natural distressing, and vintage hardware wear as badges of provenance.'
    ],
    keyDesigners: ['Raf Simons', 'Undercover', 'Helmut Lang', 'Number (N)ine'],
    heroImage: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1200&q=80'
  },
  vintage_tailoring: {
    id: 'vintage_tailoring',
    name: 'Vintage Tailoring & Savile Row',
    tagline: 'Razor-cut lapels, bespoke drape & timeless dandyist elegance',
    badge: 'ARCHETYPE 03 · SARTORIAL VIRTUOSO',
    quote: '"A tailored suit is armor for everyday life, constructed with centuries of bespoke discipline."',
    description: 'You appreciate the enduring majesty of bespoke craft. Crisp double-breasted blazers, high-rise pleated trousers, silk jacquards, and heirloom leather Chelsea boots define your wardrobe with aristocratic poise.',
    colorPalette: [
      { name: 'Midnight Navy', hex: '#131E3A' },
      { name: 'Chalk Pinstripe Grey', hex: '#4A4A4A' },
      { name: 'Deep Oxblood', hex: '#4A0E17' },
      { name: 'Antique Gold', hex: '#9E7D47' }
    ],
    stylingTips: [
      'Pair structured structured blazers with relaxed, wide-leg trousers for modern ease.',
      'Incorporate subtle texture clashes — wool flannel against fluid silk crepe or fine gauge knitwear.',
      'Finish your silhouette with hand-welted leather footwear and polished brass or silver accents.'
    ],
    keyDesigners: ['Savile Row Ateliers', 'Saint Laurent', 'Dries Van Noten', 'Tom Ford'],
    heroImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80'
  },
  avant_garde: {
    id: 'avant_garde',
    name: 'Avant-Garde & Artisanal Darkwear',
    tagline: 'Asymmetric drapery, sculptural drop silhouettes & deconstructed form',
    badge: 'ARCHETYPE 04 · BRUTALIST VISIONARY',
    quote: '"True luxury is the courage to deconstruct convention and embrace the shadow of silhouette."',
    description: 'You reject the ordinary in favor of sculptured darkness. Split-toe Tabi boots, exaggerated dropped-crotch trousers, cracked bianchetto finishes, and asymmetric hems form your wearable art statement.',
    colorPalette: [
      { name: 'Pitch Obsidian', hex: '#0D0D0D' },
      { name: 'Bianchetto White', hex: '#EAE6DF' },
      { name: 'Mineral Asphalt', hex: '#262423' },
      { name: 'Raw Ochre Dirt', hex: '#634832' }
    ],
    stylingTips: [
      'Contrast elongated, unstructured tops against sculptural bottom half proportions.',
      'Let distinctive footwear like split-toe Tabi boots or chunky lugged soles act as the sculptural anchor.',
      'Mix differing weights of monochromatic black — matteTE cotton alongside waxed lambskin.'
    ],
    keyDesigners: ['Rick Owens', 'Maison Margiela', 'Yohji Yamamoto', 'Comme des Garçons'],
    heroImage: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80'
  }
};

interface QuestionOption {
  label: string;
  description: string;
  archetype: AestheticId;
  tag: string;
}

interface Question {
  id: number;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  options: QuestionOption[];
}

const QUIZ_QUESTIONS: Question[] = [
  {
    id: 1,
    title: 'SILHOUETTE & PROPORTION',
    subtitle: 'Which silhouette philosophy commands your primary wardrobe vision?',
    icon: <Layers className="w-4 h-4 text-[#9E7D47]" />,
    options: [
      {
        label: 'Fluid & Architectural Purity',
        description: 'Clean, serene lines, unencumbered draping, and relaxed yet noble volumes with zero clutter.',
        archetype: 'minimalist',
        tag: 'Pure Silhouette'
      },
      {
        label: 'Layered Utility & Oversized Grails',
        description: 'Boxy bomber shoulders, dropped armholes, elongated hems, and functional street utility.',
        archetype: 'archive_streetwear',
        tag: 'Oversized Boxy'
      },
      {
        label: 'Bespoke Structure & Razor Tailoring',
        description: 'Crisply roped shoulders, double-breasted lapels, cinched waists, and pristine pleated drape.',
        archetype: 'vintage_tailoring',
        tag: 'Sharp Tailored'
      },
      {
        label: 'Radical Asymmetry & Dark Drapes',
        description: 'Exaggerated dropped-crotch Bela trousers, extended drawstrings, and deconstructed brutalist edges.',
        archetype: 'avant_garde',
        tag: 'Sculptural Deconstruction'
      }
    ]
  },
  {
    id: 2,
    title: 'PALETTE & TACTILE TEXTURES',
    subtitle: 'Which textural landscape resonates deepest with your aesthetic instinct?',
    icon: <Palette className="w-4 h-4 text-[#9E7D47]" />,
    options: [
      {
        label: 'Monochromatic Serenity',
        description: 'Double-faced cashmere, brushed silk, and warm neutrals from ivory to deep charcoal.',
        archetype: 'minimalist',
        tag: 'Cashmere & Neutrals'
      },
      {
        label: 'Industrial & Weathered Patina',
        description: 'Heavy washed olive flight nylon, distressed raw Japanese denim, and aged vintage graphic washes.',
        archetype: 'archive_streetwear',
        tag: 'Nylon & Selvedge'
      },
      {
        label: 'Savile Row Heirloom Weaves',
        description: 'Super 150s wool flannel, chalk pinstripes, houndstooth, and opulent silk brocades.',
        archetype: 'vintage_tailoring',
        tag: 'Fine Wool & Pinstripe'
      },
      {
        label: 'Artisanal Obsidian & Crackle',
        description: 'Cracked white Bianchetto gesso over espresso calfskin, mineral-washed cotton, and raw distressed edges.',
        archetype: 'avant_garde',
        tag: 'Bianchetto & Darkwear'
      }
    ]
  },
  {
    id: 3,
    title: 'FOUNDATIONAL FOOTWEAR',
    subtitle: 'Which footwear piece anchors your definitive daily look?',
    icon: <Footprints className="w-4 h-4 text-[#9E7D47]" />,
    options: [
      {
        label: 'Polished Minimalist Loafers & Derbies',
        description: 'Clean spazzolato leather loafers, refined round-toe derbies, or sleek sculptural mules.',
        archetype: 'minimalist',
        tag: 'Spazzolato Loafer'
      },
      {
        label: 'Archival Trainers & Combat Grails',
        description: 'Late 90s high-top trainers, scuffed skate sneakers, or vintage Belgian combat boots.',
        archetype: 'archive_streetwear',
        tag: 'Archive Runners'
      },
      {
        label: 'Hand-Welted Chelsea & Oxford Boots',
        description: 'Goodyear-welted English Chelsea boots, wingtip brogues, or polished black leather dress shoes.',
        archetype: 'vintage_tailoring',
        tag: 'Chelsea Boots'
      },
      {
        label: 'Split-Toe Tabi & Tractor Soles',
        description: 'Artisanal Margiela split-toe Tabi boots, lugged creepers, or deconstructed cracked-leather boots.',
        archetype: 'avant_garde',
        tag: 'Margiela Tabi'
      }
    ]
  },
  {
    id: 4,
    title: 'CULTURAL MOVEMENT & ERA',
    subtitle: 'Which golden era or creative runway movement stirs your imagination?',
    icon: <History className="w-4 h-4 text-[#9E7D47]" />,
    options: [
      {
        label: '90s Runway Purity & Modern Quiet Luxury',
        description: 'The sublime simplicity of 90s Milanese runway restraint and timeless luxury ateliers.',
        archetype: 'minimalist',
        tag: '90s Purity'
      },
      {
        label: 'Belgian Youth Culture & Tokyo Ura-Harajuku',
        description: 'AW01 Riot! movements, Antwerp Six subversion, and 90s Tokyo underground graphic grails.',
        archetype: 'archive_streetwear',
        tag: 'Belgian & Tokyo Grails'
      },
      {
        label: 'Golden-Age Bespoke & 70s Parisian Suiting',
        description: 'Savile Row bespoke tailoring heritage, razor-sharp French tuxedo jackets, and dandyism.',
        archetype: 'vintage_tailoring',
        tag: 'Bespoke Golden Age'
      },
      {
        label: 'Japanese Deconstructivism & Dark Parisian Atelier',
        description: 'Radical 80s Tokyo dark deconstruction, dark romance, and brutalist runway presentations.',
        archetype: 'avant_garde',
        tag: 'Dark Deconstructivism'
      }
    ]
  },
  {
    id: 5,
    title: 'ATMOSPHERE & DRESSING OCCASION',
    subtitle: 'In what atmosphere does your signature wardrobe feel most natural?',
    icon: <Compass className="w-4 h-4 text-[#9E7D47]" />,
    options: [
      {
        label: 'Sunlit Contemporary Galleries & Executive Salons',
        description: 'Quiet architectural spaces, curated design fairs, and effortless sophisticated travel.',
        archetype: 'minimalist',
        tag: 'Art & Design'
      },
      {
        label: 'Underground Listening Bars & Archive Pop-Ups',
        description: 'Dimly lit record bars, creative studio spaces, and late-night city streets with fellow collectors.',
        archetype: 'archive_streetwear',
        tag: 'Subculture & Vinyl'
      },
      {
        label: 'Private Club Dining & Formal Evening Affairs',
        description: 'Members-only clubs, evening galas, and bespoke events where sartorial poise commands the room.',
        archetype: 'vintage_tailoring',
        tag: 'Formal Evenings'
      },
      {
        label: 'Front-Row Runway Previews & Midnight Speakeasies',
        description: 'Experimental fashion weeks, brutalist concrete pavilions, and avant-garde creative gatherings.',
        archetype: 'avant_garde',
        tag: 'Fashion Week'
      }
    ]
  }
];

interface StyleQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onExploreAestheticShop?: (archetypeId: AestheticId) => void;
}

export const StyleQuizModal: React.FC<StyleQuizModalProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct,
  onAddToCart,
  onExploreAestheticShop
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, AestheticId>>({});
  const [addedItemIds, setAddedItemIds] = useState<Set<string>>(new Set());
  const [copiedShare, setCopiedShare] = useState<boolean>(false);

  // Reset quiz when opened
  const handleReset = () => {
    setCurrentStep(0);
    setAnswers({});
    setAddedItemIds(new Set());
    setCopiedShare(false);
  };

  const isCompleted = currentStep >= QUIZ_QUESTIONS.length;

  // Calculate winner archetype based on selected answers
  const diagnosedArchetypeId = useMemo<AestheticId>(() => {
    const counts: Record<AestheticId, number> = {
      minimalist: 0,
      archive_streetwear: 0,
      vintage_tailoring: 0,
      avant_garde: 0
    };

    Object.values(answers).forEach((arch) => {
      if (counts[arch] !== undefined) {
        counts[arch] += 1;
      }
    });

    const archetypes: AestheticId[] = ['minimalist', 'archive_streetwear', 'vintage_tailoring', 'avant_garde'];
    let topArchetype: AestheticId = 'minimalist';
    let maxVotes = -1;

    for (const arch of archetypes) {
      if (counts[arch] > maxVotes) {
        maxVotes = counts[arch];
        topArchetype = arch;
      }
    }

    return topArchetype;
  }, [answers]);

  const diagnosedArchetype = AESTHETIC_ARCHETYPES[diagnosedArchetypeId];

  // Match curated products from the live catalog based on the diagnosed archetype
  const curatedProducts = useMemo(() => {
    if (!products || products.length === 0) return [];

    return products
      .filter((p) => {
        const brand = (p.brand || '').toLowerCase();
        const title = (p.title || '').toLowerCase();
        const desc = (p.description || '').toLowerCase();
        const cat = (p.categoryId || '').toLowerCase();

        switch (diagnosedArchetypeId) {
          case 'minimalist':
            return (
              brand.includes('row') ||
              brand.includes('jil') ||
              brand.includes('celine') ||
              brand.includes('lemaire') ||
              brand.includes('prada') ||
              cat === 'cat_totes' ||
              desc.includes('cashmere') ||
              desc.includes('wool') ||
              title.includes('trench') ||
              title.includes('margaux')
            );

          case 'archive_streetwear':
            return (
              brand.includes('raf') ||
              brand.includes('undercover') ||
              brand.includes('helmut') ||
              brand.includes('number') ||
              brand.includes('issey') ||
              cat === 'cat_denim' ||
              cat === 'cat_vintage_streetwear' ||
              p.era === 'ERA_90S' ||
              desc.includes('bomber') ||
              desc.includes('scab')
            );

          case 'vintage_tailoring':
            return (
              brand.includes('dries') ||
              brand.includes('saint laurent') ||
              brand.includes('tom ford') ||
              brand.includes('celine') ||
              brand.includes('comme') ||
              cat === 'cat_tailoring' ||
              cat === 'cat_trousers' ||
              title.includes('blazer') ||
              title.includes('smoking') ||
              title.includes('trousers') ||
              desc.includes('tailored')
            );

          case 'avant_garde':
            return (
              brand.includes('rick') ||
              brand.includes('margiela') ||
              brand.includes('yohji') ||
              brand.includes('comme') ||
              cat === 'cat_boots' ||
              title.includes('tabi') ||
              title.includes('bela') ||
              desc.includes('drop-crotch') ||
              desc.includes('bianchetto')
            );

          default:
            return true;
        }
      })
      .slice(0, 4);
  }, [products, diagnosedArchetypeId]);

  if (!isOpen) return null;

  const currentQuestion = QUIZ_QUESTIONS[currentStep];

  const handleSelectOption = (archetype: AestheticId) => {
    setAnswers((prev) => ({
      ...prev,
      [currentStep]: archetype
    }));

    // Auto advance smoothly to the next step after quick visual selection
    setTimeout(() => {
      setCurrentStep((prev) => prev + 1);
    }, 280);
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    setAddedItemIds((prev) => new Set(prev).add(product.id));
    setTimeout(() => {
      setAddedItemIds((prev) => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }, 2000);
  };

  const handleShareAesthetic = () => {
    const text = `I just discovered my Archive Fashion Aesthetic at SAIRAT COUTURE: ${diagnosedArchetype.name} (${diagnosedArchetype.tagline}). Explore Dhaka's premier authenticated resale vault!`;
    navigator.clipboard?.writeText(text);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl bg-[#FAF8F5] text-[#171513] border border-[#E2DACD] shadow-2xl rounded-xs overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-[#E8E2D8] bg-white sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <img
              src="/assets/sairat-couture-logo.png"
              alt="SAIRAT COUTURE"
              className="h-7 sm:h-8 w-auto max-w-[140px] sm:max-w-[160px] object-contain filter drop-shadow-[0_1px_1px_rgba(23,21,19,0.3)]"
            />
            <div className="border-l border-[#DDD5C7] pl-3">
              <span className="text-[9px] font-mono tracking-[0.2em] uppercase text-[#9E7D47] font-bold block">
                AESTHETIC STUDIO
              </span>
              <h2 className="text-xs sm:text-sm font-aeonik font-bold text-[#171513] tracking-wide uppercase">
                {isCompleted ? 'Your Style Diagnostic Results' : 'Archival Style Diagnostic'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isCompleted && (
              <span className="text-xs font-mono text-[#8C8377] font-semibold hidden sm:inline-block">
                Question {currentStep + 1} of {QUIZ_QUESTIONS.length}
              </span>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-[#7A7165] hover:text-[#171513] hover:bg-[#F2ECE1] rounded-xs transition-colors cursor-pointer"
              aria-label="Close Quiz"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar (During Questionnaire) */}
        {!isCompleted && (
          <div className="w-full bg-[#EFE9DF] h-1">
            <div
              className="bg-[#9E7D47] h-full transition-all duration-300"
              style={{ width: `${((currentStep) / QUIZ_QUESTIONS.length) * 100}%` }}
            />
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-5 sm:p-8 flex-1">
          {!isCompleted ? (
            /* ========================================================================= */
            /* QUESTIONNAIRE FLOW                                                        */
            /* ========================================================================= */
            <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-300">
              {/* Question Badge & Title */}
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FAF5EB] border border-[#C9B28B]/30 rounded-full text-[10px] font-mono tracking-widest uppercase text-[#9E7D47] font-semibold">
                  {currentQuestion.icon}
                  <span>PART {currentStep + 1}: {currentQuestion.title}</span>
                </div>
                <h3 className="font-editorial text-2xl sm:text-3xl text-[#171513] leading-snug">
                  {currentQuestion.subtitle}
                </h3>
                <p className="text-xs text-[#7A7165] font-sans">
                  Select the choice that best reflects your natural styling perspective.
                </p>
              </div>

              {/* 4 Multi-Choice Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = answers[currentStep] === option.archetype;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(option.archetype)}
                      className={`relative p-5 text-left border rounded-xs transition-all duration-200 flex flex-col justify-between cursor-pointer group hover:shadow-md ${
                        isSelected
                          ? 'bg-[#171513] text-white border-[#171513] shadow-md scale-[1.01]'
                          : 'bg-white hover:bg-[#FAF8F5] text-[#171513] border-[#E2DACD] hover:border-[#C9B28B]'
                      }`}
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-2xs border ${
                              isSelected
                                ? 'bg-white/10 text-[#C9B28B] border-white/20'
                                : 'bg-[#FAF5EB] text-[#8C713F] border-[#C9B28B]/30'
                            }`}
                          >
                            {option.tag}
                          </span>
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                              isSelected
                                ? 'bg-[#9E7D47] border-[#9E7D47] text-white'
                                : 'border-[#D1C7B8] group-hover:border-[#9E7D47]'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3" />}
                          </div>
                        </div>

                        <h4
                          className={`font-aeonik text-sm sm:text-base font-bold leading-tight ${
                            isSelected ? 'text-white' : 'text-[#171513]'
                          }`}
                        >
                          {option.label}
                        </h4>

                        <p
                          className={`text-xs leading-relaxed font-sans ${
                            isSelected ? 'text-[#D5CFC6]' : 'text-[#6B6357]'
                          }`}
                        >
                          {option.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-dashed border-[#E2DACD]/40 flex items-center justify-between text-[11px] font-mono">
                        <span
                          className={`uppercase tracking-wider ${
                            isSelected ? 'text-[#C9B28B]' : 'text-[#8C8377]'
                          }`}
                        >
                          Option {String.fromCharCode(65 + idx)}
                        </span>
                        <ArrowRight
                          className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-1 ${
                            isSelected ? 'text-[#C9B28B]' : 'text-[#A69E93]'
                          }`}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Bottom Navigation (Back Button) */}
              <div className="flex items-center justify-between pt-4 border-t border-[#E8E2D8]">
                <button
                  onClick={handlePreviousStep}
                  disabled={currentStep === 0}
                  className={`inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${
                    currentStep === 0
                      ? 'text-[#C7BFB3] cursor-not-allowed'
                      : 'text-[#6B6357] hover:text-[#171513] cursor-pointer'
                  }`}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {QUIZ_QUESTIONS.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all ${
                        i === currentStep
                          ? 'w-6 bg-[#9E7D47]'
                          : i < currentStep
                          ? 'w-2 bg-[#171513]'
                          : 'w-2 bg-[#E2DACD]'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => {
                    if (answers[currentStep]) {
                      setCurrentStep((prev) => prev + 1);
                    }
                  }}
                  disabled={!answers[currentStep]}
                  className={`inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${
                    !answers[currentStep]
                      ? 'text-[#C7BFB3] cursor-not-allowed'
                      : 'text-[#171513] font-bold hover:text-[#9E7D47] cursor-pointer'
                  }`}
                >
                  <span>Skip / Next</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            /* ========================================================================= */
            /* AESTHETIC RESULT SCREEN                                                   */
            /* ========================================================================= */
            <div className="space-y-8 animate-in fade-in duration-500">
              {/* Archetype Hero Banner */}
              <div className="relative overflow-hidden rounded-xs border border-[#E2DACD] bg-[#171513] text-white p-6 sm:p-10 shadow-lg">
                {/* Background Atmosphere Image */}
                <img
                  src={diagnosedArchetype.heroImage}
                  alt={diagnosedArchetype.name}
                  className="absolute inset-0 w-full h-full object-cover object-center opacity-25 mix-blend-luminosity filter contrast-125"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent pointer-events-none" />

                <div className="relative z-10 max-w-2xl space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[10px] font-mono tracking-widest uppercase text-[#C9B28B]">
                    <Sparkles className="w-3.5 h-3.5 text-[#C9B28B]" />
                    <span>{diagnosedArchetype.badge}</span>
                  </div>

                  <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-white leading-tight">
                    {diagnosedArchetype.name}
                  </h1>

                  <p className="font-sans text-sm sm:text-base text-[#D5CFC6] leading-relaxed">
                    {diagnosedArchetype.description}
                  </p>

                  <blockquote className="border-l-2 border-[#9E7D47] pl-3.5 text-xs sm:text-sm font-editorial italic text-white/80">
                    {diagnosedArchetype.quote}
                  </blockquote>

                  {/* Key Influences & Swatches */}
                  <div className="pt-2 flex flex-wrap items-center gap-6 text-xs">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#9E7D47] block font-bold mb-1">
                        Curated Colorway Palette:
                      </span>
                      <div className="flex items-center gap-2">
                        {diagnosedArchetype.colorPalette.map((col, idx) => (
                          <div key={idx} className="flex items-center gap-1.5" title={col.name}>
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-xs inline-block"
                              style={{ backgroundColor: col.hex }}
                            />
                            <span className="text-[10px] text-white/70 font-mono hidden md:inline">
                              {col.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#9E7D47] block font-bold mb-1">
                        Key Ateliers:
                      </span>
                      <span className="font-mono text-[11px] text-white/90">
                        {diagnosedArchetype.keyDesigners.join(' · ')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Styling Principles Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {diagnosedArchetype.stylingTips.map((tip, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-white border border-[#E2DACD] rounded-xs shadow-2xs space-y-1.5"
                  >
                    <span className="text-[9px] font-mono text-[#9E7D47] uppercase font-bold tracking-widest block">
                      STYLING RULE 0{idx + 1}
                    </span>
                    <p className="text-xs text-[#524B43] font-sans leading-relaxed">
                      {tip}
                    </p>
                  </div>
                ))}
              </div>

              {/* Curated Product Vault Matches */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#E8E2D8] pb-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#9E7D47] font-bold block">
                      HAND-PICKED FOR YOUR PROFILE
                    </span>
                    <h3 className="font-aeonik text-lg font-bold text-[#171513] uppercase tracking-wide">
                      Recommended Vault Grails ({curatedProducts.length})
                    </h3>
                  </div>

                  {onExploreAestheticShop && (
                    <button
                      onClick={() => {
                        onClose();
                        onExploreAestheticShop(diagnosedArchetypeId);
                      }}
                      className="text-xs font-aeonik font-bold uppercase tracking-wider text-[#171513] hover:text-[#9E7D47] inline-flex items-center gap-1.5 border-b border-[#171513] pb-0.5 transition-colors cursor-pointer"
                    >
                      <span>Explore Full Collection</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {curatedProducts.length === 0 ? (
                  <div className="p-8 text-center bg-white border border-[#E2DACD] rounded-xs text-xs text-[#7A7165]">
                    No immediate match in current allocation. Explore our full archive catalog for related drops.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {curatedProducts.map((product) => {
                      const isAdded = addedItemIds.has(product.id);
                      return (
                        <div
                          key={product.id}
                          onClick={() => {
                            onClose();
                            onSelectProduct(product);
                          }}
                          className="group bg-white border border-[#E2DACD] hover:border-[#9E7D47] rounded-xs overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-lg cursor-pointer"
                        >
                          <div className="relative aspect-[4/5] overflow-hidden bg-[#EFE9DF]">
                            <img
                              src={product.images[0]}
                              alt={product.title}
                              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                            />
                            {/* Provenance Badge */}
                            <div className="absolute top-2 left-2 bg-[#171513]/90 backdrop-blur-xs text-[#FAF5EB] text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-2xs border border-[#C9B28B]/40">
                              {product.brand}
                            </div>
                            <div className="absolute top-2 right-2 bg-white/90 text-[#171513] text-[9px] font-mono px-1.5 py-0.5 rounded-2xs border border-[#E2DACD]">
                              {product.era.replace('ERA_', '')}
                            </div>
                          </div>

                          <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2.5">
                            <div>
                              <h4 className="font-aeonik text-xs font-bold text-[#171513] line-clamp-2 group-hover:text-[#9E7D47] transition-colors leading-snug">
                                {product.title}
                              </h4>
                              <p className="text-[11px] font-mono text-[#7A7165] mt-1">
                                {product.colorway || product.categoryName}
                              </p>
                            </div>

                            <div className="pt-2 border-t border-[#F0EAE1] space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-xs font-bold text-[#171513]">
                                  ৳ {product.priceBDT.toLocaleString()}
                                </span>
                                <span className="text-[9px] font-mono text-[#8C8377] uppercase">
                                  Dhaka Vault
                                </span>
                              </div>

                              <div className="grid grid-cols-2 gap-1.5 pt-1">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onClose();
                                    onSelectProduct(product);
                                  }}
                                  className="w-full py-1.5 px-2 bg-[#FAF8F5] hover:bg-[#EFE9DF] text-[#171513] border border-[#D5CFC6] text-[10px] font-mono uppercase tracking-wider rounded-2xs inline-flex items-center justify-center gap-1 transition-colors cursor-pointer"
                                >
                                  <Eye className="w-3 h-3 text-[#7A7165]" />
                                  <span>Inspect</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => handleQuickAdd(product, e)}
                                  className={`w-full py-1.5 px-2 text-[10px] font-mono uppercase tracking-wider rounded-2xs inline-flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                                    isAdded
                                      ? 'bg-emerald-700 text-white'
                                      : 'bg-[#171513] hover:bg-[#9E7D47] text-white'
                                  }`}
                                >
                                  {isAdded ? (
                                    <>
                                      <Check className="w-3 h-3" />
                                      <span>Added</span>
                                    </>
                                  ) : (
                                    <>
                                      <ShoppingBag className="w-3 h-3" />
                                      <span>Add Bag</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Bottom Actions Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-[#E8E2D8] bg-[#FAF8F5]">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleReset}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono uppercase tracking-wider text-[#524B43] hover:text-[#171513] bg-white border border-[#D5CFC6] hover:border-[#171513] rounded-xs transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retake Diagnostic</span>
                  </button>

                  <button
                    onClick={handleShareAesthetic}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono uppercase tracking-wider text-[#524B43] hover:text-[#171513] bg-white border border-[#D5CFC6] hover:border-[#171513] rounded-xs transition-colors cursor-pointer"
                  >
                    {copiedShare ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">Copied Summary!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5 text-[#9E7D47]" />
                        <span>Share Result</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  {onExploreAestheticShop && (
                    <button
                      onClick={() => {
                        onClose();
                        onExploreAestheticShop(diagnosedArchetypeId);
                      }}
                      className="px-5 py-2 bg-[#171513] hover:bg-[#9E7D47] text-white text-xs font-aeonik font-bold uppercase tracking-widest rounded-xs transition-colors cursor-pointer inline-flex items-center gap-2"
                    >
                      <span>Shop {diagnosedArchetype.name.split('&')[0]} Vault</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
