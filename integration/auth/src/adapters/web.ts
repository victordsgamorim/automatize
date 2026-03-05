/**
 * Web token storage adapter
 * Re-exports the web-specific ITokenStorage implementation
 */
export {
  WebTokenStorage,
  createWebTokenStorage,
} from '../storage/implementations/webTokenStorage';
