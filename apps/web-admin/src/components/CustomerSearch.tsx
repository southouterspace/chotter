import { useState, useMemo } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useCustomers } from '@/hooks/useCustomers'
import type { CustomerListItem } from '@/hooks/useCustomers'

interface CustomerSearchProps {
  value?: string
  onValueChange: (value: string) => void
  disabled?: boolean
}

export function CustomerSearch({ value, onValueChange, disabled }: CustomerSearchProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  // Fetch customers with search filter
  const { data: customers = [], isLoading } = useCustomers({ search })

  // Find selected customer
  const selectedCustomer = useMemo(() => {
    return customers.find((customer) => customer.id === value)
  }, [customers, value])

  // Format customer display
  const formatCustomer = (customer: CustomerListItem) => {
    const parts = [
      `${customer.first_name} ${customer.last_name}`,
    ]
    if (customer.company_name) {
      parts.push(`(${customer.company_name})`)
    }
    if (customer.phone) {
      parts.push(`- ${customer.phone}`)
    }
    return parts.join(' ')
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {selectedCustomer ? (
            <span className="truncate">
              {formatCustomer(selectedCustomer)}
            </span>
          ) : (
            <span className="text-muted-foreground">Search for customer...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[500px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search by name, phone, or email..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? 'Loading customers...' : 'No customers found.'}
            </CommandEmpty>
            <CommandGroup>
              {customers.map((customer) => (
                <CommandItem
                  key={customer.id}
                  value={customer.id}
                  onSelect={(currentValue: string) => {
                    onValueChange(currentValue === value ? '' : currentValue)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === customer.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex flex-col gap-0.5">
                    <div className="font-medium">
                      {customer.first_name} {customer.last_name}
                      {customer.company_name && (
                        <span className="ml-2 text-sm text-muted-foreground">
                          ({customer.company_name})
                        </span>
                      )}
                    </div>
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      {customer.phone && <span>{customer.phone}</span>}
                      {customer.email && <span>{customer.email}</span>}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
