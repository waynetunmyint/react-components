import React from 'react';
import { X } from 'lucide-react';
import FormAdminCreate from '../../FormComps/FormAdminAction';
import FormAdminUpdate from '../../FormComps/FormAdminUpdate';

interface AdminListModalsProps {
    showModal: 'create' | 'edit' | 'view' | null;
    dataSource: string;
    fields: any[];
    imageSize: string;
    selectedItem: any;
    setShowModal: (val: 'create' | 'edit' | 'view' | null) => void;
    setSelectedItem: (item: any) => void;
    fetchData: (page: number, loadAll?: boolean, isForce?: boolean) => void;
}

export const AdminListModals: React.FC<AdminListModalsProps> = ({
    showModal,
    dataSource,
    fields,
    imageSize,
    selectedItem,
    setShowModal,
    setSelectedItem,
    fetchData
}) => {
    if (!showModal) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center animate-in fade-in duration-500">
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-[6px]"
                onClick={() => {
                    setShowModal(null);
                    setSelectedItem(null);
                    localStorage.removeItem("StoredItem");
                }}
            />
            <div className="relative w-full max-w-2xl max-h-[92vh] mx-4 bg-white rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col ring-1 ring-black/5 animate-in zoom-in-95 slide-in-from-bottom-10 duration-700 ease-out">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-30">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-gold opacity-80 mb-1">Cms Management</span>
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                            {showModal === 'create' ? `New ${dataSource}` : `Edit ${dataSource}`}
                        </h3>
                    </div>
                    <button
                        onClick={() => {
                            setShowModal(null);
                            setSelectedItem(null);
                            localStorage.removeItem("StoredItem");
                        }}
                        className="p-3 hover:bg-slate-50 text-slate-400 hover:text-brand-green rounded-2xl transition-all active:scale-90 border border-transparent hover:border-slate-100"
                    >
                        <X size={24} strokeWidth={2.5} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
                    <div className="bg-slate-50/50 rounded-[2rem] p-2">
                        {showModal === 'create' ? (
                            <FormAdminCreate
                                dataSource={dataSource}
                                fields={fields}
                                imageSize={imageSize}
                                hideBackButton={true}
                                onSuccess={() => {
                                    setShowModal(null);
                                    setSelectedItem(null);
                                    fetchData(1, false, true);
                                }}
                            />
                        ) : selectedItem ? (
                            <FormAdminUpdate
                                dataSource={dataSource}
                                fields={fields}
                                imageSize={imageSize}
                                customRedirect={null}
                                hideBackButton={true}
                                onSuccess={() => {
                                    setShowModal(null);
                                    setSelectedItem(null);
                                    localStorage.removeItem("StoredItem");
                                    fetchData(1, false, true);
                                }}
                            />
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
};
