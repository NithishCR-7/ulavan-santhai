import Link from "next/link";
import "../app/login/login.css";

function Leaves() {
  return (
    <svg className="login-leaves" aria-hidden="true" viewBox="0 0 140 125">
      <path d="M140 124C135 80 110 44 57 29m64 48c-13-28-17-46-15-66m25 91c-15-12-29-17-49-17" fill="none" stroke="#98bd51" strokeWidth="2" />
      <path d="M107 5c35 20 43 46 17 63-19-13-25-35-17-63Z" fill="#92be48" />
      <path d="M104 55C75 30 58 40 40 58c24 16 44 16 64-3Z" fill="#afd657" />
      <path d="M70 34C63 13 48 10 37 13c6 16 15 23 33 21ZM117 89c-12-16-23-16-34-10 11 12 21 15 34 10ZM41 37c-12-11-24-9-30-2 9 8 19 9 30 2Z" fill="#c6e59a" />
    </svg>
  );
}

export default function AuthLayout({ titleId, children, overlay }) {
  return (
    <div className="login-page">
      {/* Top Floating Back Link */}
      <div className="login-navigation">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/95 backdrop-blur-md text-[#174B35] hover:text-[#103A29] text-xs sm:text-sm font-bold shadow-xs border border-gray-200 hover:border-[#174B35]/40 transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Marketplace Home</span>
        </Link>
      </div>

      <main className="login-layout">
        <section className="login-panel" aria-labelledby={titleId}>
          <Leaves />
          {children}
        </section>
      </main>
      {overlay}
    </div>
  );
}
