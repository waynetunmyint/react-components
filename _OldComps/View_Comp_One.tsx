"use client";
import React, { useEffect, useState } from "react";
import { BASE_URL, IMAGE_URL } from "../../../config";
import { Calendar, Eye, ImageIcon, ExternalLink } from "lucide-react";
import { formatDate } from "./Formatter_Comp";

const SkeletonLoader = () => (
  <div className="min-h-screen bg-white">
    {/* Hero skeleton */}
    <div className="relative w-full h-[52vh] md:h-[60vh] bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 animate-pulse overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
      <div className="absolute left-0 right-0 bottom-6 px-6 md:px-12">
        <div className="h-12 md:h-16 bg-white/20 rounded-lg w-3/4 mb-3 backdrop-blur" />
        <div className="h-4 bg-white/20 rounded w-32 backdrop-blur" />
      </div>
    </div>
    {/* Content skeleton */}
    <article className="w-full max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12 space-y-6 animate-pulse">
      <div className="bg-gray-100 rounded-lg p-6 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-4/5" />
      </div>
      <div className="h-10 bg-gray-200 rounded-full w-32" />
    </article>
  </div>
);

interface Props {
  customAPI: string;
}

const ViewCompOne: React.FC<Props> = ({ customAPI }) => {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<boolean>(false);

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

        const response = await fetch(`${BASE_URL}${customAPI}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
        }

        const result = await response.json();
        const item = Array.isArray(result) ? result[0] : result;
        setData(item as Record<string, unknown>);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error fetching data";
        console.error(message, err);
        setError(message);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [customAPI]);

  const getImageUrl = (thumbnail: string | undefined) => {
    return thumbnail ? `${IMAGE_URL}/uploads/${thumbnail}` : null;
  };



  const renderLinkButton = (url: string | undefined, label: string) => {
    if (!url || url === "null" || url === "-" || String(url).trim() === "") return null;

    return (
      <button
        onClick={() => window.open(String(url), "_blank", "noopener,noreferrer")}
        className="group inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-gray-200 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:border-blue-400 transition-all duration-200 shadow-sm hover:shadow active:scale-95"
        aria-label={`Open ${label}`}
      >
        <ExternalLink size={15} className="group-hover: transition-colors" />
        <span className="whitespace-nowrap">{label}</span>
      </button>
    );
  };


  // Links and additional fields are intentionally omitted so the component
  // only shows Thumbnail, CreatedAt, Title and Description by default.

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <SkeletonLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-red-800 font-semibold text-lg mb-2">Error Loading Article</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 ">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-12 text-center">
          <ImageIcon size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Article Not Found</h3>
          <p className="text-gray-500">The article you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const d = data as Record<string, unknown>;
  const getField = (k: string) => {
    const v = d?.[k];
    return v === undefined || v === null ? undefined : String(v);
  };

  const imageUrl = getImageUrl(getField("Thumbnail"));
  const title = getField("Title") || "Untitled";
  const description = getField("Description") || "";
  const createdDate = formatDate(getField("CreatedAt") || getField("CreatedDate") || getField("Date"));
  const ViewCount = Number(getField("ViewCount") || 0);
  // Only show Thumbnail, CreatedAt, Title, Description by default

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Image with overlay title */}
      <div className="relative w-full h-[55vh] md:h-[65vh] bg-gray-900 overflow-hidden">
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={String(title)}
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100">
            <div className="text-center">
              <ImageIcon size={80} className="text-gray-300 mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-sm text-gray-400 font-medium">No preview available</p>
            </div>
          </div>
        )}

        {/* Enhanced gradient for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

        {/* Overlay content with animation */}
        <div className="absolute left-0 right-0 bottom-0 px-4 sm:px-6 md:px-12 pb-6 md:pb-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 md:gap-6">
            <div className="max-w-3xl text-white">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight drop-shadow-lg mb-2 md:mb-3">
                {String(title)}
              </h1>
              {createdDate && (
                <div className="inline-flex items-center gap-2 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1.5 text-sm text-gray-100">
                  <Calendar size={14} className="opacity-90" />
                  <span>{createdDate}</span>
                </div>
              )}
            </div>

            {ViewCount ? (
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md text-white text-sm rounded-full px-4 py-2 border border-white/20 shadow-lg">
                <Eye size={15} />
                <span className="font-medium">{Number(ViewCount).toLocaleString()}</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>    {/* Content */}
      <article className="w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-10 lg:py-12">
        {/* If no hero image, show title here for balance */}
        {!imageUrl && (
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            {String(title)}
          </h1>
        )}

        {/* Description */}
        {description && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 md:p-7 shadow-sm hover:shadow-md transition-shadow duration-300 text-gray-700 text-base md:text-lg leading-relaxed whitespace-pre-wrap mb-6">
            {String(description)}
          </div>
        )}      {/* Additional details */}
        <div className="space-y-6">
          {/* Additional fields grid */}
          <div className="grid sm:grid-cols-2 gap-4 md:gap-5">
            {Object.entries(data)
              .filter(([key, value]) => {
                if (!value) return false;
                const k = String(key);
                return ![
                  "Id",
                  "Thumbnail",
                  "Title",
                  "Description",
                  "CreatedAt",
                  "CreatedDate",
                  "Date",
                  "ViewCount",
                  "Status",
                ].includes(k) && !k.includes("URL");
              })
              .map(([key, value]) => (
                <div
                  key={key}
                  className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-4 md:p-5 hover:shadow-md hover:border-gray-300 transition-all duration-300"
                >
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <span className="w-1 h-4 bg-blue-500 rounded-full" />
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </h3>
                  <p className="text-gray-800 text-sm md:text-base whitespace-pre-wrap leading-relaxed">
                    {String(value)}
                  </p>
                </div>
              ))}
          </div>


        </div>
      </article>
    </div>
  );
};

export default ViewCompOne;