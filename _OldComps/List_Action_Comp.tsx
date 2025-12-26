"use client";
import { useState, useRef, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
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
  FileText,
  Globe,
  Link,
  Info,
  Briefcase,
  Unlock,
  ShoppingCart,
  RefreshCw,
  X,
  Filter,
  Plus,
} from "lucide-react";
import { BASE_URL, IMAGE_URL } from "../../config";
import { UniversalGetStoredJWT } from "./UniversalStoredInformationComp";
import { convertToDateTime } from "./UniversalConverterComp";

const STATUS_OPTIONS = [
  {
    label: "Active",
    value: 1,
    activeClass: "bg-green-600 text-white shadow-md",
    idleClass: "bg-green-100 text-green-700",
  },
  {
    label: "Inactive",
    value: 0,
    activeClass: "bg-gray-800 text-white shadow-md",
    idleClass: "bg-gray-200 text-gray-700",
  },
  {
    label: "Sold",
    value: 2,
    activeClass: "bg-purple-600 text-white shadow-md",
    idleClass: "bg-purple-100 text-purple-700",
  },
  {
    label: "Verified",
    value: 9,
    activeClass: "bg-blue-600 text-white shadow-md",
    idleClass: "bg-blue-100 text-blue-700",
  },
];

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

export default function ListActionComp({
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
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  
  const [allDataLoaded, setAllDataLoaded] = useState(false);
  const [statusFilter, setStatusFilter] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const fetchingRef = useRef(false);
  const touchStartY = useRef<number>(0);
  const touchEndY = useRef<number>(0);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const token = UniversalGetStoredJWT();
  const searchInputId = `search-${dataSource}`;
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
  const totalResultsLabel =
    filteredData.length === 1 ? "1 result" : `${filteredData.length} results`;

/** Effects */
useEffect(() => {
  // Only fetch, don’t clear data immediately
  fetchData(1);
}, [dataSource]);

/** Fetch paginated or full data */
const fetchData = async (pageNo: number, loadAll = false) => {
  try {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    // Show skeleton only if we have no data
    if (data.length === 0) setIsFetching(true);

    // Short delay so skeleton shows minimally
    await new Promise((r) => setTimeout(r, 150));

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
      if (pageNo === 1 || loadAll) return newData; // replace on first page
      const existingIds = new Set(prev.map((item) => item.Id));
      const filteredNewData = newData.filter((item) => !existingIds.has(item.Id));
      return [...prev, ...filteredNewData];
    });

    setPage(pageNo);
    setHasMore(newData.length > 0 && !loadAll);
    setAllDataLoaded(loadAll);
    setError(null);
  } catch (err: any) {
    setError(err);
    setHasMore(false);
  } finally {
    fetchingRef.current = false;
    setIsFetching(false);
  }
};



  /** 🔍 Fetch search results with debounce */
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
      if (!res.ok) throw new Error("Failed to search data");

      const result = await res.json();
      if (!Array.isArray(result)) throw new Error("Invalid search result");

      setData(result);
      setHasMore(false);
      setAllDataLoaded(true);
      setError(null);
    } catch (err: any) {
      setError(err);
      setData([]);
    } finally {
      setIsFetching(false);
    }
  };

  /** Debounced search */
  const handleSearchChange = (val: string) => {
    setSearch(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      fetchSearchData(val);
    }, 300);
  };

  /** Update Status / Delete / etc */
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
              `Are you sure you want to delete "${item?.[headingField ?? "Name"] || "this item"}"?`
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

        default:
          console.warn("Unknown action:", action);
      }
    } catch (err) {
      console.error(`${action} error:`, err);
    }
  };

  /** Update status */
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

  /** Manual refresh */
  const handleRefresh = () => {
    setRefreshing(true);
    setSearch("");
    setStatusFilter(null);
    fetchData(1).finally(() => setRefreshing(false));
  };

  /** Load all data for easier bulk browsing */
  const handleLoadAll = () => {
    if (allDataLoaded || isFetching) return;
    fetchData(1, true);
  };

