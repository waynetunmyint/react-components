"use client";
import React, { useEffect, useState } from "react";
import { BASE_URL, IMAGE_URL } from "../../../config";
import { ExternalLink, ImageIcon } from "lucide-react";
import { handleOpenLink, normalizeUrl } from "../HelperComps/TextCaseComp";

// Enhanced Skeleton Loader
const SkeletonLoader = () => (
  <div className="flex flex-col lg:flex-row w-full bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden border border-gray-50">
    <div className="lg:w-2/5 p-8 flex justify-center items-center bg-slate-50 relative overflow-hidden">
      <div className="w-full aspect-square bg-slate-100 rounded-[2rem] shadow-inner" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
    </div>
    <div className="lg:w-3/5 flex flex-col p-10 space-y-8">
      <div className="space-y-4">
        <div className="h-10 bg-slate-100 rounded-xl w-3/4 animate-pulse" />
        <div className="h-4 bg-slate-50 rounded-full w-1/2 animate-pulse" />
      </div>
      <div className="space-y-4 pt-4">
        <div className="h-4 bg-slate-50 rounded-full w-full animate-pulse" />
        <div className="h-4 bg-slate-50 rounded-full w-11/12 animate-pulse" />
        <div className="h-4 bg-slate-50 rounded-full w-4/5 animate-pulse" />
      </div>
      <div className="flex gap-4 pt-8 border-t border-slate-50">
        <div className="h-12 w-32 bg-slate-100 rounded-2xl animate-pulse" />
        <div className="h-12 w-32 bg-slate-100 rounded-2xl animate-pulse" />
      </div>
    </div>
  </div>
);

const getTextColorClass = (colorName?: string) => {
  if (!colorName) return "text-gray-800";
  const colorMap: Record<string, string> = {
    red: "text-red-700",
    blue: "text-blue-700",
    green: "text-green-700",
    yellow: "text-yellow-700",
    orange: "text-orange-700",
    purple: "text-purple-700",
    pink: "text-pink-700",
    gray: "text-gray-700",
  };
  return colorMap[colorName] || "text-gray-800";
};

interface Props {
  customAPI: string;
  imageField?: string;
  headingField: string;
  headingColor?: string;
  subHeadingField?: string;
  subHeadingColor?: string;
  subHeadingField1?: string;
  subHeadingColor1?: string;
  subHeadingField2?: string;
  subHeadingColor2?: string;
  subHeadingField3?: string;
  subHeadingColor3?: string;
}

const UniversalViewComp: React.FC<Props> = ({
  customAPI,
  imageField = "Thumbnail",
  headingField,
  headingColor,
  subHeadingField,
  subHeadingColor,
  subHeadingField1,
  subHeadingColor1,
  subHeadingField2,
  subHeadingColor2,
  subHeadingField3,
  subHeadingColor3,
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [imageError, setImageError] = useState<boolean>(false);

  useEffect(() => {
    fetchData();
  }, [customAPI]);

  const fetchData = async () => {
    try {
      const response = await fetch(`${BASE_URL}${customAPI}`);
      console.log("URL", `${BASE_URL}${customAPI}`);
      const result = await response.json();
      setData(result?.[0] || null);
      console.log("Select Data", result?.[0]);
    } catch (error) {
      console.error("Error fetching data:", error);
      setData(null);
    } finally {
      setLoading(false);
    }
  };


  const renderLinkButton = (url: string | undefined, label: string, icon = ExternalLink) => {
    if (!url || url === "null" || url === "-") return null;

    const Icon = icon;
    const colorClasses: Record<string, string> = {
      Web: "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200",
      Android: "bg-green-50 text-green-700 hover:bg-green-100 border-green-200",
      iOS: "bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200",
    };

    return (
      <button
        onClick={() => handleOpenLink(url)}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all duration-200 text-sm font-medium shadow-sm hover:shadow ${colorClasses[label] || "bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200"}`}
      >
        <Icon size={16} />
        {label}
      </button>
    );
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {loading ? (
        <div className="max-w-6xl mx-auto">
          <SkeletonLoader />
        </div>
      ) : data ? (
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row w-full bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 transition-shadow duration-300 hover:shadow-xl">
            {/* Left: Image Section */}
            <div className="lg:w-2/5 p-6 flex justify-center items-center bg-gradient-to-br from-gray-50 to-gray-100">
              {data[imageField] && !imageError ? (
                <div className="w-full">
                  <img
                    src={`${IMAGE_URL}/uploads/${data[imageField]}`}
                    alt={data[headingField] || "Image"}
                    className="w-full aspect-square object-cover rounded-xl shadow-md border border-gray-200 transition-transform duration-300 hover:scale-[1.02]"
                    onError={() => setImageError(true)}
                  />
                </div>
              ) : (
                <div className="w-full aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-300">
                  <ImageIcon size={48} strokeWidth={1.5} />
                  <p className="mt-3 text-sm font-medium">No Image Available</p>
                </div>
              )}
            </div>

            {/* Right: Content Section */}
            <div className="lg:w-3/5 flex flex-col p-8 space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <h1 className={`text-3xl lg:text-4xl font-bold ${getTextColorClass(headingColor)} leading-tight`}>
                  {data[headingField]}
                </h1>
              </div>

              {/* Subheadings */}
              <div className="space-y-4">
                {subHeadingField && data[subHeadingField] && (
                  <div className="prose prose-gray max-w-none">
                    <p className={`text-base leading-relaxed ${getTextColorClass(subHeadingColor)} whitespace-pre-wrap`}>
                      {data[subHeadingField]}
                    </p>
                  </div>
                )}

                {subHeadingField1 && data[subHeadingField1] && (
                  <div className="flex items-start gap-2">
                    <span className={`text-base leading-relaxed ${getTextColorClass(subHeadingColor1)} whitespace-pre-wrap`}>
                      {data[subHeadingField1]}
                    </span>
                  </div>
                )}

                {subHeadingField2 && data[subHeadingField2] && (
                  <div className="flex items-start gap-2">
                    <span className="text-gray-500 font-medium min-w-fit">{subHeadingField2}:</span>
                    <span className={`${getTextColorClass(subHeadingColor2)} whitespace-pre-wrap`}>
                      {data[subHeadingField2]}
                    </span>
                  </div>
                )}

                {subHeadingField3 && data[subHeadingField3] && (
                  <div className="flex items-start gap-2">
                    <span className="text-gray-500 font-medium min-w-fit">{subHeadingField3}:</span>
                    <span className={`${getTextColorClass(subHeadingColor3)} whitespace-pre-wrap`}>
                      {data[subHeadingField3]}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                {renderLinkButton(data.WebURL, "Web")}
                {renderLinkButton(data.WebsiteURL, "Web")}
                {renderLinkButton(data.AndroidURL, "Android")}
                {renderLinkButton(data.AppleURL, "iOS")}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center justify-center h-96 text-gray-400 bg-white rounded-2xl shadow-lg border border-gray-100">
            <ImageIcon size={64} strokeWidth={1.5} />
            <p className="mt-4 text-lg font-medium">No data found</p>
            <p className="mt-1 text-sm">Please check your API configuration</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UniversalViewComp;