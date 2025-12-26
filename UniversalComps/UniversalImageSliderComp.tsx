"use client";
import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import UniversalImageModal from "./UniversalImageModal";

interface UniversalImageSliderCompProps {
  images: string[];
  heading: string;
}

const UniversalImageSliderComp: React.FC<UniversalImageSliderCompProps> = ({
  images,
  heading,
}) => {
  const [current, setCurrent] = useState(0);
  const [modalImage, setModalImage] = useState<string | null>(null);

  if (!images.length) {
    return (
      <div className="w-full h-64 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
        No Images
      </div>
    );
  }

  const handlePrev = () =>
    setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  const handleNext = () =>
    setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1));

  return (
    <div className="relative w-full">
      <img
        src={images[current]}
        alt={heading}
        className="w-full h-64 object-cover rounded-xl border cursor-pointer"
        onClick={() => setModalImage(images[current])}
      />

      {/* Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white p-2 rounded-full shadow"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white p-2 rounded-full shadow"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Image Modal */}
      {modalImage && (
        <UniversalImageModal
          imageURL={modalImage}
          onClose={() => setModalImage(null)}
        />
      )}
    </div>
  );
};

export default UniversalImageSliderComp;
