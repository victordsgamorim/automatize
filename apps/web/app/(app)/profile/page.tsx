'use client';

import React from 'react';
import { useNavigation } from '@automatize/navigation';
import { useUserAuthentication } from '@automatize/supabase-auth';
import { ProfileScreen } from '@automatize/screens/profile/web';

export default function ProfilePage(): React.JSX.Element {
  const { navigate } = useNavigation();
  const auth = useUserAuthentication();

  return (
    <ProfileScreen
      onSubmit={(_data) => {
        // TODO: persist profile changes via Supabase
      }}
      onChangePassword={async (_currentPassword, newPassword) => {
        await auth.updatePassword(newPassword);
      }}
      onBack={() => navigate('/')}
    />
  );
}
