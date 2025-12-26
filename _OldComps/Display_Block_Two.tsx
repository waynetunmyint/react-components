import React, { useEffect, useState, useCallback } from "react";
import {BASE_URL, IMAGE_URL } from "../../config";
import { Calendar, Eye, ImageIcon } from "lucide-react";
import { formatDate } from "./Formatter_Comp";

interface Props {
  dataSource: string;
  headingTitle?: string | null;
  subHeadingTitle?: string | null;
}

export default function DisplayBlockTwo({ dataSource, headingTitle, subHeadingTitle }: Props) {
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

  const getImageUrl = useCallback((thumbnail?: string) => thumbnail ? `${IMAGE_URL}/uploads/${thumbnail}` : null, []);

  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {headingTitle && (
          <div className="mb-6 text-center">
            <h3 className={`text-2xl md:text-3xl font-bold`}>{headingTitle}</h3>
            {subHeadingTitle && (
              <p className={`text-sm md:text-base max-w-3xl mx-auto mt-3`}>{subHeadingTitle}</p>
            )}
          </div>
        )}

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="break-inside relative bg-white rounded-2xl shadow-sm p-4">
                <div className="w-full h-40 bg-gray-100 rounded-lg mb-3 animate-pulse" />
                <div className="h-4 bg-gray-100 rounded w-3/4 mb-2 animate-pulse" />
                <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse" />
              </div>
            ))
          ) : items.length === 0 ? (
            <div className="col-span-full py-20 text-center text-gray-500">No items</div>
          ) : (
            items.map((item, idx) => {
              const it = item as Record<string, unknown>;
              const getField = (k: string) => {
                const v = it?.[k];
                return v === undefined || v === null ? undefined : String(v);
              };

              const imageUrl = getImageUrl(getField("Thumbnail"));
              const title = getField("Title") || "Untitled";
              const desc = getField("Description") || "";
              const created = getField("CreatedAt") || getField("CreatedDate") || getField("Date");
              const viewCount = Number(getField("ViewCount") || 0);
              const keyId = getField("Id") || String(idx);

              return (
                <article key={keyId} className="break-inside-avoid bg-white rounded-2xl overflow-hidden shadow hover:shadow-md transition">
                  <div className="w-full h-48 bg-gray-100 overflow-hidden">
                    {imageUrl ? (
                      <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <ImageIcon size={36} />
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">{title}</h4>
                    <p className="text-sm text-gray-600 line-clamp-3 mb-3">{desc}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        <span>{formatDate(created)}</span>
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
            })
          )}
        </div>
      </div>
    </div>
  );
}
