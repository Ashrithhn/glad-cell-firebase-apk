
# GLAD CELL Project Documentation

## 1. Introduction

This document provides a comprehensive overview of the GLAD CELL application, an initiative by the Department of Computer Science and Engineering at GEC Mosalehosahalli. The platform is designed to foster innovation, facilitate event participation, and build a collaborative community for students and faculty.

### 1.1. Purpose

*   To provide a platform for students to submit, showcase, and refine innovative ideas.
*   To manage college events and programs, including registration and payments.
*   To enable team formation for collaborative projects and competitions.
*   To serve as a central hub for communication and information related to innovation at the college.
*   To provide administrative tools for managing users, content, and platform activity.

### 1.2. Technology Stack

*   **Framework:** Next.js (with App Router)
*   **Language:** TypeScript
*   **UI:** React, ShadCN UI Components, Tailwind CSS
*   **Backend & Database:** Supabase (Authentication, PostgreSQL Database, Storage)
*   **Generative AI:** Google Genkit
*   **Payments:** Cashfree Payment Gateway

---

## 2. Architecture Overview

The application follows a modern, server-centric architecture leveraging the capabilities of Next.js and Supabase.

### 2.1. Frontend

*   **Next.js App Router:** The file-based routing system in `src/app` defines all public and protected routes. Server Components are used by default to improve performance by rendering on the server.
*   **React & TypeScript:** Functional components and hooks are used for building the UI, with TypeScript providing type safety.
*   **UI Components (`src/components`):** Reusable components are built using ShadCN UI. This includes both atomic components (`/ui`) and feature-specific components (`/features`).
*   **Client-Side State:** React's `useState` and `useEffect` are used for local component state. Global authentication state is managed via a custom `useAuth` hook and React Context (`src/hooks/use-auth.tsx`).

### 2.2. Backend (Server Actions)

*   **Server Actions (`src/services`):** Instead of traditional API endpoints, the application uses Next.js Server Actions for all backend logic. These are server-side functions that can be called directly from client components. This simplifies the architecture significantly.
*   **Services Layer:** All interactions with the Supabase database and external services (like Cashfree) are encapsulated within functions in the `src/services` directory. This keeps business logic separate from the UI.
*   **Supabase Admin Client (`src/lib/supabaseAdminClient.ts`):** For actions requiring elevated privileges (like creating users or bypassing RLS), a special admin client is used on the server. This client is initialized with the secret `SUPABASE_SERVICE_ROLE_KEY`.

### 2.3. Database (Supabase PostgreSQL)

*   Supabase provides the PostgreSQL database. The schema is defined in the `README.md` and this document.
*   **Row Level Security (RLS):** While disabled for initial development, RLS is the intended mechanism for securing data access in production. Policies would ensure that users can only access and modify their own data.

### 2.4. Generative AI (Genkit)

*   **Genkit Flows (`src/ai/flows`):** All AI-powered features are implemented as Genkit flows. These are server-side functions that interact with Google's Generative AI models (e.g., Gemini).
*   **AI Tutor:** The `educational-chatbot-flow.ts` defines the logic for the "Gladly" AI tutor, including its personality and conversational scope.
*   **Idea Refinement:** The `refine-idea-flow.ts` defines the AI agent that analyzes a user's idea and provides structured feedback.

---

## 3. Core Workflows & Features

### 3.1. User Authentication & Roles

*   **Registration (`/register`):** A multi-step form collects user details. The `registerUser` server action in `src/services/auth.ts` uses the **Supabase Admin Client** to create the user in `auth.users` and insert their profile into the `public.users` table.
*   **Login (`/login`, `/admin/login`):** Users authenticate with email and password. The `loginUser` action validates credentials against Supabase Auth.
*   **Roles:**
    *   **Participant:** The default role for all new users.
    *   **Admin:** Can manage events, ideas, and users for their specific college.
    *   **Super Admin:** Has full control over the platform, including site-wide settings and promoting other users to Admin roles.
*   **Authorization:** The `useAuth` hook provides the user's role. This is used in components to conditionally render UI elements (e.g., admin dashboards) and on pages to enforce access control.

### 3.2. Idea Submission & Management

