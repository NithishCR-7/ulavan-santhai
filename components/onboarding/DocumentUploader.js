"use client";

import { useState, useRef } from "react";
import { uploadDocument } from "@/services/onboardingApi";

export default function DocumentUploader({
  documentType,
  title,
  description,
  required = false,
  uploadedDoc,
  onUploadSuccess,
  onRemove,
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  // Allowed file extensions and max size (5 MB)
  const allowedExtensions = ["pdf", "jpg", "jpeg", "png"];
  const maxSizeBytes = 5 * 1024 * 1024; // 5MB

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 KB";
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");

    // Validate extension
    const ext = file.name.split(".").pop().toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      setError(`Invalid format (.${ext}). Only PDF, JPG, JPEG, and PNG are allowed.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Validate size
    if (file.size > maxSizeBytes) {
      setError(`File size (${formatFileSize(file.size)}) exceeds 5 MB limit.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Begin upload simulation & API dispatch
    setIsUploading(true);
    setUploadProgress(20);

    const progressTimer = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressTimer);
          return 90;
        }
        return prev + 25;
      });
    }, 150);

    try {
      const result = await uploadDocument(file, documentType);
      clearInterval(progressTimer);
      setUploadProgress(100);

      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        onUploadSuccess({
          documentId: result.documentId,
          documentType,
          fileName: file.name,
          fileSize: file.size,
          url: result.data?.url || "",
        });
      }, 300);
    } catch (err) {
      clearInterval(progressTimer);
      setIsUploading(false);
      setUploadProgress(0);
      setError(err.message || "Failed to upload document. Please try again.");
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 transition-all hover:border-emerald-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-base font-bold text-gray-900">{title}</h4>
            {required ? (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                Mandatory
              </span>
            ) : (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                Optional
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* If file is already uploaded */}
      {uploadedDoc ? (
        <div className="mt-4 p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm shadow-emerald-200">
              {uploadedDoc.fileName.endsWith(".pdf") ? "PDF" : "IMG"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {uploadedDoc.fileName}
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{formatFileSize(uploadedDoc.fileSize)}</span>
                <span>•</span>
                <span className="text-emerald-700 font-medium flex items-center gap-1">
                  Uploaded (ID: {uploadedDoc.documentId})
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-white border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => onRemove(documentType)}
              className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
            >
              Remove
            </button>
          </div>
        </div>
      ) : isUploading ? (
        /* Uploading Progress Bar */
        <div className="mt-4 p-5 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/20 text-center">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-700 mb-2">
            <span>Uploading document...</span>
            <span className="text-emerald-700">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-600 h-2 rounded-full transition-all duration-200"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      ) : (
        /* Empty Upload Dropzone */
        <div
          onClick={() => fileInputRef.current?.click()}
          className="mt-4 p-6 rounded-xl border-2 border-dashed border-gray-300 hover:border-emerald-500 bg-gray-50/50 hover:bg-emerald-50/20 text-center cursor-pointer transition-all group"
        >
          <div className="w-12 h-12 rounded-full bg-white border border-gray-200 text-gray-400 group-hover:text-emerald-600 group-hover:border-emerald-300 mx-auto flex items-center justify-center mb-2 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-gray-800 group-hover:text-emerald-800">
            Click to upload document
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Allowed: PDF, JPG, JPEG, PNG (Max 5 MB)
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-xs text-red-600 mt-2 font-medium">
          {error}
        </p>
      )}
    </div>
  );
}

