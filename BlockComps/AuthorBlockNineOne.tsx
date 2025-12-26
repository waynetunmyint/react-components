import React, { useState, useCallback } from "react";
import { IMAGE_URL } from "../../../config";
import { ArrowRight, Users, BookOpen } from "lucide-react";
import BlockHeader from "../HelperComps/BlockHeader";

interface Props {
  dataSource: string;
  headingTitle?: string | null;
  subHeadingTitle?: string | null;
  items?: any[];
  loading?: boolean;
  error?: string | null;
}

export default function AuthorBlockNineOne({
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
    return thumbnail ? `${IMAGE_URL}/uploads/${thumbnail}` : "https://via.placeholder.com/400x400?text=Author";
  }, []);

  const getGridClass = () => {
    switch (viewMode) {
      case "grid": return "grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6";
      case "largeGrid": return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";
      default: return "grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6";
    }
  };

  const handleNavigation = useCallback((id: string | number) => {
    if (dataSource && id) window.location.href = `/${dataSource}/view/${id}`;
  }, [dataSource]);

  const Skeleton = () => (
    <div className="flex flex-col items-center animate-pulse">
      <div className="w-full aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-full" />
      <div className="mt-3 h-4 bg-gray-200 rounded-full w-3/4" />
      <div className="mt-1 h-3 bg-gray-100 rounded-full w-1/2" />
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
          headingTitle={headingTitle || "Authors"}
          subHeadingTitle={subHeadingTitle}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          dataSource={dataSource}
          showViewAll={!loading && items.length > 0}
        />

        {/* Grid */}
        <div className={viewMode === "list" ? "flex flex-col gap-3" : `grid ${getGridClass()} gap-6`}>
          {loading ? (
            Array.from({ length: 6 }).map((_, idx) => <Skeleton key={idx} />)
          ) : items.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-5">
                <Users size={32} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No authors yet</h3>
              <p className="text-gray-500">Authors will appear here once added.</p>
            </div>
          ) : (
            items.map((item, idx) => {
              const imageUrl = getImageUrl(item.Thumbnail);
              const title = item.Title || "Untitled";
              const count = item.Count || item.Total || item.BookCount || 0;

              if (viewMode === "list") {
                return (
                  <div
                    key={item.Id || idx}
                    onClick={() => handleNavigation(item.Id)}
                    className="group flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm hover:shadow-lg border border-gray-100 transition-all cursor-pointer"
                  >
                    <img src={imageUrl} alt={title} className="w-16 h-16 rounded-full object-cover ring-2 ring-gray-100" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 line-clamp-1 group-hover:text-[var(--theme-primary-bg)] transition-colors">{title}</h3>
                      {count > 0 && (
                        <p className="text-gray-500 text-sm flex items-center gap-1">
                          <BookOpen size={14} /> {count} {count === 1 ? 'book' : 'books'}
                        </p>
                      )}
                    </div>
                    <ArrowRight size={18} className="text-gray-400 group-hover:text-[var(--theme-primary-bg)] transition-colors" />
                  </div>
                );
              }

              return (
                <div
                  key={item.Id || idx}
                  onClick={() => handleNavigation(item.Id)}
                  className="group flex flex-col items-center cursor-pointer"
                >
                  {/* Avatar */}
                  <div className="relative w-full aspect-square mb-3">
                    <div className="absolute -inset-1 bg-gradient-to-br from-[var(--theme-primary-bg)] to-[var(--theme-accent)] rounded-full opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-300" />
                    <img
                      src={imageUrl}
                      alt={title}
                      className="relative w-full h-full object-cover rounded-full ring-4 ring-white shadow-lg group-hover:scale-105 transition-transform duration-300"
                    />
                    {count > 0 && (
                      <div className="absolute -bottom-1 -right-1 px-2 py-1 bg-gradient-to-r from-[var(--theme-primary-bg)] to-[var(--theme-accent)] text-white text-xs font-bold rounded-full shadow-lg">
                        {count}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="text-center px-1">
                    <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-[var(--theme-primary-bg)] transition-colors">{title}</h3>
                    {count > 0 && (
                      <p className="text-xs text-gray-500 mt-0.5">{count} {count === 1 ? 'book' : 'books'}</p>
                    )}
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
