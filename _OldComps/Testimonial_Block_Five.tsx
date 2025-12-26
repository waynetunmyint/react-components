import React, { useEffect, useState, useCallback } from "react";
import { Star, Quote } from "lucide-react";
import { APP_TEXT_COLOR, APP_TEXT_SECONDARY_COLOR, BASE_URL, IMAGE_URL } from "../../config";

interface Props {
  dataSource: string;
  headingTitle?: string | null;
  subHeadingTitle?: string | null;
}

export default function TestimonialBlockFive({ dataSource, headingTitle, subHeadingTitle }: Props) {
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
      if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
      const result = await response.json();
      setItems(Array.isArray(result) ? result : []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error fetching data";
      console.error(message, err);
      setError(message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [dataSource]);

  useEffect(() => { void getData(); }, [getData]);

  const getImageUrl = useCallback((thumbnail?: string) => {
    return thumbnail ? `${IMAGE_URL}/uploads/${thumbnail}` : null;
  }, []);

  const renderStars = (rating: number) => {
    const stars = [];
    const valid = Math.max(0, Math.min(5, rating || 0));
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star key={i} size={16} className={`${i <= valid ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"} transition-colors`} />
      );
    }
    return stars;
  };

  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className={`py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {headingTitle && (
          <div className="mb-6 text-center">
            <h3 className={` text-2xl md:text-3xl font-bold`}>{headingTitle}</h3>
            {subHeadingTitle && <p className={`text-sm md:text-base max-w-3xl mx-auto mt-2`}>{subHeadingTitle}</p>}
          </div>
        )}

        <div className="divide-y bg-white rounded-lg overflow-hidden shadow-sm">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4 flex items-center gap-4 animate-pulse">
                <div className="w-16 h-16 rounded-full bg-gray-100" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-100 w-1/2 rounded mb-2" />
                  <div className="h-3 bg-gray-100 w-2/3 rounded" />
                </div>
              </div>
            ))
          ) : items.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No testimonials</div>
          ) : (
            items.map((item, idx) => {
              const imageUrl = getImageUrl(item.Thumbnail);
              const personName = item.PersonName || item.Name || "Anonymous";
              const job = item.PersonJobTitle || "";
              const desc = item.Description || "";
              const stars = item.StarCount || 0;

              return (
                <div key={item.Id || idx} className="p-4 flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                    {imageUrl ? (
                      <img src={imageUrl} alt={personName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300"><Quote size={20} /></div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">{personName}</h4>
                        {job && <p className="text-sm text-gray-600">{job}</p>}
                      </div>
                      <div className="flex items-center gap-1">{renderStars(stars)}</div>
                    </div>

                    <p className="text-sm text-gray-700 mt-3 leading-relaxed line-clamp-4">{desc}</p>
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
