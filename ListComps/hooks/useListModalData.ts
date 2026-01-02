"use client";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { BASE_URL } from "@/config";
import { GetStoredJWT } from "../../StorageComps/StorageCompOne";

interface UseListModalDataProps {
    dataSource: string;
    customAPI?: string;
}

interface UseListModalDataReturn {
    // State
    data: Array<Record<string, any>>;
    page: number;
    isFetching: boolean;
    error: Error | null;
    hasMore: boolean;
    refreshing: boolean;
    search: string;
    allDataLoaded: boolean;
    statusFilter: number | null;
    pageTitleFilter: string | null;
    showFilters: boolean;
    openDropdown: string | null;
    showModal: 'create' | 'update' | null;
    selectedItem: Record<string, any> | null;

    // Setters
    setSearch: (val: string) => void;
    setStatusFilter: (val: number | null) => void;
    setPageTitleFilter: (val: string | null) => void;
    setShowFilters: (val: boolean) => void;
    setOpenDropdown: (val: string | null) => void;
    setShowModal: (val: 'create' | 'update' | null) => void;
    setSelectedItem: (val: Record<string, any> | null) => void;
    setData: React.Dispatch<React.SetStateAction<Array<Record<string, any>>>>;

    // Actions
    fetchData: (pageNo: number, loadAll?: boolean) => Promise<void>;
    fetchSearchData: (keyword: string) => Promise<void>;
    handleRefresh: () => void;
    handleAction: (action: string, item: any, headingField?: string, fields?: any[]) => Promise<void>;
    handleStatusUpdate: (statusValue: string, item: any, isInterestingUpdate?: boolean) => Promise<void>;

    // Computed
    uniquePageTitles: string[];
    pageTitleToIdMap: Record<string, any>;
    filteredData: Array<Record<string, any>>;
    totalResultsLabel: string;
    hasFiltersApplied: boolean;

    // Touch handlers for pull-to-refresh
    handleTouchStart: (e: React.TouchEvent) => void;
    handleTouchMove: (e: React.TouchEvent) => void;
    handleTouchEnd: () => void;
}

