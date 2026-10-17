import type { MessageKey } from '../i18n/translations';
import type { Role } from '../models/user.model';

export interface MenuItem {
  labelKey: MessageKey;
  path: string;
  icon: string;
  roles: readonly Role[];
}

export const MENU: readonly MenuItem[] = [
  { labelKey: 'nav.dashboard', path: '/dashboard', icon: 'dashboard', roles: ['admin', 'dispatcher', 'viewer'] },
  { labelKey: 'nav.shipments', path: '/shipments', icon: 'local_shipping', roles: ['admin', 'dispatcher', 'viewer'] },
  { labelKey: 'nav.newShipment', path: '/shipments/new', icon: 'add_box', roles: ['admin', 'dispatcher'] },
];

export function visibleMenu(role: Role | null): readonly MenuItem[] {
  if (!role) {
    return [];
  }
  return MENU.filter(item => item.roles.includes(role));
}
