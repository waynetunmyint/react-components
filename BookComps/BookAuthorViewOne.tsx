"use client";

import React, { useState, useEffect } from "react";
import { ImageIcon, ChevronDown } from "lucide-react";
import { IMAGE_URL, PAGE_ID } from "@/config";
// import BookBlockNineOne from "./BookBlockNineOne"; // Missing
import BookBlockOne from "./BookBlockOne"; // Fixed path
import { getImageUrl } from "../HelperComps/TextCaseComp";
import CommonOne from "../BlockComps/CommonOne";


interface Props {
  item: any;
}

export const BookAuthorViewOne: React.FC<Props> = ({ item }) => {
  const [imageError, setImageError] = useState(false);
  const [expandDescription, setExpandDescription] = useState(false);
  const [isLoading, setIsLoading] = useState(true);


  console.log("Item data", item);

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
      <div className="min-h-screen bg-[var(--bg-100)] flex items-center justify-center py-12 px-4">
        <div className="animate-pulse text-center">
          <div className="w-20 h-20 bg-[var(--bg-300)] rounded-full mx-auto mb-4"></div>
          <div className="h-6 bg-[var(--bg-300)] rounded w-40 mx-auto mb-3"></div>
          <div className="h-4 bg-[var(--bg-300)] rounded w-56 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-[var(--bg-100)] flex items-center justify-center py-12 px-4">
        <div className="max-w-sm text-center">
          <div className="w-20 h-20 rounded-full bg-[var(--bg-200)] flex items-center justify-center mx-auto mb-4 text-[var(--text-muted)]">
            <ImageIcon size={40} strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-bold text-[var(--text-primary)]">Author Not Found</h3>
          <p className="text-[var(--text-muted)] mb-6 text-sm">
            The author you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 text-base font-medium rounded-xl transition-colors text-white hover:opacity-90"
            style={{ backgroundColor: 'var(--accent-600)' }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const imageUrl = getImageUrl(item.Thumbnail);
  const title = item.Title || "Untitled";
  const description = item.Description || "";

  return (
    <div className="min-h-screen bg-[var(--bg-100)]">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 mt-10 md:mt-20">

        <div className="overflow-hidden mb-12">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">

            {/* Thumbnail */}
            <div className="w-full md:w-1/3 flex justify-center">
              <div className="w-full max-w-[280px] md:max-w-xs">
                <div className="relative w-full aspect-[3/4] overflow-hidden rounded-2xl shadow-xl border border-[var(--bg-300)]">
                  {imageUrl && !imageError ? (
                    <img
                      src={imageUrl}
                      alt={title}
                      className="w-full h-full object-cover"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="w-full h-full bg-[var(--bg-200)] flex flex-col items-center justify-center text-[var(--text-muted)]">
                      <ImageIcon size={56} strokeWidth={1.5} />
                      <p className="mt-3 text-sm font-medium">No Image</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 w-full text-center md:text-left">
              <h1 className="text-[var(--text-primary)] text-3xl md:text-4xl font-black mb-6 tracking-tight leading-tight">{title}</h1>
              {/* Description */}
              {description && (() => {
                const lines = description.split("\n");
                const hasMore = lines.length > 5;
                const shown = expandDescription ? lines : lines.slice(0, 5);

                return (
                  <div className="relative">
                    <div className="whitespace-pre-wrap text-[var(--text-muted)] text-lg leading-relaxed font-medium">
                      {shown.join("\n")}
                    </div>

                    {hasMore && (
                      <button
                        onClick={() => setExpandDescription(!expandDescription)}
                        className="inline-flex items-center gap-1 mt-4 px-4 py-2 text-sm font-bold rounded-xl transition-all hover:bg-[var(--bg-200)] border border-[var(--bg-300)]"
                        style={{ color: 'var(--accent-600)' }}
                      >
                        {expandDescription ? (
                          <>
                            <ChevronDown size={16} className="rotate-180" />
                            Show Less
                          </>
                        ) : (
                          <>
                            <ChevronDown size={16} />
                            View More
                          </>
                        )}
                      </button>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Books by author */}
        <div className="border-t border-[var(--bg-300)] pt-12">
          <CommonOne
            headingTitle="Books by this Author"
            customAPI={`/book/api/byPageId/byBookAuthorId/${PAGE_ID}/${item.Id}`}
            dataSource="book"
          />
        </div>
      </div>
    </div>
  );
};
