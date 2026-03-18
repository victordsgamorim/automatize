import type React from 'react';

export interface Testimonial {
  avatarSrc: string;
  name: string;
  handle: string;
  text: string;
}

export interface SignInScreenProps {
  /** Current email value */
  email: string;
  /** Called when email changes */
  onEmailChange: (value: string) => void;
  /** Current password value */
  password: string;
  /** Called when password changes */
  onPasswordChange: (value: string) => void;
  /** Whether password is visible */
  showPassword: boolean;
  /** Toggle password visibility */
  onToggleShowPassword: () => void;
  /** Error message to display, or null */
  error: string | null;
  /** Whether sign-in is in progress */
  isLoading: boolean;
  /** Called when user submits the form */
  onSignIn: () => void;
  /** Called when user taps "Reset password" */
  onResetPassword: () => void;

  // --- Web-only props (ignored by native) ---

  /** Custom title (web only) */
  title?: React.ReactNode;
  /** Subtitle text (web only) */
  description?: string;
  /** Hero image URL for right column (web only) */
  heroImageSrc?: string;
  /** Testimonial cards shown over hero image (web only) */
  testimonials?: Testimonial[];
}
