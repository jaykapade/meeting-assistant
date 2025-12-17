import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="mx-auto max-w-xl text-center">
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Page not found
        </h1>

        <p className="mt-4 text-muted-foreground">
          Sorry, we couldn’t find the page you’re looking for. It might have
          been moved, deleted, or never existed.
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild>
            <Link href="/" className="inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to dashboard
            </Link>
          </Button>

          <Button variant="outline" asChild>
            <Link href="/meetings">View meetings</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
