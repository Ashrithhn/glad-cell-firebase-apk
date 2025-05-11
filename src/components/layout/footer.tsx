
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Lightbulb } from 'lucide-react';

export function Footer() {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="bg-muted/50 text-muted-foreground py-8 mt-12 border-t">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg text-primary">GLAD CELL</span>
            </Link>
            <p className="text-sm">
              An initiative by the Department of Computer Science and Engineering,
              Government Engineering College Mosalehosahalli.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-primary hover:underline">About Us</Link></li>
              <li><Link href="/programs" className="hover:text-primary hover:underline">Our Programs</Link></li>
              <li><Link href="/ideas" className="hover:text-primary hover:underline">Explore Ideas</Link></li>
              <li><Link href="/contact" className="hover:text-primary hover:underline">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-3">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms-and-conditions" className="hover:text-primary hover:underline">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-primary hover:underline">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <Separator className="my-6 bg-border" />
        <div className="text-center text-sm">
          <p>
            &copy; {currentYear} GLAD CELL - GEC Mosalehosahalli. All Rights Reserved.
          </p>
          <p className="mt-1">
            Developed with a vision to foster innovation.
          </p>
        </div>
      </div>
    </footer>
  );
}
