"use client";
import { useState, useRef, useEffect, useMemo } from "react";
import {
  Edit2,
  Trash2,
  Search,
  Glasses,
  EllipsisVertical,
  Ban,
  CheckCircle,
  PauseCircle,
  ShoppingBag,
  Mail,
  Calendar,
  Phone,
  MapPin,
  User,
  DollarSign,
  File,
  Globe,
  Link,
  Info,
  Unlock,
  ShoppingCart,
  RefreshCw,
  X,
  Filter,
  Plus,
  Loader2,
} from "lucide-react";
import { BASE_URL, IMAGE_URL } from "@/config";
import { GetStoredJWT } from "./Storage_Comp";
import { convertToDateTime } from "./Date_Comp";



const STATUS_CONFIG: Record<
  number,
  { color: string; text: string; icon: any }
> = {
  0: { color: "bg-red-50 text-red-600", text: "Inactive", icon: PauseCircle },
  1: { color: "bg-green-50 text-green-600", text: "Active", icon: CheckCircle },
  2: { color: "bg-purple-50 text-purple-600", text: "Sold", icon: ShoppingBag },
  9: { color: "bg-blue-50 ", text: "Verified", icon: CheckCircle },
};

interface Props {
  dataSource: string;
  imageField?: string;
  imageClassName?: string;
  badgeImage?: string;
  headingField?: string;
  subHeadingField?: string;
  subHeadingField1?: string;
  subHeadingField2?: string;
  subHeadingField3?: string;
  subHeadingField4?: string;
  idField?: string;
  defaultImage?: string;
  customAPI?: string;
  renderComp?: (item: any) => React.ReactNode;
  activeSoldToggle?: boolean;
  activeBlockToggle?: boolean;
  activeInActiveToggle?: boolean;
}

