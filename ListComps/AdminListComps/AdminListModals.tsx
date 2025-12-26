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
        <div className="fixed inset-0 z-[100] flex items-center justify-center animate-in fade-in duration-300">
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                onClick={() => {
                    setShowModal(null);
                    setSelectedItem(null);
                    localStorage.removeItem("StoredItem");
                }}
            />
            <div className="relative w-full max-w-2xl max-h-[90vh] mx-4 bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col ring-1 ring-black/5 animate-in zoom-in-95 slide-in-from-bottom-5 duration-400">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                        {showModal === 'create' ? `Add New ${dataSource}` : `Update ${dataSource}`}
                    </h3>
                    <button
                        onClick={() => {
                            setShowModal(null);
                            setSelectedItem(null);
                            localStorage.removeItem("StoredItem");
                        }}
                        className="p-2 hover:bg-slate-50 rounded-full transition-colors"
                    >
                        <X size={24} className="text-slate-400" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
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
    );
};
