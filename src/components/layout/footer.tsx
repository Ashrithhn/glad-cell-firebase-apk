
<<<<<<< HEAD
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
=======
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
>>>>>>> 0e505f8 (once scanned qr code not taken again and after all registered total participants data must available to download and more memebers can access admin login if wants make changes,in admin control panel change side bar according to the need of admin it not same as users ithink soo and manager users and other feture comimg soon tabs enable add according to your experience not same as admin dashboard simpli different,and make admin can edit some more users settings and others required things make changes,view and manged users and some more things arein feature coming soon made it available now and get things from users dashboard if there data exists,in user dashboard add terms and conditions and privacy policy with related info like relted to our app,in site setting make enable of all coming soon options and add even more,colours are actually not good add colours combinations like instagram and make loading animation if users network is slow,iam in final stage of launching my app add copyrights and reserved and any required symbols yerar and add many more that all websites doing things and clear all bugs and make evrything good for user working,)
        </div>
      </div>
    </footer>
  );
}