export function useListModalData({
    dataSource,
    customAPI,
}: UseListModalDataProps): UseListModalDataReturn {
    const [data, setData] = useState<Array<Record<string, any>>>([]);
    const [page, setPage] = useState(1);
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState("");
    const [allDataLoaded, setAllDataLoaded] = useState(false);
    const [statusFilter, setStatusFilter] = useState<number | null>(null);
    const [pageTitleFilter, setPageTitleFilter] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [showModal, setShowModal] = useState<'create' | 'update' | null>(null);
    const [selectedItem, setSelectedItem] = useState<Record<string, any> | null>(null);

    const fetchingRef = useRef(false);
    const pageRef = useRef<number>(1);
    const touchStartY = useRef<number>(0);
    const touchEndY = useRef<number>(0);
    const token = GetStoredJWT();

    // Computed values
    const hasFiltersApplied = useMemo(
        () => Boolean(search.trim()) || statusFilter !== null || pageTitleFilter !== null,
        [search, statusFilter, pageTitleFilter]
    );

    const uniquePageTitles = useMemo(() => {
        if (!Array.isArray(data)) return [];
        const titles = data.map((item) => item?.PageTitle).filter(Boolean);
        return Array.from(new Set(titles)).sort();
    }, [data]);

    const pageTitleToIdMap = useMemo(() => {
        const map: Record<string, any> = {};
        if (Array.isArray(data)) {
            data.forEach((item) => {
                if (item?.PageTitle && item?.PageId) map[item.PageTitle] = item.PageId;
            });
        }
        return map;
    }, [data]);

    const filteredData = useMemo(() => {
        let filtered = data || [];
        if (statusFilter !== null) {
            filtered = filtered.filter((item) => item && Number(item.Status) === statusFilter);
        }
        if (pageTitleFilter !== null) {
            filtered = filtered.filter((item) => item && item.PageTitle === pageTitleFilter);
        }
        return filtered;
    }, [data, statusFilter, pageTitleFilter]);

    const totalResultsLabel =
        filteredData.length === 1 ? "1 result" : `${filteredData.length} results`;

    // Fetch data
    const fetchData = useCallback(async (pageNo: number, loadAll = false) => {
        try {
            if (fetchingRef.current) return;
            if (!loadAll && (allDataLoaded || !hasMore)) return;

            fetchingRef.current = true;
            if (data.length === 0) setIsFetching(true);

            await new Promise((r) => setTimeout(r, 150));

            const url = customAPI
                ? `${BASE_URL}/${customAPI}`
                : pageTitleFilter && pageTitleToIdMap[pageTitleFilter]
                    ? `${BASE_URL}/${dataSource}/api/byPageId/${pageTitleToIdMap[pageTitleFilter]}`
                    : loadAll
                        ? `${BASE_URL}/${dataSource}/api`
                        : `${BASE_URL}/${dataSource}/api/byPage/${pageNo}`;

            const res = await fetch(url, { cache: "no-store" });
            if (!res.ok) throw new Error(`Failed to fetch data: ${res.status} ${res.statusText}`);

            const newData: any[] = await res.json();
            if (!Array.isArray(newData)) throw new Error("Invalid data format - expected array");

            setData((prev) => {
                if (pageNo === 1 || loadAll) {
                    if (pageNo === 1 && newData.length > 0) {
                        try {
                            localStorage.setItem(`ListCache_${dataSource}`, JSON.stringify(newData));
                        } catch (e) {
                            // Storage error - ignore
                        }
                    }
                    return newData;
                }
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
    }, [allDataLoaded, hasMore, data.length, customAPI, pageTitleFilter, pageTitleToIdMap, dataSource]);

    // Search data
    const fetchSearchData = useCallback(async (keyword: string) => {
        if (!keyword.trim()) {
            fetchData(1);
            return;
        }

        try {
            setStatusFilter(null);
            setPageTitleFilter(null);
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
    }, [dataSource, fetchData]);

    // Refresh
    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        setSearch("");
        setStatusFilter(null);
        setPageTitleFilter(null);
        fetchData(1).finally(() => setRefreshing(false));
    }, [fetchData]);

    // Action handler
    const handleAction = useCallback(async (action: string, item: any, headingField?: string, fields?: any[]) => {
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
                    if (!window.confirm(`Are you sure you want to delete "${item?.[headingField ?? "Name"] || "this item"}"?`)) return;
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
                    if (fields && fields.length > 0) {
                        fields.forEach((f) => {
                            let key = f.fieldName;
                            let val = item[key];

                            if (f.type === 'dropdown') {
                                const idKey = key + 'Id';
                                if (item[idKey] !== undefined) {
                                    key = idKey;
                                    val = item[idKey];
                                }
                                if (key === 'Page' && item.PageId) {
                                    key = 'PageId';
                                    val = item.PageId;
                                }
                            }

                            if (headingField && f.fieldName === headingField) {
                                val = `${val} (Copy)`;
                            }

                            if (val !== undefined && val !== null) {
                                cloneData.append(key, val);
                            }
                        });
                    } else {
                        Object.keys(item).forEach((k) => {
                            if (['Id', 'CreatedAt', 'UpdatedAt', 'ViewCount'].includes(k)) return;
                            let val = item[k];
                            if (headingField && k === headingField) val = `${val} (Copy)`;
                            if (val !== null) cloneData.append(k, val);
                        });
                    }

                    const res = await fetch(apiUrl, {
                        method: "POST",
                        body: cloneData,
                        headers: { Authorization: `Bearer ${token}` },
                    });

                    if (!res.ok) throw new Error("Clone failed");
                    fetchData(pageRef.current);
                    break;
            }
        } catch (err) {
            // Action error - handled silently
        }
    }, [dataSource, token, fetchData]);

    // Status update
    const handleStatusUpdate = useCallback(async (statusValue: string, item: any, isInterestingUpdate = false) => {
        setOpenDropdown(null);
        try {
            const formData = new FormData();
            formData.append("id", item?.Id);

            if (isInterestingUpdate) {
                formData.append("IsInteresting", statusValue);
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
                    i.Id === item.Id
                        ? { ...i, ...(isInterestingUpdate ? { IsInteresting: Number(statusValue) } : { Status: Number(statusValue) }) }
                        : i
                )
            );
        } catch (err) {
            // Status update error - handled silently
        }
    }, [dataSource, token]);

    // Pull-to-refresh handlers
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (window.scrollY === 0) touchStartY.current = e.touches[0].clientY;
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        touchEndY.current = e.touches[0].clientY;
    }, []);

    const handleTouchEnd = useCallback(() => {
        if (touchEndY.current - touchStartY.current > 100 && !refreshing) {
            handleRefresh();
        }
    }, [refreshing, handleRefresh]);

    // Initial fetch on dataSource change
    useEffect(() => {
        const storageKey = `ListCache_${dataSource}`;
        const cached = localStorage.getItem(storageKey);
        let initialData: any[] = [];

        if (cached) {
            try {
                initialData = JSON.parse(cached);
            } catch (e) {
                // Cache error - ignore
            }
        }

        setData(initialData);
        setPage(1);
        pageRef.current = 1;
        setHasMore(true);
        setAllDataLoaded(false);
        fetchData(1);
    }, [dataSource]);

    // Set ActiveDataSource in localStorage
    useEffect(() => {
        if (dataSource) {
            localStorage.setItem("ActiveDataSource", dataSource);
        }
    }, [dataSource]);

    return {
        // State
        data,
        page,
        isFetching,
        error,
        hasMore,
        refreshing,
        search,
        allDataLoaded,
        statusFilter,
        pageTitleFilter,
        showFilters,
        openDropdown,
        showModal,
        selectedItem,

        // Setters
        setSearch,
        setStatusFilter,
        setPageTitleFilter,
        setShowFilters,
        setOpenDropdown,
        setShowModal,
        setSelectedItem,
        setData,

        // Actions
        fetchData,
        fetchSearchData,
        handleRefresh,
        handleAction,
        handleStatusUpdate,

        // Computed
        uniquePageTitles,
        pageTitleToIdMap,
        filteredData,
        totalResultsLabel,
        hasFiltersApplied,

        // Touch handlers
        handleTouchStart,
        handleTouchMove,
        handleTouchEnd,
    };
}
