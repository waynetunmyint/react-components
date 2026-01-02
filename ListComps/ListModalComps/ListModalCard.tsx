"use client";
import React from "react";
import {
    Edit2,
    Trash2,
    Glasses,
    Ban,
    CheckCircle,
    PauseCircle,
    ShoppingBag,
    Mail,
    Calendar,
    Phone,
    MapPin,
    User,
    DollarSign,
    File,
    Globe,
    Link,
    Info,
    ShoppingCart,
    Briefcase,
    Minus,
    Book,
    Unlock,
    MoreHorizontal,
    Printer,
    Copy,
    Sparkles,
    ExternalLink,
    Star,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { IMAGE_URL } from "@/config";
import { convertDateTime, convertToDateTime, formatNumber } from "../../HelperComps/TextCaseComp";
import { formatPrice } from "../../UniversalComps/Universal_FormatterComp";

// Status configuration type
interface StatusConfig {
    bgClass: string;
    textClass: string;
    text: string;
    icon: React.ElementType;
    glowClass?: string;
}

// Field icon mapping helper
const getFieldIcon = (field: string): React.ReactNode => {
    const lower = field.toLowerCase();
    const iconMap: Record<string, React.ReactNode> = {
        pageid: <Link size={14} className="text-indigo-500 flex-shrink-0" />,
        page: <Briefcase size={14} className="text-indigo-500 flex-shrink-0" />,
        pagetitle: <Briefcase size={14} className="text-indigo-500 flex-shrink-0" />,
        author: <User size={14} className="text-purple-500 flex-shrink-0" />,
        bookauthor: <User size={14} className="text-purple-500 flex-shrink-0" />,
        bookedition: <Book size={14} className="text-teal-500 flex-shrink-0" />,
        edition: <Book size={14} className="text-teal-500 flex-shrink-0" />,
        email: <Mail size={14} className="text-[var(--a2)] flex-shrink-0" />,
        phone: <Phone size={14} className="text-[var(--g2)] flex-shrink-0" />,
        contact: <Phone size={14} className="text-[var(--g2)] flex-shrink-0" />,
        address: <MapPin size={14} className="text-[var(--r2)] flex-shrink-0" />,
        location: <MapPin size={14} className="text-[var(--r2)] flex-shrink-0" />,
        user: <User size={14} className="text-[var(--t2)] flex-shrink-0" />,
        name: <User size={14} className="text-[var(--t2)] flex-shrink-0" />,
        price: <DollarSign size={14} className="text-amber-500 flex-shrink-0" />,
        amount: <DollarSign size={14} className="text-amber-500 flex-shrink-0" />,
        file: <File size={14} className="text-purple-500 flex-shrink-0" />,
        url: <File size={14} className="text-purple-500 flex-shrink-0" />,
        date: <Calendar size={14} className="text-orange-500 flex-shrink-0" />,
        createdat: <Calendar size={14} className="text-orange-500 flex-shrink-0" />,
        website: <Globe size={14} className="text-sky-500 flex-shrink-0" />,
        link: <Link size={14} className="text-blue-400 flex-shrink-0" />,
    };
    return Object.entries(iconMap).find(([key]) => lower.includes(key))?.[1] || null;
};

// Status rendering helper with premium badges
const renderStatus = (status?: string): React.ReactNode => {
    const s = Number(status);
    const statusConfig: Record<number, StatusConfig> = {
        0: {
            bgClass: "bg-gradient-to-r from-red-500/10 to-orange-500/10 ",
            textClass: "text-red-600",
            text: "Inactive",
            icon: PauseCircle,
            glowClass: "shadow-red-500/10",
        },
        1: {
            bgClass: "bg-gradient-to-r from-emerald-500/10 to-green-500/10 ",
            textClass: "text-emerald-600",
            text: "Active",
            icon: CheckCircle,
            glowClass: "shadow-emerald-500/10",
        },
        2: {
            bgClass: "bg-gradient-to-r from-amber-500/10 to-orange-500/10",
            textClass: "text-amber-600",
            text: "Sold",
            icon: ShoppingBag,
            glowClass: "shadow-amber-500/10",
        },
        9: {
            bgClass: "bg-gradient-to-r from-violet-500/10 to-purple-500/10",
            textClass: "text-violet-600",
            text: "Verified",
            icon: Sparkles,
            glowClass: "shadow-violet-500/10",
        },
    };
    const config = statusConfig[s] || {
        bgClass: "bg-[var(--bg2)] ",
        textClass: "text-[var(--t2)]",
        text: "Unknown",
        icon: Info,
    };
    const Icon = config.icon;

    // Compact pill for Active status
    if (s === 1) {
        return (
            <span
                className={`inline-flex items-center justify-center w-8 h-8 rounded-full  backdrop-blur-sm ${config.bgClass} ${config.textClass} shadow-lg ${config.glowClass} transition-all duration-300 hover:scale-110 hover:shadow-xl`}
                title="Active"
            >
                <Icon size={16} strokeWidth={2.5} />
            </span>
        );
    }

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide  backdrop-blur-sm shadow-lg ${config.bgClass} ${config.textClass} ${config.glowClass} transition-all duration-300 hover:scale-105`}
        >
            <Icon size={12} strokeWidth={2.5} />
            <span>{config.text}</span>
        </span>
    );
};

interface ListModalCardProps {
    item: Record<string, any>;
    index: number;
    imageField?: string;
    imageClassName?: string;
    badgeImage?: string;
    headingField?: string;
    subHeadingFields: string[];
    gridFields: string[];
    defaultImage: string;
    isDropdownOpen: boolean;
    IsBill?: boolean;
    activeInActiveToggle?: boolean;
    activeBlockToggle?: boolean;
    activeSoldToggle?: boolean;
    isInterestingToggle?: boolean;
    onDropdownToggle: () => void;
    onDropdownClose: () => void;
    onAction: (action: string, item: any) => void;
    onStatusUpdate: (status: string, item: any, isInteresting?: boolean) => void;
    renderComp?: (item: Record<string, any>) => React.ReactNode;
}

export function ListModalCard({
    item,
    imageField,
    imageClassName,
    badgeImage,
    headingField,
    subHeadingFields,
    gridFields,
    defaultImage,
    isDropdownOpen,
    IsBill,
    activeInActiveToggle,
    activeBlockToggle,
    activeSoldToggle,
    isInterestingToggle,
    onDropdownToggle,
    onDropdownClose,
    onAction,
    onStatusUpdate,
    renderComp,
}: ListModalCardProps) {
    const imageSrc = item?.[imageField ?? ""]
        ? `${IMAGE_URL}/uploads/${item[imageField ?? ""]}`
        : `${IMAGE_URL}/uploads/${defaultImage}`;
    const badgeSrc = item?.[badgeImage ?? ""]
        ? `${IMAGE_URL}/uploads/${item[badgeImage ?? ""]}`
        : null;

    const status = String(item?.Status ?? "");
    const isInteresting = Number(item?.IsInteresting) === 1;

    // Premium gradient border based on status
    const statusBorderGradient =
        status === "1"
            ? "from-emerald-400 via-emerald-500 to-green-500"
            : status === "0"
                ? "from-red-400 via-red-500 to-orange-500"
                : status === "2"
                    ? "from-amber-400 via-amber-500 to-orange-500"
                    : status === "9"
                        ? "from-violet-400 via-violet-500 to-purple-500"
                        : "from-gray-200 via-gray-300 to-gray-200";

    return (
        <div className="group relative">
            {/* Gradient border effect */}
            <div className={`absolute -inset-[1px] bg-gradient-to-r ${statusBorderGradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-[1px]`} />

            <div className="relative bg-[var(--bg1)] rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 border border-[var(--bg2)]">
                {/* Top accent line */}
                <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${statusBorderGradient} opacity-60`} />

                <div className="p-5">
                    <div className="flex items-start gap-4">
                        {/* Thumbnails Row - supports multiple thumbnail fields */}
                        {(() => {
                            const thumbnailFields = ['Thumbnail', 'ThumbnailOne', 'ThumbnailTwo', 'ThumbnailThree'];
                            const availableThumbnails = thumbnailFields.filter(
                                field => {
                                    const val = item?.[field];
                                    // More strict validation
                                    return val &&
                                        typeof val === 'string' &&
                                        val.trim() !== "" &&
                                        val !== "logo.png" &&
                                        val !== "null" &&
                                        val !== "undefined";
                                }
                            );

                            // Also check for custom imageField if it's not a thumbnail field
                            if (imageField && !thumbnailFields.includes(imageField)) {
                                const val = item?.[imageField];
                                if (val && typeof val === 'string' && val.trim() !== "" && val !== "logo.png" && val !== "null" && val !== "undefined") {
                                    availableThumbnails.unshift(imageField);
                                }
                            }

                            if (availableThumbnails.length === 0) return null;

                            return (
                                <div className="relative flex-shrink-0">
                                    <div className="flex gap-2">
                                        {availableThumbnails.map((field, idx) => (
                                            <div key={field} className="relative group/image">
                                                {idx === 0 && (
                                                    <div className="absolute -inset-1 bg-gradient-to-br from-[var(--a2)]/20 to-purple-500/20 rounded-xl blur-sm opacity-0 group-hover/image:opacity-100 transition-opacity" />
                                                )}
                                                <img
                                                    src={`${IMAGE_URL}/uploads/${item[field]}`}
                                                    alt={`${item?.[headingField ?? ""] || "Item"} ${idx > 0 ? `- Image ${idx + 1}` : ""}`}
                                                    className={`relative ${availableThumbnails.length === 1 ? 'w-20 h-20' : 'w-14 h-14'} rounded-xl border-2 border-[var(--bg2)] object-cover transition-all duration-500 hover:border-[var(--a2)] hover:scale-110 hover:z-10 hover:shadow-2xl hover:ring-4 hover:ring-[var(--a2)]/20`}
                                                    onError={(e) => {
                                                        // Hide broken images
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    {badgeSrc && (
                                        <img
                                            src={badgeSrc}
                                            alt="Badge"
                                            className="w-7 h-7 rounded-full absolute -top-2 -right-2 border-2 border-[var(--bg1)] shadow-lg ring-2 ring-white/50"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                            }}
                                        />
                                    )}
                                    {/* Interesting star badge - Golden Premium Style */}
                                    {isInteresting && (
                                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-xl shadow-amber-500/40 border-2 border-white group/star">
                                            <div className="absolute inset-0 rounded-full bg-amber-400 animate-ping opacity-20" />
                                            <Star size={14} className="text-white fill-white transform group-hover/star:rotate-72 transition-transform duration-500" />
                                        </div>
                                    )}
                                </div>
                            );
                        })()}

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            {headingField && (
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <h3 className="text-lg font-extrabold text-[var(--t3)] line-clamp-2 leading-tight group-hover:text-[var(--a2)] transition-colors duration-300 tracking-tight">
                                        {item?.[headingField]}
                                    </h3>
                                    {renderStatus(status)}
                                </div>
                            )}

                            {/* SubHeading Fields - Cleaner layout */}
                            {subHeadingFields && subHeadingFields.length > 0 && (
                                <div className="space-y-1.5 mb-3">
                                    {subHeadingFields.map((field, idx) => {
                                        if (!field || !item?.[field]) return null;
                                        let content: any = String(item[field]);

                                        if (field === "FileURL") {
                                            content = (
                                                <a
                                                    href={`${IMAGE_URL}/uploads/${item[field]}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-[var(--a2)] hover:text-blue-700 font-medium transition-colors"
                                                >
                                                    View File
                                                    <ExternalLink size={12} />
                                                </a>
                                            );
                                        } else if (field === "CreatedAt" || field.toLowerCase().includes("date")) {
                                            content = convertDateTime(item[field]);
                                        } else if (String(field).toLowerCase().includes("price")) {
                                            content = (
                                                <span className="font-semibold text-amber-600">{formatPrice(item[field])}</span>
                                            );
                                        }

                                        return (
                                            <div key={idx} className="flex items-center gap-2 text-sm text-[var(--t2)]">
                                                <span className="opacity-60">{getFieldIcon(field)}</span>
                                                <span className="line-clamp-1">{content}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Grid Fields - Modern chips */}
                            {gridFields && gridFields.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-3 border-t border-[var(--bg2)]">
                                    {gridFields.map((field, idx) => {
                                        if (!item?.[field]) return null;
                                        let content: any = String(item[field]);
                                        let chipStyle = "bg-[var(--bg2)]/80 text-[var(--t2)] border-[var(--bg3)]/50";

                                        if (field.toLowerCase().includes("date") || field === "CreatedAt") {
                                            content = convertToDateTime(item[field]);
                                        } else if (String(field).toLowerCase().includes("price")) {
                                            content = formatNumber(item[field]);
                                            chipStyle = "bg-amber-50 text-amber-700 border-amber-200/50";
                                        } else if (field === "Icon" && item[field]) {
                                            const IconComp = (LucideIcons as any)[item[field]];
                                            if (IconComp) {
                                                content = (
                                                    <div className="flex items-center gap-1">
                                                        <IconComp size={12} />
                                                        <span>{item[field]}</span>
                                                    </div>
                                                );
                                            }
                                        } else if (field === "IsDropdown" || field === "IsMegaMenu" || field === "IsInteresting") {
                                            const isTrue = Number(item[field]) === 1;
                                            const labels: Record<string, [string, string]> = {
                                                IsDropdown: ["Dropdown", "Link"],
                                                IsMegaMenu: ["Mega", "Standard"],
                                                IsInteresting: ["Featured", "Normal"],
                                            };
                                            const [trueLabel, falseLabel] = labels[field] || ["Yes", "No"];
                                            content = (
                                                <span className="flex items-center gap-1">
                                                    {isTrue ? <CheckCircle size={10} /> : <Minus size={10} />}
                                                    {isTrue ? trueLabel : falseLabel}
                                                </span>
                                            );
                                            chipStyle = isTrue
                                                ? "bg-purple-50 text-purple-700"
                                                : "bg-[var(--bg2)]/80 text-[var(--t2)]";
                                        }

                                        return (
                                            <div
                                                key={idx}
                                                className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-lg backdrop-blur-sm ${chipStyle}`}
                                            >
                                                {getFieldIcon(field)}
                                                <span className="truncate max-w-[100px]">{content}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Actions Menu - Premium style */}
                        <div className="relative flex-shrink-0">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDropdownToggle();
                                }}
                                className="p-2.5 text-[var(--t2)] hover:text-[var(--t3)] bg-[var(--bg2)]/50 hover:bg-[var(--bg2)] rounded-xl transition-all duration-200 active:scale-90 hover:shadow-md"
                            >
                                <MoreHorizontal size={18} />
                            </button>

                            {isDropdownOpen && (
                                <>
                                    <div className="fixed inset-0 z-[99]" onClick={onDropdownClose} />
                                    <div className="absolute right-0 mt-2 w-60 z-[100] bg-[var(--bg1)]/95 backdrop-blur-xl border border-[var(--bg3)] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 zoom-in-95 duration-200">
                                        {/* Header with blur */}
                                        <div className="px-4 py-3 bg-gradient-to-r from-[var(--bg2)] to-[var(--bg1)] border-b border-[var(--bg2)]">
                                            <p className="text-xs font-bold text-[var(--t3)] uppercase tracking-widest">Quick Actions</p>
                                        </div>

                                        {/* Primary Actions */}
                                        <div className="py-2">
                                            {[
                                                { icon: Glasses, text: "View Details", action: "view", color: "text-[var(--t2)]", hoverBg: "hover:bg-[var(--bg2)]", hoverColor: "hover:text-[var(--t3)]" },
                                                { icon: Edit2, text: "Edit Item", action: "edit", color: "text-blue-500", hoverBg: "hover:bg-blue-50", hoverColor: "hover:text-blue-600" },
                                                { icon: Copy, text: "Duplicate", action: "clone", color: "text-teal-500", hoverBg: "hover:bg-teal-50", hoverColor: "hover:text-teal-600" },
                                                { icon: Trash2, text: "Delete", action: "delete", color: "text-red-400", hoverBg: "hover:bg-red-50", hoverColor: "hover:text-red-600" },
                                            ].map(({ icon: Icon, text, action, color, hoverBg, hoverColor }) => (
                                                <button
                                                    key={action}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onAction(action, item);
                                                    }}
                                                    className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium ${hoverBg} ${hoverColor} transition-all duration-150 ${color} group/btn`}
                                                >
                                                    <Icon size={16} strokeWidth={2} className="transition-transform group-hover/btn:scale-110" />
                                                    <span>{text}</span>
                                                </button>
                                            ))}

                                            {isInterestingToggle && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onStatusUpdate(item?.IsInteresting == 1 ? "0" : "1", item, true);
                                                    }}
                                                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium hover:bg-amber-50 transition-colors text-amber-500 hover:text-amber-600 group/btn"
                                                >
                                                    {item?.IsInteresting == 1 ? <Star size={16} strokeWidth={2} /> : <Star size={16} strokeWidth={2} className="transition-transform group-hover/btn:scale-110" />}
                                                    <span>{item?.IsInteresting == 1 ? "Remove Feature" : "Mark Featured"}</span>
                                                </button>
                                            )}
                                        </div>

                                        {/* Status Actions - Separated section */}
                                        {(activeInActiveToggle || activeBlockToggle || activeSoldToggle) && (
                                            <>
                                                <div className="border-t border-[var(--bg2)] mx-2" />
                                                <div className="py-2 px-2">
                                                    <p className="text-[10px] font-bold text-[var(--t2)]/60 uppercase tracking-widest px-2 pb-2">Status</p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {activeInActiveToggle && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onStatusUpdate(item?.Status == 1 ? "0" : "1", item);
                                                                }}
                                                                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${item?.Status == 1
                                                                    ? "bg-orange-100 text-orange-600 hover:bg-orange-200"
                                                                    : "bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
                                                                    }`}
                                                            >
                                                                {item?.Status == 1 ? <PauseCircle size={14} /> : <CheckCircle size={14} />}
                                                                {item?.Status == 1 ? "Deactivate" : "Activate"}
                                                            </button>
                                                        )}

                                                        {activeBlockToggle && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onStatusUpdate(item?.Status == 1 ? "0" : "1", item);
                                                                }}
                                                                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${item?.Status == 1
                                                                    ? "bg-red-100 text-red-600 hover:bg-red-200"
                                                                    : "bg-green-100 text-green-600 hover:bg-green-200"
                                                                    }`}
                                                            >
                                                                {item?.Status == 1 ? <Ban size={14} /> : <Unlock size={14} />}
                                                                {item?.Status == 1 ? "Block" : "Unblock"}
                                                            </button>
                                                        )}

                                                        {activeSoldToggle && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onStatusUpdate(item?.Status == 2 ? "1" : "2", item);
                                                                }}
                                                                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${item?.Status == 2
                                                                    ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                                    : "bg-purple-100 text-purple-600 hover:bg-purple-200"
                                                                    }`}
                                                            >
                                                                {item?.Status == 2 ? <ShoppingCart size={14} /> : <ShoppingBag size={14} />}
                                                                {item?.Status == 2 ? "Available" : "Sold"}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {renderComp && (
                        <div className="mt-4 pt-4 border-t border-[var(--bg2)]">
                            {renderComp(item)}
                        </div>
                    )}

                    {/* IsBill Actions - Premium buttons */}
                    {IsBill && (
                        <div className="mt-5 pt-5 border-t border-[var(--bg2)]">
                            <div className="flex flex-wrap items-center gap-2">
                                {/* Status Pills */}
                                {[
                                    { value: "0", label: "Invalid", activeColor: "bg-red-500 text-white border-red-600", inactiveColor: "bg-white text-red-500 border-red-200 hover:bg-red-50" },
                                    { value: "1", label: "Active", activeColor: "bg-emerald-500 text-white border-emerald-600", inactiveColor: "bg-white text-emerald-500 border-emerald-200 hover:bg-emerald-50" },
                                    { value: "2", label: "Paid", activeColor: "bg-blue-500 text-white border-blue-600", inactiveColor: "bg-white text-blue-500 border-blue-200 hover:bg-blue-50" },
                                ].map(({ value, label, activeColor, inactiveColor }) => (
                                    <button
                                        key={value}
                                        onClick={(e) => { e.stopPropagation(); onStatusUpdate(value, item); }}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border shadow-sm ${String(item.Status) === value ? activeColor : inactiveColor
                                            }`}
                                    >
                                        {label}
                                    </button>
                                ))}

                                <div className="w-px h-6 bg-[var(--bg3)] mx-2 hidden sm:block" />

                                {/* Print Buttons - Glass effect */}
                                {[
                                    { type: "invoice", label: "Invoice", icon: Printer },
                                    { type: "receipt", label: "Receipt", icon: File },
                                ].map(({ type, label, icon: Icon }) => (
                                    <button
                                        key={type}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            window.open(`${window.location.origin}/pageBill/print/${type}/${item.Id}`, "_blank");
                                        }}
                                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--bg1)] text-[var(--t2)] hover:text-[var(--t3)] border border-[var(--bg3)] hover:border-[var(--a2)]/30 hover:shadow-lg transition-all duration-300"
                                    >
                                        <Icon size={14} />
                                        <span className="hidden sm:inline">{label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export { renderStatus, getFieldIcon };
