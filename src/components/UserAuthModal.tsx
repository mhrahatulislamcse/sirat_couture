import React, { useState } from 'react';
import {
  X,
  User as UserIcon,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Repeat,
  Sparkles,
  SlidersHorizontal,
  Mail,
  Phone,
  UserCheck
} from 'lucide-react';
import { User, UserGender, PreferredHome } from '../types/auth';
import { DEMO_USERS, authService, getCookie } from '../services/authService';

interface UserAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onUserChange: (user: User | null, redirectUrl?: string) => void;
}

export function UserAuthModal({
  isOpen,
  onClose,
  currentUser,
  onUserChange
}: UserAuthModalProps) {
  const [tab, setTab] = useState<'signin' | 'register' | 'profile'>('signin');
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [selectedGender, setSelectedGender] = useState<UserGender>('MEN');
  const [selectedPreferredHome, setSelectedPreferredHome] = useState<PreferredHome>('MEN');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentStorefrontCookie = getCookie('preferred_storefront');
  const currentGenderCookie = getCookie('user_gender');
  const currentHomeCookie = getCookie('user_preferred_home');

  // Handle demo sign-in
  const handleDemoSignIn = (userId: string) => {
    const { user, redirectUrl } = authService.signIn(userId);
    setFeedbackMsg(`✓ Signed in as ${user.name}. Redirecting to ${redirectUrl}...`);
    setTimeout(() => {
      onUserChange(user, redirectUrl);
      onClose();
    }, 400);
  };

  // Handle custom sign-in
  const handleCustomSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    const { user, redirectUrl } = authService.signIn(emailInput.trim());
    setFeedbackMsg(`✓ Signed in as ${user.name}. Redirecting to ${redirectUrl}...`);
    setTimeout(() => {
      onUserChange(user, redirectUrl);
      onClose();
    }, 400);
  };

  // Handle custom registration
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !nameInput.trim()) return;

    const { user, redirectUrl } = authService.registerCustomUser({
      name: nameInput.trim(),
      email: emailInput.trim(),
      phone: phoneInput.trim() || '+880 1700-000000',
      gender: selectedGender,
      preferredHome: selectedPreferredHome
    });

    setFeedbackMsg(`✓ Account created. Preference-based routing to ${redirectUrl}...`);
    setTimeout(() => {
      onUserChange(user, redirectUrl);
      onClose();
    }, 450);
  };

  // Handle profile preference update
  const handleUpdatePreferences = (newGender: UserGender, newHome: PreferredHome) => {
    const updated = authService.updateProfile({
      gender: newGender,
      preferredHome: newHome
    });
    if (updated) {
      const redirectUrl = authService.computePostLoginRoute(updated);
      setFeedbackMsg(`✓ Preferences updated. Routing destination: ${redirectUrl}`);
      onUserChange(updated, redirectUrl);
    }
  };

  const handleSignOut = () => {
    authService.signOut();
    setFeedbackMsg('Signed out successfully.');
    onUserChange(null, '/');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-xs shadow-2xl border border-[#E0D7C9] overflow-hidden">
        {/* Header */}
        <div className="bg-[#171513] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#FAF5EB]/10 border border-[#FAF5EB]/20 flex items-center justify-center text-[#E5B869]">
              <UserIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-aeonik text-base font-bold uppercase tracking-wider text-[#FAF5EB]">
                Customer Authentication & Preferences
              </h3>
              <p className="text-[11px] font-mono text-[#C9B28B]">
                Prisma Relational Profile & Post-Login Redirection Engine
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#E8E2D8] bg-[#FAF8F5] text-xs font-mono">
          {!currentUser ? (
            <>
              <button
                onClick={() => setTab('signin')}
                className={`flex-1 py-3 text-center uppercase tracking-wider font-semibold transition-colors cursor-pointer ${
                  tab === 'signin'
                    ? 'border-b-2 border-[#171513] text-[#171513] bg-white'
                    : 'text-[#7A7165] hover:text-[#171513]'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setTab('register')}
                className={`flex-1 py-3 text-center uppercase tracking-wider font-semibold transition-colors cursor-pointer ${
                  tab === 'register'
                    ? 'border-b-2 border-[#171513] text-[#171513] bg-white'
                    : 'text-[#7A7165] hover:text-[#171513]'
                }`}
              >
                Create Account
              </button>
            </>
          ) : (
            <button
              onClick={() => setTab('profile')}
              className="flex-1 py-3 text-center uppercase tracking-wider font-semibold border-b-2 border-[#171513] text-[#171513] bg-white"
            >
              Customer Profile & Storefront Preferences
            </button>
          )}
        </div>

        {/* Feedback Banner */}
        {feedbackMsg && (
          <div className="bg-[#FAF5EB] border-b border-[#C9B28B]/40 px-5 py-2.5 text-xs font-mono text-[#1A4231] flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* TAB 1: SIGN IN */}
          {tab === 'signin' && !currentUser && (
            <div className="space-y-6">
              {/* Quick Persona Buttons for Instant Evaluation */}
              <div className="space-y-3">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#7A7165] font-semibold block">
                  Select Test Profile (Instant Post-Login Routing):
                </span>

                <div className="space-y-2">
                  {DEMO_USERS.map((demo) => (
                    <button
                      key={demo.id}
                      onClick={() => handleDemoSignIn(demo.id)}
                      className="w-full p-3 bg-[#FAF8F5] hover:bg-[#FAF5EB] border border-[#DDD5C7] hover:border-[#171513] rounded-xs text-left transition-all cursor-pointer flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={demo.profile.avatarUrl}
                          alt={demo.name}
                          className="w-8 h-8 rounded-full object-cover border border-[#C9B28B]"
                        />
                        <div>
                          <div className="font-aeonik text-xs font-bold text-[#171513] flex items-center gap-2">
                            <span>{demo.name}</span>
                            <span
                              className={`px-1.5 py-0.2 rounded-2xs text-[9px] uppercase font-mono font-bold text-white ${
                                demo.profile.gender === 'MEN'
                                  ? 'bg-[#171513]'
                                  : demo.profile.gender === 'WOMEN'
                                  ? 'bg-[#4A1521]'
                                  : 'bg-[#5C5449]'
                              }`}
                            >
                              {demo.profile.gender}
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-[#7A7165]">
                            {demo.email} · Preferred: {demo.profile.preferredHome}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] font-mono text-[#9E7D47] group-hover:translate-x-1 transition-transform">
                        <span>
                          {demo.profile.gender === 'MEN'
                            ? '→ /men'
                            : demo.profile.gender === 'WOMEN'
                            ? '→ /women'
                            : '→ /'}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Or Custom Email Sign In */}
              <form onSubmit={handleCustomSignIn} className="space-y-4 pt-4 border-t border-[#E8E2D8]">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#7A7165] font-semibold block">
                  Or Sign In with Email:
                </span>
                <div>
                  <label className="block text-xs font-mono text-[#5C5449] mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="e.g. collector@dhaka-vault.com"
                    required
                    className="w-full px-3.5 py-2 text-xs border border-[#DDD5C7] rounded-xs focus:outline-none focus:border-[#171513] bg-[#FAF8F5]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-[#171513] text-[#FAF5EB] hover:bg-[#9E7D47] text-xs font-mono uppercase tracking-wider font-bold rounded-xs transition-colors cursor-pointer"
                >
                  Sign In & Evaluate Redirection
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: CREATE ACCOUNT */}
          {tab === 'register' && !currentUser && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-[#5C5449] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="e.g. Navid Hasan"
                  required
                  className="w-full px-3.5 py-2 text-xs border border-[#DDD5C7] rounded-xs focus:outline-none focus:border-[#171513] bg-[#FAF8F5]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#5C5449] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="e.g. navid@gulshan.com"
                  required
                  className="w-full px-3.5 py-2 text-xs border border-[#DDD5C7] rounded-xs focus:outline-none focus:border-[#171513] bg-[#FAF8F5]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#5C5449] mb-1">
                  Phone (Bangladesh Delivery)
                </label>
                <input
                  type="tel"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="+880 1711-000000"
                  className="w-full px-3.5 py-2 text-xs border border-[#DDD5C7] rounded-xs focus:outline-none focus:border-[#171513] bg-[#FAF8F5]"
                />
              </div>

              {/* Gender Enum Selection */}
              <div>
                <label className="block text-xs font-mono text-[#5C5449] mb-1">
                  Customer Profile Gender (Prisma Enum: MEN | WOMEN | UNSPECIFIED)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['MEN', 'WOMEN', 'UNSPECIFIED'] as UserGender[]).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => {
                        setSelectedGender(g);
                        if (g === 'MEN') setSelectedPreferredHome('MEN');
                        else if (g === 'WOMEN') setSelectedPreferredHome('WOMEN');
                        else setSelectedPreferredHome('GATEWAY');
                      }}
                      className={`py-2 px-3 text-xs font-mono rounded-xs border text-center transition-all cursor-pointer ${
                        selectedGender === g
                          ? 'bg-[#171513] text-[#FAF5EB] border-[#171513] font-bold shadow-xs'
                          : 'bg-[#FAF8F5] text-[#5C5449] border-[#DDD5C7] hover:border-[#171513]'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* preferredHome Toggle */}
              <div>
                <label className="block text-xs font-mono text-[#5C5449] mb-1">
                  preferredHome (Default set by gender, but toggleable by user)
                </label>
                <select
                  value={selectedPreferredHome}
                  onChange={(e) => setSelectedPreferredHome(e.target.value as PreferredHome)}
                  className="w-full px-3.5 py-2 text-xs font-mono border border-[#DDD5C7] rounded-xs bg-[#FAF8F5] focus:outline-none focus:border-[#171513]"
                >
                  <option value="MEN">MEN → Route to /men</option>
                  <option value="WOMEN">WOMEN → Route to /women</option>
                  <option value="GATEWAY">GATEWAY → Route to / (Unified Landing)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#171513] text-[#FAF5EB] hover:bg-[#9E7D47] text-xs font-mono uppercase tracking-wider font-bold rounded-xs transition-colors cursor-pointer mt-2"
              >
                Create Account & Route Automatically
              </button>
            </form>
          )}

          {/* TAB 3: LOGGED-IN CUSTOMER PROFILE & PREFERENCES */}
          {currentUser && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-[#FAF8F5] border border-[#DDD5C7] rounded-xs">
                {currentUser.profile.avatarUrl ? (
                  <img
                    src={currentUser.profile.avatarUrl}
                    alt={currentUser.name}
                    className="w-12 h-12 rounded-full object-cover border border-[#C9B28B]"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#171513] text-white flex items-center justify-center font-bold">
                    {currentUser.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1">
                  <div className="font-aeonik text-base font-bold text-[#171513]">
                    {currentUser.name}
                  </div>
                  <div className="text-xs font-mono text-[#7A7165]">
                    {currentUser.email} · {currentUser.phone}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 bg-[#171513] text-white text-[9px] font-mono rounded-2xs font-bold uppercase">
                      Profile Gender: {currentUser.profile.gender}
                    </span>
                    <span className="px-2 py-0.5 bg-[#FAF5EB] border border-[#C9B28B] text-[#9E7D47] text-[9px] font-mono rounded-2xs font-bold uppercase">
                      Default Home: {currentUser.profile.preferredHome}
                    </span>
                  </div>
                </div>
              </div>

              {/* Preference Toggle without changing Gender */}
              <div className="p-4 bg-white border border-[#E0D7C9] rounded-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#171513]">
                    Toggle Default Homepage (preferredHome):
                  </span>
                  <span className="text-[11px] font-mono text-[#7A7165]">
                    Updates session & cookies
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() =>
                      handleUpdatePreferences(currentUser.profile.gender, 'MEN')
                    }
                    className={`py-2 px-3 text-xs font-mono rounded-xs border text-center transition-all cursor-pointer ${
                      currentUser.profile.preferredHome === 'MEN'
                        ? 'bg-[#171513] text-white border-[#171513] font-bold'
                        : 'bg-[#FAF8F5] text-[#5C5449] border-[#DDD5C7] hover:border-[#171513]'
                    }`}
                  >
                    /men
                  </button>

                  <button
                    onClick={() =>
                      handleUpdatePreferences(currentUser.profile.gender, 'WOMEN')
                    }
                    className={`py-2 px-3 text-xs font-mono rounded-xs border text-center transition-all cursor-pointer ${
                      currentUser.profile.preferredHome === 'WOMEN'
                        ? 'bg-[#4A1521] text-white border-[#4A1521] font-bold'
                        : 'bg-[#FAF8F5] text-[#5C5449] border-[#DDD5C7] hover:border-[#4A1521]'
                    }`}
                  >
                    /women
                  </button>

                  <button
                    onClick={() =>
                      handleUpdatePreferences(currentUser.profile.gender, 'GATEWAY')
                    }
                    className={`py-2 px-3 text-xs font-mono rounded-xs border text-center transition-all cursor-pointer ${
                      currentUser.profile.preferredHome === 'GATEWAY'
                        ? 'bg-[#5C5449] text-white border-[#5C5449] font-bold'
                        : 'bg-[#FAF8F5] text-[#5C5449] border-[#DDD5C7] hover:border-[#171513]'
                    }`}
                  >
                    / (Gateway)
                  </button>
                </div>
              </div>

              {/* Active Cookies & Middleware Diagnostics */}
              <div className="p-4 bg-[#FAF5EB] border border-[#DDD5C7] rounded-xs space-y-2 text-xs font-mono">
                <div className="font-bold uppercase tracking-wider text-[#171513] flex items-center justify-between">
                  <span>Active Session Cookies:</span>
                  <span className="text-[10px] text-[#2D6A4F] font-normal">Edge Middleware Synced</span>
                </div>
                <div className="text-[11px] text-[#5C5449] space-y-1">
                  <div>preferred_storefront: <span className="font-bold text-[#171513]">{currentStorefrontCookie || 'unset'}</span></div>
                  <div>user_gender: <span className="font-bold text-[#171513]">{currentGenderCookie || currentUser.profile.gender}</span></div>
                  <div>user_preferred_home: <span className="font-bold text-[#171513]">{currentHomeCookie || currentUser.profile.preferredHome}</span></div>
                </div>
              </div>

              {/* Sign Out Button */}
              <div className="pt-2 flex items-center justify-between border-t border-[#E8E2D8]">
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 border border-[#B02A37] text-[#B02A37] hover:bg-[#B02A37] hover:text-white rounded-xs text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Sign Out of Account
                </button>

                <button
                  onClick={onClose}
                  className="px-5 py-2 bg-[#171513] text-[#FAF5EB] hover:bg-[#9E7D47] rounded-xs text-xs font-mono uppercase tracking-wider font-bold transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
