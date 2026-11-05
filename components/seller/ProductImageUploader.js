"use client";

import { useState, useRef } from "react";
import Image from "next/image";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function ProductImageUploader({ images = [], onChange, maxImages = 4 }) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);

  const handleFiles = (files) => {
    setUploadError("");
    const newImages = [...images];

    for (let i = 0; i < files.length; i++) {
      if (newImages.length >= maxImages) {
        setUploadError(`Maximum ${maxImages} images allowed per product listing.`);
        break;
      }

      const file = files[i];

      // Format validation
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setUploadError(`"${file.name}" is not supported. Please upload JPG, PNG, or WEBP.`);
        continue;
      }

      // Size validation
      if (file.size > MAX_FILE_SIZE) {
        setUploadError(`"${file.name}" exceeds the 5MB size limit. Please choose a smaller image.`);
        continue;
      }

      // Local preview generation via Object URL
      const previewUrl = URL.createObjectURL(file);
      newImages.push({
        id: `img_${Date.now()}_${i}`,
        file,
        url: previewUrl,
        fileName: file.name,
        fileSize: file.size,
        isPrimary: newImages.length === 0,
      });
    }

    onChange(newImages);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleRemove = (idToRemove) => {
    const updated = images.filter((img) => img.id !== idToRemove);
    if (updated.length > 0 && !updated.some((img) => img.isPrimary)) {
      updated[0].isPrimary = true;
    }
    onChange(updated);
  };

  const handleSetPrimary = (id) => {
    const updated = images.map((img) => ({
      ...img,
      isPrimary: img.id === id,
    }));
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Upload Dropzone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center transition-all cursor-pointer ${
          dragActive
            ? "border-[#174B35] bg-[#E8F0E3]/40"
            : "border-gray-300 hover:border-[#174B35] bg-[#F5F5EB]/40 hover:bg-[#F5F5EB]/80"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
          }}
          className="hidden"
        />

        <div className="w-14 h-14 rounded-2xl bg-[#E8F0E3] text-[#174B35] flex items-center justify-center mx-auto mb-3 shadow-xs">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>

        <h4 className="text-sm sm:text-base font-bold text-gray-800">
          Drop produce photos here, or <span className="text-[#174B35] underline font-extrabold">browse files</span>
        </h4>
        <p className="text-xs text-gray-500 mt-1">
          Supports JPG, PNG, WEBP (Max 5MB each &bull; up to {maxImages} images)
        </p>

        {/* Clear Mock / Storage Notice */}
        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>Local Image Staging Active (Preview enabled before cloud upload)</span>
        </div>
      </div>

      {/* Error Message */}
      {uploadError && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
          <span>{uploadError}</span>
          <button
            type="button"
            onClick={() => setUploadError("")}
            className="text-red-400 hover:text-red-700 font-bold ml-2"
          >
            &times;
          </button>
        </div>
      )}

      {/* Uploaded Images Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {images.map((img, idx) => (
            <div
              key={img.id || idx}
              className={`relative rounded-2xl overflow-hidden border-2 bg-white shadow-xs group ${
                img.isPrimary ? "border-[#174B35] ring-2 ring-[#174B35]/20" : "border-gray-200"
              }`}
            >
              <div className="relative aspect-square w-full">
                <Image
                  src={img.url}
                  alt={img.fileName || "Produce preview"}
                  fill
                  sizes="(max-width: 640px) 50vw, 200px"
                  className="object-cover"
                />

                {/* Primary Badge */}
                {img.isPrimary && (
                  <span className="absolute top-2 left-2 bg-[#174B35] text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                    Main Photo
                  </span>
                )}

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(img.id);
                  }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                  aria-label="Remove image"
                  title="Remove image"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Actions below photo */}
              <div className="p-2 bg-white text-[11px] flex items-center justify-between border-t border-gray-100">
                <span className="text-gray-500 truncate max-w-[90px]">{img.fileName}</span>
                {!img.isPrimary ? (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(img.id)}
                    className="text-[#174B35] font-bold hover:underline cursor-pointer text-[10px]"
                  >
                    Set Main
                  </button>
                ) : (
                  <span className="text-emerald-700 font-bold text-[10px]">Primary</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

