"use client";
import React, { useState, useEffect } from "react";
import { BASE_URL, IMAGE_URL } from "../../config";
import { MessageCircle, PlusCircle, Send, Trash2 } from "lucide-react";
import { UniversalGetStoredPage } from "./UniversalStoredInformationComp";

interface DirectoryCommentFormProps {
  dataSource: string;
  typeName: string | number;
  typeId: string | number;
  fields: string[];
  customAPI?: string;
}

export const DirectoryCommentForm: React.FC<DirectoryCommentFormProps> = ({
  dataSource,
  typeName,
  typeId,
  fields,
  customAPI,
}) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");
 
  const storedPage = UniversalGetStoredPage();
  console.log("Stored Page",storedPage);

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        const url = customAPI
          ? `${BASE_URL}/${customAPI}`
          : `${BASE_URL}/${dataSource}/api/byTypeNameAndTypeId/${typeName}/${typeId}`;
        const res = await fetch(url);
        const result = await res.json();
        setData(Array.isArray(result) ? result : []);
      } catch (err) {
        console.error("Error fetching comments:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [customAPI, dataSource, typeName, typeId]);

  const handleSave = async () => {
    if (!description.trim()) return alert("Description is required");

    try {
      const formData = new FormData();
      formData.append("pageId", storedPage.Id.toString());
      formData.append("description", description);
      formData.append("typeName", typeName.toString());
      formData.append("typeId", typeId.toString());

      const res = await fetch(`${BASE_URL}/${dataSource}/api`, {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (result.status === "success") {
        setDescription("");
        setData((prev) => [
          ...prev,
          {
            Id: Date.now(),
            Description: description,
            PageId: storedPage.Id,
            PageName: storedPage.Name,
            PageThumbnail: storedPage.Thumbnail,
          },
        ]);
      } else {
        alert(result.message || "Failed to save comment");
      }
    } catch (err) {
      console.error("Error creating comment:", err);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      const res = await fetch(`${BASE_URL}/${dataSource}/api/${id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (result) setData((prev) => prev.filter((c) => c.Id !== id));
      else alert(result.message || "Failed to delete comment");
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };

  return (
    <div className="bg-white flex flex-col p-4">
      {/* Comments List */}
      <div className="overflow-y-auto space-y-3">
        {loading ? (
          <p className="text-gray-400 text-center mt-6">
            Loading comments...
          </p>
        ) : data.length === 0 ? (
<p className="text-blue-700 text-center mt-6 flex items-center justify-center gap-2 cursor-pointer hover:text-blue-900 transition-colors">
  <MessageCircle size={22} className="animate-bounce" />
  No comments yet. Be the first!
</p>
        ) : (
          data.map((item) => (
            <div key={item.Id} className="flex items-start gap-2">
              {/* Avatar */}
              {item.PageThumbnail && (
                <img
                  src={`${IMAGE_URL}/uploads/${item.PageThumbnail}`}
                  alt={item.PageName}
                  onClick={() =>
                    (window.location.href = "/page/view/" + item?.PageId)
                  }
                  className="w-12 h-12 rounded-full object-cover border"
                />
              )}
              {/* Comment Bubble */}
              <div className="flex-1 p-3 rounded-2xl shadow-sm text-sm whitespace-pre-line bg-white text-gray-800">
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-xs">
                    {item.PageName}
                  </span>
                  {storedPage?.Id == item?.PageId.toString() && (
                    <button
                      onClick={() => handleDelete(item.Id)}
                      className="ml-2 text-red-400 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <p className="mt-1">{item.Description}</p>
                {fields.map(
                  (field) =>
                    field !== "Description" && (
                      <p
                        key={field}
                        className="text-gray-400 text-xs mt-1"
                      >
                        <span className="font-medium">{field}:</span>{" "}
                        {item[field]}
                      </p>
                    )
                )}
              </div>
            </div>
          ))
        )}

        {/* Comment Input */}
        {storedPage ? (
          <div className="flex items-start justify-start border-5 gap-2 bg-white p-2 rounded-lg shadow-md mb-4">
            <img
              src={`${IMAGE_URL}/uploads/${storedPage.Thumbnail}`}
              alt={storedPage?.Name}
              className="w-10 h-10 rounded-full object-cover border"
            />
            <div className="flex-1 relative">
              <textarea
                rows={5}
                placeholder="Write a comment..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full resize-none border border-gray-200 rounded-lg px-4 py-2 pr-12 outline-none text-gray-800 text-sm focus:ring-1 focus:ring-blue-400 bg-gray-100"
              />
              <button
                onClick={handleSave}
                className="absolute right-3 top-3 text-blue-500 hover:"
              >
                <Send size={35} />
              </button>
            </div>
          </div>
        ) : (
<button
  onClick={() => (window.location.href = "/page/create")}
  className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 
             w-full text-white font-medium rounded-xl px-5 py-3 mt-4 
             shadow-md transition duration-200"
>
  <PlusCircle className="w-5 h-5" />
  <span>Create a Page to Comment</span>
</button>
        )}
      </div>
    </div>
  );
};
