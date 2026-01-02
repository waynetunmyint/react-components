"use client";
import React, { useState, useRef, useEffect } from "react";
import {
    Trash2,
    Search,
    RefreshCw,
    X,
    User,
    Receipt,
    Phone,
    ShoppingBag,
    CheckCircle,
    XCircle,
    Clock,
    PackageCheck,
    Edit,
} from "lucide-react";
import { BASE_URL, PAGE_ID } from "@/config";
import { GetStoredJWT } from "../StorageComps/StorageCompOne";
import { printBookOrderCustomer as printProductOrderCustomer } from "../BookComps/BookOrderCustomer";
import { printBookOrderReceipt as printProductOrderReceipt } from "../BookComps/BookOrderReceipt";
import { convertDateTime, formatPrice } from "../HelperComps/TextCaseComp";

interface Props {
    dataSource: string;
    pageId?: number | string;
    onEdit?: (order: any) => void;
    onAddNew?: () => void;
}

export default function ListAdminProductOrderAction({ dataSource, pageId, onEdit, onAddNew }: Props) {
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
    const [statusFilter, setStatusFilter] = useState<number | null>(null);

    const fetchingRef = useRef(false);
    const pageRef = useRef<number>(1);
    const effectivePageId = pageId ?? PAGE_ID;
    const token = GetStoredJWT();

    const fetchData = async (pageNo: number) => {
        try {
            if (fetchingRef.current) return;
            fetchingRef.current = true;
            if (data.length === 0) setIsFetching(true);
            const url = `${BASE_URL}/${dataSource}/api/byPageId/byPage/${PAGE_ID}/${pageNo}`;
            const res = await fetch(url, { cache: "no-store" });
            if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
            const newData: any[] = await res.json();
            setData((prev) => {
                if (pageNo === 1) return newData;
                const ids = new Set(prev.map(i => i.Id));
                return [...prev, ...newData.filter(i => !ids.has(i.Id))];
            });
            setPage(pageNo);
            setHasMore(newData.length > 0);
        } catch (err: any) {
            setError(err);
        } finally {
            fetchingRef.current = false;
            setIsFetching(false);
        }
    };

    const fetchSearch = async (kw: string) => {
        if (!kw.trim()) { fetchData(1); return; }
        try {
            setIsFetching(true);
            const res = await fetch(`${BASE_URL}/${dataSource}/api/bySearch/${encodeURIComponent(kw)}`);
            const result = await res.json();
            setData((Array.isArray(result) ? result : []).filter(i => String(i.PageId) === String(effectivePageId)));
            setHasMore(false);
            setAllDataLoaded(true);
        } catch (err: any) {
            setData([]);
        } finally {
            setIsFetching(false);
        }
    };

    const handleUpdateStatus = async () => {
        if (!selectedItem || selectedStatus === null) return;
        try {
            const fd = new FormData();
            fd.append("pageId", String(PAGE_ID));
            fd.append("id", selectedItem.Id);
            fd.append("orderStatus", selectedStatus.toString());
            await fetch(`${BASE_URL}/${dataSource}/api`, { method: "PATCH", body: fd, headers: { Authorization: `Bearer ${token}` } });
            setData(prev => prev.map(i => i.Id === selectedItem.Id ? { ...i, OrderStatus: selectedStatus } : i));
            setShowStatusModal(false);
        } catch (err) { alert("Error updating status"); }
    };

    const handleDelete = async (item: any) => {
        if (!window.confirm("Delete order?")) return;
        try {
            const fd = new FormData();
            fd.append("id", item.Id);
            await fetch(`${BASE_URL}/${dataSource}/api`, { method: "DELETE", body: fd, headers: { Authorization: `Bearer ${token}` } });
            setData(prev => prev.filter(i => i.Id !== item.Id));
        } catch (err) { alert("Error deleting"); }
    };

    useEffect(() => { fetchData(1); }, [dataSource]);

    const getStatus = (s: number) => {
        switch (s) {
            case 0: return { label: "Rejected", icon: XCircle, color: "text-red-600", bg: "bg-red-50" };
            case 1: return { label: "Active", icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" };
            case 3: return { label: "Done", icon: PackageCheck, color: "text-blue-600", bg: "bg-blue-50" };
            default: return { label: "Pending", icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" };
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">Product Orders</h1>
                        <p className="text-gray-500 font-bold mt-1 uppercase tracking-widest text-xs">{data.length} Total Orders</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {onAddNew && (
                            <button onClick={onAddNew} className="bg-gray-900 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all">
                                + Manual Order
                            </button>
                        )}
                        <button onClick={() => fetchData(1)} className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-gray-900 transition-all shadow-sm">
                            <RefreshCw size={20} className={isFetching ? "animate-spin" : ""} />
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                    <th className="p-5 text-xs font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Order #</th>
                                    <th className="p-5 text-xs font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Customer Info</th>
                                    <th className="p-5 text-xs font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Status</th>
                                    <th className="p-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right whitespace-nowrap">Total</th>
                                    <th className="p-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right whitespace-nowrap">Print</th>
                                    <th className="p-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right whitespace-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {data.map((item) => {
                                    const status = getStatus(item.OrderStatus ?? 2);
                                    return (
                                        <tr key={item.Id} className="hover:bg-gray-50/80 transition-colors group">
                                            <td className="p-5">
                                                <span className="font-bold text-gray-500">#{item.Id}</span>
                                            </td>
                                            <td className="p-5">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-900">{item.CustomerName || "Anonymous"}</span>
                                                    {item.CustomerPhone && (
                                                        <div className="flex items-center gap-1 text-gray-400 mt-1">
                                                            <Phone size={10} />
                                                            <span className="text-xs font-medium">{item.CustomerPhone}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <div className={`inline-flex px-3 py-1 rounded-full ${status.bg} ${status.color} border border-current/10 items-center gap-1.5`}>
                                                    <status.icon size={12} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">{status.label}</span>
                                                </div>
                                            </td>
                                            <td className="p-5 text-right">
                                                <span className="font-black text-emerald-600 block">{formatPrice(Number(item.OrderGrandTotal) || 0)}</span>
                                                <div className="flex gap-1 justify-end mt-1">
                                                    {[2, 1, 3, 0].map(s => (
                                                        <button
                                                            key={s}
                                                            onClick={() => { setSelectedItem(item); setSelectedStatus(s); setShowStatusModal(true); }}
                                                            className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-black transition-all ${item.OrderStatus === s ? "bg-gray-900 text-white shadow-md" : "bg-gray-100 text-gray-400 hover:bg-gray-200"}`}
                                                            title={s === 2 ? 'Pending' : s === 1 ? 'Active' : s === 3 ? 'Done' : 'Rejected'}
                                                        >
                                                            {s === 2 ? 'P' : s === 1 ? 'A' : s === 3 ? 'D' : 'R'}
                                                        </button>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="p-5 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => printProductOrderCustomer(item)} className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-gray-900 hover:text-white transition-all" title="Customer Copy"><User size={16} /></button>
                                                    <button onClick={() => printProductOrderReceipt(item)} className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-gray-900 hover:text-white transition-all" title="Receipt"><Receipt size={16} /></button>
                                                </div>
                                            </td>
                                            <td className="p-5 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => onEdit?.(item)} className="p-2 bg-blue-50 text-blue-500 rounded-lg hover:bg-blue-600 hover:text-white transition-all"><Edit size={16} /></button>
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
            </div>

            {showStatusModal && (
                <div className="fixed inset-0 z-[100] bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-[40px] p-10 max-w-sm w-full text-center shadow-2xl animate-in fade-in zoom-in-95">
                        <h3 className="text-2xl font-black text-gray-900 mb-2">Update Status</h3>
                        <p className="text-sm text-gray-500 mb-8 font-medium">Change order status?</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowStatusModal(false)} className="flex-1 py-4 bg-gray-50 text-gray-400 rounded-2xl font-black">Cancel</button>
                            <button onClick={handleUpdateStatus} className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-black shadow-xl hover:scale-105 transition-all">Confirm</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
