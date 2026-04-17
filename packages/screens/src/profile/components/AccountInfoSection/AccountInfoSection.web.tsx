import React from 'react';
import { Mail, Building2, Lock } from 'lucide-react';
import { Text } from '@automatize/ui/web';
import { useTranslation } from '@automatize/core-localization';

export interface AccountInfoSectionProps {
  email: string;
  companyName: string;
}

export const AccountInfoSection: React.FC<AccountInfoSectionProps> = ({
  email,
  companyName,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <Text variant="h3">{t('profile.section.account')}</Text>
      <div className="space-y-3">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border bg-muted/50">
          <Mail className="size-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground leading-none mb-0.5">
              {t('profile.email')}
            </p>
            <Text variant="bodySmall" color="primary" className="line-clamp-1">
              {email}
            </Text>
          </div>
          <Lock className="size-3.5 shrink-0 text-muted-foreground/50" />
        </div>
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border bg-muted/50">
          <Building2 className="size-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground leading-none mb-0.5">
              {t('profile.company')}
            </p>
            <Text variant="bodySmall" color="primary" className="line-clamp-1">
              {companyName}
            </Text>
          </div>
          <Lock className="size-3.5 shrink-0 text-muted-foreground/50" />
        </div>
      </div>
    </div>
  );
};
