import React, { useEffect, useState, useCallback } from "react";
import { Grid3x3, LayoutGrid } from "lucide-react";
import { BASE_URL, IMAGE_URL } from "../../config";

interface Props {
  dataSource: string;
  headingTitle?: string | null;
  subHeadingTitle?: string | null;
}

export default function DisplayBlockOne({ dataSource, headingTitle, subHeadingTitle }: Props) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gridSize, setGridSize] = useState<"small" | "medium" | "large">("medium");
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

      const response = await fetch(`${BASE_URL}/${dataSource}/api`);

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
    switch (gridSize) {
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
    <div className="group relative bg-gradient-to-br from-white to-gray-50 rounded-3xl overflow-hidden shadow-lg border border-gray-200/50 animate-pulse">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      <div className="w-full aspect-video bg-gradient-to-br from-blue-100/50 via-purple-100/50 to-pink-100/50" />
      <div className="p-6 space-y-4">
        <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-xl w-3/4" />
        <div className="space-y-2">
          <div className="h-4 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-lg w-full" />
          <div className="h-4 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-lg w-5/6" />
        </div>
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
        <div className="text-center mb-16 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl -z-10" />

          <h2 className={`text-2xl md:text-3xl font-bold bg-clip-text mb-4 leading-tight`}>
            {headingTitle}
          </h2>

          <p className={`text-sm md:text-base max-w-3xl mx-auto leading-relaxed`}>
            {subHeadingTitle}
          </p>
        </div>

        {/* Controls Bar */}
        <div className="flex items-center justify-between mb-10 bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {loading ? "Loading..." : `${items.length} Items`}
              </p>
              <p className="text-xs text-gray-500">Showing all results</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-gray-100/80 rounded-xl p-1.5 shadow-inner">
            <button
              onClick={() => setGridSize("small")}
              className={`p-2.5 rounded-lg transition-all duration-300 ${
                gridSize === "small"
                  ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg scale-105"
                  : "text-gray-600 hover:bg-white hover:shadow-sm"
              }`}
              title="Small grid"
            >
              <Grid3x3 size={18} />
            </button>
            <button
              onClick={() => setGridSize("medium")}
              className={`p-2.5 rounded-lg transition-all duration-300 ${
                gridSize === "medium"
                  ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg scale-105"
                  : "text-gray-600 hover:bg-white hover:shadow-sm"
              }`}
              title="Medium grid"
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setGridSize("large")}
              className={`p-2.5 rounded-lg transition-all duration-300 ${
                gridSize === "large"
                  ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg scale-105"
                  : "text-gray-600 hover:bg-white hover:shadow-sm"
              }`}
              title="Large grid"
            >
              <LayoutGrid size={22} />
            </button>
          </div>
        </div>

        <div className={`grid ${getGridClass()} gap-8`}>
          {loading ? (
            Array.from({ length: 8 }).map((_, idx) => <Skeleton key={idx} />)
          ) : items.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-32">
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center mb-6 shadow-xl">
                  <svg className="w-16 h-16 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-3xl blur-2xl -z-10" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No items found</h3>
              <p className="text-gray-500 text-center max-w-md">
                No items are available at the moment. Check back soon for new content!
              </p>
            </div>
          ) : (
            items.map((item, idx) => {
              const imageUrl = getImageUrl(item.Thumbnail);
              const title = item.Title || "Untitled";
              const description = item.Description || "No description available";

              return (
                <div
                  key={item.Id || idx}
                  className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl border border-gray-200/50 transition-all duration-500 hover:-translate-y-2 cursor-pointer"
                  onClick={() => handleNavigation(item.Id)}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 transition-all duration-500 z-10 pointer-events-none" />

                  <div className="relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 aspect-video">
                    <img
                      src={imageUrl}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        setModalImage(imageUrl);
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg">
                      <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                  </div>

                  <div className="p-6 relative z-20">
                    <h3 className="font-bold text-gray-900 text-xl mb-3 line-clamp-2 group-hover: transition-colors duration-300">
                      {title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed mb-4">
                      {description}
                    </p>

                    <div className="flex items-center gap-2  font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span>View details</span>
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
