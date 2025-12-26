import React from "react";
import { ToggleLeft, CheckCircle2, XCircle } from "lucide-react";

interface RadioFieldProps {
    field: any;
    value: string | number | boolean;
    error?: string;
    onChange: (value: string) => void;
}

const RadioField: React.FC<RadioFieldProps> = ({
    field,
    value,
    error,
    onChange,
}) => {
    // Convert value to string for comparison, handle various truthy/falsy values
    const normalizedValue = (() => {
        if (value === true || value === "1" || value === 1 || value === "true" || value === "Active") {
            return "1";
        }
        if (value === false || value === "0" || value === 0 || value === "false" || value === "Inactive") {
            return "0";
        }
        return "";
    })();

    const isActive = normalizedValue === "1";
    const isInactive = normalizedValue === "0";

    return (
        <div
            key={field.fieldName}
            className="md:grid md:grid-cols-[180px_1fr] md:gap-4 md:items-center space-y-2 md:space-y-0"
        >
            {/* Label */}
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <ToggleLeft size={14} className="text-blue-500" />
                {field.fieldName}
                {field.required && <span className="text-red-500">*</span>}
            </label>

            {/* Radio Buttons */}
            <div className="flex gap-4">
                {/* Active Option */}
                <label
                    className={`flex-1 flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl cursor-pointer 
            transition-all duration-300 border-2 shadow-sm hover:shadow-md
            ${isActive
                            ? "border-green-500 bg-green-50 text-green-700 font-bold"
                            : "border-gray-300 bg-white text-gray-900 hover:border-green-400 hover:bg-green-50 whitespace-nowrap"
                        }`}
                >
                    <input
                        type="radio"
                        name={field.fieldName}
                        value="1"
                        checked={isActive}
                        onChange={(e) => onChange(e.target.value)}
                        className="sr-only"
                    />
                    <CheckCircle2
                        size={20}
                        className={`transition-all duration-200 ${isActive ? "text-green-600" : "text-gray-400"}`}
                    />
                    <span className={`font-semibold ${isActive ? "text-green-700" : "text-gray-900"}`}>
                        Yes
                    </span>
                </label>

                {/* Inactive Option */}
                <label
                    className={`flex-1 flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl cursor-pointer 
            transition-all duration-300 border-2 shadow-sm hover:shadow-md
            ${isInactive
                            ? "border-red-500 bg-red-50 text-red-700 font-bold"
                            : "border-gray-300 bg-white text-gray-900 hover:border-red-400 hover:bg-red-50 whitespace-nowrap"
                        }`}
                >
                    <input
                        type="radio"
                        name={field.fieldName}
                        value="0"
                        checked={isInactive}
                        onChange={(e) => onChange(e.target.value)}
                        className="sr-only"
                    />
                    <XCircle
                        size={20}
                        className={`transition-all duration-200 ${isInactive ? "text-red-600" : "text-gray-400"}`}
                    />
                    <span className={`font-semibold ${isInactive ? "text-red-700" : "text-gray-900"}`}>
                        No
                    </span>
                </label>
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

export default RadioField;
