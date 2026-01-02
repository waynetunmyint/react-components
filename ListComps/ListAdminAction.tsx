"use client";
import { useState, useRef, useEffect, useMemo } from "react";
import {
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
  RefreshCw,
  Book,
  ArrowDown,
  Video,
} from "lucide-react";
import { BASE_URL, IMAGE_URL, PAGE_ID } from "@/config";
import { GetStoredJWT } from "../StorageComps/StorageCompOne";
import { convertDateTime } from "../HelperComps/TextCaseComp";

// New Refined Components
import { AdminListToolbar } from "./AdminListComps/AdminListToolbar";
import { AdminListCard } from "./AdminListComps/AdminListCard";
import { AdminListSkeleton } from "./AdminListComps/AdminListSkeleton";
import { AdminListEmpty } from "./AdminListComps/AdminListEmpty";
import { AdminListModals } from "./AdminListComps/AdminListModals";

interface Props {
  dataSource: string;
  imageField?: string;
  imageClassName?: string;
  badgeImage?: string;
  headingField?: string;
  subHeadingFields?: string[];
  gridFields?: string[];
  idField?: string;
  defaultImage?: string;
  customAPI?: string;
  renderComp?: (item: Record<string, any>) => React.ReactNode;
  activeSoldToggle?: boolean;
  activeBlockToggle?: boolean;
  activeInActiveToggle?: boolean;
  fields?: Array<{
    fieldName: string;
    type: string;
    required?: boolean;
    customAPI?: string;
    customSource?: string;
    defaultValue?: string;
  }>;
  imageSize?: string;
  IsBill?: boolean;
}

