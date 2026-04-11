import React from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils';
import { Button } from '../Button/Button.web';
import { Text } from '../Text/Text.web';

export interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  maxHeight?: string;
  className?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  open,
  onClose,
  title,
  children,
  maxHeight = '75vh',
  className,
}) => {
  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />
      )}
      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 bg-background border-t rounded-t-2xl shadow-lg transition-transform duration-300 ease-in-out',
          open ? 'translate-y-0' : 'translate-y-full',
          className
        )}
        style={{ maxHeight }}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <Text variant="h3">{title}</Text>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="size-4" />
          </Button>
        </div>
        <div
          className="overflow-y-auto p-4"
          style={{ maxHeight: `calc(${maxHeight} - 57px)` }}
        >
          {children}
        </div>
      </div>
    </>
  );
};
