"use client";
import React, { useEffect, useState } from "react";
import {
  MapPin, Phone, Mail, Clock, Globe, Eye,
  ExternalLink, Building2, ArrowLeft
} from "lucide-react";

const SkeletonLoader = () => (
  <div className="animate-pulse space-y-8">
    <div className="bg-[#111827] rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-800">
      <div className="h-96 bg-gray-800/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
      </div>
      <div className="p-10 md:p-14 space-y-10">
        <div className="space-y-4">
          <div className="h-12 bg-gray-800 rounded-2xl w-2/3"></div>
          <div className="h-4 bg-gray-800/50 rounded-xl w-full"></div>
          <div className="h-4 bg-gray-800/50 rounded-xl w-4/5"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-44 bg-gray-800/30 rounded-3xl border border-gray-800"></div>
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

export function ContactViewTwo({ item }: Props) {
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
      <div className="min-h-screen bg-[#030712] py-16 px-6 mt-20">
        <div className="max-w-6xl mx-auto">
          <SkeletonLoader />
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-[#030712] py-16 px-6 mt-20">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-[#111827] rounded-[3rem] shadow-2xl p-16 border border-gray-800/50">
            <div className="w-24 h-24 rounded-3xl bg-red-500/10 flex items-center justify-center mx-auto mb-10 border border-red-500/20">
              <Building2 size={48} className="text-red-500" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-6">Contact Unavailable</h3>
            <p className="text-gray-400 text-lg mb-12 leading-relaxed">
              We couldn't find the contact information you're looking for. It might have been moved or removed.
            </p>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-3 px-10 py-5 bg-white text-black rounded-2xl font-bold text-lg hover:bg-gray-200 transition-all active:scale-95 shadow-xl"
            >
              <ArrowLeft size={24} />
              Return Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const title = item.Title || "Contact Information";
  const description = item.Description || "";
  const googleMapCode = item.GoogleMapCode;

  const InfoCard = ({ icon: Icon, label, value, href, isExternal }: any) => (
    <div className="group relative bg-[#111827] rounded-3xl p-8 border border-white/5 hover:border-[var(--theme-primary-bg)]/30 transition-all duration-500 hover:shadow-2xl hover:shadow-[var(--theme-primary-bg)]/5">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--theme-primary-bg)]/5 rounded-full blur-3xl group-hover:bg-[var(--theme-primary-bg)]/10 transition-all duration-500"></div>
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-6">
          <div
            className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-transform duration-500 group-hover:scale-110"
            style={{ backgroundColor: 'var(--theme-primary-bg, #cc9d00)' }}
          >
            <Icon size={26} style={{ color: 'var(--theme-primary-text, #000000)' }} />
          </div>
          <h3 className="font-bold text-gray-500 text-xs uppercase tracking-[0.2em]">{label}</h3>
        </div>
        {href ? (
          <a
            href={href}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            className="text-white hover:text-[var(--theme-primary-bg)] transition-colors duration-300 font-bold text-lg md:text-xl break-words flex items-center gap-2"
          >
            <span className="truncate">{value}</span>
            {isExternal && <ExternalLink size={18} className="flex-shrink-0 opacity-30 group-hover:opacity-100" />}
          </a>
        ) : (
          <p className="text-white text-lg md:text-xl font-bold leading-relaxed">
            {value}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#030712] py-16 px-6 mt-20">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-14 text-center space-y-4">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--theme-primary-bg, #cc9d00)' }}></span>
            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Connect With Us</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">
            {title}
          </h1>
          {item.ViewCount !== undefined && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-2xl border border-white/5">
              <Eye size={16} className="text-gray-500" />
              <span className="text-sm font-bold text-gray-400">
                {item.ViewCount.toLocaleString()} TOTAL VIEWS
              </span>
            </div>
          )}
        </div>

        <div className="bg-[#111827] rounded-[3rem] shadow-2xl overflow-hidden border border-white/5">
          {/* Map / Visual Section */}
          {googleMapCode && (
            <div className="relative h-[28rem] overflow-hidden grayscale contrast-[1.2] hover:grayscale-0 transition-all duration-1000 border-b border-white/5">
              <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent z-10"></div>
              <div
                className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-0"
                dangerouslySetInnerHTML={{ __html: googleMapCode }}
              />
            </div>
          )}

          {/* Grid Content */}
          <div className="p-10 md:p-16">
            {description && (
              <div className="mb-16 max-w-3xl">
                <p className="text-gray-400 leading-relaxed text-xl font-medium">
                  {description}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {item.Address && (
                <InfoCard
                  icon={MapPin}
                  label="Our Studio"
                  value={item.Address}
                />
              )}

              {item.PhoneOne && (
                <InfoCard
                  icon={Phone}
                  label="Direct Line"
                  value={item.PhoneOne}
                  href={`tel:${item.PhoneOne}`}
                />
              )}

              {item.Email && (
                <InfoCard
                  icon={Mail}
                  label="Email Inquiries"
                  value={item.Email}
                  href={`mailto:${item.Email}`}
                />
              )}

              {item.WebsiteURL && item.WebsiteURL !== "-" && item.WebsiteURL !== "null" && (
                <InfoCard
                  icon={Globe}
                  label="Web Presence"
                  value={item.WebsiteURL}
                  href={normalizeUrl(item.WebsiteURL)}
                  isExternal
                />
              )}

              {item.OpenTime && (
                <InfoCard
                  icon={Clock}
                  label="Office Hours"
                  value={item.OpenTime}
                />
              )}
            </div>

            {/* Premium CTA */}
            {(item.PhoneOne || item.Email) && (
              <div className="mt-20 pt-16 border-t border-white/5 flex flex-wrap gap-6 justify-center">
                {item.PhoneOne && (
                  <a
                    href={`tel:${item.PhoneOne}`}
                    className="flex-1 min-w-[280px] flex items-center justify-center gap-4 px-10 py-6 rounded-[1.5rem] font-black text-xl hover:brightness-110 transition-all shadow-2xl active:scale-95"
                    style={{
                      backgroundColor: 'var(--theme-primary-bg, #cc9d00)',
                      color: 'var(--theme-primary-text, #000000)'
                    }}
                  >
                    <Phone size={28} />
                    Call Directly
                  </a>
                )}
                {item.Email && (
                  <a
                    href={`mailto:${item.Email}`}
                    className="flex-1 min-w-[280px] flex items-center justify-center gap-4 px-10 py-6 bg-white/5 text-white border border-white/10 rounded-[1.5rem] font-black text-xl hover:bg-white/10 transition-all active:scale-95 backdrop-blur-xl"
                  >
                    <Mail size={28} />
                    Message Us
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}