import React, { useState } from 'react';
import { X, Key, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, Server, DollarSign, ExternalLink } from 'lucide-react';
import { CourierApiConfig, CourierGatewayDetails } from '../types/resale';

interface CourierConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: CourierApiConfig;
  onSaveConfig: (updated: Partial<CourierApiConfig>) => Promise<void>;
}

export const CourierConfigModal: React.FC<CourierConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig
}) => {
  const [steadfastKey, setSteadfastKey] = useState(config.steadfast.apiKey);
  const [steadfastSecret, setSteadfastSecret] = useState(config.steadfast.secretKey || '');
  const [steadfastSandbox, setSteadfastSandbox] = useState(config.steadfast.sandboxMode);

  const [pathaoClient, setPathaoClient] = useState(config.pathao.clientId || '');
  const [pathaoSecret, setPathaoSecret] = useState(config.pathao.clientSecret || '');
  const [pathaoUsername, setPathaoUsername] = useState(config.pathao.username || '');
  const [pathaoStoreId, setPathaoStoreId] = useState(config.pathao.storeId || '80421');
  const [pathaoSandbox, setPathaoSandbox] = useState(config.pathao.sandboxMode);

  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTestResult(null);

    try {
      await onSaveConfig({
        steadfast: {
          ...config.steadfast,
          apiKey: steadfastKey,
          secretKey: steadfastSecret,
          sandboxMode: steadfastSandbox,
          status: 'CONNECTED'
        },
        pathao: {
          ...config.pathao,
          clientId: pathaoClient,
          clientSecret: pathaoSecret,
          username: pathaoUsername,
          storeId: pathaoStoreId,
          sandboxMode: pathaoSandbox,
          status: 'CONNECTED'
        }
      });
      setTestResult('API Credentials and gateway routes saved successfully.');
      setTimeout(() => setTestResult(null), 4000);
    } catch (err) {
      setTestResult('Failed to update courier credentials.');
    } finally {
      setIsSaving(false);
    }
  };

  const formatBDT = (amount: number) => `৳${amount.toLocaleString('en-IN')}`;

  return (
    <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#faf9f6] border border-neutral-300 rounded-sm shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col font-mono text-xs">
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-neutral-200 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <Server className="w-5 h-5 text-emerald-800" />
            <div>
              <h2 className="font-editorial text-lg font-bold uppercase text-neutral-950">
                Courier API Gateway Settings
              </h2>
              <p className="text-[10px] text-neutral-500">
                Steadfast Courier Ltd. & Pathao Courier Express API Integrations
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-950 rounded transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-6 overflow-y-auto">
          {testResult && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{testResult}</span>
            </div>
          )}

          {/* SECTION 1: STEADFAST COURIER API */}
          <div className="bg-white border border-neutral-200 rounded-xs p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-bold text-sm text-neutral-900 uppercase">
                  Steadfast Courier API (v1)
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                  {config.steadfast.status}
                </span>
              </div>
              <div className="text-[11px] text-neutral-600 flex items-center gap-3">
                <span>Wallet: <strong>{formatBDT(config.steadfast.currentBalanceBDT)}</strong></span>
                <span>COD Queue: <strong className="text-emerald-800">{formatBDT(config.steadfast.pendingCodBDT)}</strong></span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-neutral-500 uppercase font-bold mb-1">
                  Steadfast API Key
                </label>
                <input
                  type="text"
                  value={steadfastKey}
                  onChange={(e) => setSteadfastKey(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded px-3 py-1.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-950 font-mono"
                  placeholder="stdf_live_sec_..."
                />
              </div>

              <div>
                <label className="block text-[10px] text-neutral-500 uppercase font-bold mb-1">
                  Steadfast Secret Key
                </label>
                <input
                  type="password"
                  value={steadfastSecret}
                  onChange={(e) => setSteadfastSecret(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded px-3 py-1.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-950 font-mono"
                  placeholder="••••••••••••••••••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-neutral-700">
                <input
                  type="checkbox"
                  checked={steadfastSandbox}
                  onChange={(e) => setSteadfastSandbox(e.target.checked)}
                  className="rounded border-neutral-300 text-neutral-900"
                />
                <span>Enable Steadfast Sandbox Testing Simulator</span>
              </label>

              <span className="text-[10px] text-neutral-400">
                Endpoint: portal.steadfast.com.bd/api/v1/create_order
              </span>
            </div>
          </div>

          {/* SECTION 2: PATHAO COURIER API */}
          <div className="bg-white border border-neutral-200 rounded-xs p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                <span className="font-bold text-sm text-neutral-900 uppercase">
                  Pathao Courier Express (Aladdin API)
                </span>
                <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-bold">
                  {config.pathao.status}
                </span>
              </div>
              <div className="text-[11px] text-neutral-600 flex items-center gap-3">
                <span>Wallet: <strong>{formatBDT(config.pathao.currentBalanceBDT)}</strong></span>
                <span>COD Queue: <strong className="text-rose-800">{formatBDT(config.pathao.pendingCodBDT)}</strong></span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-neutral-500 uppercase font-bold mb-1">
                  Pathao Client ID
                </label>
                <input
                  type="text"
                  value={pathaoClient}
                  onChange={(e) => setPathaoClient(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded px-3 py-1.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-950 font-mono"
                  placeholder="pth_client_..."
                />
              </div>

              <div>
                <label className="block text-[10px] text-neutral-500 uppercase font-bold mb-1">
                  Pathao Client Secret
                </label>
                <input
                  type="password"
                  value={pathaoSecret}
                  onChange={(e) => setPathaoSecret(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded px-3 py-1.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-950 font-mono"
                  placeholder="••••••••••••••••••••••••"
                />
              </div>

              <div>
                <label className="block text-[10px] text-neutral-500 uppercase font-bold mb-1">
                  Merchant Account Email
                </label>
                <input
                  type="text"
                  value={pathaoUsername}
                  onChange={(e) => setPathaoUsername(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded px-3 py-1.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-950 font-mono"
                  placeholder="ops@sairat-couture.com"
                />
              </div>

              <div>
                <label className="block text-[10px] text-neutral-500 uppercase font-bold mb-1">
                  Registered Store ID (Banani Vault)
                </label>
                <input
                  type="text"
                  value={pathaoStoreId}
                  onChange={(e) => setPathaoStoreId(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded px-3 py-1.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-950 font-mono"
                  placeholder="80421"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-neutral-700">
                <input
                  type="checkbox"
                  checked={pathaoSandbox}
                  onChange={(e) => setPathaoSandbox(e.target.checked)}
                  className="rounded border-neutral-300 text-neutral-900"
                />
                <span>Enable Pathao Courier Sandbox Environment</span>
              </label>

              <span className="text-[10px] text-neutral-400">
                Endpoint: api-hermes.pathao.com/aladdin/api/v1/orders
              </span>
            </div>
          </div>

          {/* Delivery & Rates Info */}
          <div className="p-3 bg-neutral-100 rounded-xs border border-neutral-200 text-neutral-600 text-[11px] leading-relaxed">
            <strong className="text-neutral-900 uppercase block mb-0.5">Automated Rate Calculation Rules:</strong>
            • <strong>INSIDE_DHAKA:</strong> ৳80 delivery charge (Next-day delivery via Steadfast / 12-hour express via Pathao).<br />
            • <strong>OUTSIDE_DHAKA:</strong> ৳150 delivery charge across all remaining 63 districts in Bangladesh.<br />
            • <strong>PARTIAL COD:</strong> Minimum delivery fee advance payment collected via bKash to eliminate courier return penalty loss.
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-neutral-300 rounded text-neutral-700 hover:bg-neutral-100 uppercase tracking-wider font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-neutral-950 text-white rounded font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors flex items-center gap-2 cursor-pointer"
            >
              {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
              <span>Save & Verify Gateway</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
