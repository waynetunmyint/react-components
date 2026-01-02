import React from 'react';
import { EllipsisVertical, Glasses, Edit2, Trash2, Printer, File, CheckCircle, PauseCircle } from 'lucide-react';
import { IMAGE_URL } from "@/config";

interface AdminListCardProps {
    item: any;
    index: number;
    imageField: string | undefined;
    imageSrc: string;
    badgeSrc: string | null;
    headingField: string | undefined;
    subHeadingFields: string[] | undefined;
    gridFields: string[] | undefined;
    IsBill: boolean;
    activeInActiveToggle?: boolean;
    activeBlockToggle?: boolean;
    activeSoldToggle?: boolean;
    openDropdown: string | null;
    setOpenDropdown: (id: string | null) => void;
    renderStatus: (status?: string) => React.ReactNode;
    getFieldIcon: (f: string) => React.ReactNode;
    formatLabel: (fieldName: string) => string;
    convertDateTime: (date: any) => string;
    handleAction: (action: string, item: any) => void;
    handleStatusUpdate: (status: string, item: any) => void;
    ArrowRightIcon: any;
}

export const AdminListCard: React.FC<AdminListCardProps> = ({
    item,
    index,
    imageField,
    imageSrc,
    badgeSrc,
    headingField,
    subHeadingFields,
    gridFields,
    IsBill,
    activeInActiveToggle,
    activeBlockToggle,
    activeSoldToggle,
    openDropdown,
    setOpenDropdown,
    renderStatus,
    getFieldIcon,
    formatLabel,
    convertDateTime,
    handleAction,
    handleStatusUpdate,
    ArrowRightIcon
}) => {
    return (
        <div
            key={item.Id || index}
            className={`group relative bg-white rounded-2xl border border-slate-100/60 shadow-sm hover:shadow-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 ${openDropdown === index.toString() ? 'z-[200]' : 'z-0'}`}
            style={{ animationDelay: `${index * 50}ms` }}
        >
            <div
                className="absolute top-0 left-0 w-1.5 h-full scale-y-0 group-hover:scale-y-100 transition-transform duration-700 origin-top rounded-l-2xl bg-gradient-to-b from-brand-gold via-brand-green to-brand-green shadow-[0_0_15px_rgba(232,159,29,0.3)]"
            />

            <div className="p-4 sm:p-5 relative z-10">
                <div className="flex items-start gap-5">
                    {/* Leading Image - iOS Style Rounded */}
                    {imageField && item?.[imageField] && item?.[imageField] !== "logo.png" && (
                        <div className="relative shrink-0">
                            <div className="w-[80px] sm:w-[100px] aspect-[4/5] rounded-2xl overflow-hidden bg-white border border-slate-200/60 shadow-md group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-700 ease-out">
                                <img
                                    src={imageSrc}
                                    alt="Item"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = `https://via.placeholder.com/400x400?text=No+Image`;
                                    }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </div>

                            {badgeSrc && (
                                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-xl bg-white p-1.5 shadow-lg z-10 border border-brand-gold/20 transform group-hover:rotate-12 transition-transform">
                                    <img src={badgeSrc} alt="Badge" className="w-full h-full rounded-lg object-contain" />
                                </div>
                            )}

                            <div className="absolute text-gray-900 -bottom-3 left-1/2 -translate-x-1/2 z-20 transform group-hover:-translate-y-1 transition-all duration-500">
                                {item?.Status !== undefined && renderStatus(item?.Status)}
                            </div>
                        </div>
                    )}

                    {/* Content Area */}
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-3 mb-2">
                            {headingField && (
                                <h3 className="text-xl font-extrabold text-slate-900 leading-tight tracking-tight group-hover:text-brand-green transition-colors line-clamp-2">
                                    {item?.[headingField]}
                                </h3>
                            )}

                            {/* iOS Style Context Menu Trigger */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenDropdown(openDropdown === index.toString() ? null : index.toString());
                                }}
                                className="p-2.5 text-slate-400 hover:text-brand-green bg-slate-50/50 hover:bg-white border border-slate-100 rounded-2xl transition-all active:scale-90 shadow-sm hover:shadow-md"
                            >
                                <EllipsisVertical size={18} strokeWidth={2.5} />
                            </button>
                        </div>

                        {/* Structured Fields */}
                        <div className="space-y-3">
                            {subHeadingFields && subHeadingFields.length > 0 && (
                                <div className="space-y-1.5">
                                    {subHeadingFields.map((field, idx) => {
                                        if (!field || !item?.[field]) return null;
                                        let content: any = String(item[field]);

                                        if ((field === "Description" || field === "Address") && String(item[field] || "").trim()) {
                                            return (
                                                <div
                                                    key={idx}
                                                    className="mt-0.5 text-[13px] text-slate-500 leading-snug line-clamp-3"
                                                >
                                                    {content}
                                                </div>
                                            );
                                        }

                                        if (field === "FileURL") {
                                            content = (
                                                <a
                                                    href={`${IMAGE_URL}/uploads/${item[field]}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-blue-600 font-semibold"
                                                >
                                                    View File <ArrowRightIcon size={12} />
                                                </a>
                                            );
                                        } else if (field === "CreatedAt" || field.toLowerCase().includes('date')) {
                                            content = convertDateTime(item[field]);
                                        }

                                        return (
                                            <div key={idx} className="flex items-center justify-between text-xs py-2 border-b border-slate-50 last:border-0 group/field">
                                                <span className="flex items-center gap-2 text-slate-400 font-bold shrink-0">
                                                    <div className="p-1 px-1.5 rounded-lg bg-slate-50 group-hover/field:bg-brand-gold/10 group-hover/field:text-brand-gold transition-colors">
                                                        {getFieldIcon(field)}
                                                    </div>
                                                    <span className="uppercase tracking-widest text-[9px] opacity-80">{formatLabel(field)}</span>
                                                </span>
                                                <span className="text-slate-700 text-right font-black truncate ml-4 group-hover/field:text-slate-900 transition-colors">{content}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Tag Style Grid Fields */}
                            {gridFields && gridFields.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {gridFields.map((field, idx) => {
                                        if (item?.[field] === undefined || item?.[field] === null) return null;
                                        let content: any = String(item[field]);

                                        if (field === "IsZoom") {
                                            const isZoom = Number(item[field]) === 1 || item[field] === "Yes" || item[field] === "1";
                                            return (
                                                <span
                                                    key={idx}
                                                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${isZoom ? 'bg-brand-green text-white' : 'bg-slate-100 text-slate-600'}`}
                                                >
                                                    {isZoom ? <CheckCircle size={10} /> : <PauseCircle size={10} />}
                                                    {isZoom ? "Zoom Live" : "In Class"}
                                                </span>
                                            );
                                        }

                                        return (
                                            <div key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-50 border border-slate-100 rounded-lg">
                                                {getFieldIcon(field)}
                                                <span className="truncate max-w-[120px]">{content}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Bill Specific Actions */}
                            {IsBill && (
                                <div className="flex items-center gap-2 pt-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            window.open(`${window.location.origin}/admin/pageBill/print/invoice/${item.Id}`, '_blank');
                                        }}
                                        className="flex-1 py-2.5 text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-100 rounded-xl transition-all active:scale-95"
                                    >
                                        Invoice
                                    </button>
                                    <button
                                        disabled={String(item.Status) !== "2"}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            window.open(`${window.location.origin}/admin/pageBill/print/receipt/${item.Id}`, '_blank');
                                        }}
                                        className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all active:scale-95 border ${String(item.Status) === "2" ? "text-emerald-700 bg-emerald-50 border-emerald-100" : "text-slate-300 bg-slate-50 border-slate-100 opacity-50"
                                            }`}
                                    >
                                        Receipt
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Dropdown Menu - absolutely positioned within card or relative to trigger */}
                {openDropdown === index.toString() && (
                    <>
                        {/* Backdrop with very high z-index to cover everything including headers */}
                        <div className="fixed inset-0 z-[150] bg-black/5 backdrop-blur-[1px]" onClick={() => setOpenDropdown(null)} />

                        <div className="absolute right-6 top-14 w-52 z-[160] bg-white/95 backdrop-blur-xl border border-slate-100 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            <div className="py-1">
                                {[
                                    { icon: Glasses, text: "View Detail", action: "view", color: "text-slate-700" },
                                    { icon: Edit2, text: "Edit Item", action: "edit", color: "text-blue-600" },
                                    { icon: Trash2, text: "Delete", action: "delete", color: "text-red-600" },
                                ].map(({ icon: Icon, text, action, color }) => (
                                    <button
                                        key={action}
                                        onClick={(e) => { e.stopPropagation(); handleAction(action, item); }}
                                        className={`flex items-center gap-3 w-full px-4 py-3 text-xs font-semibold hover:bg-slate-50 transition-all ${color}`}
                                    >
                                        <Icon size={14} /> {text}
                                    </button>
                                ))}

                                {IsBill && (
                                    <div className="border-t border-slate-100 mt-1 pt-1">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); window.open(`${window.location.origin}/admin/pageBill/print/invoice/${item.Id}`, '_blank'); }}
                                            className="flex items-center gap-3 w-full px-4 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                        >
                                            <Printer size={14} /> Print Invoice
                                        </button>
                                    </div>
                                )}

                                {(activeInActiveToggle || activeBlockToggle || activeSoldToggle) && !IsBill && (
                                    <div className="border-t border-slate-100 mt-1 pt-1">
                                        {activeInActiveToggle && (
                                            item?.Status == 1 ? (
                                                <button onClick={(e) => { e.stopPropagation(); handleStatusUpdate("0", item); }} className="flex items-center gap-3 w-full px-4 py-3 text-xs font-semibold text-orange-600 hover:bg-orange-50">
                                                    <PauseCircle size={14} /> Deactivate
                                                </button>
                                            ) : (
                                                <button onClick={(e) => { e.stopPropagation(); handleStatusUpdate("1", item); }} className="flex items-center gap-3 w-full px-4 py-3 text-xs font-semibold text-emerald-600 hover:bg-emerald-50">
                                                    <CheckCircle size={14} /> Activate
                                                </button>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
