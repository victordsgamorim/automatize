import { describe, it, expect, vi } from 'vitest';

// Native components import from react-native — mock it for the node environment
vi.mock('react-native', async () => {
  const { forwardRef } = await import('react');
  const stub = forwardRef((_props: unknown, _ref: unknown) => null);
  return {
    View: stub,
    Text: stub,
    TextInput: stub,
    TouchableOpacity: stub,
    StyleSheet: { create: <T>(s: T) => s },
  };
});

import * as ui from '../index';

describe('@automatize/ui — entry point exports contract', () => {
  // ── Components ─────────────────────────────────────────────────────────────

  it('exports Button', () => expect(ui.Button).toBeDefined());
  it('exports Input', () => expect(ui.Input).toBeDefined());
  it('exports FormField', () => expect(ui.FormField).toBeDefined());
  it('exports Card', () => expect(ui.Card).toBeDefined());
  it('exports Text', () => expect(ui.Text).toBeDefined());
  it('exports ErrorBoundary', () => expect(ui.ErrorBoundary).toBeDefined());
  it('exports RootErrorBoundary', () =>
    expect(ui.RootErrorBoundary).toBeDefined());
  it('exports HomeIcon', () => expect(ui.HomeIcon).toBeDefined());
  it('exports UserIcon', () => expect(ui.UserIcon).toBeDefined());
  it('exports BuildingIcon', () => expect(ui.BuildingIcon).toBeDefined());
  it('exports LogOutIcon', () => expect(ui.LogOutIcon).toBeDefined());

  // ── Design tokens ──────────────────────────────────────────────────────────

  it('exports colors token', () => expect(ui.colors).toBeDefined());
  it('exports spacing token', () => expect(ui.spacing).toBeDefined());
  it('exports typography token', () => expect(ui.typography).toBeDefined());
});
