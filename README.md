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

2.  **Set Up Environment Variables:**

    This project uses Firebase for authentication and database services, and Razorpay for payments. You need to configure environment variables for these services.

    *   Create a file named `.env.local` in the **root directory** of the project.
    *   Add the following variables to the `.env.local` file, replacing the placeholder values with your actual keys:

        ```dotenv
        # Firebase Configuration (Get these from your Firebase project settings)
        NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_FIREBASE_AUTH_DOMAIN
        NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_FIREBASE_STORAGE_BUCKET
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_FIREBASE_MESSAGING_SENDER_ID
        NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID
        NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=YOUR_FIREBASE_MEASUREMENT_ID # Optional

        # Razorpay Configuration (Get these from your Razorpay dashboard)
        RAZORPAY_KEY_ID=YOUR_RAZORPAY_KEY_ID
        RAZORPAY_KEY_SECRET=YOUR_RAZORPAY_KEY_SECRET
        # The Key ID is also exposed to the client-side via next.config.js
        NEXT_PUBLIC_RAZORPAY_KEY_ID=YOUR_RAZORPAY_KEY_ID # Make sure this matches RAZORPAY_KEY_ID

        # Google Generative AI (Optional - If using Genkit features)
        # GOOGLE_GENAI_API_KEY=YOUR_GOOGLE_AI_API_KEY
        ```

    **🔴 IMPORTANT: Firebase `auth/invalid-api-key` Error 🔴**

    If you encounter a `FirebaseError: Firebase: Error (auth/invalid-api-key)` when running the application (especially server-side actions like login/register or accessing Firestore), it almost always means your `NEXT_PUBLIC_FIREBASE_API_KEY` is missing, incorrect, or not accessible by the Next.js server process.

    **Troubleshooting Steps:**
    *   **Verify `.env.local`:** Ensure the `.env.local` file exists in the project's root directory (the same level as `package.json`).
    *   **Check Variable Name:** Confirm the variable name is exactly `NEXT_PUBLIC_FIREBASE_API_KEY`.
    *   **Check Key Value:** Double-check that the API key copied from your Firebase project settings is correct.
    *   **Restart Server:** **You MUST restart your Next.js development server (`npm run dev`) after creating or modifying the `.env.local` file.** Next.js only loads environment variables at build/startup time.
    *   **Server Access:** For server-side code (like Server Actions in `src/services`), ensure the server process itself can read the environment variables. In development (`npm run dev`), `.env.local` usually works. For deployments, consult your hosting provider's documentation on setting environment variables.

3.  **Run the Development Server:**
    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    ```

4.  Open [http://localhost:9002](http://localhost:9002) (or the specified port) with your browser to see the result.

## Project Structure

*   `src/app/`: Contains the application pages using the Next.js App Router.
*   `src/components/`: Shared UI components ( Shadcn UI, layout, features).
*   `src/lib/`: Utility functions and Firebase configuration.
*   `src/hooks/`: Custom React hooks (e.g., `useAuth`, `useToast`).
*   `src/services/`: Server Actions for backend logic (authentication, payments, database interactions).
*   `src/ai/`: (Optional) Genkit configuration and flows for AI features.

## Key Features Implemented

*   Student Registration & Login (Firebase Auth & Firestore)
*   Admin Login (Placeholder - Use Firebase Custom Claims for production)
*   Event Participation with Razorpay Payment Gateway
*   Basic Profile Page
*   Idea Showcase (Placeholder Data)
*   About & Contact Pages
*   Dark/Light Theme Toggle

## Admin Credentials (Development Only)

*   **Username:** `admin`
*   **Password:** `adminpass`

**Warning:** These credentials are for development testing only. Implement proper role-based access control using Firebase Custom Claims before deploying to production.
