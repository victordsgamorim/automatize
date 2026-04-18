import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { colors, spacing, typography } from '../../tokens';

export type ChipVariant = 'primary' | 'secondary' | 'destructive';
export type ChipSize = 'default' | 'sm' | 'lg';

export interface ChipProps {
  children: React.ReactNode;
  variant?: ChipVariant;
  size?: ChipSize;
  onRemove?: () => void;
  onPress?: () => void;
  testID?: string;
}

const variantContainerStyles: Record<ChipVariant, ViewStyle> = {
  primary: { backgroundColor: colors.brand[600] },
  secondary: { backgroundColor: colors.neutral[200] },
  destructive: { backgroundColor: colors.error[600] },
};

const variantTextColors: Record<ChipVariant, string> = {
  primary: colors.neutral[50],
  secondary: colors.neutral[900],
  destructive: colors.neutral[50],
};

const sizeStyles: Record<ChipSize, ViewStyle> = {
  sm: { paddingHorizontal: spacing[2], paddingVertical: 2 },
  default: { paddingHorizontal: spacing[2], paddingVertical: 2 },
  lg: { paddingHorizontal: spacing[3], paddingVertical: spacing[1] },
};

const sizeTextStyles: Record<ChipSize, TextStyle> = {
  sm: { fontSize: 10 },
  default: { fontSize: typography.fontSize.xs },
  lg: { fontSize: typography.fontSize.sm },
};

export function Chip({
  children,
  variant = 'primary',
  size = 'default',
  onRemove,
  onPress,
  testID,
}: ChipProps): React.JSX.Element {
  const containerStyle = [
    styles.base,
    variantContainerStyles[variant],
    sizeStyles[size],
  ];
  const textColor = variantTextColors[variant];

  const content = (
    <View style={containerStyle}>
      <Text style={[styles.text, sizeTextStyles[size], { color: textColor }]}>
        {children}
      </Text>
      {onRemove && (
        <TouchableOpacity
          onPress={onRemove}
          style={styles.removeButton}
          hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
          accessibilityLabel="Remove"
        >
          <Text style={[styles.removeText, { color: textColor }]}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} testID={testID} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return <View testID={testID}>{content}</View>;
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    gap: 4,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '500',
  },
  removeButton: {
    marginLeft: 2,
  },
  removeText: {
    fontSize: 10,
    fontWeight: '600',
  },
});
