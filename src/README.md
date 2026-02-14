
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
    **Note:** If you encounter "Module not found" errors (e.g., for `framer-motion`, `html5-qrcode`, etc.) after pulling changes or cloning, run `npm install` again to ensure all dependencies are correctly installed in your `node_modules` directory.

2.  **Set Up Environment Variables:**

    This project uses Supabase for authentication and database services, and Cashfree for payments. You need to configure environment variables for these services.

    *   Create a file named `.env.local` in the **root directory** of the project (the same level as `package.json`).
    *   Add the following variables to the `.env.local` file, replacing the placeholder values with your actual keys:

        ```dotenv
        # Supabase Configuration (Get these from your Supabase project settings: Project Settings -> API)
        # ⚠️ IMPORTANT: These variables MUST start with NEXT_PUBLIC_ to be accessible in the browser!
        NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
        NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

        # Supabase Service Role Key (For server-side admin actions)
        # This key has admin privileges and MUST BE KEPT SECRET. Do not expose it to the browser.
        # Get it from your Supabase project: Settings -> API -> Project API keys -> service_role
        SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY

        # Cashfree Configuration (Get these from your Cashfree dashboard)
        # These are used server-side, no NEXT_PUBLIC_ prefix needed.
        CASHFREE_APP_ID=YOUR_CASHFREE_APP_ID
        CASHFREE_SECRET_KEY=YOUR_CASHFREE_SECRET_KEY
        CASHFREE_ENV=TEST # Change to PROD for production

        # Base URL of your deployed application
        NEXT_PUBLIC_APP_BASE_URL=http://localhost:9002 # Change to your domain in production

        # Google Generative AI (Optional - If using Genkit features)
        # GOOGLE_GENAI_API_KEY=YOUR_GOOGLE_AI_API_KEY
        ```

    **🔴 CRITICAL: Supabase `AuthApiError` or Missing Key Errors 🔴**

    If you encounter errors related to Supabase, it almost always means your Supabase environment variables are not correctly set up or accessed.

    **Troubleshooting Steps:**
    *   **Verify `.env.local`:** Ensure the `.env.local` file exists in the project's **root directory**.
    *   **Check Variable Names:** Confirm the Supabase variable names are **exactly** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.
    *   **Check Key Values:** Double-check that the URL and Keys copied from your Supabase project settings are correct.
    *   **⭐️ RESTART THE SERVER ⭐️:** **YOU ABSOLUTELY MUST RESTART** your Next.js development server (`npm run dev`) after creating or modifying the `.env.local` file. Next.js only loads environment variables at build/startup time.

