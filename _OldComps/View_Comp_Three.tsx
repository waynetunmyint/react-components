"use client";
import React, { useEffect, useState } from "react";
import { BASE_URL, IMAGE_URL } from "../../config";
import { Calendar, ImageIcon, Eye } from "lucide-react";
import { formatDate } from "./Formatter_Comp";

interface Props {
  customAPI: string;
}

const Skeleton = () => (
  <div className="max-w-4xl mx-auto p-6 animate-pulse">
    <div className="flex gap-4 items-start">
      <div className="w-36 h-24 bg-gray-200 rounded-md" />
      <div className="flex-1 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-200 rounded w-full" />
      </div>
    </div>
  </div>
);

const getImageUrl = (thumbnail: string | undefined) => {
  return thumbnail ? `${IMAGE_URL}/uploads/${thumbnail}` : null;
};

const ViewCompThree: React.FC<Props> = ({ customAPI }) => {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!customAPI) {
        setError("No API endpoint provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${BASE_URL}${customAPI}`);
        if (!res.ok) throw new Error(`${res.status}`);
        const json = await res.json();
        setData(Array.isArray(json) ? json[0] : json);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [customAPI]);

  if (loading) return <Skeleton />;
  if (error) return <div className="max-w-4xl mx-auto p-6 text-red-600">{error}</div>;
  if (!data)
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow-sm text-center">
        <ImageIcon size={48} className="mx-auto text-gray-300 mb-3" />
        <p className="text-gray-600">Article not found</p>
      </div>
    );

  const d = data as Record<string, unknown>;
  const getField = (k: string) => {
    const v = d?.[k];
    return v === undefined || v === null ? undefined : String(v);
  };

  const imageUrl = getImageUrl(getField("Thumbnail"));
  const title = getField("Title") || "Untitled";
  const created = formatDate(getField("CreatedAt") || getField("CreatedDate") || getField("Date"));
  const desc = getField("Description") || "";
  const viewCount = Number(getField("ViewCount") || 0);

  return (
    <article className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-40 w-full bg-gray-50 flex-shrink-0">
          {imageUrl && !imgError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt={String(title)} onError={() => setImgError(true)} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-32 md:h-full flex items-center justify-center text-gray-400">
              <ImageIcon size={36} />
            </div>
          )}
        </div>

        <div className="p-4 md:p-6 flex-1">
          <h2 className="text-lg font-semibold text-gray-900">{String(title)}</h2>
          <div className="mt-2 text-sm text-gray-500 flex items-center gap-2">
            <Calendar size={14} />
            <span>{created}</span>
            {viewCount > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-gray-500 ml-3">
                <Eye size={14} />
                <span>{viewCount.toLocaleString()}</span>
              </span>
            )}
          </div>

          {desc && <p className="mt-3 text-sm text-gray-700 whitespace-pre-wrap">{String(desc)}</p>}
        </div>
      </div>
    </article>
  );
};

export default ViewCompThree;
