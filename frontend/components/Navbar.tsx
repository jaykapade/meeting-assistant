import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Navbar() {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            <Link href="/" className="text-xl font-semibold">
              Meeting Assistant
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">Dashboard</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/meetings/new">New Meeting</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
