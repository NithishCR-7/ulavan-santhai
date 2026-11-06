"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import LeafHandshake from "./LeafHandshake";
const links = [["home", "Home"], ["who-its-for", "Who it’s for"], ["how-it-works", "How it works"], ["plans", "Plans"], ["contact", "Contact Us"]];
export default function ReferenceNavbar() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("home");
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const update = () => {
      setScrolled(window.scrollY > 80);
      let current = "home";
      for (const [id] of links) if (document.getElementById(id)?.getBoundingClientRect().top <= 140) current = id;
      setActive(current);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    const escape = (event) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", escape);
    return () => { window.removeEventListener("scroll", update); window.removeEventListener("keydown", escape); };
  }, []);
  return <header className={`reference-header${scrolled ? " is-scrolled" : ""}`}><nav className="reference-nav" aria-label="Main navigation">
    <Link className="reference-brand" href="#home" onClick={() => setOpen(false)}><LeafHandshake /><span>ULAVAN SANTHAI</span></Link>
    <button className="reference-toggle" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} aria-controls="reference-navigation" onClick={() => setOpen(!open)}>Menu <span aria-hidden="true">{open ? "×" : "☰"}</span></button>
    <div className={`reference-navigation${open ? " is-open" : ""}`} id="reference-navigation"><div className="reference-pill">
      {links.map(([id, label]) => <Link key={id} href={`#${id}`} className={active === id ? "is-active" : ""} aria-current={active === id ? "location" : undefined} onClick={() => setOpen(false)}>{label}</Link>)}
    </div><div className="reference-auth"><Link className="reference-login" href="/login" onClick={() => setOpen(false)}>Login</Link><Link className="reference-contact" href="/register" onClick={() => setOpen(false)}>Sign Up <span aria-hidden="true"><svg width="19" height="19" viewBox="0 0 24 24" fill="none"><path d="M6 18 18 6M6 6h12v12" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg></span></Link></div></div>
  </nav></header>;
}
