"use client";
import React, { useEffect, useState } from "react";
import { IonSpinner, IonToast } from "@ionic/react";
import { IMAGE_URL, BASE_URL } from "../../config";
import { UniversalGetStoredJWT, UniversalGetStoredProfile } from "./Stored_InformationComp";


const ChatMemberListComp: React.FC = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{ show: boolean; message: string }>({
    show: false,
    message: "",
  });
  const storedProfile = UniversalGetStoredProfile();

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const storedMember = localStorage.getItem("StoredChatGroupMembers");
      if (storedMember) {
        const parsedMembers = JSON.parse(storedMember);
        if (Array.isArray(parsedMembers)) {
          setMembers(parsedMembers);
          console.log("Loaded members from localStorage:", parsedMembers);
        } else {
          setError("Invalid member data format.");
        }
      } else {
        setError("No stored members found.");
      }
    } catch (err) {
      console.error("Failed to parse stored members:", err);
      setError("Failed to load member list.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: number, currentStatus: string) => {
    const token = UniversalGetStoredJWT();
    const newStatus = currentStatus === "1" ? "0" : "1";

    // Update UI immediately
    setMembers((prev) =>
      prev.map((m) =>
        m.Id === id || m.id === id ? { ...m, Status: newStatus } : m
      )
    );

    // Show toast
    setToast({
      show: true,
      message: newStatus === "1" ? "Member Activated" : "Member Banned",
    });

    const formData = new FormData();
    formData.append("id", id.toString());
    formData.append("status", newStatus);

    try {
      const res = await fetch(BASE_URL + "/chatGroupMember/api", {
        method: "PATCH",
        body: formData,
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      console.log("Status updated:", data);

      // Update localStorage
      const updatedMembers = members.map((m) =>
        m.Id === id || m.id === id ? { ...m, Status: newStatus } : m
      );
      localStorage.setItem(
        "StoredChatGroupMembers",
        JSON.stringify(updatedMembers)
      );
    } catch (err) {
      console.error("Error updating status:", err);
      // Revert UI if PATCH fails
      setMembers((prev) =>
        prev.map((m) =>
          m.Id === id || m.id === id ? { ...m, Status: currentStatus } : m
        )
      );
      setToast({ show: true, message: "Failed to update status" });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-6">
        <IonSpinner name="crescent" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 py-6">{error}</div>;
  }

  if (members.length === 0) {
    return <div className="text-center text-gray-500 py-6">No members found.</div>;
  }

  return (
    <>
      <div className="p-3 space-y-3">
        {members.map((m) => (
          m.ProfileEmail !== storedProfile.Email &&(
          <div
            key={m.Id || m.id || Math.random()}
            className="flex items-center justify-between bg-white rounded-lg shadow-sm p-3 border border-gray-100"
          >
            {/* Left - Profile Info */}
            <div className="flex items-center">
              <img
                src={
                  m.ProfileThumbnail
                    ? `${IMAGE_URL}/uploads/${m.ProfileThumbnail}`
                    : "/assets/default-avatar.png"
                }
                alt={m.ProfileName || "Member"}
                className="w-12 h-12 rounded-full object-cover mr-3"
              />
              <div className="flex flex-col">
                <span className="text-base font-semibold text-gray-800">
                  {m.ProfileName || "Unknown"}
                </span>
                {m.CreatedAt && (
                  <span className="text-xs text-gray-400 mt-1">
                    Joined: {m.CreatedAt}
                  </span>
                )}
              </div>
            </div>

            {/* Right - Toggle Switch */}
            <button
              onClick={() => handleStatusUpdate(m.Id || m.id, m.Status)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                m.Status === "1" ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  m.Status === "1" ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
              )
        ))}
      </div>

      {/* Toast */}
      <IonToast
        isOpen={toast.show}
        message={toast.message}
        duration={1500}
        onDidDismiss={() => setToast({ show: false, message: "" })}
        position="top"
        color={toast.message.includes("Failed") ? "danger" : "success"}
      />
    </>
  );
};

export default ChatMemberListComp;
