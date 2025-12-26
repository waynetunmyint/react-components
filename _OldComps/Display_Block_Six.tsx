import React, { useEffect, useState, useCallback } from "react";
import { Calendar, Eye, ImageIcon } from "lucide-react";
import { APP_TEXT_COLOR, APP_TEXT_SECONDARY_COLOR, BASE_URL, IMAGE_URL } from "../../config";
import { formatDate } from "./Formatter_Comp";

interface Props {
  dataSource: string;
  headingTitle?: string | null;
  subHeadingTitle?: string | null;
}

export default function DisplayBlockSix({ dataSource, headingTitle, subHeadingTitle }: Props) {
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
    <section className="py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {(headingTitle || subHeadingTitle) && (
          <div className="mb-6 text-center">
            {headingTitle && <h3 className={` text-2xl md:text-3xl font-bold`}>{headingTitle}</h3>}
            {subHeadingTitle && <p className={`text-sm md:text-base max-w-3xl mx-auto mt-2`}>{subHeadingTitle}</p>}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex gap-4 items-start bg-white rounded-xl shadow p-4 animate-pulse">
                <div className="w-28 h-20 bg-gray-100 rounded-md" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center text-gray-500">No items</div>
        ) : (
          <div className="space-y-4">
            {items.map((it, idx) => {
              const getField = (k: string) => {
                const v = it?.[k];
                return v === undefined || v === null ? undefined : String(v);
              };

              const imageUrl = getImageUrl(getField("Thumbnail"));
              const title = getField("Title") || "Untitled";
              const desc = getField("Description") || "";
              const created = getField("CreatedAt") || getField("CreatedDate") || getField("Date");
              const viewCount = Number(getField("ViewCount") || 0);
              const id = getField("Id") || String(idx);

              return (
                <article key={id} className="flex gap-4 items-start bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition">
                  <div className="w-28 h-20 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                    {imageUrl ? <img src={imageUrl} alt={title} className="w-full h-full object-cover" /> : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={28} /></div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">{title}</h4>
                    <p className="text-sm text-gray-600 line-clamp-3 mb-3">{desc}</p>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        <span>{created ? formatDate(created) : ""}</span>
                      </div>
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
            })}
          </div>
        )}
      </div>
    </section>
  );
}
