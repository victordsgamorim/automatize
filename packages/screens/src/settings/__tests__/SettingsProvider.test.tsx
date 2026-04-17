import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { SettingsProvider, useSettings } from '../SettingsProvider';

// ── Helper: consumer component ───────────────────────────────────────────────

function SettingsConsumer() {
  const { isOpen, openSettings, closeSettings } = useSettings();
  return (
    <div>
      <span data-testid="state">{isOpen ? 'open' : 'closed'}</span>
      <button onClick={openSettings}>Open</button>
      <button onClick={closeSettings}>Close</button>
    </div>
  );
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('SettingsProvider', () => {
  it('provides isOpen as false by default', () => {
    render(
      <SettingsProvider>
        <SettingsConsumer />
      </SettingsProvider>
    );
    expect(screen.getByTestId('state').textContent).toBe('closed');
  });

  it('openSettings() sets isOpen to true', () => {
    render(
      <SettingsProvider>
        <SettingsConsumer />
      </SettingsProvider>
    );
    fireEvent.click(screen.getByText('Open'));
    expect(screen.getByTestId('state').textContent).toBe('open');
  });

  it('closeSettings() sets isOpen back to false', () => {
    render(
      <SettingsProvider>
        <SettingsConsumer />
      </SettingsProvider>
    );
    fireEvent.click(screen.getByText('Open'));
    fireEvent.click(screen.getByText('Close'));
    expect(screen.getByTestId('state').textContent).toBe('closed');
  });
});

describe('useSettings outside provider', () => {
  it('throws when used outside SettingsProvider', () => {
    const originalError = console.error;
    console.error = () => {};

    expect(() => {
      render(<SettingsConsumer />);
    }).toThrow(
      '[core-settings] useSettings() must be used within a SettingsProvider.'
    );

    console.error = originalError;
  });
});
