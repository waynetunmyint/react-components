import React from "react";
import { X, ImagePlus, AlertCircle, Camera, Check, UploadCloud } from "lucide-react";
import { IMAGE_URL } from "../../../config";

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
  const currentBlob = uploadImageBlobs[field.fieldName];
  const existingPath = formData[camel];
  const hasImage = !!(currentBlob || existingPath);

  const getImageUrl = () => {
    if (currentBlob) return currentBlob;
    if (existingPath) {
      if (typeof existingPath !== "string") return null;
      if (existingPath.startsWith("http") || existingPath.startsWith("data:")) return existingPath;
      return `${IMAGE_URL}/uploads/${existingPath}`;
    }
    return null;
  };

  const imageUrl = getImageUrl();

  return (
    <div key={field.fieldName} className="flex flex-col gap-3 min-w-[280px] flex-1">
      {/* Label */}
      <div className="flex items-center justify-between mb-1">
        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          <Camera size={12} className="text-brand-gold" strokeWidth={3} />
          {field.fieldName}
          {field.required && <span className="text-red-500">*</span>}
        </label>
        {hasImage && !error && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-brand-green/10 rounded-full">
            <Check size={10} className="text-brand-green" strokeWidth={4} />
            <span className="text-[9px] font-black text-brand-green uppercase tracking-tighter">Ready</span>
          </div>
        )}
      </div>

      {/* Image Upload Area */}
      <div className="group/container relative">
        <div
          className={`relative border-2 border-dashed rounded-[2rem] w-full flex items-center justify-center cursor-pointer overflow-hidden transition-all duration-500 group/upload ${hasImage
            ? "border-brand-green/30 bg-white shadow-xl shadow-brand-green/5"
            : error
              ? "border-red-400 bg-red-50/50"
              : "border-slate-200 bg-white hover:border-brand-gold hover:bg-brand-gold/5 hover:shadow-2xl hover:shadow-brand-gold/10"
            }`}
          onClick={() => document.getElementById(`file-${dataSource}-${field.fieldName}`)?.click()}
          style={{ minHeight: !hasImage ? '220px' : 'auto' }}
        >
          {imageUrl ? (
            <div className="relative w-full aspect-video sm:aspect-[16/10]">
              <img
                src={imageUrl}
                alt={field.fieldName}
                className="w-full h-full object-cover block transition-transform duration-700 group-hover/upload:scale-110"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://via.placeholder.com/800x400?text=Invalid+Image+Source`;
                }}
              />

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover/upload:opacity-100 transition-all duration-300 flex flex-col items-center justify-center backdrop-blur-[4px]">
                <div className="bg-white px-5 py-2.5 rounded-2xl text-slate-900 text-[10px] font-black uppercase tracking-widest shadow-2xl transform translate-y-4 group-hover/upload:translate-y-0 transition-transform duration-500">
                  Replace Asset
                </div>
              </div>

              {/* Status Badge */}
              <div className="absolute top-4 left-4 z-10 px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-white/20">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-900">
                  {currentBlob ? 'New Upload' : 'Existing'}
                </span>
              </div>

              {/* Remove Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setUploadImageBlobs((p) => ({ ...p, [field.fieldName]: null }));
                }}
                className="absolute top-4 right-4 z-20 bg-white/90 text-slate-400 rounded-full p-2.5 shadow-xl hover:bg-red-500 hover:text-white transition-all duration-300 border border-white transform hover:rotate-90 active:scale-95"
              >
                <X size={16} strokeWidth={3} />
              </button>
            </div>
          ) : (
            <div className="text-center p-12">
              <div className="w-20 h-20 mx-auto mb-6 rounded-[2rem] bg-slate-50 flex items-center justify-center group-hover/upload:scale-110 group-hover/upload:bg-brand-gold/20 transition-all duration-500 shadow-inner group-hover/upload:shadow-none">
                <UploadCloud
                  className={`${error ? "text-red-500" : "text-brand-gold group-hover/upload:text-brand-gold active:scale-90 transition-all"
                    }`}
                  size={36}
                  strokeWidth={1.5}
                />
              </div>
              <p className="text-xs font-black text-slate-900 mb-2 uppercase tracking-[0.2em]">Upload {field.fieldName}</p>
              <p className="text-[10px] text-slate-400 font-medium max-w-[160px] mx-auto leading-relaxed italic">
                Drag and drop or click to browse files
              </p>
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

        {/* Shine effect */}
        {!hasImage && (
          <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover/container:translate-x-full transition-transform duration-1000 pointer-events-none" />
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 text-red-600 text-[10px] font-bold mt-2 bg-red-50/80 backdrop-blur-sm px-4 py-3 rounded-2xl border border-red-100 animate-in slide-in-from-top-2 duration-300">
          <AlertCircle size={14} strokeWidth={3} />
          <span className="uppercase tracking-wider">{error}</span>
        </div>
      )}
    </div>
  );
};

export default ImageField;
