
# GLAD CELL - GEC Mosalehosahalli CSE Dept.

This is a Next.js application for the GLAD CELL initiative by the Department of Computer Science and Engineering, Government Engineering College Mosalehosahalli.

## Getting Started

1.  **Install Dependencies:**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```
    **Note:** If you encounter "Module not found" errors (e.g., for `framer-motion`, `firebase`, `supabase`, etc.) after pulling changes or cloning, try running `npm install` again to ensure all dependencies are correctly installed in your `node_modules` directory.

2.  **Set Up Environment Variables:**

    This project uses Supabase for authentication and database services, and Cashfree for payments. You need to configure environment variables for these services.

    *   Create a file named `.env.local` in the **root directory** of the project (the same level as `package.json`).
    *   Add the following variables to the `.env.local` file, replacing the placeholder values with your actual keys:

        ```dotenv
        # Supabase Configuration (Get these from your Supabase project settings)
        # ⚠️ IMPORTANT: These variables MUST start with NEXT_PUBLIC_ to be accessible in the browser!
        NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
        NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

        # Firebase Configuration (DEPRECATED - Kept for reference if any part still uses it)
        # ⚠️ IMPORTANT: These variables MUST start with NEXT_PUBLIC_ to be accessible in the browser!
        NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY_IF_STILL_USED
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_FIREBASE_AUTH_DOMAIN_IF_STILL_USED
        NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID_IF_STILL_USED
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_FIREBASE_STORAGE_BUCKET_IF_STILL_USED
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_FIREBASE_MESSAGING_SENDER_ID_IF_STILL_USED
        NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID_IF_STILL_USED
        NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=YOUR_FIREBASE_MEASUREMENT_ID_IF_STILL_USED # Optional

        # Firebase Realtime Database URL (DEPRECATED - ONLY for Server-Side use if you intend to use Realtime Database)
        # Get this from Firebase Console > Realtime Database > Data tab
        # DO NOT prefix with NEXT_PUBLIC_ if only used server-side.
        # This project primarily uses Firestore, so this might not be strictly needed.
        FIREBASE_REALTIME_DB_URL=YOUR_FIREBASE_REALTIME_DATABASE_URL_IF_STILL_USED

        # Cashfree Configuration (Get these from your Cashfree dashboard)
        # These are used server-side, no NEXT_PUBLIC_ prefix needed.
        CASHFREE_APP_ID=YOUR_CASHFREE_APP_ID
        CASHFREE_SECRET_KEY=YOUR_CASHFREE_SECRET_KEY
        CASHFREE_ENV=TEST # or PROD
        NEXT_PUBLIC_APP_BASE_URL=http://localhost:9002 # Your app's base URL

        # Google Generative AI (Optional - If using Genkit features)
        # GOOGLE_GENAI_API_KEY=YOUR_GOOGLE_AI_API_KEY
        ```

    **🔴 CRITICAL: Supabase `AuthApiError` or Missing Key Errors 🔴**

    If you encounter errors related to Supabase (e.g., "AuthApiError: invalid JWT", "Failed to fetch"), it almost always means your Supabase environment variables are not correctly set up or accessed.

    **Troubleshooting Steps:**
    *   **Verify `.env.local`:** Ensure the `.env.local` file exists in the project's **root directory**.
    *   **Check Variable Names:** Confirm the Supabase variable names are **exactly** `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
    *   **Check Key Values:** Double-check that the URL and Anon Key copied from your Supabase project settings are correct.
    *   **⭐️ RESTART THE SERVER ⭐️:** **YOU ABSOLUTELY MUST RESTART** your Next.js development server (`npm run dev`) after creating or modifying the `.env.local` file. Next.js only loads environment variables at build/startup time.

