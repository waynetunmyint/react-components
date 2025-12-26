"use client";
import React, { useEffect, useState } from "react";
import { BASE_URL, IMAGE_URL } from "../../../config";
import { Calendar, ImageIcon, ExternalLink } from "lucide-react";

const SkeletonLoader = () => (
  <article className="animate-pulse max-w-4xl mx-auto bg-white rounded-lg shadow-sm overflow-hidden">
    <div className="w-full h-96 bg-gray-200"></div>
    <div className="p-8 md:p-12 space-y-6">
      <div className="h-10 bg-gray-200 rounded w-3/4"></div>
      <div className="flex gap-4">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
    </div>
  </article>
);

interface Props {
  customAPI: string;
}

const ViewCompTwo: React.FC<Props> = ({ customAPI }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<boolean>(false);

  useEffect(() => {
    fetchData();
  }, [customAPI]);

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

      // Handle array or single object response
      const item = Array.isArray(result) ? result[0] : result;
      setData(item);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error fetching data";
      console.error(message, err);
      setError(message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (thumbnail: string | undefined) => {
    return thumbnail ? `${IMAGE_URL}/uploads/${thumbnail}` : null;
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const handleOpenLink = (url: string) => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const renderLinkButton = (url: string | undefined, label: string, icon?: React.ReactNode) => {
    if (!url || url === "null" || url === "-" || url.trim() === "") return null;

    const colorClasses: Record<string, string> = {
      Website: "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200",
      Facebook: "bg-blue-600 text-white hover:bg-blue-700 border-blue-600",
      Android: "bg-green-50 text-green-700 hover:bg-green-100 border-green-200",
      iOS: "bg-gray-800 text-white hover:bg-gray-900 border-gray-800",
    };

    return (
      <button
        onClick={() => handleOpenLink(url)}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all duration-200 text-sm font-medium shadow-sm hover:shadow ${colorClasses[label] || "bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200"}`}
      >
        {icon || <ExternalLink size={16} />}
        {label}
      </button>
    );
  };

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
      <div className="min-h-screen">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-12 text-center">
          <ImageIcon size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Article Not Found</h3>
          <p className="text-gray-500">The article you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  const imageUrl = getImageUrl(data.Thumbnail);
  const title = data.Title || "Untitled";
  const description = data.Description || "";
  const createdDate = formatDate(data.CreatedAt || data.CreatedDate || data.Date);
  const viewCount = data.ViewCount;

  return (
    <div className="min-h-screen">
      {/* Hero Section with Image and Title Overlay */}
      <div className="relative w-full ">
        {imageUrl && !imageError ? (
          <>
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover "
              onError={() => setImageError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 text-gray-400">
            <ImageIcon size={80} strokeWidth={1.5} />
            <p className="mt-4 text-lg">No Image Available</p>
          </div>
        )}

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg">
              {title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/90">
              {createdDate && (
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <Calendar size={16} />
                  <span>{createdDate}</span>
                </div>
              )}

              {viewCount !== undefined && (
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>{viewCount.toLocaleString()} views</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}



      {/* Description at Bottom */}
      {description && (
        <div className="bg-white p-5">
          <div className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
            {description}
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewCompTwo;