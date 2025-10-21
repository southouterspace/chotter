import { useState } from 'react'
import { useRoutes } from '@/hooks/useRoutes'
import { RouteList } from '@/components/RouteList'
import { RouteDetail } from '@/components/RouteDetail'
import { RouteMap } from '@/components/RouteMap'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CalendarIcon, List, Map as MapIcon, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'

export function RoutesPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'list' | 'map'>('list')

  const { routes, loading, error, refetch } = useRoutes(selectedDate)

  const selectedRoute = routes.find(r => r.id === selectedRouteId) || null

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)
      setSelectedRouteId(null) // Reset selection when date changes
    }
  }

  const handleRouteSelect = (routeId: string) => {
    setSelectedRouteId(routeId)
    // On mobile, switch to map tab when route is selected
    if (window.innerWidth < 768) {
      setActiveTab('map')
    }
  }

  const handleUpdate = () => {
    refetch()
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Error Loading Routes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive mb-4">{error.message}</p>
            <Button onClick={refetch}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Route Management</h1>
          <p className="text-muted-foreground">
            Visualize and optimize daily routes for your technicians
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Date Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(selectedDate, 'PPP')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={refetch}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Skeleton className="h-[600px] w-full" />
          </div>
          <div className="lg:col-span-2">
            <Skeleton className="h-[600px] w-full" />
          </div>
        </div>
      )}

      {/* Desktop: Two-panel layout */}
      {!loading && (
        <div className="hidden lg:grid lg:grid-cols-3 gap-6">
          {/* Left Panel: Route List */}
          <div className="lg:col-span-1 space-y-4">
            <RouteList
              routes={routes}
              selectedRouteId={selectedRouteId}
              onRouteSelect={handleRouteSelect}
            />
          </div>

          {/* Right Panel: Route Details and Map */}
          <div className="lg:col-span-2 space-y-4">
            {selectedRoute ? (
              <>
                <RouteDetail route={selectedRoute} onUpdate={handleUpdate} />
                <RouteMap route={selectedRoute} />
              </>
            ) : (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <MapIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No Route Selected</h3>
                    <p className="text-muted-foreground">
                      Select a route from the list to view details and map
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Mobile: Tabbed layout */}
      {!loading && (
        <div className="lg:hidden">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'list' | 'map')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list">
                <List className="h-4 w-4 mr-2" />
                Routes
              </TabsTrigger>
              <TabsTrigger value="map" disabled={!selectedRoute}>
                <MapIcon className="h-4 w-4 mr-2" />
                Details & Map
              </TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="mt-4">
              <RouteList
                routes={routes}
                selectedRouteId={selectedRouteId}
                onRouteSelect={handleRouteSelect}
              />
            </TabsContent>

            <TabsContent value="map" className="mt-4 space-y-4">
              {selectedRoute ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab('list')}
                    className="mb-4"
                  >
                    <List className="h-4 w-4 mr-2" />
                    Back to Routes
                  </Button>
                  <RouteDetail route={selectedRoute} onUpdate={handleUpdate} />
                  <RouteMap route={selectedRoute} />
                </>
              ) : (
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center">
                      <MapIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">No Route Selected</h3>
                      <p className="text-muted-foreground mb-4">
                        Select a route from the list to view details
                      </p>
                      <Button onClick={() => setActiveTab('list')}>
                        View Routes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}
