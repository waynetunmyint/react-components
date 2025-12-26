import { useState, useRef, useEffect } from "react";
import { BASE_URL, IMAGE_URL } from "../../config";

interface Props {
  dataSource: string;
  imageField?: string;
  badgeImage?: string; // ✅ new badge image field
  headingField?: string;
  subHeadingField?: string;
  subHeadingField1?: string;
  subHeadingField2?: string;
  subHeadingField3?: string;
  subHeadingField4?: string;
  idField?: string;
  customURL?: string;
}

export default function UniversalTableWithActions({
  dataSource,
  imageField,
  badgeImage,
  headingField,
  subHeadingField,
  subHeadingField1,
  subHeadingField2,
  subHeadingField3,
  subHeadingField4,
  idField,
  customURL,
}: Props) {
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setData([]);
    setPage(1);
    setHasMore(true);
    setError(null);
    fetchData(1);
  }, [dataSource]);

  useEffect(() => {
    if (!observerRef.current || !hasMore || isFetching) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetching && hasMore) {
          fetchData(page + 1);
        }
      },
      { threshold: 1 }
    );

    observer.observe(observerRef.current);
    return () => {
      if (observerRef.current) observer.unobserve(observerRef.current);
      observer.disconnect();
    };
  }, [observerRef.current, isFetching, page, hasMore]);

  async function fetchData(pageNo: number) {
    try {
      setIsFetching(true);
      const res = await fetch(
        customURL
          ? `${BASE_URL}/${customURL}`
          : `${BASE_URL}/${dataSource}/api/byPage/${pageNo}`
      );
      if (!res.ok) throw new Error("Failed to fetch data");
      const newData = await res.json();
      if (!Array.isArray(newData)) throw new Error("Data is not iterable");

      setData((prev) => (pageNo === 1 ? newData : [...prev, ...newData]));
      setPage(pageNo);
      setError(null);
      if (newData.length === 0) setHasMore(false);
    } catch (err: any) {
      setError(err);
      setHasMore(false);
    } finally {
      setIsFetching(false);
    }
  }

  const handleDelete = async (item: any) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${
          item?.[headingField ?? "Name"] || "this item"
        }"?`
      )
    ) {
      setOpenDropdown(null);
      return;
    }
    try {
      const res = await fetch(`/${dataSource}/api/${item?.Id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      setData((prev) => prev.filter((i) => i.Id !== item.Id));
      setOpenDropdown(null);
    } catch (err) {
      console.error("Delete error:", err);
      alert("Delete failed");
    }
  };

  const handleEdit = (item: any) => {
    localStorage.setItem("StoredItem", JSON.stringify(item));
    window.location.href = `/${dataSource}/update`;
  };

  const toggleDropdown = (index: number) => {
    setOpenDropdown(openDropdown === index.toString() ? null : index.toString());
  };

  const renderTh = (field?: string, label?: string) => {
    if (!field) return null;
    return (
      <th
        key={field}
        className="px-4 py-2 text-left text-sm font-semibold text-gray-700"
      >
        {label}
      </th>
    );
  };

  const renderSkeletonRow = (key: number) => (
    <tr key={key} className="animate-pulse bg-gray-100">
      {[
        ...Array(
          1 +
            (badgeImage ? 1 : 0) + // ✅ badge column
            (imageField ? 1 : 0) +
            (headingField ? 1 : 0) +
            [
              subHeadingField,
              subHeadingField1,
              subHeadingField2,
              subHeadingField3,
              subHeadingField4,
            ].filter(Boolean).length +
            1
        ),
      ].map((_, i) => (
        <td key={i} className="px-4 py-2">
          <div className="h-4 bg-gray-300 rounded w-full"></div>
        </td>
      ))}
    </tr>
  );

  return (
    <div className="overflow-x-auto mt-6">
      <table className="min-w-full divide-y divide-gray-300 rounded-lg text-gray-700">
        <thead className="bg-gray-200">
          <tr>
            {renderTh(idField, idField)}
            {renderTh(badgeImage, "Badge")} {/* ✅ badge header */}
            {renderTh(imageField, "Image")}
            {renderTh(headingField, headingField)}
            {renderTh(subHeadingField, subHeadingField)}
            {renderTh(subHeadingField1, subHeadingField1)}
            {renderTh(subHeadingField2, subHeadingField2)}
            {renderTh(subHeadingField3, subHeadingField3)}
            {renderTh(subHeadingField4, subHeadingField4)}
            <th className="px-4 py-2 text-left text-sm font-semibold">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length > 0
            ? data.map((item, index) => {
                const badgeSrc = badgeImage
                  ? `${IMAGE_URL}/uploads/${item[badgeImage]}`
                  : null;
                const imageSrc = imageField
                  ? item?.[imageField]
                    ? `${IMAGE_URL}/uploads/${item[imageField]}`
                    : null
                  : null;

                return (
                  <tr key={index} className="hover:bg-gray-50 transition">
                    {idField && (
                      <td className="px-4 py-2 text-sm">{item?.[idField]}</td>
                    )}

                    {badgeImage && (
                      <td className="px-4 py-2">
                        {badgeSrc ? (
                          <img
                            className="h-8 w-8 rounded-full border border-gray-300 object-cover"
                            src={badgeSrc}
                            alt="Badge"
                            width={32}
                            height={32}
                            loading="lazy"
                          />
                        ) : (
                          "-"
                        )}
                      </td>
                    )}

                    {imageField && (
                      <td className="px-4 py-2">
                        {imageSrc ? (
                          <img
                            className="h-10 w-10 rounded object-cover border border-gray-300"
                            src={imageSrc}
                            alt="Image"
                            width={40}
                            height={40}
                            loading="lazy"
                          />
                        ) : (
                          "-"
                        )}
                      </td>
                    )}

                    {[
                      headingField,
                      subHeadingField,
                      subHeadingField1,
                      subHeadingField2,
                      subHeadingField3,
                      subHeadingField4,
                    ]
                      .filter(Boolean)
                      .map((field, idx) => {
                        if (!field) return <td key={idx} className="px-4 py-2 text-sm">-</td>;
                        const value = item?.[field as keyof typeof item];
                        const isFile =
                          typeof value === "string" &&
                          [
                            ".png",
                            ".jpg",
                            ".jpeg",
                            ".gif",
                            ".pdf",
                            ".zip",
                            ".mp4",
                          ].some((ext) => value.endsWith(ext));
                        return (
                          <td key={idx} className="px-4 py-2 text-sm">
                            {isFile ? (
                              <a
                                href={`${IMAGE_URL}/uploads/${value}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className=" hover:underline"
                              >
                                {value.split("/").pop()}
                              </a>
                            ) : (
                              value ?? "-"
                            )}
                          </td>
                        );
                      })}

                    <td className="px-4 py-2 text-sm">
                      <div className="relative inline-block text-left">
                        <button
                          onClick={() => toggleDropdown(index)}
                          className="inline-flex justify-center rounded-md border border-gray-400 px-3 py-1 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition"
                        >
                          Actions
                        </button>
                        {openDropdown === index.toString() && (
                          <div className="absolute right-0 z-10 mt-2 w-36 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                            <div className="py-1">
                              <button
                                onClick={() => handleEdit(item)}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(item)}
                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => toggleDropdown(index)}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            : isFetching
            ? [...Array(5)].map((_, i) => renderSkeletonRow(i))
            : null}
        </tbody>
      </table>

      <div ref={observerRef} className="h-10" />
      {error && <p className="text-red-500 mt-4">{error.message}</p>}
    </div>
  );
}
