import React, { useState, useMemo } from "react";
import { ChevronDown, Search } from "lucide-react";
import * as LucideIcons from "lucide-react";

interface IconDropdownFieldProps {
    field: any;
    value: string;
    error?: string;
    onChange: (value: string) => void;
}

const IconDropdownField: React.FC<IconDropdownFieldProps> = ({
    field,
    value,
    error,
    onChange,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Get all icon names
    const iconNames = useMemo(() => {
        return Object.keys(LucideIcons).filter(key => {
            // Basic filtering of non-icon exports
            if (key === "icons" || key === "createLucideIcon" || key === "default") return false;
            // Ensure it's a component (function/object)
            const item = (LucideIcons as any)[key];
            return typeof item === 'object' || typeof item === 'function';
        });
    }, []);

    const filteredIcons = useMemo(() => {
        return iconNames.filter((name) =>
            name.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 100); // Limit to 100 icons for performance
    }, [iconNames, searchTerm]);

    // render the selected icon
    const SelectedIcon = value && (LucideIcons as any)[value] ? (LucideIcons as any)[value] : null;

    return (
        <div
            key={field.fieldName}
            className="md:grid md:grid-cols-[180px_1fr] md:gap-4 md:items-center space-y-2 md:space-y-0"
        >
            {/* Label */}
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Search size={14} className="text-blue-500" />
                {field.fieldName}
                {field.required && <span className="text-red-500">*</span>}
            </label>

            {/* Dropdown Area */}
            <div className="relative">
                {/* Trigger */}
                <div
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full flex items-center justify-between border-2 bg-white text-gray-900 rounded-xl px-4 py-3 cursor-pointer
            focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500
            transition-all duration-200 shadow-sm hover:shadow-md
            ${error ? "border-red-500" : isOpen ? "border-blue-500" : "border-gray-300 hover:border-blue-400"}`}
                >
                    <div className="flex items-center gap-3">
                        {SelectedIcon ? <SelectedIcon size={20} /> : <span className="text-gray-400">Select Icon...</span>}
                        {value && <span className="font-medium">{value}</span>}
                    </div>
                    <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                </div>

                {/* Dropdown Menu */}
                {isOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-2 border-b border-gray-100 bg-gray-50/50">
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search icons..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="overflow-y-auto p-2 grid grid-cols-4 gap-2">
                            {filteredIcons.map((name) => {
                                const IconComp = (LucideIcons as any)[name];
                                // Double check it is a valid element to prevent crashes
                                if (!IconComp || (typeof IconComp !== 'function' && typeof IconComp !== 'object')) return null;

                                return (
                                    <button
                                        key={name}
                                        type="button"
                                        onClick={() => {
                                            onChange(name);
                                            setIsOpen(false);
                                        }}
                                        className={`flex flex-col items-center justify-center gap-2 p-2 rounded-lg hover:bg-blue-50 transition-colors ${value === name ? "bg-blue-100 text-blue-600" : "text-gray-600"}`}
                                        title={name}
                                    >
                                        <IconComp size={24} />
                                        {/* <span className="text-[10px] truncate w-full text-center">{name}</span> */}
                                    </button>
                                )
                            })}
                            {filteredIcons.length === 0 && (
                                <div className="col-span-4 py-4 text-center text-gray-500 text-sm">
                                    No icons found
                                </div>
                            )}
                            {filteredIcons.length === 100 && (
                                <div className="col-span-4 py-2 text-center text-gray-400 text-xs">
                                    Type to search more...
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Error */}
            {error && (
                <div className="md:col-start-2 flex items-center gap-1 text-red-600 text-sm mt-1">
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
};

export default IconDropdownField;
