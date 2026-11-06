"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";
import "./audience.css";

export default function AudienceSection() {
  const root = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add("audience-seen"); observer.unobserve(entry.target); }
    }, { threshold: 0.16 });
    root.current.querySelectorAll(".audience-row").forEach(row => observer.observe(row));
    return () => observer.disconnect();
  }, []);
  const cards = [
    { number:"01", title:"Farmers & Sellers", categoryBadge:"Producers & FPOs", description:"For farmers, growers and producer groups who want to introduce their harvest to interested buyers.", details:["Create a seller profile and submit verification details", "Add product photos, quantities and listing information", "Approved listings can receive buyer enquiries"], image:"/images/photographs/farmer-harvest.jpg", alt:"Farmer with freshly harvested vegetables", actionText:"Connect as Seller", link:"/register?role=SELLER" },
    { number:"02", title:"Buyers & Traders", categoryBadge:"Commercial Buyers", description:"For individual buyers, retailers and traders looking for produce and dependable supplier connections.", details:["Browse agricultural categories after access approval", "Review supplier profiles and product information", "Ask sellers about quantity, quality and availability"], image:"/images/photographs/market-crates.jpg", alt:"Vegetables displayed in produce crates", actionText:"Connect as Buyer", link:"/register?role=BUYER" },
    { number:"03", title:"Manufacturers & Processors", categoryBadge:"Agro Industries", description:"For food processors and manufacturers sourcing produce or ingredients for their operations.", details:["Discover raw materials and agricultural ingredients", "Discuss specifications and volumes with suppliers", "Add a seller role to showcase your own products"], image:"/images/photographs/produce-processing.jpg", alt:"Workers sorting sweet potatoes on a processing line", actionText:"Explore Sourcing", link:"/register?role=BUYER" },
    { number:"04", title:"Wholesalers & Businesses", categoryBadge:"Bulk Distribution", description:"For wholesalers, distributors and businesses connecting with agricultural suppliers and customers.", details:["Explore produce for wholesale business needs", "Contact suppliers about bulk availability", "Buy, sell or do both using the same account"], image:"/images/photographs/produce-warehouse.jpg", alt:"Worker sorting fresh fruit in a produce warehouse", actionText:"Build Relationships", link:"/register?role=BOTH" },
  ];
  return (
    <section ref={root} id="who-its-for" className="audience-section" aria-labelledby="audience-heading">
      <div className="audience-wrap">
        <div className="audience-heading"><h2 id="audience-heading">Connecting Every Part of Agriculture</h2><p>Whether you grow, buy, process or distribute — find your place in the marketplace.</p></div>
        <div className="audience-rows">
          {cards.map((card, index) => <article key={card.number} className={`audience-row ${index % 2 ? "audience-reverse" : ""}`}>
            <div className={`audience-copy tone-card ${index % 2 ? "tone-green" : "tone-white"}`}>
              <span className="audience-category">{card.number} / {card.categoryBadge}</span>
              <h3>{card.title}</h3><p>{card.description}</p>
              <ul className="audience-details" aria-label={`${card.title} features`}>{card.details.map(detail => <li key={detail}><span aria-hidden="true">✓</span><span>{detail}</span></li>)}</ul>
              <Link href={card.link} className="audience-action">{card.actionText}<span aria-hidden="true">↗</span></Link>
            </div>
            <div className="audience-art">
              <div className="audience-orbit" aria-hidden="true" />
              <div className="audience-circle"><Image src={card.image} alt={card.alt} fill sizes="(max-width: 600px) 80vw, (max-width: 1023px) 45vw, 440px" className="object-cover" /></div>
              <span className="audience-photo-caption">{card.categoryBadge}</span>
            </div>
          </article>)}
        </div>
      </div>
    </section>
  );
}
