import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export type AdminRole = 'SUPER_ADMIN' | 'VAULT_STAFF' | 'DISPATCHER';

export interface CustomerTokenPayload {
  sub: string;
  email: string;
  name: string;
  role: 'CUSTOMER' | 'VIP_CONSIGNOR';
  aud: 'storefront';
}

export interface AdminTokenPayload {
  sub: string;
  email: string;
  name: string;
  role: AdminRole;
  aud: 'admin';
}

export interface AuthenticatedRequest extends Request {
  customer?: CustomerTokenPayload;
  admin?: AdminTokenPayload;
}

const getCustomerJwtSecret = (): string =>
  process.env.CUSTOMER_JWT_SECRET || 'dev-storefront-customer-secret-change-in-prod';

const getAdminJwtSecret = (): string =>
  process.env.ADMIN_JWT_SECRET || 'dev-admin-operations-secret-change-in-prod';

export function signCustomerToken(payload: Omit<CustomerTokenPayload, 'aud'>): string {
  return jwt.sign(
    { ...payload, aud: 'storefront' },
    getCustomerJwtSecret(),
    { expiresIn: '7d', issuer: 'sairat-api' }
  );
}

export function signAdminToken(payload: Omit<AdminTokenPayload, 'aud'>): string {
  return jwt.sign(
    { ...payload, aud: 'admin' },
    getAdminJwtSecret(),
    { expiresIn: '12h', issuer: 'sairat-api' }
  );
}

function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice('Bearer '.length).trim() || null;
}

export function optionalCustomerAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void {
  const token = extractBearerToken(req);
  if (!token) {
    next();
    return;
  }

  try {
    const decoded = jwt.verify(token, getCustomerJwtSecret(), {
      audience: 'storefront',
      issuer: 'sairat-api',
    }) as CustomerTokenPayload;
    req.customer = decoded;
  } catch {
    // Allow guest browse/checkout fallback if token is absent or expired
  }
  next();
}

export function requireCustomerAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const token = extractBearerToken(req);
  if (!token) {
    res.status(401).json({ error: 'Customer authentication token required.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, getCustomerJwtSecret(), {
      audience: 'storefront',
      issuer: 'sairat-api',
    }) as CustomerTokenPayload;
    req.customer = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired customer session token.' });
  }
}

export function requireAdminAuth(allowedRoles: AdminRole[] = ['SUPER_ADMIN', 'VAULT_STAFF', 'DISPATCHER']) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const token = extractBearerToken(req);
    if (!token) {
      res.status(401).json({ error: 'Admin authentication required.' });
      return;
    }

    try {
      const decoded = jwt.verify(token, getAdminJwtSecret(), {
        audience: 'admin',
        issuer: 'sairat-api',
      }) as AdminTokenPayload;

      if (!allowedRoles.includes(decoded.role)) {
        res.status(403).json({
          error: `Insufficient role permissions. Required one of: ${allowedRoles.join(', ')}`,
        });
        return;
      }

      req.admin = decoded;
      next();
    } catch {
      res.status(401).json({ error: 'Invalid or expired admin session token.' });
    }
  };
}
