import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@chotter/database/types/database'
import type { InviteAdminFormData } from '@/lib/validation/business'

const BUSINESS_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' // Acme HVAC

type Person = Database['public']['Tables']['persons']['Row']

export interface UserListItem extends Person {
  full_name: string
}

// Fetch all users (admins and technicians)
export function useUsers() {
  return useQuery({
    queryKey: ['users', BUSINESS_ID],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('persons')
        .select('*')
        .eq('business_id', BUSINESS_ID)
        .in('role', ['admin', 'technician'])
        .order('created_at', { ascending: false })

      if (error) throw error

      // Add full_name computed field
      const users: UserListItem[] = (data || []).map((user) => ({
        ...user,
        full_name: `${user.first_name} ${user.last_name}`,
      }))

      return users
    },
  })
}

// Toggle user active/inactive status
export function useToggleUserStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      const { data, error } = await supabase
        .from('persons')
        .update({
          is_active: isActive,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', BUSINESS_ID] })
    },
  })
}

// Invite admin user
export function useInviteAdmin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: InviteAdminFormData) => {
      // First, invite the user via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.inviteUserByEmail(
        data.email,
        {
          data: {
            first_name: data.first_name,
            last_name: data.last_name,
            role: 'admin',
          },
        }
      )

      if (authError) {
        // Check if error is due to missing admin privileges
        if (authError.message.includes('admin') || authError.status === 403) {
          throw new Error(
            'Unable to invite users. This feature requires admin API access. Please use the Supabase Dashboard to invite users or contact your administrator.'
          )
        }
        throw authError
      }

      if (!authData.user) {
        throw new Error('Failed to create user')
      }

      // Create person record
      const { data: person, error: personError } = await supabase
        .from('persons')
        .insert({
          business_id: BUSINESS_ID,
          auth_user_id: authData.user.id,
          role: 'admin',
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          is_active: true,
        })
        .select()
        .single()

      if (personError) {
        // Clean up auth user if person creation fails
        await supabase.auth.admin.deleteUser(authData.user.id)
        throw personError
      }

      return person
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', BUSINESS_ID] })
    },
  })
}
