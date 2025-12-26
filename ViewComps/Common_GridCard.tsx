import React from "react";
import { IMAGE_URL } from "../../../config";
import { ArrowRight } from "lucide-react";
import { priceFormatter } from "../HelperComps/TextCaseComp";

interface Item {
  Id?: string;
  id?: string;
  Title?: string;
  BrandName?: string;
  Thumbnail?: string;
  Description?: string;
  CreatedAt?: string;
  ViewCount?: number;
  Price?: number;
  [key: string]: unknown;
}

interface Props {
  item: Item;
  onClick: () => void;
  idField?: string;
}

export function CommonGridCard({ item, onClick }: Props) {
  const label = item.Title || item.BrandName || "Untitled";
  const description = item.Description || "";

  const getImageUrl = (thumbnail: string | undefined) =>
    thumbnail ? `${IMAGE_URL}/uploads/${thumbnail}` : "https://via.placeholder.com/300x300?text=No+Image";

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`View ${label}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-gray-200/50 border border-gray-100 transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col focus-visible:ring-4 focus:outline-none"
      style={{ '--focus-ring-color': 'var(--theme-primary-bg)' } as React.CSSProperties}
    >
      {/* Card Image */}
      <div className="relative overflow-hidden aspect-[4/3] bg-gray-100">
        <img
          src={getImageUrl(item.Thumbnail)}
          alt={label}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          decoding="async"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Title */}
        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-theme-primary transition-colors">
          {label}
        </h3>

        {/* Description */}
        {description && (
          <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed mb-4 flex-1">
            {description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
          {item.Price ? (
            <div className="flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--theme-primary-bg)' }}>Price</span>
              <span className="text-lg font-bold" style={{ color: 'var(--theme-primary-bg)' }}>
                {priceFormatter(item.Price)}
              </span>
            </div>
          ) : null}

          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors bg-gray-50 text-gray-400 group-hover:text-white group-hover:bg-theme-primary ${item.Price ? '' : 'ml-auto'}`}
          >
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
}
