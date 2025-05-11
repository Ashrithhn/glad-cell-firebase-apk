
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
    **Note:** If you encounter "Module not found" errors (e.g., for `framer-motion`, `firebase`, etc.) after pulling changes or cloning, try running `npm install` again to ensure all dependencies are correctly installed in your `node_modules` directory.

2.  **Set Up Environment Variables:**

    This project uses Firebase for authentication and database services (Firestore), and Cashfree for payments. You need to configure environment variables for these services.

    *   Create a file named `.env.local` in the **root directory** of the project (the same level as `package.json`).
    *   Add the following variables to the `.env.local` file, replacing the placeholder values with your actual keys:

        ```dotenv
        # Firebase Configuration (Get these from your Firebase project settings)
        # ⚠️ IMPORTANT: These variables MUST start with NEXT_PUBLIC_ to be accessible in the browser!
        NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_FIREBASE_AUTH_DOMAIN
        NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_FIREBASE_STORAGE_BUCKET
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_FIREBASE_MESSAGING_SENDER_ID
        NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID
        NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=YOUR_FIREBASE_MEASUREMENT_ID # Optional

        # Firebase Realtime Database URL (Optional - ONLY for Server-Side use if you intend to use Realtime Database)
        # Get this from Firebase Console > Realtime Database > Data tab
        # DO NOT prefix with NEXT_PUBLIC_ if only used server-side.
        # This project primarily uses Firestore, so this might not be strictly needed.
        FIREBASE_REALTIME_DB_URL=YOUR_FIREBASE_REALTIME_DATABASE_URL

        # Cashfree Configuration (Get these from your Cashfree dashboard)
        # These are used server-side, no NEXT_PUBLIC_ prefix needed.
        CASHFREE_APP_ID=YOUR_CASHFREE_APP_ID
        CASHFREE_SECRET_KEY=YOUR_CASHFREE_SECRET_KEY
        CASHFREE_ENV=TEST # or PROD
        NEXT_PUBLIC_APP_BASE_URL=http://localhost:9002 # Your app's base URL

        # Google Generative AI (Optional - If using Genkit features)
        # GOOGLE_GENAI_API_KEY=YOUR_GOOGLE_AI_API_KEY
        ```

    **🔴 CRITICAL: Firebase `auth/invalid-api-key` or Missing Key Errors 🔴**

    If you encounter errors like `FirebaseError: Firebase: Error (auth/invalid-api-key)` or console messages indicating missing Firebase config (API Key, Project ID, etc.), it almost always means your environment variables are not correctly set up or accessed.

    **Troubleshooting Steps:**
    *   **Verify `.env.local`:** Ensure the `.env.local` file exists in the project's **root directory** (the same level as `package.json`).
    *   **Check Variable Names:** Confirm the Firebase variable names start **exactly** with `NEXT_PUBLIC_` (e.g., `NEXT_PUBLIC_FIREBASE_API_KEY`). Variables without this prefix are **not** available in the browser/client-side code where Firebase is initialized.
    *   **Check Key Values:** Double-check that the API key, Project ID, etc., copied from your Firebase project settings are correct. Make sure there are no extra spaces or characters.
    *   **⭐️ RESTART THE SERVER ⭐️:** **YOU ABSOLUTELY MUST RESTART** your Next.js development server (`npm run dev`) after creating or modifying the `.env.local` file. Next.js only loads environment variables at build/startup time. **This is the MOST common reason for these errors!**
    *   **Server Access (Server Actions):** For server-side code (like Server Actions in `src/services`), ensure the server process itself can read the environment variables. In development (`npm run dev`), `.env.local` usually works if you restart the server. For deployments, consult your hosting provider's documentation on setting environment variables.

    **🔴 IMPORTANT: Firebase `auth/configuration-not-found` Error 🔴**

    If you encounter a `FirebaseError: Firebase: Error (auth/configuration-not-found)` when trying to **register or log in with Email/Password**, it means you haven't enabled the Email/Password sign-in method in your Firebase project.

    **How to Fix:**
    1.  Go to the [Firebase Console](https://console.firebase.google.com/).
    2.  Select your project.
    3.  In the left-hand menu, navigate to **Authentication**.
    4.  Click the **Sign-in method** tab.
    5.  Find **Email/Password** in the list of providers.
    6.  Click the pencil icon (Edit) and **enable** the provider.
    7.  Click **Save**.
    8.  **Restart your Next.js development server (`npm run dev`)** if it was running.

    **🔴 IMPORTANT: Firebase `auth/unauthorized-domain` Error (Especially with Google Sign-In) 🔴**

    If you encounter a `FirebaseError: Firebase: Error (auth/unauthorized-domain)` when trying to use a sign-in provider (commonly Google Sign-In), it means the domain your application is running on (e.g., `localhost`, or your deployed domain like `your-app.vercel.app`) has not been added to the list of authorized domains in your Firebase project.

    **How to Fix:**
    1.  Go to the [Firebase Console](https://console.firebase.google.com/).
    2.  Select your project.
    3.  In the left-hand menu, navigate to **Authentication**.
    4.  Click the **Sign-in method** tab.
    5.  Scroll down to the **Authorized domains** section.
    6.  Click the **Add domain** button.
    7.  Enter the domain your application is currently running on.
        *   For local development, this is usually `localhost`. **Make sure `localhost` is added if you are testing locally.**
        *   For deployed applications, use your actual domain (e.g., `your-app-name.vercel.app`, `www.yourdomain.com`).
    8.  Click **Add**.
    9.  It might take a few minutes for the changes to propagate. You might also need to clear your browser cache or restart your development server.

3.  **Run the Development Server:**
    ```bash
    npm run dev
    ```
    Check the terminal output carefully for any Firebase configuration errors logged during startup.

4.  Open [http://localhost:9002](http://localhost:9002) (or the specified port) with your browser to see the result. Check the browser's developer console (F12) and the terminal where you ran `npm run dev` for any error messages, especially Firebase configuration errors.

## Project Structure

*   `src/app/`: Contains the application pages using the Next.js App Router.
*   `src/components/`: Shared UI components ( Shadcn UI, layout, features).
*   `src/lib/`: Utility functions and Firebase configuration.
*   `src/hooks/`: Custom React hooks (e.g., `useAuth`, `useToast`).
*   `src/services/`: Server Actions for backend logic (authentication, payments, database interactions).
*   `src/ai/`: (Optional) Genkit configuration and flows for AI features.

## Key Features Implemented

*   Student Registration & Login (Firebase Auth & Firestore)
    *   Email/Password
    *   Google Sign-In
*   Admin Login (Placeholder - Use Firebase Custom Claims for production)
*   Event Participation with Cashfree Payment Gateway
*   Profile Page with Profile Picture Upload
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

**Warning:** These credentials are for development testing only. Implement proper role-based access control using Firebase Custom Claims before deploying to production.

## Troubleshooting

### Firestore Index Required Error

If you see an error in your Next.js terminal or browser console similar to:
`FirebaseError: The query requires an index. You can create it here: https://console.firebase.google.com/v1/r/project/YOUR_PROJECT_ID/firestore/indexes?create_composite=...`

This means that a query in the application (often involving sorting or filtering on multiple fields) needs a composite index in Firestore that has not been created yet.

**How to Fix:**
1.  **Identify the Query:** The error message usually provides a link. **Copy this link and open it in your browser.**
2.  **Create the Index:** The link will take you directly to the Firebase console page for creating the required index.
    *   Review the suggested index fields and order.
    *   Click the "Create Index" or "Save" button.
3.  **Wait for Indexing:** Firestore will start building the index. This can take a few minutes, especially for large datasets (though for a new project, it's usually quick). You can monitor the status in the Firebase console under Firestore > Indexes.
4.  **Restart Application (Optional but Recommended):** Once the index is built and active, it's a good idea to restart your Next.js development server.
5.  **Retry the Operation:** Try accessing the page or performing the action that caused the error. It should now work.

**Common Queries Requiring Indexes:**
*   Fetching homepage images: `homepageImages` collection, ordered by `order` and `createdAt`.
*   Other queries involving `orderBy()` on multiple fields or `where()` clauses on different fields than the `orderBy()` field.

If the error persists or the link doesn't work, manually navigate to your Firebase project console:
*   Go to **Firestore Database**.
*   Click on the **Indexes** tab.
*   Click **Add composite index**.
*   Enter the **Collection ID** (e.g., `homepageImages`).
*   Add the fields to index based on your query (e.g., `order` ASC, `createdAt` DESC).
*   Save the index.
```