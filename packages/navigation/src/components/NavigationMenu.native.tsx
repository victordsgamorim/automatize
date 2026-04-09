import React, { useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import type { NavigationMenuProps, NavigationMenuItem } from '../types';
import { isGroupedMenu } from '../types';

/**
 * Native implementation of NavigationMenu.
 *
 * Renders a bottom-tab-style navigation bar (horizontal) for mobile.
 * Active item detection is automatic based on the current pathname.
 *
 * Touch targets meet the 44×44 dp accessibility minimum.
 */
export function NavigationMenu({
  items,
  onItemSelect,
}: NavigationMenuProps): React.ReactElement {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = useCallback(
    (href: string) => {
      if (href === '/') return pathname === '/';
      return pathname.startsWith(href);
    },
    [pathname]
  );

  const handlePress = useCallback(
    (item: NavigationMenuItem) => {
      onItemSelect?.(item);
      router.push(item.href as never);
    },
    [onItemSelect, router]
  );

  // Flatten groups into a single item list for bottom-tab rendering.
  const flatItems: NavigationMenuItem[] = isGroupedMenu(items)
    ? items.flatMap((g) => g.items)
    : items;

  return (
    <View style={styles.container} accessibilityRole="tablist">
      {flatItems.map((item) => {
        const active = isActive(item.href);
        return (
          <Pressable
            key={item.key}
            onPress={() => handlePress(item)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={item.label}
            style={[styles.tab, active && styles.tabActive]}
          >
            {item.icon && (
              <View style={styles.iconContainer} accessibilityElementsHidden>
                {item.icon}
              </View>
            )}
            <Text
              style={[styles.label, active && styles.labelActive]}
              numberOfLines={1}
            >
              {item.label}
            </Text>
            {item.badge != null && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.badge}</Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
    paddingBottom: 2,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    minHeight: 44,
    minWidth: 44,
  },
  tabActive: {
    // Active state can be styled by the consumer via tokens.
  },
  iconContainer: {
    marginBottom: 2,
  },
  label: {
    fontSize: 11,
    color: '#737373',
  },
  labelActive: {
    fontWeight: '600',
    color: '#2563EB',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 12,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
