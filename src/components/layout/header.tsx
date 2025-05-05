import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Lightbulb } from 'lucide-react'; // Using Lightbulb as a logo icon

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Lightbulb className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg text-primary">IdeaSpark</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/">Home</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/register">Register</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/ideas">Ideas</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
