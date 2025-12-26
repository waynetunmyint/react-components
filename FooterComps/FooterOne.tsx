"use client";
import React, { useEffect, useState } from "react";
import { MapPin, Phone, Mail, Clock, Globe, Facebook, Twitter, Linkedin, Instagram, Youtube, SquareRoundCorner, Send } from "lucide-react";
import { APP_NAME, BASE_URL, IMAGE_URL, PAGE_ID } from "../../../config";
import { handleOpenLink, normalizeUrl } from "../HelperComps/TextCaseComp";



const SkeletonLoader = () => (
    <footer id="page-footer-skeleton">
        <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-pulse">
                <div className="space-y-4">
                    <div className="h-6 footer-bg-secondary rounded w-32"></div>
                    <div className="h-4 footer-bg-secondary rounded w-full"></div>
                    <div className="h-4 footer-bg-secondary rounded w-3/4"></div>
                </div>
                <div className="space-y-4">
                    <div className="h-6 footer-bg-secondary rounded w-32"></div>
                    <div className="h-4 footer-bg-secondary rounded w-full"></div>
                    <div className="h-4 footer-bg-secondary rounded w-full"></div>
                </div>
                <div className="space-y-4">
                    <div className="h-6 footer-bg-secondary rounded w-32"></div>
                    <div className="h-4 footer-bg-secondary rounded w-full"></div>
                    <div className="h-4 footer-bg-secondary rounded w-3/4"></div>
                </div>
            </div>
        </div>
    </footer>
);

const isValidUrl = (url: any) => {
    if (!url) return false;
    const s = String(url).trim();
    return s !== "" && s.toLowerCase() !== "null" && s !== "-";
};


interface Props {
    className?: string;
}

const CACHE_KEY = `footer_${PAGE_ID}`;
const FRESH_MS = 5 * 60 * 1000; // 5 minutes

