# @chotter/database

Type-safe Supabase client, TypeScript types, and query helpers for the Chotter database.

## Features

- **Fully Type-Safe**: Auto-generated TypeScript types from Supabase schema
- **Client Factory**: Type-safe Supabase client creation for browser and server
- **Auth Helpers**: Convenient authentication functions
- **Query Helpers**: Pre-built type-safe queries for common operations
- **Multi-Tenant**: Built-in support for business-scoped queries

## Installation

This is an internal package in the Chotter monorepo. Import it using:

```typescript
import { createSupabaseClient, getTicketById } from '@chotter/database';
```

## Quick Start

### 1. Create a Client

```typescript
import { createSupabaseClient } from '@chotter/database';

const client = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

### 2. Authenticate

```typescript
import { signIn, getCurrentUser } from '@chotter/database';

// Sign in
const { user, session } = await signIn(client, 'user@example.com', 'password');

// Get current user
const currentUser = await getCurrentUser(client);
```

### 3. Query Data

```typescript
import { getTicketsByStatus, createTicket } from '@chotter/database';

// Get pending tickets
const tickets = await getTicketsByStatus(client, businessId, 'pending');

// Create a new ticket
const newTicket = await createTicket(client, {
  business_id: businessId,
  customer_id: customerId,
  source: 'phone',
  title: 'AC not cooling',
  description: 'Customer reports AC not cooling properly',
  priority: 'high',
});
```

## API Reference

### Client

#### `createSupabaseClient(url, key)`

Create a type-safe Supabase client for browser/client-side usage.

```typescript
const client = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

#### `createSupabaseServerClient(url, serviceRoleKey)`

Create a server-side client with service role key. **WARNING**: This bypasses RLS policies. Only use server-side.

```typescript
const adminClient = createSupabaseServerClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

### Authentication

#### `signUp(client, email, password, metadata)`

Register a new user with metadata.

```typescript
const { user, session } = await signUp(client, email, password, {
  firstName: 'John',
  lastName: 'Doe',
  businessId: 'business-uuid',
  role: 'technician',
});
```

#### `signIn(client, email, password)`

Sign in an existing user.

```typescript
const { user, session } = await signIn(client, email, password);
```

#### `signOut(client)`

Sign out the current user.

```typescript
await signOut(client);
```

#### `getCurrentUser(client)`

Get the currently authenticated user.

```typescript
const user = await getCurrentUser(client);
```

### Ticket Queries

#### `getTicketById(client, ticketId)`

Get a ticket by ID.

```typescript
const ticket = await getTicketById(client, ticketId);
```

#### `getTicketsByStatus(client, businessId, status)`

Get all tickets with a specific status.

```typescript
const pendingTickets = await getTicketsByStatus(client, businessId, 'pending');
```

#### `getTicketsByTechnician(client, businessId, technicianId)`

Get all tickets assigned to a technician.

```typescript
const myTickets = await getTicketsByTechnician(client, businessId, technicianId);
```

#### `getTicketsScheduledBetween(client, businessId, startDate, endDate)`

Get tickets scheduled within a date range.

```typescript
const todayTickets = await getTicketsScheduledBetween(
  client,
  businessId,
  '2025-10-18T00:00:00Z',
  '2025-10-18T23:59:59Z'
);
```

#### `createTicket(client, ticket)`

Create a new ticket.

```typescript
const ticket = await createTicket(client, {
  business_id: businessId,
  customer_id: customerId,
  source: 'phone',
  title: 'Heater repair',
  priority: 'normal',
});
```

#### `updateTicket(client, ticketId, updates)`

Update a ticket.

```typescript
const updated = await updateTicket(client, ticketId, {
  status: 'in_progress',
  assigned_to: technicianId,
});
```

#### `assignTicket(client, ticketId, technicianId)`

Assign a ticket to a technician.

```typescript
await assignTicket(client, ticketId, technicianId);
```

### Customer Queries

#### `getCustomerById(client, customerId)`

Get a customer by ID.

```typescript
const customer = await getCustomerById(client, customerId);
```

#### `searchCustomers(client, businessId, searchTerm)`

Search customers by name, email, or phone.

```typescript
const results = await searchCustomers(client, businessId, 'john');
```

#### `createCustomer(client, customer)`

Create a new customer.

```typescript
const customer = await createCustomer(client, {
  business_id: businessId,
  first_name: 'Jane',
  last_name: 'Smith',
  phone: '555-1234',
  email: 'jane@example.com',
});
```

#### `addCustomerTags(client, customerId, tags)`

Add tags to a customer.

```typescript
await addCustomerTags(client, customerId, ['vip', 'commercial']);
```

### Technician Queries

#### `getTechnicians(client, businessId)`

Get all technicians for a business.

```typescript
const technicians = await getTechnicians(client, businessId);
```

#### `getActiveTechnicians(client, businessId)`

Get only active technicians.

```typescript
const active = await getActiveTechnicians(client, businessId);
```

#### `getPersonByAuthUserId(client, authUserId)`

Get person record by their auth user ID.

```typescript
const person = await getPersonByAuthUserId(client, user.id);
```

#### `createPerson(client, person)`

Create a new person.

```typescript
const person = await createPerson(client, {
  business_id: businessId,
  auth_user_id: authUserId,
  role: 'technician',
  first_name: 'Mike',
  last_name: 'Johnson',
  email: 'mike@example.com',
});
```

## Type Exports

All database types are exported for use in your application:

```typescript
import type {
  Database,
  Ticket,
  Customer,
  Person,
  TicketStatus,
  PersonRole,
} from '@chotter/database';
```

### Available Types

- **Tables**: All table Row, Insert, and Update types
- **Enums**: All enum types (status, priority, role, etc.)
- **Database**: Full database schema type

## Generating Types

To regenerate TypeScript types from the Supabase schema:

```bash
# Make sure Supabase is running locally
supabase start

# Generate types
cd packages/database
bun run generate-types
```

This will update `src/types/database.ts` with the latest schema.

## Development

```bash
# Type check
bun run type-check

# Build
bun run build

# Clean
bun run clean
```

## Architecture

```
packages/database/
├── src/
│   ├── types/
│   │   └── database.ts          # Auto-generated database types
│   ├── client.ts                # Supabase client factory
│   ├── auth.ts                  # Auth helper functions
│   ├── queries/
│   │   ├── tickets.ts           # Ticket query helpers
│   │   ├── customers.ts         # Customer query helpers
│   │   ├── technicians.ts       # Technician query helpers
│   │   └── index.ts             # Query exports
│   └── index.ts                 # Main export file
├── package.json
├── tsconfig.json
└── README.md
```

## Multi-Tenant Support

All queries are designed for multi-tenant use. Always scope queries by `business_id`:

```typescript
// Good - scoped to business
const tickets = await getTicketsByBusiness(client, businessId);

// Good - scoped to business and status
const pending = await getTicketsByStatus(client, businessId, 'pending');
```

Row Level Security (RLS) policies enforce tenant isolation at the database level.

## Best Practices

1. **Always use the type-safe client**: Import from `@chotter/database` instead of using Supabase directly
2. **Leverage query helpers**: Use pre-built queries instead of writing raw SQL
3. **Handle errors**: All queries can throw errors - wrap in try/catch
4. **Use server client carefully**: Only use `createSupabaseServerClient` on the server with proper security
5. **Keep types updated**: Regenerate types after schema changes

## License

Private - Chotter Internal Package
