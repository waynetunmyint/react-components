import React, { useState, useCallback } from "react";
import { List, LayoutGrid, Package, ArrowRight } from "lucide-react";
import { IMAGE_URL } from "@/config";
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

export default function BookBlockOne({
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
    return thumbnail
      ? `${IMAGE_URL}/uploads/${thumbnail}`
      : "https://via.placeholder.com/400x300?text=No+Image";
  }, []);

  const handleNavigation = useCallback(
    (id: string | number) => {
      if (dataSource && id) {
        window.location.href = `/${dataSource}/view/${id}`;
      }
    },
    [dataSource]
  );

  const getGridClass = () => {
    switch (viewMode) {
      case "grid":
        return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";
      case "largeGrid":
        return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
      default:
        return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";
    }
  };

  const Skeleton = () => (
    <div className="card-page rounded-2xl shadow-sm overflow-hidden animate-pulse">
      <div className="w-full aspect-[4/3] bg-[var(--bg2)]" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-[var(--bg3)] rounded w-3/4" />
        <div className="h-3 bg-[var(--bg2)] rounded w-2/3" />
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-[var(--r2)]">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div id="page-block-book" className="py-8 px-4 bg-page">
      <div className="max-w-7xl mx-auto">
        <BlockHeader
          headingTitle={headingTitle}
          subHeadingTitle={subHeadingTitle}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          dataSource={dataSource}
          showViewAll={!loading && items.length > 0}
        />

        <div className={viewMode === "list" ? "flex flex-col gap-4 md:gap-5" : `grid ${getGridClass()} gap-4 md:gap-5`}>
          {loading ? (
            Array.from({ length: 4 }).map((_, idx) => <Skeleton key={idx} />)
          ) : items.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-24">
              <h3 className="text-xl font-semibold text-page">No items found</h3>
            </div>
          ) : (
            items.map((item, idx) => {
              const imageUrl = getImageUrl(item.Thumbnail);
              const title = item.Title || "Untitled";
              const description = item.Description || "No description available";
              const bookAuthorTitle = item.BookAuthorTitle || item.Author || "";

              if (viewMode === "list") {
                return (
                  <div
                    key={item.Id || idx}
                    onClick={() => handleNavigation(item.Id)}
                    className="group flex gap-4 bg-[var(--bg1)] rounded-2xl p-4 shadow-sm hover:shadow-md border border-[var(--bg2)] transition-all cursor-pointer"
                  >
                    <div className="w-32 h-32 rounded-xl overflow-hidden flex-shrink-0">
                      <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h3 className="font-semibold text-[var(--t3)] line-clamp-1 group-hover:text-[var(--a2)]">{title}</h3>
                      {bookAuthorTitle && <p className="text-[var(--t2)] text-sm">By {bookAuthorTitle}</p>}
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={item.Id || idx}
                  onClick={() => handleNavigation(item.Id)}
                  className="bg-[var(--bg1)] rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group flex flex-col"
                >
                  <div className="aspect-square bg-[var(--bg2)] overflow-hidden">
                    <img src={imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="p-3 text-center">
                    <h3 className="text-sm font-medium text-[var(--t3)] line-clamp-1 group-hover:text-[var(--a2)]">{title}</h3>
                    {bookAuthorTitle && <p className="text-xs text-[var(--t2)] line-clamp-1 mt-1">{bookAuthorTitle}</p>}
                    {item.Price && (
                      <p className="text-xs font-bold text-[var(--a2)] mt-2">
                        {priceFormatter(item.Price)}
                      </p>
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
