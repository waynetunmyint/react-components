import React, { useEffect, useRef, useState, useCallback } from "react";
import { BASE_URL, IMAGE_URL } from "../../config";

interface Props {
  dataSource: string;
  idField?: string;
  rowSize?: number; // number of items per row
  headingTitle?: string;

}

export default function BrandVerticalScrollComp({
  dataSource,
  idField = "Id",
  rowSize = 6,
  headingTitle,
}: Props) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ref for the single row
  const rowRef = useRef<HTMLDivElement | null>(null);

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

      setItems(list);
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

  const getImageUrl = (thumbnail: string | undefined) =>
    thumbnail ? `${IMAGE_URL}/uploads/${thumbnail}` : "https://via.placeholder.com/300x300?text=No+Image";

  // single row (all items in one horizontal carousel)
  const rows = [items];

  const scrollRow = (_rowIndex: number, direction: "left" | "right") => {
    const el = rowRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.9; // scroll almost full width
    el.scrollBy({ left: direction === "right" ? amount : -amount, behavior: "smooth" });
  };

  const handleItemClick = (item: any) => {
    const id = item[idField] || item.id || item.Id;
    if (dataSource && id) {
      window.location.href = `/${dataSource}/view/${id}`;
    }
  };

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
        

        {loading ? (
          // vertical skeleton: a few rows with horizontal placeholders
          Array.from({ length: 3 }).map((_, rIdx) => (
            <div key={rIdx} className="mb-8">
              <div className="h-6 w-40 bg-gray-700 rounded mb-4 animate-pulse" />
              <div className="flex gap-4 overflow-hidden">
                {Array.from({ length: rowSize }).map((_, idx) => (
                  <div key={idx} className="w-40 h-40 bg-gray-800 rounded-lg animate-pulse" />
                ))}
              </div>
            </div>
          ))
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No items found.</div>
        ) : (
          // render rows
          rows.map((rowItems, rowIndex) => (
            <div key={rowIndex} className="mb-8">
              <div className="flex items-center justify-between mb-3">
                {headingTitle && <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">{headingTitle}</h2>}
                <div className="hidden md:flex items-center gap-2">
                  <button
                    aria-label={`Scroll row ${rowIndex + 1} left`}
                    onClick={() => scrollRow(rowIndex, "left")}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
                  >
                    ‹
                  </button>
                  <button
                    aria-label={`Scroll row ${rowIndex + 1} right`}
                    onClick={() => scrollRow(rowIndex, "right")}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
                  >
                    ›
                  </button>
                </div>
              </div>

              <div
                ref={(el) => { rowRef.current = el; }}
                className="flex gap-4 overflow-x-auto no-scrollbar py-2"
                style={{ scrollBehavior: "smooth" }}
              >
                {rowItems.map((it: any, idx: number) => (
                  <div
                    key={it.Id || it.id || idx}
                    onClick={() => handleItemClick(it)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") handleItemClick(it);
                    }}
                    className="min-w-[160px] md:min-w-[200px] lg:min-w-[220px] flex-shrink-0 cursor-pointer"
                  >
                    <div className="w-full h-40 md:h-44 lg:h-52 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden shadow-lg">
                      <img
                        src={getImageUrl(it.Thumbnail)}
                        alt={it.Title || it.BrandName || `Item ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
