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
  Briefcase,
  Minus,
  Book,
  ChevronDown,
  Sparkles,
  MoreHorizontal,
  Printer,
  Copy,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { BASE_URL, IMAGE_URL } from "@/config";
import { GetStoredJWT } from "../StorageComps/StorageCompOne";
import FormModalCreate from "../FormComps/FormModalCreate";
import FormModalUpdate from "../FormComps/FormModalUpdate";
import { convertDateTime, convertToDateTime, formatNumber, formatPrice } from "../HelperComps/TextCaseComp";



interface Props {
  dataSource: string;
  imageField?: string;
  imageClassName?: string;
  badgeImage?: string;
  headingField?: string;
  subHeadingFields?: string[]; // Array of fields to display as subheadings
  gridFields?: string[]; // Fields to display in grid layout
  gridInputFields?: string[]; // Fields to display as input fields in grid
  idField?: string;
  defaultImage?: string;
  customAPI?: string;
  renderComp?: (item: Record<string, any>) => React.ReactNode;
  activeSoldToggle?: boolean;
  activeBlockToggle?: boolean;
  activeInActiveToggle?: boolean;
  isInterestingToggle?: boolean;
  fields?: Array<{
    fieldName: string;
    type: string;
    required?: boolean;
    customAPI?: string;
    customSource?: string;
    defaultValue?: string;
  }>;
  imageSize?: string;
  CustomCreateForm?: React.ComponentType<any>;
  CustomUpdateForm?: React.ComponentType<any>;
  IsBill?: boolean;
}

