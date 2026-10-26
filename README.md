# Tronx — Real Estate (Tronx)

Premium plot & venture platform with interactive layouts, enquiries, and an admin portal.

## Quick start

```bash
cp .env.example .env.local
# Ensure MongoDB is running locally, then:
npm install
npm run seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Admin (demo mode)

Without Clerk keys, sign in at [/sign-in](http://localhost:3000/sign-in) using `ADMIN_PASSWORD` from `.env.local` (default: `tronx-admin-2026`).

### Production auth (Clerk)

1. Create an app at [dashboard.clerk.com](https://dashboard.clerk.com)
2. Add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`
3. Set a user’s `publicMetadata.role` to `"admin"`

### Environment

| Variable | Required | Purpose |
|---|---|---|
| `MONGO_URI` | Yes | MongoDB connection string |
| `NEXT_PUBLIC_SITE_URL` | Yes | Canonical site URL |
| `ADMIN_PASSWORD` | Demo | Admin password when Clerk is off |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Prod | Clerk publishable key |
| `CLERK_SECRET_KEY` | Prod | Clerk secret key |

## Stack

Next.js 15 · React 19 · MongoDB/Mongoose · Clerk · Tailwind CSS 4 · Framer Motion · Leaflet
