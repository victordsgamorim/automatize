/**
 * Text Component
 * Semantic text component with typography variants
 */

import React, { ReactNode } from 'react';
import {
  Text as RNText,
  TextProps as RNTextProps,
  TextStyle,
} from 'react-native';
import { colors, typography } from '../../tokens';

export type TextVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'body'
  | 'bodySmall'
  | 'caption'
  | 'code';
export type TextColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'error'
  | 'success'
  | 'warning';

export interface TextProps extends RNTextProps {
  /** Text content */
  children: ReactNode;
  /** Typography variant */
  variant?: TextVariant;
  /** Text color */
  color?: TextColor;
  /** Additional style */
  style?: TextStyle;
}

const variants: Record<TextVariant, TextStyle> = {
  h1: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: '700',
    lineHeight: 36,
  },
  h2: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: '700',
    lineHeight: 30,
  },
  h3: {
    fontSize: typography.fontSize.xl,
    fontWeight: '600',
    lineHeight: 26,
  },
  body: {
    fontSize: typography.fontSize.base,
    fontWeight: '400',
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: typography.fontSize.sm,
    fontWeight: '400',
    lineHeight: 20,
  },
  caption: {
    fontSize: typography.fontSize.xs,
    fontWeight: '400',
    lineHeight: 16,
  },
  code: {
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    fontFamily: typography.fontFamily.mono,
  },
};

const colorMap: Record<TextColor, string> = {
  primary: colors.neutral[900],
  secondary: colors.neutral[600],
  tertiary: colors.neutral[500],
  error: colors.error[600],
  success: colors.success[600],
  warning: colors.warning[600],
};

export const Text = React.forwardRef<RNText, TextProps>(
  ({ children, variant = 'body', color = 'primary', style, ...props }, ref) => {
    const variantStyle = variants[variant];
    const textColor = colorMap[color];

    return (
      <RNText
        ref={ref}
        style={[variantStyle, { color: textColor }, style]}
        {...props}
      >
        {children}
      </RNText>
    );
  }
);

Text.displayName = 'Text';
