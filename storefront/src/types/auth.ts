export type UserGender = 'MEN' | 'WOMEN' | 'UNSPECIFIED';

export type PreferredHome = 'MEN' | 'WOMEN' | 'GATEWAY';

export type UserRole = 'CUSTOMER' | 'VIP_CONSIGNOR';

export interface UserProfile {
  id: string;
  userId: string;
  gender: UserGender;
  preferredHome: PreferredHome;
  preferredStorefront?: 'men' | 'women';
  phone?: string;
  avatarUrl?: string;
  chestWidthIn?: number;
  waistIn?: number;
  shoeSizeEu?: number;
  city?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  profile: UserProfile;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  token: string;
  user: User;
  preferredStorefront: 'men' | 'women';
  expiresAt: string;
}
