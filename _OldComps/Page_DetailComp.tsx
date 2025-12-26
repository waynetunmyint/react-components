import React, { useEffect, useState } from "react";
import { Phone, Mail, MapPin, Info, ExternalLink, Navigation } from "lucide-react";
import { APP_BG_COLOR, BASE_URL, IMAGE_URL } from "../../config";

interface Props {
  dataSource: string;
  customAPI: string;
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

const FIELD_MAP: Record<string, any> = {
  page: {
    image: "Thumbnail",
    cover: "CoverThumbnail",
    badgeImage: "CountryThumbnail",
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
      "EditorNote",
    ],
    latitude: "Latitude",
    longitude: "Longitude",
  },
};

const PageDetailComp: React.FC<Props> = ({ dataSource, customAPI }) => {
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
        console.log("response", json);
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-3xl shadow-lg p-10 text-center max-w-sm">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Info className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-red-600 font-semibold text-lg">Invalid data source</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`min-h-screen bg-gray-50 ${APP_BG_COLOR} animate-pulse`}>
        {/* Skeleton Cover */}
        <div className="w-full h-64 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
        
        {/* Skeleton Profile */}
        <div className="px-5 -mt-16">
          <div className="w-32 h-32 bg-gray-300 rounded-3xl mx-auto animate-pulse border-4 border-white shadow-xl" />
          
          <div className="mt-6 space-y-3">
            <div className="h-8 bg-gray-200 rounded-lg w-3/4 mx-auto animate-pulse" />
            <div className="h-4 bg-gray-200 rounded-lg w-1/2 mx-auto animate-pulse" />
            <div className="h-4 bg-gray-200 rounded-lg w-2/3 mx-auto animate-pulse" />
          </div>
        </div>

        {/* Skeleton Fields */}
        <div className="px-5 mt-8 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <div className="flex-1 h-4 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-3xl shadow-lg p-10 text-center max-w-sm">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Info className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">No data found</p>
        </div>
      </div>
    );
  }

  const latitude = data && config.latitude ? Number(data[config.latitude]) : 0;
  const longitude = data && config.longitude ? Number(data[config.longitude]) : 0;

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
    let iconBg = "bg-gray-100";
    let actionText = "";
    let actionColor = "text-gray-600";

    if (type === "phone") {
      href = `tel:${val}`;
      icon = <Phone className="w-5 h-5 " />;
      iconBg = "bg-blue-50";
      actionText = "Call";
      actionColor = "";
    }
    if (type === "email") {
      href = `mailto:${val}`;
      icon = <Mail className="w-5 h-5 text-red-600" />;
      iconBg = "bg-red-50";
      actionText = "Email";
      actionColor = "text-red-600";
    }
    if (type === "url") {
      href = val;
      icon = <ExternalLink className="w-5 h-5 text-green-600" />;
      iconBg = "bg-green-50";
      actionText = "Visit";
      actionColor = "text-green-600";
    }

    return (
      <a
        key={field}
        href={href}
        target={type === "url" ? "_blank" : undefined}
        className="flex items-center justify-between w-full py-4 px-5 rounded-2xl bg-white hover:shadow-md active:scale-[0.98] transition-all duration-200 shadow-sm"
      >
        <div className="flex items-center gap-4 truncate flex-1">
          <div className={`${iconBg} p-2.5 rounded-xl flex-shrink-0`}>
            {icon}
          </div>
          <span className="truncate text-gray-900 font-medium">{val}</span>
        </div>
        {actionText && (
          <span className={`${actionColor} font-semibold text-sm ml-3 flex-shrink-0`}>
            {actionText}
          </span>
        )}
      </a>
    );
  };

  return (
    <div className={`${APP_BG_COLOR} min-h-screen bg-gray-50 pb-8`}>
      {/* Cover Image with Gradient Overlay */}
      <div className="relative">
        {config.cover && isValid(data[config.cover]) ? (
          <>
            <img
              src={`${IMAGE_URL}/uploads/${data[config.cover]}`}
              alt={data[config.heading]}
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-50" />
          </>
        ) : (
          <div className="w-full h-64 bg-gradient-to-br from-blue-400 via-blue-500 to-purple-500" />
        )}

        {/* Profile Image with Badge */}
        {config.image && isValid(data[config.image]) && (
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-16">
            <div className="relative">
              <img
                src={`${IMAGE_URL}/uploads/${data[config.image]}`}
                alt={data[config.heading]}
                className="w-32 h-32 rounded-3xl border-4 border-white shadow-xl object-cover"
              />
              {config.badgeImage && isValid(data[config.badgeImage]) && (
                <img
                  src={`${IMAGE_URL}/uploads/${data[config.badgeImage]}`}
                  alt="Badge"
                  className="w-12 h-12 rounded-full absolute -top-2 -right-2 border-4 border-white shadow-lg object-cover"
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Header Section */}
      <div className="mt-20 px-5 text-center">
        {config.heading && isValid(data[config.heading]) && (
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {data[config.heading]}
          </h1>
        )}
        {config.subHeadings.map(
          (sub: string) =>
            isValid(data[sub]) && (
              <p key={sub} className="text-gray-600 text-base leading-relaxed mt-2">
                {data[sub]}
              </p>
            )
        )}
      </div>

      {/* Editor Note */}
      {editorNoteField && isValid(data[editorNoteField]) && (
        <div className="mx-5 mt-8">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="bg-blue-500 rounded-full p-2 flex-shrink-0">
                <Info className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-blue-900 mb-1">Editor's Note</p>
                <p className="text-gray-700 leading-relaxed">{data[editorNoteField]}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact & Links Section */}
      {otherFields.some((field: string) => isValid(data[field])) && (
        <div className="px-5 mt-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4 px-1">
            Contact & Links
          </h2>
          <div className="space-y-3">{otherFields.map(renderField)}</div>
        </div>
      )}

      {/* Map Section */}
      {latitude && longitude && (
        <div className="px-5 mt-8">
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
            <div className="p-5 pb-4">
              <h2 className="flex items-center gap-2 font-bold text-gray-900 text-lg">
                <div className="bg-blue-50 p-2 rounded-xl">
                  <MapPin className="w-5 h-5 " />
                </div>
                Location
              </h2>
            </div>
            
            <div className="px-5">
              <iframe
                className="w-full h-64 rounded-2xl border-2 border-gray-100"
                src={`https://www.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`}
                loading="lazy"
              />
            </div>

            <div className="p-5 pt-4">
              <button
                onClick={() =>
                  (window.location.href = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`)
                }
                className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-md transition-all duration-200"
              >
                <Navigation className="w-5 h-5" />
                Get Directions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageDetailComp;