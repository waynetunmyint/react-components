import React, { useEffect, useState, useCallback } from "react";
import { BASE_URL, IMAGE_URL } from "../../config";
import { Calendar, Eye, ImageIcon } from "lucide-react";
import { formatDate } from "./Formatter_Comp";

interface Props {
  dataSource: string;
  headingTitle?: string | null;
  subHeadingTitle?: string | null;
}

export default function DisplayBlockThree({ dataSource, headingTitle, subHeadingTitle }: Props) {
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
      const res = await fetch(`${BASE_URL}/${dataSource}/api`);
      if (!res.ok) throw new Error(`${res.status}`);
      const json = await res.json();
      setItems(Array.isArray(json) ? json : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [dataSource]);

  useEffect(() => { void getData(); }, [getData]);

  const getImageUrl = useCallback((thumbnail?: string) => thumbnail ? `${IMAGE_URL}/uploads/${thumbnail}` : null, []);

  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {headingTitle && (
          <div className="mb-6 text-center">
            <h3 className={` text-2xl md:text-3xl font-bold`}>{headingTitle}</h3>
            {subHeadingTitle && <p className={`${"text-sm md:text-base text-gray-500"} max-w-3xl mx-auto mt-3`}>{subHeadingTitle}</p>}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-4 animate-pulse" />
            ))
          ) : items.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">No items</div>
          ) : (
            items.map((item, idx) => {
              const imageUrl = getImageUrl(item.Thumbnail);
              const title = item.Title || "Untitled";
              const desc = item.Description || "";
              const created = item.CreatedAt || item.CreatedDate || item.Date;
              const viewCount = Number(item.ViewCount || 0);

              return (
                <div key={item.Id || idx} className="bg-white rounded-xl shadow hover:shadow-md transition overflow-hidden">
                  <div className="flex gap-3 p-4 items-start">
                    <div className="w-1/3  bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                      {imageUrl ? (
                        <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={28} /></div>
                      )}
                    </div>

                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">{title}</h4>
                      <p className="text-sm text-gray-600 line-clamp-3">{desc}</p>

                      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-2"><Calendar size={14} /><span>{formatDate(created)}</span></div>
                        {viewCount > 0 && (
                          <div className="flex items-center gap-1"><Eye size={14} /><span>{viewCount.toLocaleString()}</span></div>
                        )}
                      </div>
                    </div>
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
