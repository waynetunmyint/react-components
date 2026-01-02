"use client";
import { useState, useRef, useEffect } from "react";
import {
    Trash2,
    Search,
    RefreshCw,
    X,
    User,
    Receipt,
    Calendar,
    DollarSign,
    CheckCircle,
    XCircle,
    FileText,
    Edit,
    Plus,
    Printer,
    Filter,
} from "lucide-react";
import { BASE_URL, PAGE_ID } from "@/config";
import { GetStoredJWT } from "../StorageComps/StorageCompOne";
import { convertDateTime, formatPrice } from "../HelperComps/TextCaseComp";
import { printSchoolBillInvoice, printSchoolBillReceipt } from "../PrintComps/SchoolBillPrint";

interface Props {
    dataSource: string;
    pageId?: number | string;
    onEdit?: (bill: any) => void;
    onAddNew?: () => void;
}

export default function ListAdminSchoolBillAction({ dataSource, pageId, onEdit, onAddNew }: Props) {
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
        if (!window.confirm(`Delete bill for ${item?.StudentTitle || item?.Title || "this student"}?`)) return;

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
            alert("Failed to delete bill");
        }
    };

    /** Show Status Confirmation Modal */
    const handleStatusClick = (item: any, newStatus: number) => {
        setSelectedItem(item);
        setSelectedStatus(newStatus);
        setShowStatusModal(true);
    };

    /** Update Bill Status */
    const handleUpdateStatus = async () => {
        if (!selectedItem || selectedStatus === null) return;

        try {
            const formData = new FormData();
            formData.append("pageId", String(PAGE_ID));
            formData.append("id", selectedItem.Id);
            formData.append("status", selectedStatus.toString());

            const response = await fetch(`${BASE_URL}/${dataSource}/api`, {
                method: "PATCH",
                body: formData,
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error("Failed to update status");

            // Update local data
            setData((prev) =>
                prev.map((i) =>
                    i.Id === selectedItem.Id ? { ...i, Status: selectedStatus } : i
                )
            );

            setShowStatusModal(false);
            setSelectedItem(null);
            setSelectedStatus(null);
        } catch (err) {
            console.error("Update status error:", err);
            alert("Failed to update bill status");
        }
    };

    /** Cancel Status Update */
    const handleCancelStatusUpdate = () => {
        setShowStatusModal(false);
        setSelectedItem(null);
        setSelectedStatus(null);
    };

    /** Get Status Config - 0=Invalid, 1=Invoice, 2=Receipt */
    const getStatusConfig = (status: number) => {
        switch (status) {
            case 0:
                return { label: "Invalid", color: "red", bgColor: "bg-red-50", textColor: "text-red-700", borderColor: "border-red-200", icon: XCircle };
            case 1:
                return { label: "Invoice", color: "yellow", bgColor: "bg-yellow-50", textColor: "text-yellow-700", borderColor: "border-yellow-200", icon: FileText };
            case 2:
                return { label: "Receipt", color: "green", bgColor: "bg-green-50", textColor: "text-green-700", borderColor: "border-green-200", icon: Receipt };
            default:
                return { label: "Unknown", color: "gray", bgColor: "bg-gray-50", textColor: "text-gray-700", borderColor: "border-gray-200", icon: XCircle };
        }
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
        <div className="sticky top-4 z-30 mx-4 mb-10">
            <div className="bg-white/80 backdrop-blur-xl border border-gray-200/50 shadow-lg shadow-gray-200/50 rounded-2xl p-4 transition-all duration-300">
                <div className="flex flex-col gap-4">
                    {/* Top Row: Title & Actions */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
                                <Receipt size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 tracking-tight">School Bills</h2>
                                <p className="text-xs text-gray-500 font-medium">{data.length} records found</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="p-2.5 rounded-xl bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-all active:scale-95 disabled:opacity-50"
                                title="Refresh data"
                            >
                                <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
                            </button>

                            {onAddNew && (
                                <button
                                    onClick={onAddNew}
                                    className="px-4 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 active:scale-95 transition-all shadow-lg shadow-gray-900/20 flex items-center gap-2"
                                >
                                    <Plus size={18} />
                                    <span className="hidden sm:inline">Add Bill</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <Search size={18} className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by student, title, or ID..."
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="block w-full pl-10 pr-10 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-200"
                        />
                        {search && (
                            <button
                                onClick={() => {
                                    setSearch("");
                                    fetchData(1);
                                }}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    /** Empty State */
    if (!isFetching && data.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50/50 pb-20">
                <Toolbar />
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                    <div className="w-24 h-24 rounded-3xl bg-white border border-gray-100 flex items-center justify-center mb-6 shadow-xl shadow-gray-200/50">
                        <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
                            <Receipt size={32} className="text-blue-500" />
                        </div>
                    </div>
                    <div className="max-w-md space-y-2 mb-8">
                        <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                            {search.trim() ? "No bills found" : "No bills yet"}
                        </h3>
                        <p className="text-gray-500 leading-relaxed">
                            {search.trim()
                                ? "We couldn't find any bills matching your search. Try adjusting your keywords."
                                : "Get started by creating your first school bill to manage student payments efficiently."}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleRefresh}
                            className="px-6 py-3 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
                        >
                            Refresh
                        </button>
                        {onAddNew && (
                            <button
                                onClick={onAddNew}
                                className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-600/20"
                            >
                                Create Bill
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen bg-gray-50/50 md:ml-10 pb-20"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <Toolbar />

            <div className="mx-auto w-full px-4 space-y-4">
                {data.map((item, index) => {
                    const statusConfig = getStatusConfig(item.Status ?? 0);
                    const StatusIcon = statusConfig.icon;

                    return (
                        <div
                            key={item.Id || index}
                            className="group relative bg-white rounded-2xl p-4 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 border border-gray-100 transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className="flex flex-col gap-4">
                                {/* Header: Student Info & Amount */}
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-lg flex-shrink-0">
                                            {(item.StudentTitle || item.Title || "?").charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-base font-bold text-gray-900 truncate pr-2">
                                                {item.StudentTitle || "Unknown Student"} {item.StudentNick ? `(${item.StudentNick})` : ""}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">ID: #{item.Id}</span>
                                                <span className="text-xs text-gray-400">•</span>
                                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Calendar size={10} />
                                                    {convertDateTime(item.CreatedAt)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right flex-shrink-0">
                                        <div className="text-lg font-bold text-gray-900 tracking-tight">
                                            {formatPrice(Number(item.Amount) || 0)}
                                        </div>
                                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mt-1 ${statusConfig.bgColor} ${statusConfig.textColor}`}>
                                            <StatusIcon size={10} />
                                            {statusConfig.label}
                                        </div>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="h-px bg-gray-100 w-full" />

                                {/* Sub Info */}
                                {item.Title && (
                                    <div className="flex items-start gap-2">
                                        <div className="mt-0.5 p-1 rounded-md bg-purple-50 text-purple-600">
                                            <FileText size={14} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Description</p>
                                            <p className="text-sm text-gray-700 font-medium leading-relaxed">{item.Title}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Actions Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                    {/* Print Actions */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => printSchoolBillInvoice(item)}
                                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-amber-50 text-amber-700 rounded-xl text-xs font-bold hover:bg-amber-100 transition-colors"
                                        >
                                            <Printer size={14} /> Invoice
                                        </button>
                                        <button
                                            onClick={() => printSchoolBillReceipt(item)}
                                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors"
                                        >
                                            <Printer size={14} /> Receipt
                                        </button>
                                    </div>

                                    {/* Edit/Delete Actions */}
                                    <div className="flex gap-2">
                                        {onEdit && (
                                            <button
                                                onClick={() => onEdit(item)}
                                                className="flex-1 px-3 py-2 bg-gray-50 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Edit size={14} /> Edit
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(item)}
                                            className="px-3 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors"
                                            title="Delete Bill"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                {/* Status Toggle */}
                                <div className="bg-gray-50 rounded-xl p-1 flex gap-1">
                                    {[0, 1, 2].map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => handleStatusClick(item, s)}
                                            className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${item.Status === s
                                                ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200'
                                                : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'
                                                }`}
                                        >
                                            {getStatusConfig(s).label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Load More */}
                {!allDataLoaded && hasMore && (
                    <div className="flex items-center justify-center py-6">
                        <button
                            onClick={() => fetchData(pageRef.current + 1)}
                            disabled={fetchingRef.current}
                            className="px-8 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 text-sm font-bold hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm"
                        >
                            {fetchingRef.current ? (
                                <span className="inline-flex items-center gap-2">
                                    <RefreshCw size={16} className="animate-spin" /> Loading more...
                                </span>
                            ) : (
                                <span>Load More Bills</span>
                            )}
                        </button>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center shadow-sm mx-4">
                        <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center mx-auto mb-3 text-red-600">
                            <X size={24} />
                        </div>
                        <p className="text-red-900 font-bold mb-1">Error Loading Data</p>
                        <p className="text-red-700 text-sm mb-4">{error.message}</p>
                        <button
                            onClick={handleRefresh}
                            className="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors text-sm font-bold active:scale-95 shadow-lg shadow-red-600/20"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Loading Skeletons */}
                {isFetching && (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse shadow-sm">
                                <div className="space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className="w-12 h-12 bg-gray-100 rounded-2xl" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 bg-gray-100 rounded-lg w-1/2" />
                                                <div className="h-3 bg-gray-100 rounded-lg w-1/4" />
                                            </div>
                                        </div>
                                        <div className="w-20 h-8 bg-gray-100 rounded-lg" />
                                    </div>
                                    <div className="h-px bg-gray-100 w-full" />
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="h-10 bg-gray-100 rounded-xl" />
                                        <div className="h-10 bg-gray-100 rounded-xl" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* End of List */}
                {!hasMore && !isFetching && data.length > 0 && (
                    <div className="text-center py-12">
                        <div className="inline-flex items-center gap-2 text-xs text-gray-500 bg-white border border-gray-200 px-4 py-2 rounded-full shadow-sm">
                            <CheckCircle size={14} className="text-green-500" />
                            <span className="font-medium">All bills loaded</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Status Update Confirmation Modal */}
            {showStatusModal && selectedItem && selectedStatus !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden scale-100">
                        <div className="p-6">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${selectedStatus === 0 ? 'bg-red-100 text-red-600' :
                                selectedStatus === 1 ? 'bg-yellow-100 text-yellow-600' :
                                    'bg-green-100 text-green-600'
                                }`}>
                                {selectedStatus === 0 ? <XCircle size={24} /> :
                                    selectedStatus === 1 ? <FileText size={24} /> :
                                        <Receipt size={24} />}
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-2">Update Status?</h3>
                            <p className="text-gray-600 text-sm leading-relaxed mb-6">
                                Change status for <span className="font-semibold text-gray-900">{selectedItem.StudentTitle}</span> to <span className={`font-bold ${selectedStatus === 0 ? 'text-red-600' :
                                    selectedStatus === 1 ? 'text-yellow-600' :
                                        'text-green-600'
                                    }`}>{getStatusConfig(selectedStatus).label}</span>?
                            </p>

                            <div className="bg-gray-50 rounded-2xl p-4 mb-6 space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-500 font-medium">Bill ID</span>
                                    <span className="text-gray-900 font-mono">#{selectedItem.Id}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-500 font-medium">Amount</span>
                                    <span className="text-gray-900 font-bold">{formatPrice(Number(selectedItem.Amount) || 0)}</span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleCancelStatusUpdate}
                                    className="flex-1 px-4 py-3 rounded-xl bg-gray-100 text-gray-700 text-sm font-bold hover:bg-gray-200 active:scale-95 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateStatus}
                                    className={`flex-1 px-4 py-3 rounded-xl text-white text-sm font-bold active:scale-95 transition-all shadow-lg ${selectedStatus === 0 ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20' :
                                        selectedStatus === 1 ? 'bg-yellow-600 hover:bg-yellow-700 shadow-yellow-600/20' :
                                            'bg-green-600 hover:bg-green-700 shadow-green-600/20'
                                        }`}
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
