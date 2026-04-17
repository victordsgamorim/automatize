import React, { createContext, useCallback, useContext, useState } from 'react';
import type { Phone } from './ProfileScreen.types';

export interface ProfileData {
  name: string;
  email: string;
  companyName: string;
  phones: Phone[];
}

interface ProfileContextValue {
  profile: ProfileData;
  updateProfile: (data: Partial<ProfileData>) => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({
  children,
  initialData,
}: {
  children: React.ReactNode;
  initialData: ProfileData;
}): React.JSX.Element {
  const [profile, setProfile] = useState<ProfileData>(initialData);

  const updateProfile = useCallback((data: Partial<ProfileData>) => {
    setProfile((prev) => ({ ...prev, ...data }));
  }, []);

  return (
    <ProfileContext.Provider value={{ profile, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

/**
 * Must be called inside a ProfileProvider tree.
 * Throws when used outside — use `useProfileSafe` for optional contexts.
 */
export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return ctx;
}

/**
 * Returns `null` when used outside a ProfileProvider.
 * Safe for components that may render with or without the provider.
 */
export function useProfileSafe(): ProfileContextValue | null {
  return useContext(ProfileContext);
}
