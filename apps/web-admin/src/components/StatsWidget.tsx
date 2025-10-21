import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useTodayStats } from '@/hooks/useTodayStats'
import { CalendarDays, Users, TrendingUp, Clock } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  description?: string
  loading?: boolean
}

function StatCard({ title, value, icon, description, loading }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-4 w-4 text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <>
            <Skeleton className="h-8 w-20 mb-1" />
            <Skeleton className="h-4 w-32" />
          </>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export function StatsWidget() {
  const { stats, loading, error } = useTodayStats()

  if (error) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="col-span-full">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">
              Failed to load statistics: {error.message}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Appointments Today"
        value={stats?.totalAppointments ?? 0}
        icon={<CalendarDays className="h-4 w-4" />}
        description="Scheduled for today"
        loading={loading}
      />
      <StatCard
        title="Active Technicians"
        value={stats?.activeTechnicians ?? 0}
        icon={<Users className="h-4 w-4" />}
        description="Currently active"
        loading={loading}
      />
      <StatCard
        title="Completion Rate"
        value={stats?.completionRate ? `${stats.completionRate}%` : '0%'}
        icon={<TrendingUp className="h-4 w-4" />}
        description="Overall completion rate"
        loading={loading}
      />
      <StatCard
        title="Pending Appointments"
        value={stats?.pendingAppointments ?? 0}
        icon={<Clock className="h-4 w-4" />}
        description="Awaiting assignment"
        loading={loading}
      />
    </div>
  )
}
