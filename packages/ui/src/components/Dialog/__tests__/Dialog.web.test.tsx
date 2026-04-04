import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '../Dialog.web';

describe('Dialog (web)', () => {
  // ── Rendering ─────────────────────────────────────────────────────────────

  it('does not render content when closed', () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
        </DialogContent>
      </Dialog>
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders content when controlled open is true', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>My Dialog</DialogTitle>
          <DialogDescription>My description</DialogDescription>
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByText('My Dialog')).toBeTruthy();
    expect(screen.getByText('My description')).toBeTruthy();
  });

  it('opens when trigger is clicked', () => {
    render(
      <Dialog>
        <DialogTrigger>Open dialog</DialogTrigger>
        <DialogContent>
          <DialogTitle>Opened</DialogTitle>
        </DialogContent>
      </Dialog>
    );
    fireEvent.click(screen.getByText('Open dialog'));
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByText('Opened')).toBeTruthy();
  });

  // ── Slots ─────────────────────────────────────────────────────────────────

  it('applies data-slot attributes on sub-components', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>T</DialogTitle>
            <DialogDescription>D</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose>Close</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
    expect(document.querySelector('[data-slot="dialog-content"]')).toBeTruthy();
    expect(document.querySelector('[data-slot="dialog-header"]')).toBeTruthy();
    expect(document.querySelector('[data-slot="dialog-footer"]')).toBeTruthy();
    expect(document.querySelector('[data-slot="dialog-title"]')).toBeTruthy();
    expect(
      document.querySelector('[data-slot="dialog-description"]')
    ).toBeTruthy();
    expect(document.querySelector('[data-slot="dialog-close"]')).toBeTruthy();
    expect(document.querySelector('[data-slot="dialog-overlay"]')).toBeTruthy();
  });

  // ── onOpenChange ──────────────────────────────────────────────────────────

  it('calls onOpenChange(false) when DialogClose is clicked', () => {
    const onOpenChange = vi.fn();
    render(
      <Dialog open onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogTitle>T</DialogTitle>
          <DialogClose>Close me</DialogClose>
        </DialogContent>
      </Dialog>
    );
    fireEvent.click(screen.getByText('Close me'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  // ── className pass-through ────────────────────────────────────────────────

  it('merges custom className on content', () => {
    render(
      <Dialog open>
        <DialogContent className="custom-content">
          <DialogTitle>T</DialogTitle>
        </DialogContent>
      </Dialog>
    );
    const content = document.querySelector(
      '[data-slot="dialog-content"]'
    ) as HTMLElement;
    expect(content.className).toContain('custom-content');
  });
});
