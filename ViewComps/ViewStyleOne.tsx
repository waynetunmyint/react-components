"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Calendar, ImageIcon, ExternalLink } from "lucide-react";
import { BASE_URL, IMAGE_URL, PAGE_ID } from "../../../config";
import { handleOpenLink, normalizeUrl } from "../HelperComps/TextCaseComp";

const SkeletonLoader = () => (
  <div className="animate-pulse bg-white">
    {/* Hero Skeleton */}
    <div className="w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 aspect-[16/9] md:aspect-[21/9]"></div>

    {/* Content Skeleton */}
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
      <div className="space-y-6">
        {/* Title */}
        <div className="space-y-3">
          <div className="h-10 bg-gray-300 rounded-lg w-3/4"></div>
          <div className="h-10 bg-gray-300 rounded-lg w-1/2"></div>
        </div>

        {/* Meta info */}
        <div className="flex gap-3">
          <div className="h-8 bg-gray-200 rounded-full w-32"></div>
          <div className="h-8 bg-gray-200 rounded-full w-28"></div>
        </div>

        {/* Links */}
        <div className="flex gap-2">
          <div className="h-10 bg-gray-200 rounded-full w-24"></div>
          <div className="h-10 bg-gray-200 rounded-full w-28"></div>
        </div>

        {/* Content */}
        <div className="space-y-3 pt-4">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-11/12"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-10/12"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-9/12"></div>
        </div>
      </div>
    </div>
  </div>
);

interface Props {
  dataSource: string;
  id: string;

}

const ViewStyleOne: React.FC<Props> = ({ dataSource, id }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<boolean>(false);

  const fetchData = useCallback(async () => {

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${BASE_URL}/${dataSource}/api/${id}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      const result = await response.json();

      // Handle array or single object response
      const item = Array.isArray(result) ? result[0] : result;
      setData(item);
      console.log("Fetched data:", item);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error fetching data";
      console.error(message, err);
      setError(message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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


  const getYouTubeEmbedUrl = (url: string | undefined) => {
    if (!url) return null;

    // Extract video ID from various YouTube URL formats
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }

    // If already an embed URL, return as is
    if (url.includes('/embed/')) {
      return url;
    }

    return null;
  };

  const renderLinkButton = (url: string | undefined, label: string, icon?: React.ReactNode) => {
    if (!url || url === "null" || url === "-" || url.trim() === "") return null;

    const linkStyles: Record<string, string> = {
      Website: "text-white hover:opacity-90 border-transparent hover:shadow-lg",
      Facebook: "bg-[#1877F2] text-white hover:bg-[#0C63D4] border-[#1877F2] hover:shadow-lg hover:shadow-blue-200",
      Android: "bg-[#3DDC84] text-gray-900 hover:bg-[#2CC970] border-[#3DDC84] hover:shadow-lg hover:shadow-green-200",
      iOS: "bg-gray-900 text-white hover:bg-black border-gray-900 hover:shadow-lg hover:shadow-gray-300",
    };

    return (
      <button
        onClick={() => handleOpenLink(url)}
        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 transition-all duration-200 text-sm font-semibold hover:scale-105 active:scale-95 ${linkStyles[label] || "bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-300 hover:shadow-lg"}`}
        style={label === 'Website' ? { backgroundColor: 'var(--theme-primary-bg, #5FA310)' } : undefined}
      >
        {icon || <ExternalLink size={16} />}
        {label}
      </button>
    );
  };

  if (loading) {
    return <SkeletonLoader />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-red-50 border-2 border-red-200 rounded-xl p-8 text-center shadow-lg">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-red-900 font-bold text-xl mb-2">Unable to Load Content</h3>
          <p className="text-red-700 text-sm">{error}</p>
          <button
            onClick={fetchData}
            className="mt-6 px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 ">
        <div className="max-w-md w-full text-center animate-in fade-in zoom-in-95 duration-500">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ImageIcon size={48} className="text-gray-400" strokeWidth={1.5} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Content Not Found</h3>
          <p className="text-gray-600 mb-6">The content you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2.5 text-white rounded-lg hover:opacity-90 transition-colors font-medium"
            style={{ backgroundColor: 'var(--theme-primary-bg, #5FA310)' }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const imageUrl = getImageUrl(data.Thumbnail);
  const title = data.Title || "Untitled";
  const description = data.Description || "";
  const createdDate = formatDate(data.CreatedAt || data.CreatedDate || data.Date);
  const viewCount = data.ViewCount;
  const youtubeEmbedUrl = getYouTubeEmbedUrl(data?.YoutubeVideoLink);

  return (
    <div className="min-h-screen bg-white mt-20">
      {/* Hero Section with Image */}
      <div className="relative w-full aspect-[16/9] md:aspect-[21/9] bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 overflow-hidden">
        {
          youtubeEmbedUrl ? (

            <iframe
              className="w-full h-full"
              src={youtubeEmbedUrl}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>

          ) : imageUrl && !imageError ? (
            <>
              <img
                src={imageUrl}
                alt={title}
                className="w-full h-full object-cover opacity-90"
                onError={() => setImageError(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-white/40">
              <ImageIcon size={96} strokeWidth={1} />
              <p className="mt-4 text-lg font-medium">No Image Available</p>
            </div>
          )}
      </div>

      {/* Main Content Container */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Title Section */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
            {title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
            {createdDate && (
              <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
                <Calendar size={18} className="text-gray-500" />
                <span className="font-medium">{createdDate}</span>
              </div>
            )}

            {viewCount !== undefined && viewCount > 0 && (
              <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="font-medium">{viewCount.toLocaleString()} views</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {(data?.WebsiteURL || data?.FacebookURL || data?.AndroidURL || data?.AppleURL) && (
            <div className="flex flex-wrap gap-3 pb-6 border-b border-gray-200">
              {renderLinkButton(data?.WebsiteURL, "Website")}
              {renderLinkButton(data?.FacebookURL, "Facebook")}
              {renderLinkButton(data?.AndroidURL, "Android")}
              {renderLinkButton(data?.AppleURL, "iOS")}
            </div>
          )}
        </header>

        {/* Article Content */}
        {description && (
          <article className="prose prose-lg max-w-none">
            <div className="text-gray-800 leading-relaxed text-base md:text-lg whitespace-pre-wrap">
              {description}
            </div>
          </article>
        )}
      </div>
    </div>
  );
};

export default ViewStyleOne;
