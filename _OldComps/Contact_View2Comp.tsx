"use client";
import React, { useEffect, useState } from "react";
import { MapPin, Phone, Mail, Clock, Globe, Eye, ExternalLink, Building2 } from "lucide-react";
import { BASE_URL, IMAGE_URL } from "../../config";


const SkeletonLoader = () => (
  <div className="animate-pulse max-w-6xl mx-auto">
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="h-64 bg-gray-300 rounded-3xl"></div>
        <div className="h-32 bg-gray-200 rounded-2xl"></div>
      </div>
      <div className="lg:col-span-3 space-y-6">
        <div className="h-12 bg-gray-200 rounded-lg w-3/4"></div>
        <div className="h-96 bg-gray-300 rounded-3xl"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-32 bg-gray-200 rounded-xl"></div>
          <div className="h-32 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    </div>
  </div>
);

interface Props {
  customAPI: string;
}

export const ContactView2Comp: React.FC<Props> = ({ customAPI }) => {
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
      <div className="min-h-screen bg-gray-900 py-16 px-4">
        <SkeletonLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 py-16 px-4 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="bg-gradient-to-br from-red-900/40 to-red-800/40 backdrop-blur-sm border border-red-500/50 rounded-3xl p-8 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚠️</span>
              </div>
              <h3 className="text-red-100 font-bold text-xl mb-3">Error Loading Contact</h3>
              <p className="text-red-200/80">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-900 py-16 px-4 flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-6">
            <Building2 size={40} className="text-gray-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-100 mb-3">No Contact Information</h3>
          <p className="text-gray-400 text-lg">The contact details you're looking for are not available.</p>
        </div>
      </div>
    );
  }

  const title = data.Title || "Contact Us";
  const description = data.Description || "";
  const googleMapCode = data.GoogleMapCode;

  const contactItems = [
    {
      icon: MapPin,
      label: "Address",
      value: data.Address,
      href: null,
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Phone,
      label: "Phone",
      value: data.PhoneOne,
      href: data.PhoneOne ? `tel:${data.PhoneOne}` : null,
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Mail,
      label: "Email",
      value: data.Email,
      href: data.Email ? `mailto:${data.Email}` : null,
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Clock,
      label: "Opening Hours",
      value: data.OpenTime,
      href: null,
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Globe,
      label: "Website",
      value: data.WebsiteURL && data.WebsiteURL !== "-" && data.WebsiteURL !== "null" ? data.WebsiteURL : null,
      href: data.WebsiteURL && data.WebsiteURL !== "-" && data.WebsiteURL !== "null" 
        ? (data.WebsiteURL.startsWith('http') ? data.WebsiteURL : `https://${data.WebsiteURL}`)
        : null,
      color: "from-indigo-500 to-blue-500",
      external: true
    }
  ].filter(item => item.value);

  return (
    <div className="min-h-screen  py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Card */}
            {data.Thumbnail && (
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="relative bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-3xl overflow-hidden shadow-2xl">
                  <img
                    src={`${IMAGE_URL}/uploads/${data.Thumbnail}`}
                    alt={title}
                    className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent"></div>
                </div>
              </div>
            )}

            {/* Stats Card */}
            {data.ViewCount !== undefined && (
              <div className="relative group">
                <div className="absolute inset-0  rounded-2xl blur-lg"></div>
                <div className="relative bg-gray-800/70 backdrop-blur-md border border-gray-700/50 rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg">
                        <Eye size={24} className="text-white" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm font-medium">Total Views</p>
                        <p className="text-white text-2xl font-bold">{data.ViewCount.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mb-4 leading-tight">
                {title}
              </h1>
              {description && (
                <p className="text-gray-300 text-lg leading-relaxed">
                  {description}
                </p>
              )}
            </div>

            {/* Map */}
            {googleMapCode && (
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-pink-500/20 rounded-3xl blur-xl"></div>
                <div className="relative bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-3xl overflow-hidden shadow-2xl">
                  <div
                    className="w-full h-96"
                    dangerouslySetInnerHTML={{ __html: googleMapCode }}
                  />
                </div>
              </div>
            )}

            {/* Contact Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contactItems.map((item, index) => {
                const Icon = item.icon;
                const content = (
                  <div className="flex items-start gap-4 h-full">
                    <div className={`flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}>
                      <Icon size={24} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">
                        {item.label}
                      </p>
                      <p className={`text-gray-100 font-medium leading-relaxed break-words ${item.href ? 'group-hover:text-orange-400 transition-colors duration-200' : ''}`}>
                        {item.value}
                        {item.external && (
                          <ExternalLink size={14} className="inline-block ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        )}
                      </p>
                    </div>
                  </div>
                );

                return (
                  <div key={index} className="relative group">
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 rounded-2xl blur-xl transition-opacity duration-300`}></div>
                    {item.href ? (
                      <a
                        href={item.href}
                        target={item.external ? "_blank" : undefined}
                        rel={item.external ? "noopener noreferrer" : undefined}
                        className="relative block bg-gray-800/70 backdrop-blur-md border border-gray-700/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:border-gray-600/50 transition-all duration-300"
                      >
                        {content}
                      </a>
                    ) : (
                      <div className="relative bg-gray-800/70 backdrop-blur-md border border-gray-700/50 rounded-2xl p-6 shadow-xl">
                        {content}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactView2Comp;