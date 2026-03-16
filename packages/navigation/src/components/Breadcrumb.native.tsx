import React, { useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import type { BreadcrumbProps, BreadcrumbSegment } from '../types';

/**
 * Native implementation of Breadcrumb.
 *
 * On mobile, breadcrumbs are typically less common than on web.
 * This implementation renders a compact horizontal trail. On small
 * screens, earlier segments may be truncated (ellipsised) by the
 * consumer if needed.
 *
 * Touch targets meet the 44×44 dp accessibility minimum.
 */
export function Breadcrumb({
  segments,
  separator,
}: BreadcrumbProps): React.ReactElement {
  const router = useRouter();

  const handlePress = useCallback(
    (segment: BreadcrumbSegment) => {
      if (segment.href) {
        router.push(segment.href as never);
      }
    },
    [router]
  );

  return (
    <View style={styles.container} accessible accessibilityLabel="Breadcrumb">
      {segments.map((segment, idx) => {
        const isLast = idx === segments.length - 1;

        return (
          <View key={segment.href ?? segment.label} style={styles.item}>
            {idx > 0 &&
              (separator ? (
                <View style={styles.separator}>{separator}</View>
              ) : (
                <Text style={styles.separatorText} accessibilityElementsHidden>
                  /
                </Text>
              ))}
            {isLast || !segment.href ? (
              <Text
                style={[styles.label, isLast && styles.labelCurrent]}
                accessibilityLabel={segment.label}
                accessibilityState={isLast ? { selected: true } : undefined}
              >
                {segment.label}
              </Text>
            ) : (
              <Pressable
                onPress={() => handlePress(segment)}
                accessibilityRole="link"
                accessibilityLabel={segment.label}
                style={styles.pressable}
              >
                <Text style={styles.label}>{segment.label}</Text>
              </Pressable>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    paddingVertical: 4,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  separator: {
    marginHorizontal: 4,
  },
  separatorText: {
    marginHorizontal: 4,
    fontSize: 14,
    color: '#A3A3A3',
  },
  pressable: {
    minHeight: 44,
    justifyContent: 'center',
  },
  label: {
    fontSize: 14,
    color: '#525252',
  },
  labelCurrent: {
    fontWeight: '600',
    color: '#171717',
  },
});
