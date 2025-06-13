
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

        # Supabase Service Role Key (For Admin actions - keep this secret!)
        # Get this from Supabase Project Settings > API > Project API Keys > service_role
        # DO NOT prefix with NEXT_PUBLIC_
        SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_HERE

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
    *   **Check Variable Names:** Confirm the Supabase variable names are **exactly** `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Also, ensure `SUPABASE_SERVICE_ROLE_KEY` is set for admin functions.
    *   **Check Key Values:** Double-check that the URL and Anon Key copied from your Supabase project settings are correct. Verify the Service Role Key.
    *   **⭐️ RESTART THE SERVER ⭐️:** **YOU ABSOLUTELY MUST RESTART** your Next.js development server (`npm run dev`) after creating or modifying the `.env.local` file. Next.js only loads environment variables at build/startup time.

3.  **Set Up Supabase Database Schema:**

    The application requires several tables in your Supabase database. Go to your Supabase project dashboard, navigate to the **SQL Editor**, and run the following SQL commands one by one or as a batch.

    **Important First Step (if you haven't done it already):**
    Run this in the SQL Editor first:
    ```sql
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    ```

    **Then, run all of the following in the SQL Editor:**
    ```sql
    -- Generic trigger function for updated_at timestamp
    CREATE OR REPLACE FUNCTION trigger_set_timestamp()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- Users Table (public.users)
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
    -- Trigger for users updated_at
    DROP TRIGGER IF EXISTS set_users_updated_at ON public.users;
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
        rules_pdf_url TEXT,
        rules_pdf_storage_path TEXT,
        created_at timestamptz DEFAULT now() NOT NULL
    );

    -- Participations Table (public.participations)
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
        payment_details jsonb,
        qr_code_data_uri text,
        participated_at timestamptz DEFAULT now() NOT NULL,
        attended_at timestamptz,
        CONSTRAINT unique_user_event_participation UNIQUE (user_id, event_id)
    );

    -- Ideas Table (public.ideas)
    CREATE TABLE IF NOT EXISTS public.ideas (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        title text NOT NULL,
        description text NOT NULL,
        submitter_name text,
        submitter_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
        department text,
        tags text[],
        status text CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Implemented')) NOT NULL DEFAULT 'Pending',
        created_at timestamptz DEFAULT now() NOT NULL,
        updated_at timestamptz DEFAULT now() NOT NULL
    );
    -- Trigger for ideas updated_at
    DROP TRIGGER IF EXISTS set_ideas_updated_at ON public.ideas;
    CREATE TRIGGER set_ideas_updated_at
    BEFORE UPDATE ON public.ideas
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

    -- Site Content Table (public.site_content)
    CREATE TABLE IF NOT EXISTS public.site_content (
        id text PRIMARY KEY,
        content_data jsonb NOT NULL,
        updated_at timestamptz DEFAULT now() NOT NULL
    );
    -- Trigger for site_content updated_at
    DROP TRIGGER IF EXISTS set_site_content_updated_at ON public.site_content;
    CREATE TRIGGER set_site_content_updated_at
    BEFORE UPDATE ON public.site_content
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

    -- Homepage Images Table (public.homepage_images)
    CREATE TABLE IF NOT EXISTS public.homepage_images (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        image_url text NOT NULL,
        alt_text text NOT NULL,
        display_order integer DEFAULT 0 NOT NULL,
        is_active boolean DEFAULT true NOT NULL,
        storage_path text NOT NULL,
        created_at timestamptz DEFAULT now() NOT NULL
    );

    -- Site Configuration Table (public.site_configuration)
    CREATE TABLE IF NOT EXISTS public.site_configuration (
        id text PRIMARY KEY,
        settings_data jsonb NOT NULL,
        last_updated_at timestamptz DEFAULT now() NOT NULL
    );
    -- Note: The application code (src/services/settings.ts) manually updates 'last_updated_at' for this table.
    ```

4.  **Set Up Supabase Storage Buckets:**

    The application uses Supabase Storage for images and PDFs. You need to create the following buckets in your Supabase project dashboard (Storage > Buckets):
    *   `event-images`: For event poster images.
    *   `profile-pictures`: For user profile avatars.
    *   `homepage-images`: For images used on the homepage (e.g., carousel).
    *   `event-rules-pdfs`: For event rules PDF documents.

    **Important:** For each bucket, configure its access policies. For example, `profile-pictures`, `homepage-images`, `event-images`, and `event-rules-pdfs` likely need to be **public** for files to be displayed or downloaded on the website. Review Supabase documentation on Storage and RLS for buckets. For uploads, ensure your RLS policies allow your service role (for admin uploads) or authenticated users (if they can upload directly) to perform insert operations.

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
*   Event Participation with Cashfree Payment Gateway (and free event registration)
*   Profile Page with Profile Picture Upload (Supabase Storage) and Event Ticket QR Codes
*   Idea Showcase (User-submitted and Admin-added)
*   About & Contact Pages (Admin-editable)
*   Dark/Light Theme Toggle
*   Welcome Carousel (Initial visit only)
*   Admin Dashboard for:
    *   Managing Programs/Events (Add with Image & PDF Rules, View, Delete)
    *   Managing Users (View list - more actions planned)
    *   Managing Ideas (Add, Edit, View, Delete, Change Status)
    *   Managing Site Content (About, Contact, Privacy, Terms, Links, Homepage Images)
    *   Attendance Scanner (QR Code based)
    *   Site Settings (Basic placeholders, some functional like registration toggle & maintenance mode)

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
*   **For Admin Actions (like adding events):** Ensure your `SUPABASE_SERVICE_ROLE_KEY` is correctly set in `.env.local`. Server actions in `src/services/admin.ts` use this key to bypass RLS.
*   **For Public Data:** Define policies to allow read access. Example for allowing all users (anonymous and authenticated) to read events:
    ```sql
    CREATE POLICY "Allow public read access to events"
    ON public.events
    FOR SELECT
    TO anon, authenticated
    USING (true);
    ```
*   **For User-Specific Data:** Define policies based on `auth.uid()`. Example for users to see their own participations:
    ```sql
    CREATE POLICY "Allow users to see their own participations"
    ON public.participations
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);
    ```
Consult Supabase RLS documentation for detailed policy creation.

### Firebase (DEPRECATED) Errors

This project has primarily migrated to Supabase. If you encounter Firebase errors:
*   `FirebaseError: Firebase: Error (auth/invalid-api-key)` or missing config errors: This usually means your `.env.local` file is missing Firebase variables or they are incorrect. **Firebase is deprecated for this project; focus on Supabase setup.**
*   `FirebaseError: Firebase: Error (auth/configuration-not-found)` (Email/Password sign-in): Firebase Email/Password provider not enabled.
*   `FirebaseError: Firebase: Error (auth/unauthorized-domain)` (Google Sign-In): `localhost` or your deployed domain not in Firebase authorized domains.

**For all `.env.local` changes, remember to restart your Next.js development server (`npm run dev`).**

## Development & Best Practice Tips

1.  **Supabase RLS (Row Level Security):**
    *   Continue using the `service_role` key for admin server actions, as it bypasses RLS.
    *   For client-side data fetching (e.g., public events, ideas), ensure your RLS policies on Supabase tables are correctly configured. Publicly viewable data should be readable by `anon` or `authenticated` roles. User-specific data (like profiles or participations) should be restricted so users can only access their own.
    *   Thoroughly test RLS policies to prevent data leaks or users not seeing data they should.

2.  **Error Handling & User Feedback:**
    *   Provide clear feedback for both successful operations and errors using toasts.
    *   For critical errors, consider more prominent displays or dedicated error pages.
    *   Log errors on the server for easier debugging.

3.  **Image and File Optimization & Storage:**
    *   `next/image` is used for image optimization.
    *   For user-uploaded images/PDFs, consider implementing file size limits and potentially compression (client-side or via Supabase Functions) to manage storage costs and improve load times.
    *   Regularly review Supabase Storage usage and policies.

4.  **Admin Security:**
    *   The current admin login (`admin`/`adminpass`) is a development placeholder. For production, integrate admin authentication properly with Supabase Auth. This typically involves:
        *   Creating a custom 'admin' role in Supabase (you might need to add a `role` column to your `public.users` table or use custom claims).
        *   Assigning this role to specific user accounts.
        *   Protecting admin routes and server actions by checking for this role using `auth.uid()` and querying the user's role.

5.  **Form Validation:**
    *   Zod schemas provide good client-side validation.
    *   Server-side validation is crucial for all data mutations, as client-side checks can be bypassed. Ensure your server actions re-validate incoming data.

6.  **Performance:**
    *   Leverage Next.js features like Server Components by default to minimize client-side JavaScript.
    *   Use `revalidatePath` for cache invalidation after data mutations. For highly dynamic data, explore client-side fetching with libraries like SWR or TanStack Query if Server Components with `revalidatePath` don't meet the need.
    *   Optimize database queries; use indexes on frequently queried columns in Supabase.

7.  **Accessibility (a11y):**
    *   Continue using semantic HTML.
    *   Ensure ARIA attributes are used correctly where needed (ShadCN components often handle this well).
    *   Test for keyboard navigation and ensure sufficient color contrast.

8.  **Testing:**
    *   Write unit tests for critical utility functions and complex server actions.
    *   Consider implementing end-to-end tests (e.g., using Playwright or Cypress) for key user flows like registration, login, event participation, and admin actions.
```