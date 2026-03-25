/**
 * Test setup — polyfills missing jsdom APIs used by Radix UI primitives.
 */

// Radix UI's @radix-ui/react-use-size requires ResizeObserver (not in jsdom)
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
