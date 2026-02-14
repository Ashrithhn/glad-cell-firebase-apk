
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/layout/theme-provider';
import { AuthProvider } from '@/hooks/use-auth'; 
import { WelcomeHandler } from '@/components/layout/welcome-handler';
import { GlobalStyles } from '@/components/layout/global-styles';
import { MaintenanceBanner } from '@/components/layout/maintenance-banner';
import { PageLoader } from '@/components/layout/page-loader';
import { getSiteSettings } from '@/services/site-settings';

export async function generateMetadata(): Promise<Metadata> {
    const { settings } = await getSiteSettings();
    return {
        title: settings?.seoTitle || 'GLAD CELL - GEC Mosalehosahalli CSE Dept.',
        description: settings?.seoDescription || 'An initiative by the Department of Computer Science and Engineering, Government Engineering College Mosalehosahalli, to foster startup and ideathon concepts.',
        icons: {
            icon: '/logo.png',
        },
    }
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn('antialiased', GeistSans.className, 'global-page-texture')}> 
         <ThemeProvider
            attribute="class"
            defaultTheme="light" // Set light theme as default
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
                <WelcomeHandler>
                    <GlobalStyles />
                    <PageLoader />
                    <div className="flex flex-col min-h-screen">
                      <MaintenanceBanner /> 
                      <Header />
                      <main className="flex-grow container mx-auto py-8 px-4">
                        {children}
                      </main>
                      <Footer />
                    </div>
                    <Toaster />
                 </WelcomeHandler>
            </AuthProvider>
         </ThemeProvider>
      </body>
    </html>
  );
}
