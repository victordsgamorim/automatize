import React from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils';
import { Button } from '../Button/Button.web';
import { Text } from '../Text/Text.web';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  /** Optional footer pinned to the bottom — does not scroll with content */
  footer?: React.ReactNode;
  className?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  open,
  onClose,
  title,
  children,
  footer,
  className,
}) => {
  return (
    <>
      <div
        className={cn(
          'fixed inset-y-0 right-0 z-50 w-80 bg-background border-l shadow-lg transition-transform duration-300 ease-in-out',
          open ? 'translate-x-0' : 'translate-x-full',
          className
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b shrink-0">
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
          <div className="flex-1 overflow-y-auto p-4">{children}</div>
          {footer && (
            <div className="border-t p-4 shrink-0 bg-background">{footer}</div>
          )}
        </div>
      </div>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 transition-opacity"
          onClick={onClose}
        />
      )}
    </>
  );
};
