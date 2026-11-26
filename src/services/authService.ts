import { User, UserGender, PreferredHome, AuthSession } from '../types/auth';

const PREFERRED_STOREFRONT_COOKIE = 'preferred_storefront';
const USER_GENDER_COOKIE = 'user_gender';
const USER_PREFERRED_HOME_COOKIE = 'user_preferred_home';
const AUTH_TOKEN_COOKIE = 'auth_token';

// Helper for cookies in browser
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

export function setCookie(name: string, value: string, days = 30): void {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

export function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}

// Pre-seeded authentic Dhaka luxury collector profiles for instant demo testing
export const DEMO_USERS: User[] = [
  {
    id: 'usr_tariq_men',
    email: 'tariq.rahman@menswear.com',
    name: 'Tariq Rahman',
    phone: '+880 1711-234567',
    role: 'VIP_CONSIGNOR',
    profile: {
      id: 'prof_tariq_01',
      userId: 'usr_tariq_men',
      gender: 'MEN',
      preferredHome: 'MEN',
      preferredStorefront: 'men',
      phone: '+880 1711-234567',
      chestWidthIn: 22.5,
      waistIn: 32,
      shoeSizeEu: 43,
      city: 'Dhaka',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      bio: 'Collector of archival Japanese raw denim & Antwerp Six runway garments.',
      createdAt: '2026-01-15T10:00:00Z',
      updatedAt: '2026-10-18T10:00:00Z'
    },
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-10-18T10:00:00Z'
  },
  {
    id: 'usr_zara_women',
    email: 'zara.huq@hautevault.com',
    name: 'Zara Huq',
    phone: '+880 1819-876543',
    role: 'VIP_CONSIGNOR',
    profile: {
      id: 'prof_zara_02',
      userId: 'usr_zara_women',
      gender: 'WOMEN',
      preferredHome: 'WOMEN',
      preferredStorefront: 'women',
      phone: '+880 1819-876543',
      chestWidthIn: 18.0,
      waistIn: 26,
      shoeSizeEu: 38.5,
      city: 'Dhaka',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      bio: 'Archival curator specializing in Phoebe Philo tailoring & vintage Vivienne Westwood.',
      createdAt: '2026-02-20T12:00:00Z',
      updatedAt: '2026-10-18T12:00:00Z'
    },
    createdAt: '2026-02-20T12:00:00Z',
    updatedAt: '2026-10-18T12:00:00Z'
  },
  {
    id: 'usr_alex_unspecified',
    email: 'alex.roy@archivegateway.com',
    name: 'Alex Roy',
    phone: '+880 1912-345678',
    role: 'CUSTOMER',
    profile: {
      id: 'prof_alex_03',
      userId: 'usr_alex_unspecified',
      gender: 'UNSPECIFIED',
      preferredHome: 'GATEWAY',
      preferredStorefront: undefined,
      phone: '+880 1912-345678',
      city: 'Dhaka',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      bio: 'Cross-department collector exploring both Men’s Runway and Women’s Archival vaults.',
      createdAt: '2026-05-10T08:00:00Z',
      updatedAt: '2026-10-18T08:00:00Z'
    },
    createdAt: '2026-05-10T08:00:00Z',
    updatedAt: '2026-10-18T08:00:00Z'
  }
];

class AuthService {
  private currentUser: User | null = null;
  private currentStorefront: 'men' | 'women' = 'men';

  constructor() {
    this.restoreSession();
  }

  // Restore authenticated user and storefront preference from cookies/localStorage
  public restoreSession(): User | null {
    if (typeof window === 'undefined') return null;

    // Restore persistent storefront preference from cookie
    const cookieStorefront = getCookie(PREFERRED_STOREFRONT_COOKIE);
    if (cookieStorefront === 'men' || cookieStorefront === 'women') {
      this.currentStorefront = cookieStorefront;
    }

    const savedUserJson = localStorage.getItem('innove_auth_user');
    if (savedUserJson) {
      try {
        const user: User = JSON.parse(savedUserJson);
        this.currentUser = user;
        this.syncCookies(user);
        return user;
      } catch (e) {
        console.error('Failed to parse saved user', e);
      }
    }
    return null;
  }

