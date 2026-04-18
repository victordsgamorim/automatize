import React, { useState } from 'react';
import { Check, X, UserPlus } from 'lucide-react';
import {
  PrimaryButton,
  SecondaryButton,
  Input,
  Text,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  cn,
} from '@automatize/ui/web';
import { useTranslation } from '@automatize/core-localization';
import type {
  TechnicianRow,
  InvoiceTechnician,
} from '../../InvoiceFormScreen.types';

export interface TechniciansSectionProps {
  availableTechnicians: TechnicianRow[];
  selectedTechnicians: InvoiceTechnician[];
  onAddTechnician: (tech: TechnicianRow) => void;
  onToggleTechnician: (id: string) => void;
  onRemoveTechnician: (id: string) => void;
  onAddNewTechnician: (name: string) => void;
  onSaveTechnicianToTable?: (name: string) => void;
}

export const TechniciansSection: React.FC<TechniciansSectionProps> = ({
  availableTechnicians,
  selectedTechnicians,
  onAddTechnician,
  onToggleTechnician,
  onRemoveTechnician,
  onAddNewTechnician,
  onSaveTechnicianToTable,
}) => {
  const { t } = useTranslation();
  const [newName, setNewName] = useState('');
  const [pendingName, setPendingName] = useState<string | null>(null);

  const selectedIds = new Set(selectedTechnicians.map((tech) => tech.id));
  const unselectedTechnicians = availableTechnicians.filter(
    (tech) => !selectedIds.has(tech.id)
  );

  const handleAddNew = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setNewName('');
    if (onSaveTechnicianToTable) {
      setPendingName(trimmed);
    } else {
      onAddNewTechnician(trimmed);
    }
  };

  const handleSaveToTable = () => {
    if (!pendingName) return;
    onSaveTechnicianToTable?.(pendingName);
    onAddNewTechnician(pendingName);
    setPendingName(null);
  };

  const handleSkipSave = () => {
    if (!pendingName) return;
    onAddNewTechnician(pendingName);
    setPendingName(null);
  };

  return (
    <div className="space-y-4">
      <Text variant="bodySmall" color="muted">
        {t('invoice.technicians')}
      </Text>

      {/* Selected technicians (chips) */}
      {selectedTechnicians.length > 0 && (
        <div className="space-y-2">
          <Text variant="label">{t('invoice.technicians.selected')}</Text>
          <div className="flex flex-wrap gap-2">
            {selectedTechnicians.map((tech) => (
              <button
                key={tech.id}
                type="button"
                onClick={() => onToggleTechnician(tech.id)}
                aria-label={t('invoice.technicians.toggle')}
                className={cn(
                  'group flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                  tech.active
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'border border-border bg-muted text-muted-foreground hover:bg-muted/80'
                )}
              >
                {tech.active && <Check className="size-3.5" />}
                {tech.name}
                <span
                  role="button"
                  tabIndex={-1}
                  aria-label={t('invoice.technicians.remove')}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveTechnician(tech.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.stopPropagation();
                      onRemoveTechnician(tech.id);
                    }
                  }}
                  className="ml-0.5 rounded-full p-0.5 opacity-60 hover:opacity-100 transition-opacity"
                >
                  <X className="size-3" />
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Available technicians to add */}
      {unselectedTechnicians.length > 0 && (
        <div className="space-y-2">
          <Text variant="label">{t('invoice.technicians.available')}</Text>
          <div className="flex flex-wrap gap-2">
            {unselectedTechnicians.map((tech) => (
              <button
                key={tech.id}
                type="button"
                onClick={() => onAddTechnician(tech)}
                className={cn(
                  'flex items-center gap-1.5 rounded-full border border-dashed border-border',
                  'px-3 py-1.5 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors'
                )}
              >
                <UserPlus className="size-3.5" />
                {tech.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedTechnicians.length === 0 &&
        unselectedTechnicians.length === 0 && (
          <Text variant="caption" className="text-muted-foreground">
            {t('invoice.technicians.empty')}
          </Text>
        )}

      {/* Add new technician inline */}
      <div className="flex gap-2">
        <Input
          placeholder={t('invoice.technicians.addPlaceholder')}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddNew();
            }
          }}
          className="flex-1"
        />
        <PrimaryButton
          type="button"
          onClick={handleAddNew}
          disabled={!newName.trim()}
          className="h-10 shrink-0"
        >
          {t('invoice.technicians.add')}
        </PrimaryButton>
      </div>

      {/* Save-to-table confirmation dialog */}
      <Dialog
        open={pendingName !== null}
        onOpenChange={(open) => {
          if (!open) handleSkipSave();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t('invoice.technicians.saveToTable.title')}
            </DialogTitle>
            <DialogDescription>
              {t('invoice.technicians.saveToTable.description', {
                name: pendingName ?? '',
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <SecondaryButton type="button" onClick={handleSkipSave}>
              {t('invoice.technicians.saveToTable.skip')}
            </SecondaryButton>
            <PrimaryButton type="button" onClick={handleSaveToTable}>
              {t('invoice.technicians.saveToTable.confirm')}
            </PrimaryButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
