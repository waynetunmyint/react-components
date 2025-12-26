import React, { useEffect, useState, useCallback } from "react";
import { APP_TEXT_COLOR, APP_TEXT_SECONDARY_COLOR, BASE_URL, IMAGE_URL } from "../../config";

interface Props {
  dataSource: string;
  headingTitle?: string | null;
  subHeadingTitle?: string | null;
}

export default function GridBrandComp({ dataSource, headingTitle, subHeadingTitle }: Props) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gridSize, setGridSize] = useState<"small" | "medium" | "large">("medium");

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
      : "https://via.placeholder.com/300?text=No+Image";
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
        return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5";
      case "large":
        return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4";
      default:
        return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5";
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
    <div className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {(headingTitle || subHeadingTitle) && (
          <div className="text-center mb-16">
            {headingTitle && (
              <h2 className={` text-3xl md:text-5xl font-bold mb-4 tracking-tight`}>
                {headingTitle}
              </h2>
            )}
            {subHeadingTitle && (
              <p className={`text-lg max-w-3xl mx-auto leading-relaxed`}>
                {subHeadingTitle}
              </p>
            )}
          </div>
        )}

        {/* GRID */}
        <div className={`grid ${getGridClass()} gap-8 md:gap-12`}>
          {loading ? (
            Array.from({ length: 15 }).map((_, idx) => (
              <div key={idx} className="flex items-center justify-center p-8 animate-pulse">
                <div className="w-full h-16 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-lg"/>
              </div>
            ))
          ) : items.length === 0 ? (
            <div className="col-span-full text-center py-20 text-gray-500">No brands found.</div>
          ) : (
            items.map((item, idx) => {
              const imageUrl = getImageUrl(item.Thumbnail);
              const title = item.Title || "Brand";

              return (
                <div
                  key={item.Id || idx}
                  className="group relative items-c flex flex-col items-center justify-center cursor-pointer transition-all duration-500 hover:scale-105 active:scale-95"
                  onClick={() => handleNavigation(item.Id)}
                >

                  {/* WHITE CIRCLE */}
                  <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 group-hover:shadow-2xl">
                    <img
                      src={imageUrl}
                      alt={title}
                      className="w-20 h-20 md:w-24 md:h-24 object-contain transition-all duration-300"
                    />
                  </div>

                  {/* TITLE */}
                  <p className="mt-4 text-sm font-medium text-gray-800 opacity-80 group-hover:opacity-100 transition">
                    {title}
                  </p>

                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
