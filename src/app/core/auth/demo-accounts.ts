import type { Role, User } from '../models/user.model';

export interface DemoAccount extends User {
  password: string;
  role: Role;
}

export const DEMO_ACCOUNTS: readonly DemoAccount[] = [
  {
    id: 'usr-admin',
    name: 'Harborline Admin',
    email: 'admin@harborline.example',
    role: 'admin',
    password: 'admin123',
  },
  {
    id: 'usr-dispatch',
    name: 'Harborline Dispatch',
    email: 'dispatch@harborline.example',
    role: 'dispatcher',
    password: 'dispatch123',
  },
  {
    id: 'usr-viewer',
    name: 'Harborline Viewer',
    email: 'viewer@harborline.example',
    role: 'viewer',
    password: 'viewer123',
  },
];
