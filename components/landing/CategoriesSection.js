"use client";

import Link from "next/link";
import Image from "next/image";

export default function CategoriesSection() {
  const categories = [
    {
      id: "vegetables",
      name: "Vegetables",
      description: "Fresh vegetables and farm produce.",
      image:
        "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=80",
      alt: "Fresh vibrant vegetables and harvested farm produce",
      categoryTag: "Farm Fresh",
      link: "/register?category=Vegetables",
    },
    {
      id: "fruits",
      name: "Fruits",
      description: "Seasonal and tropical fruits.",
      image:
        "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=1000&q=80",
      alt: "Seasonal and tropical fresh agricultural fruits",
      categoryTag: "Orchard Harvest",
      link: "/register?category=Fruits",
    },
    {
      id: "grains",
      name: "Grains",
      description: "Rice, wheat, millets and more.",
      image:
        "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=1000&q=80",
      alt: "Golden cereal crops, rice, wheat and grains",
      categoryTag: "Cereal Harvest",
      link: "/register?category=Grains",
    },
    {
      id: "spices",
      name: "Spices",
      description: "A variety of aromatic spices.",
      image:
        "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1000&q=80",
      alt: "Authentic Indian spices and aromatic condiments",
      categoryTag: "Aromatic Produce",
      link: "/register?category=Spices",
    },
    {
      id: "pulses",
      name: "Pulses",
      description: "Lentils, beans and legumes.",
      image:
        "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=1000&q=80",
      alt: "Assorted raw agricultural pulses, lentils, and legumes",
      categoryTag: "Protein Crops",
      link: "/register?category=Pulses",
    },
    {
      id: "other",
      name: "Other Produce",
      description: "Explore more agricultural products.",
      image:
        "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=1000&q=80",
      alt: "Fresh coconuts, sugarcane, and plantation crops",
      categoryTag: "Plantation & Cash",
      link: "/register?category=Other",
    },
  ];

  return (
    <section id="categories" className="py-24 sm:py-32 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading & Introduction */}
        <div className="max-w-3xl mx-auto text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E8F0E3] text-[#174B35] text-xs font-bold uppercase tracking-wider mb-4 border border-[#729B59]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#729B59]" />
            <span>Produce Categories</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#174B35] tracking-tight leading-tight">
            Explore Agricultural Categories
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[#68746A] leading-relaxed">
            Discover a wide variety of agricultural produce, all in one marketplace.
          </p>
        </div>

        {/* Six Categories Editorial Grid (3 Columns on Desktop, 2 on Tablet, 1 on Mobile) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 sm:gap-8">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={cat.link}
              className="group bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-gray-200/80 shadow-xs hover:shadow-xl hover:border-[#729B59]/50 transition-all duration-300 flex flex-col h-full hover:-translate-y-1.5"
            >
              {/* Large High-Quality Photograph */}
              <div className="relative aspect-[16/11] w-full overflow-hidden bg-gray-100">
                <Image
                  src={cat.image}
                  alt={cat.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover group-hover:scale-106 transition-transform duration-500 ease-out"
                />

                {/* Subtle Category Pill Badge */}
                <div className="absolute top-3.5 left-3.5 z-10">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-black/55 backdrop-blur-xs text-white text-[11px] font-medium tracking-wide">
                    {cat.categoryTag}
                  </span>
                </div>
              </div>

              {/* Card Body & Typography */}
              <div className="p-6 flex flex-col flex-1 justify-between bg-white">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl sm:text-2xl font-bold text-[#174B35] group-hover:text-[#729B59] transition-colors tracking-tight">
                      {cat.name}
                    </h3>
                    <div className="w-8 h-8 rounded-full bg-[#E8F0E3] text-[#174B35] group-hover:bg-[#174B35] group-hover:text-white transition-colors duration-200 flex items-center justify-center shrink-0">
                      <svg
                        className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </div>
                  </div>

                  <p className="mt-2.5 text-sm text-[#68746A] leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                {/* Bottom Action Line */}
                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold">
                  <span className="text-[#68746A]">Wholesale &amp; Bulk Supply</span>
                  <span className="text-[#174B35] group-hover:text-[#729B59] transition-colors inline-flex items-center gap-1">
                    <span>View Category</span>
                    <span>&rarr;</span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
