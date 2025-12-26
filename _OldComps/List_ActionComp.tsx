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
} from "lucide-react";
import { BASE_URL, IMAGE_URL } from "../../../config";
import { UniversalGetStoredJWT } from "../UniversalComps/UniversalStoredInformationComp";
import { convertToDateTime } from "../UniversalComps/UniversalConverterComp";

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
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());

  const [allDataLoaded, setAllDataLoaded] = useState(false);
  const [statusFilter, setStatusFilter] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const fetchingRef = useRef(false);
  const pageRef = useRef<number>(1);
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
      if (fetchingRef.current) {
        console.log('⛔ Fetch already in progress, skipping...');
        return;
      }

      // Check if we should stop loading
      if (!loadAll && (allDataLoaded || !hasMore)) {
        console.log('🛑 Not fetching - allDataLoaded:', allDataLoaded, 'hasMore:', hasMore);
        return;
      }

      fetchingRef.current = true;

      console.log('📡 Starting fetch:', { pageNo, loadAll, currentDataLength: data.length });

      // Show skeleton only if we have no data
      if (data.length === 0) setIsFetching(true);

      // Short delay so skeleton shows minimally
      await new Promise((r) => setTimeout(r, 150));

      const url = customAPI
        ? `${BASE_URL}/${customAPI}`
        : loadAll
          ? `${BASE_URL}/${dataSource}/api`
          : `${BASE_URL}/${dataSource}/api/byPage/${pageNo}`;

      console.log('🌐 Fetching from:', url);

      const res = await fetch(url, { cache: "no-store" });
      console.log('📥 Response status:', res.status, res.statusText);

      if (!res.ok) throw new Error(`Failed to fetch data: ${res.status} ${res.statusText}`);

      const newData: any[] = await res.json();
      console.log('📦 Received data:', {
        isArray: Array.isArray(newData),
        length: newData?.length,
        sample: newData?.slice(0, 2)
      });

      if (!Array.isArray(newData)) throw new Error("Invalid data format - expected array");

      setData((prev) => {
        if (pageNo === 1 || loadAll) {
          console.log('🔄 Replacing data with', newData.length, 'items');
          return newData; // replace on first page
        }
        const existingIds = new Set(prev.map((item) => item.Id));
        const filteredNewData = newData.filter((item) => !existingIds.has(item.Id));
        console.log('➕ Appending', filteredNewData.length, 'new items to existing', prev.length, 'items');
        return [...prev, ...filteredNewData];
      });

      setPage(pageNo);
      pageRef.current = pageNo; // Keep ref in sync
      const hasMoreData = newData.length > 0 && !loadAll;
      setHasMore(hasMoreData);
      setAllDataLoaded(loadAll);
      setError(null);

      console.log('✅ Fetch complete:', {
        pageNo,
        receivedItems: newData.length,
        hasMore: hasMoreData,
        allDataLoaded: loadAll
      });
    } catch (err: any) {
      console.error('❌ Fetch error:', err);
      setError(err);
      setHasMore(false);
    } finally {
      fetchingRef.current = false;
      setIsFetching(false);
      console.log('🏁 fetchingRef reset to false');
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
    <div className="sticky rounded-2xl mb-4 top-0 z-20 bg-white/80 backdrop-blur-xl border border-gray-200/50 shadow-lg shadow-gray-200/50 px-4 md:px-8">
      <div className="py-6 mx-auto w-full space-y-4">
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
            className="w-full pl-12 pr-32 py-4 bg-white/50 border-2 border-gray-200 rounded-2xl text-sm text-gray-900 placeholder:text-gray-400 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-200 shadow-sm hover:border-gray-300 hover:shadow-md"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  fetchData(1);
                }}
                className="p-2.5 hover:bg-red-50 hover:text-red-600 text-gray-400 rounded-xl transition-all duration-200 active:scale-95"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2.5 hover:bg-blue-50 hover: text-gray-600 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              aria-label="Refresh list"
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            </button>
            <button
              onClick={() => setShowFilters((prev) => !prev)}
              className={`p-2.5 rounded-xl transition-all duration-200 active:scale-95 ${showFilters
                  ? "bg-blue-100  shadow-md"
                  : "hover:bg-gray-100 text-gray-600"
                }`}
              aria-pressed={showFilters}
              aria-label="Toggle filters"
            >
              <Filter size={16} />
            </button>
            <button
              onClick={() => (window.location.href = `/${dataSource}/create`)}
              className="p-2.5 rounded-xl text-white bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-xl active:scale-95 ring-2 ring-blue-500/20"
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
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 active:scale-95 ${statusFilter === value
                    ? `bg-${color}-600 text-white shadow-lg ring-2 ring-${color}-300 scale-105`
                    : "bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md shadow-sm"
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
                className="ml-1 px-4 py-2.5 rounded-xl text-xs font-semibold bg-red-50 text-red-600 border-2 border-red-200 hover:bg-red-100 hover:border-red-300 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
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
                className="px-5 py-2 rounded-xl bg-white border-2 border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50 hover:border-gray-400 hover:shadow-md transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                Load all
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-emerald-600 font-semibold text-xs bg-emerald-50 px-4 py-2 rounded-xl border-2 border-emerald-200 shadow-sm">
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
    console.log('🔄 DataSource changed:', dataSource);
    setData([]);
    setPage(1);
    pageRef.current = 1;
    setHasMore(true);
    setAllDataLoaded(false);
    fetchData(1);
  }, [dataSource]);

  /** Infinite scroll */
  useEffect(() => {
    const target = observerRef.current;
    if (!target) {
      console.log('⏸️ No observer target');
      return;
    }

    console.log('👀 Setting up observer');

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        console.log('📍 Intersection event:', {
          isIntersecting: entry.isIntersecting,
          intersectionRatio: entry.intersectionRatio,
          fetchingRef: fetchingRef.current,
          pageRef: pageRef.current
        });

        if (entry.isIntersecting && !fetchingRef.current) {
          const nextPage = pageRef.current + 1;
          console.log('🚀 Triggering fetch for page:', nextPage);
          fetchData(nextPage);
        }
      },
      {
        threshold: 0,
        rootMargin: '200px'
      }
    );

    observer.observe(target);
    return () => {
      console.log('🧹 Cleaning up observer');
      observer.disconnect();
    };
  }, [allDataLoaded, hasMore]);

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
      0: { color: "bg-red-100 text-red-700 border-red-200", text: "Inactive", icon: PauseCircle },
      1: { color: "bg-green-100 text-green-700 border-green-200", text: "Active", icon: CheckCircle },
      2: { color: "bg-orange-100 text-orange-700 border-orange-200", text: "Sold", icon: ShoppingBag },
      9: { color: "bg-blue-100 text-blue-700 border-blue-200", text: "Verified", icon: CheckCircle },
    };
    const config = statusConfig[s] || { color: "bg-gray-100 text-gray-700 border-gray-200", text: "Unknown" };
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
        {Icon && <Icon size={12} />}
        {config.text}
      </span>
    );
  };

  const getFieldIcon = (f: string) => {
    const lower = f.toLowerCase();
    const map: Record<string, React.ReactNode> = {
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
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg border-2 border-blue-200/50 flex items-center justify-center animate-pulse">
            <Search size={36} className="text-blue-500" />
          </div>
          <div className="space-y-2 max-w-md">
            <h3 className="text-2xl font-semibold text-gray-900">{emptyTitle}</h3>
            <p className="text-gray-500">{emptyDescription}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={handleRefresh}
              className="px-6 py-3 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95"
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
                className="px-6 py-3 rounded-xl border-2 border-gray-300 text-sm font-semibold text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
              >
                Clear filters
              </button>
            )}
            <button
              onClick={() => (window.location.href = `/${dataSource}/create`)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95"
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

          return (
            <div
              key={item.Id || index}
              className="group rounded-2xl bg-white shadow-sm hover:shadow-xl border border-gray-200/50 hover:border-blue-200 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="p-5">
                <div className="flex items-start gap-4">
                  {/* Image */}
                  {imageField && item?.[imageField] !== "logo.png" && (
                    <div className="relative flex-shrink-0 group/image">
                      {/* Loading skeleton */}
                      {loadingImages.has(`${item.Id}-main`) && (
                        <div className={
                          imageClassName ??
                          "w-20 h-20 rounded-xl border-2 border-gray-100 bg-gray-200 animate-pulse"
                        } />
                      )}
                      <img
                        src={imageSrc}
                        alt="Item"
                        className={`${imageClassName ??
                          "w-20 h-20 rounded-xl border-2 border-gray-200 object-cover group-hover:border-blue-400 group-hover:scale-105 transition-all duration-300 shadow-sm group-hover:shadow-md"
                          } ${loadingImages.has(`${item.Id}-main`) ? 'hidden' : ''}`}
                        onLoadStart={() => {
                          setLoadingImages(prev => new Set(prev).add(`${item.Id}-main`));
                        }}
                        onLoad={() => {
                          setLoadingImages(prev => {
                            const next = new Set(prev);
                            next.delete(`${item.Id}-main`);
                            return next;
                          });
                        }}
                        onError={() => {
                          setLoadingImages(prev => {
                            const next = new Set(prev);
                            next.delete(`${item.Id}-main`);
                            return next;
                          });
                        }}
                      />
                      {badgeSrc && (
                        <>
                          {loadingImages.has(`${item.Id}-badge`) && (
                            <div className="w-7 h-7 rounded-full absolute -top-1.5 -right-1.5 border-2 border-white shadow-md bg-gray-200 animate-pulse" />
                          )}
                          <img
                            src={badgeSrc}
                            alt="Badge"
                            className={`w-7 h-7 rounded-full absolute -top-1.5 -right-1.5 border-2 border-white shadow-md ${loadingImages.has(`${item.Id}-badge`) ? 'hidden' : ''}`}
                            onLoadStart={() => {
                              setLoadingImages(prev => new Set(prev).add(`${item.Id}-badge`));
                            }}
                            onLoad={() => {
                              setLoadingImages(prev => {
                                const next = new Set(prev);
                                next.delete(`${item.Id}-badge`);
                                return next;
                              });
                            }}
                            onError={() => {
                              setLoadingImages(prev => {
                                const next = new Set(prev);
                                next.delete(`${item.Id}-badge`);
                                return next;
                              });
                            }}
                          />
                        </>
                      )}
                      <p className="mt-1">{renderStatus(item?.Status)}</p>
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {headingField && (
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <h3 className="text-base font-bold text-gray-900 line-clamp-2 leading-tight group-hover: transition-colors duration-200">
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
                      className="p-2.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:shadow-md active:scale-95"
                    >
                      <EllipsisVertical size={18} />
                    </button>

                    {openDropdown === index.toString() && (
                      <>
                        <div
                          className="fixed inset-0 z-30"
                          onClick={() => setOpenDropdown(null)}
                        />
                        <div className="absolute right-0 mt-2 w-56 z-40 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
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
                              className={`flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-gray-50 transition-all duration-200 hover:pl-5 ${color}`}
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

        {/* Load More Button */}
        {!allDataLoaded && hasMore && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30">
            <button
              onClick={() => {
                const nextPage = pageRef.current + 1;
                console.log('🔘 Load More clicked, loading page:', nextPage);
                fetchData(nextPage);
              }}
              disabled={fetchingRef.current}
              className="group relative px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full font-semibold hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-2xl hover:shadow-blue-500/50 active:scale-95 flex items-center gap-2"
            >
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity rounded-full"></div>
              {fetchingRef.current ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  <span className="text-sm font-medium">Loading...</span>
                </>
              ) : (
                <>
                  <Plus size={18} />
                  <span>Load More</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Hidden observer for potential auto-load */}
        <div ref={observerRef} className="h-1" />

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
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm animate-pulse">
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 flex-shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-3/4" />
                    <div className="space-y-2">
                      <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-full" />
                      <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-5/6" />
                      <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-4/6" />
                    </div>
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* End of List */}
        {!hasMore && !isFetching && data.length > 0 && (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 bg-gradient-to-r from-gray-100 to-gray-200 px-6 py-3 rounded-full shadow-sm border border-gray-300">
              <CheckCircle size={16} className="text-green-600" />
              <span>You&apos;ve reached the end</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}