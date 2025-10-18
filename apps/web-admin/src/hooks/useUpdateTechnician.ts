import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { TechnicianFormData } from '@/lib/validation/technician'

const BUSINESS_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' // Acme HVAC

interface UpdateTechnicianParams extends TechnicianFormData {
  id: string
}

async function updateTechnician(data: UpdateTechnicianParams) {
  // 1. Update person record
  const { error: personError } = await supabase
    .from('persons')
    .update({
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      phone: data.phone || null,
      is_active: data.isActive,
      hourly_rate_cents: data.hourlyRate ? Math.round(data.hourlyRate * 100) : null,
      notes: data.notes || null,
    })
    .eq('id', data.id)
    .eq('business_id', BUSINESS_ID)

  if (personError) throw personError

  // 2. Update skills - delete all and recreate
  const { error: deleteSkillsError } = await supabase
    .from('technician_tags')
    .delete()
    .eq('person_id', data.id)
    .eq('business_id', BUSINESS_ID)
    .eq('tag_type', 'skill')

  if (deleteSkillsError) throw deleteSkillsError

  if (data.skills.length > 0) {
    const skills = data.skills.map(skill => ({
      business_id: BUSINESS_ID,
      person_id: data.id,
      tag_type: 'skill' as const,
      name: skill,
    }))

    const { error: skillsError } = await supabase
      .from('technician_tags')
      .insert(skills)

    if (skillsError) throw skillsError
  }

  // 3. Update availability schedule
  if (data.workSchedule) {
    // Delete existing availability
    const { error: deleteAvailError } = await supabase
      .from('technician_availability')
      .delete()
      .eq('person_id', data.id)
      .eq('business_id', BUSINESS_ID)

    if (deleteAvailError) throw deleteAvailError

    const daysMap = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    }

    const availability = Object.entries(data.workSchedule)
      .map(([day, schedule]) => ({
        business_id: BUSINESS_ID,
        person_id: data.id,
        day_of_week: daysMap[day as keyof typeof daysMap],
        start_time: schedule.startTime || '09:00',
        end_time: schedule.endTime || '17:00',
        is_available: schedule.isAvailable,
      }))

    const { error: availError } = await supabase
      .from('technician_availability')
      .insert(availability)

    if (availError) throw availError
  }

  return { id: data.id }
}

export function useUpdateTechnician() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateTechnician,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['technicians'] })
      queryClient.invalidateQueries({ queryKey: ['technician', variables.id] })
    },
  })
}