3.  **Set Up Supabase Database Schema:**

    The application requires several tables in your Supabase database. The complete and authoritative SQL schema, including table definitions, relationships, and triggers, is available in the main project documentation.

    **➡️ Please refer to the [Database Schema section in `DOCUMENTATION.md`](./DOCUMENTATION.md#4-database-schema) for the full SQL script to set up your database.**

    You can run the script from the documentation file in your Supabase project's **SQL Editor**. Make sure the `uuid-ossp` extension is enabled before running the script.

4.  **Set Up Supabase Storage Buckets:**

    The application uses Supabase Storage for images and files. You need to create the following buckets in your Supabase project dashboard (Storage > Buckets):
    *   `event-images`: For event poster images.
    *   `event-rules`: For event rulebook PDF files.
    *   `profile-pictures`: For user profile avatars.
    *   `homepage-images`: For images used on the homepage (e.g., carousel).

    **🔴 CRITICAL: Make Buckets Public for Images to Display 🔴**
    
    For images like event posters and profile pictures to be visible on your website, their storage buckets **MUST be public**. This allows the application to use permanent, non-expiring links.
    
    *   **Public Bucket:** Like a public photo gallery. Anyone with the direct link can see the image. **This is what you need.**
    *   **Private Bucket:** Like a locked cabinet. Access requires a special, temporary key (a signed URL). Using these temporary URLs will cause your images to disappear after a short time.

    To make a bucket public, go to its settings in the Supabase dashboard and toggle on "Public bucket". This is a safe and standard practice for non-sensitive visual assets.

5.  **Run the Development Server:**
    ```bash
    npm run dev
    ```
    Check the terminal output carefully for any Supabase or Cashfree configuration errors logged during startup.

6.  Open [http://localhost:9002](http://localhost:9002) (or the specified port) with your browser to see the result. Check the browser's developer console (F12) and the terminal where you ran `npm run dev` for any error messages, especially Supabase configuration errors or database connection issues.

## Project Structure

*   `src/app/`: Contains the application pages using the Next.js App Router.
*   `src/components/`: Shared UI components ( Shadcn UI, layout, features).
*   `src/lib/`: Utility functions and Supabase configuration.
*   `src/hooks/`: Custom React hooks (e.g., `useAuth`, `useToast`).
*   `src/services/`: Server Actions for backend logic (authentication, payments, database interactions).
*   `src/ai/`: (Optional) Genkit configuration and flows for AI features.

## Key Features Implemented

*   Student Registration & Login (Supabase Auth & Database)
*   College Admin Login (Role-based, secure)
*   Event Participation with Cashfree Payment Gateway
*   Profile Page with Profile Picture Upload (Supabase Storage)
*   Idea Showcase (User-submitted and Admin-added)
*   About & Contact Pages (Admin-editable)
*   Dark/Light Theme Toggle
*   Homepage Animations
*   Admin Dashboard for:
    *   Managing Programs/Events (Add, View, Delete)
    *   Editing Site Content (About, Contact, Links)
    *   Managing Innovation Ideas (Approve, Reject)
    *   Functional QR Attendance Scanner

## Admin Account Creation (Secure Method)

The insecure hardcoded admin login has been **removed**. Admin access is now managed through user roles in Supabase.

### Creating the First Super Admin (One-Time Manual Step)

To manage your site, you first need a "Super Admin" account. This is a one-time manual process that you must do in your Supabase database.

1.  **Register a User:** First, go to your live application and register a new user on the public registration page. This will be your initial Super Admin account. Remember the email and password you use.
2.  **Go to Supabase:** Open your project in the [Supabase Dashboard](https://supabase.com/dashboard).
3.  **Navigate to Table Editor:** In the left sidebar, click on the **Table Editor** icon (it looks like a table).
4.  **Select the `users` Table:** From the list of tables on the left, select `users`.
5.  **Find Your User:** Find the row corresponding to the user you just registered. You can identify it by the email address.
6.  **Edit the `role` Column:** Double-click the `role` cell for that user. It will likely say 'Participant'.
7.  **Change to 'Super Admin':** Change the value from 'Participant' to `Super Admin` (the capitalization is important) and save the change by clicking the 'Save' button.

This user can now log in to the `/admin/login` page and will have full administrative privileges, including the ability to promote other users.

### Creating Additional Admins (Via the Dashboard)

Once you have a Super Admin account:

1.  Have the future admin register for a standard account on the public registration page.
2.  The Super Admin logs in, navigates to the **Manage Users** dashboard.
3.  The Super Admin finds the new user and edits their profile.
4.  Change their 'role' from 'Participant' to 'Admin' and save. The user can now log in with their regular credentials to access the admin dashboard.

## Troubleshooting

### Supabase: "relation public.X does not exist"

If you see an error like `relation "public.your_table_name" does not exist`, it means the required table (`your_table_name`) has not been created in your Supabase database.

**Solution:**
1.  Go to your Supabase project dashboard.
2.  Navigate to the **SQL Editor**.
3.  Copy the SQL commands from the "Set Up Supabase Database Schema" section above for the missing table and any other tables you haven't created, and run them.

### Supabase: RLS (Row Level Security) Issues

If you can't insert or select data even if the table exists, RLS might be enabled without proper policies. This is a common cause for errors like "new row violates row-level security policy" on storage uploads.
**Solution:**
1.  Go to Supabase Dashboard > Authentication > Policies.
2.  For each table, either:
    *   **Disable RLS** (for development only, NOT recommended for production).
    *   **Create policies** that allow the necessary operations (SELECT, INSERT, UPDATE, DELETE) for the appropriate users/roles.

**For all `.env.local` changes, remember to restart your Next.js development server (`npm run dev`).**
