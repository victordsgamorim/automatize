/** State and actions for the settings dialog */
export interface SettingsContextValue {
  /** Whether the settings dialog is currently open */
  isOpen: boolean;
  /** Open the settings dialog */
  openSettings: () => void;
  /** Close the settings dialog */
  closeSettings: () => void;
}
