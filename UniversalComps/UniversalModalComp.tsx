// components/UniversalModalComp.tsx
import React from "react";
import { X, MapPin } from "lucide-react";
import { IMAGE_URL } from "../../config";

interface UniversalModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any | null; // business or item
  imageField?: string;
  headingField?: string;
  subHeadingField1?: string;
  subHeadingField2?: string;
  subHeadingField3?: string;
  subHeadingField4?: string;
}

const UniversalModalComp: React.FC<UniversalModalProps> = ({
  isOpen,
  onClose,
  data,
  imageField,
  headingField,
  subHeadingField1,
  subHeadingField2,
  subHeadingField3,
  subHeadingField4,
}) => {
  if (!isOpen || !data) return null;

  const handleOpenInGoogleMaps = () => {
    if (data.Latitude && data.Longitude) {
      const url = `https://www.google.com/maps?q=${data.Latitude},${data.Longitude}`;
      window.open(url, "_blank");
    }
  };

  // helper to check valid value
  const isValidValue = (val: any) => {
    if (val === null || val === undefined) return false;
    if (typeof val === "string") {
      const trimmed = val.trim().toLowerCase();
      return trimmed !== "" && trimmed !== "null" && trimmed !== "-";
    }
    return true;
  };

  const renderField = (label: string, field?: string) => {
    if (!field) return null;
    const value = data[field];
    if (!isValidValue(value)) return null;

    return (
      <p className="text-gray-700">
        <span className="font-semibold">{label}:</span> {value}
      </p>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-4 mx-4">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-2 mb-3">
          <h2 className="text-lg font-semibold text-gray-800">
            {headingField && isValidValue(data[headingField])
              ? data[headingField]
              : ""}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-3">
          {imageField && isValidValue(data[imageField]) && (
            <img
              className="w-full h-48 object-cover rounded-xl"
              src={IMAGE_URL + "/uploads/" + data[imageField]}
              alt={headingField && isValidValue(data[headingField])
                ? data[headingField]
                : "Item"}
            />
          )}

          {renderField(subHeadingField1 || "", subHeadingField1)}
          {renderField(subHeadingField2 || "", subHeadingField2)}
          {renderField(subHeadingField3 || "", subHeadingField3)}
          {renderField(subHeadingField4 || "", subHeadingField4)}

          {/* Open in Google Maps button */}
          {isValidValue(data.Latitude) && isValidValue(data.Longitude) && (
            <button
              onClick={handleOpenInGoogleMaps}
              className="w-full mt-3 bg-blue-500 text-white py-3 rounded-xl font-medium flex items-center justify-center space-x-2 hover:bg-blue-600"
            >
              <MapPin className="w-5 h-5" />
              <span>Open in Google Maps</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UniversalModalComp;
