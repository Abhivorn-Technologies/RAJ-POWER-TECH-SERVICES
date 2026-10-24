export type UserRole = 'admin' | 'super_admin' | 'vendor';

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'blocked';

export type AdminPermission =
  | 'manage_vendors'
  | 'manage_admins'
  | 'manage_products'
  | 'edit_vendor_prices'
  | 'manage_orders'
  | 'manage_quotations'
  | 'manage_certifications'
  | 'manage_settings';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  permissions?: AdminPermission[]; // For Admin role
  vendorId?: string; // For Vendor role, references vendors.id
  requiresPasswordChange?: boolean; // True on first login until user sets their permanent password
  createdAt: string;
  updatedAt: string;
}

export interface UserWithCredentials extends User {
  passwordHash: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  permissions?: AdminPermission[];
  vendorId?: string;
  requiresPasswordChange?: boolean;
  iat?: number;
  exp?: number;
}

export interface SessionUser {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  permissions: AdminPermission[];
  vendorId?: string;
  requiresPasswordChange?: boolean;
}
