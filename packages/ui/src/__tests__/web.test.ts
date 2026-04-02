import { describe, it, expect } from 'vitest';

import * as web from '../web';

describe('@automatize/ui/web — entry point exports contract', () => {
  // ── Utility ────────────────────────────────────────────────────────────────

  it('exports cn utility', () => expect(web.cn).toBeDefined());

  // ── Components ─────────────────────────────────────────────────────────────

  it('exports Button', () => expect(web.Button).toBeDefined());
  it('exports buttonVariants', () => expect(web.buttonVariants).toBeDefined());
  it('exports Input', () => expect(web.Input).toBeDefined());
  it('exports Text', () => expect(web.Text).toBeDefined());
  it('exports Checkbox', () => expect(web.Checkbox).toBeDefined());

  // ── Toast ──────────────────────────────────────────────────────────────────

  it('exports useToasts', () => expect(web.useToasts).toBeDefined());
  it('exports ToastProvider', () => expect(web.ToastProvider).toBeDefined());
});
