"use client";
import React, { useEffect, useState } from "react";
import { BASE_URL, IMAGE_URL } from "../../config";
import { Edit2, Trash2, AlertCircle, MoreHorizontal } from "lucide-react";
import { UniversalGetStoredProfile } from "./UniversalStoredInformationComp";

interface Props {
  selectedItem?: {
    PageId?: string;
    PageName?: string;
    PageThumbnail?: string;
    CountryThumbnail?: string;
    Categories?: string;
    PostId?: string;
    ProductId?: string;
    Id?: string;
  };
}

export default function DirectoryPageInfoComp({ selectedItem }: Props) {
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [dialogType, setDialogType] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const storedProfile = UniversalGetStoredProfile();

  console.log("Selected Item", selectedItem);
  
  useEffect(() => {
    checkPermissions();
  }, [selectedItem]);

  const checkPermissions = async () => {
    if (!storedProfile || !selectedItem?.PageId) return;
    try {
      const formData = new FormData();
      formData.append("profileEmail", storedProfile.Email);
      formData.append("pageId", selectedItem.PageId.toString());

      const response = await fetch(`${BASE_URL}/admin/api/checkPermission`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const permData = await response.json();

      setIsAdmin(!!permData.isAdmin);
      setIsOwner(!!permData.isOwner);
      setIsSuperAdmin(!!permData.isSuperAdmin);
    } catch (err) {
      console.error("Error checking permissions:", err);
    }
  };

  const handleAction = async (type: string) => {
    if (!selectedItem) return;

    let contentType: string | null = null;
    let itemId: string | number | null = null;

    if (selectedItem.PostId) {
      contentType = "post";
      itemId = selectedItem.PostId;
    } else if (selectedItem.ProductId) {
      contentType = "product";
      itemId = selectedItem.ProductId;
    }

    localStorage.setItem("StoredItem", JSON.stringify(selectedItem));

    const formData = new FormData();
    formData.append("pageId", selectedItem?.PageId ?? "");
    formData.append("profileEmail", storedProfile?.Email ?? "");
    let blockResponse; let blockResponseJson;


    switch (type) {
      case "report":
        window.location.href = "/report";
        break;

      case "update":
        if (contentType) window.location.href = `/${contentType}/update`;
        break;

      case "delete":
        if (contentType && itemId) {
          try {
            const res = await fetch(`${BASE_URL}/${contentType}/api/${itemId}`, {
              method: "DELETE",
            });
            if (res.ok) {
              console.log("Delete successful");
              window.location.reload();
            }
          } catch (err) {
            console.error("Delete error:", err);
          }
        }
        break;

      case "block":
        blockResponse = await fetch(BASE_URL + "/pageBlock/api", {
          method: "POST",
          body: formData,
        });
        blockResponseJson = await blockResponse.json();
        console.log("block response",blockResponseJson );
        console.log("Block action triggered");
        alert("Page had been blocked");
        setMenuOpen(false);
        break;

      default:
        console.warn("Unknown action:", type);
    }

    setDialogType(null);
  };

  const handlePageView = () => {
    if (selectedItem?.PageId) {
      window.location.href = `/page/view/${selectedItem.PageId}`;
    }
  };

  if (loading) {
    return (
      <div className="flex p-2 items-start bg-white animate-pulse">
        <div className="relative">
          <div className="w-[60px] h-[60px] rounded-lg bg-gray-300"></div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gray-300 border-2 border-white shadow-md"></div>
        </div>
        <div className="ml-2 flex-1 space-y-2 py-1">
          <div className="h-5 bg-gray-300 rounded w-3/4"></div>
          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!selectedItem) return null;

  return (
    <div className="flex p-2 items-start bg-white">
      {/* Poster Thumbnail with Country Badge */}
      <div className="relative">
        <img
          src={`${IMAGE_URL}/uploads/${selectedItem.PageThumbnail}`}
          className="w-[60px] h-[60px] rounded-lg border cursor-pointer"
          alt="Poster"
          onClick={handlePageView}
        />
        <img
          src={`${IMAGE_URL}/uploads/${selectedItem.CountryThumbnail}`}
          className="absolute -top-1 -right-1 w-6 h-6 rounded-full border-2 border-white shadow-md cursor-pointer"
          alt="Country"
          onClick={handlePageView}
        />
      </div>

      {/* Poster Info */}
      <div className="ml-2 flex-1">
        <h1
          onClick={handlePageView}
          className="text-2xl font-bold text-gray-800 line-clamp-1 cursor-pointer"
        >
          {selectedItem?.PageName}
        </h1>
        <p
          onClick={handlePageView}
          className="text-gray-600 mt-1 text-xs line-clamp-1 cursor-pointer"
        >
          {selectedItem?.Categories}
        </p>
      </div>

      {/* Admin Action Menu */}
      {storedProfile && (
        <div className="ml-auto relative">
          <button
            className="p-2 text-gray-600 hover:text-gray-800"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <MoreHorizontal size={20} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-md z-10">
              {isSuperAdmin ? (
                <>
                  <button
                    className="w-full px-4 py-2 text-left text-gray-800 hover:bg-gray-100 flex items-center gap-2"
                    onClick={() => handleAction("update")}
                  >
                    <Edit2 size={16} /> Super Edit
                  </button>
                  <button
                    className="w-full px-4 py-2 text-left text-gray-800 hover:bg-gray-100 flex items-center gap-2"
                    onClick={() => setDialogType("delete")}
                  >
                    <Trash2 size={16} /> Super Delete
                  </button>
                </>
              ) : isOwner || isAdmin ? (
                <>
                  <button
                    className="w-full px-4 py-2 text-left text-gray-800 hover:bg-gray-100 flex items-center gap-2"
                    onClick={() => handleAction("update")}
                  >
                    <Edit2 size={16} /> Edit
                  </button>
                  <button
                    className="w-full px-4 py-2 text-left text-gray-800 hover:bg-gray-100 flex items-center gap-2"
                    onClick={() => setDialogType("delete")}
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="w-full px-4 py-2 text-left text-gray-800 hover:bg-gray-100 flex items-center gap-2"
                    onClick={() => handleAction("report")}
                  >
                    <AlertCircle size={16} /> Report
                  </button>
                  <button
                    className="w-full px-4 py-2 text-left text-gray-800 hover:bg-gray-100 flex items-center gap-2"
                    onClick={() => handleAction("block")}
                  >
                    ⛔ Block
                  </button>
                </>
              )}

              <button
                className="w-full px-4 py-2 text-left text-red-500 hover:bg-gray-100 flex items-center gap-2"
                onClick={() => setMenuOpen(false)}
              >
                ✖ Cancel
              </button>
            </div>
          )}
        </div>
      )}


      {/* Confirm Dialog */}
      {dialogType && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <p className="text-lg font-semibold text-gray-800">
              Confirm {dialogType} this item?
            </p>
            <div className="mt-4 flex justify-end space-x-4">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                onClick={() => setDialogType(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => handleAction(dialogType)}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {alertMessage && (
        <div className="mt-4 bg-red-100 text-red-800 p-2 rounded">
          {alertMessage}
        </div>
      )}
    </div>
  );
}