3.  **Set Up Supabase Database Schema:**

    The application requires several tables in your Supabase database. Go to your Supabase project dashboard, navigate to the **SQL Editor**, and run the following SQL commands one by one or as a batch.

    **Important:**
    *   Make sure the `uuid-ossp` extension is enabled. You can enable it by running `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";` in the SQL Editor.
    *   By default, new tables in Supabase have Row Level Security (RLS) **disabled**. For initial development, this is often fine. However, **before going to production, you MUST enable RLS and define appropriate policies** for each table to secure your data.

    ```sql
    -- Enable UUID generation if not already enabled
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    -- Users Table (public.users)
    -- Stores additional profile information, linked to auth.users
    CREATE TABLE IF NOT EXISTS public.users (
        id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        email text UNIQUE,
        name text,
        branch text,
        semester integer,
        registration_number text UNIQUE,
        college_name text,
        city text,
        pincode text,
        photo_url text,
        auth_provider text,
        created_at timestamptz DEFAULT now() NOT NULL,
        updated_at timestamptz DEFAULT now() NOT NULL
    );
    -- Optional: Trigger to update 'updated_at' timestamp
    CREATE OR REPLACE FUNCTION trigger_set_timestamp()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER set_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

    -- Events Table (public.events)
    CREATE TABLE IF NOT EXISTS public.events (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        name text NOT NULL,
        description text NOT NULL,
        venue text NOT NULL,
        rules text,
        start_date timestamptz NOT NULL,
        end_date timestamptz NOT NULL,
        registration_deadline timestamptz,
        event_type text CHECK (event_type IN ('individual', 'group')) NOT NULL,
        min_team_size integer,
        max_team_size integer,
        fee integer DEFAULT 0 NOT NULL, -- Fee in Paisa
        image_url text,
        image_storage_path text, -- To store the path in Supabase Storage
        created_at timestamptz DEFAULT now() NOT NULL
    );

    -- Participations Table (public.participations)
    -- Tracks user participation in events
    CREATE TABLE IF NOT EXISTS public.participations (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
        event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
        event_name text NOT NULL,
        user_name text NOT NULL,
        user_email text NOT NULL,
        user_phone text NOT NULL,
        user_branch text NOT NULL,
        user_semester integer NOT NULL,
        user_registration_number text NOT NULL,
        payment_details jsonb, -- Store payment gateway response (order_id, payment_id, etc.)
        qr_code_data_uri text, -- Store the base64 QR code image
        participated_at timestamptz DEFAULT now() NOT NULL,
        attended_at timestamptz, -- Timestamp for actual attendance
        CONSTRAINT unique_user_event_participation UNIQUE (user_id, event_id)
    );

    -- Ideas Table (public.ideas)
    CREATE TABLE IF NOT EXISTS public.ideas (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        title text NOT NULL,
        description text NOT NULL,
        submitter_name text,
        submitter_id uuid REFERENCES public.users(id) ON DELETE SET NULL, -- Optional link to user
        department text,
        tags text[], -- Array of tags
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
    -- For editable content like About Us, Contact Info, Links
    CREATE TABLE IF NOT EXISTS public.site_content (
        id text PRIMARY KEY, -- e.g., 'about', 'contact', 'links', 'privacy-policy', 'terms-and-conditions'
        content_data jsonb NOT NULL,
        updated_at timestamptz DEFAULT now() NOT NULL
    );
    -- Trigger for site_content updated_at
    CREATE TRIGGER set_site_content_updated_at
    BEFORE UPDATE ON public.site_content
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

    -- Homepage Images Table (public.homepage_images)
    -- For managing images on the homepage carousel or sections
    CREATE TABLE IF NOT EXISTS public.homepage_images (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        image_url text NOT NULL,
        alt_text text NOT NULL,
        display_order integer DEFAULT 0 NOT NULL,
        is_active boolean DEFAULT true NOT NULL,
        storage_path text NOT NULL, -- Path in Supabase Storage
        created_at timestamptz DEFAULT now() NOT NULL
    );

    -- Site Configuration Table (public.site_configuration)
    -- For global site settings like maintenance mode
    CREATE TABLE IF NOT EXISTS public.site_configuration (
        id text PRIMARY KEY, -- e.g., 'mainSettings'
        settings_data jsonb NOT NULL,
        last_updated_at timestamptz DEFAULT now() NOT NULL
    );
    -- Trigger for site_configuration last_updated_at
    CREATE TRIGGER set_site_configuration_updated_at
    BEFORE UPDATE ON public.site_configuration
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp(); -- Reusing the same trigger function

    -- Note: After creating tables, you might need to set up Supabase Storage buckets:
    -- 'event-images' (for event posters)
    -- 'profile-pictures' (for user avatars)
    -- 'homepage-images' (for homepage slider/section images)
    -- Ensure appropriate RLS policies and public access settings for these buckets.
    -- For example, 'profile-pictures' might need to be public for avatars to display easily.
    ```

4.  **Set Up Supabase Storage Buckets:**

    The application uses Supabase Storage for images. You need to create the following buckets in your Supabase project dashboard (Storage > Buckets):
    *   `event-images`: For event poster images.
    *   `profile-pictures`: For user profile avatars.
    *   `homepage-images`: For images used on the homepage (e.g., carousel).

    **Important:** For each bucket, configure its access policies. For example, `profile-pictures` and `homepage-images` likely need to be **public** for images to be displayed on the website. `event-images` might also need to be public. Review Supabase documentation on Storage and RLS for buckets.

