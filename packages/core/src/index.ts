/**
 * @automatize/core
 * Platform-agnostic business logic
 */

// Business logic services
export * from './services';

// Utilities
export * from './utils';

// Additional types (but not overlapping with domain)
export { type UserRoleType } from './types';

// Domain entities (including UserRole type)
export * from './domain';
