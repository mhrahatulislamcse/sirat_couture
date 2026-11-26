export type AdminRole = 'SUPER_ADMIN' | 'VAULT_STAFF' | 'DISPATCHER';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
}

export interface AdminSession {
  token: string;
  admin: AdminUser;
}
