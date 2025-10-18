import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { TechnicianFormData } from '@/lib/validation/technician'

const BUSINESS_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' // Acme HVAC
const AUTH_USER_ID = 'auth-user-placeholder' // TODO: Get from auth context

interface CreateTechnicianParams extends TechnicianFormData {
  authUserId: string
}

async function createTechnician(data: CreateTechnicianParams) {
  // 1. Create person record
  const { data: person, error: personError } = await supabase
    .from('persons')
    .insert({
      business_id: BUSINESS_ID,
      auth_user_id: data.authUserId || AUTH_USER_ID,
      role: 'technician',
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      phone: data.phone || null,
      is_active: data.isActive,
      hourly_rate_cents: data.hourlyRate ? Math.round(data.hourlyRate * 100) : null,
      notes: data.notes || null,
    })
    .select()
    .single()

  if (personError) throw personError
  if (!person) throw new Error('Failed to create technician')

  // 2. Create skills
  if (data.skills.length > 0) {
    const skills = data.skills.map(skill => ({
      business_id: BUSINESS_ID,
      person_id: person.id,
      tag_type: 'skill' as const,
      name: skill,
    }))

    const { error: skillsError } = await supabase
      .from('technician_tags')
      .insert(skills)

    if (skillsError) {
      // Rollback person creation
      await supabase.from('persons').delete().eq('id', person.id)
      throw skillsError
    }
  }

  // 3. Create availability schedule
  if (data.workSchedule) {
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
        person_id: person.id,
        day_of_week: daysMap[day as keyof typeof daysMap],
        start_time: schedule.startTime || '09:00',
        end_time: schedule.endTime || '17:00',
        is_available: schedule.isAvailable,
      }))

    const { error: availError } = await supabase
      .from('technician_availability')
      .insert(availability)

    if (availError) {
      // Rollback
      await supabase.from('technician_tags').delete().eq('person_id', person.id)
      await supabase.from('persons').delete().eq('id', person.id)
      throw availError
    }
  }

  return person
}

export function useCreateTechnician() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTechnician,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technicians'] })
    },
  })
}
