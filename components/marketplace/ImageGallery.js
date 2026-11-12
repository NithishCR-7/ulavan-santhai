"use client";

import { useState } from "react";
import Image from "next/image";
import { SproutIcon, CloseIcon } from "./Icons";

export default function ImageGallery({ images = [], title = "Agricultural Harvest Produce" }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [imgErrors, setImgErrors] = useState({});

  const validImages = Array.isArray(images) && images.length > 0
    ? images
    : ["/images/photographs/farmer-harvest.jpg"];

  const currentImage = validImages[selectedIndex] || validImages[0];

  const handleImgError = (idx) => {
    setImgErrors((prev) => ({ ...prev, [idx]: true }));
  };

  return (
    <div className="space-y-4">
      {/* 1. Main Square (1:1) Interactive Display */}
      <div
        className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#F5F5EB] border border-gray-200/90 shadow-2xs group cursor-zoom-in"
        onClick={() => setIsZoomOpen(true)}
        title="Click to Zoom Fullscreen"
      >
        {!imgErrors[selectedIndex] ? (
          <Image
            src={currentImage}
            alt={`${title} - View ${selectedIndex + 1}`}
            fill
            sizes="(max-width: 1024px) 100vw, 450px"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => handleImgError(selectedIndex)}
            priority
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-linear-to-br from-emerald-50 to-[#E8F0E3] text-[#174B35] text-center">
            <SproutIcon className="w-8 h-8 mb-2 text-[#174B35]" />
            <span className="text-sm font-bold">{title}</span>
            <span className="text-xs text-gray-500 mt-1">Verified Farm Lot Photograph</span>
          </div>
        )}

        {/* Zoom Hint Icon */}
        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-xs text-white p-2 rounded-xl text-xs flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity pointer-events-none">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
          </svg>
          <span className="hidden sm:inline">Click to Zoom</span>
        </div>
      </div>

      {/* 2. Thumbnails Row (3-4 real photographs) */}
      {validImages.length > 1 && (
        <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
          {validImages.map((imgUrl, idx) => {
            const isSelected = selectedIndex === idx;
            return (
              <button
                key={`${imgUrl}-${idx}`}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={`relative aspect-square rounded-xl overflow-hidden bg-[#F5F5EB] border-2 transition-all cursor-pointer ${
                  isSelected
                    ? "border-[#174B35] ring-2 ring-[#174B35]/20 scale-95"
                    : "border-gray-200 hover:border-gray-300 opacity-80 hover:opacity-100"
                }`}
                aria-label={`Select photo ${idx + 1}`}
              >
                {!imgErrors[idx] ? (
                  <Image
                    src={imgUrl}
                    alt={`${title} thumbnail ${idx + 1}`}
                    fill
                    sizes="90px"
                    className="object-cover"
                    onError={() => handleImgError(idx)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 bg-gray-100">
                    <SproutIcon className="w-4 h-4 text-gray-400" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* 3. Click-to-Zoom Lightbox Modal */}
      {isZoomOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setIsZoomOpen(false)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] aspect-square sm:aspect-4/3 rounded-2xl overflow-hidden bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={currentImage}
              alt={`${title} Fullscreen Zoom View`}
              fill
              sizes="100vw"
              className="object-contain"
            />
            <button
              type="button"
              onClick={() => setIsZoomOpen(false)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white text-white hover:text-gray-900 flex items-center justify-center font-bold text-lg backdrop-blur-xs transition-colors cursor-pointer"
              aria-label="Close Fullscreen View"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
            <div className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-xs text-white p-3 rounded-xl text-xs flex items-center justify-between">
              <span className="font-bold truncate mr-2">{title}</span>
              <span className="text-gray-300 shrink-0">
                Photo {selectedIndex + 1} of {validImages.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

