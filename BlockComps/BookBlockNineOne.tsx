import React, { useState, useCallback } from "react";
import { IMAGE_URL } from "../../../config";
import { LayoutGrid, List, ArrowRight, BookOpen, Eye } from "lucide-react";
import { formatPrice, priceFormatter } from "../HelperComps/TextCaseComp";
import BlockHeader from "../BlockComps/BlockHeader";

interface Props {
  dataSource: string;
  headingTitle?: string | null;
  subHeadingTitle?: string | null;
  items?: any[];
  loading?: boolean;
  error?: string | null;
}

export default function BookBlockNineOne({
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

  const getImageUrl = useCallback((thumbnail: string | undefined) => {
    return thumbnail ? `${IMAGE_URL}/uploads/${thumbnail}` : "https://via.placeholder.com/400x600?text=Book";
  }, []);

  const handleNavigation = useCallback((id: string | number) => {
    if (dataSource && id) window.location.href = `/${dataSource}/view/${id}`;
  }, [dataSource]);

  const getGridClass = () => {
    switch (viewMode) {
      case "grid": return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5";
      case "largeGrid": return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";
      default: return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5";
    }
  };

  const Skeleton = () => (
    <div className="bg-white rounded-2xl overflow-hidden animate-pulse shadow-sm">
      <div className="w-full aspect-[3/4] bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="h-5 bg-gray-200 rounded w-1/3" />
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
          headingTitle={headingTitle || "Books"}
          subHeadingTitle={subHeadingTitle}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          dataSource={dataSource}
          showViewAll={!loading && items.length > 0}
        />

        {/* Grid */}
        <div className={viewMode === "list" ? "flex flex-col gap-4" : `grid ${getGridClass()} gap-5`}>
          {loading ? (
            Array.from({ length: 5 }).map((_, idx) => <Skeleton key={idx} />)
          ) : items.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl">
              <div className="w-20 h-20 bg-gray-200 rounded-3xl flex items-center justify-center mb-5">
                <BookOpen size={32} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No books yet</h3>
              <p className="text-gray-500">Books will appear here once added.</p>
            </div>
          ) : (
            items.map((item, idx) => {
              const imageUrl = getImageUrl(item.Thumbnail);
              const title = item.Title || "Untitled";
              const author = item.BookAuthorTitle || item.Author || "";
              const price = item.Price;

              if (viewMode === "list") {
                return (
                  <div
                    key={item.Id || idx}
                    onClick={() => handleNavigation(item.Id)}
                    className="group flex gap-4 bg-white rounded-2xl p-4 shadow-sm hover:shadow-lg border border-gray-100 transition-all cursor-pointer"
                  >
                    <div className="w-24 h-32 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0">
                      <img src={imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-2 group-hover:text-[var(--theme-primary-bg)] transition-colors">{title}</h3>
                      {author && <p className="text-gray-500 text-sm mb-2">By {author}</p>}
                      {price && (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[rgba(var(--theme-primary-bg-rgb),0.1)] border border-[rgba(var(--theme-primary-bg-rgb),0.2)] rounded-full w-fit">
                          <span className="text-[var(--theme-primary-bg)] font-bold">{priceFormatter(price)}</span>
                        </div>
                      )}
                    </div>
                    <ArrowRight size={20} className="text-gray-400 group-hover:text-[var(--theme-primary-bg)] group-hover:translate-x-1 transition-all self-center" />
                  </div>
                );
              }

              return (
                <div
                  key={item.Id || idx}
                  onClick={() => handleNavigation(item.Id)}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl border border-gray-100 transition-all duration-300 hover:-translate-y-2 cursor-pointer"
                >
                  {/* Book Cover */}
                  <div className="relative overflow-hidden aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200">
                    <img
                      src={imageUrl}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Quick View */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                      <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
                        <Eye size={20} className="text-gray-800" />
                      </div>
                    </div>

                    {/* Price Badge */}
                    {price && (
                      <div className="absolute top-3 right-3 px-3 py-1.5 bg-[var(--theme-primary-bg)] text-white text-sm font-bold rounded-lg shadow-lg">
                        {formatPrice(price)}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 line-clamp-2 mb-1 group-hover:text-[var(--theme-primary-bg)] transition-colors">{title}</h3>
                    {author && <p className="text-[var(--theme-primary-bg)] text-sm font-medium">{author}</p>}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
