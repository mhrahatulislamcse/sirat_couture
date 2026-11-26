import { AdminUser } from '../types/auth';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export const ADMIN_TOKEN_KEY = 'sairat_admin_token';
export const ADMIN_USER_KEY = 'sairat_admin_user';
export const ADMIN_UNAUTHORIZED_EVENT = 'sairat:admin-unauthorized';

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function getStoredAdminUser(): AdminUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(ADMIN_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AdminUser;
  } catch {
    return null;
  }
}

export function saveAdminSession(token: string, admin: AdminUser): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(admin));
}

export function clearAdminSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_USER_KEY);
}

export function buildAdminApiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

export async function adminApiRequest(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getAdminToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(buildAdminApiUrl(path), {
    ...options,
    headers,
    credentials: 'include',
  });

  if (response.status === 401 || response.status === 403) {
    clearAdminSession();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(ADMIN_UNAUTHORIZED_EVENT));
    }
  }

  return response;
}

export async function adminApiFetch<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await adminApiRequest(path, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Admin API request failed (${response.status})`);
  }
  return data as T;
}
