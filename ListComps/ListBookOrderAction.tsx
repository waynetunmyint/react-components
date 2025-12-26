"use client";
import { useState, useRef, useEffect, useMemo } from "react";
import {
  Trash2,
  Search,
  RefreshCw,
  X,
  Printer,
  User,
  Receipt,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Calendar,
  ShoppingBag,
  CheckCircle,
} from "lucide-react";
import { BASE_URL } from "../../../config";
import { GetStoredJWT } from "../StorageComps/StorageCompOne";
import { convertToDateTime, formatNumber } from "../HelperComps/TextCaseComp";

interface Props {
  dataSource: string;
}

export default function ListBookOrderAction({ dataSource }: Props) {
  const [data, setData] = useState<Array<Record<string, any>>>([]);
  const [page, setPage] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [allDataLoaded, setAllDataLoaded] = useState(false);

  const fetchingRef = useRef(false);
  const pageRef = useRef<number>(1);
  const touchStartY = useRef<number>(0);
  const touchEndY = useRef<number>(0);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const token = GetStoredJWT();

  /** Fetch paginated data */
  const fetchData = async (pageNo: number, loadAll = false) => {
    try {
      if (fetchingRef.current) return;
      if (!loadAll && (allDataLoaded || !hasMore)) return;

      fetchingRef.current = true;
      if (data.length === 0) setIsFetching(true);

      await new Promise((r) => setTimeout(r, 150));

      const url = loadAll
        ? `${BASE_URL}/${dataSource}/api`
        : `${BASE_URL}/${dataSource}/api/byPage/${pageNo}`;

      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to fetch data: ${res.status}`);

      const newData: any[] = await res.json();
      if (!Array.isArray(newData)) throw new Error("Invalid data format");

      setData((prev) => {
        if (pageNo === 1 || loadAll) return newData;
        const existingIds = new Set(prev.map((item) => item.Id));
        const filteredNewData = newData.filter((item) => !existingIds.has(item.Id));
        return [...prev, ...filteredNewData];
      });

      setPage(pageNo);
      pageRef.current = pageNo;
      const hasMoreData = newData.length > 0 && !loadAll;
      setHasMore(hasMoreData);
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

  /** Print Customer Info */
  const handlePrintCustomer = (item: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Customer Info - ${item.CustomerName}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .info { margin: 20px 0; }
            .info-row { display: flex; margin: 10px 0; }
            .label { font-weight: bold; width: 150px; }
            .value { flex: 1; }
            @media print {
              body { padding: 20px; }
            }
          </style>
        </head>
        <body>
          <h1>Customer Information</h1>
          <div class="info">
            <div class="info-row">
              <div class="label">Name:</div>
              <div class="value">${item.CustomerName || 'N/A'}</div>
            </div>
            <div class="info-row">
              <div class="label">Phone:</div>
              <div class="value">${item.CustomerPhone || 'N/A'}</div>
            </div>
            <div class="info-row">
              <div class="label">Email:</div>
              <div class="value">${item.CustomerEmail || 'N/A'}</div>
            </div>
            <div class="info-row">
              <div class="label">Address:</div>
              <div class="value">${item.CustomerAddress || 'N/A'}</div>
            </div>
            <div class="info-row">
              <div class="label">Order Date:</div>
              <div class="value">${convertToDateTime(item.CreatedAt)}</div>
            </div>
            <div class="info-row">
              <div class="label">Order Total:</div>
              <div class="value">${formatNumber(item.OrderGrandTotal)} MMK</div>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  /** Print Receipt */
  const handlePrintReceipt = (item: any) => {
    let orderItems = [];
    try {
      orderItems = typeof item.OrderItems === 'string'
        ? JSON.parse(item.OrderItems)
        : item.OrderItems || [];
    } catch (e) {
      console.error('Failed to parse order items:', e);
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - Order #${item.Id}</title>
          <style>
            body { 
              font-family: 'Courier New', monospace; 
              padding: 20px; 
              max-width: 400px;
              margin: 0 auto;
            }
            .header { 
              text-align: center; 
              border-bottom: 2px dashed #333;
              padding-bottom: 10px;
              margin-bottom: 10px;
            }
            .customer {
              margin: 15px 0;
              font-size: 12px;
            }
            .items {
              margin: 15px 0;
            }
            .item {
              display: flex;
              justify-content: space-between;
              margin: 5px 0;
              font-size: 12px;
            }
            .item-name { flex: 1; }
            .item-qty { width: 50px; text-align: center; }
            .item-price { width: 80px; text-align: right; }
            .total {
              border-top: 2px dashed #333;
              padding-top: 10px;
              margin-top: 10px;
              font-size: 14px;
              font-weight: bold;
              text-align: right;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 11px;
              border-top: 2px dashed #333;
              padding-top: 10px;
            }
            @media print {
              body { padding: 10px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2 style="margin: 5px 0;">ORDER RECEIPT</h2>
            <div>Order #${item.Id}</div>
            <div style="font-size: 11px;">${convertToDateTime(item.CreatedAt)}</div>
          </div>
          
          <div class="customer">
            <div><strong>Customer:</strong> ${item.CustomerName || 'N/A'}</div>
            <div><strong>Phone:</strong> ${item.CustomerPhone || 'N/A'}</div>
            ${item.CustomerAddress ? `<div><strong>Address:</strong> ${item.CustomerAddress}</div>` : ''}
          </div>

          <div class="items">
            <div style="border-bottom: 1px solid #333; padding-bottom: 5px; margin-bottom: 5px;">
              <div class="item" style="font-weight: bold;">
                <div class="item-name">Item</div>
                <div class="item-qty">Qty</div>
                <div class="item-price">Price</div>
              </div>
            </div>
            ${orderItems.map((orderItem: any) => `
              <div class="item">
                <div class="item-name">${orderItem.Title || 'Item'}</div>
                <div class="item-qty">x${orderItem.Qty || 1}</div>
                <div class="item-price">${formatNumber(orderItem.PriceTotal || orderItem.Price || 0)}</div>
              </div>
            `).join('')}
          </div>

          <div class="total">
            TOTAL: ${formatNumber(item.OrderGrandTotal)} MMK
          </div>

          <div class="footer">
            <div>Thank you for your order!</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  /** Refresh */
  const handleRefresh = () => {
    setRefreshing(true);
    setSearch("");
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
  }, [dataSource]);

  const Toolbar = () => (
    <div className="sticky top-0 z-20 bg-gradient-to-b from-gray-50 via-gray-50 to-transparent pb-3">
      <div className="py-3 mx-auto w-full">
        <div className="relative group">
          <Search
            className="absolute left-1 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors pointer-events-none"
            size={18}
          />
          <input
            type="text"
            placeholder={`Search ${dataSource}...`}
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-24 py-2.5 bg-white border border-gray-200/60 rounded-xl text-[15px] text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 focus:bg-white transition-all duration-200 shadow-sm hover:border-gray-300"
          />
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  fetchData(1);
                }}
                className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-lg transition-all duration-150 active:scale-95"
              >
                <X size={16} />
              </button>
            )}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-1.5 hover:bg-gray-100 text-gray-500 rounded-lg transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  /** Empty State */
  if (!isFetching && data.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50/50 sm:ml-10 pr-4">
        <Toolbar />
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center mb-5">
            <ShoppingBag size={32} className="text-gray-300" />
          </div>
          <div className="space-y-2 max-w-md mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              {search.trim() ? "No orders found" : "No orders yet"}
            </h3>
            <p className="text-[15px] text-gray-500">
              {search.trim()
                ? "Try adjusting your search"
                : "Orders will appear here when customers place them"}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 rounded-lg bg-gray-900 text-white text-[15px] font-medium hover:bg-gray-800 transition-colors active:scale-95"
          >
            Refresh list
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen sm:ml-10 pr-4"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <Toolbar />

      <div className="mx-auto w-full pb-6 space-y-2.5">
        {data.map((item, index) => (
          <div
            key={item.Id || index}
            className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100/50 hover:border-gray-200"
          >
            <div className="p-4">
              {/* Customer Info */}
              <div className="mb-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <User size={18} className="text-blue-600" />
                  {item.CustomerName || "N/A"}
                </h3>
                <div className="space-y-1.5 text-sm text-gray-600">
                  {item.CustomerPhone && (
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-green-500" />
                      {item.CustomerPhone}
                    </div>
                  )}
                  {item.CustomerEmail && (
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-blue-500" />
                      {item.CustomerEmail}
                    </div>
                  )}
                  {item.CustomerAddress && (
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-red-500" />
                      {item.CustomerAddress}
                    </div>
                  )}
                </div>
              </div>

              {/* Order Details */}
              <div className="pt-3 border-t border-gray-100 space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <DollarSign size={14} className="text-yellow-600" />
                    <span>Total:</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {formatNumber(item.OrderGrandTotal)} MMK
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar size={12} className="text-orange-500" />
                  {convertToDateTime(item.CreatedAt)}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 mt-3 border-t border-gray-100 flex gap-2">
                <button
                  onClick={() => handlePrintCustomer(item)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors active:scale-95"
                >
                  <User size={16} />
                  <span>Customer Info</span>
                </button>
                <button
                  onClick={() => handlePrintReceipt(item)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors active:scale-95"
                >
                  <Receipt size={16} />
                  <span>Receipt</span>
                </button>
                <button
                  onClick={() => handleDelete(item)}
                  className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors active:scale-95"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Load More */}
        {!allDataLoaded && hasMore && (
          <div className="flex items-center justify-center py-6">
            <button
              onClick={() => fetchData(pageRef.current + 1)}
              disabled={fetchingRef.current}
              className="px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 text-[15px] font-medium hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm"
            >
              {fetchingRef.current ? (
                <span className="inline-flex items-center gap-2">
                  <RefreshCw size={16} className="animate-spin" /> Loading...
                </span>
              ) : (
                <span>Load more</span>
              )}
            </button>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <p className="text-red-600 text-[15px] font-medium">{error.message}</p>
            <button
              onClick={handleRefresh}
              className="mt-2.5 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-[15px] font-medium active:scale-95"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading Skeletons */}
        {isFetching && (
          <div className="space-y-2.5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 animate-pulse">
                <div className="space-y-3">
                  <div className="h-5 bg-gray-200 rounded-lg w-2/3" />
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded-lg w-full" />
                    <div className="h-3 bg-gray-200 rounded-lg w-5/6" />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <div className="flex-1 h-9 bg-gray-200 rounded-lg" />
                    <div className="flex-1 h-9 bg-gray-200 rounded-lg" />
                    <div className="w-12 h-9 bg-gray-200 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* End of List */}
        {!hasMore && !isFetching && data.length > 0 && (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2 text-[13px] text-gray-400 bg-gray-50 px-3.5 py-2 rounded-full">
              <CheckCircle size={14} />
              <span>You&apos;ve reached the end</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
