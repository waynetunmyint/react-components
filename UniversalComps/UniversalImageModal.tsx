import React from "react";
import { X } from "lucide-react";

interface Props {
  imageURL: string | null;
  onClose: () => void;
}

export default function UniversalImageModal({ imageURL: url, onClose }: Props) {
  if (!url) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
      <div className="relative max-w-3xl w-full p-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 bg-white rounded-full p-1 shadow hover:bg-gray-100"
        >
          <X size={20} className="text-gray-700" />
        </button>

        {/* Image */}
        <img
          src={url}
          alt="Preview"
          className="w-full h-auto max-h-[90vh] object-contain rounded-xl shadow-lg"
        />
      </div>
    </div>
  );
}
