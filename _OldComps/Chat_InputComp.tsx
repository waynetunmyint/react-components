import { useState, useRef, useEffect } from "react";
import { Loader, X, Image, Send } from "lucide-react";
import { IMAGE_URL, BASE_URL, APP_NAME } from "../../config";
import { resizeImage } from "./ImageClient";
import { UniversalGetChatGroupMemberInfo, UniversalGetStoredJWT, UniversalGetStoredProfile } from "./Stored_InformationComp";

interface MessageInputProps {
  chatGroupId: string;
  onMessageSent: () => void;
  textareaRef?: React.RefObject<HTMLTextAreaElement>;
  onHandleReply?: () => void;
}

export default function ChatInputComp({
  chatGroupId,
  onMessageSent,
  textareaRef: externalTextareaRef,
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [chatMember, setChatMember] = useState<any>(null);

  const [messageToReply, setMessageToReply] = useState<string>("");

  const internalTextareaRef = useRef<HTMLTextAreaElement>(null);
  const textareaRef = externalTextareaRef || internalTextareaRef;
  const imageBlobRef = useRef("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const storedProfile = UniversalGetStoredProfile();
  const token = UniversalGetStoredJWT();
  const lastReplyMessageRef = useRef<string>("");

  // Check for reply messages continuously
  useEffect(() => {
    const checkReplyMessage = () => {
      const storedReply = localStorage.getItem("StoredReplyMessage");
      if (storedReply) {
        // Only update if it's a new/different reply message
        if (storedReply !== lastReplyMessageRef.current) {
          lastReplyMessageRef.current = storedReply;
          try {
            const item = JSON.parse(storedReply);
            if (item?.Message) {
              const trimmedMessage = item.Message.trim();
              const shortMessage = trimmedMessage.length > 50
                ? trimmedMessage.slice(0, 50) + "…"
                : trimmedMessage;
              setMessageToReply(`"@${item.ProfileName}:${shortMessage}"`);
            }
          } catch (err) {
            console.error("Error parsing reply message:", err);
          }
          localStorage.removeItem("StoredReplyMessage");
        }
      }

    };




    // Check immediately
    checkReplyMessage();

    // Set up interval to check for new reply messages
    const interval = setInterval(checkReplyMessage, 100);

    return () => clearInterval(interval);
  }, [textareaRef]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const newHeight = Math.min(textareaRef.current.scrollHeight, 120);
      textareaRef.current.style.height = newHeight + "px";
    }
  }, [message]);

  // Load member info once
  useEffect(() => {
    const getMemberInfo = async () => {
      try {
        const storedMember = await UniversalGetChatGroupMemberInfo(chatGroupId);
        setChatMember(storedMember);
      } catch (err) {
        console.error("Error loading member info:", err);
      }
    };
    getMemberInfo();
  }, [chatGroupId]);

  const fileToBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleImagePicked = async (file: File | null) => {
    if (!file) return;
    try {
      const base64 = await fileToBase64(file);
      const resized = await resizeImage(base64, 500);
      imageBlobRef.current = resized as string;
      setImagePreview(resized as string);
    } catch (err) {
      console.error("Resize error:", err);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleImagePicked(file);
  };

  const handleSend = async () => {
    if (saving || (!message.trim() && !imageBlobRef.current)) return;

    setSaving(true);
    const tempMessage = message;
    const tempImage = imageBlobRef.current;

    setMessage("");
    setImagePreview("");
    imageBlobRef.current = "";
    lastReplyMessageRef.current = ""; // Reset reply tracking

    try {
      const formData = new FormData();
      formData.append("chatGroupId", chatGroupId);
      formData.append("senderEmail", storedProfile?.Email ?? "");
      formData.append("appName", APP_NAME);
      formData.append("message", tempMessage.trim() || "");
      formData.append("messageToReply", messageToReply || "");
      if (tempImage) {
        formData.append("thumbnail", tempImage);
      }

      const response = await fetch(`${BASE_URL}/chatGroupChat/api`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to send message");

      if (textareaRef.current) textareaRef.current.style.height = "auto";
      onMessageSent();
      handleMessageToReplyClearance();
    } catch (err) {
      console.error("Send error:", err);
      setMessage(tempMessage);
      if (tempImage) {
        setImagePreview(tempImage);
        imageBlobRef.current = tempImage;
      }
    } finally {
      setSaving(false);
    }
  };

  const handleMessageToReplyClearance = () => {
    setMessageToReply("");
    lastReplyMessageRef.current = ""; // reset local ref
    localStorage.removeItem("StoredReplyMessage"); // clear stored reply
  }

  const handleRemoveImage = () => {
    setImagePreview("");
    imageBlobRef.current = "";
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const isDisabled = chatMember?.Status !== "1";
  const canSend = !saving && (message.trim() || imageBlobRef.current);

  return (
    <div className="bg-white border-t border-gray-200">
      {/* Compact Sending Banner */}
      {saving && (
        <div className="bg-blue-500 text-white flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium">
          <Loader className="w-3 h-3 animate-spin" />
          Sending...
        </div>
      )}

      {/* Compact Reply Banner */}
      {messageToReply && (
        <div className="mx-2 mt-2 flex items-center gap-2 bg-blue-50 border-l-2 border-blue-500 rounded px-2 py-1.5">
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-semibold ">Replying</div>
            <div className="text-xs text-gray-700 truncate">{messageToReply}</div>
          </div>
          <button
            onClick={handleMessageToReplyClearance}
            className="text-gray-400 hover:text-red-500 rounded-full p-0.5"
            aria-label="Cancel reply"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Compact Image Preview */}
      {imagePreview && (
        <div className="px-2 pt-2 pb-1">
          <div className="inline-flex items-center gap-2 bg-gray-50 rounded-lg p-1.5 border border-gray-200">
            <div className="relative">
              <img
                src={imagePreview}
                alt="preview"
                className="h-12 w-12 rounded object-cover"
              />
              <button
                onClick={handleRemoveImage}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-sm"
                aria-label="Remove image"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
            <span className="text-[10px] text-gray-500">Image attached</span>
          </div>
        </div>
      )}

      {/* Compact Input Area */}
      <div className="p-2">
        <div className="flex items-end gap-2">
          {/* Compact Avatar */}
          <img
            src={IMAGE_URL + "/uploads/" + chatMember?.ProfileThumbnail}
            alt="profile"
            onClick={() => (window.location.href = "/profile")}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/default-avatar.png";
            }}
            className="w-8 h-8 rounded-full object-cover ring-1 ring-gray-200 cursor-pointer flex-shrink-0"
          />

          {/* Compact Input Container */}
          <div className="flex-1 min-w-0">
            <div className={`flex items-end border rounded-2xl transition-all ${
              isDisabled 
                ? 'border-gray-200 bg-gray-50' 
                : 'border-gray-300 hover:border-blue-400 focus-within:border-blue-500'
            }`}>
              {/* Compact Textarea */}
              <textarea
                ref={textareaRef}
                placeholder={isDisabled ? "Cannot comment" : "Message..."}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                disabled={saving || isDisabled}
                className={`flex-1 whitespace-pre-wrap bg-transparent resize-none text-sm leading-snug px-3 py-2 focus:outline-none min-h-[36px] max-h-[80px] overflow-y-auto rounded-2xl ${
                  isDisabled 
                    ? 'text-gray-400 placeholder-gray-300 cursor-not-allowed' 
                    : 'text-gray-900 placeholder-gray-400'
                }`}
              />

              {/* Compact Action Buttons */}
              <div className="flex items-center px-1 pb-1">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={saving || isDisabled}
                  className={`p-1.5 rounded-full transition ${
                    isDisabled || saving
                      ? 'text-gray-300'
                      : 'text-gray-500 hover:text-blue-500 hover:bg-blue-50'
                  }`}
                  aria-label="Attach image"
                >
                  <Image className="w-4 h-4" />
                </button>

                <button
                  onClick={handleSend}
                  disabled={!canSend || isDisabled}
                  className={`p-1.5 rounded-full transition ${
                    canSend && !isDisabled
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-100 text-gray-300'
                  }`}
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}