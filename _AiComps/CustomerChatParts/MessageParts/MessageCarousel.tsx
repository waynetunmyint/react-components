import React, { memo } from "react";
import { Message } from "../types";
import LoadingImage from "./LoadingImage";
import { formatPrice } from "../../../HelperComps/TextCaseComp";

interface MessageCarouselProps {
    msg: Message;
    index: number;
    resolveImg: (src?: any) => string | undefined;
    getOptimalLink: (item: any) => string | undefined;
}

const CarouselCard = memo(({ item, resolveImg, titleVal, authorVal, descVal, priceVal, itemLink }: any) => (
    <>
        <div className="w-full aspect-[4/3] overflow-hidden bg-zinc-50 relative">
            <LoadingImage
                src={resolveImg((item as any).Thumbnail || item.image || item.thumbnail || (item as any).Image || (item as any).ImgOne || (item as any).imgOne)}
                alt={titleVal}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
            />
            {priceVal && (
                <div className="absolute bottom-3 right-3 bg-black text-[var(--a2)] text-[10px] font-black px-2.5 py-1 rounded-full shadow-xl">
                    {formatPrice(priceVal)} K
                </div>
            )}
        </div>

        <div className="p-4 flex flex-col flex-1">
            <h5 className="text-[13px] font-black text-black line-clamp-2 leading-tight mb-1.5 uppercase tracking-tight">
                {titleVal}
            </h5>
            {authorVal && (
                <p className="text-[10px] text-zinc-400 mb-2 font-bold uppercase tracking-wider">
                    {authorVal}
                </p>
            )}

            {descVal && (
                <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed mb-4 flex-1">
                    {descVal}
                </p>
            )}

            {itemLink && (
                <p className="text-[8px] text-[var(--a2)] font-black uppercase tracking-widest mb-4 opacity-60">
                    {itemLink}
                </p>
            )}

            <div
                className="text-[var(--t3)] mt-auto py-2.5 rounded-2xl text-[10px] font-black text-center border-2 border-black group-hover:border-black group-hover:bg-black group-hover:text-[var(--a2)] transition-all duration-300 uppercase tracking-[0.1em]"
            >
                View Details
            </div>
        </div>
    </>
));

const MessageCarousel = memo(function MessageCarousel({
    msg,
    index: i,
    resolveImg,
    getOptimalLink
}: MessageCarouselProps) {
    if (!msg.items || (msg.displayType && msg.displayType !== 'carousel')) return null;

    return (
        <div className="relative w-full max-w-full group/carousel py-2">
            <div
                id={`carousel-${i}`}
                className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 snap-x scroll-smooth px-1"
            >
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

                    console.log(`[Carousel] Item ${idx} Data:`, {
                        link: itemLink,
                        pattern: patternUsed,
                        data: { type, dataSource, view, id },
                        item
                    });

                    const priceVal = item.price || (item as any).Price;
                    const titleVal = item.title || (item as any).Title;
                    const descVal = item.description || (item as any).Description;
                    const authorVal = item.author || (item as any).Author;

                    const cardContent = (
                        <CarouselCard
                            item={item}
                            resolveImg={resolveImg}
                            titleVal={titleVal}
                            authorVal={authorVal}
                            descVal={descVal}
                            priceVal={priceVal}
                            itemLink={itemLink}
                        />
                    );

                    const cardClasses = "snap-start flex-none w-[200px] sm:w-[220px] relative z-10 pointer-events-auto flex flex-col bg-[var(--bg1)] rounded-3xl overflow-hidden border border-black hover:border-[var(--a2)] transition-all duration-500 cursor-pointer shadow-[0_8px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)] transform hover:-translate-y-1 block";

                    if (itemLink) {
                        return (
                            <a
                                key={idx}
                                href={itemLink}
                                target={itemLink.startsWith('/') ? '_self' : '_blank'}
                                rel={itemLink.startsWith('/') ? undefined : 'noopener noreferrer'}
                                className={cardClasses}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    console.log('Carousel link clicked:', itemLink);
                                }}
                            >
                                {cardContent}
                            </a>
                        );
                    }

                    return (
                        <div key={idx} className={cardClasses}>
                            {cardContent}
                        </div>
                    );
                })}
            </div>

            <button
                onClick={() => document.getElementById(`carousel-${i}`)?.scrollBy({ left: -240, behavior: 'smooth' })}
                className="absolute -left-3 top-[40%] -translate-y-1/2 w-10 h-10 bg-[var(--bg1)] shadow-xl border border-black rounded-full flex items-center justify-center text-black hover:bg-black hover:text-[var(--a2)] opacity-0 group-hover/carousel:opacity-100 transition-all hidden sm:flex z-10 transform hover:scale-110 active:scale-90"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button
                onClick={() => document.getElementById(`carousel-${i}`)?.scrollBy({ left: 240, behavior: 'smooth' })}
                className="absolute -right-3 top-[40%] -translate-y-1/2 w-10 h-10 bg-[var(--bg1)] shadow-xl border border-black rounded-full flex items-center justify-center text-black hover:bg-black hover:text-[var(--a2)] opacity-0 group-hover/carousel:opacity-100 transition-all hidden sm:flex z-10 transform hover:scale-110 active:scale-90"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M9 5l7 7-7 7" /></svg>
            </button>
        </div>
    );
});

export default MessageCarousel;
