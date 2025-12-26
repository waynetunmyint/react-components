import React, { useEffect, useState, useCallback } from "react";
import { Star, Quote } from "lucide-react";
import { APP_TEXT_COLOR, APP_TEXT_SECONDARY_COLOR, BASE_URL, IMAGE_URL } from "../../config";


interface Props {
  dataSource: string;
  headingTitle?: string | null;
  subHeadingTitle?: string | null;
  className?: string;
}
export default function GridCompFive({ dataSource, headingTitle, subHeadingTitle, className }: Props) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      : "https://via.placeholder.com/100x100?text=User";
  }, []);

  const renderStars = (rating: number) => {
    const stars = [];
    const validRating = Math.max(0, Math.min(5, rating || 0));

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={18}
          className={`${i <= validRating
            ? "fill-yellow-400 text-yellow-400"
            : "fill-gray-200 text-gray-200"
            } transition-colors`}
        />
      );
    }
    return stars;
  };

  const Skeleton = () => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-32" />
          <div className="h-3 bg-gray-100 rounded w-24" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-5/6" />
        <div className="h-3 bg-gray-100 rounded w-4/6" />
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6 shadow-sm">
          <h3 className="font-bold text-red-800">Error Loading Data</h3>
          <p className="text-red-600 mt-1 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`py-12 bg-gray-50 ${className || ""}`}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        {(headingTitle || subHeadingTitle) && (
          <div className="text-center mb-12">
            {headingTitle && (
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{headingTitle}</h2>
            )}
            {subHeadingTitle && (
              <p className="text-gray-600 max-w-2xl mx-auto">{subHeadingTitle}</p>
            )}
          </div>
        )}

        {/* Grid Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            Array(3).fill(0).map((_, i) => <Skeleton key={i} />)
          ) : items.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-2xl shadow-sm">
              No testimonials found
            </div>
          ) : (
            items.map((item: any, index: number) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 relative"
              >
                <Quote
                  size={40}
                  className="absolute top-6 right-6 text-gray-100"
                />

                {/* Rating */}
                <div className="flex gap-1 mb-6">
                  {renderStars(item.Rating || 5)}
                </div>

                {/* Content */}
                <p className="text-gray-600 mb-6 leading-relaxed relative z-10">
                  "{item.Description || item.Review || "No review content"}"
                </p>

                {/* User Info */}
                <div className="flex items-center gap-4">
                  <img
                    src={getImageUrl(item.Thumbnail || item.Image)}
                    alt={item.Title || item.Name || "User"}
                    className="w-12 h-12 rounded-full object-cover bg-gray-100"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://via.placeholder.com/100x100?text=User";
                    }}
                  />
                  <div>
                    <h4 className="font-bold text-gray-900">
                      {item.Title || item.Name || "Anonymous"}
                    </h4>
                    {item.Position && (
                      <p className="text-sm text-gray-500">{item.Position}</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}