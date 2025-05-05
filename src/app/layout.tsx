
import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
// import { WelcomeHandler } from '@/components/layout/welcome-handler'; // Removed WelcomeHandler

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
    // Apply dark mode globally
    <html lang="en" className="dark">
      <body className={cn('antialiased font-sans')}>
          {/* Removed WelcomeHandler wrapper */}
          <div className="flex flex-col min-h-screen">
             {/* Conditionally render Header based on route if needed (e.g., hide on /welcome, /login, /register) */}
             {/* <Header /> */}
             <main className="flex-grow"> {/* Removed padding to allow full-screen pages like login/register */}
              {children}
            </main>
             {/* Consider adding a Footer component here if needed */}
          </div>
          <Toaster />
      </body>
    </html>
  );
}
