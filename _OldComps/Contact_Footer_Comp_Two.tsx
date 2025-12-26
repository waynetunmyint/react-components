"use client";
import React, { useEffect, useState } from "react";
import { MapPin, Phone, Mail, Clock, Globe, Facebook, Twitter, Linkedin, Instagram, Youtube, Send, ArrowRight } from "lucide-react";
import { APP_NAME, BASE_URL, IMAGE_URL } from "../../config";

const SkeletonLoader = () => (
  <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
        <div className="space-y-4">
          <div className="h-8 bg-gray-700 rounded w-48"></div>
          <div className="h-4 bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
        </div>
        <div className="space-y-4">
          <div className="h-8 bg-gray-700 rounded w-48"></div>
          <div className="h-64 bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>
  </footer>
);



export const ContactFooterCompTwo: React.FC<Props> = () => {
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

      const response = await fetch(`${BASE_URL}/contactInfo/api/1`);

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
    return <SkeletonLoader />;
  }

  if (error || !data) {
    return (
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400">Footer content unavailable</p>
        </div>
      </footer>
    );
  }

  const socialLinks = [
    { url: data?.FacebookURL, icon: Facebook, color: "hover:bg-blue-600", label: "Facebook" },
    { url: data?.TwitterURL, icon: Twitter, color: "hover:bg-blue-400", label: "Twitter" },
    { url: data?.InstagramURL, icon: Instagram, color: "hover:bg-pink-600", label: "Instagram" },
    { url: data?.LinkedinURL, icon: Linkedin, color: "hover:bg-blue-700", label: "LinkedIn" },
    { url: data?.YoutubeURL, icon: Youtube, color: "hover:bg-red-600", label: "YouTube" },
  ].filter(link => link.url);

  return (
    <footer className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-16">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-12">
          {/* Left Column - Company Info & Contact */}
          <div className="space-y-8">
            {/* Logo & Description */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                {data?.Thumbnail && (
                  <img
                    src={`${IMAGE_URL}/uploads/${data.Thumbnail}`}
                    alt="Logo"
                    className="w-16 h-16 object-contain rounded-xl bg-white/5 p-2"
                  />
                )}
                <div>
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {data.Title || "Company Name"}
                  </h3>
                </div>
              </div>
              
              {data.Description && (
                <p className="text-gray-400 text-base leading-relaxed line-clamp-3">
                  {data.Description}
                </p>
              )}
            </div>

            {/* Contact Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.PhoneOne && (
                <a
                  href={`tel:${data.PhoneOne}`}
                  className="group bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-4 transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                      <Phone size={18} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 mb-1">Call Us</p>
                      <p className="text-sm font-semibold text-white truncate">{data.PhoneOne}</p>
                    </div>
                  </div>
                </a>
              )}

              {data.Email && (
                <a
                  href={`mailto:${data.Email}`}
                  className="group bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-4 transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <Mail size={18} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 mb-1">Email Us</p>
                      <p className="text-sm font-semibold text-white truncate">{data.Email}</p>
                    </div>
                  </div>
                </a>
              )}
            </div>

            {/* Additional Info */}
            <div className="space-y-3">
              {data.Address && (
                <div className="flex items-start gap-3 text-gray-400 hover:text-white transition-colors">
                  <MapPin size={20} className="flex-shrink-0 mt-0.5" />
                  <p className="text-sm leading-relaxed">{data.Address}</p>
                </div>
              )}

              {data.OpenTime && (
                <div className="flex items-start gap-3 text-gray-400">
                  <Clock size={20} className="flex-shrink-0 mt-0.5" />
                  <p className="text-sm">{data.OpenTime}</p>
                </div>
              )}

              {data.WebsiteURL && data.WebsiteURL !== "-" && data.WebsiteURL !== "null" && (
                <div className="flex items-start gap-3">
                  <Globe size={20} className="flex-shrink-0 mt-0.5 text-gray-400" />
                  <a
                    href={data.WebsiteURL.startsWith('http') ? data.WebsiteURL : `https://${data.WebsiteURL}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors break-all"
                  >
                    {data.WebsiteURL}
                  </a>
                </div>
              )}
            </div>

            {/* Social Media */}
            {socialLinks.length > 0 && (
              <div>
                <p className="text-sm text-gray-400 mb-4">Follow Us</p>
                <div className="flex gap-3">
                  {socialLinks.map((link, idx) => {
                    const Icon = link.icon;
                    return (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-11 h-11 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 ${link.color} flex items-center justify-center transition-all duration-300 hover:scale-110`}
                        aria-label={link.label}
                      >
                        <Icon size={20} />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Map */}
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">Visit Us</h3>
              <p className="text-gray-400 text-sm">Find our location on the map</p>
            </div>
            
            {data.GoogleMapCode ? (
              <div
                className="w-full h-96 rounded-2xl overflow-hidden shadow-2xl border border-white/10"
                dangerouslySetInnerHTML={{ __html: data.GoogleMapCode }}
              />
            ) : (
              <div className="w-full h-96 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <MapPin size={48} className="text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500">Map not available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} {data.Title || APP_NAME}. All rights reserved.
            </p>
            
            <div className="flex gap-6 text-sm">
              <a href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default ContactFooterCompTwo;