  // Compute destination route based on user profile and routing specification
  public computePostLoginRoute(user: User): string {
    // If user explicitly configured preferredHome
    if (user.profile.preferredHome === 'MEN') {
      this.switchStorefront('men');
      return '/men';
    }
    if (user.profile.preferredHome === 'WOMEN') {
      this.switchStorefront('women');
      return '/women';
    }

    // Default by profile gender:
    // If gender === 'MEN', immediately redirect to /men
    // If gender === 'WOMEN', immediately redirect to /women
    // If unspecified, route to / (Unified Gateway)
    if (user.profile.gender === 'MEN') {
      this.switchStorefront('men');
      return '/men';
    } else if (user.profile.gender === 'WOMEN') {
      this.switchStorefront('women');
      return '/women';
    } else {
      return '/';
    }
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public getCurrentStorefront(): 'men' | 'women' {
    return this.currentStorefront;
  }

  // Switch active storefront preference without changing profile gender
  public switchStorefront(target: 'men' | 'women'): void {
    this.currentStorefront = target;
    setCookie(PREFERRED_STOREFRONT_COOKIE, target);
    if (this.currentUser) {
      this.currentUser.profile.preferredStorefront = target;
      localStorage.setItem('innove_auth_user', JSON.stringify(this.currentUser));
    }
  }

  // Sync cookies with current user profile
  private syncCookies(user: User): void {
    setCookie(AUTH_TOKEN_COOKIE, `jwt_${user.id}_${Date.now()}`);
    setCookie(USER_GENDER_COOKIE, user.profile.gender);
    setCookie(USER_PREFERRED_HOME_COOKIE, user.profile.preferredHome);
    if (user.profile.preferredStorefront) {
      setCookie(PREFERRED_STOREFRONT_COOKIE, user.profile.preferredStorefront);
    }
  }

  // Sign in by email or demo account ID
  public signIn(identifier: string): { user: User; redirectUrl: string } {
    let user = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === identifier.toLowerCase() || u.id === identifier
    );

    // If not existing demo, generate active customer
    if (!user) {
      const isFemaleGuess = identifier.toLowerCase().includes('woman') || identifier.toLowerCase().includes('zara');
      const gender: UserGender = isFemaleGuess ? 'WOMEN' : 'MEN';
      user = {
        id: `usr_${Date.now()}`,
        email: identifier,
        name: identifier.split('@')[0].replace('.', ' '),
        phone: '+880 1700-000000',
        role: 'CUSTOMER',
        profile: {
          id: `prof_${Date.now()}`,
          userId: `usr_${Date.now()}`,
          gender,
          preferredHome: gender === 'MEN' ? 'MEN' : 'WOMEN',
          preferredStorefront: gender === 'MEN' ? 'men' : 'women',
          city: 'Dhaka',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }

    this.currentUser = user;
    localStorage.setItem('innove_auth_user', JSON.stringify(user));
    this.syncCookies(user);

    const redirectUrl = this.computePostLoginRoute(user);
    return { user, redirectUrl };
  }

  // Create custom user with specific gender and preferredHome
  public registerCustomUser(params: {
    name: string;
    email: string;
    phone: string;
    gender: UserGender;
    preferredHome?: PreferredHome;
  }): { user: User; redirectUrl: string } {
    const defaultPreferredHome: PreferredHome =
      params.preferredHome ||
      (params.gender === 'MEN' ? 'MEN' : params.gender === 'WOMEN' ? 'WOMEN' : 'GATEWAY');

    const newUser: User = {
      id: `usr_${Date.now()}`,
      email: params.email,
      name: params.name,
      phone: params.phone,
      role: 'CUSTOMER',
      profile: {
        id: `prof_${Date.now()}`,
        userId: `usr_${Date.now()}`,
        gender: params.gender,
        preferredHome: defaultPreferredHome,
        preferredStorefront: params.gender === 'WOMEN' ? 'women' : 'men',
        city: 'Dhaka',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.currentUser = newUser;
    localStorage.setItem('innove_auth_user', JSON.stringify(newUser));
    this.syncCookies(newUser);

    const redirectUrl = this.computePostLoginRoute(newUser);
    return { user: newUser, redirectUrl };
  }

  // Update profile attributes (gender, preferredHome, name, phone)
  public updateProfile(updates: Partial<User['profile']> & { name?: string; phone?: string }): User | null {
    if (!this.currentUser) return null;

    if (updates.name) this.currentUser.name = updates.name;
    if (updates.phone) this.currentUser.phone = updates.phone;

    this.currentUser.profile = {
      ...this.currentUser.profile,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem('innove_auth_user', JSON.stringify(this.currentUser));
    this.syncCookies(this.currentUser);
    return this.currentUser;
  }

  // Sign out
  public signOut(): void {
    this.currentUser = null;
    localStorage.removeItem('innove_auth_user');
    deleteCookie(AUTH_TOKEN_COOKIE);
    deleteCookie(USER_GENDER_COOKIE);
    deleteCookie(USER_PREFERRED_HOME_COOKIE);
  }
}

export const authService = new AuthService();
