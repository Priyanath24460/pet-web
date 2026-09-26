"use client";

import { useState } from "react";
import Image from "next/image";
import { PawPrint, Heart, ChevronLeft, ChevronRight } from "lucide-react";

interface PetImageGalleryProps {
  images: string[];
  name: string;
}

export default function PetImageGallery({ images, name }: PetImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (!images || images.length === 0) {
    return (
      <div className="relative w-full h-full bg-slate-100 flex flex-col items-center justify-center text-slate-300">
        <PawPrint className="w-16 h-16 mb-4" />
        <span>No image available</span>
        <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold text-slate-700 shadow-sm flex items-center gap-2">
          <Heart className="w-4 h-4 text-blue-500 fill-blue-500" />
          Ready for Adoption
        </div>
      </div>
    );
  }

  const activeImage = images[activeIndex];

  return (
    <div className="flex flex-col h-full w-full bg-white">
      {/* Main Image */}
      <div className="relative w-full aspect-square bg-slate-100">
        <Image 
          src={activeImage} 
          alt={name} 
          fill 
          className="object-cover transition-opacity duration-300"
          priority
        />
        
        <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold text-slate-700 shadow-sm flex items-center gap-2">
          <Heart className="w-4 h-4 text-blue-500 fill-blue-500" />
          Ready for Adoption
        </div>

        {images.length > 1 && (
          <>
            <button 
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-800 p-3 rounded-full shadow-md backdrop-blur-sm transition-all z-10 hover:scale-110"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <button 
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-800 p-3 rounded-full shadow-md backdrop-blur-sm transition-all z-10 hover:scale-110"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4 z-10">
              {images.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`w-2 h-2 rounded-full shadow-sm transition-all duration-300 ${activeIndex === idx ? 'bg-white scale-125' : 'bg-white/50'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="p-5 flex gap-4 overflow-x-auto">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`relative w-20 h-20 flex-shrink-0 rounded-2xl overflow-hidden shadow-sm transition-all duration-300 ${
                activeIndex === idx 
                  ? 'ring-2 ring-[#007BFF] scale-105' 
                  : 'ring-1 ring-slate-200 opacity-60 hover:opacity-100 hover:scale-105'
              }`}
            >
              <Image 
                src={img} 
                alt={`${name} thumbnail ${idx + 1}`} 
                fill 
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
