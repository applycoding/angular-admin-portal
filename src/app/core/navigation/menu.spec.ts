import { visibleMenu } from './menu';

describe('visibleMenu', () => {
  it('hides new shipment from viewers', () => {
    expect(visibleMenu('viewer').map(item => item.path)).toEqual(['/dashboard', '/shipments']);
  });

  it('shows new shipment to dispatchers and admins', () => {
    expect(visibleMenu('dispatcher').some(item => item.path === '/shipments/new')).toBe(true);
    expect(visibleMenu('admin').some(item => item.path === '/shipments/new')).toBe(true);
  });

  it('returns nothing without a role', () => {
    expect(visibleMenu(null)).toEqual([]);
  });
});
