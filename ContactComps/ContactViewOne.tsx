"use client";
import React, { useEffect, useState } from "react";
import {
  MapPin, Phone, Mail, Clock, Globe, Eye, ExternalLink,
  ArrowLeft, Facebook, Twitter, Linkedin, Instagram,
  Youtube, Send, MessageCircle
} from "lucide-react";
import { IMAGE_URL } from "@/config";

const SkeletonLoader = () => (
  <div className="animate-pulse max-w-4xl mx-auto space-y-8">
    <div className="bg-white rounded-[2rem] shadow-sm overflow-hidden border border-gray-100">
      <div className="h-72 md:h-96 bg-gray-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
      </div>
      <div className="p-8 md:p-12 space-y-8">
        <div className="space-y-4">
          <div className="h-10 bg-gray-200 rounded-2xl w-3/4"></div>
          <div className="h-4 bg-gray-100 rounded-xl w-full"></div>
          <div className="h-4 bg-gray-100 rounded-xl w-5/6"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-50 rounded-2xl border border-gray-100"></div>
          ))}
        </div>
      </div>
    </div>
    <style>{`
      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
      .animate-shimmer {
        animation: shimmer 2s infinite linear;
      }
    `}</style>
  </div>
);

const isValidUrl = (url: any) => {
  if (!url) return false;
  const s = String(url).trim();
  return s !== "" && s.toLowerCase() !== "null" && s !== "-";
};

