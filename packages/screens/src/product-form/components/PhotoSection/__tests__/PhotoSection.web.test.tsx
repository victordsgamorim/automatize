import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { PhotoSection } from '../PhotoSection.web';
import type { PhotoSectionProps } from '../PhotoSection.web';

vi.mock('@automatize/ui/web', () => ({
  SecondaryButton: ({
    children,
    onClick,
    type,
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
    type?: string;
    size?: string;
  }) => (
    <button type={type as never} onClick={onClick} data-variant="secondary">
      {children}
    </button>
  ),
  DestructiveButton: ({
    children,
    onClick,
    type,
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
    type?: string;
    size?: string;
  }) => (
    <button type={type as never} onClick={onClick} data-variant="destructive">
      {children}
    </button>
  ),
  Text: ({
    children,
  }: {
    children?: React.ReactNode;
    variant?: string;
    color?: string;
    className?: string;
  }) => <span>{children}</span>,
}));

vi.mock('@automatize/core-localization', () => ({
  useTranslation: () => ({
    t: (key: string) =>
      ({
        'product.photo': 'Photo',
        'product.photo.drag': 'Drag & drop an image here',
        'product.photo.or': 'or',
        'product.photo.browse': 'Browse files',
        'product.photo.change': 'Change photo',
        'product.photo.hint': 'PNG, JPG, WEBP up to 5 MB',
      })[key] ?? key,
  }),
}));

const defaultProps: PhotoSectionProps = {
  photoUrl: undefined,
  onPhotoChange: vi.fn(),
};

function renderSection(props: Partial<PhotoSectionProps> = {}) {
  return render(<PhotoSection {...defaultProps} {...props} />);
}

describe('PhotoSection (web)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('empty state (no photo)', () => {
    it('renders the drag-drop zone', () => {
      renderSection();
      expect(screen.getByText('Drag & drop an image here')).toBeDefined();
    });

    it('renders browse files text', () => {
      renderSection();
      expect(screen.getByText('Browse files')).toBeDefined();
    });

    it('renders the hint text', () => {
      renderSection();
      expect(screen.getByText('PNG, JPG, WEBP up to 5 MB')).toBeDefined();
    });

    it('renders a hidden file input', () => {
      const { container } = renderSection();
      const input = container.querySelector('input[type="file"]');
      expect(input).toBeDefined();
      expect(input?.classList.contains('hidden')).toBe(true);
    });
  });

  describe('photo preview state', () => {
    it('renders an img element when photoUrl is provided', () => {
      const { container } = renderSection({
        photoUrl: 'https://example.com/photo.jpg',
      });
      const img = container.querySelector('img');
      expect(img).toBeDefined();
      expect(img?.getAttribute('src')).toBe('https://example.com/photo.jpg');
    });

    it('renders "Change photo" button when photo is present', () => {
      renderSection({ photoUrl: 'https://example.com/photo.jpg' });
      expect(screen.getByText('Change photo')).toBeDefined();
    });

    it('renders a remove button (destructive) when photo is present', () => {
      const { container } = renderSection({
        photoUrl: 'https://example.com/photo.jpg',
      });
      const removeBtn = container.querySelector('[data-variant="destructive"]');
      expect(removeBtn).toBeDefined();
    });

    it('calls onPhotoChange(null, null) when remove button is clicked', () => {
      const onPhotoChange = vi.fn();
      const { container } = renderSection({
        photoUrl: 'https://example.com/photo.jpg',
        onPhotoChange,
      });
      const removeBtn = container.querySelector(
        '[data-variant="destructive"]'
      ) as HTMLButtonElement;
      fireEvent.click(removeBtn);
      expect(onPhotoChange).toHaveBeenCalledWith(null, null);
    });
  });

  describe('drag events', () => {
    it('handles dragOver without throwing', () => {
      const { getByRole } = renderSection();
      const dropZone = getByRole('button');
      expect(() => {
        fireEvent.dragOver(dropZone);
      }).not.toThrow();
    });

    it('handles dragLeave without throwing', () => {
      const { getByRole } = renderSection();
      const dropZone = getByRole('button');
      expect(() => {
        fireEvent.dragLeave(dropZone);
      }).not.toThrow();
    });
  });

  describe('file input change', () => {
    it('does not call onPhotoChange when no file is selected', () => {
      const onPhotoChange = vi.fn();
      const { container } = renderSection({ onPhotoChange });
      const input = container.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      fireEvent.change(input, { target: { files: null } });
      expect(onPhotoChange).not.toHaveBeenCalled();
    });
  });

  describe('keyboard accessibility', () => {
    it('drop zone has role=button', () => {
      renderSection();
      expect(screen.getByRole('button')).toBeDefined();
    });

    it('drop zone has tabIndex 0', () => {
      renderSection();
      const dropZone = screen.getByRole('button');
      expect(dropZone.getAttribute('tabindex')).toBe('0');
    });
  });
});
