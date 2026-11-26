const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export const CUSTOMER_TOKEN_STORAGE_KEY = 'sairat_customer_token';

export function getCustomerToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(CUSTOMER_TOKEN_STORAGE_KEY);
}

export function setCustomerToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CUSTOMER_TOKEN_STORAGE_KEY, token);
}

export function clearCustomerToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CUSTOMER_TOKEN_STORAGE_KEY);
}

export function buildApiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

export async function customerApiRequest(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getCustomerToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(buildApiUrl(path), {
    ...options,
    headers,
    credentials: 'include',
  });

  if (response.status === 401) {
    clearCustomerToken();
  }

  return response;
}

export async function customerApiFetch<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await customerApiRequest(path, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `API request failed (${response.status})`);
  }
  return data as T;
}
