export interface SignInScreenProps {
  /** Called after a successful sign-in */
  onSuccess: () => void;
  /** Called when user taps "Reset password" */
  onResetPassword: () => void;
}
