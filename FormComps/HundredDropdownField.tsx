import React from "react";
import { Hash, ChevronDown } from "lucide-react";

interface HundredDropdownFieldProps {
    field: any;
    value: string | number;
    error?: string;
    onChange: (value: string) => void;
}

const HundredDropdownField: React.FC<HundredDropdownFieldProps> = ({
    field,
    value,
    error,
    onChange,
}) => {
    // Generate options 1-100
    const options = Array.from({ length: 100 }, (_, i) => i + 1);

    return (
        <div
            key={field.fieldName}
            className="md:grid md:grid-cols-[180px_1fr] md:gap-4 md:items-center space-y-2 md:space-y-0"
        >
            {/* Label */}
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Hash size={14} className="text-blue-500" />
                {field.fieldName}
                {field.required && <span className="text-red-500">*</span>}
            </label>

            {/* Dropdown */}
            <div className="relative">
                <select
                    value={value ?? ""}
                    onChange={(e) => onChange(e.target.value)}
                    className={`w-full appearance-none border-2 bg-white text-gray-900 rounded-xl px-4 py-3 pr-10 
            focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none
            transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer
            ${error ? "border-red-500" : value ? "border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50" : "border-gray-300 hover:border-blue-400"}`}
                    required={field.required}
                >
                    <option value="">Select {field.fieldName}...</option>
                    {options.map((num) => (
                        <option key={num} value={num}>
                            {num}
                        </option>
                    ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <div className={`p-1 rounded-lg ${value ? "bg-blue-100" : "bg-gray-100"}`}>
                        <ChevronDown size={16} className={value ? "text-blue-600" : "text-gray-400"} />
                    </div>
                </div>
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

export default HundredDropdownField;
