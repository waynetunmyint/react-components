"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, Package } from "lucide-react";
import { IMAGE_URL, PAGE_ID } from "@/config";
import BlockOne from "../BlockComps/BlockOne";

interface Props {
  item: any;
}

export const BrandViewTwo: React.FC<Props> = ({ item }) => {
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
            <Package size={40} strokeWidth={1.5} />
          </div>
          <h3 id="page-empty-title">Brand Not Found</h3>
          <p id="page-empty-message" className="mb-6">
            The brand you're looking for doesn't exist or has been removed.
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
      <div className="max-w-7xl mx-auto px-4 py-8 mt-20">

        {/* Hero Section with Gradient Background */}
        <div className="relative overflow-hidden rounded-2xl mb-8 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50"></div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 p-8 lg:p-12">

            {/* Brand Logo/Image */}
            <div className="flex-shrink-0">
              <div className="relative w-48 h-48 lg:w-56 lg:h-56 rounded-2xl overflow-hidden shadow-xl bg-white">
                {imageUrl && !imageError ? (
                  <img
                    src={imageUrl}
                    alt={title}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    <Package size={64} strokeWidth={1.5} className="text-gray-400" />
                    <p className="mt-3 text-sm font-medium text-gray-500">No Image</p>
                  </div>
                )}
              </div>
            </div>

            {/* Brand Info */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full mb-4">
                BRAND
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold mb-4" id="page-heading-title-color">
                {title}
              </h1>

              {/* Description */}
              {description && (() => {
                const lines = description.split("\n");
                const hasMore = lines.length > 3;
                const shown = expandDescription ? lines : lines.slice(0, 3);

                return (
                  <div className="max-w-3xl">
                    <p
                      id="page-heading-subtitle-color"
                      className="text-lg leading-relaxed whitespace-pre-wrap"
                    >
                      {shown.join("\n")}
                    </p>

                    {hasMore && (
                      <button
                        onClick={() => setExpandDescription(!expandDescription)}
                        className="inline-flex items-center gap-2 mt-4 px-4 py-2 text-sm font-medium bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-all shadow-sm"
                      >
                        {expandDescription ? (
                          <>
                            <ChevronDown size={18} className="rotate-180 transition-transform" />
                            Show Less
                          </>
                        ) : (
                          <>
                            <ChevronDown size={18} className="transition-transform" />
                            Read More
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

        {/* Products Grid Section */}
        <div className="mt-12">
          <BlockOne
            headingTitle="Products under this brand"
            customAPI={`/product/api/byPageId/byBrandId/${PAGE_ID}/${item.Id}`}
            dataSource="product"
          />
        </div>
      </div>
    </div>
  );
};