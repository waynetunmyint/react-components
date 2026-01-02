"use client";
import React from "react";
import { Plus, Edit2, X, Sparkles } from "lucide-react";
import FormModalCreate from "../../FormComps/FormModalCreate";
import FormModalUpdate from "../../FormComps/FormModalUpdate";

interface ListModalFormOverlayProps {
    showModal: 'create' | 'update' | null;
    dataSource: string;
    fields: Array<{
        fieldName: string;
        type: string;
        required?: boolean;
        customAPI?: string;
        customSource?: string;
        defaultValue?: string;
    }>;
    imageSize: string;
    selectedItem: Record<string, any> | null;
    CustomCreateForm?: React.ComponentType<any>;
    CustomUpdateForm?: React.ComponentType<any>;
    onClose: () => void;
    onSuccess: () => void;
}

export function ListModalFormOverlay({
    showModal,
    dataSource,
    fields,
    imageSize,
    selectedItem,
    CustomCreateForm,
    CustomUpdateForm,
    onClose,
    onSuccess,
}: ListModalFormOverlayProps) {
    if (!showModal) return null;

    const isCreate = showModal === 'create';

    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 px-4 py-8 animate-in fade-in duration-300"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            {/* Modal Container */}
            <div
                className="relative bg-[var(--bg1)] rounded-3xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 mx-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Decorative gradient border */}
                <div className={`absolute inset-0 -m-[1px] rounded-3xl bg-gradient-to-br ${isCreate
                        ? 'from-blue-500 via-indigo-500 to-purple-500'
                        : 'from-amber-500 via-orange-500 to-red-500'
                    } opacity-50`} />

                <div className="relative bg-[var(--bg1)] rounded-3xl overflow-hidden">
                    {/* Modal Header - Premium with gradient accent */}
                    <div className="sticky top-0 z-10 border-b border-[var(--bg3)]">
                        {/* Top gradient accent line */}
                        <div className={`h-1 bg-gradient-to-r ${isCreate
                                ? 'from-blue-500 via-indigo-500 to-purple-500'
                                : 'from-amber-500 via-orange-500 to-red-500'
                            }`} />

                        <div className="bg-[var(--bg1)]/95 backdrop-blur-sm px-6 py-5 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                {/* Animated icon container */}
                                <div className={`relative w-12 h-12 rounded-2xl flex items-center justify-center ${isCreate
                                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                                        : 'bg-gradient-to-br from-amber-500 to-orange-600'
                                    } shadow-xl ${isCreate ? 'shadow-blue-500/30' : 'shadow-amber-500/30'}`}>
                                    {/* Pulse ring */}
                                    <div className={`absolute inset-0 rounded-2xl ${isCreate ? 'bg-blue-500' : 'bg-amber-500'
                                        } animate-ping opacity-20`} />

                                    {isCreate ? (
                                        <Plus size={22} className="text-white relative" strokeWidth={2.5} />
                                    ) : (
                                        <Edit2 size={20} className="text-white relative" strokeWidth={2.5} />
                                    )}
                                </div>

                                <div>
                                    <h2 className="text-xl font-black text-[var(--t3)] tracking-tight flex items-center gap-2">
                                        {isCreate ? 'Create New' : 'Edit'}
                                        <Sparkles size={16} className={isCreate ? 'text-blue-500' : 'text-amber-500'} />
                                    </h2>
                                    <p className="text-sm text-[var(--t2)] capitalize font-medium">{dataSource}</p>
                                </div>
                            </div>

                            {/* Close button */}
                            <button
                                onClick={onClose}
                                className="group p-3 rounded-xl bg-[var(--bg2)] hover:bg-red-50 text-[var(--t2)] hover:text-red-500 transition-all duration-200 active:scale-95"
                                aria-label="Close modal"
                            >
                                <X size={20} strokeWidth={2} className="group-hover:rotate-90 transition-transform duration-300" />
                            </button>
                        </div>
                    </div>

                    {/* Modal Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
                        {isCreate ? (
                            CustomCreateForm ? (
                                <CustomCreateForm
                                    dataSource={dataSource}
                                    fields={fields}
                                    onSuccess={onSuccess}
                                />
                            ) : (
                                <FormModalCreate
                                    dataSource={dataSource}
                                    fields={fields}
                                    imageSize={imageSize}
                                    hideBackButton={true}
                                    onSuccess={onSuccess}
                                />
                            )
                        ) : selectedItem ? (
                            CustomUpdateForm ? (
                                <CustomUpdateForm
                                    dataSource={dataSource}
                                    fields={fields}
                                    existingData={selectedItem}
                                    onSuccess={onSuccess}
                                />
                            ) : (
                                <FormModalUpdate
                                    dataSource={dataSource}
                                    fields={fields}
                                    imageSize={imageSize}
                                    customRedirect={null}
                                    hideBackButton={true}
                                    onSuccess={onSuccess}
                                />
                            )
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
}
