import type { Phone } from '../client-form/ClientFormScreen.types';

export type { Phone, PhoneType } from '../client-form/ClientFormScreen.types';

export interface ProfileFormData {
  name: string;
  phones: Phone[];
}

export interface ProfileScreenProps {
  /**
   * Read-only: user's email address.
   * Falls back to `ProfileProvider` context when available.
   */
  email?: string;
  /**
   * Read-only: company name.
   * Falls back to `ProfileProvider` context when available.
   */
  companyName?: string;
  /**
   * Initial profile data to populate the form.
   * Falls back to `ProfileProvider` context when available.
   */
  initialData?: ProfileFormData;
  /** Called when the profile form is submitted */
  onSubmit: (data: ProfileFormData) => void;
  /** Called when the user requests a password change */
  onChangePassword: (
    currentPassword: string,
    newPassword: string
  ) => void | Promise<void>;
  /** Called when the user confirms leaving (back navigation) */
  onBack?: () => void;
  /** When true, shows the discard confirmation dialog */
  showDiscardDialog?: boolean;
  /** Called when the user cancels the discard dialog */
  onDiscardCancel?: () => void;
}