export default function ListActionCompTwo({
  dataSource,
  imageField,
  imageClassName,
  badgeImage,
  headingField,
  subHeadingField,
  subHeadingField1,
  subHeadingField2,
  subHeadingField3,
  subHeadingField4,
  defaultImage = "logo.png",
  customAPI,
  renderComp,
  activeSoldToggle,
  activeBlockToggle,
  activeInActiveToggle,
}: Props) {
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const observerRef = useRef<HTMLDivElement>(null);
  const fetchingRef = useRef(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const token = GetStoredJWT();

  const hasFiltersApplied = useMemo(
    () => Boolean(search.trim()) || statusFilter !== null,
    [search, statusFilter]
  );

  const filteredData = useMemo(
    () =>
      statusFilter !== null
        ? data.filter((item) => Number(item.Status) === statusFilter)
        : data,
    [data, statusFilter]
  );

  const fetchData = async (pageNo: number, loadAll = false) => {
    try {
      if (fetchingRef.current) return;
      fetchingRef.current = true;

      if (data.length === 0) setIsFetching(true);

      const url = customAPI
        ? `${BASE_URL}/${customAPI}`
        : loadAll
        ? `${BASE_URL}/${dataSource}/api`
        : `${BASE_URL}/${dataSource}/api/byPage/${pageNo}`;

      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch data");

      const newData: any[] = await res.json();
      if (!Array.isArray(newData)) throw new Error("Invalid data");

      setData((prev) => {
        if (pageNo === 1 || loadAll) return newData;
        const existingIds = new Set(prev.map((item) => item.Id));
        return [...prev, ...newData.filter((item) => !existingIds.has(item.Id))];
      });

      setPage(pageNo);
      setHasMore(newData.length > 0 && !loadAll);
      setError(null);
    } catch (err: any) {
      setError(err);
      setHasMore(false);
    } finally {
      fetchingRef.current = false;
      setIsFetching(false);
    }
  };

  const fetchSearchData = async (keyword: string) => {
    if (!keyword.trim()) {
      fetchData(1);
      return;
    }

    try {
      setIsFetching(true);
      const url = `${BASE_URL}/${dataSource}/api/bySearch/${encodeURIComponent(
        keyword
      )}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to search");

      const result = await res.json();
      setData(Array.isArray(result) ? result : []);
      setHasMore(false);
      setError(null);
    } catch (err: any) {
      setError(err);
      setData([]);
    } finally {
      setIsFetching(false);
    }
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => fetchSearchData(val), 300);
  };

  const handleAction = async (action: string, item: any) => {
    const formData = new FormData();
    formData.append("id", item?.Id);
    setOpenDropdown(null);

    try {
      const apiUrl = `${BASE_URL}/${dataSource}/api`;
      switch (action) {
        case "view":
          localStorage.setItem("StoredItem", JSON.stringify(item));
          window.location.href = `/${dataSource}/view/${item?.Id}`;
          break;
        case "edit":
          localStorage.setItem("StoredItem", JSON.stringify(item));
          window.location.href = `/${dataSource}/update`;
          break;
        case "delete":
          if (
            !window.confirm(
              `Delete "${item?.[headingField ?? "Name"] || "this item"}"?`
            )
          )
            return;
          await fetch(apiUrl, {
            method: "DELETE",
            body: formData,
            headers: { Authorization: `Bearer ${token}` },
          });
          setData((prev) => prev.filter((i) => i.Id !== item.Id));
          break;
      }
    } catch (err) {
      console.error(`${action} error:`, err);
    }
  };

  const handleStatusUpdate = async (statusValue: string, item: any) => {
    setOpenDropdown(null);
    try {
      const formData = new FormData();
      formData.append("id", item?.Id);
      formData.append("status", statusValue);

      const res = await fetch(`${BASE_URL}/${dataSource}/api`, {
        method: "PATCH",
        body: formData,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Update failed");

      setData((prev) =>
        prev.map((i) =>
          i.Id === item.Id ? { ...i, Status: Number(statusValue) } : i
        )
      );
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  const getFieldIcon = (f: string) => {
    const lower = f.toLowerCase();
    const map: Record<string, any> = {
      email: Mail,
      phone: Phone,
      contact: Phone,
      address: MapPin,
      location: MapPin,
      user: User,
      name: User,
      price: DollarSign,
      amount: DollarSign,
      file: File,
      url: Globe,
      date: Calendar,
      createdat: Calendar,
      website: Globe,
      link: Link,
    };

    const IconComponent =
      Object.entries(map).find(([key]) => lower.includes(key))?.[1] || Info;
    return <IconComponent className="w-3.5 h-3.5" />;
  };

  const renderStatus = (status?: string) => {
    const s = Number(status);
    const config = STATUS_CONFIG[s] || {
      color: "bg-gray-50 text-gray-600",
      text: "Unknown",
      icon: Info,
    };
    const Icon = config.icon;

    return (
      <div
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        <Icon className="w-3 h-3" />
        {config.text}
      </div>
    );
  };

  useEffect(() => {
    fetchData(1);
  }, [dataSource]);

  useEffect(() => {
    const target = observerRef.current;
    if (!target || !hasMore || isFetching) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !fetchingRef.current && hasMore) {
          fetchData(page + 1);
        }
      },
      { threshold: 1 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [page, isFetching, hasMore]);

  // Empty State
  if (!isFetching && data.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-3">
        {/* Compact Toolbar */}
        <div className="mb-3 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${dataSource}...`}
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg ${
              showFilters
                ? "bg-blue-50 "
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            <Filter className="w-4 h-4" />
          </button>
          <button
            onClick={() => (window.location.href = `/${dataSource}/create`)}
            className="p-2 rounded-lg bg-blue-600 text-white"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mb-3 p-3 bg-white rounded-lg border border-gray-200">
            <div className="flex gap-2 flex-wrap">
              {[
                { label: "All", value: null },
                { label: "Active", value: 1 },
                { label: "Inactive", value: 0 },
                { label: "Sold", value: 2 },
                { label: "Verified", value: 9 },
              ].map(({ label, value }) => (
                <button
                  key={label}
                  onClick={() => setStatusFilter(value)}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    statusFilter === value
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Info className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {hasFiltersApplied ? "No results found" : `No ${dataSource} yet`}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {hasFiltersApplied
              ? "Try adjusting your filters"
              : "Create your first entry to get started"}
          </p>
          <button
            onClick={() => (window.location.href = `/${dataSource}/create`)}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg"
          >
            Create New
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      {/* Compact Toolbar */}
      <div className="mb-3 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${dataSource}...`}
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {search && (
            <button
              onClick={() => {
                setSearch("");
                fetchData(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-2 rounded-lg ${
            showFilters
              ? "bg-blue-50 "
              : "bg-white text-gray-600 border border-gray-200"
          }`}
        >
          <Filter className="w-4 h-4" />
        </button>
        <button
          onClick={() => fetchData(1)}
          className="p-2 rounded-lg bg-white text-gray-600 border border-gray-200"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
        <button
          onClick={() => (window.location.href = `/${dataSource}/create`)}
          className="p-2 rounded-lg bg-blue-600 text-white"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mb-3 p-3 bg-white rounded-lg border border-gray-200">
          <div className="flex gap-2 flex-wrap">
            {[
              { label: "All", value: null },
              { label: "Active", value: 1 },
              { label: "Inactive", value: 0 },
              { label: "Sold", value: 2 },
              { label: "Verified", value: 9 },
            ].map(({ label, value }) => (
              <button
                key={label}
                onClick={() => setStatusFilter(value)}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  statusFilter === value
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="mb-2 px-1">
        <p className="text-xs text-gray-500">
          {filteredData.length} {filteredData.length === 1 ? "result" : "results"}
        </p>
      </div>

      {/* Compact List Items */}
      <div className="space-y-2">
        {filteredData.map((item, index) => {
          const imageSrc = item?.[imageField ?? ""]
            ? `${IMAGE_URL}/uploads/${item[imageField ?? ""]}`
            : `${IMAGE_URL}/uploads/${defaultImage}`;

          return (
            <div
              key={item.Id || index}
              onClick={() => handleAction("view", item)}
              className="bg-white rounded-lg border border-gray-200 p-3 hover:border-gray-300 transition-all cursor-pointer"
            >
              {/* Header Row */}
              <div className="flex items-start gap-3 mb-2">
                {/* Compact Image */}
                {imageField && (
                  <div className="relative flex-shrink-0">
                    <img
                      src={imageSrc}
                      alt=""
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    {item?.Status !== undefined && (
                      <div className="absolute -top-1 -right-1">
                        {(() => {
                          const s = Number(item.Status);
                          const Icon = STATUS_CONFIG[s]?.icon || Info;
                          const colorClass =
                            s === 1
                              ? "bg-green-500"
                              : s === 0
                              ? "bg-red-500"
                              : s === 2
                              ? "bg-purple-500"
                              : "bg-blue-500";
                          return (
                            <div
                              className={`${colorClass} text-white p-0.5 rounded-full`}
                            >
                              <Icon className="w-3 h-3" />
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {headingField && (
                    <h3 className="font-semibold text-sm text-gray-900 truncate mb-1">
                      {item?.[headingField]}
                    </h3>
                  )}

                  {/* Compact Subheadings */}
                  <div className="space-y-1">
                    {[
                      subHeadingField,
                      subHeadingField1,
                      subHeadingField2,
                      subHeadingField3,
                      subHeadingField4,
                    ]
                      .filter((f) => f && item?.[f])
                      .slice(0, 2)
                      .map((field, idx) => {
                        if (!field) return null;
                        let content: any = String(item[field]);

                        if (field === "FileURL") {
                          content = (
                            <a
                              href={item[field]}
                              className=" hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              View File
                            </a>
                          );
                        } else if (field === "CreatedAt") {
                          content = convertToDateTime(item[field]);
                        }

                        return (
                          <div
                            key={idx}
                            className="flex items-center gap-1.5 text-xs text-gray-600"
                          >
                            {getFieldIcon(field)}
                            <span className="truncate">{content}</span>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDropdown(
                        openDropdown === index.toString()
                          ? null
                          : index.toString()
                      );
                    }}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <EllipsisVertical className="w-4 h-4" />
                  </button>

                  {openDropdown === index.toString() && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setOpenDropdown(null)}
                      />
                      <div className="absolute right-3 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-1">
                        {[
                          {
                            icon: Glasses,
                            text: "View",
                            action: "view",
                            color: "",
                          },
                          {
                            icon: Edit2,
                            text: "Edit",
                            action: "edit",
                            color: "text-gray-700",
                          },
                          {
                            icon: Trash2,
                            text: "Delete",
                            action: "delete",
                            color: "text-red-600",
                          },
                        ].map(({ icon: Icon, text, action, color }) => (
                          <button
                            key={action}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAction(action, item);
                            }}
                            className={`flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50 ${color}`}
                          >
                            <Icon className="w-4 h-4" />
                            {text}
                          </button>
                        ))}

                        {(activeInActiveToggle ||
                          activeBlockToggle ||
                          activeSoldToggle) && (
                          <div className="border-t border-gray-100 my-1" />
                        )}

                        {activeInActiveToggle &&
                          (item?.Status == 1 ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusUpdate("0", item);
                              }}
                              className="flex items-center gap-2 w-full px-3 py-2 text-orange-600 hover:bg-orange-50 text-sm"
                            >
                              <PauseCircle className="w-4 h-4" />
                              Set Inactive
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusUpdate("1", item);
                              }}
                              className="flex items-center gap-2 w-full px-3 py-2 text-green-600 hover:bg-green-50 text-sm"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Set Active
                            </button>
                          ))}

                        {activeBlockToggle &&
                          (item?.Status == 1 ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusUpdate("0", item);
                              }}
                              className="flex items-center gap-2 w-full px-3 py-2 text-red-600 hover:bg-red-50 text-sm"
                            >
                              <Ban className="w-4 h-4" />
                              Block
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusUpdate("1", item);
                              }}
                              className="flex items-center gap-2 w-full px-3 py-2 text-green-600 hover:bg-green-50 text-sm"
                            >
                              <Unlock className="w-4 h-4" />
                              Unblock
                            </button>
                          ))}

                        {activeSoldToggle &&
                          (item?.Status == 2 ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusUpdate("1", item);
                              }}
                              className="flex items-center gap-2 w-full px-3 py-2  hover:bg-blue-50 text-sm"
                            >
                              <ShoppingCart className="w-4 h-4" />
                              Available
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusUpdate("2", item);
                              }}
                              className="flex items-center gap-2 w-full px-3 py-2 text-purple-600 hover:bg-purple-50 text-sm"
                            >
                              <ShoppingBag className="w-4 h-4" />
                              Mark Sold
                            </button>
                          ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Custom Component */}
              {renderComp && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  {renderComp(item)}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Loading Indicator */}
      {isFetching && (
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5  animate-spin" />
        </div>
      )}

      {/* Infinite Scroll Trigger */}
      <div ref={observerRef} className="h-4" />

      {/* End Message */}
      {!hasMore && !isFetching && data.length > 0 && (
        <div className="text-center py-4">
          <p className="text-xs text-gray-400">End of list</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error.message}</p>
        </div>
      )}
    </div>
  );
}