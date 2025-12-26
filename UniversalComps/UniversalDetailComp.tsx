import React, { useEffect, useState } from "react";
import { Phone, Mail, MapPin, Info, ExternalLink } from "lucide-react";
import { BASE_URL, IMAGE_URL } from "../../config";

interface Props {
  customAPI: string;
  imageField?: string;
  coverField?: string;
  headingField?: string;
  subHeadingFields?: string[];
  dataFields?: string[];
  latitudeField?: string;
  longitudeField?: string;
  badgeImage?: string;
}

const isValidValue = (val: any) =>
  val !== null && val !== undefined && val !== "-" && val !== "null" && val !== "";

const detectFieldType = (val: string) => {
  if (!val || !isValidValue(val)) return "text";
  if (/^\+?[0-9\s\-]{5,20}$/.test(val)) return "phone";
  if (/^[\w.-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(val)) return "email";
  if (/^https?:\/\//.test(val)) return "url";
  return "text";
};

const UniversalDetailComp: React.FC<Props> = ({
  customAPI,
  imageField,
  coverField,
  headingField,
  subHeadingFields = [],
  dataFields = [],
  latitudeField,
  longitudeField,
  badgeImage,
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    getDetail();
  }, [customAPI]);

  const getDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}${customAPI}`);
      if (!response.ok) {
        console.error("HTTP error:", response.status, response.statusText);
        setData(null);
        setLoading(false);
        return;
      }
      const result = await response.json();
      setData(result.length > 0 ? result[0] : null);
    } catch (error) {
      console.error("Network error:", error);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const latitude = latitudeField ? Number(data?.[latitudeField]) : 0;
  const longitude = longitudeField ? Number(data?.[longitudeField]) : 0;

  const renderField = (field: string) => {
    const valText = data[field];
    if (!isValidValue(valText)) return null;

    const type = detectFieldType(valText);

    let href = "#";
    let icon: React.ReactNode = <></>;
    let actionText = "";

    switch (type) {
      case "phone":
        href = `tel:${valText}`;
        icon = <Phone className="w-5 h-5 text-blue-500" />;
        actionText = "Call";
        break;
      case "email":
        href = `mailto:${valText}`;
        icon = <Mail className="w-5 h-5 text-red-500" />;
        actionText = "Email";
        break;
      case "url":
        href = valText;
        icon = <ExternalLink className="w-5 h-5 text-green-500" />;
        actionText = "Visit";
        break;
      default:
        icon = <Info className="w-5 h-5 text-gray-500" />;
    }

    return (
      <a
        key={field}
        href={href}
        target={type === "url" ? "_blank" : undefined}
        className="flex items-center justify-between py-4 px-4 hover:bg-gray-100 rounded-xl transition"
      >
        <div className="flex items-center gap-3 truncate">
          {icon}
          <span className="text-gray-800 text-[15px] truncate">{valText}</span>
        </div>
        {actionText && (
          <span className="text-sm font-medium text-blue-500">{actionText}</span>
        )}
      </a>
    );
  };

  // Skeleton Loader
  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen animate-pulse">
        <div className="w-full h-56 bg-gray-200 rounded-b-2xl" />
        <div className="absolute left-1/2 -bottom-12 transform -translate-x-1/2">
          <div className="w-28 h-28 bg-gray-300 rounded-2xl border-4 border-white shadow-md" />
        </div>
        <div className="mt-20 px-5 text-center">
          <div className="h-6 w-40 bg-gray-300 mx-auto rounded" />
          <div className="mt-2 h-4 w-24 bg-gray-300 mx-auto rounded" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Cover + Profile Image */}
      <div className="relative">
        {coverField && isValidValue(data[coverField]) ? (
          <img
            src={`${IMAGE_URL}/uploads/${data[coverField]}`}
            alt={headingField ? data[headingField] : "Detail Cover"}
            className="w-full h-56 object-cover rounded-b-2xl"
          />
        ) : (
          <div className="w-full h-56 bg-gradient-to-r from-blue-100 to-blue-200 rounded-b-2xl" />
        )}

        {imageField && isValidValue(data[imageField]) && (
          <div className="absolute left-1/2 -bottom-12 transform -translate-x-1/2">
            <img
              src={`${IMAGE_URL}/uploads/${data[imageField]}`}
              alt={headingField ? data[headingField] : "Detail Avatar"}
              className="w-28 h-28 object-cover rounded-2xl border-4 border-white shadow-md"
            />
            {badgeImage && isValidValue(data[badgeImage]) && (
              <img
                src={`${IMAGE_URL}/uploads/${data[badgeImage]}`}
                alt="Badge"
                className="absolute -top-3 -right-3 w-10 h-10 object-contain rounded-full shadow-sm border-2 border-white"
              />
            )}
          </div>
        )}
      </div>

      {/* Heading + Subheadings */}
      <div className="mt-16 px-5 text-center">
        {headingField && isValidValue(data[headingField]) && (
          <h1 className="text-2xl font-semibold text-gray-900">
            {data[headingField]}
          </h1>
        )}
        <div className="mt-1 space-y-1">
          {subHeadingFields.map(
            (sub) =>
              isValidValue(data[sub]) && (
                <p key={sub} className="text-sm text-gray-500 line-clamp-1">
                  {data[sub]}
                </p>
              )
          )}
        </div>
      </div>

      {/* Editor Note */}
      {isValidValue(data.EditorNote) && (
        <div className="mx-5 mt-5 bg-blue-50 rounded-xl p-4 shadow-sm">
          <p className="text-gray-800 text-sm leading-relaxed text-center">
            <span className="font-medium ">Editor Note:</span>{" "}
            {data.EditorNote}
          </p>
        </div>
      )}

      {/* Data Fields */}
      {dataFields.length > 0 && (
        <div className="mx-5 mt-6 bg-white rounded-xl shadow-sm divide-y">
          {dataFields.map((field) => renderField(field))}
        </div>
      )}

      {/* Map */}
      {latitude && longitude && latitude !== 0 && longitude !== 0 && (
        <div className="mx-5 mt-6 bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4" /> Location
          </h2>
          <iframe
            className="w-full h-64 rounded-lg"
            src={`https://www.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`}
            loading="lazy"
          />
          <button
            onClick={() =>
              (window.location.href = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`)
            }
            className="mt-4 w-full bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-600 transition"
          >
            Open in Maps
          </button>
        </div>
      )}
    </div>
  );
};

export default UniversalDetailComp;
