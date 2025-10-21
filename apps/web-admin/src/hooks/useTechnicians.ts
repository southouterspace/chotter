import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

const BUSINESS_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' // Acme HVAC

export interface Certification {
  name: string
  issueDate: string
  expiryDate?: string
  certificationNumber?: string
}

export interface TechnicianData {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  isActive: boolean
  hourlyRate: number | null
  notes: string | null
  skills: string[]
  certifications: Certification[]
  availability: Array<{
    id: string
    dayOfWeek: number
    startTime: string
    endTime: string
    isAvailable: boolean
  }>
  createdAt: string
  updatedAt: string
}

export interface TechnicianFilters {
  status?: 'active' | 'inactive' | 'all'
  search?: string
  skillId?: string
}

async function fetchTechnicians(filters: TechnicianFilters = {}): Promise<TechnicianData[]> {
  // Build base query for persons with role='technician'
  let query = supabase
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
    .order('last_name', { ascending: true })

  // Apply status filter
  if (filters.status === 'active') {
    query = query.eq('is_active', true)
  } else if (filters.status === 'inactive') {
    query = query.eq('is_active', false)
  }

  // Apply search filter
  if (filters.search) {
    query = query.or(
      `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
    )
  }

  const { data: persons, error: personsError } = await query

  if (personsError) throw personsError
  if (!persons || persons.length === 0) return []

  const personIds = persons.map(p => p.id)

  // Fetch skills, certifications, and availability in parallel
  const [skillsResult, certificationsResult, availabilityResult] = await Promise.all([
    supabase
      .from('technician_tags')
      .select('person_id, name')
      .eq('business_id', BUSINESS_ID)
      .eq('tag_type', 'skill')
      .in('person_id', personIds),
    supabase
      .from('technician_tags')
      .select('person_id, name, tag_value')
      .eq('business_id', BUSINESS_ID)
      .eq('tag_type', 'certification')
      .in('person_id', personIds),
    supabase
      .from('technician_availability')
      .select('id, person_id, day_of_week, start_time, end_time, is_available')
      .eq('business_id', BUSINESS_ID)
      .in('person_id', personIds)
      .order('day_of_week', { ascending: true })
  ])

  if (skillsResult.error) throw skillsResult.error
  if (certificationsResult.error) throw certificationsResult.error
  if (availabilityResult.error) throw availabilityResult.error

  // Group skills and certifications by person_id
  const skillsByPerson = (skillsResult.data || []).reduce((acc, skill) => {
    if (!acc[skill.person_id]) acc[skill.person_id] = []
    acc[skill.person_id].push(skill.name)
    return acc
  }, {} as Record<string, string[]>)

  const certificationsByPerson = (certificationsResult.data || []).reduce((acc, cert) => {
    if (!acc[cert.person_id]) acc[cert.person_id] = []
    const certData = cert.tag_value as any
    acc[cert.person_id].push({
      name: cert.name,
      issueDate: certData?.issue_date || '',
      expiryDate: certData?.expiry_date,
      certificationNumber: certData?.number,
    })
    return acc
  }, {} as Record<string, Certification[]>)

  const availabilityByPerson = (availabilityResult.data || []).reduce((acc, avail) => {
    if (!acc[avail.person_id]) acc[avail.person_id] = []
    acc[avail.person_id].push({
      id: avail.id,
      dayOfWeek: avail.day_of_week,
      startTime: avail.start_time,
      endTime: avail.end_time,
      isAvailable: avail.is_available,
    })
    return acc
  }, {} as Record<string, TechnicianData['availability']>)

  // Combine all data
  return persons.map(person => ({
    id: person.id,
    firstName: person.first_name,
    lastName: person.last_name,
    email: person.email,
    phone: person.phone,
    isActive: person.is_active,
    hourlyRate: person.hourly_rate_cents ? person.hourly_rate_cents / 100 : null,
    notes: person.notes,
    skills: skillsByPerson[person.id] || [],
    certifications: certificationsByPerson[person.id] || [],
    availability: availabilityByPerson[person.id] || [],
    createdAt: person.created_at,
    updatedAt: person.updated_at,
  }))
}

export function useTechnicians(filters: TechnicianFilters = {}) {
  return useQuery({
    queryKey: ['technicians', filters],
    queryFn: () => fetchTechnicians(filters),
    staleTime: 1000 * 60, // 1 minute
  })
}
