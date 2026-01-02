import React, { memo } from "react";
import { Message } from "../types";
import LoadingImage from "./LoadingImage";

interface MessageVerticalListProps {
    msg: Message;
    resolveImg: (src?: any) => string | undefined;
    getOptimalLink: (item: any) => string | undefined;
}

const MessageVerticalList = memo(function MessageVerticalList({
    msg,
    resolveImg,
    getOptimalLink
}: MessageVerticalListProps) {
    if (!msg.items || msg.displayType !== 'list') return null;

    return (
        <div className="flex flex-col gap-3 w-full max-w-[95%] py-2">
            {msg.items?.map((item, idx) => {
                let itemLink = getOptimalLink(item) || (item as any).Link || (item as any).url || (item as any).Url || (item as any).href;

                // Support patterns: /type/view/id OR /dataSource/view/id
                const type = (item as any).type || (item as any).Type;
                const dataSource = (item as any).dataSource || (item as any).DataSource;
                const view = (item as any).view || (item as any).View || "view";
                const id = (item as any).id || (item as any).ID || (item as any).Id;

                let patternUsed = 'default';
                if (type && id) {
                    itemLink = `/${type.toLowerCase()}/${view}/${id}`;
                    patternUsed = 'type/view/id';
                } else if (dataSource && id) {
                    itemLink = `/${dataSource}/${view}/${id}`;
                    patternUsed = 'dataSource/view/id';
                }

                console.log(`[VerticalList] Item ${idx}:`, {
                    link: itemLink,
                    pattern: patternUsed,
                    item
                });

                const imgUrl = resolveImg((item as any).Thumbnail || item.image || item.thumbnail || (item as any).Image || (item as any).ImgOne);
                const titleVal = item.title || (item as any).Title;
                const authorVal = item.author || (item as any).Author;

                return (
                    <a key={idx}
                        href={itemLink}
                        target={itemLink?.startsWith('/') ? '_self' : '_blank'}
                        rel={itemLink?.startsWith('/') ? undefined : 'noopener noreferrer'}
                        className="flex gap-4 bg-[var(--bg1)] rounded-2xl p-3 border border-black hover:border-[var(--a2)] transition-all cursor-pointer group/listItem shadow-sm hover:shadow-lg transform hover:-translate-y-0.5 relative z-10 pointer-events-auto block"
                        onClick={(e) => {
                            e.stopPropagation();
                            console.log('[VerticalList] Clicked item link:', itemLink);
                        }}
                    >
                        <div className="w-16 h-16 flex-none rounded-xl overflow-hidden bg-zinc-100 border border-black">
                            <LoadingImage
                                src={imgUrl}
                                alt={titleVal}
                                className="w-full h-full object-cover group-hover/listItem:scale-110 transition-transform duration-700"
                            />
                        </div>
                        <div className="flex flex-col flex-1 min-w-0 justify-center">
                            <h5 className="text-[13px] font-black text-black line-clamp-2 leading-tight group-hover/listItem:text-[var(--a2)] transition-colors uppercase tracking-tight">
                                {titleVal}
                            </h5>
                            {authorVal && (
                                <p className="text-[10px] text-black line-clamp-1 font-bold uppercase tracking-wider mt-1">
                                    {authorVal}
                                </p>
                            )}
                            {itemLink && (
                                <p className="text-[8px] text-[var(--a2)] font-black uppercase tracking-widest mt-1 opacity-60">
                                    {itemLink}
                                </p>
                            )}
                        </div>
                    </a>
                );
            })}
        </div>
    );
});

export default MessageVerticalList;
