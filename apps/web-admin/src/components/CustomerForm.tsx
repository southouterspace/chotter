import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { customerSchema, type CustomerFormData } from '@/lib/validation/customer'
import { useCreateCustomer } from '@/hooks/useCreateCustomer'
import { useUpdateCustomer } from '@/hooks/useUpdateCustomer'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import type { Database } from '@chotter/database/types/database'

type Customer = Database['public']['Tables']['customers']['Row']

interface CustomerFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer?: Customer | null
  onSuccess?: () => void
}

// Load Google Maps script
const loadGoogleMapsScript = (apiKey: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.google?.maps?.places) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google Maps'))
    document.head.appendChild(script)
  })
}

export function CustomerForm({ open, onOpenChange, customer, onSuccess }: CustomerFormProps) {
  const { toast } = useToast()
  const createCustomer = useCreateCustomer()
  const updateCustomer = useUpdateCustomer()
  const addressInputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)

  const isEditing = !!customer

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema as any) as any,
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      company_name: '',
      status: 'active',
      source: undefined,
      notes: '',
      service_address: {
        street: '',
        city: '',
        state: '',
        zip: '',
      },
      billing_address: {
        street: '',
        city: '',
        state: '',
        zip: '',
      },
    },
  })

  // Initialize Google Places Autocomplete
  useEffect(() => {
    const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    if (!googleMapsApiKey || !open) return

    loadGoogleMapsScript(googleMapsApiKey)
      .then(() => {
        if (!addressInputRef.current || autocompleteRef.current) return

        const autocomplete = new google.maps.places.Autocomplete(addressInputRef.current, {
          types: ['address'],
          componentRestrictions: { country: 'us' },
        })

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace()
          if (!place.address_components) return

          let street = ''
          let city = ''
          let state = ''
          let zip = ''
          let lat: number | undefined
          let lng: number | undefined

          // Extract address components
          place.address_components.forEach((component) => {
            const types = component.types
            if (types.includes('street_number')) {
              street = component.long_name + ' '
            }
            if (types.includes('route')) {
              street += component.long_name
            }
            if (types.includes('locality')) {
              city = component.long_name
            }
            if (types.includes('administrative_area_level_1')) {
              state = component.short_name
            }
            if (types.includes('postal_code')) {
              zip = component.long_name
            }
          })

          // Get coordinates
          if (place.geometry?.location) {
            lat = place.geometry.location.lat()
            lng = place.geometry.location.lng()
          }

          // Update form fields
          form.setValue('service_address.street', street.trim())
          form.setValue('service_address.city', city)
          form.setValue('service_address.state', state)
          form.setValue('service_address.zip', zip)
          if (lat !== undefined) form.setValue('service_address.latitude', lat)
          if (lng !== undefined) form.setValue('service_address.longitude', lng)
        })

        autocompleteRef.current = autocomplete
      })
      .catch((error) => {
        console.error('Error loading Google Maps:', error)
      })

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current)
        autocompleteRef.current = null
      }
    }
  }, [open, form])

  // Reset form when customer changes
  useEffect(() => {
    if (customer) {
      const serviceAddress =
        typeof customer.service_address === 'object' && customer.service_address !== null
          ? customer.service_address as any
          : {}
      const billingAddress =
        typeof customer.billing_address === 'object' && customer.billing_address !== null
          ? customer.billing_address as any
          : {}

      form.reset({
        first_name: customer.first_name,
        last_name: customer.last_name,
        email: customer.email || '',
        phone: customer.phone,
        company_name: customer.company_name || '',
        status: customer.status,
        source: customer.source || undefined,
        notes: customer.notes || '',
        service_address: {
          street: serviceAddress.street || '',
          city: serviceAddress.city || '',
          state: serviceAddress.state || '',
          zip: serviceAddress.zip || '',
          latitude: serviceAddress.latitude,
          longitude: serviceAddress.longitude,
        },
        billing_address: {
          street: billingAddress.street || '',
          city: billingAddress.city || '',
          state: billingAddress.state || '',
          zip: billingAddress.zip || '',
        },
      })
    } else {
      form.reset({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        company_name: '',
        status: 'active',
        source: undefined,
        notes: '',
        service_address: {
          street: '',
          city: '',
          state: '',
          zip: '',
        },
        billing_address: {
          street: '',
          city: '',
          state: '',
          zip: '',
        },
      })
    }
  }, [customer, form])

  const onSubmit = async (data: CustomerFormData) => {
    try {
      if (isEditing && customer) {
        await updateCustomer.mutateAsync({ id: customer.id, data })
        toast({
          title: 'Customer updated',
          description: 'Customer information has been updated successfully.',
        })
      } else {
        await createCustomer.mutateAsync(data)
        toast({
          title: 'Customer created',
          description: 'New customer has been added successfully.',
        })
      }
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save customer',
        variant: 'destructive',
      })
    }
  }

  const isLoading = createCustomer.isPending || updateCustomer.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update customer information below.'
              : 'Enter customer information below. Use the address autocomplete for accurate location.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input type="tel" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Source (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select source" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="referral">Referral</SelectItem>
                          <SelectItem value="google_ads">Google Ads</SelectItem>
                          <SelectItem value="website">Website</SelectItem>
                          <SelectItem value="repeat">Repeat</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Service Address */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Service Address</h3>
              <FormField
                control={form.control}
                name="service_address.street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input {...field} ref={addressInputRef} placeholder="Start typing address..." />
                    </FormControl>
                    <FormDescription>
                      Start typing to use Google Places autocomplete
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="service_address.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="service_address.state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input {...field} maxLength={2} placeholder="CA" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="service_address.zip"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ZIP Code</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Update Customer' : 'Create Customer'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
