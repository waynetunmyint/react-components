import React, { useRef, useEffect, useState } from "react";
import { BASE_URL, GOOGLE_MAP_API_KEY } from "../../config";


interface DropdownProps {
  label: string;
  value?: string; // optional if component manages itself
  onChange?: (val: string) => void; // still notifies parent if needed
  apiEndpoint: string;
  required?: boolean;
}

export function UniversalDropdownInput({
  label,
  value,
  onChange,
  apiEndpoint,
  required,
}: DropdownProps) {
  const [options, setOptions] = useState<any[]>([]);
  const [selected, setSelected] = useState<string>(value ?? ""); // internal state

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${BASE_URL}${apiEndpoint}`);
        if (!res.ok) throw new Error("Failed to load dropdown options");
        const data = await res.json();
        setOptions(data);
      } catch (err) {
        console.error(`Dropdown fetch failed for ${label}`, err);
      }
    })();
  }, [apiEndpoint, label]);

  // Sync with external value if it changes
  useEffect(() => {
    if (value !== undefined) {
      setSelected(value);
    }
  }, [value]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelected(val);        // internal update
    onChange?.(val);         // notify parent if provided
  };

  return (
    <div>
      <label className="block mb-1 font-semibold text-gray-700">{label}</label>
      <select
        value={selected}
        onChange={handleSelectChange}
        className="w-full m-2 h-[75px] bg-white border border-gray-300 rounded px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500"
        required={required}
      >
        <option value="">Select {label}</option>
        {options.map((opt: any, i: number) => {
          const val = opt.id ?? opt.Id;
          const name = opt.Name ?? opt.Label ?? val;
          return (
            <option key={i} value={val}>
              #{val} - {name}
            </option>
          );
        })}
      </select>
    </div>
  );
}

// Add global type for window.google
declare global {
  interface Window {
    google?: any;
  }
}

interface BaseProps {
  label: string;
  value: any;
  onChange: (val: any) => void;
  required?: boolean;
}

// ✅ Text, Email, Number Input
export function TextInput({ label, value, onChange, required, type = "text" }: BaseProps & { type?: string }) {
  return (
    <div>
      <label className="block mb-1 font-semibold text-gray-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={"Enter " + label}
        className="w-full border border-gray-300 text-gray-700 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
        required={required}
      />
    </div>
  );
}

// ✅ Textarea Input
export function TextAreaInput({ label, value, onChange, required }: BaseProps) {
  return (
    <div>
      <label className="block mb-1 font-semibold text-gray-700">{label}</label>
      <textarea
        rows={5}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={"Enter " + label}
        className="w-full border text-gray-700 border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
        required={required}
      />
    </div>
  );
}


// ✅ File Upload Input
export function FileInput({ label, onChange, required }: { label: string; onChange: (file: File | null) => void; required?: boolean }) {
  return (
    <div>
      <label className="block mb-1 font-semibold text-gray-700">{label}</label>
      <input
        type="file"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
        required={required}
      />
    </div>
  );
}

// ✅ Image Upload Input
export function ImageInput({
  label,
  value,
  onChange,
}: { label: string; value: string | null; onChange: (file: File | null, base64?: string) => void }) {
  return (
    <div>
      <label className="block mb-2 font-semibold text-gray-700">{label}</label>
      {value && (
        <div className="mb-2 relative w-32 h-32">
          <img src={value} alt="Preview" className="w-32 h-32 object-cover rounded-lg border shadow-sm" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:bg-gray-100"
          >
            ✕
          </button>
        </div>
      )}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-semibold file:bg-blue-50 file: hover:file:bg-blue-100 cursor-pointer"
      />
    </div>
  );
}

// ✅ Map Picker
export function MapPicker({
  latitude,
  longitude,
  setLatitude,
  setLongitude,
  onChange,
}: {
  latitude: string;
  longitude: string;
  setLatitude: (lat: string) => void;
  setLongitude: (lng: string) => void;
  onChange: (field: string, value: any) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);

  const loadGoogleMaps = (apiKey: string) =>
    new Promise<void>((resolve, reject) => {
      if (window.google?.maps) return resolve();
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject();
      document.head.appendChild(script);
    });

  useEffect(() => {
    (async () => {
      try {
        await loadGoogleMaps(GOOGLE_MAP_API_KEY);
        if (!mapRef.current) return;

        const lat = parseFloat(latitude) || 0;
        const lng = parseFloat(longitude) || 0;

        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat, lng },
          zoom: 13,
        });

        const marker = new window.google.maps.Marker({
          position: { lat, lng },
          map,
          draggable: true,
        });

        const update = (lat: number, lng: number) => {
          setLatitude(lat.toString());
          setLongitude(lng.toString());
          onChange("latitude", lat);
          onChange("longitude", lng);
        };

        map.addListener("click", (e: any) => {
          marker.setPosition(e.latLng);
          update(e.latLng.lat(), e.latLng.lng());
        });

        marker.addListener("dragend", () => {
          const pos = marker.getPosition();
          if (pos) update(pos.lat(), pos.lng());
        });
      } catch (err) {
        console.error("Google Maps failed:", err);
      }
    })();
  }, []);

  return (
    <div>
      <label className="block mb-2 font-semibold text-gray-700">Pick Location</label>
      <div ref={mapRef} className="w-full h-80 border rounded"></div>
      <p className="text-sm mt-2 text-gray-600">
        Lat: {latitude} | Lng: {longitude}
      </p>
    </div>
  );
}