1.  **Submission:** A logged-in user clicks "Submit Your Idea" on the `/ideas` page, opening a modal (`IdeaSubmissionModal`).
2.  **(Optional) AI Refinement:** The user can click "Analyze with AI." This calls the `refineIdea` Genkit flow (`refine-idea-flow.ts`), which sends the title and description to the AI model. The AI returns a refined description, suggested tags, and potential challenges.
3.  **Database Insert:** Upon final submission, the `submitIdea` server action (`src/services/ideas.ts`) inserts the idea into the `ideas` table with a `Pending` status.
4.  **Admin Review:** An admin navigates to the "Manage Ideas" dashboard (`/admin/ideas`). They can view all submitted ideas.
5.  **Status Update:** The admin can change the status of an idea to "Approved," "Rejected," etc. This triggers the `updateIdeaStatus` action.
6.  **Notification:** When an idea's status is updated, a notification is created for the submitting user via the `createNotification` service.
7.  **Public Display:** Only ideas with an "Approved" status are displayed on the public `/ideas` page.

### 3.3. Event & Team Registration

1.  **Event Creation:** An admin creates an event via the `/admin/events/new` page, specifying details like name, description, fee, and whether it's an individual or group event.
2.  **Public View:** All created events are visible on the `/programs` page.
3.  **Individual Registration (Free):**
    *   A logged-in user clicks "Register for Free."
    *   The `processFreeRegistration` action is called, creating a record in the `participations` table and generating a QR code ticket.
4.  **Individual Registration (Paid):**
    *   The user clicks "Participate Now," opening a modal (`ParticipationModal`) to confirm their details.
    *   On submission, the `createCashfreeOrderAction` is called to generate a payment link.
    *   The user is redirected to Cashfree to complete the payment.
    *   After payment, Cashfree redirects back to `/payment/status`. The `processSuccessfulCashfreePayment` action verifies the payment, creates the `participations` record, and generates the QR code ticket.
5.  **Team Formation (Group Event):**
    *   A user clicks "Create Team," enters a name, and the `createTeam` service creates records in the `teams` and `team_members` tables, generating a unique `join_code`.
    *   The team leader shares this code. Other users click "Join Team" and enter the code. The `joinTeam` service adds them to the team, respecting the `max_team_size`.
6.  **Team Registration:**
    *   Once the team meets the `min_team_size`, the team leader can click "Register Team" from the "View Team" modal.
    *   The `processFreeTeamRegistration` action (paid team registration is a future feature) iterates through all team members, creating a `participations` record and a unique QR ticket for each one.
    *   The team is then marked as `is_locked` to prevent further changes.

### 3.4. Attendance Tracking

1.  **QR Code:** Each participation record contains a `qr_code_data_uri` which holds a JSON payload including `orderId`, `eventId`, and `userId`.
2.  **Admin Scanner:** An admin navigates to `/admin/attendance` and starts the camera scanner.
3.  **Verification:** The `html5-qrcode` library scans the QR code. The extracted JSON payload is sent to the `markAttendance` server action.
4.  **Database Update:** The action verifies the data and updates the `attended_at` timestamp in the corresponding `participations` record. It prevents duplicate scans.

---

## 4. Database Schema

Below is the SQL schema for the core tables used in the application.