5.  **Run the Development Server:**
    ```bash
    npm run dev
    ```
    Check the terminal output carefully for any Supabase or Firebase configuration errors logged during startup.

6.  Open [http://localhost:9002](http://localhost:9002) (or the specified port) with your browser to see the result. Check the browser's developer console (F12) and the terminal where you ran `npm run dev` for any error messages, especially Supabase configuration errors or database connection issues.

## Project Structure

*   `src/app/`: Contains the application pages using the Next.js App Router.
*   `src/components/`: Shared UI components ( Shadcn UI, layout, features).
*   `src/lib/`: Utility functions and Supabase/Firebase configuration.
*   `src/hooks/`: Custom React hooks (e.g., `useAuth`, `useToast`).
*   `src/services/`: Server Actions for backend logic (authentication, payments, database interactions).
*   `src/ai/`: (Optional) Genkit configuration and flows for AI features.

## Key Features Implemented

*   Student Registration & Login (Supabase Auth & Database)
    *   Email/Password
*   Admin Login (Placeholder - Implement proper role-based access for Supabase)
*   Event Participation with Cashfree Payment Gateway
*   Profile Page with Profile Picture Upload (Supabase Storage)
*   Idea Showcase (User-submitted and Admin-added)
*   About & Contact Pages (Admin-editable)
*   Dark/Light Theme Toggle
*   Welcome Carousel (Initial visit only)
*   Admin Dashboard for:
    *   Managing Programs/Events (Add, View, Delete)
    *   Managing Users (View list - more actions planned)
    *   Managing Ideas (Add, Edit, View, Delete, Change Status)
    *   Managing Site Content (About, Contact, Privacy, Terms, Links, Homepage Images)
    *   Attendance Scanner (QR Code based)
    *   Site Settings (Basic placeholders, some functional like registration toggle)

## Admin Credentials (Development Only)

*   **Username:** `admin`
*   **Password:** `adminpass`

**Warning:** These credentials are for development testing only. Implement proper role-based access control using Supabase RLS policies and potentially custom roles before deploying to production.

## Troubleshooting

### Supabase: "relation public.X does not exist"

If you see an error like `relation "public.your_table_name" does not exist`, it means the required table (`your_table_name`) has not been created in your Supabase database. This is a common issue if you haven't run the SQL schema commands.

**Especially for user registration issues, if you see `relation "public.users" does not exist`, you MUST run the `CREATE TABLE IF NOT EXISTS public.users (...)` command provided in the "Set Up Supabase Database Schema" section above.**

**Solution:**
1.  Go to your Supabase project dashboard.
2.  Navigate to the **SQL Editor**.
3.  Copy the SQL commands from the "Set Up Supabase Database Schema" section above for the missing table (e.g., `public.users`, `public.events`, etc.) and any other tables you haven't created, and run them.
4.  Ensure the `uuid-ossp` extension is enabled by running `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";` if you haven't already.

### Supabase: RLS (Row Level Security) Issues

If you can't insert or select data even if the table exists, RLS might be enabled without proper policies.
**Solution:**
1.  Go to Supabase Dashboard > Authentication > Policies.
2.  For each table, either:
    *   **Disable RLS** (for development only, NOT recommended for production).
    *   **Create policies** that allow the necessary operations (SELECT, INSERT, UPDATE, DELETE) for the appropriate users/roles (e.g., `authenticated` users can insert into `participations`, `anon` users can select from `events`). Example for allowing all authenticated users to read events:
        ```sql
        CREATE POLICY "Allow authenticated read access to events"
        ON public.events
        FOR SELECT
        TO authenticated
        USING (true);
        ```
        Consult Supabase RLS documentation for detailed policy creation.

### Firebase (DEPRECATED) Errors

This project has primarily migrated to Supabase. If you encounter Firebase errors:
*   `FirebaseError: Firebase: Error (auth/invalid-api-key)` or missing config errors: This usually means your `.env.local` file is missing Firebase variables or they are incorrect. **Firebase is deprecated for this project; focus on Supabase setup.**
*   `FirebaseError: Firebase: Error (auth/configuration-not-found)` (Email/Password sign-in): Firebase Email/Password provider not enabled.
*   `FirebaseError: Firebase: Error (auth/unauthorized-domain)` (Google Sign-In): `localhost` or your deployed domain not in Firebase authorized domains.

**For all `.env.local` changes, remember to restart your Next.js development server (`npm run dev`).**

