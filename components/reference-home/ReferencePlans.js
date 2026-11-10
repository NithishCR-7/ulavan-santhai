"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import "./plans.css";
const plans = [
 { title:"Buyer access", description:"Find produce and connect with agricultural suppliers.", items:["Access to 10 sellers", "Discover agricultural products", "Send enquiries directly to sellers"], action:"Join as a buyer" },
 { title:"Seller plan", description:"Showcase your products and reach interested buyers.", items:["Create your seller profile", "Submit products for approval", "Be discovered by potential buyers"], action:"Join as a seller" },
];
export default function ReferencePlans() {
 const root=useRef(null);
 useEffect(()=>{const observer=new IntersectionObserver(([entry])=>{if(entry.isIntersecting){entry.target.classList.add("plans-revealed");observer.disconnect();}},{threshold:0.12});observer.observe(root.current);return ()=>observer.disconnect();},[]);
 return <section ref={root} id="plans" className="access-plans" aria-labelledby="plans-heading"><div className="access-plans-wrap">
 <div className="access-plans-heading"><h2 id="plans-heading">Clear plans. A simple start.</h2><p>Choose the access that fits your journey.</p></div>
 <div className="access-plans-grid">{plans.map((plan,index)=><article key={plan.title} className={`access-plan ${index ? "access-plan-seller" : "access-plan-buyer"}`}>
 <svg className="access-plan-decoration" viewBox="0 0 100 100" fill="none" aria-hidden="true"><path d="M17 88C5 24 42 6 87 9c6 48-18 80-70 79Zm0 0L70 28M39 63l-5-27m5 27 29 1" stroke="currentColor" strokeWidth="1.4"/></svg>
 <div className="access-plan-top"><span className="access-plan-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{index ? <path d="M12 21V11M12 15C4 16 2 10 3 4c7 0 11 3 9 11ZM12 11C12 4 17 2 22 3c0 6-3 10-10 8Z"/> : <path d="m3 9 2 11h14l2-11ZM7 9l5-6 5 6M9 13v3m6-3v3"/>}</svg></span><h3>{plan.title}</h3></div>
 <p className="access-plan-description">{plan.description}</p><div className="access-plan-price">₹365{index===1&&<span>/ month</span>}</div>
 <ul className="access-plan-benefits">{plan.items.map(item=><li key={item}><span className="access-plan-check" aria-hidden="true">✓</span>{item}</li>)}</ul>
 <div className="access-plan-extra">{index===0 ? <><strong>Need more connections?</strong><p>₹10 adds access to another 10 sellers.</p></> : <><strong>Ready to showcase your produce?</strong><p>Seller profiles and product listings are reviewed before going live.</p></>}</div>
 <Link href="/register" className="access-plan-button">{plan.action}<span aria-hidden="true">↗</span></Link></article>)}</div>
 <p className="access-plans-note">Payment is reviewed by an administrator before access is activated. Seller profiles and product listings require additional approval. The platform connects buyers and sellers through discovery and enquiries.</p>
 </div></section>;
}