export default function ListModalAction({
  dataSource,
  imageField,
  imageClassName,
  badgeImage,
  headingField,
  subHeadingFields = [],
  gridFields = [],
  gridInputFields = [],
  defaultImage = "logo.png",
  customAPI,
  renderComp,
  activeSoldToggle,
  activeBlockToggle,
  activeInActiveToggle,
  isInterestingToggle,
  fields = [],
  imageSize = "small",
  CustomCreateForm,
  CustomUpdateForm,
  IsBill,
}: Props) {
  const [data, setData] = useState<Array<Record<string, any>>>([]);
  const [page, setPage] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState<'create' | 'update' | null>(null);
  const [selectedItem, setSelectedItem] = useState<Record<string, any> | null>(null);

  const [allDataLoaded, setAllDataLoaded] = useState(false);
  const [statusFilter, setStatusFilter] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const fetchingRef = useRef(false);
  const pageRef = useRef<number>(1);
  const touchStartY = useRef<number>(0);
  const touchEndY = useRef<number>(0);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const token = GetStoredJWT();
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

      // console.log('🌐 Fetching from:', url);

      const res = await fetch(url, { cache: "no-store" });
      // console.log('📥 Response status:', res.status, res.statusText);

      if (!res.ok) throw new Error(`Failed to fetch data: ${res.status} ${res.statusText}`);

      const newData: any[] = await res.json();
      console.log('📦 Received data:', {
        isArray: Array.isArray(newData),
        length: newData?.length,
        sample: newData?.slice(0, 2)
      });

      console.log("Modal List Data:", newData);

      if (!Array.isArray(newData)) throw new Error("Invalid data format - expected array");

      setData((prev) => {
        if (pageNo === 1 || loadAll) {
          console.log('🔄 Replacing data with', newData.length, 'items');
          // Cache the data for page 1
          if (pageNo === 1 && newData.length > 0) {
            try {
              localStorage.setItem(`ListCache_${dataSource}`, JSON.stringify(newData));
            } catch (e) {
              console.error("Failed to cache list data", e);
            }
          }
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

  /** Search handling */
  const handleSearchChange = (val: string) => {
    setSearch(val);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      fetchSearchData(search);
    }
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
          setSelectedItem(item);
          setShowModal('update');
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

        case "clone":
          if (!window.confirm(`Are you sure you want to clone "${item?.[headingField ?? "Name"] || "this item"}"?`)) return;

          const cloneData = new FormData();

          // Use fields definition if available to be precise
          if (fields && fields.length > 0) {
            fields.forEach(f => {
              let key = f.fieldName;
              let val = item[key];

              // Handle Dropdown logic: if field is "Page", value is in "PageId"
              if (f.type === 'dropdown') {
                const idKey = key + 'Id';
                if (item[idKey] !== undefined) {
                  key = idKey;
                  val = item[idKey];
                }
                // Handle "Page" specifically if the key isn't standard
                if (key === 'Page' && item.PageId) {
                  key = 'PageId';
                  val = item.PageId;
                }
              }

              // Modify Heading Field
              if (headingField && f.fieldName === headingField) {
                val = `${val} (Copy)`;
              }

              // Append to FormData
              if (val !== undefined && val !== null) {
                // For images, we are passing the string path. 
                // Ensure backend accepts string (or we might need to skip if backend only accepts Blob)
                // Assuming backend detects if it's not a file and preserves it or handles it.
                cloneData.append(key, val);
              }
            });
          } else {
            // Fallback: exclude system fields and copy everything
            Object.keys(item).forEach(k => {
              if (['Id', 'CreatedAt', 'UpdatedAt', 'ViewCount'].includes(k)) return;
              let val = item[k];
              if (headingField && k === headingField) val = `${val} (Copy)`;
              if (val !== null) cloneData.append(k, val);
            });
          }

          // Default status to '0' (Inactive) when cloning? Or keep same? Let's keep same for now or 0.
          // Usually better to set cloned item as inactive/draft.
          // cloneData.set('Status', '0'); 

          const res = await fetch(apiUrl, {
            method: "POST",
            body: cloneData,
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!res.ok) throw new Error("Clone failed");

          // Refresh list
          fetchData(pageRef.current);
          break;

        default:
          console.warn("Unknown action:", action);
      }
    } catch (err) {
      console.error(`${action} error:`, err);
    }
  };

  /** Update status */
  const handleStatusUpdate = async (statusValue: string, item: any, isInterestingUpdate: boolean = false) => {
    setOpenDropdown(null);
    try {
      const formData = new FormData();
      formData.append("id", item?.Id);

      if (isInterestingUpdate) {
        formData.append("IsInteresting", statusValue); // Assuming API handles 'IsInteresting'
      } else {
        formData.append("status", statusValue);
      }

      const res = await fetch(`${BASE_URL}/${dataSource}/api`, {
        method: "PATCH",
        body: formData,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Update failed");

      setData((prev) =>
        prev.map((i) =>
          i.Id === item.Id ? { ...i, ...(isInterestingUpdate ? { IsInteresting: Number(statusValue) } : { Status: Number(statusValue) }) } : i
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

  /** Modal renderer with premium styling */
  const ModalOverlay = () => {
    if (!showModal) return null;
    return (
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 px-4 py-8 animate-in fade-in duration-300"
        onClick={() => {
          setShowModal(null);
          setSelectedItem(null);
        }}
        role="dialog"
        aria-modal="true"
      >
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 mx-auto ring-1 ring-black/5"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header - Premium Gradient */}
          <div className="sticky top-0 bg-gradient-to-r from-slate-50 to-gray-50 backdrop-blur-xl border-b border-gray-200/80 px-6 py-5 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${showModal === 'create'
                ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25'
                : 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/25'
                }`}>
                {showModal === 'create' ? (
                  <Plus size={20} className="text-white" strokeWidth={2.5} />
                ) : (
                  <Edit2 size={18} className="text-white" strokeWidth={2.5} />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {showModal === 'create' ? `Create New` : `Edit`}
                </h2>
                <p className="text-sm text-gray-500 capitalize">{dataSource}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowModal(null);
                setSelectedItem(null);
              }}
              className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-all duration-200 active:scale-95"
              aria-label="Close modal"
            >
              <X size={20} strokeWidth={2} />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
            {showModal === 'create' ? (
              CustomCreateForm ? (
                <CustomCreateForm
                  dataSource={dataSource}
                  fields={fields} // Pass fields just in case
                  onSuccess={() => {
                    setShowModal(null);
                    setSelectedItem(null);
                    fetchData(1);
                  }}
                />
              ) : (
                <FormModalCreate
                  dataSource={dataSource}
                  fields={fields}
                  imageSize={imageSize}
                  hideBackButton={true}
                  onSuccess={() => {
                    setShowModal(null);
                    setSelectedItem(null);
                    fetchData(1);
                  }}
                />
              )
            ) : selectedItem ? (
              CustomUpdateForm ? (
                <CustomUpdateForm
                  dataSource={dataSource}
                  fields={fields}
                  existingData={selectedItem}
                  onSuccess={() => {
                    setShowModal(null);
                    setSelectedItem(null);
                    localStorage.removeItem("StoredItem");
                    fetchData(1);
                  }}
                />
              ) : (
                <FormModalUpdate
                  dataSource={dataSource}
                  fields={fields}
                  imageSize={imageSize}
                  customRedirect={null}
                  hideBackButton={true}
                  onSuccess={() => {
                    setShowModal(null);
                    setSelectedItem(null);
                    localStorage.removeItem("StoredItem");
                    fetchData(1);
                  }}
                />
              )
            ) : null}
          </div>
        </div>
      </div>
    );
  };

  // Debug: log when modal opens/closes to help diagnose issues
  useEffect(() => {
    if (showModal) console.log("[ListModalAction] modal opened:", showModal);
    else console.log("[ListModalAction] modal closed");
  }, [showModal]);



  /** Effects */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    console.log('🔄 DataSource changed:', dataSource);

    // Attempt to load from cache first
    const storageKey = `ListCache_${dataSource}`;
    const cached = localStorage.getItem(storageKey);
    let initialData: any[] = [];

    if (cached) {
      try {
        initialData = JSON.parse(cached);
        console.log("Creating list from cache", initialData.length);
      } catch (e) {
        console.error("Failed to parse cache", e);
      }
    }

    setData(initialData);
    setPage(1);
    pageRef.current = 1;

    setHasMore(true);
    setAllDataLoaded(false);

    // FORCE REFRESH: Fetch data immediately even if we have cache, to ensure new records appear
    fetchData(1);
  }, [dataSource]);

  /** Manual load more (no auto-loading) */

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

  /** Helper: render status with modern gradient badges */
  const renderStatus = (status?: string) => {
    const s = Number(status);
    const statusConfig: Record<number, { bgClass: string; textClass: string; text: string; icon: any; glowClass?: string }> = {
      0: {
        bgClass: "bg-gradient-to-r from-red-50 to-orange-50 border-red-200/60",
        textClass: "text-red-600",
        text: "Inactive",
        icon: PauseCircle,
        glowClass: "shadow-red-100"
      },
      1: {
        bgClass: "bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200/60",
        textClass: "text-emerald-600",
        text: "Active",
        icon: CheckCircle,
        glowClass: "shadow-emerald-100"
      },
      2: {
        bgClass: "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200/60",
        textClass: "text-amber-600",
        text: "Sold",
        icon: ShoppingBag,
        glowClass: "shadow-amber-100"
      },
      9: {
        bgClass: "bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200/60",
        textClass: "text-violet-600",
        text: "Verified",
        icon: Sparkles,
        glowClass: "shadow-violet-100"
      },
    };
    const config = statusConfig[s] || {
      bgClass: "bg-gray-50 border-gray-200",
      textClass: "text-gray-600",
      text: "Unknown",
      icon: Info
    };
    const Icon = config.icon;

    // Compact icon-only badge for Active to save space - with subtle glow
    if (s === 1) {
      return (
        <span
          className={`inline-flex items-center justify-center w-7 h-7 rounded-full border ${config.bgClass} ${config.textClass} shadow-sm ${config.glowClass} transition-all duration-200 hover:scale-110`}
          title="Active"
        >
          {Icon && <Icon size={14} strokeWidth={2.5} />}
        </span>
      );
    }

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border shadow-sm ${config.bgClass} ${config.textClass} ${config.glowClass} transition-all duration-200 hover:scale-105`}
      >
        {Icon && <Icon size={12} strokeWidth={2.5} />}
        <span>{config.text}</span>
      </span>
    );
  };

  const getFieldIcon = (f: string) => {
    const lower = f.toLowerCase();
    const map: Record<string, React.ReactNode> = {
      pageid: <Link size={14} className="text-indigo-500 flex-shrink-0" />,
      page: <Briefcase size={14} className="text-indigo-500 flex-shrink-0" />,
      pagetitle: <Briefcase size={14} className="text-indigo-500 flex-shrink-0" />,
      author: <User size={14} className="text-purple-500 flex-shrink-0" />,
      bookauthor: <User size={14} className="text-purple-500 flex-shrink-0" />,
      bookedition: <Book size={14} className="text-teal-500 flex-shrink-0" />,
      edition: <Book size={14} className="text-teal-500 flex-shrink-0" />,
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
      Object.entries(map).find(([key]) => lower.includes(key))?.[1] || null
    );
  };



  const Toolbar = () => (
    <div className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 border-b border-gray-200/50 -mx-4 px-4 pb-4 pt-4 mb-4 shadow-sm">
      <div className="mx-auto w-full space-y-3">
        {/* Header Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-gray-900 capitalize">{dataSource}</h1>
            {filteredData.length > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                {totalResultsLabel}
              </span>
            )}
          </div>
          <button
            onClick={() => setShowModal('create')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/25 transition-all duration-200 active:scale-95 hover:shadow-blue-500/40"
            aria-label={`Create ${dataSource}`}
          >
            <Plus size={16} strokeWidth={2.5} />
            <span className="hidden sm:inline">Create New</span>
          </button>
        </div>

        {/* Search Bar - Premium Style */}
        <div className="relative group">
          <label htmlFor={searchInputId} className="sr-only">
            Search {dataSource}
          </label>
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm -z-10" />
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200 pointer-events-none"
            size={18}
          />
          <input
            id={searchInputId}
            type="text"
            placeholder={`Search ${dataSource}...`}
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full pl-11 pr-28 py-3 bg-white border border-gray-200/80 rounded-xl text-[15px] text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 shadow-sm hover:border-gray-300 hover:shadow-md"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  fetchData(1);
                }}
                className="p-2 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-lg transition-all duration-150 active:scale-90"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 hover:bg-gray-100 text-gray-500 rounded-lg transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed active:scale-90"
              aria-label="Refresh list"
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            </button>
            <button
              onClick={() => setShowFilters((prev) => !prev)}
              className={`p-2 rounded-lg transition-all duration-200 active:scale-90 ${showFilters
                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
                : "hover:bg-gray-100 text-gray-500"
                }`}
              aria-pressed={showFilters}
              aria-label="Toggle filters"
            >
              <Filter size={16} />
            </button>
          </div>
        </div>

        {/* Expandable Filter Panel */}
        {showFilters && (
          <div className="animate-in slide-in-from-top-2 duration-200 p-3 bg-gray-50/80 rounded-xl border border-gray-200/50">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Filter by Status</span>
              {statusFilter !== null && (
                <button
                  onClick={() => setStatusFilter(null)}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Clear filter
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 1, label: "Active", bgClass: "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100", activeBg: "bg-emerald-500 text-white border-emerald-500" },
                { value: 0, label: "Inactive", bgClass: "bg-red-50 border-red-200 text-red-700 hover:bg-red-100", activeBg: "bg-red-500 text-white border-red-500" },
                { value: 2, label: "Sold", bgClass: "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100", activeBg: "bg-amber-500 text-white border-amber-500" },
                { value: 9, label: "Verified", bgClass: "bg-violet-50 border-violet-200 text-violet-700 hover:bg-violet-100", activeBg: "bg-violet-500 text-white border-violet-500" },
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setStatusFilter(statusFilter === filter.value ? null : filter.value)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-200 active:scale-95 ${statusFilter === filter.value ? filter.activeBg : filter.bgClass
                    }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  /** Empty State - Enhanced */
  if (!isFetching && data.length === 0) {
    const emptyTitle = hasFiltersApplied ? "No results found" : `No ${dataSource} yet`;
    const emptyDescription = hasFiltersApplied
      ? "Adjust your search or filters, then try again."
      : "Create your first entry to start managing this list.";

    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white sm:ml-10 pr-4">
        <Toolbar />
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
          {/* Premium Icon Container */}
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 shadow-lg shadow-gray-200/50 flex items-center justify-center border border-gray-200/50">
              <Search size={40} className="text-gray-400" strokeWidth={1.5} />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              {hasFiltersApplied ? (
                <Filter size={14} className="text-white" strokeWidth={2.5} />
              ) : (
                <Plus size={16} className="text-white" strokeWidth={2.5} />
              )}
            </div>
          </div>

          {/* Text Content */}
          <div className="space-y-2 max-w-md mb-8">
            <h3 className="text-2xl font-bold text-gray-900">{emptyTitle}</h3>
            <p className="text-base text-gray-500 leading-relaxed">{emptyDescription}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-all duration-200 active:scale-95 shadow-lg shadow-gray-900/20"
            >
              <RefreshCw size={16} />
              Refresh list
            </button>
            {hasFiltersApplied && (
              <button
                onClick={() => {
                  setSearch("");
                  setStatusFilter(null);
                  fetchData(1);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 active:scale-95"
              >
                <X size={16} />
                Clear filters
              </button>
            )}
            <button
              onClick={() => setShowModal('create')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 active:scale-95 shadow-lg shadow-blue-500/30"
            >
              <Plus size={16} strokeWidth={2.5} />
              Create new
            </button>
          </div>
        </div>
        {ModalOverlay()}
      </div>
    );
  }
  /** --- Main UI --- */
  return (
    <div
      className="min-h-screen sm:ml-10 pr-4"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <Toolbar />

      {/* 📋 List Items */}
      <div className="mx-auto w-full pb-6 space-y-2.5">
        {filteredData.map((item, index) => {
          const imageSrc = item?.[imageField ?? ""]
            ? `${IMAGE_URL}/uploads/${item[imageField ?? ""]}`
            : `${IMAGE_URL}/uploads/${defaultImage}`;
          const badgeSrc = item?.[badgeImage ?? ""]
            ? `${IMAGE_URL}/uploads/${item[badgeImage ?? ""]}`
            : null;

          const status = String(item?.Status ?? "");
          const statusBorderClass =
            status === "1"
              ? "border-l-[3px] border-l-emerald-500"
              : status === "0"
                ? "border-l-[3px] border-l-red-400"
                : status === "2"
                  ? "border-l-[3px] border-l-amber-500"
                  : status === "9"
                    ? "border-l-[3px] border-l-violet-500"
                    : "border-l-[3px] border-l-transparent";

          return (
            <div
              key={item.Id || index}
              className={`${statusBorderClass} group bg-white rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 border border-gray-100 hover:border-gray-200/80 ring-1 ring-black/[0.02]`}
            >
              <div className="p-4">
                <div className="flex items-start gap-3.5">
                  {/* Image */}
                  {imageField &&
                    item?.[imageField] &&
                    item?.[imageField] !== "" &&
                    item?.[imageField] !== "logo.png" && (
                      <div className="relative flex-shrink-0">
                        <img
                          src={imageSrc}
                          alt="Item"
                          className={
                            imageClassName ??
                            "w-16  rounded-xl border border-gray-100 object-cover transition-all duration-200"
                          }
                        />
                        {badgeSrc && (
                          <img
                            src={badgeSrc}
                            alt="Badge"
                            className="w-6 h-6 rounded-full absolute -top-1 -right-1 border-2 border-white shadow-sm"
                          />
                        )}
                      </div>
                    )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {headingField && (
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-[15px] font-semibold text-gray-900 line-clamp-2 leading-snug">
                          {item?.[headingField]}
                        </h3>
                      </div>
                    )}

                    {/* SubHeading Fields */}
                    {subHeadingFields && subHeadingFields.length > 0 && (
                      <div className="space-y-1">
                        {subHeadingFields.map((field, idx) => {
                          if (!field || !item?.[field]) return null;
                          let content: any = String(item[field]);

                          if (field === "FileURL") {
                            content = (
                              <a
                                href={`${IMAGE_URL}/uploads/${item[field]}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover: font-medium"
                              >
                                View File
                              </a>
                            );
                          } else if (field === "CreatedAt" || field.toLowerCase().includes('date')) {
                            content = convertDateTime(item[field]);
                          } else if (String(field).toLowerCase().includes("price")) {
                            content = formatPrice(item[field]);
                          }

                          return (
                            <div
                              key={idx}
                              className="flex items-center gap-2 text-[13px] text-gray-600"
                            >
                              {getFieldIcon(field)}
                              <span className="line-clamp-1">{content}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Grid Fields (responsive layout) */}
                    {gridFields && gridFields.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5 mt-2.5 pt-2.5 border-t border-gray-100">
                        {gridFields.map((field, idx) => {
                          if (!item?.[field]) return null;
                          let content: any = String(item[field]);

                          if (field.toLowerCase().includes('date') || field === "CreatedAt") {
                            content = convertToDateTime(item[field]);
                          } else if (String(field).toLowerCase().includes("price")) {
                            content = formatNumber(item[field]);
                          } else if (field === "Icon" && item[field]) {
                            const IconComp = (LucideIcons as any)[item[field]];
                            if (IconComp) {
                              content = (
                                <div className="flex items-center gap-1">
                                  <IconComp size={14} />
                                  <span>{item[field]}</span>
                                </div>
                              )
                            }
                          } else if (field === "IsDropdown") {
                            const isDropdown = Number(item[field]) === 1;
                            content = (
                              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${isDropdown ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}`}>
                                {isDropdown ? <CheckCircle size={10} /> : <Minus size={10} />}
                                {isDropdown ? "Is Dropdown" : "Standard Link"}
                              </span>
                            )
                          } else if (field === "IsMegaMenu") {
                            const isMegaMenu = Number(item[field]) === 1;
                            content = (
                              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${isMegaMenu ? "bg-pink-100 text-pink-700" : "bg-gray-100 text-gray-600"}`}>
                                {isMegaMenu ? <CheckCircle size={10} /> : <Minus size={10} />}
                                {isMegaMenu ? "Is Mega Menu" : "Standard"}
                              </span>
                            )
                          } else if (field === "IsInteresting") {
                            const isInteresting = Number(item[field]) === 1;
                            content = (
                              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${isInteresting ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}>
                                {isInteresting ? <CheckCircle size={10} /> : <Minus size={10} />}
                                {isInteresting ? "Is Interesting" : "Standard"}
                              </span>
                            )
                          }

                          return (
                            <div
                              key={idx}
                              className="flex items-center gap-1.5 text-xs bg-gray-50/80 rounded-lg px-2 py-1.5"
                            >
                              {getFieldIcon(field)}
                              <span className="truncate font-medium text-gray-700">{content}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
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
                      className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200 active:scale-90 group-hover:bg-gray-50"
                    >
                      <MoreHorizontal size={18} />
                    </button>

                    {openDropdown === index.toString() && (
                      <>
                        <div
                          className="fixed inset-0 z-[99]"
                          onClick={() => setOpenDropdown(null)}
                        />
                        <div className="absolute right-0 mt-2 w-56 z-[100] bg-white backdrop-blur-xl border border-gray-200/80 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 ring-1 ring-black/5">
                          {/* Header */}
                          <div className="px-4 py-2.5 bg-gray-50/80 border-b border-gray-100">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</p>
                          </div>

                          {/* Basic Actions */}
                          <div className="py-1">
                            {[
                              { icon: Glasses, text: "View Details", action: "view", color: "text-gray-700", hoverBg: "hover:bg-gray-50" },
                              { icon: Edit2, text: "Edit", action: "edit", color: "text-blue-600", hoverBg: "hover:bg-blue-50" },
                              { icon: Copy, text: "Clone", action: "clone", color: "text-teal-600", hoverBg: "hover:bg-teal-50" },
                              { icon: Trash2, text: "Delete", action: "delete", color: "text-red-600", hoverBg: "hover:bg-red-50" },
                            ].map(({ icon: Icon, text, action, color, hoverBg }) => (
                              <button
                                key={action}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAction(action, item);
                                }}
                                className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm ${hoverBg} active:bg-gray-100 transition-colors ${color}`}
                              >
                                <Icon size={16} strokeWidth={2} />
                                <span className="font-medium">{text}</span>
                              </button>
                            ))}
                            {/* IsInteresting Toggle - Integrated */}
                            {isInterestingToggle && (
                              <button
                                key="isInteresting"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusUpdate(item?.IsInteresting == 1 ? "0" : "1", item, true);
                                }}
                                className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-amber-50 active:bg-gray-100 transition-colors text-amber-600`}
                              >
                                {item?.IsInteresting == 1 ? <Minus size={16} strokeWidth={2} /> : <CheckCircle size={16} strokeWidth={2} />}
                                <span className="font-medium">{item?.IsInteresting == 1 ? "Set Not Interesting" : "Set Interesting"}</span>
                              </button>
                            )}
                          </div>

                          {/* Status Toggles */}
                          {(activeInActiveToggle || activeBlockToggle || activeSoldToggle || isInterestingToggle) && (
                            <div className="border-t border-gray-100 my-0.5" />
                          )}

                          {activeInActiveToggle &&
                            (item?.Status == 1 ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusUpdate("0", item);
                                }}
                                className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-orange-600 hover:bg-orange-50 active:bg-orange-100 text-[15px] transition-colors"
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
                                className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-green-600 hover:bg-green-50 active:bg-green-100 text-[15px] transition-colors"
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
                                className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-red-600 hover:bg-red-50 active:bg-red-100 text-[15px] transition-colors"
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
                                className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-green-600 hover:bg-green-50 active:bg-green-100 text-[15px] transition-colors"
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
                                className="flex items-center gap-2.5 w-full px-3.5 py-2.5  hover:bg-blue-50 active:bg-blue-100 text-[15px] transition-colors"
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
                                className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-purple-600 hover:bg-purple-50 active:bg-purple-100 text-[15px] transition-colors"
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

                {renderComp && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    {renderComp(item)}
                  </div>
                )}

                {/* IsBill Actions */}
                {IsBill && (
                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Status Buttons */}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleStatusUpdate("0", item); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border
                           ${String(item.Status) === "0"
                            ? "bg-red-600 text-white border-red-600 shadow-sm"
                            : "bg-white text-gray-500 border-gray-200 hover:border-red-200 hover:text-red-600 hover:bg-red-50"}`}
                      >
                        Invalid
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleStatusUpdate("1", item); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border
                           ${String(item.Status) === "1"
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                            : "bg-white text-gray-500 border-gray-200 hover:border-emerald-200 hover:text-emerald-600 hover:bg-emerald-50"}`}
                      >
                        Active
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleStatusUpdate("2", item); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border
                           ${String(item.Status) === "2"
                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                            : "bg-white text-gray-500 border-gray-200 hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50"}`}
                      >
                        Paid
                      </button>

                      <div className="w-px h-4 bg-gray-200 mx-1 hidden sm:block"></div>

                      {/* Print Buttons */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`${window.location.origin}/pageBill/print/invoice/${item.Id}`, '_blank');
                        }}
                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200 transition-all hover:shadow-sm"
                        title="Print Invoice"
                      >
                        <Printer size={13} />
                        <span className="hidden sm:inline">Invoice</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`${window.location.origin}/pageBill/print/receipt/${item.Id}`, '_blank');
                        }}
                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200 transition-all hover:shadow-sm"
                        title="Print Receipt"
                      >
                        <File size={13} />
                        <span className="hidden sm:inline">Receipt</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Load More - Premium Style */}
        {!allDataLoaded && hasMore && (
          <div className="flex items-center justify-center py-8">
            <button
              onClick={() => {
                const nextPage = pageRef.current + 1;
                console.log('🔘 Manual Load More clicked, loading page:', nextPage);
                fetchData(nextPage);
              }}
              disabled={fetchingRef.current}
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-gray-900 to-gray-800 text-white text-sm font-semibold hover:from-gray-800 hover:to-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 active:scale-95 shadow-lg shadow-gray-900/20"
            >
              {fetchingRef.current ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <ChevronDown size={16} />
                  <span>Load more</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Error State - Enhanced */}
        {error && (
          <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200/80 rounded-2xl p-6 text-center shadow-sm">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <X size={24} className="text-red-500" />
            </div>
            <h4 className="text-lg font-semibold text-red-800 mb-1">Something went wrong</h4>
            <p className="text-red-600 text-sm mb-4">{error.message}</p>
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-all duration-200 active:scale-95 shadow-lg shadow-red-600/25"
            >
              <RefreshCw size={16} />
              <span>Try Again</span>
            </button>
          </div>
        )}

        {/* Loading Skeletons - Premium */}
        {isFetching && (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm overflow-hidden relative"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {/* Shimmer Effect Overlay */}
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-gray-100/50 to-transparent" />

                <div className="flex gap-4 relative">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-200 to-gray-100 flex-shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-100 rounded-lg w-3/4" />
                    <div className="space-y-2">
                      <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-100 rounded-lg w-full" />
                      <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-100 rounded-lg w-2/3" />
                    </div>
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-100 rounded-xl flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* End of List - Premium */}
        {!hasMore && !isFetching && data.length > 0 && (
          <div className="text-center py-10">
            <div className="inline-flex items-center gap-2.5 text-sm text-gray-500 bg-gradient-to-r from-gray-50 to-gray-100/80 px-5 py-3 rounded-full border border-gray-200/50 shadow-sm">
              <Sparkles size={16} className="text-amber-500" />
              <span className="font-medium">You&apos;ve reached the end</span>
            </div>
          </div>
        )}
      </div>

      {/* Modal Overlay */}
      {ModalOverlay()}
    </div>
  );
}