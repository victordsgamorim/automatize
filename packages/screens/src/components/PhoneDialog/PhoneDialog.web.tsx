import React from 'react';
import { Smartphone, Phone as PhoneIcon } from 'lucide-react';
import {
  PrimaryButton,
  SecondaryButton,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Tabs,
  TabsList,
  TabsTrigger,
  Input,
  cn,
} from '@automatize/ui/web';
import { useTranslation } from '@automatize/core-localization';
import type { PhoneFields } from './usePhoneDialog';

export interface PhoneDialogProps<T extends PhoneFields> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: T;
  onChange: (data: T) => void;
  onSave: () => void;
  editingId: string | null;
  variant?: 'tabs' | 'buttons';
  title: string;
  description?: string;
  saveLabel: string;
}

export function PhoneDialog<T extends PhoneFields>({
  open,
  onOpenChange,
  data,
  onChange,
  onSave,
  editingId: _editingId,
  variant = 'tabs',
  title,
  description,
  saveLabel,
}: PhoneDialogProps<T>): React.ReactElement {
  const { t } = useTranslation();

  const set = (patch: Partial<PhoneFields>): void => {
    onChange({ ...data, ...patch } as T);
  };

  const phoneTypeToggle =
    variant === 'tabs' ? (
      <Tabs
        value={data.phoneType ?? 'mobile'}
        onValueChange={(val) =>
          set({ phoneType: val as PhoneFields['phoneType'] })
        }
      >
        <TabsList variant="default" size="sm">
          <TabsTrigger value="mobile">
            <Smartphone className="size-3.5" />
            {t('client.phone.type.mobile')}
          </TabsTrigger>
          <TabsTrigger value="telephone">
            <PhoneIcon className="size-3.5" />
            {t('client.phone.type.telephone')}
          </TabsTrigger>
        </TabsList>
      </Tabs>
    ) : (
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => set({ phoneType: 'mobile' })}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors',
            data.phoneType === 'mobile'
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border text-muted-foreground hover:bg-muted/30'
          )}
        >
          <Smartphone className="size-4" />
          {t('client.phone.type.mobile')}
        </button>
        <button
          type="button"
          onClick={() => set({ phoneType: 'telephone' })}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors',
            data.phoneType === 'telephone'
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border text-muted-foreground hover:bg-muted/30'
          )}
        >
          <PhoneIcon className="size-4" />
          {t('client.phone.type.telephone')}
        </button>
      </div>
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div
          className="space-y-4"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && data.number.trim()) {
              e.preventDefault();
              e.stopPropagation();
              onSave();
            }
          }}
        >
          {phoneTypeToggle}
          <Input
            id="phone-dialog-number"
            label={t('client.phone.label')}
            placeholder={t('client.phone.placeholder')}
            value={data.number}
            onChange={(e) => set({ number: e.target.value })}
            autoFocus
          />
        </div>
        <DialogFooter>
          <SecondaryButton
            type="button"
            onClick={() => onOpenChange(false)}
            shortcut="Esc"
          >
            {t('app.cancel')}
          </SecondaryButton>
          <PrimaryButton
            type="button"
            onClick={onSave}
            disabled={!data.number.trim()}
            shortcut="Enter"
          >
            {saveLabel}
          </PrimaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
