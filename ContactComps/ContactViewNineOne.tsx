"use client";
import React, { useEffect, useState } from "react";
import { MapPin, Phone, Mail, Clock, Globe, Eye, ExternalLink } from "lucide-react";
import { BASE_URL, PAGE_ID } from "../../../config";

const SkeletonLoader = () => (
  <div className="animate-pulse max-w-4xl mx-auto mt-20">
    <div id="page-card-white" className="rounded-2xl shadow-sm overflow-hidden">
      <div className="h-80 bg-gradient-to-br from-gray-200 to-gray-300 rounded-t-2xl"></div>
      <div className="p-6 md:p-8 space-y-6">
        <div id="page-skeleton-bg" className="h-8 rounded-xl w-2/3"></div>
        <div className="space-y-3">
          <div id="page-skeleton-bg-light" className="h-4 rounded-lg w-full"></div>
          <div id="page-skeleton-bg-light" className="h-4 rounded-lg w-5/6"></div>
          <div id="page-skeleton-bg-light" className="h-4 rounded-lg w-4/6"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div id="page-skeleton-bg" className="h-24 rounded-xl"></div>
          <div id="page-skeleton-bg" className="h-24 rounded-xl"></div>
          <div id="page-skeleton-bg" className="h-24 rounded-xl"></div>
          <div id="page-skeleton-bg" className="h-24 rounded-xl"></div>
        </div>
      </div>
    </div>
  </div>
);



export const ContactViewNineOne: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {


    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${BASE_URL}/contactInfo/api/byPageId/${PAGE_ID}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      const result = await response.json();
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

  if (loading) {
    return (
      <div className="py-8 px-4">
        <SkeletonLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 px-4">
        <div className="max-w-4xl mx-auto mt-20">
          <div id="page-error-container" className="rounded-2xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div id="page-error-icon-bg" className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
              <div>
                <h3 id="page-error-title">Error Loading Contact Information</h3>
                <p id="page-error-message" className="mt-1">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-8 px-4">
        <div className="max-w-4xl mx-auto mt-20">
          <div id="page-card-white" className="rounded-2xl shadow-sm p-12 text-center">
            <div id="page-empty-icon-bg" className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MapPin size={32} className="text-gray-400" />
            </div>
            <h3 id="page-empty-title">Contact Information Not Found</h3>
            <p id="page-empty-message" className="mt-2">The contact information you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  const title = data.Title || "Contact Us";
  const description = data.Description || "";
  const googleMapCode = data.GoogleMapCode;

  return (
    <div className="py-8 px-4 mt-30">
      <div className="max-w-4xl mx-auto mt-20">
        <div id="page-card-white" className="rounded-2xl shadow-sm overflow-hidden">
          {/* Google Map Section */}
          {googleMapCode && (
            <div className="relative h-80 overflow-hidden rounded-t-2xl">
              <div
                className="w-full h-full"
                dangerouslySetInnerHTML={{ __html: googleMapCode }}
              />
            </div>
          )}

          {/* Content Section */}
          <div className="p-6 md:p-8">
            {/* Header with View Count */}
            <div className="mb-6">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <h1 id="page-heading-title-color" className="text-2xl md:text-3xl font-semibold">
                  {title}
                </h1>
                {data.ViewCount !== undefined && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                    <Eye size={16} className="text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">
                      {data.ViewCount.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {description && (
              <div className="mb-6">
                <p id="page-heading-subtitle-color" className="leading-relaxed">
                  {description}
                </p>
              </div>
            )}

            {/* Contact Information Card */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Address */}
                {data.Address && (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 active:opacity-70 transition-opacity">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                        <MapPin size={18} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-xs mb-1 uppercase tracking-wide">Address</p>
                        <p className="text-gray-700 text-sm leading-relaxed">{data.Address}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Phone */}
                {data.PhoneOne && (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 active:opacity-70 transition-opacity">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
                        <Phone size={18} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-xs mb-1 uppercase tracking-wide">Phone</p>
                        <a
                          href={`tel:${data.PhoneOne}`}
                          className="text-gray-700 active:opacity-70 transition-opacity font-medium text-sm"
                        >
                          {data.PhoneOne}
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Email */}
                {data.Email && (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 active:opacity-70 transition-opacity">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center">
                        <Mail size={18} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-xs mb-1 uppercase tracking-wide">Email</p>
                        <a
                          href={`mailto:${data.Email}`}
                          className="text-gray-700 active:opacity-70 transition-opacity font-medium text-sm break-all"
                        >
                          {data.Email}
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Website */}
                {data.WebsiteURL && data.WebsiteURL !== "-" && data.WebsiteURL !== "null" && (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 active:opacity-70 transition-opacity">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
                        <Globe size={18} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-xs mb-1 uppercase tracking-wide">Website</p>
                        <a
                          href={data.WebsiteURL.startsWith('http') ? data.WebsiteURL : `https://${data.WebsiteURL}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-700 active:opacity-70 transition-opacity font-medium text-sm break-all inline-flex items-center gap-1.5"
                        >
                          <span>{data.WebsiteURL}</span>
                          <ExternalLink size={14} className="flex-shrink-0" />
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Open Time */}
                {data.OpenTime && (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 active:opacity-70 transition-opacity">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center">
                        <Clock size={18} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-xs mb-1 uppercase tracking-wide">Opening Hours</p>
                        <p className="text-gray-700 text-sm font-medium">{data.OpenTime}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactViewNineOne;