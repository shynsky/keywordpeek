import Link from "next/link";
import Image from "next/image";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col marketing-page">
      {/* Header - minimal, bordered */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b-2 border-foreground grain-subtle">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <Link href="/" className="flex items-center gap-2 font-mono font-bold text-sm uppercase tracking-widest no-underline text-foreground hover:text-primary">
              <Image src="/K.png" alt="KeywordPeek" width={28} height={28} className="w-7 h-7" />
              <span className="hidden sm:inline">[KEYWORDPEEK]</span>
            </Link>

            <nav className="flex items-center gap-6 font-mono text-sm uppercase tracking-wide">
              <Link
                href="#features"
                className="text-muted-foreground hover:text-primary no-underline hidden sm:inline"
              >
                Features
              </Link>
              <Link
                href="#pricing"
                className="text-muted-foreground hover:text-primary no-underline hidden sm:inline"
              >
                Pricing
              </Link>
              <span className="text-border hidden sm:inline">|</span>
              <Link
                href="/auth/login"
                className="text-muted-foreground hover:text-primary no-underline"
              >
                Log in
              </Link>
              <Link
                href="/auth/signup"
                className="bg-primary text-primary-foreground px-4 py-2 hover:bg-foreground hover:text-background no-underline"
              >
                Sign up
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/* Footer - single line */}
      <footer className="border-t-2 border-foreground bg-muted grain-subtle">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-sm text-muted-foreground">
            <span>(C) {new Date().getFullYear()} KEYWORDPEEK</span>
            <div className="flex items-center gap-6 uppercase tracking-wide">
              <Link href="/privacy" className="hover:text-primary no-underline text-muted-foreground">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-primary no-underline text-muted-foreground">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
