"use client";
import * as React from "react"; // ✅ make sure React is imported
import { useState } from "react";
import { BASE_URL } from "../../config";
import { X, Loader } from "lucide-react";

interface Props {
  memberInfo?: any;
  chatGroupData?: any;
}

const UniversalChatCheckMembershipComp: React.FC<Props> = ({
  memberInfo,
  chatGroupData,
}) => {
  const [showModal, setShowModal] = useState(memberInfo?.canUse === false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!chatGroupData) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("chatGroupId", chatGroupData.id);

      const res = await fetch(
        `${BASE_URL}/chatGroupMember/api/payMembershipFees`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (res.ok) {
        setShowModal(false); // hide modal if payment successful
      } else {
        console.error("Payment error:", data);
        alert(data.error || "Payment failed");
      }
    } catch (err) {
      console.error("Payment fetch error:", err);
      alert("Payment failed, please try again");
    } finally {
      setLoading(false);
    }
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm text-center relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
          onClick={() => setShowModal(false)}
        >
          <X size={20} />
        </button>

        <img
          src={memberInfo?.ProfileThumbnail || "/default-avatar.png"}
          alt="Profile"
          className="w-16 h-16 rounded-full mx-auto mb-4"
        />

        <p className="mb-4 text-gray-700">
          Your membership has expired. Subscribe to continue chatting.
        </p>

        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 w-full"
        >
          {loading && <Loader className="animate-spin" size={18} />}
          Price <span className="text-yellow-500">{chatGroupData?.Price}</span>  Token / Daily
        </button>
      </div>
    </div>
  );
};

export default UniversalChatCheckMembershipComp;
