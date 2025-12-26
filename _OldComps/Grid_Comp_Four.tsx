export { default } from './Display_Block_Four';
import React, { useEffect, useState, useCallback } from "react";
import { BASE_URL, IMAGE_URL } from "../../config";
import { Calendar, Eye, ImageIcon } from "lucide-react";

interface Props {
  dataSource: string;
  headingTitle?: string | null;
  subHeadingTitle?: string | null;
  className?: string;
}
export default function GridCompFour({ dataSource, headingTitle, subHeadingTitle, className }: Props) {
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
    <div className={`py-8 px-4 ${className ?? ""}`}>
      <div className="max-w-7xl mx-auto">
        {headingTitle && (
          <div className="mb-6 text-center">
            <h3 className="text-2xl font-bold">{headingTitle}</h3>
            {subHeadingTitle && <p className="text-sm text-gray-500 max-w-3xl mx-auto mt-3">{subHeadingTitle}</p>}
          </div>
        )}

        <div className="divide-y bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4 flex items-center gap-4 animate-pulse">
                <div className="w-24 h-16 bg-gray-100 rounded-md" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-100 w-1/2 rounded mb-2" />
                  <div className="h-3 bg-gray-100 w-2/3 rounded" />
                </div>
              </div>
            ))
          ) : items.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No items</div>
          ) : (
            items.map((item, idx) => {
              const imageUrl = getImageUrl(item.Thumbnail);
              const title = item.Title || "Untitled";
              const desc = item.Description || "";
              const created = item.CreatedAt || item.CreatedDate || item.Date;
              const viewCount = Number(item.ViewCount || 0);

              return (
                <div key={item.Id || idx} className="p-4 flex items-start gap-4">
                  <div className="w-28 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                    {imageUrl ? (
                      <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={28} /></div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900">{title}</h4>
                      <div className="text-xs text-gray-500 flex items-center gap-2"><Calendar size={14} /><span>{String(created)}</span></div>
                    </div>

                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{desc}</p>

                    {viewCount > 0 && (
                      <div className="mt-3 text-xs text-gray-500 flex items-center gap-2">
                        <Eye size={14} />
                        <span>{viewCount.toLocaleString()}</span>
                      </div>
                    )}
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
