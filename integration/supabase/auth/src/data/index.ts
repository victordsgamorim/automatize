/**
 * Data layer barrel
 *
 * Re-exports the canonical domain models, the repository interface, and the
 * Supabase remote data source from a single entry point.
 */

// User data model
export type {
  SupabaseUser,
  SupabaseIdentity,
  SupabaseAppMetadata,
  SupabaseUserMetadata,
  SupabaseUserSource,
} from './user.model';
export {
  createSupabaseUser,
  isEmailConfirmed,
  isPhoneConfirmed,
  getPrimaryProvider,
  getProviders,
} from './user.model';

// Repository interface + result / event types
export type {
  AuthRepository,
  AuthSuccess,
  AuthPendingConfirmation,
  AuthFailure,
  AuthFailureCode,
  SignUpResult,
  SignInResult,
  SignOutResult,
  GetCurrentUserResult,
  AuthEvent,
  AuthStateChangePayload,
  AuthStateChangeCallback,
  AuthStateSubscription,
} from './auth.repository';

// Remote data source
export { SupabaseAuthRemoteDataSource } from './supabase-auth.datasource';
