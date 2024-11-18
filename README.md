# Status Page Application

A modern status page application built with Next.js and Supabase, allowing organizations to manage their services, track incidents, and communicate status updates to their users.

**Important Note About Admin Roles:**
Administrators (IT admins) are not included as team members in this system. This architectural decision was made because:

Admin roles are specifically designed for IT administrators who manage organizational setup and member access
Team member management is typically a low-frequency activity
Admins don't need real-time notifications about service incidents as they're not part of the operational teams
This separation maintains a clear distinction between system administration and operational responsibilities

## Features

- 🏢 **Organization Management**: Create and manage multiple organizations
- 👥 **Team Management**: Organize teams within organizations
- 🚦 **Service Status**: Track and display service health status
- 🚨 **Incident Management**: Create and manage service incidents
- 📊 **Real-time Updates**: Instant status updates using Supabase real-time
- 👤 **Team Members**: Manage team access and permissions

## Tech Stack

- **Frontend**: Next.js 14
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Real-time
- **Styling**: Tailwind CSS

## Prerequisites

- Node.js 18.x or later
- npm or yarn
- Git
- Supabase account

## Setup Instructions

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up Supabase**

   - Create a new project in Supabase
   - Navigate to Project Settings > API
   - Copy the `anon public` key and project URL

4. **Configure environment variables**

   - Create a `.env.local` file in the project root

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

5. **Set up the database**

   - Navigate to the SQL editor in your Supabase dashboard
   - Execute the following SQL commands to create the necessary tables:

   ```sql
   -- Organizations
   create table organizations (
       id uuid primary key default uuid_generate_v4(),
       name text not null,
       slug text unique not null,
       created_at timestamp with time zone default timezone('utc'::text, now()) not null
   );

   -- Teams
   create table teams (
       id uuid primary key default uuid_generate_v4(),
       organization_id uuid references organizations(id) on delete cascade not null,
       name text not null,
       created_at timestamp with time zone default timezone('utc'::text, now()) not null
   );

   -- Team Members
   create table team_members (
       id uuid primary key default uuid_generate_v4(),
       team_id uuid references teams(id) on delete cascade not null,
       user_email text,
       role text not null check (role in ('admin', 'member', 'viewer')),
       created_at timestamp with time zone default timezone('utc'::text, now()) not null
   );

   -- Services
   create table services (
       id uuid primary key default uuid_generate_v4(),
       organization_id uuid references organizations(id) on delete cascade not null,
       team_id uuid references teams(id) on delete cascade not null,
       name text not null,
       description text,
       current_status text not null check (current_status in ('operational', 'degraded', 'partial_outage', 'major_outage')),
       display_order integer not null default 0,
       created_at timestamp with time zone default timezone('utc'::text, now()) not null,
       updated_at timestamp with time zone default timezone('utc'::text, now()) not null
   );

   -- Incidents
   create table incidents (
       id uuid primary key default uuid_generate_v4(),
       organization_id uuid references organizations(id) on delete cascade not null,
       team_id uuid references teams(id) on delete cascade not null,
       title text not null,
       description text,
       status text not null check (status in ('investigating', 'identified', 'monitoring', 'resolved')),
       impact text not null check (impact in ('none', 'minor', 'major', 'critical')),
       created_at timestamp with time zone default timezone('utc'::text, now()) not null,
       updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
       resolved_at timestamp with time zone
   );

   -- Incident Updates
   create table incident_updates (
       id uuid primary key default uuid_generate_v4(),
       incident_id uuid references incidents(id) on delete cascade not null,
       message text not null,
       status text not null check (status in ('investigating', 'identified', 'monitoring', 'resolved')),
       created_at timestamp with time zone default timezone('utc'::text, now()) not null
   );

   -- Incident Services (many-to-many relationship)
   create table incident_services (
       incident_id uuid references incidents(id) on delete cascade not null,
       service_id uuid references services(id) on delete cascade not null,
       primary key (incident_id, service_id)
   );

   -- Maintenance Windows
   create table maintenance (
       id uuid primary key default uuid_generate_v4(),
       organization_id uuid references organizations(id) on delete cascade not null,
       team_id uuid references teams(id) on delete cascade not null,
       title text not null,
       description text,
       status text not null check (status in ('scheduled', 'in_progress', 'completed')),
       scheduled_start timestamp with time zone not null,
       scheduled_end timestamp with time zone not null,
       created_at timestamp with time zone default timezone('utc'::text, now()) not null,
       updated_at timestamp with time zone default timezone('utc'::text, now()) not null
   );

   -- Maintenance Services (many-to-many relationship)
   create table maintenance_services (
       maintenance_id uuid references maintenance(id) on delete cascade not null,
       service_id uuid references services(id) on delete cascade not null,
       primary key (maintenance_id, service_id)
   );
   ```

6. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

7. **Access the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Schema

### Tables Overview

- **organizations**: Core organization information
- **teams**: Teams within organizations
- **team_members**: User memberships in teams
- **services**: Services managed by teams
- **incidents**: Service incidents and outages
- **incident_updates**: Updates to incident status
- **incident_services**: Links incidents to affected services

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
