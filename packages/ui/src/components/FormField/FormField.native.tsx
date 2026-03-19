/**
 * FormField Component
 * Wrapper that combines label, input, and error message
 */

import React from 'react';
import { View, TextInput as RNTextInput } from 'react-native';
import { spacing } from '../../tokens';
import { Input, InputProps } from '../Input/Input.native';

export interface FormFieldProps extends InputProps {
  /** Help text displayed below the input */
  helperText?: string;
}

export const FormField = React.forwardRef<RNTextInput, FormFieldProps>(
  ({ helperText, style, ...props }, ref) => {
    return (
      <View style={{ marginBottom: spacing[4] }}>
        <Input ref={ref} {...props} style={[{ minWidth: '100%' }, style]} />
        {helperText && !props.error && (
          <View style={{ marginTop: spacing[1] }}>
            {/* Helper text would go here if needed */}
          </View>
        )}
      </View>
    );
  }
);

FormField.displayName = 'FormField';
