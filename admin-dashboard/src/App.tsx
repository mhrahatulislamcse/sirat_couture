import React, { useState, useEffect, useCallback } from 'react';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminAuthGate } from './components/AdminAuthGate';
import { ArchitectureViewer } from './components/ArchitectureViewer';
import { Product, StorefrontConfig } from './types/resale';
import { AdminUser } from './types/auth';
import {
  adminApiFetch,
  clearAdminSession,
  getAdminToken,
  getStoredAdminUser,
  ADMIN_UNAUTHORIZED_EVENT,
} from './lib/adminApiClient';

export default function App() {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() =>
    getAdminToken() ? getStoredAdminUser() : null
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [storefrontConfig, setStorefrontConfig] = useState<StorefrontConfig | null>(null);
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);

  const loadWorkspaceData = useCallback(async () => {
    if (!getAdminToken()) return;
    try {
      const [prodRes, cfgRes] = await Promise.all([
        adminApiFetch<{ products: Product[] }>('/api/products?includeAllStatuses=true'),
        adminApiFetch<{ config: StorefrontConfig }>('/api/storefront/config'),
      ]);
      setProducts(prodRes.products || []);
      setStorefrontConfig(cfgRes.config || null);
    } catch (err) {
      console.error('Failed to hydrate admin workspace:', err);
    }
  }, []);

  useEffect(() => {
    if (adminUser) {
      loadWorkspaceData();
    }
  }, [adminUser, loadWorkspaceData]);

  useEffect(() => {
    const handleUnauthorized = () => {
      setAdminUser(null);
    };
    window.addEventListener(ADMIN_UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => window.removeEventListener(ADMIN_UNAUTHORIZED_EVENT, handleUnauthorized);
  }, []);

  const handleSignOut = () => {
    clearAdminSession();
    setAdminUser(null);
  };

  if (!adminUser) {
    return (
      <AdminAuthGate
        onAuthenticated={(user) => {
          setAdminUser(user);
        }}
      />
    );
  }

  return (
    <>
      <AdminDashboard
        isOpen={true}
        onClose={handleSignOut}
        products={products}
        onRefreshData={loadWorkspaceData}
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
        storefrontConfig={storefrontConfig}
        onRefreshStorefront={loadWorkspaceData}
        adminUser={adminUser}
      />

      <ArchitectureViewer
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
      />
    </>
  );
}
