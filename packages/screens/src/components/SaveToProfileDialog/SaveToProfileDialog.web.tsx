import React from 'react';
import {
  PrimaryButton,
  SecondaryButton,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@automatize/ui/web';

export interface SaveToProfileDialogProps {
  open: boolean;
  onConfirm: () => void;
  onSkip: () => void;
  title: string;
  description: string;
  confirmLabel: string;
  skipLabel: string;
}

export const SaveToProfileDialog: React.FC<SaveToProfileDialogProps> = ({
  open,
  onConfirm,
  onSkip,
  title,
  description,
  confirmLabel,
  skipLabel,
}) => (
  <Dialog
    open={open}
    onOpenChange={(v) => {
      if (!v) onSkip();
    }}
  >
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <SecondaryButton type="button" onClick={onSkip}>
          {skipLabel}
        </SecondaryButton>
        <PrimaryButton type="button" onClick={onConfirm}>
          {confirmLabel}
        </PrimaryButton>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
