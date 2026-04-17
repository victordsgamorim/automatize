import React, { useState, useCallback } from 'react';
import { SettingsContext } from '@automatize/core-settings';

export { useSettings, useSettingsSafe } from '@automatize/core-settings';

interface SettingsProviderProps {
  children: React.ReactNode;
}

export function SettingsProvider({
  children,
}: SettingsProviderProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);

  const openSettings = useCallback(() => setIsOpen(true), []);
  const closeSettings = useCallback(() => setIsOpen(false), []);

  return (
    <SettingsContext.Provider value={{ isOpen, openSettings, closeSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}
