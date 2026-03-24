'use client';

/**
 * @automatize/ui — Web entry point
 * Re-exports components from src/components/ for web consumers.
 * Only exports what is actively used. New exports are added as features are built.
 */

// Utilities
export { cn } from './utils';

// Components (source of truth: src/components/)
export { Button, buttonVariants } from './components/Button/Button.web';
export { FormField } from './components/FormField/FormField.web';
export type { FormFieldProps } from './components/FormField/FormField.web';
export { Input } from './components/Input/Input.web';
export { Label } from './components/Label/Label.web';
export type { LabelProps } from './components/Label/Label.web';
export { Checkbox } from './components/Checkbox/Checkbox.web';
export { useToasts, ToastProvider } from './components/Toast/Toast.web';
export type { ToastType } from './components/Toast/Toast.web';
export { LanguageSwitcher } from './components/LanguageSwitcher/LanguageSwitcher.web';
export type {
  LanguageSwitcherProps,
  LanguageOption,
} from './components/LanguageSwitcher/LanguageSwitcher.web';
export { ThemeSwitcher } from './components/ThemeSwitcher/ThemeSwitcher.web';
export type {
  ThemeSwitcherProps,
  ThemeSwitcherOption,
  ThemePreferenceOption,
} from './components/ThemeSwitcher/ThemeSwitcher.web';
export {
  ErrorBoundary,
  RootErrorBoundary,
} from './components/ErrorBoundary/ErrorBoundary.web';
export type {
  ErrorBoundaryProps,
  RootErrorBoundaryProps,
} from './components/ErrorBoundary/ErrorBoundary.web';

export { AnimatedFadeIn } from './components/AnimatedFadeIn/AnimatedFadeIn.web';
export type { AnimatedFadeInProps } from './components/AnimatedFadeIn/AnimatedFadeIn.web';

export { Fade } from './components/Fade/Fade.web';
export type { FadeProps } from './components/Fade/Fade.web';

export {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarLink,
  SidebarGroup,
  SidebarNav,
  SidebarLayout,
  useSidebar,
} from './components/Sidebar/Sidebar.web';
export type {
  SidebarLinkProps,
  SidebarNavItem,
  SidebarNavProps,
  SidebarProfileConfig,
  SidebarProfileMenuItem,
  SidebarLayoutProps,
} from './components/Sidebar/Sidebar.web';

export { SidebarLogo } from './components/SidebarLogo/SidebarLogo.web';
export type { SidebarLogoProps } from './components/SidebarLogo/SidebarLogo.web';

export { ContentPlaceholder } from './components/ContentPlaceholder/ContentPlaceholder.web';
export type { ContentPlaceholderProps } from './components/ContentPlaceholder/ContentPlaceholder.web';
