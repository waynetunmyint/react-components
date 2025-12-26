import React, { useEffect, useState, useCallback } from "react";
import { BASE_URL, IMAGE_URL } from "../../config";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface GridItem extends Record<string, any> {
  Id?: string;
  id?: string;
  Title?: string;
  BrandName?: string;
  Thumbnail?: string;
}

interface Props {
  dataSource: string;
  idField?: string;
  itemsPerPage?: number;
  headingTitle?: string;
}

export default function GridScrollMoreComp({
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

      console.log("Calling",`${BASE_URL}/${dataSource}/api/byPage/${pageNo}`);

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
      // Initialize with first page
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

  const getImageUrl = (thumbnail: string | undefined) =>
    thumbnail ? `${IMAGE_URL}/uploads/${thumbnail}` : "https://via.placeholder.com/300x300?text=No+Image";

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

  const handleViewAll = async () => {
    try {
      setLoading(true);
      // Fetch all remaining pages
      let allData: GridItem[] = [...allItems];
      let page = currentPage + 1;
      let hasMore = true;

      while (hasMore) {
        const response = await fetch(`${BASE_URL}/${dataSource}/api/byPage/${page}`);
        if (!response.ok) {
          hasMore = false;
          break;
        }

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

        if (list.length === 0) {
          hasMore = false;
        } else {
          allData = [...allData, ...list];
          page++;
        }
      }

      setAllItems(allData);
      setDisplayedItems(allData);
      setCurrentPage(page - 1);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error loading all items";
      console.error(message, err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const hasMoreItems = true; // Always show Load More since we're fetching from API
  const totalPages = currentPage; // Dynamic based on pagination

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="relative overflow-hidden bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 rounded-2xl p-8 shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-100/30 rounded-full blur-3xl" />
          <div className="relative flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
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
    <section className="py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {headingTitle && <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">{headingTitle}</h2>}
        
        {/* Page indicator */}
        <div className="text-sm text-gray-400 mb-4">
          Showing {displayedItems.length} of {allItems.length} • Page {currentPage} of {totalPages}
        </div>

        {loading ? (
          // Grid skeleton
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: itemsPerPage }).map((_, idx) => (
              <div key={idx} className="aspect-square bg-gray-800 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : displayedItems.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No items found.</div>
        ) : (
          <>
            {/* Grid of items */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              {displayedItems.map((item: GridItem, idx: number) => (
                <div
                  key={item.Id || item.id || idx}
                  onClick={() => handleItemClick(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") handleItemClick(item);
                  }}
                  className="cursor-pointer group"
                >
                  <div className="relative w-full aspect-square rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105">
                    <img
                      src={getImageUrl(item.Thumbnail)}
                      alt={item.Title || item.BrandName || `Item ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 text-white font-semibold transition-opacity duration-300">
                        View Details
                      </span>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-300 truncate group-hover:text-white transition-colors">
                    {item.Title || item.BrandName || `Item ${idx + 1}`}
                  </p>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-center gap-4 py-8">
              {hasMoreItems && (
                <button
                  onClick={handleLoadMore}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg"
                >
                  Load More 
                </button>
              )}

                <button
                  onClick={() => (window.location.href = `/${dataSource}`)}
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg"
                >
                  View All
                </button>


            </div>
          </>
        )}
      </div>
    </section>
  );
}
