import React from "react";
import { X, ImagePlus, AlertCircle, Camera } from "lucide-react";
import { BASE_URL } from "../../../config";

interface ImageFieldProps {
  field: any;
  dataSource: string;
  error?: string;
  camel: string;
  uploadImageBlobs: Record<string, string | null>;
  formData: Record<string, any>;
  handleImagePicked: (field: string, file: File | null) => void;
  setUploadImageBlobs: (fn: (p: Record<string, string | null>) => Record<string, string | null>) => void;
}

const ImageField: React.FC<ImageFieldProps> = ({
  field,
  dataSource,
  error,
  camel,
  uploadImageBlobs,
  formData,
  handleImagePicked,
  setUploadImageBlobs,
}) => {
  const hasImage = uploadImageBlobs[field.fieldName] || formData[camel];

  return (
    <div key={field.fieldName} className="flex flex-col gap-3">
      {/* Label */}
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <Camera size={14} className="text-pink-500" />
        {field.fieldName}
        {field.required && <span className="text-red-500">*</span>}
      </label>

      {/* Image Upload Area */}
      <div className="w-full">
        <div
          className={`relative border-2 border-dashed rounded-2xl w-full flex items-center justify-center cursor-pointer overflow-hidden transition-all duration-300 group/upload ${hasImage
            ? "border-pink-500 bg-pink-50 shadow-lg shadow-pink-500/10"
            : error
              ? "border-red-400 bg-red-50"
              : "border-gray-300 bg-white hover:border-pink-400 hover:bg-pink-50 hover:shadow-md"
            }`}
          onClick={() => document.getElementById(`file-${dataSource}-${field.fieldName}`)?.click()}
          style={{ minHeight: !hasImage ? '180px' : 'auto' }}
        >
          {hasImage ? (
            <div className="relative w-full">
              <img
                src={
                  uploadImageBlobs[field.fieldName] ||
                  `${BASE_URL}/uploads/${formData[camel]}`
                }
                alt={field.fieldName}
                className="w-full h-auto object-cover block"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://via.placeholder.com/800x400?text=Image+Not+Found`;
                }}
              />
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/upload:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                <div className="bg-white/90 px-4 py-2 rounded-xl text-gray-900 text-sm font-bold shadow-xl">
                  Change Image
                </div>
              </div>
              {/* Remove Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setUploadImageBlobs((p) => ({ ...p, [field.fieldName]: null }));
                }}
                className="absolute top-4 right-4 z-10 bg-white/90 rounded-full p-2.5 shadow-xl hover:bg-red-500 hover:text-white transition-all duration-200 border border-white"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <div className="text-center p-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center group-hover/upload:scale-110 transition-transform shadow-sm">
                <ImagePlus
                  className={`${error ? "text-red-500" : "text-pink-500"
                    }`}
                  size={32}
                />
              </div>
              <p className="text-sm font-bold text-gray-900 mb-1">Upload {field.fieldName}</p>
              <p className="text-xs text-gray-400">Click or drag image to start</p>
            </div>
          )}
          <input
            id={`file-${dataSource}-${field.fieldName}`}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleImagePicked(field.fieldName, e.target.files?.[0] ?? null)}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm mt-3 bg-red-50 px-3 py-2.5 rounded-xl border border-red-100">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageField;
