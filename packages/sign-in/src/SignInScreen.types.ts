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
}
