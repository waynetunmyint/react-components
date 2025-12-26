import React, { useEffect, useState, useCallback } from "react";
import { Eye, ImageIcon } from "lucide-react";
import { APP_TEXT_COLOR, APP_TEXT_SECONDARY_COLOR, BASE_URL, IMAGE_URL } from "../../config";

interface Props {
  dataSource: string;
  headingTitle?: string | null;
  subHeadingTitle?: string | null;
}

export default function DisplayBlockEight({ dataSource, headingTitle, subHeadingTitle}: Props) {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
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

  const getImageUrl = useCallback((thumb?: string) => thumb ? `${IMAGE_URL}/uploads/${thumb}` : null, []);

  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className={`py-6 px-4`}>
      <div className="max-w-7xl mx-auto">
        {(headingTitle || subHeadingTitle) && (
          <div className="mb-6 text-center">
            {headingTitle && <h3 className={` text-2xl md:text-3xl font-bold`}>{headingTitle}</h3>}
            {subHeadingTitle && <p className={`text-sm md:text-base max-w-3xl mx-auto mt-2`}>{subHeadingTitle}</p>}
          </div>
        )}

        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-white rounded-lg shadow animate-pulse" />
            ))
          ) : items.length === 0 ? (
            <div className="py-20 text-center text-gray-500">No items</div>
          ) : (
            items.map((it, idx) => {
              const getField = (k: string) => {
                const v = it?.[k];
                return v === undefined || v === null ? undefined : String(v);
              };

              const imageUrl = getImageUrl(getField("Thumbnail"));
              const title = getField("Title") || "Untitled";
              const desc = getField("Description") || "";
              const viewCount = Number(getField("ViewCount") || 0);
              const id = getField("Id") || String(idx);

              return (
                <div key={id} className="flex items-start gap-4 p-3 bg-white rounded-lg shadow hover:shadow-md transition">
                  <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                    {imageUrl ? <img src={imageUrl} alt={title} className="w-full h-full object-cover" /> : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={20} /></div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900 line-clamp-1">{title}</h4>
                      {viewCount > 0 && (
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Eye size={14} /> {viewCount.toLocaleString()}
                        </div>
                      )}
                    </div>
                    {desc && <p className="text-sm text-gray-600 line-clamp-2">{desc}</p>}
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
