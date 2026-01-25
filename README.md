# Event Management System

A mobile-first internal event management web application built for small teams to manage event bookings, customers, schedules, and payment status.

## Tech Stack

- **Frontend**: Next.js 16 (App Router)
- **Backend/Database/Auth**: Supabase
- **Styling**: Tailwind CSS (Mobile-first)
- **Deployment**: Vercel

## Features

- ✅ Authentication with Supabase Auth
- ✅ Dashboard with today's events, upcoming events, and pending payments
- ✅ Event management with conflict detection
- ✅ Customer master management
- ✅ Event type master management
- ✅ Payment tracking
- ✅ Mobile-first responsive design
- ✅ Bottom navigation bar

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the SQL script from `database-schema.sql`
3. Go to Settings > API and copy your project URL and anon key

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Create Users

1. Go to Supabase Dashboard > Authentication > Users
2. Manually create 2-3 internal users with email and password
3. These users will be able to log in to the application

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses three main tables:

1. **customers** - Stores customer information
2. **event_types** - Defines types of events (Marriage, Birthday, etc.)
3. **event_bookings** - Stores event bookings with dates, times, prices, and payment status

See `database-schema.sql` for the complete schema with indexes and Row Level Security policies.

## Key Features

### Event Conflict Detection

The system automatically detects scheduling conflicts:
- Events cannot overlap in time on the same date
- Real-time validation when creating/editing events
- Clear error messages when conflicts are detected

### Payment Tracking

- Simple boolean payment status (Paid/Pending)
- Quick access to all pending payments
- One-click payment status update

### Mobile-First Design

- Optimized for mobile devices
- Touch-friendly interface
- Bottom navigation bar
- Responsive layout for tablets and desktops

## Project Structure

```
app/
  ├── auth/login/          # Login page
  ├── dashboard/            # Dashboard with overview
  ├── events/              # Events list, details, add/edit
  ├── payments/            # Pending payments page
  └── settings/            # Settings and master data management
components/                 # Reusable components
lib/                       # Utilities and Supabase clients
```

## Deployment

The application is ready to deploy on Vercel:

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## Notes

- This is an internal tool, not customer-facing
- All users have the same permissions
- No public signup - users must be created manually in Supabase
- Image upload functionality is prepared but not fully implemented (images field exists in schema)
