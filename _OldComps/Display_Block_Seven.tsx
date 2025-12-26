import React, { useEffect, useState, useCallback } from "react";
import { Eye, ImageIcon } from "lucide-react";
import { APP_TEXT_COLOR, APP_TEXT_SECONDARY_COLOR, BASE_URL, IMAGE_URL } from "../../config";

interface Props {
  dataSource: string;
  headingTitle?: string | null;
  subHeadingTitle?: string | null;
}

export default function DisplayBlockSeven({ dataSource, headingTitle, subHeadingTitle }: Props) {
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
    <div className="py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {(headingTitle || subHeadingTitle) && (
          <div className="mb-6 text-center">
            {headingTitle && <h3 className={` text-2xl md:text-3xl font-bold`}>{headingTitle}</h3>}
            {subHeadingTitle && <p className={`text-sm md:text-base max-w-3xl mx-auto mt-2`}>{subHeadingTitle}</p>}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow animate-pulse" />
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
                <article key={id} className="relative bg-white rounded-2xl overflow-hidden shadow hover:shadow-md transition">
                  <div className="relative h-44 overflow-hidden bg-gray-100">
                    {imageUrl ? (
                      <img src={imageUrl} alt={title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={36} /></div>
                    )}
                    <div className="absolute top-3 left-3 bg-white/90 px-3 py-1 rounded-full text-xs font-semibold">Featured</div>
                  </div>

                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">{title}</h4>
                    <p className="text-sm text-gray-600 line-clamp-3 mb-3">{desc}</p>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div />
                      {viewCount > 0 && (
                        <div className="flex items-center gap-1">
                          <Eye size={14} />
                          <span>{viewCount.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
