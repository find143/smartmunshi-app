# SmartMunshi App

SmartMunshi is a construction management and labor attendance application built with Next.js, Prisma, and Tailwind CSS.

## Vercel Deployment & PostgreSQL Setup

This application uses **Prisma** configured with **PostgreSQL** for cloud production compatibility (Neon, Supabase, Vercel Postgres, etc.).

### Environment Variables

Configure the following environment variables in your Vercel Project Settings (**Settings > Environment Variables**):

| Variable Name | Description | Example |
| ------------- | ----------- | ------- |
| `DATABASE_URL` | Transaction pooled connection string | `postgresql://user:pass@ep-xyz.neon.tech/neondb?sslmode=require` |
| `DIRECT_URL` | Direct session connection string (for migrations) | `postgresql://user:pass@ep-xyz.neon.tech/neondb?sslmode=require` |

### Database Initialization & Migration

Before or after deploying on Vercel, push your schema to the cloud PostgreSQL database:

```bash
# Push schema to PostgreSQL database
npx prisma db push

# Seed initial default data (optional)
npm run prisma:seed
```
