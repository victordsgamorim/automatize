import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

// Mock @automatize/ui/web to avoid any portal/pointer-event issues in jsdom
vi.mock('@automatize/ui/web', async () => {
  const { createElement } = await import('react');

  type WithChildren = { children?: React.ReactNode };

  const Dialog = ({
    children,
    open,
    _onOpenChange,
  }: WithChildren & {
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }) => {
    // We'll call onOpenChange(false) when the dialog is closed via backdrop or escape?
    // But in the component, onOpenChange is only called when the dialog is closed by the backdrop or escape?
    // Actually, the component doesn't handle backdrop or escape, it only uses the onOpenChange prop passed from the parent.
    // However, the component does call onSkip when the dialog is closed (via onOpenChange) because of the line:
    //   onOpenChange={(v) => { if (!v) onSkip(); }}
    // So we need to simulate that.
    // For simplicity, we'll just render the children and not handle the onOpenChange in the mock.
    // But note: the component passes onOpenChange to the Dialog, and the Dialog might call it on backdrop click or escape.
    // Since we are not testing the backdrop or escape in this unit test (we are testing the buttons), we can ignore.
    // However, to be safe, we'll make the Dialog call onOpenChange(false) when the user clicks on the backdrop or presses escape?
    // But we are not simulating that in our tests. We are only testing the buttons.
    // So let's just render the children and not worry about the onOpenChange in the mock.
    // However, the component expects the Dialog to call onOpenChange when the dialog is closed by means other than the buttons.
    // Since we are not testing that, we can leave it as a no-op and then in the tests we'll only test the buttons.
    // Alternatively, we can make the Dialog call onOpenChange(false) when the user clicks on a backdrop element we render?
    // Let's not overcomplicate: we are testing the buttons, so we'll just render the children and the Dialog will not call onOpenChange.
    // But note: the component does not rely on the Dialog calling onOpenChange for the buttons to work.
    // The buttons have their own onClick handlers.
    // So we can safely ignore the onOpenChange in the mock for the Dialog.
    return createElement(
      'div',
      { style: { display: open ? 'block' : 'none' } },
      children
    );
  };
  const DialogContent = ({
    children,
    onKeyDown,
  }: WithChildren & { onKeyDown?: React.KeyboardEventHandler }) =>
    createElement(
      'div',
      { 'data-slot': 'dialog-content', onKeyDown },
      children
    );
  const DialogHeader = ({ children }: WithChildren) =>
    createElement('div', null, children);
  const DialogTitle = ({ children }: WithChildren) =>
    createElement('h2', null, children);
  const DialogDescription = ({ children }: WithChildren) =>
    createElement('p', null, children);
  const DialogFooter = ({ children }: WithChildren) =>
    createElement('div', null, children);
  const PrimaryButton = ({
    children,
    onClick,
    type,
  }: {
    children?: React.ReactNode;
    onClick: () => void;
    type?: string;
  }) => createElement('button', { onClick, type }, children);
  const SecondaryButton = ({
    children,
    onClick,
    type,
  }: {
    children?: React.ReactNode;
    onClick: () => void;
    type?: string;
  }) => createElement('button', { onClick, type }, children);

  return {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    PrimaryButton,
    SecondaryButton,
  };
});

import { SaveToProfileDialog } from '../SaveToProfileDialog.web';

function renderSaveToProfileDialog(
  overrides: Partial<React.ComponentProps<typeof SaveToProfileDialog>> = {}
) {
  const onConfirm = vi.fn();
  const onSkip = vi.fn();

  const props = {
    open: true,
    onConfirm,
    onSkip,
    title: 'Test Title',
    description: 'Test Description',
    confirmLabel: 'Confirm',
    skipLabel: 'Skip',
    ...overrides,
  };

  const result = render(<SaveToProfileDialog {...props} />);
  return { ...result, onConfirm, onSkip };
}

describe('SaveToProfileDialog (web)', () => {
  // ── Rendering ────────────────────────────────────────────────────────────────
  it('renders dialog with title and description', () => {
    renderSaveToProfileDialog();
    expect(screen.getByText('Test Title')).toBeDefined();
    expect(screen.getByText('Test Description')).toBeDefined();
  });

  it('renders confirm and skip buttons', () => {
    renderSaveToProfileDialog();
    expect(screen.getByRole('button', { name: /Confirm/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Skip/i })).toBeDefined();
  });

  // ── Interaction ──────────────────────────────────────────────────────────────
  it('calls onConfirm when confirm button is clicked', () => {
    const { onConfirm } = renderSaveToProfileDialog();
    const confirmButton = screen.getByRole('button', { name: /Confirm/i });
    fireEvent.click(confirmButton);
    expect(onConfirm).toHaveBeenCalled();
  });

  it('calls onSkip when skip button is clicked', () => {
    const { onSkip } = renderSaveToProfileDialog();
    const skipButton = screen.getByRole('button', { name: /Skip/i });
    fireEvent.click(skipButton);
    expect(onSkip).toHaveBeenCalled();
  });

  it('calls onConfirm when Enter key is pressed inside the dialog', () => {
    const { onConfirm } = renderSaveToProfileDialog();
    const content = screen
      .getByRole('heading', { name: /Test Title/i })
      .closest('[data-slot="dialog-content"]') as HTMLElement;
    fireEvent.keyDown(content, { key: 'Enter', shiftKey: false });
    expect(onConfirm).toHaveBeenCalled();
  });

  it('does not call onConfirm when Shift+Enter is pressed', () => {
    const { onConfirm } = renderSaveToProfileDialog();
    const content = screen
      .getByRole('heading', { name: /Test Title/i })
      .closest('[data-slot="dialog-content"]') as HTMLElement;
    fireEvent.keyDown(content, { key: 'Enter', shiftKey: true });
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
