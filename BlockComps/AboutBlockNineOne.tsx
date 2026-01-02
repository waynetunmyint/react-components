"use client";
import React from "react";
import {
  Phone,
  Mail,
  Clock,
  Globe,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  Sparkles,
} from "lucide-react";
import { IMAGE_URL } from "@/config";
import BlockHeader from "../BlockComps/BlockHeader";

interface Props {
  dataSource?: string;
  headingTitle?: string | null;
  subHeadingTitle?: string | null;
  items?: any[];
  loading?: boolean;
  error?: string | null;
}

export const AboutBlockNineOne: React.FC<Props> = ({
  items: prefetchedItems,
  loading: prefetchedLoading,
  error: prefetchedError,
  headingTitle,
  subHeadingTitle,
  dataSource,
}) => {
  const data = (prefetchedItems && prefetchedItems.length > 0) ? prefetchedItems[0] : null;
  const loading = prefetchedLoading ?? false;
  const error = prefetchedError ?? null;

  const SkeletonLoader = () => (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse">
      <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-64 bg-gray-300 rounded-2xl"></div>
          <div className="space-y-4">
            <div className="h-8 bg-gray-300 rounded-lg w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-full"></div>
            <div className="h-4 bg-gray-300 rounded w-5/6"></div>
            <div className="flex gap-3 mt-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-12 h-12 bg-gray-300 rounded-full"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) return <SkeletonLoader />;

  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl p-8 text-center text-gray-500">
          <p>{error || "Content unavailable"}</p>
        </div>
      </div>
    );
  }

  const contactItems = [
    { show: data.PhoneOne, icon: Phone, value: data.PhoneOne, href: `tel:${data.PhoneOne}`, color: "from-[var(--theme-primary-bg)] to-[var(--theme-accent)]" },
    { show: data.Email, icon: Mail, value: data.Email, href: `mailto:${data.Email}`, color: "from-[var(--theme-primary-bg)] to-[var(--theme-accent)]" },
    { show: data.WebsiteURL && data.WebsiteURL !== "-", icon: Globe, value: "Website", href: data.WebsiteURL, color: "from-[var(--theme-primary-bg)] to-[var(--theme-accent)]" },
    { show: data.OpenTime, icon: Clock, value: data.OpenTime, href: null, color: "from-[var(--theme-primary-bg)] to-[var(--theme-accent)]" },
  ];

  const socialItems = [
    { show: data.FacebookURL, icon: Facebook, href: data.FacebookURL, color: "hover:bg-[var(--theme-primary-bg)]" },
    { show: data.TwitterURL, icon: Twitter, href: data.TwitterURL, color: "hover:bg-[var(--theme-primary-bg)]" },
    { show: data.InstagramURL, icon: Instagram, href: data.InstagramURL, color: "hover:bg-[var(--theme-primary-bg)]" },
    { show: data.YoutubeURL, icon: Youtube, href: data.YoutubeURL, color: "hover:bg-[var(--theme-primary-bg)]" },
    { show: data.LinkedinURL, icon: Linkedin, href: data.LinkedinURL, color: "hover:bg-[var(--theme-primary-bg)]" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <BlockHeader
        headingTitle={headingTitle}
        subHeadingTitle={subHeadingTitle}
        showSwitcher={false}
        dataSource={dataSource}
        showViewAll={false}
      />

      <div className="relative overflow-hidden bg-gradient-to-br from-[var(--theme-secondary-bg)] via-[#111111] to-[var(--theme-secondary-bg)] rounded-3xl p-8 md:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[var(--theme-primary-bg)]/10 to-[var(--theme-accent)]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-[var(--theme-primary-bg)]/10 to-[var(--theme-accent)]/10 rounded-full blur-3xl"></div>

        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-r from-[var(--theme-primary-bg)] via-[var(--theme-accent)] to-[var(--theme-primary-bg)] rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
            <img
              src={`${IMAGE_URL}/uploads/${data?.ShowcaseImage || "default-logo.png"}`}
              alt={data.Title || "Logo"}
              className="relative w-full h-64 md:h-80 object-cover rounded-2xl shadow-2xl ring-1 ring-white/10"
            />
            <div className="absolute top-4 left-4 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
              <div className="flex items-center gap-2 text-white text-sm font-medium">
                <Sparkles size={14} className="text-[var(--theme-primary-bg)]" />
                About Us
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                {data.Title || "Welcome"}
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed">
                {data.Description || "We provide exceptional services and solutions."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {contactItems.filter(i => i.show).map((item, idx) => {
                const Icon = item.icon;
                const content = (
                  <div className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 transition-all duration-300 group/item">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}>
                      <Icon size={18} className="text-white" />
                    </div>
                    <span className="text-white text-sm font-medium truncate group-hover/item:text-white/80">
                      {item.value}
                    </span>
                  </div>
                );
                return item.href ? (
                  <a key={idx} href={item.href} target="_blank" rel="noopener noreferrer">
                    {content}
                  </a>
                ) : (
                  <div key={idx}>{content}</div>
                );
              })}
            </div>

            <div className="flex items-center gap-3 pt-4">
              <span className="text-gray-400 text-sm font-medium">Follow us:</span>
              <div className="flex gap-2">
                {socialItems.filter(i => i.show).map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={idx}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white transition-all duration-300 ${item.color} hover:scale-110`}
                    >
                      <Icon size={18} />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutBlockNineOne;