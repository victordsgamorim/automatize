import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import {
  Text,
  Input,
  Button,
  PrimaryButton,
  SecondaryButton,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  useToasts,
} from '@automatize/ui/web';
import { useTranslation } from '@automatize/core-localization';

export interface PasswordSectionProps {
  onChangePassword: (
    currentPassword: string,
    newPassword: string
  ) => void | Promise<void>;
  isMobile?: boolean;
}

export const PasswordSection: React.FC<PasswordSectionProps> = ({
  onChangePassword,
  isMobile,
}) => {
  const { t } = useTranslation();
  const toast = useToasts();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordMismatch =
    confirmPassword.length > 0 && newPassword !== confirmPassword;

  const canSubmit =
    currentPassword.trim() !== '' &&
    newPassword.trim() !== '' &&
    newPassword === confirmPassword;

  const handleClose = () => {
    setDialogOpen(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
  };

  const handleSave = async () => {
    if (!canSubmit || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onChangePassword(currentPassword, newPassword);
      handleClose();
      toast.message({ text: t('profile.password.saved') });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <Text variant="h3">{t('profile.section.password')}</Text>
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center h-9 px-3 rounded-lg border border-border bg-muted/50">
            <span
              className="text-sm text-muted-foreground tracking-[0.3em] select-none"
              aria-label={t('profile.password.label')}
            >
              ••••••••••••••••
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            size={isMobile ? 'sm' : 'default'}
            onClick={() => setDialogOpen(true)}
          >
            {t('profile.password.change')}
          </Button>
        </div>
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) handleClose();
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('profile.password.dialog.title')}</DialogTitle>
            <DialogDescription>
              {t('profile.password.dialog.description')}
            </DialogDescription>
          </DialogHeader>
          <div
            className="space-y-4"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && canSubmit) {
                e.preventDefault();
                void handleSave();
              }
            }}
          >
            <div className="relative">
              <Input
                id="profile-current-password"
                label={t('profile.password.current')}
                placeholder={t('profile.password.current.placeholder')}
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                className="absolute right-3 top-7 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={
                  showCurrent
                    ? t('sign-in.password.hide')
                    : t('sign-in.password.show')
                }
              >
                {showCurrent ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            <div className="relative">
              <Input
                id="profile-new-password"
                label={t('profile.password.new')}
                placeholder={t('profile.password.new.placeholder')}
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute right-3 top-7 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={
                  showNew
                    ? t('sign-in.password.hide')
                    : t('sign-in.password.show')
                }
              >
                {showNew ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            <div className="relative">
              <Input
                id="profile-confirm-password"
                label={t('profile.password.confirm')}
                placeholder={t('profile.password.confirm.placeholder')}
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={
                  passwordMismatch ? t('profile.password.mismatch') : undefined
                }
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-7 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={
                  showConfirm
                    ? t('sign-in.password.hide')
                    : t('sign-in.password.show')
                }
              >
                {showConfirm ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>
          <DialogFooter>
            <SecondaryButton type="button" onClick={handleClose} shortcut="Esc">
              {t('app.cancel')}
            </SecondaryButton>
            <PrimaryButton
              type="button"
              onClick={() => void handleSave()}
              disabled={!canSubmit || isSubmitting}
              shortcut="Enter"
            >
              {t('profile.password.save')}
            </PrimaryButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
