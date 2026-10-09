"use client";

import React, { useState } from "react";
import { Grid, X, ChevronLeft, ChevronRight } from "lucide-react";
import { ListingImage } from "@/types";

interface PhotoGalleryProps {
  images: ListingImage[];
  title: string;
}

export default function PhotoGallery({ images, title }: PhotoGalleryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const photoUrls = images.map((img) => img.url);
  const displayPhotos = photoUrls.slice(0, 5);

  const openLightbox = (index: number) => {
    setActiveIndex(index);
    setIsOpen(true);
  };

  const nextPhoto = () => {
    setActiveIndex((prev) => (prev + 1) % photoUrls.length);
  };

  const prevPhoto = () => {
    setActiveIndex((prev) => (prev - 1 + photoUrls.length) % photoUrls.length);
  };

  return (
    <>
      {/* 5-Photo Mosaic Grid */}
      <div className="relative overflow-hidden rounded-2xl shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[340px] sm:h-[440px]">
          {/* Main Large Photo */}
          <div
            className="md:col-span-2 relative cursor-pointer overflow-hidden group h-full"
            onClick={() => openLightbox(0)}
          >
            <img
              src={displayPhotos[0] || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"}
              alt={`${title} 1`}
              className="h-full w-full object-cover transition duration-300 group-hover:brightness-90 group-hover:scale-102"
            />
          </div>

          {/* Right 4-Photo Grid */}
          <div className="hidden md:grid md:col-span-2 grid-cols-2 gap-2 h-full">
            {displayPhotos.slice(1, 5).map((photo, i) => (
              <div
                key={i}
                className="relative cursor-pointer overflow-hidden group h-[216px]"
                onClick={() => openLightbox(i + 1)}
              >
                <img
                  src={photo}
                  alt={`${title} ${i + 2}`}
                  className="h-full w-full object-cover transition duration-300 group-hover:brightness-90 group-hover:scale-102"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Show all photos button */}
        <button
          onClick={() => openLightbox(0)}
          className="absolute bottom-4 right-4 z-10 flex items-center gap-2 rounded-lg border border-black bg-white px-4 py-2 text-xs font-bold text-gray-900 shadow-md hover:bg-gray-100 transition cursor-pointer"
        >
          <Grid className="h-4 w-4" />
          <span>Show all {photoUrls.length} photos</span>
        </button>
      </div>

      {/* Lightbox Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 animate-in fade-in duration-200">
          {/* Top Bar */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white z-20">
            <span className="text-sm font-semibold">
              {activeIndex + 1} / {photoUrls.length}
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full bg-white/10 p-2 hover:bg-white/20 transition cursor-pointer text-white"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Previous Arrow */}
          <button
            onClick={prevPhoto}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-20 rounded-full bg-white/10 p-3 hover:bg-white/25 transition cursor-pointer text-white"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          {/* Current Photo */}
          <div className="relative max-h-[85vh] max-w-[85vw] flex items-center justify-center">
            <img
              src={photoUrls[activeIndex]}
              alt={`${title} preview`}
              className="max-h-[82vh] max-w-full rounded-lg object-contain shadow-2xl"
            />
          </div>

          {/* Next Arrow */}
          <button
            onClick={nextPhoto}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-20 rounded-full bg-white/10 p-3 hover:bg-white/25 transition cursor-pointer text-white"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      )}
    </>
  );
}