```sql
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Generic trigger for updated_at timestamps
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Users Table (public.users)
-- Stores user profile information, linked to Supabase Auth.
CREATE TABLE IF NOT EXISTS public.users (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text UNIQUE,
    name text,
    phone text,
    branch text,
    semester integer,
    registration_number text UNIQUE,
    college_name text,
    college_id UUID,
    city text,
    photo_url text,
    role TEXT NOT NULL DEFAULT 'Participant', -- Super Admin, Admin, Participant
    auth_provider text,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);
-- Trigger for users updated_at
CREATE TRIGGER set_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Events Table (public.events)
-- Stores all program and event details.
CREATE TABLE IF NOT EXISTS public.events (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    description text NOT NULL,
    venue text NOT NULL,
    rules text,
    rules_pdf_url text,
    rules_pdf_storage_path text,
    start_date timestamptz NOT NULL,
    end_date timestamptz NOT NULL,
    registration_deadline timestamptz,
    event_type text CHECK (event_type IN ('individual', 'group')) NOT NULL,
    min_team_size integer,
    max_team_size integer,
    fee integer DEFAULT 0 NOT NULL, -- Fee in Paisa (100 Paisa = 1 INR)
    image_url text,
    image_storage_path text,
    college_id UUID,
    college_name TEXT,
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Archived', 'Cancelled')),
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Participations Table (public.participations)
-- Junction table linking users and events, acts as a "ticket".
CREATE TABLE IF NOT EXISTS public.participations (
    id uuid PRIMARY KEY, -- Provided by the app (Cashfree order_id or generated UUID)
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    event_name text NOT NULL,
    user_name text NOT NULL,
    user_email text NOT NULL,
    user_phone text NOT NULL,
    user_branch text NOT NULL,
    user_semester integer NOT NULL,
    user_registration_number text NOT NULL,
    payment_details jsonb,
    qr_code_data_uri text,
    participated_at timestamptz DEFAULT now() NOT NULL,
    attended_at timestamptz, -- Timestamp for actual attendance
    CONSTRAINT unique_user_event_participation UNIQUE (user_id, event_id)
);

-- Teams Table (public.teams)
-- Stores team information for group events.
CREATE TABLE IF NOT EXISTS public.teams (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    created_by uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    join_code text NOT NULL UNIQUE,
    college_id UUID,
    is_locked boolean DEFAULT false NOT NULL, -- True after team is registered for an event
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Team Members Table (public.team_members)
-- Junction table linking users and teams.
CREATE TABLE IF NOT EXISTS public.team_members (
    team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    joined_at timestamptz DEFAULT now() NOT NULL,
    PRIMARY KEY (team_id, user_id)
);

-- Team Join Requests Table (public.team_join_requests)
-- Stores requests from users who want to join a team.
CREATE TABLE IF NOT EXISTS public.team_join_requests (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT unique_user_team_request UNIQUE (user_id, team_id) -- A user can only have one request per team
);

-- Ideas Table (public.ideas)
-- Stores all student-submitted ideas.
CREATE TABLE IF NOT EXISTS public.ideas (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    title text NOT NULL,
    description text NOT NULL,
    submitter_name text,
    submitter_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
    department text,
    college_id UUID,
    tags text[],
    status text CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Implemented')) NOT NULL DEFAULT 'Pending',
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);
-- Trigger for ideas updated_at
CREATE TRIGGER set_ideas_updated_at
BEFORE UPDATE ON public.ideas
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Site Content Table (public.site_content)
-- A key-value store for editable site content (e.g., About page text).
CREATE TABLE IF NOT EXISTS public.site_content (
    id text PRIMARY KEY, -- e.g., 'about', 'contact', 'links'
    content_data jsonb NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- Notifications Table (public.notifications)
-- Stores in-app notifications for users.
CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title text NOT NULL,
    message text NOT NULL,
    link text,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Homepage Images Table (public.homepage_images)
-- Manages dynamic images for the homepage.
CREATE TABLE IF NOT EXISTS public.homepage_images (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    image_url text NOT NULL,
    alt_text text NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    storage_path text NOT NULL,
    section text CHECK (section IN ('carousel', 'exploreIdeas', 'latestEventPromo')), 
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Site Configuration Table (public.site_configuration)
CREATE TABLE IF NOT EXISTS public.site_configuration (
    id text PRIMARY KEY, -- e.g., 'mainSettings'
    settings_data jsonb NOT NULL,
    last_updated_at timestamptz DEFAULT now() NOT NULL
);

-- Promotions Table (public.promotions)
-- For creating dynamic promotional pop-ups on the homepage.
CREATE TABLE IF NOT EXISTS public.promotions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    title text NOT NULL,
    description text NOT NULL,
    image_url text,
    image_storage_path text,
    cta_link text,
    cta_text text,
    is_active boolean DEFAULT true NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    college_id UUID, -- To scope promotions to a specific college for Admins
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);
-- Trigger for promotions updated_at
CREATE TRIGGER set_promotions_updated_at
BEFORE UPDATE ON public.promotions
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Feedback Table (public.feedback)
-- Stores user-submitted feedback and testimonials.
CREATE TABLE IF NOT EXISTS public.feedback (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
    author_name text,
    message text NOT NULL,
    is_approved boolean DEFAULT false NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL
);

```

---

## 5. Security Considerations

*   **Environment Variables:** All sensitive keys (`SUPABASE_SERVICE_ROLE_KEY`, `CASHFREE_SECRET_KEY`, etc.) are stored in a `.env.local` file, which is gitignored and should never be committed to source control.
*   **Client vs. Server Keys:** `NEXT_PUBLIC_` prefixed variables are exposed to the browser. All other keys are server-side only.
*   **Admin Client Usage:** The `supabaseAdmin` client is used exclusively in server-side `services/*.ts` files to perform privileged operations. It is never exposed to the client.
*   **Row Level Security (RLS):** For a production environment, RLS policies must be enabled on all tables to ensure data is properly segregated and users can only access data they are authorized to see.

---

## 6. Future Enhancements

This section outlines potential features that could be added to the platform.

*   **Gamification System:** Award points for submitting ideas, participating in events, and other positive actions. Display a leaderboard to increase user engagement.
*   **Lecturer/Mentor Role:** A dedicated role for faculty to mentor students, provide private feedback on ideas, and coordinate events.
*   **Advanced Analytics:** More detailed dashboards for admins and lecturers to track engagement, idea trends, and event success metrics by department.
*   **Direct Messaging:** A simple messaging system to allow team members to communicate or for students to ask questions about specific ideas.

    
