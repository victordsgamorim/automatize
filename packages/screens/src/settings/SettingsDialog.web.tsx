import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@automatize/ui/web';
import { SettingsScreen } from './SettingsScreen.web';
import type { SettingsDialogProps } from './SettingsScreen.types';

export const SettingsDialog: React.FC<SettingsDialogProps> = ({
  isOpen,
  onClose,
  labels,
  locale,
  theme,
  appVersion,
}) => {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{labels.title}</DialogTitle>
          <DialogDescription>{labels.subtitle}</DialogDescription>
        </DialogHeader>
        <SettingsScreen
          labels={labels}
          locale={locale}
          theme={theme}
          appVersion={appVersion}
        />
      </DialogContent>
    </Dialog>
  );
};
