"use client";

import React, { useState, useEffect } from "react";
import { ImageIcon, ChevronDown } from "lucide-react";
import { IMAGE_URL, PAGE_ID } from "../../../config";
import BlockOne from "../BlockComps/BlockOne";



interface Props {
  item: any;
}

export const BrandViewOne: React.FC<Props> = ({ item }) => {
  const [imageError, setImageError] = useState(false);
  const [expandDescription, setExpandDescription] = useState(false);
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
      <div id="page-background-light-gray" className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="animate-pulse text-center">
          <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-4"></div>
          <div className="h-6 bg-gray-300 rounded w-40 mx-auto mb-3"></div>
          <div className="h-4 bg-gray-300 rounded w-56 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div id="page-background-light-gray" className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="max-w-sm text-center">
          <div id="page-empty-icon-bg" className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <ImageIcon size={40} strokeWidth={1.5} />
          </div>
          <h3 id="page-empty-title">Author Not Found</h3>
          <p id="page-empty-message" className="mb-6">
            The author you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => window.history.back()}
            className="btn-page px-6 py-3 text-base font-medium rounded-xl transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const getImageUrl = (thumbnail: string | undefined) =>
    thumbnail ? `${IMAGE_URL}/uploads/${thumbnail}` : null;

  const imageUrl = getImageUrl(item.Thumbnail);
  const title = item.Title || "Untitled";
  const description = item.Description || "";

  return (
    <div id="page-background-light-gray" className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6 mt-20">

        <div className="overflow-hidden mb-6">
          <div className="flex flex-col md:flex-row">

            {/* Thumbnail */}
            <div id="page-background-light-gray" className="md:w-1/3 p-6 flex items-start justify-center">
              <div className="w-full max-w-xs">
                <div className="relative w-full aspect-[3/4] overflow-hidden">
                  {imageUrl && !imageError ? (
                    <img
                      src={imageUrl}
                      alt={title}
                      className="w-full object-square"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div id="page-image-placeholder" className="w-full h-full flex flex-col items-center justify-center">
                      <ImageIcon size={56} strokeWidth={1.5} />
                      <p className="mt-3 text-sm font-medium">No Image</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 p-6">
              <h1 id="page-heading-title-color">{title}</h1>

              {/* Description */}
              {description && (() => {
                const lines = description.split("\n");
                const hasMore = lines.length > 5;
                const shown = expandDescription ? lines : lines.slice(0, 5);

                return (
                  <div>
                    <div id="page-heading-subtitle-color" className="whitespace-pre-wrap">
                      {shown.join("\n")}
                    </div>

                    {hasMore && (
                      <button
                        onClick={() => setExpandDescription(!expandDescription)}
                        className="inline-flex items-center gap-1 mt-3 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
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
        <BlockOne
          headingTitle="Products under this brand"
          customAPI={`/product/api/byPageId/byBrandId/${PAGE_ID}/${item.Id}`}
          dataSource="product"
        />
      </div>
    </div>
  );
};
