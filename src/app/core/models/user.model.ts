export type Role = 'admin' | 'dispatcher' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export function isRole(value: unknown): value is Role {
  return value === 'admin' || value === 'dispatcher' || value === 'viewer';
}
