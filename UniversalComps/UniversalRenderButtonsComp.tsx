import { useState, useEffect } from "react";
import { BASE_URL } from "../../config";

interface Props {
  item: any;
  dataSource: string; // e.g., "Applications"
  dataType: string;
}

export default function UniversalRenderButtons({ item, dataSource, dataType }: Props) {
  const [data, setData] = useState<any[]>([]);
  const [sending, setSending] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stored = localStorage.getItem("StoredRenderItems");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setData(parsed);
          } else {
            console.warn("StoredRenderItems is not an array. Resetting.");
            localStorage.removeItem("StoredRenderItems");
          }
          return;
        }

        const response = await fetch(`${BASE_URL}/${dataSource}/api`);
        if (!response.ok) throw new Error("Failed to fetch apps");

        const dataResponse = await response.json();
        const validArray = Array.isArray(dataResponse)
          ? dataResponse
          : dataResponse?.data || []; // handle backend object structure

        setData(validArray);
        localStorage.setItem("StoredRenderItems", JSON.stringify(validArray));
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchData();
  }, [dataSource]);

  const sendNotification = async (appName: string) => {
    setSending(appName);
    try {
      const form = new FormData();
      form.append("title", item?.Title || item?.Name || "");
      form.append("description", item?.Description || "");
      form.append("appName", appName);
      form.append("url", `/${dataType}/view/${item?.Id}`);

      const res = await fetch(`${BASE_URL}/notification/api`, {
        method: "POST",
        body: form,
      });

      const responseJson = await res.json();
      console.log("Notification response:", responseJson);

      if (!res.ok) throw new Error(responseJson?.message || "Notification failed");

      alert(`Notification sent to ${appName} users`);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Notification failed");
    } finally {
      setSending(null);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {Array.isArray(data) && data.length > 0 ? (
        data.map((x) => (
          <button
            key={x?.Name || x?.AppName}
            onClick={(e) => {
              e.stopPropagation();
              sendNotification(x?.AppName?.toString() || "");
            }}
            disabled={sending === x?.AppName}
            className={`flex items-center p-1 text-xs rounded-md font-medium border transition-colors duration-200 ${
              sending === x?.AppName
                ? "bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed"
                : "bg-gray-700 text-white border-gray-700 hover:bg-blue-600"
            }`}
          >
            {x?.Name || x?.AppName}
          </button>
        ))
      ) : (
        <p className="text-xs text-gray-500">No apps available.</p>
      )}
    </div>
  );
}
