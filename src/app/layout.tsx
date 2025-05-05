

import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { WelcomeHandler } from '@/components/layout/welcome-handler'; // Re-add import

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
    // Apply dark mode conditionally based on route or keep it global
    // If welcome page needs black and others need white, more complex logic might be needed here or in WelcomeHandler/page styling
    <html lang="en" className="dark"> {/* Keep dark mode global for now */}
      <body className={cn('antialiased font-sans')}>
          {/* Wrap children with WelcomeHandler */}
          <WelcomeHandler>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow px-4 py-8">
                {children}
              </main>
               {/* Consider adding a Footer component here if needed */}
            </div>
            <Toaster />
          </WelcomeHandler>
      </body>
    </html>
  );
}
