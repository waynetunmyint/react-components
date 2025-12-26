import React, { useState } from "react";
import { LayoutGrid, List } from "lucide-react";
import { BASE_URL, IMAGE_URL, PAGE_ID, PAGE_TYPE } from "../../../config";
import { CommonOne } from "./CommonOne";
import { useCachedPaginatedFetch } from "../_hooks/useCachedPaginatedFetch";


// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface item extends Record<string, any> {
  Id?: string;
  id?: string;
  Title?: string;
  BrandName?: string;
  Thumbnail?: string;
  Description?: string;
  CreatedAt?: string;
}

interface Props {
  dataSource: string;
  idField?: string;
  itemsPerPage?: number;
  headingTitle?: string;
  subHeadingTitle?: string;
  styleNo?: number;
  displayType?: string;
}

export default function MainCMS({
  dataSource,
  idField = "Id",
  itemsPerPage = 12,
  headingTitle,
  subHeadingTitle,
  styleNo = 1, // eslint-disable-line @typescript-eslint/no-unused-vars
  displayType = "normal",
}: Props) {
  const [viewMode, setViewMode] = useState<"list" | "medium" | "large">("medium");
  // ensure parameter is considered used to avoid unused var lint warnings
  void displayType;

  // Build base URL for pagination (page number will be appended)
  // const baseUrl = dataSource
  //   ? `${BASE_URL}/${dataSource}/api/byPageId/byPage/${PAGE_ID}`
  //   : null;

  // Hook appends page number automatically, e.g. /1, /2, etc.
  const url = dataSource
    ? (PAGE_TYPE === "standalone"
      ? `${BASE_URL}/${dataSource}/api/byPage/isInteresting`
      : `${BASE_URL}/${dataSource}/api/byPageId/byPage/${PAGE_ID}`)
    : null;

  // Use cached paginated fetch with stale-while-revalidate pattern
  // Shows cached data instantly, then fetches fresh data in background
  const {
    items: displayedItems,
    loading,
    error,
    isFromCache,
    currentPage,
    loadMore: handleLoadMore,
    refresh: getData,
  } = useCachedPaginatedFetch<item>(url, {
    cacheTime: 10 * 60 * 1000, // 10 minutes cache
    itemsPerPage,
  });

  // Optional: Log cache status for debugging
  if (isFromCache) {
    console.log(`[MainCMS] Showing cached data for ${dataSource}, fetching fresh data...`);
  }


  // Reduce motion for users who prefer less animation
  const prefersReducedMotion = typeof window !== "undefined" &&
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const getImageUrl = (thumbnail: string | undefined) =>
    thumbnail ? `${IMAGE_URL}/uploads/${thumbnail}` : "https://via.placeholder.com/300x300?text=No+Image";

  const handleItemClick = (item: item) => {
    const id = item[idField] || item.id || item.Id;
    if (dataSource && id) {
      window.location.href = `/${dataSource}/view/${id}`;
    }
  };



  const getGridClass = () => {
    switch (viewMode) {
      case "medium":
        return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
      case "large":
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
      default:
        return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
    }
  };

  const hasMoreItems = true; // Always show Load More since we're fetching from API
  // totalPages removed; indicator uses currentPage directly

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="relative overflow-hidden bg-gradient-to-br from-red-50 via-red-50/50 to-rose-50 border border-red-200 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="absolute top-0 right-0 w-40 h-40 bg-red-100/20 rounded-full blur-3xl" />
          <div className="relative flex items-start gap-4">
            <div className="flex-shrink-0 w-14 h-14 bg-red-500 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-red-900 font-bold text-lg mb-2">Error Loading Data</h3>
              <p className="text-red-700 text-sm">{error}</p>
              <button
                onClick={() => getData()}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-400/30"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="py-8 px-4 bg-page mt-20 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section - Enhanced */}
        {(headingTitle || subHeadingTitle) && (
          <div className="text-center mb-12 px-4 animate-fade-in">
            {headingTitle && (
              <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight text-gray-900">
                {headingTitle}
              </h1>
            )}
            {subHeadingTitle && (
              <p className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed text-gray-600">
                {subHeadingTitle}
              </p>
            )}
          </div>
        )}

        {/* Combined Page indicator and View Switcher */}
        <div className="text-sm mb-8 bg-gradient-to-r from-white via-gray-50/30 to-white backdrop-blur-md rounded-2xl px-6 py-4 shadow-md border border-gray-100/40 transition-all duration-300 hover:shadow-lg" aria-live="polite">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Left: Page info */}
            <span className="inline-flex items-center gap-2.5 font-medium">
              <svg className="w-4 h-4" style={{ color: 'var(--theme-primary-bg)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="text-gray-600">Showing</span>
              <span className="px-2 py-0.5 rounded-md font-bold text-sm" style={{ backgroundColor: 'color-mix(in srgb, var(--theme-primary-bg), transparent 85%)', color: 'var(--theme-primary-bg)' }}>{displayedItems.length}</span>
              <span className="text-gray-600">items</span>
              <span className="w-1.5 h-1.5 bg-gray-300 rounded-full mx-1"></span>
              <span className="text-gray-600">Page</span>
              <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md font-bold text-sm">{currentPage}</span>
              {loading && (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ml-2" style={{ backgroundColor: 'color-mix(in srgb, var(--theme-primary-bg), transparent 90%)', color: 'var(--theme-primary-bg)' }}>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: 'var(--theme-primary-bg)' }}></span>
                    <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: 'var(--theme-primary-bg)' }}></span>
                  </span>
                  Loading…
                </span>
              )}
            </span>

            {/* Right: View Switcher */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 hidden sm:inline">View:</span>
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => setViewMode("list")}
                  aria-label="List view"
                  aria-pressed={viewMode === "list"}
                  className={`p-1.5 rounded-md transition-all duration-200 ${viewMode === "list"
                    ? "text-white"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    }`}
                  style={viewMode === "list" ? { backgroundColor: 'var(--theme-primary-bg)' } : undefined}
                >
                  <List size={16} strokeWidth={viewMode === "list" ? 2.5 : 2} />
                </button>

                <button
                  onClick={() => setViewMode("medium")}
                  aria-label="Medium grid view"
                  aria-pressed={viewMode === "medium"}
                  className={`p-1.5 rounded-md transition-all duration-200 ${viewMode === "medium"
                    ? "text-white"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    }`}
                  style={viewMode === "medium" ? { backgroundColor: 'var(--theme-primary-bg)' } : undefined}
                >
                  <LayoutGrid size={16} strokeWidth={viewMode === "medium" ? 2.5 : 2} />
                </button>

                <button
                  onClick={() => setViewMode("large")}
                  aria-label="Large grid view"
                  aria-pressed={viewMode === "large"}
                  className={`p-1.5 rounded-md transition-all duration-200 ${viewMode === "large"
                    ? "text-white"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    }`}
                  style={viewMode === "large" ? { backgroundColor: 'var(--theme-primary-bg)' } : undefined}
                >
                  <LayoutGrid size={20} strokeWidth={viewMode === "large" ? 2.5 : 2} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          // Enhanced skeleton with staggered animation
          <div className={viewMode === "list" ? "flex flex-col gap-5 px-4" : `grid ${getGridClass()} gap-6 px-4`} aria-hidden aria-label="Loading content">
            {Array.from({ length: itemsPerPage }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl shadow-md overflow-hidden border border-gray-100/50 hover:shadow-lg transition-shadow duration-300"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="aspect-[4/3] bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 relative overflow-hidden">
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                </div>
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg relative overflow-hidden">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                  </div>
                  <div className="h-4 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 rounded-lg w-3/4 relative overflow-hidden">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                  </div>
                  <div className="h-3 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 rounded-lg w-1/2 relative overflow-hidden">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : displayedItems.length === 0 ? (
          <div className="text-center py-32 px-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 mb-8 shadow-inner">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-gray-900 text-2xl font-bold mb-3">No items found</h3>
            <p className="text-gray-500 text-base mb-8 max-w-md mx-auto">We couldn't find any items to display. Try refreshing or check back later.</p>
            <button
              onClick={() => getData()}
              aria-label="Retry fetching items"
              className="inline-flex items-center gap-2.5 px-8 py-4 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus-visible:ring-4 active:scale-[0.98]"
              style={{ backgroundColor: 'var(--theme-primary-bg)' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Enhanced card grid/list with improved interactions */}
            <div className={viewMode === "list" ? "flex flex-col gap-5 px-4 mb-12" : `grid ${getGridClass()} gap-6 px-4 mb-12`}>
              {displayedItems.map((item: item, idx: number) => {
                const label = item.Title || item.BrandName || `Item ${idx + 1}`;

                // LIST VIEW - Enhanced
                if (viewMode === "list") {
                  return (
                    <div
                      key={item.Id || item.id || idx}
                      onClick={() => handleItemClick(item)}
                      role="button"
                      tabIndex={0}
                      aria-label={`View ${label}`}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") handleItemClick(item);
                      }}
                      className="group card-page shadow-md hover:shadow-xl border-page transition-all duration-300 cursor-pointer overflow-hidden hover:scale-[1.01] focus-visible:ring-4 focus-visible:ring-blue-400/30 focus:outline-none"
                    >
                      <div className="flex gap-5">
                        <div className="relative overflow-hidden w-36 h-36 flex-shrink-0 bg-gray-100">
                          <img
                            src={getImageUrl(item.Thumbnail)}
                            alt={label}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            decoding="async"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        <div className="flex-1 flex flex-col gap-2.5 py-3 pr-4">
                          <h3 className="font-bold text-gray-900 text-xl line-clamp-2 transition-colors duration-200 group-hover:text-theme-primary">
                            {label}
                          </h3>
                          {item.CreatedAt && (
                            <div className="flex items-center gap-2 text-gray-500 text-sm">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {new Date(item.CreatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                          )}
                          {item.Description && (
                            <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                              {item.Description}
                            </p>
                          )}
                          <div className="mt-auto flex items-center gap-2 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ color: 'var(--theme-primary-bg)' }}>
                            <span>View details</span>
                            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                // GRID VIEW - Use reusable card component
                return (
                  <CommonOne
                    key={item.Id || item.id || idx}
                    item={item}
                    dataSource={dataSource}
                  />
                );
              })}
            </div>

            {/* Enhanced action buttons with better styling */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-12">
              {hasMoreItems && (
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  aria-label="Load more items"
                  className={`group w-full sm:w-auto px-10 py-4 font-bold text-base rounded-2xl shadow-lg hover:shadow-xl text-white ${prefersReducedMotion ? "" : "transition-all duration-300 ease-out hover:-translate-y-0.5 active:scale-[0.98]"} focus:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3`}
                  style={{
                    backgroundColor: 'var(--theme-primary-bg)',
                    boxShadow: '0 10px 25px -5px color-mix(in srgb, var(--theme-primary-bg), transparent 70%)'
                  }}
                >
                  {loading ? (
                    <>
                      <span className="relative flex h-5 w-5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-5 w-5 bg-white/80"></span>
                      </span>
                      <span>Loading...</span>
                    </>
                  ) : (
                    <>
                      <span>Load More</span>
                      <svg className="w-5 h-5 transition-transform group-hover:translate-y-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </>
                  )}
                </button>
              )}

            </div>
          </>
        )}
      </div>
    </section>
  );
}
