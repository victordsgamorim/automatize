'use client';

/**
 * @automatize/ui — Cross-Platform Entry
 *
 * Exports React Native (native) implementations.
 * Metro resolves .native.tsx extensions automatically.
 *
 * Web apps should import from @automatize/ui/web.
 */

// Design tokens
export * from './tokens';

// Button (RN implementation)
export { Button } from './components/Button/Button.native';
export type {
  ButtonProps,
  ButtonVariant,
  ButtonSize,
} from './components/Button/Button.native';

// Input (RN implementation)
export { Input } from './components/Input/Input.native';
export type { InputProps } from './components/Input/Input.native';

// FormField (RN implementation)
export { FormField } from './components/FormField/FormField.native';
export type { FormFieldProps } from './components/FormField/FormField.native';

// Card (RN implementation)
export { Card } from './components/Card/Card.native';
export type { CardProps } from './components/Card/Card.native';

// Text (RN implementation)
export { Text } from './components/Text/Text.native';
export type {
  TextProps,
  TextVariant,
  TextColor,
} from './components/Text/Text.native';

// ErrorBoundary — web version (no React Native dep, safe to include in main)
export {
  ErrorBoundary,
  RootErrorBoundary,
} from './components/ErrorBoundary/ErrorBoundary.web';
export type {
  ErrorBoundaryProps,
  RootErrorBoundaryProps,
} from './components/ErrorBoundary/ErrorBoundary.web';

// Icon (RN implementation)
export {
  HomeIcon,
  UserIcon,
  BuildingIcon,
  LogOutIcon,
} from './components/Icon/Icon';
export type { IconProps } from './components/Icon/Icon';
