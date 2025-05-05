
import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
// Removed WelcomeHandler import

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
    <html lang="en" className="dark"> {/* Force dark mode globally */}
      <body className={cn('antialiased font-sans')}>
         {/* Removed WelcomeHandler wrapper */}
          <div className="flex flex-col min-h-screen">
            <Header />
            {/* Removed container mx-auto for full width */}
            <main className="flex-grow px-4 py-8">
              {children}
            </main>
             {/* Consider adding a Footer component here if needed */}
          </div>
          <Toaster />
         {/* Render children directly */}
      </body>
    </html>
  );
}
