"use client";
import { useState, useRef, useEffect } from "react";
import {
  Trash2,
  Search,
  RefreshCw,
  X,
  User,
  Receipt,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ShoppingBag,
  CheckCircle,
  XCircle,
  Clock,
  PackageCheck,
  Edit,
} from "lucide-react";
import { BASE_URL, PAGE_ID } from "../../../config";
import { GetStoredJWT } from "../StorageComps/StorageCompOne";
import { formatPrice } from "../UniversalComps/Universal_FormatterComp";
import { printBookOrderCustomer } from "../PrintComps/BookOrderCustomer";
import { printBookOrderReceipt } from "../PrintComps/BookOrderReceipt";
import { convertDateTime } from "../HelperComps/TextCaseComp";

interface Props {
  dataSource: string;
  pageId?: number | string;
  onEdit?: (order: any) => void;
  onAddNew?: () => void;
}

export default function ListAdminBookOrderAction({ dataSource, pageId, onEdit, onAddNew }: Props) {
  const [data, setData] = useState<Array<Record<string, any>>>([]);
  const [page, setPage] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [allDataLoaded, setAllDataLoaded] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedStatus, setSelectedStatus] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<number | null>(null); // null = All

  const fetchingRef = useRef(false);
  const pageRef = useRef<number>(1);
  const touchStartY = useRef<number>(0);
  const touchEndY = useRef<number>(0);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const effectivePageId = pageId ?? PAGE_ID;

  const token = GetStoredJWT();

  /** Fetch paginated data by PAGE_ID */
  const fetchData = async (pageNo: number) => {
    try {
      if (fetchingRef.current) return;
      if (allDataLoaded || !hasMore) return;

      fetchingRef.current = true;
      if (data.length === 0) setIsFetching(true);

      await new Promise((r) => setTimeout(r, 150));

      const url = `${BASE_URL}/${dataSource}/api/byPageId/byPage/${PAGE_ID}/${pageNo}`;

      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to fetch data: ${res.status}`);

      const newData: any[] = await res.json();
      if (!Array.isArray(newData)) throw new Error("Invalid data format");

      setData((prev) => {
        if (pageNo === 1) return newData;
        const existingIds = new Set(prev.map((item) => item.Id));
        const filteredNewData = newData.filter((item) => !existingIds.has(item.Id));
        return [...prev, ...filteredNewData];
      });

      setPage(pageNo);
      pageRef.current = pageNo;
      const hasMoreData = newData.length > 0;
      setHasMore(hasMoreData);
      setError(null);
    } catch (err: any) {
      setError(err);
      setHasMore(false);
    } finally {
      fetchingRef.current = false;
      setIsFetching(false);
    }
  };

  /** Search */
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

      // Filter by PAGE_ID
      const filteredByPage = result.filter((item) => String(item.PageId) === String(effectivePageId));
      setData(filteredByPage);
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

  const handleSearchChange = (val: string) => {
    setSearch(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      fetchSearchData(val);
    }, 300);
  };

  /** Delete */
  const handleDelete = async (item: any) => {
    if (!window.confirm(`Delete order from ${item?.CustomerName}?`)) return;

    try {
      const formData = new FormData();
      formData.append("id", item?.Id);

      await fetch(`${BASE_URL}/${dataSource}/api`, {
        method: "DELETE",
        body: formData,
        headers: { Authorization: `Bearer ${token}` },
      });

      setData((prev) => prev.filter((i) => i.Id !== item.Id));
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete order");
    }
  };

  /** Show Status Confirmation Modal */
  const handleStatusClick = (item: any, newStatus: number) => {
    setSelectedItem(item);
    setSelectedStatus(newStatus);
    setShowStatusModal(true);
  };

  /** Update Order Status */
  const handleUpdateStatus = async () => {
    if (!selectedItem || selectedStatus === null) return;

    try {
      const formData = new FormData();
      formData.append("pageId", String(PAGE_ID));
      formData.append("id", selectedItem.Id);
      formData.append("orderStatus", selectedStatus.toString());

      const response = await fetch(`${BASE_URL}/${dataSource}/api`, {
        method: "PATCH",
        body: formData,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to update status");

      // Update local data
      setData((prev) =>
        prev.map((i) =>
          i.Id === selectedItem.Id ? { ...i, OrderStatus: selectedStatus } : i
        )
      );

      setShowStatusModal(false);
      setSelectedItem(null);
      setSelectedStatus(null);
    } catch (err) {
      console.error("Update status error:", err);
      alert("Failed to update order status");
    }
  };

  /** Cancel Status Update */
  const handleCancelStatusUpdate = () => {
    setShowStatusModal(false);
    setSelectedItem(null);
    setSelectedStatus(null);
  };

  /** Get Status Config */
  const getStatusConfig = (status: number) => {
    switch (status) {
      case 0:
        return { label: "Rejected", color: "red", bgColor: "bg-red-50", textColor: "text-red-700", borderColor: "border-red-200", icon: XCircle };
      case 1:
        return { label: "Active", color: "green", bgColor: "bg-[var(--bg-200)]", textColor: "text-[var(--accent-600)]", borderColor: "border-[var(--bg-300)]", icon: CheckCircle };
      case 2:
        return { label: "Pending", color: "yellow", bgColor: "bg-yellow-50", textColor: "text-yellow-700", borderColor: "border-yellow-200", icon: Clock };
      case 3:
        return { label: "Completed", color: "blue", bgColor: "bg-blue-50", textColor: "text-blue-700", borderColor: "border-blue-200", icon: PackageCheck };
      default:
        return { label: "Unknown", color: "gray", bgColor: "bg-[var(--bg-200)]", textColor: "text-[var(--text-muted)]", borderColor: "border-[var(--bg-300)]", icon: Clock };
    }
  };

  /** Print Customer Info */
  const handlePrintCustomer = (item: any) => {
    printBookOrderCustomer(item);
  };

  /** Print Receipt */
  const handlePrintReceipt = (item: any) => {
    printBookOrderReceipt(item);
  };

  /** Refresh */
  const handleRefresh = () => {
    setRefreshing(true);
    setSearch("");
    setData([]);
    setPage(1);
    pageRef.current = 1;
    setHasMore(true);
    setAllDataLoaded(false);
    fetchData(1).finally(() => setRefreshing(false));
  };

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

  useEffect(() => {
    setData([]);
    setPage(1);
    pageRef.current = 1;
    setHasMore(true);
    setAllDataLoaded(false);
    fetchData(1);
  }, [dataSource, effectivePageId]);

  const Toolbar = () => (
    <div className="sticky top-0 z-20 bg-[var(--bg-100)] border-b border-[var(--bg-300)] shadow-sm">
      <div className="py-3 px-4 mx-auto w-full">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-[var(--theme-primary-bg)] text-[var(--accent-600)] flex items-center justify-center shadow-lg">
              <ShoppingBag size={20} className="text-[var(--accent-600)]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 leading-none text-[var(--accent-600)]">Orders</h2>
              <span className="text-xs text-gray-500 font-medium">{data.length} total</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onAddNew && (
              <button
                onClick={onAddNew}
                className="p-2.5 rounded-xl bg-[var(--theme-primary-bg)] text-[var(--accent-600)] hover:opacity-90 active:scale-95 transition-all shadow-md"
                title="Add Manual Order"
              >
                <ShoppingBag size={18} />
              </button>
            )}
            <button
              onClick={handleRefresh}
              className="p-2 bg-gray-50 text-gray-500 rounded-lg hover:bg-gray-100 active:scale-95 transition-all"
            >
              <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Search Bar - Compact */}
        <div className="relative group mb-3">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent-600)] transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search by customer name..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-11 pr-12 py-3 bg-[var(--bg-200)] border border-[var(--bg-300)] rounded-2xl text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:ring-4 focus:ring-[var(--bg-300)] focus:border-[var(--accent-600)] focus:bg-[var(--bg-100)] transition-all duration-300"
          />
          {search && (
            <button onClick={() => { setSearch(""); fetchData(1); }} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[var(--text-muted)]">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status Filters - Compact Buttons */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1 text-[var(--accent-600)]">
          {[
            { id: null, label: "All", icon: ShoppingBag },
            { id: 2, label: "Pending", icon: Clock },
            { id: 1, label: "Active", icon: CheckCircle },
            { id: 3, label: "Done", icon: PackageCheck },
            { id: 0, label: "Rejected", icon: XCircle },
          ].map((btn) => {
            const isActive = statusFilter === btn.id;
            return (
              <button
                key={btn.label}
                onClick={() => setStatusFilter(btn.id)}
                className={`
                  flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-95
                  ${isActive
                    ? "bg-[var(--theme-primary-bg)] text-[var(--accent-600)] shadow-md ring-1 ring-white"
                    : "bg-[var(--bg-100)] border border-[var(--bg-300)] text-[var(--text-muted)] hover:bg-[var(--bg-200)] shadow-sm"
                  }
                `}
              >
                <btn.icon size={12} />
                {btn.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  if (!isFetching && data.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--bg-100)]">
        <Toolbar />
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <ShoppingBag size={48} className="text-[var(--bg-300)] mb-4" />
          <h3 className="text-lg font-bold text-[var(--text-primary)]">No orders found</h3>
          <p className="text-sm text-[var(--text-muted)] mt-1">Try changing your filters or search terms.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[var(--bg-200)] md:ml-10"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <Toolbar />

      <div className="mx-auto w-full px-3 py-3 space-y-2">
        <div className="bg-[var(--bg-100)] rounded-[24px] border border-[var(--bg-300)] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--bg-300)] bg-[var(--bg-200)]">
                  <th className="p-5 text-xs font-black text-[var(--text-muted)] uppercase tracking-widest whitespace-nowrap">Order #</th>
                  <th className="p-5 text-xs font-black text-[var(--text-muted)] uppercase tracking-widest whitespace-nowrap">Customer Info</th>
                  <th className="p-5 text-xs font-black text-[var(--text-muted)] uppercase tracking-widest whitespace-nowrap">Status</th>
                  <th className="p-5 text-xs font-black text-[var(--text-muted)] uppercase tracking-widest text-right whitespace-nowrap">Total</th>
                  <th className="p-5 text-xs font-black text-[var(--text-muted)] uppercase tracking-widest text-right whitespace-nowrap">Print</th>
                  <th className="p-5 text-xs font-black text-[var(--text-muted)] uppercase tracking-widest text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--bg-200)]">
                {data
                  .filter(item => statusFilter === null || (item.OrderStatus ?? 2) === statusFilter)
                  .map((item, index) => {
                    const statusConfig = getStatusConfig(item.OrderStatus ?? 2);
                    return (
                      <tr key={item.Id || index} className="hover:bg-[var(--bg-200)] transition-colors group">
                        <td className="p-5 w-24">
                          <span className="font-bold text-[var(--text-muted)]">#{item.Id}</span>
                          <div className="text-[10px] text-[var(--text-muted)] opacity-60 font-medium mt-1 whitespace-nowrap">{convertDateTime(item.CreatedAt).split(',')[0]}</div>
                        </td>
                        <td className="p-5">
                          <div className="flex flex-col">
                            <span className="font-bold text-[var(--text-primary)]">{item.CustomerName || "Anonymous"}</span>
                            {item.CustomerPhone && (
                              <div className="flex items-center gap-1 text-[var(--text-muted)] mt-1">
                                <Phone size={10} />
                                <span className="text-xs font-medium">{item.CustomerPhone}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-5 w-32">
                          <div className={`inline-flex px-3 py-1 rounded-full border ${statusConfig.bgColor} ${statusConfig.borderColor} ${statusConfig.textColor} items-center gap-1.5`}>
                            <statusConfig.icon size={12} />
                            <span className="text-[10px] font-black uppercase tracking-widest">{statusConfig.label}</span>
                          </div>
                        </td>
                        <td className="p-5 text-right w-40">
                          <span className="font-black block text-sm text-[var(--text-primary)]" >{formatPrice(Number(item.OrderGrandTotal) || 0)}</span>
                          <div className="flex gap-1 justify-end mt-2">
                            {[
                              { s: 2, l: "P" },
                              { s: 1, l: "A" },
                              { s: 3, l: "D" },
                              { s: 0, l: "R" },
                            ].map(st => (
                              <button
                                key={st.s}
                                onClick={() => handleStatusClick(item, st.s)}
                                className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-black transition-all ${item.OrderStatus === st.s
                                  ? "bg-[var(--accent-600)] text-[var(--text-light)] shadow-md"
                                  : "bg-[var(--bg-200)] text-[var(--text-muted)] hover:bg-[var(--bg-300)]"
                                  }`}
                                title={st.s === 2 ? 'Pending' : st.s === 1 ? 'Active' : st.s === 3 ? 'Done' : 'Rejected'}
                              >
                                {st.l}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="p-5 text-right w-32">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handlePrintCustomer(item)} className="p-2 bg-[var(--bg-200)] text-[var(--text-muted)] rounded-lg hover:bg-[var(--accent-600)] hover:text-[var(--text-light)] transition-all" title="Customer Copy"><User size={16} /></button>
                            <button onClick={() => handlePrintReceipt(item)} className="p-2 bg-[var(--bg-200)] text-[var(--text-muted)] rounded-lg hover:bg-[var(--accent-600)] hover:text-[var(--text-light)] transition-all" title="Receipt"><Receipt size={16} /></button>
                          </div>
                        </td>
                        <td className="p-5 text-right w-32">
                          <div className="flex justify-end gap-2">
                            {onEdit && (
                              <button onClick={() => onEdit(item)} className="p-2 bg-blue-50 text-blue-500 rounded-lg hover:bg-blue-600 hover:text-white transition-all"><Edit size={16} /></button>
                            )}
                            <button onClick={() => handleDelete(item)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-600 hover:text-white transition-all"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Load More */}
        {!allDataLoaded && hasMore && (
          <div className="flex items-center justify-center py-4">
            <button
              onClick={() => fetchData(pageRef.current + 1)}
              disabled={fetchingRef.current}
              className="px-6 py-2.5 rounded-xl bg-[var(--bg-100)] border border-[var(--bg-300)] text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-wider hover:bg-[var(--bg-200)] transition-all shadow-sm"
            >
              {fetchingRef.current ? "Loading..." : "Load More Orders"}
            </button>
          </div>
        )}
      </div>

      {/* Status Update Confirmation Modal */}
      {showStatusModal && selectedItem && selectedStatus !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--bg-100)] rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">Confirm Update</h3>
              <p className="text-xs text-[var(--text-muted)] mb-6">Update <span className="text-[var(--text-primary)] font-bold">{selectedItem.CustomerName}</span> to <span className="text-[var(--accent-600)] font-black uppercase tracking-widest">{getStatusConfig(selectedStatus).label}</span>?</p>

              <div className="flex gap-2">
                <button onClick={() => setShowStatusModal(false)} className="flex-1 py-2.5 rounded-xl bg-[var(--bg-200)] text-[var(--text-muted)] text-xs font-bold hover:bg-[var(--bg-300)] transition-all">Cancel</button>
                <button onClick={handleUpdateStatus} className="flex-1 py-2.5 rounded-xl bg-[var(--accent-600)] text-[var(--text-light)] text-xs font-bold shadow-lg hover:opacity-90 transition-all">Confirm</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
