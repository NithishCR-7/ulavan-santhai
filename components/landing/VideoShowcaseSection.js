/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";

export default function VideoShowcaseSection() {
  const [videoReady, setVideoReady] = useState(false);

  // Authentic agricultural harvesting footage from Wikimedia Commons
  const videoWebm =
    "https://upload.wikimedia.org/wikipedia/commons/d/d9/20200724-NRCS-LSC-0028-Rice_Harvest.webm";
  const posterImage = "/images/hero-aerial-fields.jpg";

  return (
    <section className="relative h-44 sm:h-56 md:h-64 w-full overflow-hidden bg-[#103A29] flex items-center justify-center">
      {/* Real Agricultural Video Footage Background */}
      <div className="absolute inset-0 w-full h-full">
        <video
          autoPlay
          loop
          muted
          playsInline
          poster={posterImage}
          onLoadedData={() => setVideoReady(true)}
          className={`w-full h-full object-cover transition-opacity duration-1000 ${
            videoReady ? "opacity-95" : "opacity-90"
          }`}
        >
          <source src={videoWebm} type="video/webm" />
          <img
            src={posterImage}
            alt="Expansive lush green agricultural countryside"
            className="w-full h-full object-cover"
          />
        </video>

        {/* Minimal Editorial Overlay */}
        <div className="absolute inset-0 bg-[#103A29]/65 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#103A29]/90 via-transparent to-[#103A29]/90" />
      </div>

      {/* Minimal Message Overlay */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">

        <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight drop-shadow-md">
          &ldquo;From the Field to New Opportunities.&rdquo;
        </h2>
        <div className="w-16 h-1 bg-[#729B59] mx-auto mt-5 rounded-full" />
      </div>
    </section>
  );
}

