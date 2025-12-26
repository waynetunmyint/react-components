import React from "react";
import { MapPin, Navigation } from "lucide-react";

interface MapFieldProps {
  field: any;
  latitude: string;
  longitude: string;
  setLatitude: (val: string) => void;
  setLongitude: (val: string) => void;
}

const MapField: React.FC<MapFieldProps> = ({
  field,
  latitude,
  longitude,
  setLatitude,
  setLongitude,
}) => {
  const hasCoordinates = latitude !== "0" && longitude !== "0";

  return (
    <div key={field.fieldName} className="md:grid md:grid-cols-[180px_1fr] md:gap-4 md:items-start space-y-2 md:space-y-0">
      {/* Label */}
      <div className="md:pt-3">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <MapPin size={14} className="text-rose-500" />
          {field.fieldName}
        </label>
        {hasCoordinates && (
          <span className="text-xs text-green-600 flex items-center gap-1 mt-1">
            <Navigation size={10} /> Set
          </span>
        )}
      </div>

      {/* Coordinate Inputs */}
      <div className="grid grid-cols-2 gap-3">
        {/* Latitude */}
        <div>
          <label className="flex items-center gap-1 text-xs font-semibold text-gray-500 mb-1">
            <span className="w-3 h-3 rounded bg-rose-100 flex items-center justify-center text-rose-600 text-[8px] font-bold">N</span>
            Lat
          </label>
          <input
            type="text"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            placeholder="16.8661"
            className={`w-full border-2 bg-white text-gray-900 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 focus:ring-4 focus:ring-rose-500/20 focus:outline-none ${latitude && latitude !== "0"
              ? "border-rose-500 bg-rose-50"
              : "border-gray-200 hover:border-rose-400 focus:border-rose-500"
              }`}
            required
          />
        </div>

        {/* Longitude */}
        <div>
          <label className="flex items-center gap-1 text-xs font-semibold text-gray-500 mb-1">
            <span className="w-3 h-3 rounded bg-blue-100 flex items-center justify-center text-blue-600 text-[8px] font-bold">E</span>
            Lng
          </label>
          <input
            type="text"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            placeholder="96.1951"
            className={`w-full border-2 bg-white text-gray-900 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 focus:ring-4 focus:ring-blue-500/20 focus:outline-none ${longitude && longitude !== "0"
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 hover:border-blue-400 focus:border-blue-500"
              }`}
            required
          />
        </div>
      </div>
    </div>
  );
};

export default MapField;
