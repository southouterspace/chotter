import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

const BUSINESS_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' // Acme HVAC

export interface TechnicianMetrics {
  totalJobs: number
  completedJobs: number
  completionRate: number
  averageJobDurationMinutes: number
  onTimePercentage: number
  averageRating: number
  totalRatings: number
}

async function fetchTechnicianMetrics(technicianId: string): Promise<TechnicianMetrics> {
  // Fetch all tickets for this technician
  const { data: tickets, error } = await supabase
    .from('tickets')
    .select(`
      id,
      status,
      actual_start_time,
      actual_end_time,
      scheduled_date,
      time_window_start,
      time_window_end,
      customer_rating
    `)
    .eq('business_id', BUSINESS_ID)
    .eq('assigned_technician_id', technicianId)

  if (error) throw error
  if (!tickets || tickets.length === 0) {
    return {
      totalJobs: 0,
      completedJobs: 0,
      completionRate: 0,
      averageJobDurationMinutes: 0,
      onTimePercentage: 0,
      averageRating: 0,
      totalRatings: 0,
    }
  }

  const totalJobs = tickets.length
  const completedJobs = tickets.filter(t => t.status === 'completed').length
  const completionRate = totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0

  // Calculate average job duration (only for completed jobs with times)
  const jobsWithDuration = tickets.filter(
    t => t.actual_start_time && t.actual_end_time
  )

  let averageJobDurationMinutes = 0
  if (jobsWithDuration.length > 0) {
    const totalDuration = jobsWithDuration.reduce((sum, ticket) => {
      const start = new Date(ticket.actual_start_time).getTime()
      const end = new Date(ticket.actual_end_time).getTime()
      const durationMinutes = (end - start) / (1000 * 60)
      return sum + durationMinutes
    }, 0)
    averageJobDurationMinutes = totalDuration / jobsWithDuration.length
  }

  // Calculate on-time percentage
  // On-time = job started within the scheduled time window
  const jobsWithSchedule = tickets.filter(
    t => t.status === 'completed' &&
         t.actual_start_time &&
         t.scheduled_date &&
         t.time_window_start &&
         t.time_window_end
  )

  let onTimeCount = 0
  if (jobsWithSchedule.length > 0) {
    onTimeCount = jobsWithSchedule.filter(ticket => {
      const actualStart = new Date(ticket.actual_start_time)
      const scheduledDate = new Date(ticket.scheduled_date)

      // Create Date objects for time window on scheduled date
      const [startHour, startMin] = ticket.time_window_start.split(':').map(Number)
      const [endHour, endMin] = ticket.time_window_end.split(':').map(Number)

      const windowStart = new Date(scheduledDate)
      windowStart.setHours(startHour, startMin, 0, 0)

      const windowEnd = new Date(scheduledDate)
      windowEnd.setHours(endHour, endMin, 0, 0)

      // Check if actual start is within window
      return actualStart >= windowStart && actualStart <= windowEnd
    }).length
  }

  const onTimePercentage = jobsWithSchedule.length > 0
    ? (onTimeCount / jobsWithSchedule.length) * 100
    : 0

  // Calculate average rating
  const ratingsData = tickets.filter(t => t.customer_rating !== null && t.customer_rating !== undefined)
  const totalRatings = ratingsData.length
  const averageRating = totalRatings > 0
    ? ratingsData.reduce((sum, t) => sum + (t.customer_rating || 0), 0) / totalRatings
    : 0

  return {
    totalJobs,
    completedJobs,
    completionRate,
    averageJobDurationMinutes,
    onTimePercentage,
    averageRating,
    totalRatings,
  }
}

export function useTechnicianMetrics(technicianId: string) {
  return useQuery({
    queryKey: ['technician-metrics', technicianId],
    queryFn: () => fetchTechnicianMetrics(technicianId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
