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
  RefreshCw,
  X,
  Filter,
  Plus,
  ChevronDown,
  ChevronUp,
  Unlock,
  ShoppingCart,
} from "lucide-react";
import { BASE_URL, IMAGE_URL } from "@/config";
import { GetStoredJWT } from "./Storage_Comp";



const convertToDateTime = (date: string) => new Date(date).toLocaleString();

// Inline lookup dropdown cell (no extra file)
function InlineLookupDropdownCell({
  item,
  fieldName,
  customTable,
  dataSource,
  idField = "Id",
  displayField = "Name",
  onUpdated,
}: {
  item: any;
  fieldName: string;
  customTable: string;
  dataSource?: string;
  idField?: string;
  displayField?: string;
  onUpdated?: (updatedItem: any) => void;
}) {
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const token = GetStoredJWT();

  useEffect(() => {
    let mounted = true;
    const fetchOptions = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/${customTable}/api`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch lookup options");
        const data = await res.json();
        if (!Array.isArray(data)) {
          if (mounted) setOptions([]);
        } else if (mounted) {
          setOptions(data);
        }
      } catch (err) {
        console.error("Lookup fetch error:", err);
        if (mounted) setOptions([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchOptions();
    return () => {
      mounted = false;
    };
  }, [customTable]);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!dataSource) {
      if (onUpdated) onUpdated({ ...item, [fieldName]: val });
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("id", item[idField]);
      formData.append(fieldName, val);

      const res = await fetch(`${BASE_URL}/${dataSource}/api`, {
        method: "PATCH",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      });

      if (!res.ok) throw new Error("Update failed");

      const detail = { id: item[idField], fieldName, value: val };
      document.dispatchEvent(new CustomEvent("mws:row-updated", { detail }));

      if (onUpdated) onUpdated({ ...item, [fieldName]: val });
    } catch (err) {
      console.error("Lookup update error:", err);
      alert("Update failed");
    } finally {
      setSaving(false);
    }
  };

  const current = item?.[fieldName] ?? "";

  return (
    <div>
      {loading ? (
        <span className="text-sm text-gray-500">Loading...</span>
      ) : (
        <select
          value={current}
          onChange={handleChange}
          disabled={saving}
          className="text-sm border rounded px-2 py-1 bg-white"
        >
          <option value="">— Select —</option>
          {options.map((opt) => {
            const key = opt.Id ?? opt[idField] ?? JSON.stringify(opt);
            const value = opt.Id ?? opt[idField] ?? (opt[displayField] ?? key);
            const label = opt[displayField] ?? opt.Name ?? opt.Title ?? String(value);
            return (
              <option key={key} value={value}>
                {label}
              </option>
            );
          })}
        </select>
      )}
    </div>
  );
}

interface Column {
  field: string;
  header: string;
  sortable?: boolean;
  render?: (value: any, item: any) => React.ReactNode;
}

interface Props {
  dataSource: string;
  columns: Column[];
  idField?: string;
  imageField?: string;
  defaultImage?: string;
  customAPI?: string;
  activeSoldToggle?: boolean;
  activeBlockToggle?: boolean;
  activeInActiveToggle?: boolean;
  statusField?: string;
}

export default function TableActionComp({
  dataSource,
  columns,
  idField = "Id",
  imageField,
  defaultImage = "logo.png",
  customAPI,
  activeSoldToggle,
  activeBlockToggle,
  activeInActiveToggle,
  statusField = "Status",
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
  const [sortConfig, setSortConfig] = useState<{
    field: string;
    direction: "asc" | "desc";
  } | null>(null);

  const observerRef = useRef<HTMLDivElement | null>(null);
  const fetchingRef = useRef(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const token = GetStoredJWT();

  const hasFiltersApplied = useMemo(
    () => Boolean(search.trim()) || statusFilter !== null,
    [search, statusFilter]
  );

  // Filter and sort data
  const processedData = useMemo(() => {
    let filtered = statusFilter !== null
      ? data.filter((item) => Number(item[statusField]) === statusFilter)
      : data;

    if (sortConfig) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortConfig.field];
        const bVal = b[sortConfig.field];
        
        if (aVal === bVal) return 0;
        
        const comparison = aVal < bVal ? -1 : 1;
        return sortConfig.direction === "asc" ? comparison : -comparison;
      });
    }

    return filtered;
  }, [data, statusFilter, sortConfig, statusField]);

  const totalResultsLabel =
    processedData.length === 1 ? "1 result" : `${processedData.length} results`;

  /** Fetch paginated or full data */
  const fetchData = async (pageNo: number, loadAll = false) => {
    try {
      if (fetchingRef.current) return;
      fetchingRef.current = true;

      if (data.length === 0) setIsFetching(true);
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
        if (pageNo === 1 || loadAll) return newData;
        const existingIds = new Set(prev.map((item) => item[idField]));
        const filteredNewData = newData.filter((item) => !existingIds.has(item[idField]));
        return [...prev, ...filteredNewData];
      });

      console.log("data information", newData);

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

  /** Search data */
  const fetchSearchData = async (keyword: string) => {
    if (!keyword.trim()) {
      fetchData(1);
      return;
    }

    try {
      setIsFetching(true);
      const url = `${BASE_URL}/${dataSource}/api/bySearch/${encodeURIComponent(keyword)}`;
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

  /** Handle actions */
  const handleAction = async (action: string, item: any) => {
    const formData = new FormData();
    formData.append("id", item?.[idField]);
    setOpenDropdown(null);

    try {
      const apiUrl = `${BASE_URL}/${dataSource}/api`;
      switch (action) {
        case "view":
          localStorage.setItem("StoredItem", JSON.stringify(item));
          window.location.href = `/${dataSource}/view/${item?.[idField]}`;
          break;

        case "edit":
          localStorage.setItem("StoredItem", JSON.stringify(item));
          window.location.href = `/${dataSource}/update`;
          break;

        case "delete":
          if (!window.confirm(`Are you sure you want to delete this item?`)) return;
          await fetch(apiUrl, {
            method: "DELETE",
            body: formData,
            headers: { Authorization: `Bearer ${token}` },
          });
          setData((prev) => prev.filter((i) => i[idField] !== item[idField]));
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
      formData.append("id", item?.[idField]);
      formData.append("status", statusValue);

      const res = await fetch(`${BASE_URL}/${dataSource}/api`, {
        method: "PATCH",
        body: formData,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Update failed");

      setData((prev) =>
        prev.map((i) =>
          i[idField] === item[idField] ? { ...i, [statusField]: Number(statusValue) } : i
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
    setSortConfig(null);
    fetchData(1).finally(() => setRefreshing(false));
  };

  /** Load all data */
  const handleLoadAll = () => {
    if (allDataLoaded || isFetching) return;
    fetchData(1, true);
  };

  /** Handle sort */
  const handleSort = (field: string) => {
    setSortConfig((prev) => {
      if (prev?.field === field) {
        return prev.direction === "asc"
          ? { field, direction: "desc" }
          : null;
      }
      return { field, direction: "asc" };
    });
  };

  /** Render status badge */
  const renderStatus = (status?: string | number) => {
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

  /** Effects */
  useEffect(() => {
    fetchData(1);
  }, [dataSource]);

  useEffect(() => {
    const target = observerRef.current;
    if (!target || !hasMore || isFetching || allDataLoaded) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || fetchingRef.current || !hasMore || allDataLoaded) return;
        fetchData(page + 1);
      },
      { threshold: 1 }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [page, isFetching, hasMore, allDataLoaded]);

  // Listen for dropdown/lookup updates from child components (fired via CustomEvent)
  useEffect(() => {
    const handler = (e: any) => {
      const detail = e?.detail;
      if (!detail) return;
      const { id, fieldName, value } = detail;
      setData((prev) => prev.map((i) => (i[idField] === id ? { ...i, [fieldName]: value } : i)));
    };

    document.addEventListener("mws:row-updated", handler as EventListener);
    return () => document.removeEventListener("mws:row-updated", handler as EventListener);
  }, [idField]);

  /** Toolbar */
  const Toolbar = () => (
    <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm px-4 md:px-8">
      <div className="py-4 mx-auto w-full space-y-3">
        {/* Search Bar */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder={`Search ${dataSource}...`}
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-11 pr-28 py-3 bg-gray-100 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  fetchData(1);
                }}
                className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                aria-label="Clear search"
              >
                <X size={16} className="text-gray-500" />
              </button>
            )}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
              aria-label="Refresh"
            >
              <RefreshCw size={16} className={`text-gray-500 ${refreshing ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={() => setShowFilters((prev) => !prev)}
              className={`p-1.5 rounded-lg transition-colors ${showFilters ? "bg-blue-100 " : "hover:bg-gray-200 text-gray-500"}`}
              aria-label="Toggle filters"
            >
              <Filter size={16} />
            </button>
            <button
              onClick={() => (window.location.href = `/${dataSource}/create`)}
              className="p-1.5 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              aria-label="Create new"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="flex flex-wrap items-center gap-2 pb-1">
            <span className="text-xs font-medium text-gray-600 whitespace-nowrap">Status:</span>
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
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  statusFilter === value ? "bg-blue-500 text-white shadow-md" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
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
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Results */}
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>{totalResultsLabel}</span>
          <div className="flex items-center gap-2">
            {!allDataLoaded ? (
              <button
                onClick={handleLoadAll}
                disabled={isFetching}
                className="px-3 py-1 rounded-full border border-gray-200 text-gray-700 text-xs font-medium hover:border-blue-400 hover: transition disabled:opacity-50"
              >
                Load all
              </button>
            ) : (
              <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                <CheckCircle size={14} /> All data loaded
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  /** Empty State */
  if (!isFetching && data.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Toolbar />
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-6">
          <div className="w-24 h-24 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center">
            <Search size={36} className="text-gray-400" />
          </div>
          <div className="space-y-2 max-w-md">
            <h3 className="text-2xl font-semibold text-gray-900">
              {hasFiltersApplied ? "No results found" : `No ${dataSource} yet`}
            </h3>
            <p className="text-gray-500">
              {hasFiltersApplied
                ? "Adjust your search or filters, then try again."
                : "Create your first entry to start managing this list."}
            </p>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Toolbar />

      <div className="mx-auto px-4 md:px-8 py-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {imageField && (
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Image
                    </th>
                  )}
                  {columns?.map((col) => (
                    <th
                      key={col.field}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                    >
                      {col.sortable ? (
                        <button
                          onClick={() => handleSort(col.field)}
                          className="flex items-center gap-1 hover: transition-colors"
                        >
                          {col.header}
                          {sortConfig?.field === col.field && (
                            sortConfig.direction === "asc" ? (
                              <ChevronUp size={14} />
                            ) : (
                              <ChevronDown size={14} />
                            )
                          )}
                        </button>
                      ) : (
                        col.header
                      )}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {processedData.map((item, index) => {
                  const imageSrc = item?.[imageField ?? ""]
                    ? `${IMAGE_URL}/uploads/${item[imageField ?? ""]}`
                    : `${IMAGE_URL}/uploads/${defaultImage}`;

                  return (
                    <tr key={item[idField] || index} className="hover:bg-gray-50 transition-colors">
                      {imageField && (
                        <td className="px-4 py-3">
                          <img
                            src={imageSrc}
                            alt="Item"
                            className="w-12 h-12 rounded-lg border border-gray-200 object-cover"
                          />
                        </td>
                      )}
                      {columns?.map((col) => (
                        <td key={col.field} className="px-4 py-3 text-sm text-gray-700">
                          {col.render
                            ? col.render(item[col.field], item)
                            : col.field === statusField
                              ? renderStatus(item[col.field])
                              : col.field === "CreatedAt"
                                ? convertToDateTime(item[col.field])
                                : item[col.field] || "-"}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-right">
                        <div className="relative inline-block">
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
                              <div className="absolute right-0 mt-2 w-56 z-40 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
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

                                {(activeInActiveToggle || activeBlockToggle || activeSoldToggle) && (
                                  <div className="border-t border-gray-100 my-1" />
                                )}

                                {activeInActiveToggle &&
                                  (item?.[statusField] == 1 ? (
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
                                  (item?.[statusField] == 1 ? (
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
                                  (item?.[statusField] == 2 ? (
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
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div ref={observerRef} className="h-4" />

          {isFetching && (
            <div className="p-8 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-4 animate-pulse">
                  <div className="w-12 h-12 rounded-lg bg-gray-200 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded-full w-3/4" />
                    <div className="h-4 bg-gray-200 rounded-full w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!hasMore && !isFetching && data.length > 0 && (
            <div className="text-center py-6 border-t border-gray-200">
              <div className="inline-flex items-center gap-2 text-sm text-gray-500">
                <CheckCircle size={16} />
                <span>You&apos;ve reached the end</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}