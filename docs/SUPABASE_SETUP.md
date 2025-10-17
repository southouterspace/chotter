# Supabase Setup Guide

This document provides instructions for setting up Supabase for the Chotter project, both locally and in the cloud.

## Local Development Setup

### Prerequisites

- Docker Desktop installed and running
- Supabase CLI installed (v2.51.0 or higher)

### Local Services

The local Supabase instance is already configured and running with the following services:

#### Service URLs

- **API URL**: http://127.0.0.1:54321
- **GraphQL URL**: http://127.0.0.1:54321/graphql/v1
- **S3 Storage URL**: http://127.0.0.1:54321/storage/v1/s3
- **MCP URL**: http://127.0.0.1:54321/mcp
- **Database URL**: postgresql://postgres:postgres@127.0.0.1:54322/postgres
- **Studio URL**: http://127.0.0.1:54323
- **Mailpit URL**: http://127.0.0.1:54324

#### Local Credentials

All credentials are stored in the `.env` file (git-ignored). Key values:

- **Publishable Key**: `sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH`
- **Secret Key**: `sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz`

### Local Development Commands

```bash
# Start Supabase services
supabase start

# Stop Supabase services
supabase stop

# Check status
supabase status

# View database migrations
supabase db diff

# Access Studio (web UI)
open http://127.0.0.1:54323
```

## Cloud Project Setup

To create and link a cloud Supabase project, follow these steps:

### Step 1: Create Supabase Cloud Account

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub, Google, or email

### Step 2: Create a New Project

1. In the Supabase Dashboard, click "New Project"
2. Fill in the project details:
   - **Organization**: Select or create an organization
   - **Project Name**: `chotter` (or your preferred name)
   - **Database Password**: Generate a strong password (save it securely)
   - **Region**: Choose the closest region to your users
   - **Plan**: Select Free tier or Pro (based on requirements)

3. Click "Create new project"
4. Wait 2-3 minutes for the project to be provisioned

### Step 3: Get Project Credentials

Once the project is created:

1. Navigate to **Project Settings** (gear icon in sidebar)
2. Click on **API** section
3. Copy the following values:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **Anon/Public Key** (starts with `eyJ...`)
   - **Service Role Key** (starts with `eyJ...` - keep this secret!)

### Step 4: Link Local Project to Cloud

Run the following command to link your local project:

```bash
supabase link --project-ref <your-project-ref>
```

You can find the project reference in your project URL:
`https://<project-ref>.supabase.co`

When prompted, enter your database password from Step 2.

### Step 5: Update Environment Variables

Update your `.env` file with cloud credentials:

```bash
# Uncomment and update these lines in .env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Note**: Keep cloud credentials separate from local ones. Use `NEXT_PUBLIC_*` prefix for client-side accessible keys.

### Step 6: Push Database Schema to Cloud

Once linked, you can push your local schema to the cloud:

```bash
# Push migrations to cloud
supabase db push

# Or generate migrations from local changes
supabase db diff -f migration_name
supabase db push
```

## Project Configuration

The Supabase configuration is defined in `/supabase/config.toml`:

### Key Configuration Settings

- **API Port**: 54321
- **Database Port**: 54322
- **Studio Port**: 54323
- **Database Version**: PostgreSQL 17
- **Schemas**: `public`, `graphql_public`

### Directory Structure

```
/supabase
├── config.toml          # Supabase configuration
├── .gitignore           # Git ignore rules for Supabase
├── migrations/          # Database migrations
├── functions/           # Edge Functions
└── .temp/               # Temporary files (git-ignored)
```

## Environment Variables Reference

### Local Development

```bash
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

### Cloud/Production

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

## Troubleshooting

### Docker Not Running

If you see "Cannot connect to Docker daemon":

```bash
# Start Docker Desktop manually or:
open -a Docker

# Wait for Docker to start, then:
supabase start
```

### Port Conflicts

If ports 54321-54324 are already in use:

1. Stop conflicting services
2. Or modify ports in `supabase/config.toml`
3. Run `supabase stop` and `supabase start`

### Reset Local Database

To completely reset your local database:

```bash
supabase db reset
```

**Warning**: This will delete all local data!

## Best Practices

### Development Workflow

1. **Local First**: Develop and test locally using `supabase start`
2. **Create Migrations**: Use `supabase db diff` to generate migrations
3. **Test Migrations**: Test migrations locally before pushing
4. **Push to Cloud**: Use `supabase db push` to deploy to production

### Security

- **Never commit** `.env` file (already in `.gitignore`)
- **Keep service role keys secret** - only use on backend/server
- **Use anon keys** for client-side applications
- **Enable RLS (Row Level Security)** on all tables in production

### Multi-Environment Strategy

For production applications, consider:

- **Local**: Development and testing
- **Staging**: Pre-production cloud project
- **Production**: Live cloud project

Manage credentials separately for each environment.

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase CLI Reference](https://supabase.com/docs/guides/cli)
- [Local Development Guide](https://supabase.com/docs/guides/local-development)
- [Database Migrations](https://supabase.com/docs/guides/database/migrations)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## Next Steps

1. Explore Supabase Studio at http://127.0.0.1:54323
2. Create your first database tables
3. Set up Row Level Security (RLS) policies
4. Create Edge Functions for serverless logic
5. Configure authentication providers
6. Set up storage buckets

## Support

For issues or questions:

- Check [Supabase Discussions](https://github.com/supabase/supabase/discussions)
- Join [Supabase Discord](https://discord.supabase.com)
- Review [Troubleshooting Guide](https://supabase.com/docs/guides/platform/troubleshooting)
