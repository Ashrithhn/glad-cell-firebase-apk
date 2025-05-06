
import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Import Inter font
import './globals.css';
import { Header } from '@/components/layout/header';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/layout/theme-provider';
import { AuthProvider } from '@/hooks/use-auth';
import { WelcomeHandler } from '@/components/layout/welcome-handler';
import { GlobalStyles } from '@/components/layout/global-styles';
import { GlobalLoadingIndicator } from '@/components/layout/global-loading-indicator'; // Import loader

// Initialize Inter font with subsets
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

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
      <body className={cn('antialiased font-sans', inter.variable)}> {/* Apply Inter font */}
         <ThemeProvider
            attribute="class"
            defaultTheme="light" // Changed default theme to light
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
                <WelcomeHandler>
                    <GlobalStyles />
                    <GlobalLoadingIndicator /> {/* Add Global Loading Indicator here */}
                    <div className="flex flex-col min-h-screen">
                      <Header />
                      <main className="flex-grow container mx-auto py-8 px-4">
                        {children}
                      </main>
                      {/* Footer can be added here */}
                    </div>
                    <Toaster />
                 </WelcomeHandler>
            </AuthProvider>
         </ThemeProvider>
      </body>
    </html>
  );
}
