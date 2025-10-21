import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  operatingHoursSchema,
  defaultOperatingHours,
  type OperatingHoursFormData,
} from '@/lib/validation/business'
import { useBusinessSettings, useUpdateOperatingHours } from '@/hooks/useBusinessSettings'
import { useToast } from '@/hooks/use-toast'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Clock, Plus, X } from 'lucide-react'

const DAYS = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
] as const

type DayKey = typeof DAYS[number]['key']

export function OperatingHoursEditor() {
  const { toast } = useToast()
  const { data: business, isLoading } = useBusinessSettings()
  const updateOperatingHours = useUpdateOperatingHours()

  const form = useForm<OperatingHoursFormData>({
    resolver: zodResolver(operatingHoursSchema as any) as any,
    defaultValues: defaultOperatingHours,
  })

  // Load business hours when available
  useEffect(() => {
    if (business?.business_hours) {
      const hours = business.business_hours as OperatingHoursFormData
      form.reset(hours)
    } else {
      form.reset(defaultOperatingHours)
    }
  }, [business, form])

  const onSubmit = async (data: OperatingHoursFormData) => {
    try {
      await updateOperatingHours.mutateAsync(data)
      toast({
        title: 'Operating hours updated',
        description: 'Your operating hours have been saved successfully.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update operating hours',
        variant: 'destructive',
      })
    }
  }

  const addBreak = (dayKey: DayKey) => {
    const currentDay = form.getValues(dayKey)
    const breaks = [...currentDay.breaks, { start: '12:00', end: '13:00' }]
    form.setValue(`${dayKey}.breaks`, breaks)
  }

  const removeBreak = (dayKey: DayKey, breakIndex: number) => {
    const currentDay = form.getValues(dayKey)
    const breaks = currentDay.breaks.filter((_, index) => index !== breakIndex)
    form.setValue(`${dayKey}.breaks`, breaks)
  }

  const isSaving = updateOperatingHours.isPending

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          <CardTitle>Operating Hours</CardTitle>
        </div>
        <CardDescription>
          Set your business hours for each day of the week
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {DAYS.map(({ key, label }) => (
              <div key={key} className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <FormField
                    control={form.control}
                    name={`${key}.open`}
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-3 space-y-0">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-semibold text-base cursor-pointer">
                          {label}
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>

                {form.watch(`${key}.open`) && (
                  <div className="space-y-3 pl-2">
                    {/* Main Hours */}
                    <div className="flex items-center gap-3">
                      <FormField
                        control={form.control}
                        name={`${key}.start`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel className="text-xs">Start Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <span className="text-muted-foreground mt-6">to</span>
                      <FormField
                        control={form.control}
                        name={`${key}.end`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel className="text-xs">End Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Break Times */}
                    {form.watch(`${key}.breaks`)?.map((_, breakIndex) => (
                      <div key={breakIndex} className="flex items-center gap-3 pl-4 border-l-2 border-muted">
                        <FormField
                          control={form.control}
                          name={`${key}.breaks.${breakIndex}.start`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel className="text-xs">Break Start</FormLabel>
                              <FormControl>
                                <Input type="time" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <span className="text-muted-foreground mt-6">to</span>
                        <FormField
                          control={form.control}
                          name={`${key}.breaks.${breakIndex}.end`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel className="text-xs">Break End</FormLabel>
                              <FormControl>
                                <Input type="time" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="mt-6"
                          onClick={() => removeBreak(key, breakIndex)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}

                    {/* Add Break Button */}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="ml-4"
                      onClick={() => addBreak(key)}
                    >
                      <Plus className="mr-2 h-3 w-3" />
                      Add Break Time
                    </Button>
                  </div>
                )}

                {!form.watch(`${key}.open`) && (
                  <p className="text-sm text-muted-foreground pl-2">Closed</p>
                )}
              </div>
            ))}

            {/* Submit Button */}
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
