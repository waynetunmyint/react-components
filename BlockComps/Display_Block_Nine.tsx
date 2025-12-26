import React, { useState, useCallback } from "react";
import { IMAGE_URL } from "../../../config";
import BlockHeader from "../HelperComps/BlockHeader";

interface GridItem extends Record<string, any> {
  Id?: string;
  id?: string;
  Title?: string;
  BrandName?: string;
  Thumbnail?: string;
}

interface Props {
  dataSource: string;
  headingTitle?: string | null;
  subHeadingTitle?: string | null;
  items?: any[];
  loading?: boolean;
  error?: string | null;
}

export default function DisplayBlockNine({
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

  const getImageUrl = (thumbnail: string | undefined) =>
    thumbnail ? `${IMAGE_URL}/uploads/${thumbnail}` : "https://via.placeholder.com/300x300?text=No+Image";

  const handleItemClick = (item: GridItem) => {
    const id = item.Id || item.id || item.Id;
    if (dataSource && id) {
      window.location.href = `/${dataSource}/view/${id}`;
    }
  };

  const getGridClass = () => {
    switch (viewMode) {
      case "grid": return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
      case "largeGrid": return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
      default: return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
    }
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <section className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <BlockHeader
          headingTitle={headingTitle}
          subHeadingTitle={subHeadingTitle}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          dataSource={dataSource}
          showViewAll={!loading && items.length > 0}
        />

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-3 bg-gray-100 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-600 text-lg">No items found.</p>
          </div>
        ) : (
          <div className={viewMode === "list" ? "flex flex-col gap-4" : `grid ${getGridClass()} gap-4`}>
            {items.map((item: GridItem, idx: number) => {
              const label = item.Title || item.BrandName || `Item ${idx + 1}`;
              const img = getImageUrl(item.Thumbnail);

              if (viewMode === "list") {
                return (
                  <div
                    key={item.Id || item.id || idx}
                    onClick={() => handleItemClick(item)}
                    className="group flex gap-4 bg-white rounded-2xl p-4 shadow-sm hover:shadow-lg border border-gray-100 transition-all cursor-pointer"
                  >
                    <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                      <img src={img} alt={label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h3 className="font-bold text-gray-900 group-hover:text-[var(--theme-primary-bg)] transition-colors">{label}</h3>
                      {item.Description && <p className="text-gray-500 text-sm line-clamp-2 mt-1">{item.Description}</p>}
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={item.Id || item.id || idx}
                  onClick={() => handleItemClick(item)}
                  className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all overflow-hidden cursor-pointer"
                >
                  <div className="relative w-full aspect-[4/3] overflow-hidden">
                    <img src={img} alt={label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="p-4">
                    <h3 className="text-gray-900 font-semibold line-clamp-2 group-hover:text-[var(--theme-primary-bg)] transition-colors">{label}</h3>
                    {item.Description && <p className="text-sm text-gray-600 line-clamp-2 mt-1">{item.Description}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
