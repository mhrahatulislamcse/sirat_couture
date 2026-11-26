import { PriceDropAlert, PriceDropNotificationEvent, PriceDropCondition } from '../types/priceAlert';
import { Product } from '../types/resale';

export const PRICE_ALERT_STORAGE_KEY = 'innove_vintage_price_drop_alerts';
export const DEFAULT_ALERT_EMAIL = 'mhrahatulislamcse@gmail.com';

/**
 * Retrieve all price alerts stored in the browser session.
 */
export function getStoredPriceAlerts(): PriceDropAlert[] {
  try {
    const raw = localStorage.getItem(PRICE_ALERT_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse stored price alerts:', err);
    return [];
  }
}

/**
 * Retrieve a specific product's price alert, if one exists.
 */
export function getPriceAlertForProduct(productId: string): PriceDropAlert | undefined {
  const alerts = getStoredPriceAlerts();
  return alerts.find((a) => a.productId === productId && a.status === 'ACTIVE');
}

/**
 * Save or update a price drop subscription.
 */
export function savePriceAlert(payload: {
  product: Product;
  condition: PriceDropCondition;
  targetPriceBDT?: number;
  notifyViaToast: boolean;
  notifyViaEmail: boolean;
  email: string;
}): PriceDropAlert {
  const alerts = getStoredPriceAlerts();
  const existingIndex = alerts.findIndex((a) => a.productId === payload.product.id);

  let targetPrice = payload.product.priceBDT;
  if (payload.condition === 'PERCENT_10') {
    targetPrice = Math.round(payload.product.priceBDT * 0.9);
  } else if (payload.condition === 'PERCENT_20') {
    targetPrice = Math.round(payload.product.priceBDT * 0.8);
  } else if (payload.condition === 'CUSTOM' && payload.targetPriceBDT) {
    targetPrice = payload.targetPriceBDT;
  } else {
    // ANY_DROP
    targetPrice = payload.product.priceBDT - 1;
  }

  const alertItem: PriceDropAlert = {
    id: existingIndex >= 0 ? alerts[existingIndex].id : `alert_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    productId: payload.product.id,
    productTitle: payload.product.title,
    productBrand: payload.product.brand,
    productImage: payload.product.images[0] || '',
    initialPriceBDT: payload.product.priceBDT,
    targetPriceBDT: targetPrice,
    condition: payload.condition,
    notifyViaToast: payload.notifyViaToast,
    notifyViaEmail: payload.notifyViaEmail,
    email: payload.email || DEFAULT_ALERT_EMAIL,
    createdAt: new Date().toISOString(),
    status: 'ACTIVE'
  };

  if (existingIndex >= 0) {
    alerts[existingIndex] = alertItem;
  } else {
    alerts.unshift(alertItem);
  }

  localStorage.setItem(PRICE_ALERT_STORAGE_KEY, JSON.stringify(alerts));

  // Also sync to backend API asynchronously (fails gracefully if offline)
  try {
    fetch('/api/alerts/price-drop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alertItem)
    }).catch(() => {});
  } catch {
    // Graceful offline fallback
  }

  return alertItem;
}

/**
 * Unsubscribe or remove an active price alert.
 */
export function removePriceAlert(productId: string): boolean {
  const alerts = getStoredPriceAlerts();
  const filtered = alerts.filter((a) => a.productId !== productId);
  localStorage.setItem(PRICE_ALERT_STORAGE_KEY, JSON.stringify(filtered));

  try {
    fetch(`/api/alerts/price-drop/${productId}`, {
      method: 'DELETE'
    }).catch(() => {});
  } catch {
    // Graceful fallback
  }

  return filtered.length !== alerts.length;
}

/**
 * Dispatches a simulated price drop notification event across the app.
 */
export function dispatchPriceDropEvent(event: PriceDropNotificationEvent): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent<PriceDropNotificationEvent>('innove:price-drop-alert', {
        detail: event
      })
    );
  }
}

/**
 * Checks all active alerts against an array of products, returning any triggered events.
 */
export function evaluatePriceDropAlerts(products: Product[]): PriceDropNotificationEvent[] {
  const alerts = getStoredPriceAlerts().filter((a) => a.status === 'ACTIVE');
  if (alerts.length === 0) return [];

  const triggeredEvents: PriceDropNotificationEvent[] = [];
  const updatedAlerts = [...alerts];

  for (const alert of updatedAlerts) {
    const product = products.find((p) => p.id === alert.productId);
    if (!product) continue;

    // Trigger if current price is lower than target or lower than initial
    if (product.priceBDT <= alert.targetPriceBDT && product.priceBDT < alert.initialPriceBDT) {
      const discountAmount = alert.initialPriceBDT - product.priceBDT;
      const discountPercentage = Math.round((discountAmount / alert.initialPriceBDT) * 100);

      const channels: ('TOAST' | 'EMAIL')[] = [];
      if (alert.notifyViaToast) channels.push('TOAST');
      if (alert.notifyViaEmail) channels.push('EMAIL');

      const event: PriceDropNotificationEvent = {
        id: `ev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        alertId: alert.id,
        productId: product.id,
        productTitle: product.title,
        productBrand: product.brand,
        productImage: product.images[0] || '',
        previousPriceBDT: alert.initialPriceBDT,
        newPriceBDT: product.priceBDT,
        discountAmountBDT: discountAmount,
        discountPercentage,
        timestamp: new Date().toISOString(),
        channels,
        emailRecipient: alert.notifyViaEmail ? alert.email : undefined,
        emailSentStatus: alert.notifyViaEmail ? 'SIMULATED_SENT' : undefined
      };

      triggeredEvents.push(event);

      // Update alert status
      alert.status = 'TRIGGERED';
      alert.lastTriggeredPriceBDT = product.priceBDT;
      alert.lastTriggeredAt = new Date().toISOString();
    }
  }

  if (triggeredEvents.length > 0) {
    localStorage.setItem(PRICE_ALERT_STORAGE_KEY, JSON.stringify(updatedAlerts));
  }

  return triggeredEvents;
}

