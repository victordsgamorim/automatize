'use client';

/**
 * UI Components — Cross-Platform Entry
 *
 * The main @automatize/ui entry exports React Native (native) implementations.
 * These are resolved by Metro (React Native) automatically via .native.tsx extensions.
 *
 * Web apps should import from @automatize/ui/web for web components.
 *
 * The tsup build externalizes react-native (peer dep). The web app handles it
 * via null-loader in next.config.js.
 */

// Button (RN implementation)
export { Button } from './Button/Button.native';
export type {
  ButtonProps,
  ButtonVariant,
  ButtonSize,
} from './Button/Button.native';

// Input (RN implementation)
export { Input } from './Input/Input.native';
export type { InputProps } from './Input/Input.native';

// FormField (RN implementation)
export { FormField } from './FormField/FormField.native';
export type { FormFieldProps } from './FormField/FormField.native';

// Card (RN implementation)
export { Card } from './Card/Card.native';
export type { CardProps } from './Card/Card.native';

// Text (RN implementation)
export { Text } from './Text/Text.native';
export type { TextProps, TextVariant, TextColor } from './Text/Text.native';

// ErrorBoundary — web version (no React Native dep, safe to include in main)
export {
  ErrorBoundary,
  RootErrorBoundary,
} from './ErrorBoundary/ErrorBoundary.web';
export type {
  ErrorBoundaryProps,
  RootErrorBoundaryProps,
} from './ErrorBoundary/ErrorBoundary.web';

// Icon (RN implementation)
export { HomeIcon, UserIcon, BuildingIcon, LogOutIcon } from './Icon/Icon';
export type { IconProps } from './Icon/Icon';
