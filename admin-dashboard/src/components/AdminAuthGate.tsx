import React, { useState } from 'react';
import { ShieldCheck, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { AdminUser } from '../types/auth';
import { adminApiFetch, saveAdminSession } from '../lib/adminApiClient';

interface AdminAuthGateProps {
  onAuthenticated: (admin: AdminUser) => void;
}

export const AdminAuthGate: React.FC<AdminAuthGateProps> = ({ onAuthenticated }) => {
  const [email, setEmail] = useState('ops@sairatvault.com');
  const [passcode, setPasscode] = useState('VAULT-DHAKA-2026');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const data = await adminApiFetch<{ token: string; admin: AdminUser }>(
        '/api/auth/admin/login',
        {
          method: 'POST',
          body: JSON.stringify({ email, passcode }),
        }
      );

      saveAdminSession(data.token, data.admin);
      onAuthenticated(data.admin);
    } catch (err: any) {
      setError(err.message || 'Authentication rejected by Dhaka Vault API.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4 text-[#171513]">
      <div className="w-full max-w-md bg-white border border-[#DED7CB] rounded-xs shadow-xl overflow-hidden">
        <div className="px-6 py-5 bg-[#171513] text-white border-b border-[#2E2A26] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/assets/sairat-couture-logo.png"
              alt="SAIRAT COUTURE"
              className="h-9 w-auto object-contain"
            />
            <div>
              <h1 className="font-classical text-base tracking-wider uppercase font-bold text-[#FAF5EB]">
                Vault Operations
              </h1>
              <p className="text-[10px] font-mono text-[#A89F91] uppercase">
                Staff &amp; Dispatch Access Only
              </p>
            </div>
          </div>
          <ShieldCheck className="w-5 h-5 text-[#E5BA6A]" />
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-mono rounded-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label
              htmlFor="admin-email"
              className="block text-[11px] font-mono uppercase tracking-wider text-[#5C5449] mb-1.5"
            >
              Staff Email
            </label>
            <input
              id="admin-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ops@sairatvault.com"
              className="w-full px-3 py-2 text-xs font-mono bg-[#FAF8F5] border border-[#DED7CB] rounded-xs focus:outline-none focus:border-[#171513]"
            />
          </div>

          <div>
            <label
              htmlFor="admin-passcode"
              className="block text-[11px] font-mono uppercase tracking-wider text-[#5C5449] mb-1.5"
            >
              Vault Passcode
            </label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-[#8A8175] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="admin-passcode"
                type="password"
                required
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-[#FAF8F5] border border-[#DED7CB] rounded-xs focus:outline-none focus:border-[#171513]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-[#171513] hover:bg-[#9E7D47] text-[#FAF5EB] text-xs font-aeonik font-bold uppercase tracking-wider rounded-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Verifying Credentials...' : 'Enter Operations Console'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <div className="pt-3 border-t border-[#F0EAE1] text-[10px] font-mono text-[#7A7165] space-y-1">
            <div>Staff RBAC Roles: SUPER_ADMIN · VAULT_STAFF · DISPATCHER</div>
            <div>Seed Demo Passcode: VAULT-DHAKA-2026</div>
          </div>
        </form>
      </div>
    </div>
  );
};
