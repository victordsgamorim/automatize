import React, { useCallback } from 'react';
import { Pressable, Linking } from 'react-native';
import { Link } from 'expo-router';
import type { NavigationLinkProps } from '../types';

/**
 * Native implementation of NavigationLink.
 *
 * Renders an Expo Router `<Link>` for internal routes and uses
 * `Linking.openURL` for external URLs. Touch target size meets the
 * 44×44 dp accessibility requirement via `minHeight`/`minWidth`.
 */
export function NavigationLink({
  href,
  replace = false,
  external = false,
  children,
  accessibilityLabel,
  style,
  onPress,
}: NavigationLinkProps): React.ReactElement {
  const handleExternalPress = useCallback(() => {
    onPress?.();
    Linking.openURL(href);
  }, [href, onPress]);

  if (external) {
    return (
      <Pressable
        onPress={handleExternalPress}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="link"
        style={[
          { minHeight: 44, minWidth: 44 },
          style as Record<string, unknown>,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <Link
      href={href as never}
      replace={replace}
      asChild={false}
      accessibilityLabel={accessibilityLabel}
      onPress={() => onPress?.()}
      style={[
        { minHeight: 44, minWidth: 44 },
        style as Record<string, unknown>,
      ]}
    >
      {children}
    </Link>
  );
}
