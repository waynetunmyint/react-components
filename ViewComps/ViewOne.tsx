"use client";
import React, { useState, useEffect } from "react";
import { Calendar, ImageIcon, ExternalLink } from "lucide-react";
import { formatDate, getImageUrl, getYouTubeEmbedUrl, handleOpenLink, normalizeUrl } from "../HelperComps/TextCaseComp";
import { IMAGE_URL, PAGE_TYPE } from "../../../config";

interface Item {
  Thumbnail?: string;
  Title?: string;
  Description?: string;
  CreatedAt?: string;
  CreatedDate?: string;
  Date?: string;
  ViewCount?: number;
  YoutubeVideoLink?: string;
  WebsiteURL?: string;
  FacebookURL?: string;
  AndroidURL?: string;
  AppleURL?: string;
  PageThumbnail?: string;
  PageTitle?: string;
  [key: string]: unknown;
}

interface Props {
  item?: Item | null;
}

export function ViewOne({ item }: Props) {
  const [imageError, setImageError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (item) {
      setIsLoading(false);
      return;
    }
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, [item]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-2xl mx-auto">
          <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden mb-8">
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer" />
          </div>
          <div className="space-y-6">
            <div className="h-10 bg-gray-200 rounded w-3/4 mx-auto mb-2 animate-pulse" />
            <div className="flex flex-wrap gap-4 justify-center mb-4">
              <div className="h-6 w-32 bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-6 w-32 bg-gray-200 rounded-lg animate-pulse" />
            </div>
            <div className="h-4 bg-gray-200 rounded w-full mx-auto mb-2 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-5/6 mx-auto mb-2 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto mb-2 animate-pulse" />
          </div>
        </div>
        <style>{`
          @keyframes shimmer {
            0% { background-position: -1000px 0; }
            100% { background-position: 1000px 0; }
          }
          .animate-shimmer {
            background-size: 200% 100%;
            animation: shimmer 1.8s linear infinite;
          }
        `}</style>
      </div>
    );
  }





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

  // If no item, show loading and redirect to list
  if (!item) {
    // Extract dataSource from URL (e.g., "/article/view/123" -> "article")
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    const dataSource = pathParts[0] || '';

    // Redirect after short delay
    setTimeout(() => {
      window.location.href = `/${dataSource}`;
    }, 1500);

    return (
      <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full text-center">
          {/* Loading Spinner */}
          <div className="w-16 h-16 mx-auto mb-6 relative">
            <div className="absolute inset-0 rounded-full border-4 border-gray-100"></div>
            <div
              className="absolute inset-0 rounded-full border-4 border-t-transparent animate-spin"
              style={{ borderColor: 'var(--theme-primary-bg, #F97316)', borderTopColor: 'transparent' }}
            ></div>
          </div>
          <p className="text-gray-500 text-sm">Redirecting...</p>
        </div>
      </div>
    );
  }

  const imageUrl = getImageUrl(item.Thumbnail as string | undefined);
  const coverImageURL = getImageUrl(item.CoverThumbnail as string | undefined);
  const title = item.Title || "Untitled";
  const description = item.Description || "";
  const createdDate = formatDate(item.CreatedAt || item.CreatedDate || item.Date);
  const viewCount = item.ViewCount as number | undefined;
  const youtubeEmbedUrl = getYouTubeEmbedUrl(item?.YoutubeVideoLink as string | undefined);

  // Check if thumbnail should be shown (not null/undefined and not "logo.png")
  const showThumbnail = item.Thumbnail && item.Thumbnail !== "logo.png" && (youtubeEmbedUrl || !imageError);

  return (
    <div className=" mt-10">
      {/* Main Content Container - Side by Side Layout */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className={`flex flex-col ${showThumbnail ? 'md:flex-row gap-8 md:gap-12' : ''}`}>
          {/* Left Side - Thumbnail (only show if valid thumbnail exists) */}
          {showThumbnail && (
            <div className="w-full md:w-2/5 flex-shrink-0">
              <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 overflow-hidden rounded-2xl shadow-xl">
                {youtubeEmbedUrl ? (
                  <iframe
                    className="w-full aspect-video"
                    src={youtubeEmbedUrl}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  ></iframe>
                ) : imageUrl && !imageError ? (
                  <img
                    src={imageUrl}
                    alt={title}
                    className="w-full h-auto"
                    onError={() => setImageError(true)}
                  />
                ) : null}
              </div>
            </div>
          )}


          {/* Right Side - Title, Description, etc. */}
          <div className="flex-1 flex flex-col">

            {
              PAGE_TYPE == "standalone" && (
                item?.PageThumbnail && (
                  <div className="flex items-center gap-3 mb-6" onClick={() => window.location.href = "/page/view/" + item?.PageId}>
                    <img
                      src={IMAGE_URL + "/uploads/" + item?.PageThumbnail}
                      alt={item?.PageTitle || "Page Thumbnail"}
                      className="w-12 h-12 rounded-full object-cover border border-gray-100 shadow-sm"
                    />
                    <div className="flex flex-col">
                      {item?.PageTitle && (
                        <h2 className="font-semibold text-gray-900 text-base leading-tight">
                          {item.PageTitle}
                        </h2>
                      )}
                      {item?.ViewCount !== undefined && (
                        <span className="text-xs text-gray-500 font-medium mt-0.5">
                          {item.ViewCount.toLocaleString()} views
                        </span>
                      )}
                    </div>
                  </div>
                ))}


            {/* Title Section */}
            <header className="mb-6">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-4">
                {title}
              </h1>




              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-4">
                {/* {createdDate && (
                  <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg">
                    <Calendar size={16} className="text-gray-500" />
                    <span className="font-medium">{createdDate}</span>
                  </div>
                )} */}


              </div>

              {/* Action Buttons */}
              {(item?.WebsiteURL || item?.FacebookURL || item?.AndroidURL || item?.AppleURL) && (
                <div className="flex flex-wrap gap-2 pb-4 border-b border-gray-200">
                  {renderLinkButton(item?.WebsiteURL as string | undefined, "Website")}
                  {renderLinkButton(item?.FacebookURL as string | undefined, "Facebook")}
                  {renderLinkButton(item?.AndroidURL as string | undefined, "Android")}
                  {renderLinkButton(item?.AppleURL as string | undefined, "iOS")}
                </div>
              )}
            </header>

            {/* Article Content */}
            {description && (
              <article className="prose prose-lg max-w-none flex-1">
                <div className="text-gray-800 leading-relaxed text-base whitespace-pre-wrap">
                  {description}
                </div>
              </article>
            )}
          </div>


        </div>
        {
          coverImageURL && (
            <div className="mt-10">
              <img
                src={coverImageURL}
                alt={title}
                className="w-full rounded-sm"
                onError={() => setImageError(true)}
              />
            </div>
          )
        }

      </div>
    </div>
  );
};


