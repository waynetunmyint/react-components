"use client";
import React, { useState, useEffect } from "react";
import { Calendar, ImageIcon, ExternalLink } from "lucide-react";
import { formatDate, getImageUrl, getYouTubeEmbedUrl, handleOpenLink, normalizeUrl } from "../HelperComps/TextCaseComp";
import { IMAGE_URL, PAGE_TYPE } from "../../../config";

interface Item {
  Thumbnail?: string;
  CoverThumbnail?: string;
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
  PageId?: string;
  [key: string]: unknown;
}

interface Props {
  item?: Item | null;
}

export function DetailViewOne({ item }: Props) {
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
      <div className="min-h-screen bg-[var(--ion-background-color,#0d0d21)] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-4xl mx-auto space-y-12">
          {/* Hero Skeleton */}
          <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-[40px] overflow-hidden bg-[#161633] border border-[#222244] animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent blur-3xl animate-pulse" />
          </div>

          <div className="max-w-3xl space-y-8">
            {/* Title Skeleton */}
            <div className="space-y-4">
              <div className="h-12 bg-[#161633] rounded-2xl w-3/4 animate-pulse border border-[#222244]" />
              <div className="h-12 bg-[#161633] rounded-2xl w-1/2 animate-pulse border border-[#222244]" />
            </div>

            {/* Action Buttons Skeleton */}
            <div className="flex gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 w-32 bg-[#161633] rounded-xl animate-pulse border border-[#222244]" />
              ))}
            </div>

            {/* Description Skeleton */}
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-4 bg-[var(--ion-color-step-150,#161633)]/60 rounded-full w-full animate-pulse" />
              ))}
              <div className="h-4 bg-[var(--ion-color-step-150,#161633)]/60 rounded-full w-2/3 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }





  const renderLinkButton = (url: string | undefined, label: string, icon?: React.ReactNode) => {
    if (!url || url === "null" || url === "-" || url.trim() === "") return null;

    const linkStyles: Record<string, string> = {
      Website: "bg-[var(--accent-500)] text-[#090918] hover:shadow-[0_0_20px_rgba(255,204,51,0.2)]",
      Facebook: "bg-blue-600/10 text-blue-400 border-blue-500/20 hover:bg-blue-600/20",
      Android: "bg-green-600/10 text-green-400 border-green-500/20 hover:bg-green-600/20",
      iOS: "bg-white/10 text-white border-white/10 hover:bg-white/20",
    };

    return (
      <button
        onClick={() => handleOpenLink(url)}
        className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl border transition-all duration-300 text-sm font-black uppercase tracking-wider active:scale-95 group ${linkStyles[label] || "bg-[var(--ion-color-step-100,#161633)] text-[var(--ion-color-step-400,#a0a0c0)] border-[var(--ion-color-step-200,#222244)] hover:border-[var(--accent-500)] hover:text-white"}`}
      >
        {icon || <ExternalLink size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />}
        {label}
      </button>
    );
  };

  // Handle item not found / redirection
  if (!item) {
    const dataSource = window.location.pathname.split('/').filter(Boolean)[0] || '';

    setTimeout(() => {
      window.location.href = `/${dataSource}`;
    }, 1500);

    return (
      <div className="min-h-screen bg-[var(--ion-background-color,#0d0d21)] flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 mx-auto relative">
            <div className="absolute inset-0 rounded-full border-4 border-[var(--ion-color-step-100,#161633)]"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-[var(--accent-500)] animate-spin"></div>
          </div>
          <p className="text-[var(--ion-color-step-400,#a0a0c0)] text-sm font-black uppercase tracking-[0.2em] animate-pulse">Redirecting to gallery...</p>
        </div>
      </div>
    );
  }

  // Now that item is guaranteed to be not null, we can access its properties directly.
  const imageUrl = getImageUrl(item.Thumbnail);
  const coverImageURL = getImageUrl(item.CoverThumbnail);
  const title = item.Title || "Untitled";
  const description = item.Description || "";
  const youtubeEmbedUrl = getYouTubeEmbedUrl(item.YoutubeVideoLink);

  // Check if thumbnail should be shown (not null/undefined and not "logo.png")
  const showThumbnail = item.Thumbnail && item.Thumbnail !== "logo.png" && (youtubeEmbedUrl || !imageError);
  const isMinimal = !showThumbnail && !description;

  return (
    <div className="bg-[var(--bg-100,#0d0d21)]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20 relative overflow-hidden">
        {/* Background Mesh */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-[var(--accent-500)]/5 via-transparent to-transparent -z-10 blur-3xl" />

        <div className={`flex flex-col ${showThumbnail ? 'lg:flex-row gap-12 lg:gap-20' : ''} ${isMinimal ? 'items-center justify-center' : 'items-start'}`}>
          {/* Media Section */}
          {showThumbnail && (
            <div className="w-full lg:w-1/2 flex-shrink-0 sticky top-24">
              <div className="group relative bg-[var(--ion-color-step-100,#161633)] rounded-[40px] overflow-hidden border border-[var(--ion-color-step-200,#222244)] shadow-2xl transition-all duration-700 hover:border-[var(--accent-500)]/30">
                {youtubeEmbedUrl ? (
                  <div className="aspect-video relative z-10">
                    <iframe
                      className="w-full h-full"
                      src={youtubeEmbedUrl}
                      title="YouTube video player"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    ></iframe>
                  </div>
                ) : imageUrl && !imageError ? (
                  <div className="relative aspect-[4/5] sm:aspect-square lg:aspect-[4/5] overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={title}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                      onError={() => setImageError(true)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--ion-background-color,#0d0d21)] via-transparent to-transparent opacity-60" />
                  </div>
                ) : null}

                {/* Accent Decor */}
                <div className="absolute -bottom-1 -left-1 -right-1 h-32 bg-gradient-to-t from-[var(--ion-color-step-100,#161633)] to-transparent z-20 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Content Section */}
          <div className={`flex-1 w-full space-y-10 py-4 ${isMinimal ? 'text-center max-w-2xl' : ''}`}>
            {PAGE_TYPE === "standalone" && item?.PageThumbnail && (
              <div
                className={`group inline-flex items-center gap-4 px-5 py-3 bg-[var(--ion-color-step-100,#161633)] rounded-[24px] border border-[var(--ion-color-step-200,#222244)] hover:border-[var(--accent-500)]/40 transition-all cursor-pointer ${isMinimal ? 'mx-auto' : ''}`}
                onClick={() => window.location.href = "/page/view/" + item?.PageId}
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden shadow-[0_0_20px_var(--accent-500)] border border-[var(--ion-color-step-200,#222244)] group-hover:scale-110 transition-transform">
                  <img
                    src={IMAGE_URL + "/uploads/" + item?.PageThumbnail}
                    alt={item?.PageTitle || "Source"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className={`flex flex-col ${isMinimal ? 'text-center' : 'text-left'}`}>
                  <span className="text-[10px] font-black text-[var(--accent-500)] uppercase tracking-widest opacity-60 inline-block mb-0.5">Publisher</span>
                  <h2 className="font-black text-white text-base group-hover:text-[var(--accent-500)] transition-colors">
                    {item.PageTitle}
                  </h2>
                </div>
              </div>
            )}

            <header className="space-y-12">
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight">
                {title}
                <span className={`block w-24 h-2.5 bg-[var(--accent-500)] mt-8 rounded-full shadow-[0_0_20px_rgba(255,204,51,0.3)] ${isMinimal ? 'mx-auto' : ''}`} />
              </h1>

              {(item?.WebsiteURL || item?.FacebookURL || item?.AndroidURL || item?.AppleURL) && (
                <div className={`flex flex-wrap gap-4 ${isMinimal ? 'justify-center' : ''}`}>
                  {renderLinkButton(item?.WebsiteURL, "Website")}
                  {renderLinkButton(item?.FacebookURL, "Facebook")}
                  {renderLinkButton(item?.AndroidURL, "Android")}
                  {renderLinkButton(item?.AppleURL, "iOS")}
                </div>
              )}
            </header>

            {description && (
              <article className="relative">
                <div className="absolute -left-8 top-0 bottom-0 w-1.5 bg-[var(--ion-color-step-100,#161633)] rounded-full overflow-hidden">
                  <div className="w-full h-1/4 bg-[var(--accent-500)] shadow-[0_0_20px_var(--accent-500)]" />
                </div>
                <div className="text-[var(--ion-color-step-400,#a0a0c0)] leading-[1.8] text-xl font-medium whitespace-pre-wrap pl-4 selection:bg-[var(--accent-500)] selection:text-[var(--ion-background-color,#090918)]">
                  {description}
                </div>
              </article>
            )}
          </div>
        </div>

        {!isMinimal && coverImageURL && (
          <div className="mt-24 group relative rounded-[48px] overflow-hidden border border-[var(--ion-color-step-200,#222244)] shadow-2xl transition-all duration-700 hover:border-[var(--accent-500)]/30">
            <img
              src={coverImageURL}
              alt={`${title} cover`}
              className="w-full object-cover transition-transform duration-1000 group-hover:scale-105"
              onError={() => setImageError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--ion-background-color,#0d0d21)] via-transparent to-transparent opacity-60" />
          </div>
        )}
      </div>
    </div>
  );
}
