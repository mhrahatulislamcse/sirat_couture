export type PriceDropCondition = 'ANY_DROP' | 'PERCENT_10' | 'PERCENT_20' | 'CUSTOM';

export interface PriceDropAlert {
  id: string;
  productId: string;
  productTitle: string;
  productBrand: string;
  productImage: string;
  initialPriceBDT: number;
  targetPriceBDT: number;
  condition: PriceDropCondition;
  notifyViaToast: boolean;
  notifyViaEmail: boolean;
  email: string;
  createdAt: string;
  status: 'ACTIVE' | 'TRIGGERED' | 'DISMISSED';
  lastTriggeredPriceBDT?: number;
  lastTriggeredAt?: string;
}

export interface PriceDropNotificationEvent {
  id: string;
  alertId: string;
  productId: string;
  productTitle: string;
  productBrand: string;
  productImage: string;
  previousPriceBDT: number;
  newPriceBDT: number;
  discountAmountBDT: number;
  discountPercentage: number;
  timestamp: string;
  channels: ('TOAST' | 'EMAIL')[];
  emailRecipient?: string;
  emailSentStatus?: 'SIMULATED_SENT' | 'PENDING';
}