export default function ListAdminActionComp({
  dataSource,
  imageField,
  badgeImage,
  headingField,
  subHeadingFields = [],
  gridFields = [],
  defaultImage = "logo.png",
  customAPI,
  activeSoldToggle,
  activeBlockToggle,
  activeInActiveToggle,
  fields = [],
  imageSize = "small",
  IsBill,
}: Props) {
  const [data, setData] = useState<Array<Record<string, any>>>([]);
  const [page, setPage] = useState(1);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState<'create' | 'edit' | 'view' | null>(null);
  const [selectedItem, setSelectedItem] = useState<Record<string, any> | null>(null);
  const [statusFilter, setStatusFilter] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const fetchingRef = useRef(false);
  const touchStartY = useRef<number>(0);
  const touchEndY = useRef<number>(0);
  const token = GetStoredJWT();
  const searchInputId = `search-${dataSource}`;
  const cacheKey = `listData_cache_${dataSource}_${PAGE_ID}`;

  const filteredData = useMemo(() =>
    statusFilter !== null ? data.filter((item) => Number(item.Status) === statusFilter) : data,
    [data, statusFilter]
  );

  const fetchData = async (pageNo: number, loadAll = false, isForce = false) => {
    const minDelay = 600;
    const startTime = Date.now();

    try {
      if (fetchingRef.current && !isForce) return;
      if (!loadAll && !isForce && (pageNo > 1 && !hasMore)) return;

      fetchingRef.current = true;
      if (pageNo === 1 && !loadAll && !isForce) {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const { data: cachedData } = JSON.parse(cached);
          if (cachedData?.length > 0) {
            setData(cachedData);
            setIsFetching(false);
          }
        }
      }

      if ((data.length === 0) || isForce) {
        setIsFetching(true);
        if (isForce) setData([]);
      }

      const url = customAPI ? `${BASE_URL}/${customAPI}` : loadAll
        ? `${BASE_URL}/${dataSource}/api`
        : `${BASE_URL}/${dataSource}/api/byPageId/byPage/${PAGE_ID}/${pageNo}`;

      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("Fetch failed");
      const newData = await res.json();

      if (pageNo === 1 || loadAll) {
        localStorage.setItem(cacheKey, JSON.stringify({ data: newData, timestamp: Date.now() }));
        setData(newData);
      } else {
        setData(prev => {
          const ids = new Set(prev.map(i => i.Id));
          return [...prev, ...newData.filter((i: any) => !ids.has(i.Id))];
        });
      }

      setPage(pageNo);
      setHasMore(newData.length > 0 && !loadAll);
      setError(null);

      const elapsed = Date.now() - startTime;
      if (elapsed < minDelay) await new Promise(r => setTimeout(r, minDelay - elapsed));
    } catch (err: any) {
      setError(err);
    } finally {
      fetchingRef.current = false;
      setIsFetching(false);
    }
  };

  const fetchSearchData = async (keyword: string) => {
    if (!keyword.trim()) return fetchData(1);
    try {
      setIsFetching(true);
      const res = await fetch(`${BASE_URL}/${dataSource}/api/byPageId/bySearch/${PAGE_ID}/${encodeURIComponent(keyword)}`);
      const result = await res.json();
      setData(result);
      setHasMore(false);
    } catch (err) {
      setData([]);
    } finally {
      setIsFetching(false);
    }
  };

  const handleAction = (action: string, item: any) => {
    setOpenDropdown(null);
    if (action === "view") {
      localStorage.setItem("StoredItem", JSON.stringify(item));
      window.location.href = `/${dataSource}/view/${item?.Id}`;
    } else if (action === "edit") {
      localStorage.setItem("StoredItem", JSON.stringify(item));
      setSelectedItem(item);
      setShowModal('edit');
    } else if (action === "delete") {
      if (!window.confirm("Confirm delete?")) return;
      const fd = new FormData(); fd.append("id", item.Id);
      fetch(`${BASE_URL}/${dataSource}/api`, { method: "DELETE", body: fd, headers: { Authorization: `Bearer ${token}` } })
        .then(() => {
          setData(prev => prev.filter(i => i.Id !== item.Id));
        });
    }
  };

  const handleStatusUpdate = async (val: string, item: any) => {
    setOpenDropdown(null);
    const fd = new FormData(); fd.append("id", item.Id); fd.append("status", val);
    await fetch(`${BASE_URL}/${dataSource}/api`, { method: "PATCH", body: fd, headers: { Authorization: `Bearer ${token}` } });
    setData(prev => prev.map(i => i.Id === item.Id ? { ...i, Status: Number(val) } : i));
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setSearch("");
    setStatusFilter(null);
    fetchData(1, false, true).finally(() => setRefreshing(false));
  };

  useEffect(() => {
    fetchData(1);
  }, [dataSource]);

  const renderStatus = (status?: string) => {
    const s = Number(status);
    const config: any = {
      0: { text: "Inactive", className: "bg-red-50 text-red-600 border-red-100" },
      1: { text: "Active", className: "bg-brand-green text-white border-brand-green/20" },
      2: { text: "Sold", className: "bg-amber-50 text-amber-600 border-amber-100" },
    }[s] || { text: "Unknown", className: "bg-slate-50 text-slate-500 border-slate-100" };

    return (
      <span
        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-md border ${config.className}`}
      >
        {config.text}
      </span>
    );
  };

  const getFieldIcon = (f: string) => {
    const lower = f.toLowerCase();
    const iconProps = { size: 14, className: "opacity-70" };
    if (lower.includes("price") || lower.includes("amount")) return <DollarSign {...iconProps} />;
    if (lower.includes("email")) return <Mail {...iconProps} />;
    if (lower.includes("phone")) return <Phone {...iconProps} />;
    if (lower.includes("address")) return <MapPin {...iconProps} />;
    if (lower.includes("date") || lower.includes("createdat")) return <Calendar {...iconProps} />;
    if (lower.includes("zoom") || lower.includes("video")) return <Video {...iconProps} />;
    return <Info {...iconProps} />;
  };

  const formatLabel = (s: string) => s.replace(/([A-Z])/g, ' $1').trim();

  return (
    <div
      className="min-h-screen bg-brand-beige pb-32 transition-colors duration-500 overflow-x-hidden"
      onTouchStart={(e) => { if (window.scrollY === 0) touchStartY.current = e.touches[0].clientY; }}
      onTouchMove={(e) => touchEndY.current = e.touches[0].clientY}
      onTouchEnd={() => { if (touchEndY.current - touchStartY.current > 100 && !refreshing) handleRefresh(); }}
    >
      {/* Subtle Background Accent */}
      <div className="fixed top-0 left-0 w-full h-96 bg-gradient-to-b from-brand-gold/5 to-transparent pointer-events-none -z-10" />

      <div className="w-full px-4 sm:px-8">
        <AdminListToolbar
          dataSource={dataSource} search={search} refreshing={refreshing} showFilters={showFilters}
          statusFilter={statusFilter} IsBill={IsBill} searchInputId={searchInputId}
          setSearch={setSearch} fetchSearchData={fetchSearchData} fetchData={fetchData}
          handleRefresh={handleRefresh} setShowFilters={setShowFilters} setStatusFilter={setStatusFilter}
          setShowModal={setShowModal}
        />

        {isFetching && data.length === 0 ? (
          <AdminListSkeleton />
        ) : filteredData.length === 0 ? (
          <AdminListEmpty
            emptyTitle={search || statusFilter !== null ? "No matching results" : `Empty ${dataSource}`}
            emptyDescription={search || statusFilter !== null ? "We couldn't find what you're looking for. Try different filters?" : `Your ${dataSource} list is currently empty. Ready to create your first entry?`}
            onRefresh={handleRefresh} onCreate={() => setShowModal('create')}
          />
        ) : (
          <div className="space-y-5">
            {filteredData.map((item, index) => (
              <AdminListCard
                key={item.Id || index} item={item} index={index}
                imageField={imageField} imageSrc={item?.[imageField!] ? `${IMAGE_URL}/uploads/${item[imageField!]}` : `${IMAGE_URL}/uploads/${defaultImage}`}
                badgeSrc={item?.[badgeImage!] ? `${IMAGE_URL}/uploads/${item[badgeImage!]}` : null}
                headingField={headingField} subHeadingFields={subHeadingFields} gridFields={gridFields}
                IsBill={!!IsBill} activeInActiveToggle={activeInActiveToggle} activeBlockToggle={activeBlockToggle}
                activeSoldToggle={activeSoldToggle} openDropdown={openDropdown} setOpenDropdown={setOpenDropdown}
                renderStatus={renderStatus} getFieldIcon={getFieldIcon} formatLabel={formatLabel}
                convertDateTime={convertDateTime} handleAction={handleAction} handleStatusUpdate={handleStatusUpdate}
                ArrowRightIcon={ArrowRightIcon}
              />
            ))}

            {hasMore && !isFetching && !search && (
              <div className="pt-12 pb-8 flex justify-center">
                <button
                  onClick={() => fetchData(page + 1)}
                  className="group flex items-center gap-3 px-10 py-5 bg-white text-slate-900 font-black uppercase tracking-widest rounded-[2rem] border border-slate-200 shadow-lg hover:shadow-2xl hover:border-brand-green hover:-translate-y-1 active:scale-95 transition-all duration-500"
                >
                  Explore More
                  <div className="p-1 rounded-full bg-slate-100 group-hover:bg-brand-green group-hover:text-white transition-colors">
                    <ArrowDown size={18} strokeWidth={3} className="group-hover:translate-y-0.5 transition-transform" />
                  </div>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {isFetching && data.length > 0 && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-3 px-6 py-3 bg-slate-900/90 backdrop-blur-md rounded-full shadow-2xl border border-white/10 ring-1 ring-black/5">
            <RefreshCw size={16} strokeWidth={3} className="animate-spin text-brand-gold" />
            <span className="text-[11px] font-black uppercase tracking-widest text-white">Syncing Data...</span>
          </div>
        </div>
      )}

      <AdminListModals
        showModal={showModal} dataSource={dataSource} fields={fields}
        imageSize={imageSize} selectedItem={selectedItem} setShowModal={setShowModal as any}
        setSelectedItem={setSelectedItem} fetchData={fetchData}
      />
    </div>
  );
}

function ArrowRightIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  );
}