const Toolbar = () => (
    <div className="sticky rounded-xl mb-2 top-0 z-20 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm px-4 md:px-8">
      <div className="py-5 mx-auto w-full space-y-4">
        {/* Search Bar */}
        <div className="relative group">
          <label htmlFor={searchInputId} className="sr-only">
            Search {dataSource}
          </label>
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within: transition-colors"
            size={20}
          />
          <input
            id={searchInputId}
            type="text"
            placeholder={`Search ${dataSource}...`}
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-12 pr-32 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all shadow-sm hover:border-gray-300"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  fetchData(1);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all active:scale-95"
                aria-label="Clear search"
              >
                <X size={16} className="text-gray-500" />
              </button>
            )}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              aria-label="Refresh list"
            >
              <RefreshCw size={16} className={`text-gray-600 ${refreshing ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={() => setShowFilters((prev) => !prev)}
              className={`p-2 rounded-lg transition-all active:scale-95 ${
                showFilters 
                  ? "bg-blue-50  ring-2 ring-blue-100" 
                  : "hover:bg-gray-100 text-gray-600"
              }`}
              aria-pressed={showFilters}
              aria-label="Toggle filters"
            >
              <Filter size={16} />
            </button>
            <button
              onClick={() => (window.location.href = `/${dataSource}/create`)}
              className="p-2 rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg active:scale-95"
              aria-label={`Create ${dataSource}`}
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="flex flex-wrap items-center gap-2.5 pb-1 animate-in fade-in slide-in-from-top-2 duration-200">
            <span className="text-xs font-semibold text-gray-700 whitespace-nowrap px-1">Status:</span>
            {[
              { label: "All", value: null, color: "gray" },
              { label: "Active", value: 1, color: "green" },
              { label: "Inactive", value: 0, color: "slate" },
              { label: "Sold", value: 2, color: "orange" },
              { label: "Verified", value: 9, color: "blue" },
            ].map(({ label, value, color }) => (
              <button
                key={label}
                onClick={() => setStatusFilter(value)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all active:scale-95 ${
                  statusFilter === value
                    ? `bg-${color}-600 text-white shadow-md ring-2 ring-${color}-200`
                    : "bg-white border border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 shadow-sm"
                }`}
              >
                {label}
              </button>
            ))}
            {hasFiltersApplied && (
              <button
                onClick={() => {
                  setStatusFilter(null);
                  setSearch("");
                  fetchData(1);
                }}
                className="ml-1 px-4 py-2 rounded-lg text-xs font-semibold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-all shadow-sm active:scale-95"
              >
                Clear all
              </button>
            )}
          </div>
        )}

        {/* Results + actions */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-700 font-medium">
            {totalResultsLabel}
          </span>
          <div className="flex items-center gap-3">
            {!allDataLoaded ? (
              <button
                onClick={handleLoadAll}
                disabled={isFetching}
                className="px-4 py-1.5 rounded-lg bg-white border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                Load all
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-emerald-600 font-semibold text-xs bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                <CheckCircle size={14} /> All data loaded
              </span>
            )}
            {refreshing && (
              <span className=" animate-pulse font-medium text-xs">Refreshing…</span>
            )}
          </div>
        </div>

      </div>
    </div>
  );

  /** Effects */
  useEffect(() => {
    setData([]);
    fetchData(1);
  }, [dataSource]);

  /** Infinite scroll */
  useEffect(() => {
    const target = observerRef.current;
    if (!target || !hasMore || isFetching || allDataLoaded) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        if (fetchingRef.current) return; // already fetching
        if (!hasMore || allDataLoaded) return;
        fetchData(page + 1);
      },
      { threshold: 1 }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [page, isFetching, hasMore, allDataLoaded]);

  /** Pull to refresh */
  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = () => {
    if (touchEndY.current - touchStartY.current > 100 && !refreshing) {
      handleRefresh();
    }
  };

  /** Helper: render status */
  const renderStatus = (status?: string) => {
    const s = Number(status);
    const statusConfig: any = {
      0: { borderClass: "border-gray-700 text-gray-700", text: "Inactive", icon: PauseCircle },
      1: { borderClass: "border-green-600 text-green-600", text: "Active", icon: CheckCircle },
      2: { borderClass: "border-orange-600 text-orange-600", text: "Sold", icon: ShoppingBag },
      9: { borderClass: "border-purple-600 text-purple-600", text: "Verified", icon: CheckCircle },
    };
    const config = statusConfig[s] || { borderClass: "border-gray-200 text-gray-700", text: "Unknown" };
    const Icon = config.icon;

    // For Active items, show a compact icon-only badge to save space
    if (s === 1) {
      return (
        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full border ${config.borderClass}`}>
          {Icon && <Icon size={12} />}
        </span>
      );
    }

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${config.borderClass}`}>
        {Icon && <Icon size={12} />}
        {config.text}
      </span>
    );
  };

  const getFieldIcon = (f: string) => {
    const lower = f.toLowerCase();
    const map: Record<string, React.ReactNode> = {
      page: <Briefcase size={14} className="text-indigo-500 flex-shrink-0" />,
      pagetitle: <Briefcase size={14} className="text-indigo-500 flex-shrink-0" />,
      description: <FileText size={14} className="text-gray-500 flex-shrink-0" />,
      email: <Mail size={14} className="text-blue-500 flex-shrink-0" />,
      phone: <Phone size={14} className="text-green-500 flex-shrink-0" />,
      contact: <Phone size={14} className="text-green-500 flex-shrink-0" />,
      address: <MapPin size={14} className="text-red-500 flex-shrink-0" />,
      location: <MapPin size={14} className="text-red-500 flex-shrink-0" />,
      user: <User size={14} className="text-gray-500 flex-shrink-0" />,
      name: <User size={14} className="text-gray-500 flex-shrink-0" />,
      price: <DollarSign size={14} className="text-yellow-600 flex-shrink-0" />,
      amount: <DollarSign size={14} className="text-yellow-600 flex-shrink-0" />,
      file: <File size={14} className="text-purple-500 flex-shrink-0" />,
      url: <File size={14} className="text-purple-500 flex-shrink-0" />,
      date: <Calendar size={14} className="text-orange-500 flex-shrink-0" />,
      createdAt: <Calendar size={14} className="text-orange-500 flex-shrink-0" />,
      website: <Globe size={14} className=" flex-shrink-0" />,
      link: <Link size={14} className="text-blue-400 flex-shrink-0" />,
    };
    return (
      Object.entries(map).find(([key]) => lower.includes(key))?.[1] || (
        <Info size={14} className="text-gray-400 flex-shrink-0" />
      )
    );
  };

  /** Empty State */
  if (!isFetching && data.length === 0) {
    const emptyTitle = hasFiltersApplied ? "No results found" : `No ${dataSource} yet`;
    const emptyDescription = hasFiltersApplied
      ? "Adjust your search or filters, then try again."
      : "Create your first entry to start managing this list.";

    return (
      <div className="min-h-screen pl-5 bg-gradient-to-br from-gray-50 to-gray-100">
        <Toolbar />
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-6">
          <div className="w-24 h-24 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center">
            <Search size={36} className="text-gray-400" />
          </div>
          <div className="space-y-2 max-w-md">
            <h3 className="text-2xl font-semibold text-gray-900">{emptyTitle}</h3>
            <p className="text-gray-500">{emptyDescription}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={handleRefresh}
              className="px-5 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
            >
              Refresh list
            </button>
            {hasFiltersApplied && (
              <button
                onClick={() => {
                  setSearch("");
                  setStatusFilter(null);
                  fetchData(1);
                }}
                className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:border-gray-300 transition-colors"
              >
                Clear filters
              </button>
            )}
            <button
              onClick={() => (window.location.href = `/${dataSource}/create`)}
              className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Create new
            </button>
          </div>
        </div>
      </div>
    );
  }

  /** --- Main UI --- */
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 md:px-8"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <Toolbar />

      {/* 📋 List Items */}
      <div className="mx-auto max-w-6xl py-4 space-y-3">
        {filteredData.map((item, index) => {
          const imageSrc = item?.[imageField ?? ""]
            ? `${IMAGE_URL}/uploads/${item[imageField ?? ""]}`
            : `${IMAGE_URL}/uploads/${defaultImage}`;
          const badgeSrc = item?.[badgeImage ?? ""]
            ? `${IMAGE_URL}/uploads/${item[badgeImage ?? ""]}`
            : null;

          const statusBorderClass =
            item?.Status == 1
              ? "border-2 border-green-600"
              : item?.Status == 0
              ? "border-2 border-gray-700"
              : item?.Status == 9
              ? "border-2 border-purple-600"
              : "border border-gray-100 hover:border-gray-200";

          return (
            <div
              key={item.Id || index}
              className={`group rounded-2xl bg-white shadow-sm hover:shadow-md ${statusBorderClass} transition-all duration-200`}
            >
              <div className="p-4">
                <div className="flex items-start gap-4">
                  {/* Image */}
                  {imageField && item?.[imageField] !== "logo.png" && (
                    <div className="relative flex-shrink-0">
                      <img
                        src={imageSrc}
                        alt="Item"
                        className={
                          imageClassName ??
                          "w-20 h-20 rounded-xl border-2 border-gray-100 object-cover group-hover:border-blue-200 transition-colors"
                        }
                      />
                      {badgeSrc && (
                        <img
                          src={badgeSrc}
                          alt="Badge"
                          className="w-7 h-7 rounded-full absolute -top-1.5 -right-1.5 border-2 border-white shadow-md"
                        />
                      )}
                       <p className="mt-1">{renderStatus(item?.Status)}</p>
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {headingField && (
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="text-base font-semibold text-gray-900 line-clamp-2 leading-tight">
                          {item?.[headingField]}
                        </h3>

                      </div>
                    )}

                    <div className="space-y-1.5">
                      {[
                        subHeadingField,
                        subHeadingField1,
                        subHeadingField2,
                        subHeadingField3,
                        subHeadingField4,
                      ].map((field, idx) => {
                        if (!field || !item?.[field]) return null;
                        let content: any = String(item[field]);

                        if (field === "FileURL") {
                          content = (
                            <a
                              href={`${IMAGE_URL}/uploads/${item[field]}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className=" hover:text-blue-700 hover:underline font-medium"
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
                            className="flex items-center gap-2 text-sm text-gray-600"
                          >
                            {getFieldIcon(field)}
                            <span className="line-clamp-2 leading-relaxed">{content}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions Menu */}
                  <div className="relative flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdown(
                          openDropdown === index.toString() ? null : index.toString()
                        );
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                    >
                      <EllipsisVertical size={18} />
                    </button>

                    {openDropdown === index.toString() && (
                      <>
                        <div
                          className="fixed inset-0 z-30"
                          onClick={() => setOpenDropdown(null)}
                        />
                        <div className="absolute right-0 mt-2 w-56 z-40 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                          {/* Basic Actions */}
                          {[
                            { icon: Glasses, text: "View Details", action: "view", color: "" },
                            { icon: Edit2, text: "Edit", action: "edit", color: "text-gray-700" },
                            { icon: Trash2, text: "Delete", action: "delete", color: "text-red-600" },
                          ].map(({ icon: Icon, text, action, color }) => (
                            <button
                              key={action}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAction(action, item);
                              }}
                              className={`flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-gray-50 transition-colors ${color}`}
                            >
                              <Icon size={16} />
                              <span className="font-medium">{text}</span>
                            </button>
                          ))}

                          {/* Status Toggles */}
                          {(activeInActiveToggle || activeBlockToggle || activeSoldToggle) && (
                            <div className="border-t border-gray-100 my-1" />
                          )}

                          {activeInActiveToggle &&
                            (item?.Status == 1 ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusUpdate("0", item);
                                }}
                                className="flex items-center gap-3 w-full px-4 py-3 text-orange-600 hover:bg-orange-50 text-sm transition-colors"
                              >
                                <PauseCircle size={16} />
                                <span className="font-medium">Set Inactive</span>
                              </button>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusUpdate("1", item);
                                }}
                                className="flex items-center gap-3 w-full px-4 py-3 text-green-600 hover:bg-green-50 text-sm transition-colors"
                              >
                                <CheckCircle size={16} />
                                <span className="font-medium">Set Active</span>
                              </button>
                            ))}

                          {activeBlockToggle &&
                            (item?.Status == 1 ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusUpdate("0", item);
                                }}
                                className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 text-sm transition-colors"
                              >
                                <Ban size={16} />
                                <span className="font-medium">Block User</span>
                              </button>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusUpdate("1", item);
                                }}
                                className="flex items-center gap-3 w-full px-4 py-3 text-green-600 hover:bg-green-50 text-sm transition-colors"
                              >
                                <Unlock size={16} />
                                <span className="font-medium">Unblock User</span>
                              </button>
                            ))}

                          {activeSoldToggle &&
                            (item?.Status == 2 ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusUpdate("1", item);
                                }}
                                className="flex items-center gap-3 w-full px-4 py-3  hover:bg-blue-50 text-sm transition-colors"
                              >
                                <ShoppingCart size={16} />
                                <span className="font-medium">Mark as Available</span>
                              </button>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusUpdate("2", item);
                                }}
                                className="flex items-center gap-3 w-full px-4 py-3 text-purple-600 hover:bg-purple-50 text-sm transition-colors"
                              >
                                <ShoppingBag size={16} />
                                <span className="font-medium">Mark as Sold</span>
                              </button>
                            ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Custom Component */}
                {renderComp && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    {renderComp(item)}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Infinite Scroll Trigger */}
        <div ref={observerRef} className="h-4" />

        {/* Load More Button (manual) */}
        {hasMore && !isFetching && (
          <div className="flex justify-center py-4">
            <button
              onClick={() => fetchData(page + 1)}
              disabled={isFetching}
              className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Load more items"
            >
              Load more
            </button>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <p className="text-red-600 text-sm font-medium">{error.message}</p>
            <button
              onClick={handleRefresh}
              className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading Skeletons */}
        {isFetching && (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-xl bg-gray-200 flex-shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-gray-200 rounded-full w-3/4" />
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded-full w-full" />
                      <div className="h-3 bg-gray-200 rounded-full w-5/6" />
                      <div className="h-3 bg-gray-200 rounded-full w-4/6" />
                    </div>
                  </div>
                  <div className="w-8 h-8 bg-gray-200 rounded-lg flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* End of List */}
        {!hasMore && !isFetching && data.length > 0 && (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2 text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-full">
              <CheckCircle size={16} />
              <span>You&apos;ve reached the end</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}