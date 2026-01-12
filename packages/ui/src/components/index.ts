'use client';

/**
 * UI Components
 * Exports all base components
 */

// Base components
export { Button } from "./Button";
export type { ButtonProps, ButtonVariant, ButtonSize } from "./Button";

export { Input } from "./Input";
export type { InputProps } from "./Input";

export { FormField } from "./FormField";
export type { FormFieldProps } from "./FormField";

export { Card } from "./Card";
export type { CardProps } from "./Card";

export { Text } from "./Text";
export type { TextProps, TextVariant, TextColor } from "./Text";

export { Loading, Skeleton } from "./Loading";
export type { LoadingProps, SkeletonProps } from "./Loading";

export { ErrorBoundary, RootErrorBoundary } from "./ErrorBoundary";
export type { ErrorBoundaryProps, RootErrorBoundaryProps } from "./ErrorBoundary";

export { HomeIcon, UserIcon, BuildingIcon, LogOutIcon } from "./Icon";
export type { IconProps } from "./Icon";
