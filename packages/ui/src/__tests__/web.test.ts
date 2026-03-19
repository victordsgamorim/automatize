import { describe, it, expect } from 'vitest';

import * as web from '../web';

describe('@automatize/ui/web — entry point exports contract', () => {
  // ── Utility ────────────────────────────────────────────────────────────────

  it('exports cn utility', () => expect(web.cn).toBeDefined());

  // ── Components ─────────────────────────────────────────────────────────────

  it('exports Button', () => expect(web.Button).toBeDefined());
  it('exports buttonVariants', () => expect(web.buttonVariants).toBeDefined());
  it('exports Input', () => expect(web.Input).toBeDefined());
  it('exports Label', () => expect(web.Label).toBeDefined());
  it('exports Checkbox', () => expect(web.Checkbox).toBeDefined());
  it('exports ThemeSwitcher', () => expect(web.ThemeSwitcher).toBeDefined());
  it('exports LanguageSwitcher', () =>
    expect(web.LanguageSwitcher).toBeDefined());

  // ── Toast ──────────────────────────────────────────────────────────────────

  it('exports useToasts', () => expect(web.useToasts).toBeDefined());
  it('exports ToastProvider', () => expect(web.ToastProvider).toBeDefined());
});
