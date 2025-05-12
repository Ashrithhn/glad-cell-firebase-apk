
import Link from 'next/link';
import { Copyright } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto py-6 px-4 text-center text-sm text-muted-foreground">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="flex items-center gap-1">
            <Copyright className="h-4 w-4" /> {currentYear} GLAD CELL - GEC Mosalehosahalli. All Rights Reserved.
          </p>
          <nav className="flex gap-4">
            <Link href="/terms-and-conditions" className="hover:text-primary transition-colors">
              Terms & Conditions
            </Link>
            <Link href="/privacy-policy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/contact" className="hover:text-primary transition-colors">
              Contact Us
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
