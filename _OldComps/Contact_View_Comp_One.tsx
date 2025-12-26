"use client";
import React, { useEffect, useState } from "react";
import { MapPin, Phone, Mail, Clock, Globe, Eye, ExternalLink } from "lucide-react";
import { BASE_URL, IMAGE_URL } from "../../config";

const SkeletonLoader = () => (
  <div className="animate-pulse max-w-7xl mx-auto">
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="h-96 bg-gradient-to-br from-gray-200 to-gray-300"></div>
      <div className="p-8 space-y-6">
        <div className="h-10 bg-gray-200 rounded-lg w-2/3"></div>
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-1 h-48 bg-gray-200 rounded-lg"></div>
          <div className="col-span-2 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
        <div className="h-64 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  </div>
);

interface Props {
  customAPI: string;
}

export const ContactViewCompOne: React.FC<Props> = ({ customAPI }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
        <SkeletonLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-8 shadow-md">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
              <div>
                <h3 className="text-red-900 font-bold text-xl mb-2">Error Loading Contact Information</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
              <MapPin size={48} className="text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Contact Information Not Found</h3>
            <p className="text-gray-500 text-lg">The contact information you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  const title = data.Title || "Contact Us";
  const description = data.Description || "";
  const googleMapCode = data.GoogleMapCode;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Google Map Section */}
          {googleMapCode && (
            <div className="relative h-96 overflow-hidden">
              <div
                className="w-full h-full"
                dangerouslySetInnerHTML={{ __html: googleMapCode }}
              />
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/10 to-transparent"></div>
            </div>
          )}

          {/* Content Section */}
          <div className="p-8 md:p-12">
            {/* Header with View Count */}
            <div className="mb-10">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                  {title}
                </h1>
                {data.ViewCount !== undefined && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
                    <Eye size={18} className="text-gray-600" />
                    <span className="text-sm font-semibold text-gray-700">
                      {data.ViewCount.toLocaleString()} views
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Image and Description Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {/* Thumbnail */}
              {data.Thumbnail && (
                <div className="col-span-1">
                  <div className="relative rounded-xl overflow-hidden shadow-lg group">
                    <img
                      src={`${IMAGE_URL}/uploads/${data.Thumbnail}`}
                      alt={title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>
              )}

              {/* Description */}
              <div className={data.Thumbnail ? "col-span-2" : "col-span-3"}>
                {description && (
                  <div className="prose prose-lg max-w-none">
                    <p className="text-gray-700 leading-relaxed text-lg">
                      {description}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information Card */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl p-8 shadow-inner border border-orange-200/50">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1 h-8 bg-orange-500 rounded-full"></div>
                <h2 className="text-2xl font-bold text-orange-900 tracking-tight">
                  Contact Information
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Address */}
                {data.Address && (
                  <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 border border-orange-100">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md">
                        <MapPin size={20} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm mb-2 uppercase tracking-wide">Address</p>
                        <p className="text-gray-700 leading-relaxed">{data.Address}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Phone */}
                {data.PhoneOne && (
                  <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 border border-orange-100">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md">
                        <Phone size={20} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm mb-2 uppercase tracking-wide">Phone</p>
                        <a
                          href={`tel:${data.PhoneOne}`}
                          className="text-gray-700 hover:text-orange-600 transition-colors duration-200 font-medium text-lg"
                        >
                          {data.PhoneOne}
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Email */}
                {data.Email && (
                  <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 border border-orange-100">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md">
                        <Mail size={20} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm mb-2 uppercase tracking-wide">Email</p>
                        <a
                          href={`mailto:${data.Email}`}
                          className="text-gray-700 hover:text-orange-600 transition-colors duration-200 font-medium break-all"
                        >
                          {data.Email}
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Website */}
                {data.WebsiteURL && data.WebsiteURL !== "-" && data.WebsiteURL !== "null" && (
                  <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 border border-orange-100">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md">
                        <Globe size={20} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm mb-2 uppercase tracking-wide">Website</p>
                        <a
                          href={data.WebsiteURL.startsWith('http') ? data.WebsiteURL : `https://${data.WebsiteURL}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-700 hover:text-orange-600 transition-colors duration-200 font-medium break-all inline-flex items-center gap-2 group"
                        >
                          <span>{data.WebsiteURL}</span>
                          <ExternalLink size={16} className="flex-shrink-0 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-200" />
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Open Time */}
                {data.OpenTime && (
                  <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 border border-orange-100">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md">
                        <Clock size={20} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm mb-2 uppercase tracking-wide">Opening Hours</p>
                        <p className="text-gray-700 font-medium">{data.OpenTime}</p>
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

export default ContactViewComp;