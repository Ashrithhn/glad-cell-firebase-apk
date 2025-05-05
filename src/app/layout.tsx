
import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/layout/theme-provider'; // Import ThemeProvider

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
    // Removed hardcoded dark class
    <html lang="en" suppressHydrationWarning>
      <body className={cn('antialiased font-sans')}>
         {/* Wrap content with ThemeProvider */}
         <ThemeProvider
            attribute="class"
            defaultTheme="dark" // Keep dark as default
            enableSystem
            disableTransitionOnChange
          >
            <div className="flex flex-col min-h-screen">
              {/* Conditionally render Header based on route if needed */}
              <Header />
              <main className="flex-grow container mx-auto py-8 px-4"> {/* Add container and padding */}
                {children}
              </main>
              {/* Consider adding a Footer component here if needed */}
            </div>
            <Toaster />
         </ThemeProvider>
      </body>
    </html>
  );
}