export const FooterOne: React.FC<Props> = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [currentUrl, setCurrentUrl] = useState<string>("");

    useEffect(() => {
        setCurrentUrl(window.location.href);

        let cancelled = false;

        (async () => {
            // 1. Show cached data immediately
            try {
                const raw = localStorage.getItem(CACHE_KEY);
                if (raw) {
                    const { d, t } = JSON.parse(raw);
                    if (d) {
                        setData(d);
                        setLoading(false);
                        if (Date.now() - t < FRESH_MS) return; // Still fresh
                    }
                }
            } catch { localStorage.removeItem(CACHE_KEY); }

            // 2. Fetch fresh data
            try {
                const res = await fetch(`${BASE_URL}/contactInfo/api/byPageId/${PAGE_ID}`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const result = await res.json();
                const item = Array.isArray(result) ? result[0] : result;

                if (!cancelled && item) {
                    localStorage.setItem(CACHE_KEY, JSON.stringify({ d: item, t: Date.now() }));
                    setData(item);
                }
            } catch (e) {
                console.error("Footer fetch error:", e);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, []);

    if (loading && !data) {
        return <SkeletonLoader />;
    }

    if (!data) {
        return (
            <footer className="footer-bg-primary footer-text-primary py-8">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="footer-text-secondary">Footer content unavailable</p>
                </div>
            </footer>
        );
    }

    return (
        <footer className="bg-[var(--theme-footer-bg)]">
            <div className="max-w-7xl mx-auto px-4 py-12 text-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Column 1: Google Map */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold uppercase tracking-wide mb-4" style={{ color: 'var(--theme-footer-text)' }}>Find Us</h3>
                        {data.GoogleMapCode ? (
                            <div
                                className="w-full h-64 rounded-lg overflow-hidden"
                                dangerouslySetInnerHTML={{ __html: data.GoogleMapCode }}
                            />
                        ) : (
                            <div className="w-full h-64  rounded-lg flex items-center justify-center">
                                <MapPin size={48} className="text-gray-600" />
                            </div>
                        )}
                    </div>

                    {/* Column 2: About + QR Code */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold uppercase tracking-wide mb-4" style={{ color: 'var(--theme-footer-text)' }}>{data.Title || "About Us"}</h3>
                        <div className="flex items-center gap-3 mb-4">
                            <img
                                src={`${IMAGE_URL}/uploads/${data?.Thumbnail}`}
                                alt="Logo"
                                className="w-12 h-12 object-contain rounded-lg"
                            />
                            <h4 className="text-xl font-bold" style={{ color: 'var(--theme-footer-text)' }}>{data.Title || "Company Name"}</h4>
                        </div>
                        <p className="text-sm leading-relaxed line-clamp-4" style={{ color: 'var(--theme-footer-text-muted)' }}>
                            {data.Description || "We provide exceptional services and solutions to help your business grow and succeed in the digital world."}
                        </p>


                        {/* Social Media Links */}
                        <div className="flex gap-3 pt-4 flex-wrap">
                            {isValidUrl(data?.WebsiteURL) && (
                                <a
                                    href={normalizeUrl(data.WebsiteURL)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Website"
                                    className="w-9 h-9 rounded-full footer-bg-secondary hover:bg-emerald-600 flex items-center justify-center transition"
                                >
                                    <Globe size={18} />
                                </a>
                            )}
                            {isValidUrl(data?.FacebookURL) && (
                                <a
                                    href={normalizeUrl(data.FacebookURL)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Facebook"
                                    className="w-9 h-9 rounded-full footer-bg-secondary hover:bg-blue-600 flex items-center justify-center transition"
                                >
                                    <Facebook size={18} className="bg-transparent" />
                                </a>
                            )}
                            {isValidUrl(data?.TwitterURL) && (
                                <a
                                    href={normalizeUrl(data.TwitterURL)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Twitter"
                                    className="w-9 h-9 rounded-full footer-bg-secondary hover:bg-blue-400 flex items-center justify-center transition"
                                >
                                    <Twitter size={18} />
                                </a>
                            )}
                            {isValidUrl(data?.InstagramURL) && (
                                <a
                                    href={normalizeUrl(data.InstagramURL)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Instagram"
                                    className="w-9 h-9 rounded-full footer-bg-secondary hover:bg-pink-600 flex items-center justify-center transition"
                                >
                                    <Instagram size={18} />
                                </a>
                            )}
                            {isValidUrl(data?.LinkedinURL || data?.LinkedInURL) && (
                                <a
                                    href={normalizeUrl(data.LinkedinURL || data.LinkedInURL)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="LinkedIn"
                                    className="w-9 h-9 rounded-full footer-bg-secondary hover:bg-blue-700 flex items-center justify-center transition"
                                >
                                    <Linkedin size={18} />
                                </a>
                            )}
                            {isValidUrl(data?.YoutubeURL) && (
                                <a
                                    href={normalizeUrl(data.YoutubeURL)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="YouTube"
                                    className="w-9 h-9 rounded-full footer-bg-secondary hover:bg-red-600 flex items-center justify-center transition"
                                >
                                    <Youtube size={18} />
                                </a>
                            )}
                            {isValidUrl(data?.TiktokURL || data?.TikTokURL) && (
                                <a
                                    href={normalizeUrl(data.TiktokURL || data.TikTokURL)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="TikTok"
                                    className="w-9 h-9 rounded-full footer-bg-secondary hover:bg-black flex items-center justify-center transition"
                                >
                                    <SquareRoundCorner size={18} />
                                </a>
                            )}
                            {isValidUrl(data?.TelegramURL) && (
                                <a
                                    href={normalizeUrl(data.TelegramURL)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Telegram"
                                    className="w-9 h-9 rounded-full footer-bg-secondary hover:bg-sky-500 flex items-center justify-center transition"
                                >
                                    <Send size={18} />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Column 3: Contact Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold uppercase tracking-wide mb-4" style={{ color: 'var(--theme-footer-text)' }}>Contact Info</h3>
                        <div className="space-y-4">
                            {data.Address && (
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--theme-primary-bg)' }}>
                                        <MapPin size={16} className="text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-sm mb-1" style={{ color: 'var(--theme-footer-text, #F9FAFB)' }}>Address:</p>
                                        <p className="text-sm" style={{ color: 'var(--theme-footer-text-muted, #9CA3AF)' }}>{data.Address}</p>
                                    </div>
                                </div>
                            )}
                            {data.PhoneOne && (
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--theme-primary-bg)' }}>
                                        <Phone size={16} className="text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-sm mb-1" style={{ color: 'var(--theme-footer-text, #F9FAFB)' }}>Phone:</p>
                                        <a
                                            href={`tel:${data.PhoneOne}`}
                                            className="text-sm hover:underline" style={{ color: 'var(--theme-footer-text-muted, #9CA3AF)' }}
                                        >
                                            {data.PhoneOne}
                                        </a>
                                    </div>
                                </div>
                            )}
                            {data.Email && (
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--theme-primary-bg)' }}>
                                        <Mail size={16} className="text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-sm mb-1" style={{ color: 'var(--theme-footer-text, #F9FAFB)' }}>Email:</p>
                                        <a
                                            href={`mailto:${data.Email}`}
                                            className="text-sm break-all hover:underline" style={{ color: 'var(--theme-footer-text-muted, #9CA3AF)' }}
                                        >
                                            {data.Email}
                                        </a>
                                    </div>
                                </div>
                            )}
                            {isValidUrl(data.WebsiteURL) && (
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--theme-primary-bg)' }}>
                                        <Globe size={16} className="text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-sm mb-1" style={{ color: 'var(--theme-footer-text, #F9FAFB)' }}>Web:</p>
                                        <a
                                            href={normalizeUrl(data.WebsiteURL)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm break-all hover:underline" style={{ color: 'var(--theme-footer-text-muted, #9CA3AF)' }}
                                        >
                                            {data.WebsiteURL}
                                        </a>
                                    </div>
                                </div>
                            )}
                            {isValidUrl(data.FacebookURL) && (
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--theme-primary-bg)' }}>
                                        <Facebook size={16} className="text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-sm mb-1" style={{ color: 'var(--theme-footer-text, #F9FAFB)' }}>Facebook:</p>
                                        <a
                                            href={normalizeUrl(data.FacebookURL)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm break-all hover:underline" style={{ color: 'var(--theme-footer-text-muted, #9CA3AF)' }}
                                        >
                                            {data.FacebookURL}
                                        </a>
                                    </div>
                                </div>
                            )}
                            {isValidUrl(data.TwitterURL) && (
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--theme-primary-bg)' }}>
                                        <Twitter size={16} className="text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-sm mb-1" style={{ color: 'var(--theme-footer-text, #F9FAFB)' }}>Twitter:</p>
                                        <a
                                            href={normalizeUrl(data.TwitterURL)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm break-all hover:underline" style={{ color: 'var(--theme-footer-text-muted, #9CA3AF)' }}
                                        >
                                            {data.TwitterURL}
                                        </a>
                                    </div>
                                </div>
                            )}
                            {isValidUrl(data.InstagramURL) && (
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--theme-primary-bg)' }}>
                                        <Instagram size={16} className="text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-sm mb-1" style={{ color: 'var(--theme-footer-text, #F9FAFB)' }}>Instagram:</p>
                                        <a
                                            href={normalizeUrl(data.InstagramURL)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm break-all hover:underline" style={{ color: 'var(--theme-footer-text-muted, #9CA3AF)' }}
                                        >
                                            {data.InstagramURL}
                                        </a>
                                    </div>
                                </div>
                            )}
                            {isValidUrl(data.LinkedinURL || data.LinkedInURL) && (
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--theme-primary-bg)' }}>
                                        <Linkedin size={16} className="text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-sm mb-1" style={{ color: 'var(--theme-footer-text, #F9FAFB)' }}>LinkedIn:</p>
                                        <a
                                            href={normalizeUrl(data.LinkedinURL || data.LinkedInURL)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm break-all hover:underline" style={{ color: 'var(--theme-footer-text-muted, #9CA3AF)' }}
                                        >
                                            {data.LinkedinURL || data.LinkedInURL}
                                        </a>
                                    </div>
                                </div>
                            )}
                            {isValidUrl(data.YoutubeURL) && (
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--theme-primary-bg)' }}>
                                        <Youtube size={16} className="text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-sm mb-1" style={{ color: 'var(--theme-footer-text, #F9FAFB)' }}>Youtube:</p>
                                        <a
                                            href={normalizeUrl(data.YoutubeURL)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm break-all hover:underline" style={{ color: 'var(--theme-footer-text-muted, #9CA3AF)' }}
                                        >
                                            {data.YoutubeURL}
                                        </a>
                                    </div>
                                </div>
                            )}
                            {isValidUrl(data.TiktokURL || data.TikTokURL) && (
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--theme-primary-bg)' }}>
                                        <SquareRoundCorner size={16} className="text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-sm mb-1" style={{ color: 'var(--theme-footer-text, #F9FAFB)' }}>TikTok:</p>
                                        <a
                                            href={normalizeUrl(data.TiktokURL || data.TikTokURL)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm break-all hover:underline" style={{ color: 'var(--theme-footer-text-muted, #9CA3AF)' }}
                                        >
                                            {data.TiktokURL || data.TikTokURL}
                                        </a>
                                    </div>
                                </div>
                            )}
                            {isValidUrl(data.TelegramURL) && (
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--theme-primary-bg)' }}>
                                        <Send size={16} className="text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-sm mb-1" style={{ color: 'var(--theme-footer-text, #F9FAFB)' }}>Telegram:</p>
                                        <a
                                            href={normalizeUrl(data.TelegramURL)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm break-all hover:underline" style={{ color: 'var(--theme-footer-text-muted, #9CA3AF)' }}
                                        >
                                            {data.TelegramURL}
                                        </a>
                                    </div>
                                </div>
                            )}
                            {data.OpenTime && (
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--theme-primary-bg)' }}>
                                        <Clock size={16} className="text-[var(--theme-primary-text)]" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-sm mb-1" style={{ color: 'var(--theme-footer-text)' }}>Open:</p>
                                        <p className="text-sm" style={{ color: 'var(--theme-footer-text-muted)' }}>{data.OpenTime}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {/* Bottom Bar */}
                <div className="border-t mt-12 pt-6 text-center" style={{ borderColor: 'var(--theme-border-primary)' }}>
                    <p className="text-sm text-gray-200" >
                        © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
                    </p>
                    <a
                        href="https://mwscompany.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-center text-xs text-gray-500 hover:underline block mt-1"
                        style={{ cursor: 'pointer' }}
                    >
                        Web/App Designer MWS Digital Agency
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default FooterOne;