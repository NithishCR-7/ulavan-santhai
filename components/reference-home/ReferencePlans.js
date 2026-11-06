import Link from "next/link";

// Retain the supplied HTML's plan terms rather than the older landing page's pricing.
export default function ReferencePlans() {
  const plans = [
    {title:"Buyer access", price:"₹365", suffix:"", items:["Access to 10 sellers.", "₹10 for each additional block of 10 sellers.", "Discover products and send enquiries."], action:"Join as a buyer"},
    {title:"Seller plan", price:"₹365", suffix:" / month", items:["Create your seller profile.", "Submit products for approval.", "Be discovered by potential buyers."], action:"Join as a seller"},
  ];
  return <section id="plans" className="bg-[#F5F5EB] py-20 sm:py-24 px-6"><div className="max-w-5xl mx-auto">
    <div className="text-center mb-12"><p className="text-xs font-bold uppercase tracking-widest text-[#729B59]">How access works</p><h2 className="text-3xl sm:text-4xl font-extrabold text-[#174B35] mt-4">Clear plans. A simple start.</h2><p className="mt-4 text-[#68746A]">Choose the access that fits your journey.</p></div>
    <div className="grid md:grid-cols-2 gap-6">{plans.map((plan, index) => <article key={plan.title} className={`tone-card rounded-2xl border border-[#174B35]/20 p-8 flex flex-col ${index % 2 ? "tone-green" : "tone-white"}`}><h3 className="text-xl font-bold text-[#174B35]">{plan.title}</h3><p className="my-5 text-4xl font-bold text-[#174B35]">{plan.price}<span className="text-sm font-normal">{plan.suffix}</span></p><ul className="list-disc pl-5 space-y-3 text-[#68746A] mb-8">{plan.items.map(item=><li key={item}>{item}</li>)}</ul><Link href="/register" className="mt-auto rounded-xl bg-[#174B35] px-6 py-3 text-center font-bold text-white">{plan.action} ↗</Link></article>)}</div>
    <p className="text-center text-xs leading-relaxed mt-6 text-[#68746A]">Payment is reviewed by an administrator before access is activated. Seller profiles and product listings require additional approval. The platform connects buyers and sellers through discovery and enquiries.</p>
  </div></section>;
}
