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

export { PrimaryButton } from './components/Button/PrimaryButton.native';
export type { PrimaryButtonProps } from './components/Button/PrimaryButton.native';

export { SecondaryButton } from './components/Button/SecondaryButton.native';
export type { SecondaryButtonProps } from './components/Button/SecondaryButton.native';

export { DestructiveButton } from './components/Button/DestructiveButton.native';
export type { DestructiveButtonProps } from './components/Button/DestructiveButton.native';

// Input (RN implementation)
export { Input } from './components/Input/Input.native';
export type { InputProps } from './components/Input/Input.native';

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

// RadioGroup (RN implementation)
export {
  RadioGroup,
  RadioGroupItem,
} from './components/RadioGroup/RadioGroup.native';

// ErrorBoundary — web version (no React Native dep, safe to include in main)
export {
  ErrorBoundary,
  RootErrorBoundary,
} from './actions/ErrorBoundary/ErrorBoundary.web';
export type {
  ErrorBoundaryProps,
  RootErrorBoundaryProps,
} from './actions/ErrorBoundary/ErrorBoundary.web';

// Icon (RN implementation)
export {
  HomeIcon,
  UserIcon,
  BuildingIcon,
  LogOutIcon,
} from './components/Icon/Icon';
export type { IconProps } from './components/Icon/Icon';

// Fade (entrance animation + visibility toggle)
export { Fade } from './actions/Fade/Fade.native';
export type { FadeProps } from './actions/Fade/Fade.native';
