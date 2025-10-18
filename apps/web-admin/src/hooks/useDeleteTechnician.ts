import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

const BUSINESS_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' // Acme HVAC

async function deleteTechnician(id: string) {
  // Delete in reverse order due to foreign key constraints
  // 1. Delete availability
  const { error: availError } = await supabase
    .from('technician_availability')
    .delete()
    .eq('person_id', id)
    .eq('business_id', BUSINESS_ID)

  if (availError) throw availError

  // 2. Delete skills
  const { error: skillsError } = await supabase
    .from('technician_tags')
    .delete()
    .eq('person_id', id)
    .eq('business_id', BUSINESS_ID)

  if (skillsError) throw skillsError

  // 3. Delete person (soft delete by setting is_active to false)
  // We don't actually delete to preserve historical data
  const { error: personError } = await supabase
    .from('persons')
    .update({ is_active: false })
    .eq('id', id)
    .eq('business_id', BUSINESS_ID)

  if (personError) throw personError

  return { id }
}

export function useDeleteTechnician() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteTechnician,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technicians'] })
    },
  })
}
