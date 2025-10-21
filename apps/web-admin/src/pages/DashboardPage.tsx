import { StatsWidget } from '@/components/StatsWidget'
import { LiveMap } from '@/components/LiveMap'
import { RecentActivity } from '@/components/RecentActivity'

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Real-time overview of your service operations
        </p>
      </div>

      {/* Stats Widgets */}
      <StatsWidget />

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Live Map - Takes 2 columns on large screens */}
        <div className="lg:col-span-2">
          <LiveMap />
        </div>

        {/* Recent Activity - Takes 1 column on large screens */}
        <div className="lg:col-span-1">
          <RecentActivity />
        </div>
      </div>
    </div>
  )
}
