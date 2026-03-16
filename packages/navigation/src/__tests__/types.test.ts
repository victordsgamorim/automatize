import { describe, it, expect } from 'vitest';
import { isGroupedMenu } from '../types';
import type { NavigationMenuItem, NavigationMenuGroup } from '../types';

describe('isGroupedMenu', () => {
  it('returns false for a flat item array', () => {
    const flat: NavigationMenuItem[] = [
      { key: 'a', label: 'A', href: '/a' },
      { key: 'b', label: 'B', href: '/b' },
    ];
    expect(isGroupedMenu(flat)).toBe(false);
  });

  it('returns true for a grouped item array', () => {
    const grouped: NavigationMenuGroup[] = [
      {
        title: 'Group 1',
        items: [{ key: 'a', label: 'A', href: '/a' }],
      },
    ];
    expect(isGroupedMenu(grouped)).toBe(true);
  });

  it('returns false for an empty array', () => {
    expect(isGroupedMenu([])).toBe(false);
  });
});
