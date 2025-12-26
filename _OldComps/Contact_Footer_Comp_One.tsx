"use client";
import React, { useEffect, useState } from "react";
import { MapPin, Phone, Mail, Clock, Globe, Facebook, Twitter, Linkedin, Instagram, Youtube, SquareRoundCorner } from "lucide-react";
import {APP_NAME, BASE_URL, IMAGE_URL} from "../../config";



const SkeletonLoader = () => (
  <footer className={`bg-gray-900 text-white`}>
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-pulse">
        <div className="space-y-4">
          <div className="h-6 bg-gray-700 rounded w-32"></div>
          <div className="h-4 bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
        </div>
        <div className="space-y-4">
          <div className="h-6 bg-gray-700 rounded w-32"></div>
          <div className="h-4 bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-700 rounded w-full"></div>
        </div>
        <div className="space-y-4">
          <div className="h-6 bg-gray-700 rounded w-32"></div>
          <div className="h-4 bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
        </div>
      </div>
    </div>
  </footer>
);



export const ContactFooterCompOne: React.FC<Props> = () => {
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
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400">Footer content unavailable</p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1: Google Map */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-orange-400 uppercase tracking-wide mb-4">Find Us</h3>
            {data.GoogleMapCode ? (
              <div
                className="w-full h-64 rounded-lg overflow-hidden"
                dangerouslySetInnerHTML={{ __html: data.GoogleMapCode }}
              />
            ) : (
              <div className="w-full h-64 bg-gray-800 rounded-lg flex items-center justify-center">
                <MapPin size={48} className="text-gray-600" />
              </div>
            )}
          </div>

          {/* Column 2: About */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-orange-400 uppercase tracking-wide mb-4">About Us</h3>
            <div className="flex items-center gap-3 mb-4">
              <img
                src={`${IMAGE_URL}/uploads/${data?.Thumbnail}`}
                alt="Logo"
                className="w-12 h-12 object-contain rounded-lg"
              />
              <h4 className="text-xl font-bold">{data.Title || "Company Name"}</h4>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed  line-clamp-4">
              {data.Description || "We provide exceptional services and solutions to help your business grow and succeed in the digital world."}
            </p>

            {/* Social Media Links */}
            <div className="flex gap-3 pt-4">
              {data?.FacebookURL && (
                <a
                  href={data.FacebookURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-gray-800 hover:bg-blue-600 flex items-center justify-center transition"
                >
                  <Facebook size={18} />
                </a>
              )}

              {data?.TwitterURL && (
                <a
                  href={data.TwitterURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-gray-800 hover:bg-blue-400 flex items-center justify-center transition"
                >
                  <Twitter size={18} />
                </a>
              )}

              {data?.InstagramURL && (
                <a
                  href={data.InstagramURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-gray-800 hover:bg-pink-600 flex items-center justify-center transition"
                >
                  <Instagram size={18} />
                </a>
              )}

              {data?.LinkedinURL && (
                <a
                  href={data.LinkedinURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-gray-800 hover:bg-blue-700 flex items-center justify-center transition"
                >
                  <Linkedin size={18} />
                </a>
              )}

              {data?.YoutubeURL && (
                <a
                  href={data.YoutubeURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-gray-800 hover:bg-red-600 flex items-center justify-center transition"
                >
                  <Youtube size={18} />
                </a>
              )}

              {data?.TiktokURL && (
                <a
                  href={data.TiktokURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-gray-800 hover:bg-black flex items-center justify-center transition"
                >
                  <SquareRoundCorner size={18} />
                </a>
              )}
            </div>

          </div>

          {/* Column 3: Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-orange-400 uppercase tracking-wide mb-4 ">Contact Info</h3>
            <div className="space-y-4">
              {data.Address && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-900 flex items-center justify-center">
                    <MapPin size={16} className="text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white text-sm mb-1">Address:</p>
                    <p className="text-gray-400 text-sm">{data.Address}</p>
                  </div>
                </div>
              )}

              {data.PhoneOne && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-900 flex items-center justify-center">
                    <Phone size={16} className="text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white text-sm mb-1">Phone:</p>
                    <a
                      href={`tel:${data.PhoneOne}`}
                      className="text-gray-400 hover:text-orange-400 transition text-sm"
                    >
                      {data.PhoneOne}
                    </a>
                  </div>
                </div>
              )}

              {data.Email && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-900 flex items-center justify-center">
                    <Mail size={16} className="text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white text-sm mb-1">Email:</p>
                    <a
                      href={`mailto:${data.Email}`}
                      className="text-gray-400 hover:text-orange-400 transition text-sm break-all"
                    >
                      {data.Email}
                    </a>
                  </div>
                </div>
              )}

              {data.WebsiteURL && data.WebsiteURL !== "-" && data.WebsiteURL !== "null" && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-900 flex items-center justify-center">
                    <Globe size={16} className="text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white text-sm mb-1">Web:</p>
                    <a
                      href={data.WebsiteURL.startsWith('http') ? data.WebsiteURL : `https://${data.WebsiteURL}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-orange-400 transition text-sm break-all"
                    >
                      {data.WebsiteURL}
                    </a>
                  </div>
                </div>
              )}

              {data.OpenTime && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-900 flex items-center justify-center">
                    <Clock size={16} className="text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white text-sm mb-1">Open:</p>
                    <p className="text-gray-400 text-sm">{data.OpenTime}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-6 text-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default ContactFooterCompOne;