
import Link from 'next/link';
import { Copyright } from 'lucide-react';
import Image from 'next/image';
import { SocialLinks } from './social-links';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-card text-card-foreground">
      <div className="container mx-auto py-12 px-4 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Column 1: Brand */}
          <div className="md:col-span-2 pr-8">
             <Link href="/" className="flex items-center gap-2 mb-4">
                <Image src="/logo.png" alt="GLAD CELL Logo" width={40} height={40} className="h-10 w-10" unoptimized={true} />
                <span className="font-bold text-lg text-primary">GLAD CELL</span>
             </Link>
             <p className="text-sm text-muted-foreground">
                An initiative by the Department of Computer Science and Engineering, GEC Mosalehosahalli, to foster a culture of innovation, collaboration, and entrepreneurship among students.
             </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/ideas" className="hover:text-primary transition-colors">Explore Ideas</Link></li>
              <li><Link href="/programs" className="hover:text-primary transition-colors">Current Events</Link></li>
              <li><Link href="/programs/archive" className="hover:text-primary transition-colors">Past Events</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          {/* Column 3: Legal */}
           <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
               <li><Link href="/terms-and-conditions" className="hover:text-primary transition-colors">Terms & Conditions</Link></li>
               <li><Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        
        {/* Social Links integrated here */}
        <SocialLinks />

        {/* Bottom Section */}
        <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-muted-foreground">
          <p className="flex items-center gap-1 order-2 md:order-1">
            <Copyright className="h-4 w-4" /> {currentYear} GLAD CELL - GECM. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