/**
 * Simulates an immediate price drop on a product, triggering the registered alert
 * and firing the toast notification and simulated email receipt.
 */
export function simulateImmediatePriceDrop(
  product: Product,
  discountPercentage: number = 12
): { updatedProduct: Product; event: PriceDropNotificationEvent } {
  const currentPrice = product.priceBDT;
  const newPrice = Math.max(1000, Math.round(currentPrice * (1 - discountPercentage / 100)));
  const discountAmount = currentPrice - newPrice;

  // Clone and update the product
  const updatedProduct: Product = {
    ...product,
    priceBDT: newPrice,
    salePriceBDT: newPrice,
    originalRetailBDT: product.originalRetailBDT || Math.round(currentPrice * 1.3),
    updatedAt: new Date().toISOString()
  };

  const alert = getPriceAlertForProduct(product.id);
  const channels: ('TOAST' | 'EMAIL')[] = [];
  const notifyViaToast = alert ? alert.notifyViaToast : true;
  const notifyViaEmail = alert ? alert.notifyViaEmail : true;
  const email = alert?.email || DEFAULT_ALERT_EMAIL;

  if (notifyViaToast) channels.push('TOAST');
  if (notifyViaEmail) channels.push('EMAIL');

  const event: PriceDropNotificationEvent = {
    id: `ev_sim_${Date.now()}`,
    alertId: alert?.id || `alert_instant_${Date.now()}`,
    productId: product.id,
    productTitle: product.title,
    productBrand: product.brand,
    productImage: product.images[0] || '',
    previousPriceBDT: currentPrice,
    newPriceBDT: newPrice,
    discountAmountBDT: discountAmount,
    discountPercentage,
    timestamp: new Date().toISOString(),
    channels,
    emailRecipient: notifyViaEmail ? email : undefined,
    emailSentStatus: notifyViaEmail ? 'SIMULATED_SENT' : undefined
  };

  // Mark alert as triggered if it exists
  if (alert) {
    const alerts = getStoredPriceAlerts();
    const idx = alerts.findIndex((a) => a.id === alert.id);
    if (idx >= 0) {
      alerts[idx].status = 'TRIGGERED';
      alerts[idx].lastTriggeredPriceBDT = newPrice;
      alerts[idx].lastTriggeredAt = new Date().toISOString();
      localStorage.setItem(PRICE_ALERT_STORAGE_KEY, JSON.stringify(alerts));
    }
  }

  // Broadcast event across UI
  dispatchPriceDropEvent(event);

  return { updatedProduct, event };
}
