'use client';

/**
 * Input Component
 * Text input with validation support and clear button
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  TextInput as RNTextInput,
  View,
  TouchableOpacity,
  Text,
  TextInputProps as RNTextInputProps,
} from 'react-native';
import { colors, spacing, typography } from '../../tokens';

export interface InputProps extends RNTextInputProps {
  /** Label for the input */
  label?: string;
  /** Error message to display */
  error?: string;
  /** Help text displayed below the input (hidden when error is present) */
  helperText?: string;
  /** Whether to show clear button */
  clearable?: boolean;
  /** Left icon component */
  leftIcon?: React.ReactNode;
  /** Right icon component */
  rightIcon?: React.ReactNode;
  /** Whether input has focus indicator */
  focusIndicator?: boolean;
}

export const Input = React.forwardRef<RNTextInput, InputProps>(
  (
    {
      label,
      error,
      helperText,
      clearable = false,
      leftIcon,
      rightIcon,
      focusIndicator = true,
      value,
      onChangeText,
      style,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleClear = () => {
      onChangeText?.('');
    };

    const borderColor = isFocused
      ? colors.brand[600]
      : error
        ? colors.error[600]
        : colors.neutral[300];

    return (
      <View style={styles.container}>
        {label && <Text style={styles.label}>{label}</Text>}

        <View
          style={[
            styles.inputContainer,
            {
              borderColor,
              borderWidth: focusIndicator ? (isFocused ? 2 : 1) : 1,
            },
          ]}
        >
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

          <RNTextInput
            ref={ref}
            style={[styles.input, style]}
            placeholderTextColor={colors.neutral[400]}
            value={value}
            onChangeText={onChangeText}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />

          {clearable && value && (
            <TouchableOpacity style={styles.rightIcon} onPress={handleClear}>
              <Text style={styles.clearButton}>✕</Text>
            </TouchableOpacity>
          )}

          {!clearable && rightIcon && (
            <View style={styles.rightIcon}>{rightIcon}</View>
          )}
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}
        {helperText && !error && (
          <Text style={styles.helperText}>{helperText}</Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: spacing[2],
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[3],
    backgroundColor: colors.neutral[50],
    borderRadius: 8,
    borderColor: colors.neutral[300],
    borderWidth: 1,
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: typography.fontSize.base,
    color: colors.neutral[900],
    paddingVertical: spacing[2],
  },
  leftIcon: {
    marginRight: spacing[2],
  },
  rightIcon: {
    marginLeft: spacing[2],
  },
  clearButton: {
    fontSize: 18,
    color: colors.neutral[400],
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: typography.fontSize.xs,
    color: colors.error[600],
    marginTop: spacing[1],
  },
  helperText: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral[500],
    marginTop: spacing[1],
  },
});
