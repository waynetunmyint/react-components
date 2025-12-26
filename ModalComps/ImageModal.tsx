"use client";

import React, { useEffect, useState, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  images: string[];
  initialIndex?: number;
  onClose: () => void;
}

export const ImageModal: React.FC<Props> = ({ images, initialIndex = 0, onClose }) => {
  const [index, setIndex] = useState<number>(initialIndex);

  const prev = useCallback(() => setIndex((i) => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setIndex((i) => (i + 1) % images.length), [images.length]);

  useEffect(() => setIndex(initialIndex), [initialIndex]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, prev, next]);

  if (!images || images.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative max-w-[96vw] max-h-[96vh] w-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button at bottom-center with colored icon */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute bottom-4 left-1/2 -translate-x-1/2 p-3 rounded-full bg-white/95 hover:bg-white shadow-md flex items-center justify-center"
        >
          <X size={18} className="text-red-600" />
        </button>

        {images.length > 1 && (
          <button
            onClick={prev}
            aria-label="Previous"
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        <div className="max-w-full max-h-full flex items-center justify-center">
          <img
            src={images[index]}
            alt={`Image ${index + 1}`}
            className="max-w-[90vw] max-h-[90vh] object-contain rounded"
          />
        </div>

        {images.length > 1 && (
          <button
            onClick={next}
            aria-label="Next"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white"
          >
            <ChevronRight size={20} />
          </button>
        )}

        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs text-white/90">
            {index + 1} / {images.length}
          </div>
        )}
      </div>
    </div>
  );
};

interface ImageWithModalProps {
  src: string;
  alt?: string;
  images?: string[]; // gallery images; if provided, will be used for navigation
  index?: number; // index of this image inside `images` if gallery
  className?: string;
}

const ImageWithModal: React.FC<ImageWithModalProps> = ({ src, alt = "Image", images, index = 0, className }) => {
  const gallery = images && images.length > 0 ? images : [src];
  const [open, setOpen] = useState(false);
  const [startIndex, setStartIndex] = useState<number>(index);

  const handleOpen = () => {
    setStartIndex(index);
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    // prevent body scroll while modal open
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <img
        src={src}
        alt={alt}
        className={`${className ?? "cursor-pointer rounded"}`}
        onClick={handleOpen}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleOpen();
        }}
      />

      {open && (
        <ImageModal images={gallery} initialIndex={startIndex} onClose={() => setOpen(false)} />
      )}
    </>
  );
};

export default ImageWithModal;
