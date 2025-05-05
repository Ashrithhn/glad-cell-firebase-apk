
import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/layout/theme-provider';
import { AuthProvider } from '@/hooks/use-auth'; // Import AuthProvider
import { WelcomeHandler } from '@/components/layout/welcome-handler'; // Import WelcomeHandler

export const metadata: Metadata = {
  title: 'GLAD CELL - GEC Mosalehosahalli CSE Dept.',
  description:
    'GLAD CELL - An initiative by the Department of Computer Science and Engineering, Government Engineering College Mosalehosahalli, to foster startup and ideathon concepts.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn('antialiased font-sans')}>
         <ThemeProvider
            attribute="class"
            defaultTheme="light" // Set default to light as requested
            enableSystem
            disableTransitionOnChange
          >
            {/* Wrap content with AuthProvider */}
            <AuthProvider>
                 {/* WelcomeHandler decides whether to show welcome or main content */}
                <WelcomeHandler>
                    <div className="flex flex-col min-h-screen">
                      <Header />
                      <main className="flex-grow container mx-auto py-8 px-4">
                        {children}
                      </main>
                      {/* Consider adding a Footer component here if needed */}
                    </div>
                    <Toaster />
                 </WelcomeHandler>
            </AuthProvider>
         </ThemeProvider>
      </body>
    </html>
  );
}
