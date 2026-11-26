import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Heart,
  Home,
  ShoppingBag,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Save,
  RotateCcw
} from 'lucide-react';
import { UserProfile, UserGender, PreferredHome } from '../types/resale';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  currentProfile: UserProfile;
  onSaveProfile: (updated: Partial<UserProfile>) => Promise<void> | void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  userId,
  currentProfile,
  onSaveProfile
}) => {
  const [gender, setGender] = useState<UserGender>(currentProfile.gender || 'UNSPECIFIED');
  const [preferredHome, setPreferredHome] = useState<PreferredHome>(currentProfile.preferredHome || 'HOME');
  const [name, setName] = useState(currentProfile.name || '');
  const [phone, setPhone] = useState(currentProfile.phone || '');
  const [email, setEmail] = useState(currentProfile.email || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setGender(currentProfile.gender || 'UNSPECIFIED');
      setPreferredHome(currentProfile.preferredHome || 'HOME');
      setName(currentProfile.name || '');
      setPhone(currentProfile.phone || '');
      setEmail(currentProfile.email || '');
      setSaveSuccess(false);
    }
  }, [isOpen, currentProfile]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSaveProfile({
        gender,
        preferredHome,
        name: name.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined
      });
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 900);
    } catch (err) {
      console.error('Failed to save profile preferences:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setGender('UNSPECIFIED');
    setPreferredHome('HOME');
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-white text-[#171513] border border-[#E8E2D8] shadow-2xl rounded-xs overflow-hidden my-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 bg-[#FAF8F5] border-b border-[#E8E2D8] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#FAF5EB] border border-[#C9B28B]/50 flex items-center justify-center text-[#9E7D47]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-editorial text-xl font-normal text-[#171513] tracking-tight">
                User Profile & <span className="italic">Preferences</span>
              </h2>
              <p className="text-[11px] font-mono text-[#7A7165]">
                Session ID: <span className="text-[#171513] font-bold">{userId || 'Active Client Session'}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#7A7165] hover:text-[#171513] transition-colors rounded-xs hover:bg-[#EFE9DF] cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Section 1: Gender Preference */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase tracking-wider text-[#171513] font-semibold flex items-center gap-2">
                <span>Gender Orientation</span>
                <span className="text-[10px] text-[#9E7D47] font-normal lowercase">(filters & curated sizing)</span>
              </label>
              <span className="text-[11px] font-mono text-[#9E7D47] font-semibold">
                Active: {gender}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {/* WOMEN */}
              <button
                type="button"
                onClick={() => setGender('WOMEN')}
                className={`py-3 px-3 text-center border rounded-xs transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                  gender === 'WOMEN'
                    ? 'border-[#171513] bg-[#171513] text-[#FAF5EB] shadow-xs'
                    : 'border-[#E0D7C9] bg-[#FAF8F5] text-[#5C5449] hover:border-[#9E7D47] hover:text-[#171513]'
                }`}
              >
                <span className="font-aeonik text-xs font-bold uppercase tracking-wider">
                  WOMEN
                </span>
                <span className={`text-[10px] font-mono ${gender === 'WOMEN' ? 'text-[#C9B28B]' : 'text-[#8A8175]'}`}>
                  Archival Couture
                </span>
              </button>

              {/* MEN */}
              <button
                type="button"
                onClick={() => setGender('MEN')}
                className={`py-3 px-3 text-center border rounded-xs transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                  gender === 'MEN'
                    ? 'border-[#171513] bg-[#171513] text-[#FAF5EB] shadow-xs'
                    : 'border-[#E0D7C9] bg-[#FAF8F5] text-[#5C5449] hover:border-[#9E7D47] hover:text-[#171513]'
                }`}
              >
                <span className="font-aeonik text-xs font-bold uppercase tracking-wider">
                  MEN
                </span>
                <span className={`text-[10px] font-mono ${gender === 'MEN' ? 'text-[#C9B28B]' : 'text-[#8A8175]'}`}>
                  Runway Grails
                </span>
              </button>

              {/* UNSPECIFIED */}
              <button
                type="button"
                onClick={() => setGender('UNSPECIFIED')}
                className={`py-3 px-3 text-center border rounded-xs transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                  gender === 'UNSPECIFIED'
                    ? 'border-[#171513] bg-[#171513] text-[#FAF5EB] shadow-xs'
                    : 'border-[#E0D7C9] bg-[#FAF8F5] text-[#5C5449] hover:border-[#9E7D47] hover:text-[#171513]'
                }`}
              >
                <span className="font-aeonik text-xs font-bold uppercase tracking-wider">
                  UNSPECIFIED
                </span>
                <span className={`text-[10px] font-mono ${gender === 'UNSPECIFIED' ? 'text-[#C9B28B]' : 'text-[#8A8175]'}`}>
                  All Collections
                </span>
              </button>
            </div>
            <p className="text-[11px] font-sans text-[#7A7165]">
              Stored in your persistent session. Used to prioritize collection department filters and personalized consignment suggestions.
            </p>
          </div>

          {/* Section 2: Preferred Home Landing */}
          <div className="space-y-2.5 pt-2 border-t border-[#F0EAE1]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase tracking-wider text-[#171513] font-semibold flex items-center gap-2">
                <span>Preferred Home Experience</span>
                <span className="text-[10px] text-[#9E7D47] font-normal lowercase">(default landing view)</span>
              </label>
              <span className="text-[11px] font-mono text-[#9E7D47] font-semibold">
                {preferredHome === 'SHOP' ? 'Shop Catalog' : 'Editorial Home'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* HOME (Editorial Story) */}
              <button
                type="button"
                onClick={() => setPreferredHome('HOME')}
                className={`p-3.5 text-left border rounded-xs transition-all cursor-pointer flex items-start gap-3 ${
                  preferredHome === 'HOME'
                    ? 'border-[#171513] bg-[#FAF5EB] ring-1 ring-[#171513]'
                    : 'border-[#E0D7C9] bg-[#FAF8F5] hover:border-[#9E7D47]'
                }`}
              >
                <Home className={`w-4 h-4 mt-0.5 shrink-0 ${preferredHome === 'HOME' ? 'text-[#9E7D47]' : 'text-[#7A7165]'}`} />
                <div>
                  <div className="font-aeonik text-xs font-bold uppercase tracking-wider text-[#171513]">
                    Editorial Boutique Home
                  </div>
                  <p className="text-[11px] text-[#7A7165] mt-0.5 leading-snug">
                    Minimalism & Fantasy hero film, One Vintage story, Fall collection, and Salons.
                  </p>
                </div>
              </button>

              {/* SHOP (Direct Vault Catalog) */}
              <button
                type="button"
                onClick={() => setPreferredHome('SHOP')}
                className={`p-3.5 text-left border rounded-xs transition-all cursor-pointer flex items-start gap-3 ${
                  preferredHome === 'SHOP'
                    ? 'border-[#171513] bg-[#FAF5EB] ring-1 ring-[#171513]'
                    : 'border-[#E0D7C9] bg-[#FAF8F5] hover:border-[#9E7D47]'
                }`}
              >
                <ShoppingBag className={`w-4 h-4 mt-0.5 shrink-0 ${preferredHome === 'SHOP' ? 'text-[#9E7D47]' : 'text-[#7A7165]'}`} />
                <div>
                  <div className="font-aeonik text-xs font-bold uppercase tracking-wider text-[#171513]">
                    Curated Vault Catalog
                  </div>
                  <p className="text-[11px] text-[#7A7165] mt-0.5 leading-snug">
                    Direct access to live inventory catalog, filters, condition grades, and 1-of-1 pieces.
                  </p>
                </div>
              </button>
            </div>
            <p className="text-[11px] font-sans text-[#7A7165]">
              Persists across reloads and visits. Defines whether clicking the logo or opening the site takes you to the Editorial story or the Shop inventory.
            </p>
          </div>

          {/* Section 3: Optional Contact Details for Faster Checkout */}
          <div className="space-y-3 pt-2 border-t border-[#F0EAE1]">
            <span className="text-xs font-mono uppercase tracking-wider text-[#171513] font-semibold block">
              Contact & Consignment Identity (Optional)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-mono text-[#7A7165] uppercase block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Nafis Chowdhury"
                  className="w-full px-3 py-2 text-xs text-[#171513] bg-[#FAF8F5] border border-[#DED7CB] rounded-xs focus:outline-none focus:border-[#171513] transition-colors"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-[#7A7165] uppercase block mb-1">
                  Phone (Bangladesh Courier)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 01711982341"
                  className="w-full px-3 py-2 text-xs text-[#171513] bg-[#FAF8F5] border border-[#DED7CB] rounded-xs focus:outline-none focus:border-[#171513] transition-colors font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono text-[#7A7165] uppercase block mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@archival-vault.com"
                className="w-full px-3 py-2 text-xs text-[#171513] bg-[#FAF8F5] border border-[#DED7CB] rounded-xs focus:outline-none focus:border-[#171513] transition-colors font-mono"
              />
            </div>
          </div>

          {/* Save Status / Feedback */}
          {saveSuccess && (
            <div className="p-3 bg-[#FAF5EB] border border-[#C9B28B] text-[#1A4231] text-xs font-mono rounded-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-[#1A4231]" />
              <span>User profile preferences successfully saved to session!</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 border-t border-[#E8E2D8] flex items-center justify-between">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="text-xs font-mono text-[#7A7165] hover:text-[#171513] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-[#DED7CB] hover:bg-[#FAF8F5] text-xs font-aeonik uppercase tracking-wider text-[#5C5449] transition-colors rounded-xs cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 bg-[#171513] hover:bg-[#9E7D47] text-[#FAF5EB] text-xs font-aeonik font-bold uppercase tracking-wider transition-colors rounded-xs shadow-xs cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Save Preferences'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
