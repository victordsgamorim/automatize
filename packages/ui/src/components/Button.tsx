/**
 * Button Component
 * Base button component with multiple variants and states
 */

import React, { ReactNode } from "react";
import { StyleSheet, TouchableOpacity, Text as RNText, ActivityIndicator } from "react-native";
import { colors, spacing, typography } from "../tokens";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps {
  /** Button text or content */
  children: ReactNode;
  /** Button variant style */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Whether button is disabled */
  disabled?: boolean;
  /** Whether button is loading */
  isLoading?: boolean;
  /** Called when button is pressed */
  onPress?: () => void;
  /** Test ID for testing */
  testID?: string;
  /** Accessibility label */
  accessibilityLabel?: string;
  /** Custom styling */
  style?: any;
}

const variants: Record<ButtonVariant, any> = {
  primary: {
    backgroundColor: colors.brand[600],
    borderColor: colors.brand[600],
  },
  secondary: {
    backgroundColor: colors.neutral[200],
    borderColor: colors.neutral[200],
  },
  outline: {
    backgroundColor: "transparent",
    borderColor: colors.brand[600],
    borderWidth: 1,
  },
  ghost: {
    backgroundColor: "transparent",
    borderColor: "transparent",
  },
  danger: {
    backgroundColor: colors.error[600],
    borderColor: colors.error[600],
  },
};

const sizes: Record<ButtonSize, any> = {
  sm: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    minHeight: 36,
  },
  md: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    minHeight: 44,
  },
  lg: {
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[5],
    minHeight: 52,
  },
};

const textVariants: Record<ButtonVariant, string> = {
  primary: colors.neutral[50],
  secondary: colors.neutral[900],
  outline: colors.brand[600],
  ghost: colors.brand[600],
  danger: colors.neutral[50],
};

export const Button = React.forwardRef<TouchableOpacity, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      disabled = false,
      isLoading = false,
      onPress,
      testID,
      accessibilityLabel,
      style,
    },
    ref
  ) => {
    const variantStyle = variants[variant];
    const sizeStyle = sizes[size];
    const textColor = textVariants[variant];
    const isDisabledOrLoading = disabled || isLoading;

    const buttonStyle = [
      baseStyles.button,
      variantStyle,
      sizeStyle,
      isDisabledOrLoading && baseStyles.disabled,
      style,
    ];

    return (
      <TouchableOpacity
        ref={ref}
        style={buttonStyle}
        onPress={onPress}
        disabled={isDisabledOrLoading}
        testID={testID}
        accessibilityLabel={accessibilityLabel}
        activeOpacity={0.7}
      >
        {isLoading ? (
          <ActivityIndicator color={textColor} size={size === "sm" ? "small" : "small"} />
        ) : typeof children === "string" ? (
          <RNText style={[baseStyles.text, { color: textColor }]}>{children}</RNText>
        ) : (
          children
        )}
      </TouchableOpacity>
    );
  }
);

Button.displayName = "Button";

const baseStyles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  text: {
    fontSize: typography.fontSize.base,
    fontWeight: "600",
  },
  disabled: {
    opacity: 0.5,
  },
});
