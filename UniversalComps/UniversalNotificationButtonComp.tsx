import { useState } from "react";
import { BASE_URL } from "../../config";
import { Send } from "lucide-react";

interface Props {
  item: any;
  pathName:string;
}

export default function UniversalNotificationButton({ item,  pathName }: Props) {
  const [sending, setSending] = useState(false);

  const sendNotification = async () => {
    console.log("Send button is pressed");
    setSending(true);
    try {
      const form = new FormData();
      form.append("title", item?.Title || item.Name || "");
      form.append("description", item?.Description || "");
      form.append("appName", pathName);
      form.append("url", `/${pathName}/view/${item?.Id}`);

      const res = await fetch(`${BASE_URL}/notification/api`, {
        method: "POST",
        body: form,
      });

      const responseJson = await res.json();
      console.log("Response", responseJson);

      if (!res.ok) throw new Error("Notification failed");
      alert(`Notification sent to ${pathName} app users`);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Notification failed");
    } finally {
      setSending(false);
    }
  };

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        sendNotification();
      }}
      disabled={sending}
      className={`flex items-center gap-1 px-3 py-1 text-sm rounded-md font-medium border transition-colors duration-200 ${
        sending
          ? "bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed"
          : "bg-gray-700 text-white border-gray-700 hover:bg-blue-600"
      }`}
    >
      <Send size={14} /> {pathName} - 
      {sending ? "Sending..." : "Send Notification"}
    </button>
  );
}
