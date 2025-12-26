import React, { useEffect, useState } from "react";
import { Plus, Trash2, Tag, AlertCircle, FileText } from "lucide-react";

interface VariantItem {
    id: string; // internal id for React keys
    VariantTitle: string;
    Description: string;
    Price: number;
}

interface ArrayVariationFieldProps {
    field: {
        fieldName: string;
        required?: boolean;
        defaultValue?: any;
    };
    value: any; // expects array or stringified array
    error?: string;
    onChange: (val: any) => void;
}

const ArrayVariationField: React.FC<ArrayVariationFieldProps> = ({ field, value, error, onChange }) => {
    const [items, setItems] = useState<VariantItem[]>([]);

    // Initialize items from value
    useEffect(() => {
        let initialData: any[] = [];
        if (Array.isArray(value)) {
            initialData = value;
        } else if (typeof value === 'string') {
            try {
                initialData = JSON.parse(value);
            } catch (e) {
                initialData = [];
            }
        }

        if (initialData && Array.isArray(initialData)) {
            const formattedData = initialData.map((item: any) => ({
                id: item.id || Math.random().toString(36).substring(2),
                VariantTitle: item.VariantTitle || "",
                Description: item.Description || "",
                Price: Number(item.Price) || 0
            }));
            setItems(formattedData);
        }
    }, [value]);

    const updateParent = (newItems: VariantItem[]) => {
        // Send as stringified JSON for backend compatibility
        onChange(JSON.stringify(newItems));
    };

    const handleAddItem = () => {
        const id = Math.random().toString(36).substring(2) + Date.now().toString(36);
        const newItem: VariantItem = { id, VariantTitle: "", Description: "", Price: 0 };
        const newItems = [...items, newItem];
        setItems(newItems);
        updateParent(newItems);
    };

    const handleRemoveItem = (id: string) => {
        const newItems = items.filter(item => item.id !== id);
        setItems(newItems);
        updateParent(newItems);
    };

    const handleItemChange = (id: string, fieldName: keyof VariantItem, val: any) => {
        const newItems = items.map(item => {
            if (item.id === id) {
                return { ...item, [fieldName]: val };
            }
            return item;
        });
        setItems(newItems);
        updateParent(newItems);
    };

    return (
        <div key={field.fieldName} className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-900 uppercase tracking-tight">
                    <Tag size={16} className="text-emerald-500" />
                    Product Variations
                    {field.required && <span className="text-red-500">*</span>}
                </label>
                <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-2 rounded-xl hover:bg-emerald-100 transition-all border border-emerald-100"
                >
                    <Plus size={14} />
                    Add Variation
                </button>
            </div>

            <div className="space-y-3">
                {items.map((item) => (
                    <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase">
                                <FileText size={12} />
                                Variation Config
                            </div>
                            <button
                                type="button"
                                onClick={() => handleRemoveItem(item.id)}
                                className="text-red-400 hover:text-red-600 p-1 rounded-lg transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Title (e.g. Size L)</label>
                                <input
                                    type="text"
                                    value={item.VariantTitle}
                                    onChange={(e) => handleItemChange(item.id, 'VariantTitle', e.target.value)}
                                    placeholder="Variant Title"
                                    className="w-full text-sm font-medium text-slate-900 bg-slate-50 border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Price (MMK)</label>
                                <input
                                    type="number"
                                    value={item.Price}
                                    onChange={(e) => handleItemChange(item.id, 'Price', Number(e.target.value))}
                                    className="w-full text-sm font-medium text-slate-900 bg-slate-50 border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Short Description</label>
                            <textarea
                                value={item.Description}
                                onChange={(e) => handleItemChange(item.id, 'Description', e.target.value)}
                                placeholder="Additional details for this variant..."
                                className="w-full text-sm font-medium text-slate-900 bg-slate-50 border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                rows={2}
                            />
                        </div>
                    </div>
                ))}

                {items.length === 0 && (
                    <div className="text-center py-10 text-slate-400 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
                        <Tag size={32} className="mx-auto mb-2 opacity-20" />
                        <p className="text-xs font-bold uppercase tracking-widest">No variations added</p>
                    </div>
                )}
            </div>

            {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm mt-2 bg-red-50 px-3 py-2 rounded-lg">
                    <AlertCircle size={14} />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
};

export default ArrayVariationField;
