import React from 'react';
import { EllipsisVertical, Glasses, Edit2, Trash2, Printer, File, CheckCircle, PauseCircle } from 'lucide-react';
import { IMAGE_URL } from "../../../../config";

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
                style={{ backgroundColor: 'var(--theme-primary-bg)' }}
                className="absolute top-0 left-0 w-1 h-full scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-top rounded-l-2xl"
            />

            <div className="p-4 sm:p-5 relative z-10">
                <div className="flex items-start gap-5">
                    {/* Leading Image - iOS Style Rounded */}
                    {imageField && item?.[imageField] && item?.[imageField] !== "logo.png" && (
                        <div className="relative shrink-0">
                            <div className="w-[70px] sm:w-[90px] aspect-[4/5] rounded-xl overflow-hidden bg-slate-50 border border-slate-200/50 shadow-sm group-hover:shadow-soft transition-all duration-500">
                                <img
                                    src={imageSrc}
                                    alt="Item"
                                    className="w-full  group-hover:scale-105 transition-transform duration-700"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = `https://via.placeholder.com/400x400?text=No+Image`;
                                    }}
                                />
                            </div>

                            {badgeSrc && (
                                <div className="absolute -top-1.5 -right-1.5 w-7 h-7 rounded-lg bg-white p-1 shadow-md z-10 border border-slate-100">
                                    <img src={badgeSrc} alt="Badge" className="w-full h-full rounded-md object-cover" />
                                </div>
                            )}

                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-20 group-hover:-translate-y-0.5 transition-transform duration-300">
                                {item?.Status !== undefined && renderStatus(item?.Status)}
                            </div>
                        </div>
                    )}

                    {/* Content Area */}
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2 mb-1">
                            {headingField && (
                                <h3 className="text-lg font-bold text-slate-900 leading-snug tracking-tight group-hover:text-[var(--theme-primary-bg)] transition-colors line-clamp-2">
                                    {item?.[headingField]}
                                </h3>
                            )}

                            {/* iOS Style Context Menu Trigger */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenDropdown(openDropdown === index.toString() ? null : index.toString());
                                }}
                                className="p-2 -mt-1 text-slate-400 hover:text-slate-900 bg-slate-50 border border-slate-100 rounded-full transition-all active:scale-90"
                            >
                                <EllipsisVertical size={18} />
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
                                            <div key={idx} className="flex items-center justify-between text-xs py-0.5 border-b border-slate-100/50">
                                                <span className="flex items-center gap-2 text-slate-400 font-semibold shrink-0">
                                                    {getFieldIcon(field)}
                                                    <span className="uppercase tracking-wider text-[10px]">{formatLabel(field)}</span>
                                                </span>
                                                <span className="text-slate-800 text-right font-bold truncate ml-4">{content}</span>
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
                                                    style={{
                                                        backgroundColor: isZoom ? 'var(--theme-primary-bg)' : 'rgb(241 245 249)',
                                                        color: isZoom ? 'var(--theme-primary-text)' : 'rgb(71 85 105)'
                                                    }}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm"
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