const normalizeUrl = (url: any) => {
  if (!url) return "";
  let s = String(url).trim();
  if (s === "" || s.toLowerCase() === "null" || s === "-") return "";

  // Remove all whitespace
  s = s.replace(/\s+/g, "");

  // Step 1: Standardize protocol or fix missing colon typos (e.g. https// -> https://)
  if (/^https?:\/\//.test(s)) {
    // already has proper protocol
  } else if (/^https?\/\//.test(s)) {
    s = s.replace(/^(https?)\/\//, "$1://");
  }

  // Step 2: Handle nested protocols (e.g. https://https:// or https://https//)
  while (/^https?:\/\/https?:\/\//.test(s) || /^https?:\/\/https?\/\//.test(s)) {
    s = s.replace(/^https?:\/\/https?:\/\//, "https://");
    s = s.replace(/^https?:\/\/https?\/\//, "https://");
  }

  // Step 3: Add protocol if missing
  if (!s.startsWith("https://") && !s.startsWith("http://")) {
    s = "https://" + s;
  }

  return s;
};

interface Props {
  item: any;
}

export function ContactViewOne({ item }: Props) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (item) {
      setIsLoading(false);
      return;
    }
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, [item]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 mt-20">
        <SkeletonLoader />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 mt-20">
        <div className="max-w-xl mx-auto">
          <div className="bg-white rounded-[2rem] shadow-xl p-12 text-center border border-gray-100">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 bg-red-50">
              <MapPin size={40} className="text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Content Not Found</h3>
            <p className="text-gray-500 mb-10 leading-relaxed text-lg">The contact information you are looking for is currently unavailable or has been moved.</p>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-3 px-8 py-4 text-white rounded-2xl font-semibold hover:brightness-110 transition-all shadow-lg hover:shadow-xl active:scale-95"
              style={{ backgroundColor: 'var(--theme-primary-bg)' }}
            >
              <ArrowLeft size={20} />
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const title = item.Title || "Get in Touch";
  const description = item.Description || "";
  const googleMapCode = item.GoogleMapCode;

  const ContactCard = ({
    icon: Icon,
    label,
    value,
    href,
    isExternal = false
  }: {
    icon: any;
    label: string;
    value: string;
    href?: string;
    isExternal?: boolean;
  }) => (
    <div className="group relative bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-center gap-5">
        <div
          className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
          style={{
            backgroundColor: 'var(--theme-primary-bg)',
            color: 'var(--theme-primary-text)'
          }}
        >
          <Icon size={24} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
            {label}
          </p>
          {href ? (
            <a
              href={href}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noopener noreferrer" : undefined}
              className="text-gray-900 hover:text-[var(--theme-accent)] transition-colors font-semibold text-sm md:text-base break-words flex items-center gap-1.5"
            >
              <span className="truncate">{value}</span>
              {isExternal && (
                <ExternalLink size={14} className="flex-shrink-0 opacity-40 group-hover:opacity-100" />
              )}
            </a>
          ) : (
            <p className="text-gray-900 text-sm md:text-base font-semibold leading-relaxed line-clamp-2">
              {value}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen  py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/5 overflow-hidden border border-white">

          {/* Visual Header */}
          <div className="relative">
            {googleMapCode ? (
              <div className="h-72 md:h-96 w-full grayscale-[0.2] contrast-[1.1] hover:grayscale-0 transition-all duration-700">
                <div
                  className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-0"
                  dangerouslySetInnerHTML={{ __html: googleMapCode }}
                />
              </div>
            ) : item.Thumbnail && (
              <div className="h-72 md:h-96 w-full overflow-hidden">
                <img
                  src={`${IMAGE_URL}/uploads/${item.Thumbnail}`}
                  alt={title}
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
            )}

            {
              item?.CoverThumbnail && (
                <img
                  src={`${IMAGE_URL}/uploads/${item.CoverThumbnail}`}
                  alt={title}
                  className="w-full  transform hover:scale-105 transition-transform duration-1000"
                />
              )
            }

            {/* View Count Badge */}
            {item.ViewCount !== undefined && item.ViewCount > 0 && (
              <div className="absolute top-6 right-6 backdrop-blur-md bg-white/80 px-4 py-2 rounded-2xl flex items-center gap-2 shadow-lg border border-white/20">
                <Eye size={16} className="text-gray-600" />
                <span className="text-xs font-bold text-gray-800 tracking-tight">
                  {item.ViewCount.toLocaleString()} VIEWS
                </span>
              </div>
            )}
          </div>

          {/* Content Area */}
          <div className="p-8 md:p-14">
            <div className="mb-12">
              <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight mb-6 leading-tight">
                {title}
              </h1>
              {description && (
                <p className="text-gray-500 text-lg md:text-xl leading-relaxed max-w-2xl">
                  {description}
                </p>
              )}
            </div>

            {/* Grid of Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {item.Address && (
                <ContactCard
                  icon={MapPin}
                  label="Our Location"
                  value={item.Address}
                />
              )}

              {item.PhoneOne && (
                <ContactCard
                  icon={Phone}
                  label="Phone Number"
                  value={item.PhoneOne}
                  href={`tel:${item.PhoneOne}`}
                />
              )}

              {item.Email && (
                <ContactCard
                  icon={Mail}
                  label="Email Address"
                  value={item.Email}
                  href={`mailto:${item.Email}`}
                />
              )}

              {isValidUrl(item.WebsiteURL) && (
                <ContactCard
                  icon={Globe}
                  label="Official Website"
                  value={item.WebsiteURL}
                  href={normalizeUrl(item.WebsiteURL)}
                  isExternal
                />
              )}

              {/* Social Links grouped if needed, but keeping individual for clarity */}
              {isValidUrl(item.FacebookURL) && (
                <ContactCard
                  icon={Facebook}
                  label="Facebook"
                  value="Follow us on Facebook"
                  href={normalizeUrl(item.FacebookURL)}
                  isExternal
                />
              )}

              {isValidUrl(item.InstagramURL) && (
                <ContactCard
                  icon={Instagram}
                  label="Instagram"
                  value="Connect on Instagram"
                  href={normalizeUrl(item.InstagramURL)}
                  isExternal
                />
              )}

              {isValidUrl(item.LinkedinURL || item.LinkedInURL) && (
                <ContactCard
                  icon={Linkedin}
                  label="LinkedIn"
                  value="Professional Network"
                  href={normalizeUrl(item.LinkedinURL || item.LinkedInURL)}
                  isExternal
                />
              )}

              {isValidUrl(item.YoutubeURL) && (
                <ContactCard
                  icon={Youtube}
                  label="YouTube"
                  value="Official Channel"
                  href={normalizeUrl(item.YoutubeURL)}
                  isExternal
                />
              )}

              {isValidUrl(item.TwitterURL) && (
                <ContactCard
                  icon={Twitter}
                  label="Twitter / X"
                  value="Latest Updates"
                  href={normalizeUrl(item.TwitterURL)}
                  isExternal
                />
              )}

              {isValidUrl(item.TelegramURL) && (
                <ContactCard
                  icon={Send}
                  label="Telegram"
                  value="Join Community"
                  href={normalizeUrl(item.TelegramURL)}
                  isExternal
                />
              )}

              {item.OpenTime && (
                <ContactCard
                  icon={Clock}
                  label="Working Hours"
                  value={item.OpenTime}
                />
              )}
            </div>

            {/* CTAs */}
            <div className="mt-14 pt-10 border-t border-gray-50 flex flex-wrap gap-4">
              {item.PhoneOne && (
                <a
                  href={`tel:${item.PhoneOne}`}
                  className="flex-1 min-w-[240px] flex items-center justify-center gap-3 px-8 py-5 rounded-[1.25rem] font-bold text-lg hover:brightness-90 transition-all shadow-xl shadow-yellow-900/10 active:scale-95"
                  style={{
                    backgroundColor: 'var(--theme-primary-bg)',
                    color: 'var(--theme-primary-text)'
                  }}
                >
                  <Phone size={24} />
                  Call Now
                </a>
              )}
              {item.Email && (
                <a
                  href={`mailto:${item.Email}`}
                  className="flex-1 min-w-[240px] flex items-center justify-center gap-3 px-8 py-5 bg-white rounded-[1.25rem] font-bold text-lg hover:bg-gray-50 transition-all active:scale-95 border-2"
                  style={{
                    borderColor: 'var(--theme-secondary-bg)',
                    color: 'var(--theme-secondary-bg)'
                  }}
                >
                  <Mail size={24} />
                  Send Email
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
