"use client";
import { useState, useRef, useEffect } from "react";
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
} from "lucide-react";
import { BASE_URL, IMAGE_URL } from "../../config";
import { UniversalGetStoredJWT } from "./UniversalStoredInformationComp";
import { convertToDateTime } from "./UniversalConverterComp";

interface UniversalListWithActionsProps {
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

export default function UniversalListWithActions({
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
}: UniversalListWithActionsProps) {
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [allDataLoaded, setAllDataLoaded] = useState(false);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const touchStartY = useRef<number>(0);
  const touchEndY = useRef<number>(0);
  const token = UniversalGetStoredJWT();

  /** Fetch paginated or full data */
  const fetchData = async (pageNo: number, loadAll = false) => {
    try {
      setIsFetching(true);
      const url = customAPI
        ? `${BASE_URL}/${customAPI}`
        : loadAll
          ? `${BASE_URL}/${dataSource}/api`
          : `${BASE_URL}/${dataSource}/api/byPage/${pageNo}`;

      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch data");

      const newData = await res.json();
      if (!Array.isArray(newData)) throw new Error("Invalid data");

      setData((prev) =>
        pageNo === 1 || loadAll ? newData : [...prev, ...newData]
      );
      setPage(pageNo);
      setHasMore(newData.length > 0 && !loadAll);
      setAllDataLoaded(loadAll);
      setError(null);
    } catch (err: any) {
      setError(err);
      setHasMore(false);
    } finally {
      setIsFetching(false);
    }
  };

  /** 🔍 Fetch search results from API */
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
              `Are you sure you want to delete "${item?.[headingField ?? "Name"] || "this item"
              }"?`
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
      const resJson = await res.json();
      console.log("update status", resJson);

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

  /** Effects */
  useEffect(() => {
    setData([]);
    fetchData(1);
  }, [dataSource]);

  /** Infinite scroll */
  useEffect(() => {
    if (!observerRef.current || !hasMore || isFetching || allDataLoaded) return;
    const observer = new IntersectionObserver(
      (entries) => entries[0].isIntersecting && fetchData(page + 1),
      { threshold: 1 }
    );
    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [observerRef.current, page, isFetching, hasMore, allDataLoaded]);

  /** Pull to refresh */
  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = () => {
    if (touchEndY.current - touchStartY.current > 70 && !refreshing) {
      setRefreshing(true);
      fetchData(1).finally(() => setRefreshing(false));
    }
  };

  /** Helper: render status */
  const renderStatus = (status?: string) => {
    const s = Number(status);
    const colors: any = {
      0: "bg-red-500 text-white",
      1: "bg-green-500 text-white",
      2: "bg-orange-500 text-white",
      9: "bg-blue-500 text-white",
    };
    const text: any = {
      0: "Inactive",
      1: "Active",
      2: "Sold",
      9: "Verified",
    };
    return (
      <span
        className={`px-3 py-1 rounded text-xs font-semibold ${colors[s] || "bg-gray-300 text-gray-700"
          }`}
      >
        {text[s] || "Unknown"}
      </span>
    );
  };

  const getFieldIcon = (f: string) => {
    const lower = f.toLowerCase();
    const map: Record<string, React.ReactNode> = {
      email: <Mail size={15} className="text-blue-500" />,
      phone: <Phone size={15} className="text-green-500" />,
      contact: <Phone size={15} className="text-green-500" />,
      address: <MapPin size={15} className="text-red-500" />,
      location: <MapPin size={15} className="text-red-500" />,
      user: <User size={15} className="text-gray-500" />,
      name: <User size={15} className="text-gray-500" />,
      price: <DollarSign size={15} className="text-yellow-500" />,
      amount: <DollarSign size={15} className="text-yellow-500" />,
      file: <File size={15} className="text-purple-500" />,
      url: <File size={15} className="text-purple-500" />,
      date: <Calendar size={15} className="text-orange-500" />,
      createdate: <Calendar size={15} className="text-orange-500" />,
      website: <Globe size={15} className="" />,
      link: <Link size={15} className="text-blue-400" />,
    };
    return (
      Object.entries(map).find(([key]) => lower.includes(key))?.[1] || (
        <Info size={15} className="text-gray-400" />
      )
    );
  };

  /** --- UI --- */
  if (!isFetching && data.length === 0)
    return (
      <>
        <div className="sticky top-0 z-10 p-3 shadow-sm">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={`Search ${dataSource}...`}
              value={search}
              onChange={(e) => {
                const val = e.target.value;
                setSearch(val);
                fetchSearchData(val);
              }}
              className="w-full pl-11 pr-4 py-3 bg-gray-100 rounded-full text-sm text-gray-800 focus:ring-2 focus:ring-blue-400 focus:bg-white"
            />
          </div>
        </div>

      </>

    );

  return (
    <div
      className="space-y-3 p-2"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 🔍 Search */}
      <div className="sticky top-0 z-10  shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder={`Search ${dataSource}...`}
            value={search}
            onChange={(e) => {
              const val = e.target.value;
              setSearch(val);
              fetchSearchData(val);
            }}
            className="w-full pl-11 pr-4 py-3 bg-gray-100 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-400 focus:bg-white"
          />
        </div>
      </div>

      {refreshing && <p className="text-center text-gray-600">Refreshing...</p>}

      {data.map((item, index) => {
        const imageSrc = item?.[imageField ?? ""]
          ? `${IMAGE_URL}/uploads/${item[imageField ?? ""]}`
          : `${IMAGE_URL}/uploads/${defaultImage}`;
        const badgeSrc = item?.[badgeImage ?? ""]
          ? `${IMAGE_URL}/uploads/${item[badgeImage ?? ""]}`
          : `${IMAGE_URL}/uploads/${defaultImage}`;

        return (
          <div key={index} className="rounded-lg flex flex-col bg-white p-5 shadow-sm hover:bg-gray-50">
            <div className="flex items-start gap-3">
              {imageField && item?.[imageField] !== "logo.png" && (
                <div className="relative">
                  <img
                    src={imageSrc}
                    alt="Item"
                    className={
                      imageClassName ??
                      "w-[75px] h-auto rounded-xl border border-gray-200 object-cover"
                    }
                  />
                  {badgeImage && (
                    <img
                      src={badgeSrc}
                      alt="Badge"
                      className="w-8 h-8 rounded-full absolute -top-2 -right-2 border-2 border-white shadow-md"
                    />
                  )}
                  <p className="absolute bottom-1 right-1 bg-black/50 text-white text-xs px-1 rounded">
                    {item?.[imageField]?.length || 0} KB
                  </p>
                </div>
              )}


              <div className="flex-1 min-w-0">
                {headingField && (
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-gray-800">
                      {item?.[headingField]}
                    </h3>
                    <small className="text-sm font-medium text-gray-600 ml-3">
                      {renderStatus(item?.Status)}
                    </small>
                  </div>
                )}


                <div className="mt-1 text-sm space-y-1">
                  {[
                    subHeadingField,
                    subHeadingField1,
                    subHeadingField2,
                    subHeadingField3,
                    subHeadingField4,
                  ].map((field, idx) => {
                    if (!field || !item?.[field]) return null;
                    let content: any = String(item[field]);
                    if (field === "FileURL")
                      content = (
                        <a
                          href={`${IMAGE_URL}/uploads/${item[field]}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          {item[field]}
                        </a>
                      );
                    else if (field === "CreatedAt")
                      content = convertToDateTime(item[field]);

                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-gray-600"
                      >
                        {getFieldIcon(field)}
                        <span className="line-clamp-2">{content}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenDropdown(
                      openDropdown === index.toString() ? null : index.toString()
                    );
                  }}
                  className="p-1 text-gray-500 hover:bg-gray-100 rounded-full"
                >
                  <EllipsisVertical size={20} />
                </button>

                {openDropdown === index.toString() && (
                  <div className="absolute right-0 mt-2 w-52 z-20 bg-white border border-gray-200 rounded-2xl shadow-lg">
                    {[
                      { icon: Glasses, text: "View", action: "view" },
                      { icon: Edit2, text: "Edit", action: "edit" },
                      {
                        icon: Trash2,
                        text: "Delete",
                        action: "delete",
                        danger: true,
                      },
                    ].map(({ icon: Icon, text, action, danger }) => (
                      <button
                        key={action}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction(action, item);
                        }}
                        className={`flex items-center gap-2 w-full px-4 py-3 text-sm hover:bg-gray-100 ${danger ? "text-red-600" : "text-gray-800"
                          }`}
                      >
                        <Icon size={16} /> {text}
                      </button>
                    ))}

                    {/* Dynamic Toggles */}
                    {activeInActiveToggle &&
                      (item?.Status == 1 ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusUpdate("0", item);
                          }}
                          className="flex items-center gap-2 w-full px-4 py-3 text-yellow-600 hover:bg-gray-100 text-sm"
                        >
                          <PauseCircle size={16} /> Set Inactive
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusUpdate("1", item);
                          }}
                          className="flex items-center gap-2 w-full px-4 py-3 text-green-600 hover:bg-gray-100 text-sm"
                        >
                          <CheckCircle size={16} /> Set Active
                        </button>
                      ))}

                    {activeBlockToggle &&
                      (item?.Status == 1 ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusUpdate("0", item);
                          }}
                          className="flex items-center gap-2 w-full px-4 py-3 text-red-600 hover:bg-gray-100 text-sm"
                        >
                          <Ban size={16} /> Block
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusUpdate("1", item);
                          }}
                          className="flex items-center gap-2 w-full px-4 py-3 text-green-600 hover:bg-gray-100 text-sm"
                        >
                          <Unlock size={16} /> Unblock
                        </button>
                      ))}

                    {activeSoldToggle &&
                      (item?.Status == 2 ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusUpdate("1", item);
                          }}
                          className="flex items-center gap-2 w-full px-4 py-3  hover:bg-gray-100 text-sm"
                        >
                          <ShoppingCart size={16} /> Mark Unsold
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusUpdate("2", item);
                          }}
                          className="flex items-center gap-2 w-full px-4 py-3 text-purple-600 hover:bg-gray-100 text-sm"
                        >
                          <ShoppingBag size={16} /> Mark Sold
                        </button>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {renderComp && <div>{renderComp(item)}</div>}
          </div>
        );
      })}

      <div ref={observerRef} className="h-8" />
      {error && <p className="text-red-500 mt-3 text-sm">{error.message}</p>}
      {isFetching && (
        <div className="space-y-3">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="flex bg-white gap-3 p-4 animate-pulse rounded-lg">
              <div className="w-[100px] h-[100px] rounded-xl bg-gray-200" />
              <div className="flex-1 space-y-2">
                {[...Array(4)].map((__, j) => (
                  <div key={j} className="h-4 bg-gray-200 rounded-full w-4/5" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

