import React, { memo } from "react";
import { Message } from "../types";
import LoadingImage from "./LoadingImage";

interface MessageSingleImageProps {
    msg: Message;
    hasItems: boolean;
    resolveImg: (src?: any) => string | undefined;
}

const MessageSingleImage = memo(function MessageSingleImage({
    msg,
    hasItems,
    resolveImg
}: MessageSingleImageProps) {
    if (!msg.image || hasItems) return null;

    return (
        <div className="w-[240px] aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-[var(--bg1)] transform hover:scale-[1.02] transition-transform duration-500">
            <LoadingImage
                src={resolveImg(msg.image)}
                alt={msg.title || "Message image"}
                className="w-full h-full object-cover"
            />
        </div>
    );
});

export default MessageSingleImage;
