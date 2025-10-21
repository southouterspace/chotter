import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

const BUSINESS_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' // Acme HVAC

export interface TechnicianWithSkills {
  id: string
  firstName: string
  lastName: string
  name: string
  status: string
  skills: string[]
}

/**
 * Fetch technicians with their skills from technician_tags
 * Used for filtering technicians by service required skills
 */
export function useTechniciansWithSkills() {
  return useQuery({
    queryKey: ['technicians-with-skills', BUSINESS_ID],
    queryFn: async (): Promise<TechnicianWithSkills[]> => {
      // Fetch technicians with person data
      const { data: techData, error: techError } = await supabase
        .from('persons')
        .select('id, first_name, last_name, is_active')
        .eq('business_id', BUSINESS_ID)
        .eq('role', 'technician')
        .eq('is_active', true)
        .order('last_name', { ascending: true })

      if (techError) {
        throw new Error(`Failed to fetch technicians: ${techError.message}`)
      }

      // Fetch all technician skills/tags
      const { data: tagsData, error: tagsError } = await supabase
        .from('technician_tags')
        .select('person_id, name')
        .eq('business_id', BUSINESS_ID)
        .eq('tag_type', 'skill')

      if (tagsError) {
        throw new Error(`Failed to fetch technician skills: ${tagsError.message}`)
      }

      // Map skills to technicians
      const skillsByTechId = (tagsData || []).reduce((acc, tag) => {
        if (!acc[tag.person_id]) {
          acc[tag.person_id] = []
        }
        acc[tag.person_id].push(tag.name)
        return acc
      }, {} as Record<string, string[]>)

      // Combine technicians with their skills
      return (techData || []).map(tech => ({
        id: tech.id,
        firstName: tech.first_name,
        lastName: tech.last_name,
        name: `${tech.first_name} ${tech.last_name}`,
        status: tech.is_active ? 'active' : 'inactive',
        skills: skillsByTechId[tech.id] || [],
      }))
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
