/**
 * @automatize/integration
 *
 * Meta-package — entry point for all integration sub-modules.
 * Sub-modules live inside packages/integration/ and are independent
 * workspace packages discovered automatically via pnpm-workspace.yaml.
 *
 * Infrastructure packages (co-located here as workspace sub-packages):
 *   - @automatize/auth    → packages/integration/auth/
 *   - @automatize/storage → packages/integration/storage/
 *   - @automatize/sync    → packages/integration/sync/
 *
 * External integration domains (one sub-package per domain):
 *   - @automatize/integration-payment → packages/integration/payment/
 *   - @automatize/integration-nfe     → packages/integration/nfe/
 *   - @automatize/integration-<domain> → packages/integration/<domain>/
 *
 * Re-export sub-module public APIs here as they are created.
 */
