"use client";
import React, { useEffect, useState } from "react";
import { MapPin, Phone, Mail, Clock, Globe, Eye, ExternalLink } from "lucide-react";
import { BASE_URL, PAGE_ID } from "../../config";

const SkeletonLoader = () => (
  <div className="animate-pulse max-w-4xl mx-auto">
    <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
      <div className="h-80 bg-gradient-to-br from-gray-200 to-gray-300"></div>
      <div className="p-8 md:p-10 space-y-8">
        <div className="h-8 bg-gray-200 rounded-2xl w-2/3"></div>
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded-xl w-full"></div>
          <div className="h-4 bg-gray-200 rounded-xl w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded-xl w-4/6"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-32 bg-gray-200 rounded-2xl"></div>
          <div className="h-32 bg-gray-200 rounded-2xl"></div>
          <div className="h-32 bg-gray-200 rounded-2xl"></div>
          <div className="h-32 bg-gray-200 rounded-2xl"></div>
        </div>
      </div>
    </div>
  </div>
);



export const ContactViewNine: React.FC = () => {
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
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <SkeletonLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-3xl p-8 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
              <div>
                <h3 className="text-red-900 font-semibold text-lg mb-1.5">Error Loading Contact Information</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-sm p-16 text-center">
            <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center mx-auto mb-6">
              <MapPin size={40} className="text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Contact Information Not Found</h3>
            <p className="text-gray-500">The contact information you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  const title = data.Title || "Contact Us";
  const description = data.Description || "";
  const googleMapCode = data.GoogleMapCode;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          {/* Google Map Section */}
          {googleMapCode && (
            <div className="relative h-80 overflow-hidden">
              <div
                className="w-full h-full"
                dangerouslySetInnerHTML={{ __html: googleMapCode }}
              />
            </div>
          )}

          {/* Content Section */}
          <div className="p-8 md:p-10">
            {/* Header with View Count */}
            <div className="mb-8">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 tracking-tight">
                  {title}
                </h1>
                {data.ViewCount !== undefined && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
                    <Eye size={16} className="text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">
                      {data.ViewCount.toLocaleString()} views
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {description && (
              <div className="mb-8">
                <p className="text-gray-600 leading-relaxed">
                  {description}
                </p>
              </div>
            )}

            {/* Contact Information Card */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Address */}
                {data.Address && (
                  <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 transition-all duration-200 hover:shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
                        <MapPin size={18} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-xs mb-1.5 uppercase tracking-wide">Address</p>
                        <p className="text-gray-700 text-sm leading-relaxed">{data.Address}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Phone */}
                {data.PhoneOne && (
                  <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 transition-all duration-200 hover:shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center">
                        <Phone size={18} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-xs mb-1.5 uppercase tracking-wide">Phone</p>
                        <a
                          href={`tel:${data.PhoneOne}`}
                          className="text-gray-700 hover: transition-colors duration-150 font-medium text-sm"
                        >
                          {data.PhoneOne}
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Email */}
                {data.Email && (
                  <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 transition-all duration-200 hover:shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center">
                        <Mail size={18} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-xs mb-1.5 uppercase tracking-wide">Email</p>
                        <a
                          href={`mailto:${data.Email}`}
                          className="text-gray-700 hover: transition-colors duration-150 font-medium text-sm break-all"
                        >
                          {data.Email}
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Website */}
                {data.WebsiteURL && data.WebsiteURL !== "-" && data.WebsiteURL !== "null" && (
                  <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 transition-all duration-200 hover:shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center">
                        <Globe size={18} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-xs mb-1.5 uppercase tracking-wide">Website</p>
                        <a
                          href={data.WebsiteURL.startsWith('http') ? data.WebsiteURL : `https://${data.WebsiteURL}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-700 hover: transition-colors duration-150 font-medium text-sm break-all inline-flex items-center gap-1.5 group"
                        >
                          <span>{data.WebsiteURL}</span>
                          <ExternalLink size={14} className="flex-shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-150" />
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Open Time */}
                {data.OpenTime && (
                  <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 transition-all duration-200 hover:shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
                        <Clock size={18} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-xs mb-1.5 uppercase tracking-wide">Opening Hours</p>
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

export default ContactViewNine;