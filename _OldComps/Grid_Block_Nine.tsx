import React, { useEffect, useState, useCallback } from "react";
import { LayoutGrid, List } from "lucide-react";
import {  BASE_URL, IMAGE_URL, PAGE_ID } from "../../config";

interface Props {
  dataSource: string;
  headingTitle?: string | null;
  subHeadingTitle?: string | null;
}

export default function GridBlockNine({ dataSource, headingTitle, subHeadingTitle }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "small" | "medium" | "large">("medium");
  const [modalImage, setModalImage] = useState<string | null>(null);

  const getData = useCallback(async () => {
    if (!dataSource) {
      setError("No data source provided");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${BASE_URL}/${dataSource}/api/byPageId/byPage/${PAGE_ID}/1`);

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      const result = await response.json();
      const data = Array.isArray(result) ? result : [];
      setItems(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error fetching data";
      console.error(message, err);
      setError(message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [dataSource]);

  useEffect(() => {
    getData();
  }, [getData]);

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
    if (viewMode === "list") return "flex flex-col";
    switch (viewMode) {
      case "small":
        return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";
      case "medium":
        return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
      case "large":
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
      default:
        return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
    }
  };

  const Skeleton = () => (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
      <div className="w-full aspect-[4/3] bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-2/3" />
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="relative overflow-hidden bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 rounded-2xl p-8 shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-100/30 rounded-full blur-3xl" />
          <div className="relative flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-red-900 font-bold text-lg">Error Loading Data</h3>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-10">
          <h2 className={` text-3xl md:text-4xl font-bold mb-2 leading-tight tracking-tight`}>
            {headingTitle}
          </h2>

          {subHeadingTitle && (
            <p className={`text-sm md:text-base max-w-2xl mx-auto leading-relaxed`}>
              {subHeadingTitle}
            </p>
          )}
        </div>

        {/* Controls Bar - iOS style */}
        <div className="flex items-center justify-between mb-8 bg-white/90 backdrop-blur-md rounded-2xl px-5 py-3.5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-1.5 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-all duration-150 ${
                viewMode === "list"
                  ? "bg-white  shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              title="List view"
              aria-label="List view"
            >
              <List size={18} />
            </button>
            <button
              onClick={() => setViewMode("medium")}
              className={`p-2 rounded-lg transition-all duration-150 ${
                viewMode === "medium"
                  ? "bg-white  shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              title="Medium grid"
              aria-label="Medium grid view"
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode("large")}
              className={`p-2 rounded-lg transition-all duration-150 ${
                viewMode === "large"
                  ? "bg-white  shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              title="Large grid"
              aria-label="Large grid view"
            >
              <LayoutGrid size={22} />
            </button>
          </div>

          {!loading && items.length > 0 && (
            <button
              onClick={() => (window.location.href = `/${dataSource}`)}
              id="page-button"
              aria-label="View all items"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-150 ease-out active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              View All
            </button>
          )}
        </div>

        <div className={viewMode === "list" ? "flex flex-col gap-4 md:gap-5" : `grid ${getGridClass()} gap-4 md:gap-5`}>
          {loading ? (
            viewMode === "list" ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="flex gap-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-200/60 animate-pulse">
                  <div className="w-32 h-32 bg-gray-200 rounded-xl flex-shrink-0" />
                  <div className="flex-1 flex flex-col justify-center gap-3">
                    <div className="h-5 bg-gray-200 rounded-lg w-3/4" />
                    <div className="h-4 bg-gray-200 rounded-lg w-full" />
                    <div className="h-4 bg-gray-200 rounded-lg w-5/6" />
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-gray-200 rounded-full" />
                  </div>
                </div>
              ))
            ) : (
              Array.from({ length: 4 }).map((_, idx) => <Skeleton key={idx} />)
            )
          ) : items.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-24">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-5">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No items found</h3>
              <p className="text-gray-500 text-center text-sm max-w-xs">
                No items are available at the moment.
              </p>
            </div>
          ) : (
            items.map((item, idx) => {
              const imageUrl = getImageUrl(item.Thumbnail);
              const title = item.Title || "Untitled";
              const description = item.Description || "No description available";

              if (viewMode === "list") {
                return (
                  <div
                    key={item.Id || idx}
                    className="group flex gap-4 bg-white rounded-2xl p-4 shadow-sm hover:shadow-md border border-gray-200/60 transition-all duration-200 ease-out cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={() => handleNavigation(item.Id)}
                    role="button"
                    tabIndex={0}
                    aria-label={`View ${title}`}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleNavigation(item.Id); }}
                  >
                    <div
                      className="relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl w-32 h-32 flex-shrink-0 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setModalImage(imageUrl);
                      }}
                    >
                      <img
                        src={imageUrl}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-center min-w-0">
                      <h3 className="font-semibold text-gray-900 text-lg mb-1.5 line-clamp-1 group-hover: transition-colors duration-150">
                        {title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                        {description}
                      </p>
                    </div>

                    <div className="flex items-center text-gray-400 group-hover: transition-colors duration-150">
                      <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-150" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={item.Id || idx}
                  className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg border border-gray-200/60 transition-all duration-200 ease-out hover:-translate-y-1 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  onClick={() => handleNavigation(item.Id)}
                  role="button"
                  tabIndex={0}
                  aria-label={`View ${title}`}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleNavigation(item.Id); }}
                >
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-200 z-10 pointer-events-none" />

                  <div className="relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 aspect-[4/3]">
                    <img
                      src={imageUrl}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-200 ease-out"
                      onClick={(e) => {
                        e.stopPropagation();
                        setModalImage(imageUrl);
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-sm">
                        <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 relative z-20">
                    <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2 group-hover: transition-colors duration-150">
                      {title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed mb-3">
                      {description}
                    </p>

                    <div className="flex items-center gap-2  font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                      <span>View details</span>
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-150" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {modalImage && (
        <div
          className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300"
          onClick={() => setModalImage(null)}
        >
          <button
            onClick={() => setModalImage(null)}
            className="absolute top-6 right-6 text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-all duration-300 hover:rotate-90 shadow-xl backdrop-blur-sm"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="relative">
            <img
              src={modalImage}
              alt="Preview"
              className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-3xl -z-10" />
          </div>
        </div>
      )}


    </div>
  );
}
