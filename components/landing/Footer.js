import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  const currentYear = 2026;

  return (
    <footer id="contact" className="bg-[#103A29] text-white border-t border-emerald-950/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12">
          {/* Brand Info (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl overflow-hidden bg-[#F5F5EB] flex items-center justify-center relative shrink-0 shadow-md ring-2 ring-white/30">
                <Image
                  src="/images/ulavan-santhai-emblem.jpg"
                  alt="Ulavan Santhai Logo"
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-white">
                  Ulavan Santhai
                </span>
                <span className="text-[10px] tracking-wider uppercase font-bold text-[#729B59]">
                  Agricultural Marketplace
                </span>
              </div>
            </Link>

            <p className="text-sm text-[#E8F0E3]/80 leading-relaxed max-w-sm">
              A common digital marketplace where agricultural producers and
              businesses discover products, showcase farm produce, and build
              valuable business connections across Tamil Nadu.
            </p>
          </div>

          {/* Quick Navigation Links */}
          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-[#729B59] mb-4">
              Marketplace
            </h4>
            <ul className="space-y-2.5 text-sm text-[#E8F0E3]/85">
              <li>
                <a href="#hero" className="hover:text-white transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-white transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#categories" className="hover:text-white transition-colors">
                  Categories
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-white transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* User Portals */}
          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-[#729B59] mb-4">
              Portals
            </h4>
            <ul className="space-y-2.5 text-sm text-[#E8F0E3]/85">
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Account Login
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-white transition-colors">
                  Join / Register
                </Link>
              </li>
              <li>
                <Link href="/onboarding" className="hover:text-white transition-colors">
                  Profile Onboarding
                </Link>
              </li>
              <li>
                <Link href="/onboarding/status" className="hover:text-white transition-colors">
                  Application Status
                </Link>
              </li>
            </ul>
          </div>

          {/* Guidelines & Terms */}
          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-[#729B59] mb-4">
              Transparency
            </h4>
            <ul className="space-y-2.5 text-sm text-[#E8F0E3]/85">
              <li>
                <Link href="/register" className="hover:text-white transition-colors">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <span className="text-xs text-[#E8F0E3]/60 block mt-2">
                  Ulavan Santhai connects verified agricultural buyers and sellers across regional and state markets.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Strip */}
        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-[#E8F0E3]/60 gap-4">
          <p>© {currentYear} Ulavan Santhai. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/register" className="hover:text-white transition-colors">
              Terms &amp; Conditions
            </Link>
            <Link href="/register" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

