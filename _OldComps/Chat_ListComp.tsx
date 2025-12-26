"use client";
import React, { useState, useCallback, useMemo, memo } from "react";
import { X, Trash2, Reply, MoreVertical } from "lucide-react";
import { APP_TEXT_COLOR, BASE_URL, IMAGE_URL } from "../../config";
import { UniversalGetStoredJWT } from "./Stored_InformationComp";

interface Message {
  MessageToReply: any;
  ChatGroupMemberStatus: string;
  Id: string | number;
  ProfileEmail: string;
  ProfileName: string;
  ProfileId: string | number;
  ProfileThumbnail: string;
  Message: string;
  Thumbnail?: string;
  CreatedAt: string;
}

interface ChatGroupData {
  OwnerEmail: string;
  [key: string]: any;
}

interface StoredProfile {
  Email: string;
  [key: string]: any;
}

interface Props {
  chatGroupId: string;
  chatGroupData: ChatGroupData;
  messageData: Message[];
  storedProfile: StoredProfile;
  formatTime: (date: string) => string;
  onMessageDeleted?: (deletedId: string | number) => void;
}

// Memoized message bubble component
const MessageBubble = memo(({ 
  item, 
  isMine, 
  canDelete, 
  isDeleting,
  isLast,
  formatTime,
  onImageClick,
  onMoreClick,
  onReply,
  onDelete,
  showPopover,
  popoverMessageId
}: {
  item: Message;
  isMine: boolean;
  canDelete: boolean;
  isDeleting: boolean;
  isLast: boolean;
  formatTime: (date: string) => string;
  onImageClick: (url: string) => void;
  onMoreClick: (id: string | number) => void;
  onReply: (item: Message) => void;
  onDelete: (item: Message) => void;
  showPopover: boolean;
  popoverMessageId: string | number | null;
}) => {
  return (
    <div
      className={`group relative transition-all duration-200 ${
        isDeleting ? "opacity-40 scale-95" : "opacity-100"
      }`}
    >
      <div className="flex items-end gap-1">
        {/* Message bubble */}
        <div
          className={`relative px-3 py-1.5 rounded-2xl shadow-sm transition-all ${
            isMine 
              ? "bg-blue-600 text-white rounded-br-sm" 
              : "bg-white border border-gray-200 text-gray-900 rounded-bl-sm"
          }`}
        >
          {item?.MessageToReply && (
            <div className={`border-l-2 pl-2 mb-1.5 ${isMine ? 'border-blue-300' : 'border-gray-300'}`}>
              <p className={`text-xs italic break-words whitespace-pre-wrap line-clamp-2 ${isMine ? 'text-blue-100' : 'text-gray-600'}`}>
                {item?.MessageToReply}
              </p>
            </div>
          )}
          {item?.Message && (
            <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
              {item.Message}
            </p>
          )}
          {item?.Thumbnail && (
            <img
              src={`${IMAGE_URL}/uploads/${item?.Thumbnail}`}
              alt="attachment"
              className="max-w-[200px] mt-1.5 rounded-xl cursor-pointer object-cover hover:opacity-90 transition-opacity"
              onClick={() => onImageClick(`${IMAGE_URL}/uploads/${item?.Thumbnail}`)}
              loading="lazy"
            />
          )}
          
          {/* Timestamp inside bubble for last message */}
          {isLast && (
            <p className={`text-[10px] mt-1 ${isMine ? 'text-blue-200' : 'text-gray-500'}`}>
              {formatTime(item?.CreatedAt)}
            </p>
          )}
        </div>

        {/* More options icon - appears on hover */}
        <button
          onClick={() => onMoreClick(item?.Id)}
          className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-gray-100 ${isDeleting ? 'pointer-events-none' : ''}`}
          aria-label="More options"
          disabled={isDeleting}
        >
          <MoreVertical className="w-3.5 h-3.5 text-gray-400" />
        </button>

        {/* Popover menu */}
        {showPopover && popoverMessageId === item?.Id && (
          <div
            className={`absolute z-30 bg-white border border-gray-200 shadow-lg rounded-xl overflow-hidden min-w-[130px] ${
              isMine ? "right-0 bottom-full mb-1" : "left-0 bottom-full mb-1"
            }`}
          >
            <div className="flex flex-col">
              <button
                onClick={() => onReply(item)}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-gray-700 text-sm transition-colors"
              >
                <Reply className="w-3.5 h-3.5" />
                Reply
              </button>

              {canDelete && (
                <button
                  onClick={() => onDelete(item)}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-red-50 text-red-600 text-sm transition-colors"
                  disabled={isDeleting}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

MessageBubble.displayName = "MessageBubble";

export default function ChatListComp({
  chatGroupData,
  messageData: messages,
  storedProfile,
  formatTime,
  onMessageDeleted,
}: Props) {
  const [popoverMessageId, setPopoverMessageId] = useState<string | number | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const token = UniversalGetStoredJWT();

  const isOwner = useMemo(
    () => chatGroupData?.OwnerEmail === storedProfile?.Email,
    [chatGroupData?.OwnerEmail, storedProfile?.Email]
  );

  const handleDelete = useCallback(
    async (item: Message) => {
      if (!window.confirm("Are you sure you want to delete this message?")) return;
      
      setDeletingId(item.Id);
      setPopoverMessageId(null);
     
      try {
        const formData = new FormData();
        formData.append("id", item.Id.toString());

        const res = await fetch(`${BASE_URL}/chatGroupChat/api`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (res.ok) {
          onMessageDeleted?.(item.Id);
        } else {
          const errorText = await res.text();
          console.error("Delete failed:", errorText);
          alert("Failed to delete message. Please try again.");
        }
      } catch (err) {
        console.error("Error deleting message:", err);
        alert("An error occurred while deleting the message.");
      } finally {
        setDeletingId(null);
      }
    },
    [token, onMessageDeleted]
  );

  const canDeleteMessage = useCallback(
    (message: Message) => message?.ProfileEmail === storedProfile?.Email || isOwner,
    [storedProfile?.Email, isOwner]
  );

  const handleReply = useCallback((item: Message) => {
    localStorage.setItem('StoredReplyMessage', JSON.stringify(item));
    setPopoverMessageId(null);
  }, []);

  const handleMoreClick = useCallback((id: string | number) => {
    setPopoverMessageId(prev => prev === id ? null : id);
  }, []);

  const handleImageClick = useCallback((url: string) => {
    setSelectedImage(url);
  }, []);

  const messageGroups = useMemo(() => {
    const groups: Message[][] = [];
    let currentGroup: Message[] = [];

    messages.forEach((msg, i) => {
      if (i === 0 || messages[i - 1].ProfileEmail !== msg.ProfileEmail) {
        if (currentGroup.length > 0) groups.push(currentGroup);
        currentGroup = [msg];
      } else {
        currentGroup.push(msg);
      }
    });

    if (currentGroup.length > 0) groups.push(currentGroup);
    return groups;
  }, [messages]);

  return (
    <>
      <div className="space-y-3 py-2">
        {messageGroups.map((group, groupIndex) => {
          const otherMessage = group[0];
          const isMine = otherMessage?.ProfileEmail === storedProfile?.Email;

          return (
            <div
              key={`group-${groupIndex}-${otherMessage?.Id}`}
              className={`flex gap-2 px-3 ${isMine ? "flex-row-reverse" : ""}`}
            >
              {/* Avatar - only for other users */}
              {!isMine && (
                <img
                  src={`${IMAGE_URL}/uploads/${otherMessage?.ProfileThumbnail}`}
                  alt={otherMessage?.ProfileName}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0 ring-2 ring-white shadow-sm"
                  loading="lazy"
                />
              )}

              {/* Message container */}
              <div className={`flex flex-col gap-1 max-w-[75%] min-w-0 ${isMine ? "items-end" : "items-start"}`}>
                {!isMine && (
                  <div className="flex items-center gap-1.5 px-1">
                    <span className={`text-xs font-semibold `}>
                      {otherMessage?.ProfileName}
                    </span>
                    <span className="text-[10px] text-gray-400">#{otherMessage?.ProfileId}</span>
                  </div>
                )}

                {group.map((item, idx) => (
                  item?.ChatGroupMemberStatus != "0" ? (
                    <MessageBubble
                      key={item?.Id}
                      item={item}
                      isMine={isMine}
                      canDelete={canDeleteMessage(item)}
                      isDeleting={deletingId === item?.Id}
                      isLast={idx === group.length - 1}
                      formatTime={formatTime}
                      onImageClick={handleImageClick}
                      onMoreClick={handleMoreClick}
                      onReply={handleReply}
                      onDelete={handleDelete}
                      showPopover={true}
                      popoverMessageId={popoverMessageId}
                    />
                  ) : (
                    <div className="bg-gray-900 bg-opacity-50 backdrop-blur-sm border border-gray-700 px-3 py-1.5 rounded-lg">
                      <p className="text-xs text-gray-300">This member's chat is hidden</p>
                    </div>
                  )
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-md"
            onClick={() => setSelectedImage(null)}
            aria-label="Close"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <img
            src={selectedImage}
            alt="Full size"
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}