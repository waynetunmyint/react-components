"use client";
import React, { useEffect, useState } from "react";
import { MapPin, Phone, Mail, Clock, Globe, Facebook, Instagram, Linkedin, Twitter, Youtube, Send, ArrowRight } from "lucide-react";
import { BASE_URL, IMAGE_URL, PAGE_ID } from "../../../config";

interface ContactData {
  Thumbnail?: string;
  Title?: string;
  Description?: string;
  PhoneOne?: string;
  Email?: string;
  Address?: string;
  OpenTime?: string;
  WebsiteURL?: string;
  GoogleMapCode?: string;
  FacebookURL?: string;
  TwitterURL?: string;
  InstagramURL?: string;
  LinkedinURL?: string;
  YoutubeURL?: string;
  [key: string]: string | undefined;
}

export const ContactFooterNineThree: React.FC = () => {
  const [data, setData] = useState<ContactData | null>(null);
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
    return <SkeletonLoader />;
  }

  if (error || !data) {
    return (
      <footer className="bg-slate-950 text-white py-12">
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
    <footer className="relative bg-slate-950">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-900/20 via-slate-950 to-slate-950" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Top Section - Hero Style */}
        <div className="border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 py-16 lg:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              
              {/* Left: Company Branding */}
              <div className="space-y-6">
                <div className="inline-flex items-center gap-4">
                  {data?.Thumbnail && (
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 p-3 shadow-lg shadow-red-900/50">
                      <img
                        src={`${IMAGE_URL}/uploads/${data.Thumbnail}`}
                        alt="Logo"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  <h3 className="text-4xl lg:text-5xl font-bold text-white">
                    {data.Title || "Company Name"}
                  </h3>
                </div>
                
                {data.Description && (
                  <p className="text-gray-300 text-lg leading-relaxed max-w-xl">
                    {data.Description}
                  </p>
                )}

                {/* Newsletter Signup */}
                <div className="pt-6">
                  <p className="text-gray-400 text-sm mb-3">Stay updated with our newsletter</p>
                  <div className="flex gap-2 max-w-md">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                    />
                    <button className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl text-white font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg shadow-red-900/30">
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Right: Map Preview */}
              <div className="relative h-[400px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                {data.GoogleMapCode ? (
                  <div
                    className="w-full h-full"
                    dangerouslySetInnerHTML={{ __html: data.GoogleMapCode }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
                    <MapPin size={48} className="text-gray-600" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Middle Section - Contact Grid */}
        <div className="border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              
              {/* Quick Links */}
              <div className="space-y-4">
                <h4 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-red-600 to-red-800 rounded-full" />
                  Quick Links
                </h4>
                <ul className="space-y-3">
                  {['About Us', 'Services', 'Portfolio', 'Careers'].map((link, idx) => (
                    <li key={idx}>
                      <a href="#" className="text-gray-400 hover:text-red-500 transition-colors flex items-center gap-2 group">
                        <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact Info */}
              <div className="space-y-4">
                <h4 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-red-600 to-red-800 rounded-full" />
                  Contact
                </h4>
                <div className="space-y-4">
                  {data.PhoneOne && (
                    <a href={`tel:${data.PhoneOne}`} className="flex items-start gap-3 text-gray-400 hover:text-red-500 transition-colors group">
                      <Phone size={18} className="mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" />
                      <span className="text-sm">{data.PhoneOne}</span>
                    </a>
                  )}
                  {data.Email && (
                    <a href={`mailto:${data.Email}`} className="flex items-start gap-3 text-gray-400 hover:text-red-500 transition-colors group">
                      <Mail size={18} className="mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" />
                      <span className="text-sm break-all">{data.Email}</span>
                    </a>
                  )}
                  {data.WebsiteURL && data.WebsiteURL !== "-" && data.WebsiteURL !== "null" && (
                    <a 
                      href={data.WebsiteURL.startsWith('http') ? data.WebsiteURL : `https://${data.WebsiteURL}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 text-gray-400 hover:text-red-500 transition-colors group"
                    >
                      <Globe size={18} className="mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" />
                      <span className="text-sm break-all">{data.WebsiteURL}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4">
                <h4 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-red-600 to-red-800 rounded-full" />
                  Location
                </h4>
                {data.Address && (
                  <div className="flex items-start gap-3 text-gray-400">
                    <MapPin size={18} className="mt-1 flex-shrink-0" />
                    <p className="text-sm leading-relaxed">{data.Address}</p>
                  </div>
                )}
                {data.OpenTime && (
                  <div className="flex items-start gap-3 text-gray-400 mt-4">
                    <Clock size={18} className="mt-1 flex-shrink-0" />
                    <p className="text-sm">{data.OpenTime}</p>
                  </div>
                )}
              </div>

              {/* Social Media */}
              <div className="space-y-4">
                <h4 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-red-600 to-red-800 rounded-full" />
                  Follow Us
                </h4>
                <div className="flex gap-3 flex-wrap">
                  {socialLinks.map((link, idx) => {
                    const Icon = link.icon;
                    return (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={link.label}
                        className="w-11 h-11 rounded-lg bg-white/5 border border-white/10 hover:bg-red-600 hover:border-red-600 flex items-center justify-center transition-all duration-200 group"
                      >
                        <Icon size={20} className="text-gray-400 group-hover:text-white group-hover:scale-110 transition-all" />
                      </a>
                    );
                  })}
                </div>
                <p className="text-gray-500 text-xs mt-4">
                  Connect with us on social media for updates and news
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="bg-black/20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-500 text-sm">
                © {new Date().getFullYear()} {data.Title}. All rights reserved.
              </p>
              <div className="flex gap-8 text-sm">
                <a href="/privacy" className="text-gray-500 hover:text-red-500 transition-colors">
                  Privacy Policy
                </a>
                <a href="/terms" className="text-gray-500 hover:text-red-500 transition-colors">
                  Terms of Service
                </a>
                <a href="/cookies" className="text-gray-500 hover:text-red-500 transition-colors">
                  Cookies
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default ContactFooterNineThree;

const SkeletonLoader = () => (
  <footer className="bg-slate-950">
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
        <div className="space-y-6">
          <div className="h-20 bg-gray-800 rounded-2xl w-64"></div>
          <div className="h-4 bg-gray-800 rounded w-full"></div>
          <div className="h-4 bg-gray-800 rounded w-3/4"></div>
          <div className="h-12 bg-gray-800 rounded-xl w-96"></div>
        </div>
        <div className="h-[400px] bg-gray-800 rounded-2xl"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-16">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-4">
            <div className="h-6 bg-gray-800 rounded w-32"></div>
            <div className="h-4 bg-gray-800 rounded w-full"></div>
            <div className="h-4 bg-gray-800 rounded w-5/6"></div>
            <div className="h-4 bg-gray-800 rounded w-4/6"></div>
          </div>
        ))}
      </div>
    </div>
  </footer>
);
