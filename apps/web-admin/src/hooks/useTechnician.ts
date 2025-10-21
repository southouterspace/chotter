import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { TechnicianData } from './useTechnicians'

const BUSINESS_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' // Acme HVAC

async function fetchTechnician(id: string): Promise<TechnicianData | null> {
  const { data: tech, error: techError } = await supabase
    .from('persons')
    .select(`
      id,
      first_name,
      last_name,
      email,
      phone,
      is_active,
      hourly_rate_cents,
      notes,
      created_at,
      updated_at
    `)
    .eq('business_id', BUSINESS_ID)
    .eq('role', 'technician')
    .eq('id', id)
    .single()

  if (techError) throw techError
  if (!tech) return null

  // Fetch skills and availability
  const [skillsResult, availabilityResult] = await Promise.all([
    supabase
      .from('technician_tags')
      .select('name')
      .eq('business_id', BUSINESS_ID)
      .eq('tag_type', 'skill')
      .eq('person_id', id),
    supabase
      .from('technician_availability')
      .select('id, day_of_week, start_time, end_time, is_available')
      .eq('business_id', BUSINESS_ID)
      .eq('person_id', id)
      .order('day_of_week', { ascending: true })
  ])

  if (skillsResult.error) throw skillsResult.error
  if (availabilityResult.error) throw availabilityResult.error

  return {
    id: tech.id,
    firstName: tech.first_name,
    lastName: tech.last_name,
    email: tech.email,
    phone: tech.phone,
    isActive: tech.is_active,
    hourlyRate: tech.hourly_rate_cents ? tech.hourly_rate_cents / 100 : null,
    notes: tech.notes,
    skills: skillsResult.data?.map(s => s.name) || [],
    certifications: [], // TODO: Add certifications support when table is created
    availability: (availabilityResult.data || []).map(a => ({
      id: a.id,
      dayOfWeek: a.day_of_week,
      startTime: a.start_time,
      endTime: a.end_time,
      isAvailable: a.is_available,
    })),
    createdAt: tech.created_at,
    updatedAt: tech.updated_at,
  }
}

export function useTechnician(id: string | null) {
  return useQuery({
    queryKey: ['technician', id],
    queryFn: () => (id ? fetchTechnician(id) : null),
    enabled: !!id,
  })
}
