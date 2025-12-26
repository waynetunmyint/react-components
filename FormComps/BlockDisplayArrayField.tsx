import React, { useEffect, useState, useRef } from "react";
import { Plus, Trash2, List, AlertCircle, GripVertical } from "lucide-react";

interface ArrayItem {
    id: string; // internal id for React keys
    Block: string;
    StyleValue: string;
    Weight: string;
    HeadingTitle: string;
    SubHeadingTitle: string;
}

interface BlockDisplayArrayFieldProps {
    field: {
        fieldName: string;
        required?: boolean;
        defaultValue?: any;
    };
    value: any; // expects array or stringified array
    error?: string;
    onChange: (val: any) => void;
}

const BlockDisplayArrayField: React.FC<BlockDisplayArrayFieldProps> = ({ field, value, error, onChange }) => {
    const [items, setItems] = useState<ArrayItem[]>([]);
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

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
                id: item.id || crypto.randomUUID(),
                Block: item.Block || "",
                StyleValue: item.StyleValue || "",
                Weight: item.Weight || "",
                HeadingTitle: item.HeadingTitle || "",
                SubHeadingTitle: item.SubHeadingTitle || ""
            }));
            // If weight is important for initial sort, we rely on the incoming array order
            setItems(formattedData);
        }
    }, [value]);

    const updateParent = (newItems: ArrayItem[]) => {
        // Automatically update weights based on order (1, 2, 3...)
        const itemsWithUpdatedWeights = newItems.map((item, index) => ({
            ...item,
            Weight: String(index + 1)
        }));

        // Update local state purely for the drag animation smoothness if needed, 
        // but typically we want to sync with parent.
        // However, updating weights might cause re-renders. 
        // Let's just pass the data up.
        onChange(JSON.stringify(itemsWithUpdatedWeights));
    };

    const handleAddItem = () => {
        const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36);
        const newItem: ArrayItem = {
            id,
            Block: "",
            StyleValue: "",
            Weight: String(items.length + 1),
            HeadingTitle: "",
            SubHeadingTitle: ""
        };
        const newItems = [...items, newItem];
        setItems(newItems);
        updateParent(newItems);
    };

    const handleRemoveItem = (id: string) => {
        const newItems = items.filter(item => item.id !== id);
        setItems(newItems);
        updateParent(newItems);
    };

    const handleItemChange = (id: string, fieldName: keyof ArrayItem, val: any) => {
        const newItems = items.map(item => {
            if (item.id === id) {
                return { ...item, [fieldName]: val };
            }
            return item;
        });
        setItems(newItems);
        updateParent(newItems);
    };

    // Drag and Drop Handlers
    const handleSort = () => {
        if (dragItem.current === null || dragOverItem.current === null) return;

        // Duplicate items
        const _items = [...items];

        // Remove and save the dragged item content
        const draggedItemContent = _items.splice(dragItem.current, 1)[0];

        // Switch the position
        _items.splice(dragOverItem.current, 0, draggedItemContent);

        // reset position refs
        dragItem.current = null;
        dragOverItem.current = null;

        setItems(_items);
        updateParent(_items);
    };

    return (
        <div key={field.fieldName} className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <List size={14} className="text-blue-500" />
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
                {items.map((item, index) => (
                    <div
                        key={item.id}
                        className="flex gap-2 items-start bg-gray-50 p-3 rounded-xl border border-gray-200 animate-in fade-in slide-in-from-top-2 duration-200 relative group"
                        draggable
                        onDragStart={(e) => {
                            dragItem.current = index;
                            e.dataTransfer.effectAllowed = "move";
                            // Add a grabbing cursor to body while dragging could be nice but simplified here
                        }}
                        onDragEnter={(e) => {
                            dragOverItem.current = index;
                        }}
                        onDragEnd={handleSort}
                        onDragOver={(e) => e.preventDefault()}
                    >
                        {/* Drag Handle */}
                        <div className="mt-8 text-gray-400 cursor-grab active:cursor-grabbing hover:text-gray-600">
                            <GripVertical size={20} />
                        </div>

                        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-3">
                            <div className="col-span-1 md:col-span-3">
                                <label className="text-xs text-gray-500 mb-1 block">Block</label>
                                <input
                                    type="text"
                                    value={item.Block}
                                    onChange={(e) => handleItemChange(item.id, 'Block', e.target.value)}
                                    placeholder="Block Name"
                                    className="w-full text-sm text-gray-900 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div className="col-span-1 md:col-span-3">
                                <label className="text-xs text-gray-500 mb-1 block">Style Value</label>
                                <input
                                    type="text"
                                    value={item.StyleValue}
                                    onChange={(e) => handleItemChange(item.id, 'StyleValue', e.target.value)}
                                    placeholder="Style Value"
                                    className="w-full text-sm text-gray-900 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            {/* 
                             Weight field is removed from UI as it is now determined by order.
                             However we might want to still see it or just rely on drag. 
                             User asked for "weight replacement" which implies drag replaces weight editing.
                            */}
                            <div className="col-span-1 md:col-span-3">
                                <label className="text-xs text-gray-500 mb-1 block">Heading Title</label>
                                <input
                                    type="text"
                                    value={item.HeadingTitle}
                                    onChange={(e) => handleItemChange(item.id, 'HeadingTitle', e.target.value)}
                                    placeholder="Heading"
                                    className="w-full text-sm text-gray-900 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div className="col-span-1 md:col-span-3">
                                <label className="text-xs text-gray-500 mb-1 block">SubHeading Title</label>
                                <input
                                    type="text"
                                    value={item.SubHeadingTitle}
                                    onChange={(e) => handleItemChange(item.id, 'SubHeadingTitle', e.target.value)}
                                    placeholder="SubHeading"
                                    className="w-full text-sm text-gray-900 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="absolute -top-2 -right-2 bg-white text-red-500 hover:text-red-700 p-1 rounded-full shadow-sm border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove Item"
                        >
                            <Trash2 size={14} />
                        </button>
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

export default BlockDisplayArrayField;
