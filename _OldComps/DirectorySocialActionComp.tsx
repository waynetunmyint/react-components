"use client";
import React, { useState, useEffect } from "react";
import { BASE_URL, WEBSITE_URL } from "../../config";
import { UniversalGetStoredProfile } from "./UniversalStoredInformationComp";
import { Send, Heart, Edit3 } from "lucide-react";

interface Props {
  item: any;
}

export const CompListingLikeAction: React.FC<Props> = ({ item }) => {
  const [liked, setLiked] = useState(false);
  const [profileEmail, setProfileEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const storedProfile = UniversalGetStoredProfile();

  useEffect(() => {
    const checkLikeStatus = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/listingLike/api/byListingId/${item.Id}/${storedProfile.Email}`
        );
        const result = await response.json();
        setLiked(result?.data?.length > 0);
      } catch (error) {
        console.error("Error checking listing:", error);
      } finally {
        setLoading(false);
      }
    };

    checkLikeStatus();
  }, [item?.Id]);

  const handleListingEdit = async (item: any) => {
    await localStorage.setItem("editItem", JSON.stringify(item));
    window.location.href = "/listing-update";
  };

  const handleToggleLike = async () => {
    if (!item?.Id || !profileEmail) return;

    try {
      const formData = new FormData();
      formData.append("listingId", item.Id);
      formData.append("profileEmail", profileEmail);

      await fetch(`${BASE_URL}/listingLike/api`, {
        method: "POST",
        body: formData,
      });

      setLiked(!liked);
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  if (loading) return null;

  return (
    <div className="flex items-center gap-3 mt-3">
      {/* Follow Button */}
      <button
        onClick={handleToggleLike}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm shadow-sm transition-all duration-200 ${
          liked
            ? "bg-red-500 text-white hover:bg-red-600"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        <Heart size={16} className={liked ? "text-white" : "text-gray-600"} />
        <span>{liked ? "Following" : "Follow"}</span>
      </button>

      {/* Edit Button - only for owner */}
      {storedProfile?.Email === item?.OwnerEmail && (
        <button
          onClick={() => handleListingEdit(item)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-700 text-white text-sm hover:bg-gray-800 shadow-sm transition-all duration-200"
        >
          <Edit3 size={16} />
          <span>Edit</span>
        </button>
      )}
    </div>
  );
};

export const CompSocialAction: React.FC<Props> = ({ item }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingLike, setIsCheckingLike] = useState(true);
  const [commentDescription, setCommentDescription] = useState("");
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Number(item?.LikeCount) || 0);
  const [commentCount, setCommentCount] = useState(Number(item?.CommentCount) || 0);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  useEffect(() => {
    setLikeCount(Number(item?.LikeCount) || 0);
    setCommentCount(Number(item?.CommentCount) || 0);
    checkIfLikedPost();
  }, [item]);

  const checkIfLikedPost = async () => {
    setIsCheckingLike(true);
    const storedProfile = UniversalGetStoredProfile();
    if (!storedProfile?.Email || !item?.Id) {
      setIsCheckingLike(false);
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/like/api/${item.Id}/${storedProfile.Email}`);
      const data = await response.json();
      setIsLiked(data.isLiked);
    } catch (error) {
      console.log("Error checking like status:", error);
    } finally {
      setIsCheckingLike(false);
    }
  };

  const handleLike = async () => {
    if (isLoading) return;
    setIsLoading(true);
    const storedProfile = UniversalGetStoredProfile();

    const formData = new FormData();
    formData.append("id", String(item.Id));
    formData.append("type", item.Type);
    formData.append("profileEmail", storedProfile.Email);

    try {
      const response = await fetch(`${BASE_URL}/like/api`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setIsLiked(!isLiked);
        setLikeCount((prev) => (isLiked ? Math.max(prev - 1, 0) : prev + 1));
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommentSave = async () => {
    if (!commentDescription.trim() || isLoading) return;
    setIsLoading(true);
    const storedProfile = UniversalGetStoredProfile();

    const formData = new FormData();
    formData.append("id", String(item.Id));
    formData.append("type", item.Type);
    formData.append("description", commentDescription);
    formData.append("profileEmail", storedProfile.Email);

    try {
      const response = await fetch(`${BASE_URL}/comment/api`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setCommentDescription("");
        setCommentCount((prev) => prev + 1);
        setShowCommentInput(false);
      }
    } catch (error) {
      console.error("Error saving comment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(`${WEBSITE_URL}/post-detail/${item.Id}`);
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 5000);
    } catch (error) {
      console.error("Failed to copy ID:", error);
    }
  };

  return (
    <div className="mt-4 space-y-3">
      <div className="flex justify-between items-center text-sm text-gray-700 font-medium">
        {/* Like Button / Skeleton */}
        {isCheckingLike ? (
          <div className="h-7 w-24 rounded-full bg-gray-200 animate-pulse" />
        ) : (
          <button
            onClick={handleLike}
            disabled={isLoading}
            className={`flex items-center gap-1 px-3 py-2 rounded-full transition-all duration-300 ${
              isLiked ? "text-red-600 font-semibold" : "text-gray-600 hover:"
            }`}
          >
            <span className="text-lg">{isLiked ? "❤️" : "🤍"}</span>
            <span>{likeCount} {likeCount === 1 ? "Like" : "Likes"}</span>
          </button>
        )}

        {/* Comment Button */}
        {isCheckingLike ? (
          <div className="h-7 w-24 rounded-full bg-gray-200 animate-pulse" />
        ) : (
          <button
            onClick={() => setShowCommentInput((prev) => !prev)}
            className="flex items-center gap-1 text-gray-600 hover: transition font-medium"
          >
            <span className="text-lg">💬</span>
            <span>{commentCount} {commentCount === 1 ? "Comment" : "Comments"}</span>
          </button>
        )}

        {/* Share Button */}
        {isCheckingLike ? (
          <div className="h-7 w-24 rounded-full bg-gray-200 animate-pulse" />
        ) : (
          <button
            onClick={handleShare}
            className="flex items-center gap-1 text-gray-600 hover: transition font-medium"
          >
            <span className="text-lg">🔗</span>
            <span>Share</span>
          </button>
        )}
      </div>

      {/* Clipboard Feedback */}
      {copiedToClipboard && (
        <p className="text-center text-blue-700 bg-blue-50 py-2 px-3 text-xs rounded-lg animate-fadeIn">
          ✅ Copied post link to clipboard!
        </p>
      )}

      {/* Comment Input */}
      {showCommentInput && (
        <div className="flex gap-2 items-start mt-3 border border-gray-300 rounded-xl p-3 bg-gray-50 shadow-sm">
          <textarea
            rows={3}
            placeholder="Write your comment..."
            value={commentDescription}
            onChange={(e) => setCommentDescription(e.target.value)}
            className="flex-1 resize-none px-3 py-2 text-sm bg-white text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          />
          <button
            onClick={handleCommentSave}
            disabled={isLoading}
            className="flex items-center justify-center p-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition"
          >
            <Send className=" hover:text-blue-800 transition" size={18} />
          </button>
        </div>
      )}
    </div>
  );
};
