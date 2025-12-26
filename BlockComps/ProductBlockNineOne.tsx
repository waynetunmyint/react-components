import React, { useState, useCallback } from "react";
import { List, ArrowRight, Eye, X } from "lucide-react";
import { IMAGE_URL } from "../../../config";
import BlockHeader from "../BlockComps/BlockHeader";

interface Props {
  dataSource: string;
  headingTitle?: string | null;
  subHeadingTitle?: string | null;
  items?: any[];
  loading?: boolean;
  error?: string | null;
}

export default function ProductBlockNineOne({
  dataSource,
  headingTitle,
  subHeadingTitle,
  items: prefetchedItems,
  loading: prefetchedLoading,
  error: prefetchedError,
}: Props) {
  const items = prefetchedItems ?? [];
  const loading = prefetchedLoading ?? false;
  const error = prefetchedError ?? null;

  const [viewMode, setViewMode] = useState<"list" | "grid" | "largeGrid">("grid");
  const [modalImage, setModalImage] = useState<string | null>(null);

  const getImageUrl = useCallback((thumbnail: string | undefined) => {
    return thumbnail ? `${IMAGE_URL}/uploads/${thumbnail}` : "https://via.placeholder.com/400x300?text=No+Image";
  }, []);

  const handleNavigation = useCallback((id: string | number) => {
    if (dataSource && id) window.location.href = `/${dataSource}/view/${id}`;
  }, [dataSource]);

  const getGridClass = () => {
    switch (viewMode) {
      case "grid": return "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
      case "largeGrid": return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
      default: return "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
    }
  };

  const Skeleton = () => (
    <div className="bg-white rounded-3xl overflow-hidden animate-pulse shadow-sm">
      <div className="w-full aspect-square bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-gray-200 rounded-lg w-3/4" />
        <div className="h-4 bg-gray-100 rounded-lg w-full" />
        <div className="h-6 bg-gray-200 rounded-lg w-1/3" />
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <BlockHeader
          headingTitle={headingTitle || "Products"}
          subHeadingTitle={subHeadingTitle}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          dataSource={dataSource}
          showViewAll={!loading && items.length > 0}
        />

        {/* Products Grid */}
        <div className={viewMode === "list" ? "flex flex-col gap-4" : `grid ${getGridClass()} gap-5`}>
          {loading ? (
            Array.from({ length: 4 }).map((_, idx) => <Skeleton key={idx} />)
          ) : items.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl">
              <h3 className="text-xl font-bold text-gray-900 mb-2">No products yet</h3>
              <p className="text-gray-500 text-center max-w-xs">Products will appear here once added.</p>
            </div>
          ) : (
            items.map((item, idx) => {
              const imageUrl = getImageUrl(item.Thumbnail);
              const title = item.Title || "Untitled";
              const description = item.Description || "";
              const price = item.Price ? parseFloat(item.Price).toFixed(2) : null;

              if (viewMode === "list") {
                return (
                  <div
                    key={item.Id || idx}
                    className="group flex gap-5 bg-white rounded-2xl p-4 shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 cursor-pointer"
                    onClick={() => handleNavigation(item.Id)}
                  >
                    <div className="relative w-32 h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0">
                      <img src={imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center min-w-0">
                      <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1 group-hover:text-[var(--theme-primary-bg)] transition-colors">{title}</h3>
                      {description && <p className="text-gray-500 text-sm line-clamp-2">{description}</p>}
                      {price && (
                        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-[rgba(var(--theme-primary-bg-rgb),0.1)] border border-[rgba(var(--theme-primary-bg-rgb),0.2)] rounded-full w-fit">
                          <span className="text-[var(--theme-primary-bg)] font-bold">${price}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-[rgba(var(--theme-primary-bg-rgb),0.1)] flex items-center justify-center transition-colors">
                        <ArrowRight size={18} className="text-gray-400 group-hover:text-[var(--theme-primary-bg)] group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={item.Id || idx}
                  className="group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl border border-gray-100 transition-all duration-300 hover:-translate-y-2 cursor-pointer"
                  onClick={() => handleNavigation(item.Id)}
                >
                  {/* Image */}
                  <div className="relative overflow-hidden aspect-square bg-gradient-to-br from-gray-100 to-gray-200">
                    <img
                      src={imageUrl}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Quick View Button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div
                        className="w-14 h-14 bg-white/95 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl transform scale-75 group-hover:scale-100 transition-transform duration-300"
                        onClick={(e) => { e.stopPropagation(); setModalImage(imageUrl); }}
                      >
                        <Eye size={22} className="text-gray-800" />
                      </div>
                    </div>

                    {/* Price Badge */}
                    {price && (
                      <div className="absolute top-4 right-4 px-4 py-2 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg">
                        <span className="font-bold text-[var(--theme-primary-bg)]">${price}</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-[var(--theme-primary-bg)] transition-colors duration-200">
                      {title}
                    </h3>
                    {description && (
                      <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">{description}</p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Image Modal */}
      {modalImage && (
        <div
          className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-50 p-4"
          onClick={() => setModalImage(null)}
        >
          <button
            onClick={() => setModalImage(null)}
            className="absolute top-6 right-6 text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-all hover:rotate-90"
          >
            <X size={24} />
          </button>
          <img
            src={modalImage}
            alt="Preview"
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
