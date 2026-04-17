import React, { useRef, useState } from 'react';
import { ImageIcon, X } from 'lucide-react';
import { SecondaryButton, DestructiveButton, Text } from '@automatize/ui/web';
import { useTranslation } from '@automatize/core-localization';

export interface PhotoSectionProps {
  photoUrl?: string;
  onPhotoChange: (file: File | null, previewUrl: string | null) => void;
}

export const PhotoSection: React.FC<PhotoSectionProps> = ({
  photoUrl,
  onPhotoChange,
}) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    onPhotoChange(file, url);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-3">
      <Text variant="bodySmall" color="muted">
        {t('product.photo')}
      </Text>

      {photoUrl ? (
        <div className="relative group">
          <img
            src={photoUrl}
            alt={t('product.photo')}
            className="w-full h-48 object-cover rounded-lg border border-border"
          />
          <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-lg">
            <SecondaryButton
              type="button"
              size="sm"
              onClick={() => inputRef.current?.click()}
            >
              {t('product.photo.change')}
            </SecondaryButton>
            <DestructiveButton
              type="button"
              size="sm"
              onClick={() => onPhotoChange(null, null)}
            >
              <X className="size-4" />
            </DestructiveButton>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          aria-label={t('product.photo.browse')}
          className={[
            'flex flex-col items-center justify-center gap-3 p-8 h-48 rounded-lg border-2 border-dashed cursor-pointer transition-colors',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-border bg-muted/10 hover:border-primary/50 hover:bg-muted/20',
          ].join(' ')}
        >
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <ImageIcon className="size-6 text-muted-foreground" />
          </div>
          <div className="text-center">
            <Text variant="body" className="font-medium">
              {t('product.photo.drag')}
            </Text>
            <Text variant="caption" className="text-muted-foreground mt-0.5">
              {t('product.photo.or')}{' '}
              <span className="text-primary underline underline-offset-2">
                {t('product.photo.browse')}
              </span>
            </Text>
          </div>
          <Text variant="caption" className="text-muted-foreground">
            {t('product.photo.hint')}
          </Text>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInputChange}
        aria-hidden="true"
      />
    </div>
  );
};
