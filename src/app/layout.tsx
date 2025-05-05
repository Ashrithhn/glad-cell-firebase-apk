
import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { WelcomeHandler } from '@/components/layout/welcome-handler'; // Import the handler

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
    <html lang="en">
      <body className={cn('antialiased font-sans')}>
        {/* WelcomeHandler wraps the part of the layout that should only show AFTER the welcome flow */}
        <WelcomeHandler>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
              {children}
            </main>
             {/* Consider adding a Footer component here if needed */}
          </div>
          <Toaster />
        </WelcomeHandler>
         {/* Render children directly if it's the welcome page itself, handled inside WelcomeHandler */}
         {/* Fallback rendering for the actual welcome page content (will be rendered by Next.js routing) */}
         {children}
      </body>
    </html>
  );
}
