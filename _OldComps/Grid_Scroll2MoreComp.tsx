import React, { useEffect, useState, useCallback } from "react";
import { BASE_URL, IMAGE_URL } from "../../config";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface GridItem extends Record<string, any> {
  Id?: string;
  id?: string;
  Title?: string;
  BrandName?: string;
  Thumbnail?: string;
  Description?: string;
  Category?: string;
}

interface Props {
  dataSource: string;
  idField?: string;
  itemsPerPage?: number;
  headingTitle?: string | null;
}

export default function GridScroll2MoreComp({
  dataSource,
  idField = "Id",
  itemsPerPage = 12,
  headingTitle,
}: Props) {
  const [allItems, setAllItems] = useState<GridItem[]>([]);
  const [displayedItems, setDisplayedItems] = useState<GridItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getData = useCallback(async (pageNo: number = 1) => {
    if (!dataSource) {
      setError("No data source provided");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${BASE_URL}/${dataSource}/api/byPage/${pageNo}`);
      if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);

      console.log("Calling", `${BASE_URL}/${dataSource}/api/byPage/${pageNo}`);

      const result = await response.json();
      const list = Array.isArray(result)
        ? result
        : Array.isArray(result?.data)
        ? result.data
        : Array.isArray(result?.items)
        ? result.items
        : Array.isArray(result?.list)
        ? result.list
        : [];

      setAllItems(list);
      setDisplayedItems(list.slice(0, itemsPerPage));
      setCurrentPage(1);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error fetching data";
      console.error(message, err);
      setError(message);
      setAllItems([]);
      setDisplayedItems([]);
    } finally {
      setLoading(false);
    }
  }, [dataSource, itemsPerPage]);

  useEffect(() => {
    getData();
  }, [getData]);

  const handleItemClick = (item: GridItem) => {
    const id = item[idField] || item.id || item.Id;
    if (dataSource && id) {
      window.location.href = `/${dataSource}/view/${id}`;
    }
  };

  const handleLoadMore = async () => {
    const nextPage = currentPage + 1;
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/${dataSource}/api/byPage/${nextPage}`);
      if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);

      const result = await response.json();
      const list = Array.isArray(result)
        ? result
        : Array.isArray(result?.data)
        ? result.data
        : Array.isArray(result?.items)
        ? result.items
        : Array.isArray(result?.list)
        ? result.list
        : [];

      setAllItems((prev) => [...prev, ...list]);
      setDisplayedItems((prev) => [...prev, ...list]);
      setCurrentPage(nextPage);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error loading more items";
      console.error(message, err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl2 = (thumbnail: string | undefined) =>
    thumbnail ? `${IMAGE_URL}/uploads/${thumbnail}` : "https://via.placeholder.com/300x300?text=No+Image";

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="relative overflow-hidden bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-orange-500 rounded-2xl p-8 shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100/30 rounded-full blur-3xl" />
          <div className="relative flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
              </svg>
            </div>
            <div>
              <h3 className="text-orange-900 font-bold text-lg">Error Loading Data</h3>
              <p className="text-orange-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        {headingTitle && (
          <div className="mb-10">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent mb-2">
              {headingTitle}
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-orange-400 to-red-500 rounded-full" />
          </div>
        )}

        {/* Stats Bar */}
        <div className="mb-8 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 backdrop-blur-sm">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-300">
              <span className="font-bold text-white">{displayedItems.length}</span> of{" "}
              <span className="font-bold text-white">{allItems.length}</span> items
            </span>
            <span className="text-gray-400">Page {currentPage}</span>
          </div>
        </div>

        {loading && displayedItems.length === 0 ? (
          // Enhanced skeleton loader
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: itemsPerPage }).map((_, idx) => (
              <div key={idx} className="animate-pulse">
                <div className="aspect-square bg-gray-800 rounded-xl mb-3" />
                <div className="h-4 bg-gray-800 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-800 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : displayedItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg text-gray-400">No items found.</p>
          </div>
        ) : (
          <>
            {/* Masonry-style Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {displayedItems.map((item: GridItem, idx: number) => (
                <button
                  key={item.Id || item.id || idx}
                  onClick={() => handleItemClick(item)}
                  className="group cursor-pointer text-left hover:no-underline"
                >
                  <div className="relative overflow-hidden rounded-xl shadow-xl border border-gray-700/50 transition-all duration-300 hover:shadow-2xl hover:border-orange-500/50 bg-gray-800">
                    {/* Image Container */}
                    <div className="relative w-full aspect-square overflow-hidden bg-gradient-to-br from-gray-700 to-gray-900">
                      <img
                        src={getImageUrl2(item.Thumbnail)}
                        alt={item.Title || item.BrandName || `Item ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Category Badge */}
                      {item.Category && (
                        <div className="absolute top-3 right-3 px-3 py-1 bg-orange-500/90 text-white text-xs font-bold rounded-full backdrop-blur-sm pointer-events-none">
                          {item.Category}
                        </div>
                      )}
                    </div>

                    {/* Content Card */}
                    <div className="p-4 bg-gray-800">
                      <h3 className="font-bold text-white text-sm mb-2 line-clamp-2 group-hover:text-orange-400 transition-colors">
                        {item.Title || item.BrandName || `Item ${idx + 1}`}
                      </h3>

                      {item.Description && (
                        <p className="text-xs text-gray-400 mb-3 line-clamp-2">
                          {item.Description}
                        </p>
                      )}

                      {/* CTA Indicator */}
                      <div className="text-xs text-orange-400 font-bold opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                        View Details →
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Action Section */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-8 border-t border-gray-700/50 pt-12">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    Load More Items
                    <span>↓</span>
                  </>
                )}
              </button>

              <button
                onClick={() => (window.location.href = `/${dataSource}`)}
                className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                Browse All
                <span>→</span>
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
