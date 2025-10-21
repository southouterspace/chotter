import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useTechnicianMetrics } from '@/hooks/useTechnicianMetrics'
import {
  CheckCircle,
  Clock,
  Star,
  TrendingUp,
  Briefcase,
  AlertCircle,
} from 'lucide-react'

interface TechnicianMetricsProps {
  technicianId: string
}

export function TechnicianMetrics({ technicianId }: TechnicianMetricsProps) {
  const { data: metrics, isLoading, error } = useTechnicianMetrics(technicianId)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>Failed to load metrics</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!metrics) {
    return null
  }

  const metricItems = [
    {
      label: 'Total Jobs',
      value: metrics.totalJobs.toLocaleString(),
      icon: Briefcase,
      description: 'All assigned tickets',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Completed Jobs',
      value: metrics.completedJobs.toLocaleString(),
      icon: CheckCircle,
      description: 'Successfully completed',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Completion Rate',
      value: `${metrics.completionRate.toFixed(1)}%`,
      icon: TrendingUp,
      description: 'Completed vs assigned',
      color: metrics.completionRate >= 80 ? 'text-green-600' : metrics.completionRate >= 60 ? 'text-yellow-600' : 'text-red-600',
      bgColor: metrics.completionRate >= 80 ? 'bg-green-50' : metrics.completionRate >= 60 ? 'bg-yellow-50' : 'bg-red-50',
    },
    {
      label: 'Avg Job Duration',
      value: metrics.averageJobDurationMinutes > 0
        ? `${Math.round(metrics.averageJobDurationMinutes)} min`
        : 'N/A',
      icon: Clock,
      description: 'Check-in to completion',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'On-Time Rate',
      value: `${metrics.onTimePercentage.toFixed(1)}%`,
      icon: Clock,
      description: 'Within scheduled window',
      color: metrics.onTimePercentage >= 85 ? 'text-green-600' : metrics.onTimePercentage >= 70 ? 'text-yellow-600' : 'text-red-600',
      bgColor: metrics.onTimePercentage >= 85 ? 'bg-green-50' : metrics.onTimePercentage >= 70 ? 'bg-yellow-50' : 'bg-red-50',
    },
    {
      label: 'Customer Rating',
      value: metrics.totalRatings > 0
        ? `${metrics.averageRating.toFixed(1)} / 5.0`
        : 'No ratings',
      icon: Star,
      description: metrics.totalRatings > 0
        ? `Based on ${metrics.totalRatings} rating${metrics.totalRatings !== 1 ? 's' : ''}`
        : 'No customer ratings yet',
      color: metrics.averageRating >= 4.5 ? 'text-green-600' :
             metrics.averageRating >= 4.0 ? 'text-blue-600' :
             metrics.averageRating >= 3.0 ? 'text-yellow-600' :
             metrics.totalRatings > 0 ? 'text-red-600' : 'text-gray-600',
      bgColor: metrics.averageRating >= 4.5 ? 'bg-green-50' :
               metrics.averageRating >= 4.0 ? 'bg-blue-50' :
               metrics.averageRating >= 3.0 ? 'bg-yellow-50' :
               metrics.totalRatings > 0 ? 'bg-red-50' : 'bg-gray-50',
    },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Performance Metrics</CardTitle>
          {metrics.totalJobs === 0 && (
            <Badge variant="outline">No job history</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {metrics.totalJobs === 0 ? (
          <div className="text-center py-6">
            <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/20" />
            <p className="mt-2 text-sm text-muted-foreground">
              No jobs assigned yet
            </p>
            <p className="text-xs text-muted-foreground">
              Metrics will appear once technician starts working on tickets
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {metricItems.map((item, index) => {
              const Icon = item.icon
              return (
                <div
                  key={index}
                  className={`rounded-lg border p-4 ${item.bgColor} border-transparent`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {item.label}
                      </p>
                      <p className={`mt-2 text-2xl font-bold ${item.color}`}>
                        {item.value}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <Icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
