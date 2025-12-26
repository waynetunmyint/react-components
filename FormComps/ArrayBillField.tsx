import React, { useEffect, useState } from "react";
import { Plus, Trash2, ShoppingCart, AlertCircle } from "lucide-react";

interface BillItem {
    id: string; // internal id for React keys
    Title: string;
    Qty: number;
    Price: number;
}

interface ArrayBillFieldProps {
    field: {
        fieldName: string;
        required?: boolean;
        defaultValue?: any;
    };
    value: any; // expects array or stringified array
    error?: string;
    onChange: (val: any) => void;
}

const ArrayBillField: React.FC<ArrayBillFieldProps> = ({ field, value, error, onChange }) => {
    const [items, setItems] = useState<BillItem[]>([]);

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

        // Ensure data has the right shape and IDs
        // Only update if we have meaningful data or if we are ensuring formatting
        if (initialData) {
            const formattedData = initialData.map((item: any) => ({
                id: item.id || crypto.randomUUID(),
                Title: item.Title || "",
                Qty: Number(item.Qty) || 0,
                Price: Number(item.Price) || 0
            }));
            setItems(formattedData);
        }
    }, [value]);

    const updateParent = (newItems: BillItem[]) => {
        // We send the data including IDs to keep things stable, 
        // or we could strip them. Let's send them.
        // Stringify ensures standard transmission
        onChange(JSON.stringify(newItems));
    };

    const handleAddItem = () => {
        // Generate simple ID if crypto not available (older browsers), though next.js env usually has it.
        // Fallback just in case
        const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36);

        const newItem: BillItem = { id, Title: "", Qty: 1, Price: 0 };
        const newItems = [...items, newItem];
        setItems(newItems);
        updateParent(newItems);
    };

    const handleRemoveItem = (id: string) => {
        const newItems = items.filter(item => item.id !== id);
        setItems(newItems);
        updateParent(newItems);
    };

    const handleItemChange = (id: string, fieldName: keyof BillItem, val: any) => {
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
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <ShoppingCart size={14} className="text-blue-500" />
                    {field.fieldName}
                    {field.required && <span className="text-red-500">*</span>}
                </label>
                <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                >
                    <Plus size={16} />
                    Add Item
                </button>
            </div>

            <div className="space-y-3">
                {items.map((item) => (
                    <div key={item.id} className="grid grid-cols-12 gap-3 items-start bg-gray-50 p-3 rounded-xl border border-gray-200 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="col-span-12 md:col-span-5">
                            <label className="text-xs text-gray-500 mb-1 block">Title</label>
                            <input
                                type="text"
                                value={item.Title}
                                onChange={(e) => handleItemChange(item.id, 'Title', e.target.value)}
                                placeholder="Item title"
                                className="w-full text-sm text-gray-900 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div className="col-span-5 md:col-span-2">
                            <label className="text-xs text-gray-500 mb-1 block">Qty</label>
                            <input
                                type="number"
                                value={item.Qty}
                                onChange={(e) => handleItemChange(item.id, 'Qty', Number(e.target.value))}
                                className="w-full text-sm text-gray-900 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div className="col-span-5 md:col-span-4">
                            <label className="text-xs text-gray-500 mb-1 block">Price</label>
                            <input
                                type="number"
                                value={item.Price}
                                onChange={(e) => handleItemChange(item.id, 'Price', Number(e.target.value))}
                                className="w-full text-sm text-gray-900 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div className="col-span-2 md:col-span-1 flex items-end justify-center h-full pb-1">
                            <button
                                type="button"
                                onClick={() => handleRemoveItem(item.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                title="Remove Item"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}

                {items.length === 0 && (
                    <div className="text-center py-6 text-gray-400 bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-200">
                        No items added yet
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

export default ArrayBillField;
