import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Lightbulb } from 'lucide-react'; // Using Lightbulb as a logo icon

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Lightbulb className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg text-primary">GLAD CELL</span>
        </Link>
        <nav className="flex items-center gap-1 md:gap-2 flex-wrap justify-end">
          <Button variant="ghost" asChild size="sm">
            <Link href="/">Home</Link>
          </Button>
          <Button variant="ghost" asChild size="sm">
            <Link href="/ideas">Ideas</Link>
          </Button>
           <Button variant="ghost" asChild size="sm">
            <Link href="/programs">Our Programs</Link>
          </Button>
          <Button variant="ghost" asChild size="sm">
            <Link href="/contact">Contact</Link>
          </Button>
           <Button variant="default" asChild size="sm">
            <Link href="/register">Register</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
