import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { businessInfoSchema, type BusinessInfoFormData } from '@/lib/validation/business'
import { useBusinessSettings, useUpdateBusinessInfo } from '@/hooks/useBusinessSettings'
import { useToast } from '@/hooks/use-toast'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Building2 } from 'lucide-react'

export function BusinessInfoForm() {
  const { toast } = useToast()
  const { data: business, isLoading } = useBusinessSettings()
  const updateBusinessInfo = useUpdateBusinessInfo()

  const form = useForm<BusinessInfoFormData>({
    resolver: zodResolver(businessInfoSchema as any) as any,
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      website: '',
      logo_url: '',
      address: {
        street: '',
        city: '',
        state: '',
        zip: '',
      },
    },
  })

  // Load business data when available
  useEffect(() => {
    if (business) {
      const address = typeof business.address === 'object' && business.address !== null
        ? business.address as any
        : { street: '', city: '', state: '', zip: '' }

      form.reset({
        name: business.name || '',
        phone: business.phone || '',
        email: business.email || '',
        website: business.website || '',
        logo_url: business.logo_url || '',
        address: {
          street: address.street || '',
          city: address.city || '',
          state: address.state || '',
          zip: address.zip || '',
        },
      })
    }
  }, [business, form])

  const onSubmit = async (data: BusinessInfoFormData) => {
    try {
      await updateBusinessInfo.mutateAsync(data)
      toast({
        title: 'Business information updated',
        description: 'Your business information has been saved successfully.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update business information',
        variant: 'destructive',
      })
    }
  }

  const isSaving = updateBusinessInfo.isPending

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
          <Building2 className="h-5 w-5" />
          <CardTitle>Business Information</CardTitle>
        </div>
        <CardDescription>
          Update your business contact information and details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Business Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Acme HVAC Services" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Contact Information */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input type="tel" {...field} placeholder="(555) 123-4567" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} placeholder="contact@acmehvac.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Website and Logo */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website (Optional)</FormLabel>
                    <FormControl>
                      <Input type="url" {...field} placeholder="https://www.acmehvac.com" />
                    </FormControl>
                    <FormDescription>Your business website URL</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="logo_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo URL (Optional)</FormLabel>
                    <FormControl>
                      <Input type="url" {...field} placeholder="https://..." />
                    </FormControl>
                    <FormDescription>URL to your business logo</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Business Address */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Business Address</h3>

              <FormField
                control={form.control}
                name="address.street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="123 Main Street" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="address.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="San Francisco" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address.state"
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
                  name="address.zip"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ZIP Code</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="94103" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
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
