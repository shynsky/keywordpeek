import Link from "next/link";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col marketing-page">
      {/* Header - minimal, bordered */}
      <header className="sticky top-0 z-50 bg-background border-b border-foreground">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <Link href="/" className="font-bold text-sm uppercase tracking-wider no-underline text-foreground hover:text-primary">
              KeywordPeek
            </Link>

            <div className="flex items-center gap-6">
              <Link
                href="/auth/login"
                className="text-sm text-muted-foreground hover:text-foreground no-underline"
              >
                Log in
              </Link>
              <Link
                href="/auth/signup"
                className="text-sm font-bold uppercase tracking-wide text-foreground hover:text-primary no-underline"
              >
                Sign up →
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/* Footer - single line */}
      <footer className="border-t border-foreground bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <span>© {new Date().getFullYear()} KeywordPeek</span>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="hover:text-foreground no-underline text-muted-foreground">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-foreground no-underline text-muted-foreground">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
