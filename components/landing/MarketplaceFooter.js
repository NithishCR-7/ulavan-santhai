"use client";

import Link from "next/link";
import { useRef, useEffect, useState } from "react";

export default function MarketplaceFooter() {
  const footerRef = useRef(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!footerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08 }
    );
    observer.observe(footerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <footer
      id="contact"
      ref={footerRef}
      className={`marketplace-footer ${revealed ? "footer-revealed" : ""}`}
    >
      <div className="footer-grid">
        <div className="footer-intro">
          <Link href="#home" className="footer-brand">
            ULAVAN SANTHAI
          </Link>
          <p>
            One marketplace for growers, suppliers and buyers. Find your next
            agricultural connection.
          </p>
          <Link href="/register" className="footer-join">
            Join the community ↗
          </Link>
        </div>
        <nav aria-label="Explore">
          <h3>Explore</h3>
          <Link href="#about">About us</Link>
          <Link href="#who-its-for">Our community</Link>
          <Link href="#categories">Agricultural categories</Link>
        </nav>
        <nav aria-label="Getting started">
          <h3>Get started</h3>
          <Link href="#how-it-works">How it works</Link>
          <Link href="#plans">Plans & access</Link>
          <Link href="/register">Create an account</Link>
          <Link href="/login">Login</Link>
        </nav>
      </div>
      <div className="footer-bottom">
        <span>© 2026 Ulavan Santhai. All rights reserved.</span>
        <Link href="#home">Back to top ↑</Link>
      </div>
    </footer>
  );
}

