/**
 * useTenant Hook
 * Manages tenant selection, creation, and member management
 */

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../client';
import { useAuth } from './useAuth';
import type { Tenant, TenantMember } from '../types/auth.types';

/**
 * useTenant hook
 * Handles tenant operations (create, switch, manage members)
 *
 * @example
 * ```tsx
 * function TenantSelector() {
 *   const { tenants, currentTenant, switchTenant } = useTenant();
 *
 *   return (
 *     <select value={currentTenant?.id} onChange={(e) => switchTenant(e.target.value)}>
 *       {tenants.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
 *     </select>
 *   );
 * }
 * ```
 */
export function useTenant(): {
  tenants: Tenant[];
  currentTenant: Tenant | null;
  members: TenantMember[];
  isLoading: boolean;
  error: string | null;
  fetchTenants: () => Promise<void>;
  fetchTenantMembers: (tenantId?: string) => Promise<void>;
  createTenant: (name: string, slug?: string) => Promise<Tenant>;
  switchTenant: (tenantId: string) => Promise<void>;
  addMember: (
    userId: string,
    role: 'admin' | 'editor' | 'viewer'
  ) => Promise<void>;
  updateMemberRole: (
    userId: string,
    role: 'admin' | 'editor' | 'viewer'
  ) => Promise<void>;
  removeMember: (userId: string) => Promise<void>;
} {
  const { currentTenant, user } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [members, setMembers] = useState<TenantMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch user's tenants
   */
  const fetchTenants = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      // Query tenants user is member of
      const { data, error: queryError } = await supabase
        .from('tenant_members')
        .select('tenants(*)')
        .eq('user_id', user.id);

      if (queryError) throw queryError;

      const userTenants =
        data?.map((tm) => tm.tenants as unknown as Tenant).filter(Boolean) ||
        [];
      setTenants(userTenants);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch tenants';
      setError(message);
      console.error('Error fetching tenants:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  /**
   * Fetch tenant members
   */
  const fetchTenantMembers = useCallback(
    async (tenantId?: string) => {
      const id = tenantId || currentTenant?.id;
      if (!id) return;

      setIsLoading(true);
      setError(null);

      try {
        const { data, error: queryError } = await supabase
          .from('tenant_members')
          .select('*')
          .eq('tenant_id', id);

        if (queryError) throw queryError;

        setMembers((data as TenantMember[]) || []);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to fetch tenant members';
        setError(message);
        console.error('Error fetching tenant members:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [currentTenant?.id]
  );

  /**
   * Create new tenant
   */
  const createTenant = useCallback(
    async (name: string, slug?: string): Promise<Tenant> => {
      if (!user) throw new Error('Not authenticated');

      setIsLoading(true);
      setError(null);

      try {
        // Generate slug if not provided
        const tenantSlug = slug || name.toLowerCase().replace(/\s+/g, '-');

        // Insert tenant
        const { data: tenantData, error: insertError } = await supabase
          .from('tenants')
          .insert([{ name, slug: tenantSlug }])
          .select()
          .single();

        if (insertError) throw insertError;
        if (!tenantData) throw new Error('Failed to create tenant');

        const tenant = tenantData as Tenant;

        // Add creator as admin member
        const { error: memberError } = await supabase
          .from('tenant_members')
          .insert([
            {
              tenant_id: tenant.id,
              user_id: user.id,
              role: 'admin',
            },
          ]);

        if (memberError) throw memberError;

        // Refresh tenants list
        await fetchTenants();

        return tenant;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to create tenant';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [user, fetchTenants]
  );

  /**
   * Switch current tenant
   */
  const switchTenant = useCallback(
    async (tenantId: string): Promise<void> => {
      if (!user) throw new Error('Not authenticated');

      setIsLoading(true);
      setError(null);

      try {
        // Update user's default tenant
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ default_tenant_id: tenantId })
          .eq('id', user.id);

        if (updateError) throw updateError;

        // Refresh tenant members
        await fetchTenantMembers(tenantId);

        // In a real app, this would trigger a context update to refresh JWT claims
        // For now, the user would need to refresh or the next request would use the new claims
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to switch tenant';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [user, fetchTenantMembers]
  );

  /**
   * Add member to tenant
   */
  const addMember = useCallback(
    async (
      userId: string,
      role: 'admin' | 'editor' | 'viewer'
    ): Promise<void> => {
      if (!currentTenant) throw new Error('No current tenant');

      setIsLoading(true);
      setError(null);

      try {
        const { error: insertError } = await supabase
          .from('tenant_members')
          .insert([
            {
              tenant_id: currentTenant.id,
              user_id: userId,
              role,
            },
          ]);

        if (insertError) throw insertError;

        // Refresh members
        await fetchTenantMembers();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to add member';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [currentTenant, fetchTenantMembers]
  );

  /**
   * Update member role
   */
  const updateMemberRole = useCallback(
    async (
      userId: string,
      role: 'admin' | 'editor' | 'viewer'
    ): Promise<void> => {
      if (!currentTenant) throw new Error('No current tenant');

      setIsLoading(true);
      setError(null);

      try {
        const { error: updateError } = await supabase
          .from('tenant_members')
          .update({ role })
          .eq('tenant_id', currentTenant.id)
          .eq('user_id', userId);

        if (updateError) throw updateError;

        // Refresh members
        await fetchTenantMembers();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to update member role';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [currentTenant, fetchTenantMembers]
  );

  /**
   * Remove member from tenant
   */
  const removeMember = useCallback(
    async (userId: string): Promise<void> => {
      if (!currentTenant) throw new Error('No current tenant');

      setIsLoading(true);
      setError(null);

      try {
        const { error: deleteError } = await supabase
          .from('tenant_members')
          .delete()
          .eq('tenant_id', currentTenant.id)
          .eq('user_id', userId);

        if (deleteError) throw deleteError;

        // Refresh members
        await fetchTenantMembers();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to remove member';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [currentTenant, fetchTenantMembers]
  );

  /**
   * Load tenants on mount
   */
  useEffect(() => {
    void fetchTenants();
  }, [fetchTenants]);

  /**
   * Load members when tenant changes
   */
  useEffect(() => {
    if (currentTenant) {
      void fetchTenantMembers(currentTenant.id);
    }
  }, [currentTenant?.id, fetchTenantMembers]);

  return {
    tenants,
    currentTenant,
    members,
    isLoading,
    error,
    fetchTenants,
    fetchTenantMembers,
    createTenant,
    switchTenant,
    addMember,
    updateMemberRole,
    removeMember,
  };
}
