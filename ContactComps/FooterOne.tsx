"use client";
import React, { useEffect, useState } from "react";
import { MapPin, Phone, Mail, Clock, Globe, Facebook, Twitter, Linkedin, Instagram, Youtube, SquareRoundCorner } from "lucide-react";
import { APP_NAME, BASE_URL, IMAGE_URL, PAGE_ID } from "../../../config";



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



interface Props {
    className?: string;
}

export const FooterOne: React.FC<Props> = () => {
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
        return <SkeletonLoader />;
    }

    if (error || !data) {
        return (
            <footer className="footer-bg-primary footer-text-primary py-8">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="footer-text-secondary">Footer content unavailable</p>
                </div>
            </footer>
        );
    }

    // Get current URL for QR code
    const [currentUrl, setCurrentUrl] = useState<string>("");
    useEffect(() => {
        setCurrentUrl(window.location.href);
    }, []);

    return (
        <footer id="page-footer-primary" className="bg-[var(--theme-footer-bg)] border-t border-[var(--theme-border-primary)]">
            <div className="max-w-7xl mx-auto px-4 py-12 text-[var(--theme-footer-text)]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Column 1: Google Map */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold footer-accent uppercase tracking-wide mb-4">Find Us</h3>
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
                    <div className="space-y-4 flex flex-col items-center justify-center">
                        <h3 className="text-lg font-bold footer-accent uppercase tracking-wide mb-4">About Us</h3>
                        <div className="flex items-center gap-3 mb-4">
                            <img
                                src={`${IMAGE_URL}/uploads/${data?.Thumbnail}`}
                                alt="Logo"
                                className="w-12 h-12 object-contain rounded-lg"
                            />
                            <h4 className="text-xl font-bold" style={{ color: 'var(--theme-footer-text)' }}>{data.Title || "Company Name"}</h4>
                        </div>
                        <p className="footer-text-secondary text-sm leading-relaxed  line-clamp-4">
                            {data.Description || "We provide exceptional services and solutions to help your business grow and succeed in the digital world."}
                        </p>


                        {/* Social Media Links */}
                        <div className="flex gap-3 pt-4">
                            {data?.FacebookURL && (
                                <a
                                    href={data.FacebookURL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Facebook"
                                    className="w-9 h-9 rounded-full bg-white/10 text-white hover:bg-[var(--scolor)] hover:text-white flex items-center justify-center transition-all border border-white/10"
                                >
                                    <Facebook size={18} />
                                </a>
                            )}
                            {data?.TwitterURL && (
                                <a
                                    href={data.TwitterURL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Twitter"
                                    className="w-9 h-9 rounded-full bg-white/10 text-white hover:bg-[var(--scolor)] hover:text-white flex items-center justify-center transition-all border border-white/10"
                                >
                                    <Twitter size={18} />
                                </a>
                            )}
                            {data?.InstagramURL && (
                                <a
                                    href={data.InstagramURL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Instagram"
                                    className="w-9 h-9 rounded-full bg-white/10 text-white hover:bg-[var(--scolor)] hover:text-white flex items-center justify-center transition-all border border-white/10"
                                >
                                    <Instagram size={18} />
                                </a>
                            )}
                            {data?.LinkedinURL && (
                                <a
                                    href={data.LinkedinURL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="LinkedIn"
                                    className="w-9 h-9 rounded-full bg-white/10 text-white hover:bg-[var(--scolor)] hover:text-white flex items-center justify-center transition-all border border-white/10"
                                >
                                    <Linkedin size={18} />
                                </a>
                            )}
                            {data?.YoutubeURL && (
                                <a
                                    href={data.YoutubeURL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="YouTube"
                                    className="w-9 h-9 rounded-full bg-white/10 text-white hover:bg-[var(--scolor)] hover:text-white flex items-center justify-center transition-all border border-white/10"
                                >
                                    <Youtube size={18} />
                                </a>
                            )}
                            {data?.TiktokURL && (
                                <a
                                    href={data.TiktokURL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="TikTok"
                                    className="w-9 h-9 rounded-full bg-white/10 text-white hover:bg-[var(--scolor)] hover:text-white flex items-center justify-center transition-all border border-white/10"
                                >
                                    <SquareRoundCorner size={18} />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Column 3: Contact Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold footer-accent uppercase tracking-wide mb-4 ">Contact Info</h3>
                        <div className="space-y-4">
                            {data.Address && (
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-white shadow-sm">
                                        <MapPin size={16} className="text-[var(--accent-600)]" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold footer-text-primary text-sm mb-1">Address:</p>
                                        <p className="footer-text-secondary text-sm">{data.Address}</p>
                                    </div>
                                </div>
                            )}
                            {data.PhoneOne && (
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-white shadow-sm">
                                        <Phone size={16} className="text-[var(--accent-600)]" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold footer-text-primary text-sm mb-1">Phone:</p>
                                        <a
                                            href={`tel:${data.PhoneOne}`}
                                            className="footer-text-secondary hover:footer-accent transition text-sm"
                                        >
                                            {data.PhoneOne}
                                        </a>
                                    </div>
                                </div>
                            )}
                            {data.Email && (
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-white shadow-sm">
                                        <Mail size={16} className="text-[var(--accent-600)]" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold footer-text-primary text-sm mb-1">Email:</p>
                                        <a
                                            href={`mailto:${data.Email}`}
                                            className="footer-text-secondary hover:footer-accent transition text-sm break-all"
                                        >
                                            {data.Email}
                                        </a>
                                    </div>
                                </div>
                            )}
                            {data.WebsiteURL && data.WebsiteURL !== "-" && data.WebsiteURL !== "null" && (
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-white shadow-sm">
                                        <Globe size={16} className="text-[var(--accent-600)]" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold footer-text-primary text-sm mb-1">Web:</p>
                                        <a
                                            href={data.WebsiteURL.startsWith('http') ? data.WebsiteURL : `https://${data.WebsiteURL}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="footer-text-secondary hover:footer-accent transition text-sm break-all"
                                        >
                                            {data.WebsiteURL}
                                        </a>
                                    </div>
                                </div>
                            )}
                            {data.OpenTime && (
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-white shadow-sm">
                                        <Clock size={16} className="text-[var(--accent-600)]" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold footer-text-primary text-sm mb-1">Open:</p>
                                        <p className="footer-text-secondary text-sm">{data.OpenTime}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {/* Bottom Bar */}
                <div className="footer-border border-t mt-12 pt-6 text-center" style={{ borderColor: 'var(--theme-border-primary)' }}>
                    <p className="text-sm" style={{ color: 'var(--theme-footer-text-muted)' }}>
                        © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default FooterOne;