import React, { useEffect, useState, useRef, useCallback } from "react";
import { BASE_URL } from "../../config";
import { X, Phone, Mail, ExternalLink, Info, AlertCircle } from "lucide-react";

interface Props {
  dataSource: string;
  headingField?: string;
  subHeadingField?: string;
  subHeadingField1?: string;
  subHeadingField2?: string;
  subHeadingField3?: string;
  customAPI?: string;
  dataFields?: string[];
}

interface ListItem {
  [key: string]: any;
}

const isValidValue = (val: any): boolean =>
  val !== null && val !== undefined && val !== "-" && val !== "null" && val !== "";

const detectFieldType = (val: string): "phone" | "email" | "url" | "text" => {
  if (!val || !isValidValue(val)) return "text";
  if (/^\+?[0-9\s\-()]{5,20}$/.test(val)) return "phone";
  if (/^[\w.-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(val)) return "email";
  if (/^https?:\/\//.test(val)) return "url";
  return "text";
};

export default function PullRefreshList({
  dataSource,
  headingField,
  subHeadingField,
  subHeadingField1,
  subHeadingField2,
  subHeadingField3,
  customAPI,
  dataFields = [],
}: Props) {
  const [data, setData] = useState<ListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<ListItem | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  const listRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number | null>(null);
  const pullDistance = useRef<number>(0);

  useEffect(() => {
    fetchData();
  }, [dataSource, customAPI]);

  const fetchData = useCallback(async () => {
    try {
      if (!isRefreshing) setIsLoading(true);
      setError("");

      const url = customAPI 
        ? `${BASE_URL}${customAPI}` 
        : `${BASE_URL}/${dataSource}/api/byPage/1`;
      
      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const newData = await res.json();
      setData(Array.isArray(newData) ? newData : []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load data";
      console.error("Fetch error:", err);
      setError(errorMessage);
      setData([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [dataSource, customAPI, isRefreshing]);

  // Enhanced pull to refresh
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (listRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (startY.current !== null && listRef.current?.scrollTop === 0) {
      pullDistance.current = Math.max(0, e.touches[0].clientY - startY.current);
      
      if (pullDistance.current > 80 && !isRefreshing) {
        setIsRefreshing(true);
        fetchData();
        startY.current = null;
        pullDistance.current = 0;
      }
    }
  }, [isRefreshing, fetchData]);

  const handleTouchEnd = useCallback(() => {
    startY.current = null;
    pullDistance.current = 0;
  }, []);

  const handleItemClick = useCallback((item: ListItem) => {
    setSelectedItem(item);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedItem(null);
  }, []);

  const handleModalBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  }, [closeModal]);

  const renderFieldAction = useCallback((val: string, fieldName?: string) => {
    const type = fieldName === "PhoneOne" ? "phone" : detectFieldType(val);
    if (type === "text" || !isValidValue(val)) return null;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      if (type === "phone") window.location.href = `tel:${val}`;
      else if (type === "email") window.location.href = `mailto:${val}`;
      else if (type === "url") window.open(val, "_blank", "noopener,noreferrer");
    };

    const iconConfig = {
      phone: { icon: Phone, color: "", bg: "bg-blue-50 hover:bg-blue-100" },
      email: { icon: Mail, color: "text-red-600", bg: "bg-red-50 hover:bg-red-100" },
      url: { icon: ExternalLink, color: "text-green-600", bg: "bg-green-50 hover:bg-green-100" },
      text: { icon: Info, color: "text-gray-600", bg: "bg-gray-50 hover:bg-gray-100" },
    };

    const config = iconConfig[type];
    const IconComponent = config.icon;

    return (
      <button
        key={`${val}-${fieldName}`}
        onClick={handleClick}
        className={`p-3 ${config.bg} rounded-xl flex items-center justify-center transition-all shadow-sm hover:shadow-md active:scale-95`}
        aria-label={`${type} action for ${val}`}
      >
        <IconComponent className={`w-5 h-5 ${config.color}`} />
      </button>
    );
  }, []);

  // Filter data based on search
  const filteredData = searchTerm
    ? data.filter((item) =>
        headingField && item[headingField]
          ?.toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    : data;

  const getInitial = (item: ListItem): string => {
    if (headingField && item[headingField]) {
      const text = item[headingField].toString();
      return text.charAt(0).toUpperCase();
    }
    return "#";
  };

  const renderSkeleton = () => (
    <div className="space-y-2">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="bg-white px-4 py-4 rounded-xl shadow-sm flex items-center space-x-4 animate-pulse"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Search Bar */}
      {!isLoading && data.length > 0 && (
        <div className="px-4 pb-3 sticky top-0 bg-white z-10">
          <div className="relative">
            <input
              type="text"
              placeholder="ရှာရန်..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-11 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-white text-sm"
            />
            <svg
              className="w-5 h-5 text-gray-400 absolute left-3.5 top-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          {searchTerm && (
            <p className="text-sm text-gray-600 mt-2 px-1">
              ရလဒ် {filteredData.length} ခု
            </p>
          )}
        </div>
      )}

      {/* List Container */}
      <div
        ref={listRef}
        className="flex-1 overflow-auto px-4"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Refresh Indicator */}
        {isRefreshing && (
          <div className="text-center py-3 mb-2">
            <div className="inline-flex items-center gap-2  font-semibold bg-blue-50 px-4 py-2 rounded-full shadow-sm">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span>Refreshing...</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-700 text-sm font-medium">Error loading data</p>
              <p className="text-red-600 text-xs mt-1">{error}</p>
              <button
                onClick={fetchData}
                className="mt-2 text-sm text-red-700 underline hover:no-underline"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* List Content */}
        {isLoading ? (
          renderSkeleton()
        ) : filteredData.length > 0 ? (
          <div className="space-y-2 pb-4">
            {filteredData.map((item, index) => (
              <button
                key={item.Id || index}
                onClick={() => handleItemClick(item)}
                className="w-full group bg-white px-4 py-4 text-left hover:bg-gray-50 active:bg-gray-100 transition-all rounded-xl shadow-sm hover:shadow-md border border-transparent hover:border-blue-200 flex items-center space-x-4"
              >
                <div className="flex items-center justify-center rounded-full w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 text-xl font-bold flex-shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                  {getInitial(item)}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-relaxed">
                    {headingField ? item[headingField] : `Item ${index + 1}`}
                  </h2>
                  {subHeadingField && isValidValue(item[subHeadingField]) && (
                    <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                      {item[subHeadingField]}
                    </p>
                  )}
                </div>
                <svg
                  className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-300 text-7xl mb-4">📋</div>
            <p className="text-gray-500 font-medium mb-2">No data available</p>
            <button
              onClick={fetchData}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-300 text-6xl mb-4">🔍</div>
            <p className="text-gray-500 font-medium">
              No results found for "{searchTerm}"
            </p>
            <button
              onClick={() => setSearchTerm("")}
              className="mt-3 text-sm  hover:underline"
            >
              Clear search
            </button>
          </div>
        )}
      </div>

      {/* Enhanced Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-fadeIn"
          onClick={handleModalBackdropClick}
          role="dialog"
          aria-modal="true"
        >
          <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 animate-slideUp max-h-[85vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center transition-all z-10"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Modal Header */}
            {headingField && isValidValue(selectedItem[headingField]) && (
              <div className="mb-6 pr-8">
                <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-3 rounded-xl shadow-md">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold">
                    {getInitial(selectedItem)}
                  </div>
                  <h2 className="text-xl font-bold">
                    {selectedItem[headingField]}
                  </h2>
                </div>
              </div>
            )}

            {/* Modal Content */}
            <div className="space-y-3">
              {subHeadingField && isValidValue(selectedItem[subHeadingField]) && (
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-200">
                  <p className="text-gray-800 text-base leading-relaxed">
                    {selectedItem[subHeadingField]}
                  </p>
                </div>
              )}
              {subHeadingField1 && isValidValue(selectedItem[subHeadingField1]) && (
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-200">
                  <p className="text-gray-800 text-base leading-relaxed">
                    {selectedItem[subHeadingField1]}
                  </p>
                </div>
              )}
              {subHeadingField2 && isValidValue(selectedItem[subHeadingField2]) && (
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-200">
                  <p className="text-gray-800 text-base leading-relaxed">
                    {selectedItem[subHeadingField2]}
                  </p>
                </div>
              )}
              {subHeadingField3 && isValidValue(selectedItem[subHeadingField3]) && (
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-200">
                  <p className="text-gray-800 text-base leading-relaxed">
                    {selectedItem[subHeadingField3]}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {dataFields.length > 0 && (
              <div className="flex flex-wrap gap-3 pt-6 justify-center border-t border-gray-200 mt-6">
                {dataFields.map(
                  (field) =>
                    isValidValue(selectedItem[field]) &&
                    renderFieldAction(selectedItem[field], field)
                )}
              </div>
            )}

            {/* Close Button Footer */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={closeModal}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}