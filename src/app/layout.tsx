
import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Import Inter font
import './globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer'; // Import Footer
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/layout/theme-provider';
import { AuthProvider } from '@/hooks/use-auth';
import { WelcomeHandler } from '@/components/layout/welcome-handler';
import { GlobalStyles } from '@/components/layout/global-styles';
import { GlobalLoadingIndicator } from '@/components/layout/global-loading-indicator';

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
      <body className={cn('antialiased font-sans bg-background text-foreground', inter.variable)}> {/* Apply Inter font and background/foreground */}
         <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
                <WelcomeHandler>
                    <GlobalStyles />
                    <GlobalLoadingIndicator />
                    <div className="flex flex-col min-h-screen">
                      <Header />
                      <main className="flex-grow container mx-auto py-8 px-4">
                        {children}
                      </main>
                      <Footer /> {/* Add Footer component here */}
                    </div>
                    <Toaster />
                 </WelcomeHandler>
            </AuthProvider>
         </ThemeProvider>
      </body>
    </html>
  );
}
