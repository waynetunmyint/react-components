import React, { useEffect, useState } from "react";
import { Phone, Mail, MapPin, Info, ExternalLink } from "lucide-react";
import { BASE_URL, IMAGE_URL } from "../../config";

interface Props {
  dataSource: string; // e.g., "page"
  customAPI: string;  // e.g., "/page/api/123"
}

const isValid = (val: any) =>
  val !== null && val !== undefined && val !== "-" && val !== "null" && val !== "";

const detectType = (val: string) => {
  if (!val || !isValid(val)) return "text";
  if (/^\+?[0-9\s\-]{5,20}$/.test(val)) return "phone";
  if (/^[\w.-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(val)) return "email";
  if (/^https?:\/\//.test(val)) return "url";
  return "text";
};

// Field mapping
const FIELD_MAP: Record<string, any> = {
  page: {
    image: "Thumbnail",
    cover: "CoverThumbnail",
    badgeImage:"CountryThumbnail",
    heading: "Name",
    subHeadings: ["Address", "Description"],
    dataFields: [
      "PhoneOne",
      "PhoneTwo",
      "PhoneThree",
      "ContactEmail",
      "WebsiteURL",
      "FacebookURL",
      "LinkedInURL",
      "EditorNote", // will filter out later
    ],
    latitude: "Latitude",
    longitude: "Longitude",
  },
};

const DirectoryDetailComp: React.FC<Props> = ({ dataSource, customAPI }) => {
  const config = FIELD_MAP[dataSource];
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        if (!config) return;
        const res = await fetch(`${BASE_URL}${customAPI}`);
        const json = await res.json();
        console.log("response",json);
        setData(Array.isArray(json) && json.length > 0 ? json[0] : json);
      } catch (err) {
        console.error("Fetch error:", err);
        setData(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [customAPI, config]);

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 font-semibold">
        Invalid data source
      </div>
    );
  }

  if (loading)
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (!data)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        No data found
      </div>
    );

  const latitude = data && config.latitude ? Number(data[config.latitude]) : 0;
  const longitude = data && config.longitude ? Number(data[config.longitude]) : 0;

  // Split EditorNote from other fields
  const { editorNoteField, otherFields } = (() => {
    const editorNoteField = config.dataFields.find((f: string) => f === "EditorNote");
    const otherFields = config.dataFields.filter((f: string) => f !== "EditorNote");
    return { editorNoteField, otherFields };
  })();

  const renderField = (field: string) => {
    if (!isValid(data[field])) return null;
    const val = data[field];
    const type = detectType(val);

    let href = "#";
    let icon: React.ReactNode = <Info className="w-5 h-5 text-gray-500" />;
    let actionText = "";

    if (type === "phone") {
      href = `tel:${val}`;
      icon = <Phone className="w-5 h-5 text-blue-500" />;
      actionText = "Call";
    }
    if (type === "email") {
      href = `mailto:${val}`;
      icon = <Mail className="w-5 h-5 text-red-500" />;
      actionText = "Email";
    }
    if (type === "url") {
      href = val;
      icon = <ExternalLink className="w-5 h-5 text-green-500" />;
      actionText = "Visit";
    }

    return (
      <a
        key={field}
        href={href}
        target={type === "url" ? "_blank" : undefined}
        className="flex items-center justify-between w-full py-3 px-4 rounded-xl bg-white hover:bg-gray-50 shadow-sm"
      >
        <div className="flex items-center gap-3 truncate">
          {icon}
          <span className="truncate">{val}</span>
        </div>
        {actionText && <span className=" font-semibold">{actionText}</span>}
      </a>
    );
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Cover + Image */}
      <div className="relative">
        {config.cover && isValid(data[config.cover]) ? (
          <img
            src={`${IMAGE_URL}/uploads/${data[config.cover]}`}
            alt={data[config.heading]}
            className="w-full h-56 object-cover rounded-b-2xl"
          />
        ) : (
          <div className="w-full h-56 bg-blue-100 rounded-b-2xl" />
        )}

{config.image && isValid(data[config.image]) && (
  <div className="relative w-28 h-28 mx-auto mt-12">
    {/* Main image */}
    <img
      src={`${IMAGE_URL}/uploads/${data[config.image]}`}
      alt={data[config.heading]}
      className="w-28 h-28 rounded-2xl border-4 border-white shadow-lg"
    />
    {/* Badge */}
    <img
      src={`${IMAGE_URL}/uploads/${data[config.badgeImage]}`} // replace with badge image if different
      alt="Badge"
      className="w-10 h-10 rounded-full absolute top-0 right-0 border-2 border-white shadow-md"
    />
  </div>
)}

      </div>

      {/* Heading & Subheadings */}
      <div className="mt-16 p-5 text-center">
        {config.heading && isValid(data[config.heading]) && (
          <h1 className="text-2xl font-bold">{data[config.heading]}</h1>
        )}
        {config.subHeadings.map(
          (sub: string) =>
            isValid(data[sub]) && <p key={sub} className="text-gray-600">{data[sub]}</p>
        )}
      </div>

      {/* Editor Note */}
      {editorNoteField && isValid(data[editorNoteField]) && (
        <div className="mx-5 mt-5 p-4 bg-blue-50 border border-blue-200 rounded-xl shadow-sm">
          <p className="text-center text-gray-800">
            <span className="font-medium text-blue-700">Editor Note:</span> {data[editorNoteField]}
          </p>
        </div>
      )}

      {/* Other Fields */}
      <div className="p-5 space-y-3 text-gray-900 whitespace-pre">{otherFields.map(renderField)}</div>

      {/* Map */}
      {latitude && longitude && (
        <div className="mx-5 mt-6 p-5 bg-white rounded-xl shadow-sm">
          <h2 className="flex items-center gap-1 mb-3 font-semibold">
            <MapPin className="w-4 h-4" /> Location
          </h2>
          <iframe
            className="w-full h-64 rounded-lg border"
            src={`https://www.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`}
            loading="lazy"
          />
          <button
            onClick={() =>
              (window.location.href = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`)
            }
            className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg font-semibold"
          >
            Open in Google Maps
          </button>
        </div>
      )}
    </div>
  );
};

export default DirectoryDetailComp;
