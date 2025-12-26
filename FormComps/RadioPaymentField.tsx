import React from "react";
import { ToggleLeft, CheckCircle2, XCircle, DollarSign, AlertCircle } from "lucide-react";

interface RadioFieldProps {
    field: any;
    value: string | number | boolean;
    error?: string;
    onChange: (value: string) => void;
}

const RadioPaymentField: React.FC<RadioFieldProps> = ({
    field,
    value,
    error,
    onChange,
}) => {
    // Normalize value to string "0", "1", "2"
    const normalizedValue = (() => {
        const v = String(value);
        if (v === "1" || v === "Active" || v === "true") return "1";
        if (v === "2" || v === "Paid") return "2";
        if (v === "0" || v === "Invalid" || v === "false" || v === "Inactive") return "0";
        return "0"; // default to Invalid if unknown? or empty
    })();

    const isInvalid = normalizedValue === "0";
    const isActive = normalizedValue === "1";
    const isPaid = normalizedValue === "2";

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

            {/* Radio Buttons Container */}
            <div className="flex gap-4 flex-wrap">

                {/* Option 0: Invalid */}
                <label
                    className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl cursor-pointer 
            transition-all duration-300 border-2 shadow-sm hover:shadow-md
            ${isInvalid
                            ? "border-red-500 bg-red-50 text-red-700 font-bold"
                            : "border-gray-300 bg-white text-gray-900 hover:border-red-400 hover:bg-red-50 whitespace-nowrap"
                        }`}
                >
                    <input
                        type="radio"
                        name={field.fieldName}
                        value="0"
                        checked={isInvalid}
                        onChange={(e) => onChange(e.target.value)}
                        className="sr-only"
                    />
                    <XCircle
                        size={18}
                        className={`transition-all duration-200 ${isInvalid ? "text-red-600" : "text-gray-400"}`}
                    />
                    <span className={`font-semibold text-sm ${isInvalid ? "text-red-700" : "text-gray-900"}`}>
                        Invalid
                    </span>
                </label>

                {/* Option 1: Active */}
                <label
                    className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl cursor-pointer 
            transition-all duration-300 border-2 shadow-sm hover:shadow-md
            ${isActive
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700 font-bold"
                            : "border-gray-300 bg-white text-gray-900 hover:border-emerald-400 hover:bg-emerald-50 whitespace-nowrap"
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
                        size={18}
                        className={`transition-all duration-200 ${isActive ? "text-emerald-600" : "text-gray-400"}`}
                    />
                    <span className={`font-semibold text-sm ${isActive ? "text-emerald-700" : "text-gray-900"}`}>
                        Active
                    </span>
                </label>

                {/* Option 2: Paid */}
                <label
                    className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl cursor-pointer 
            transition-all duration-300 border-2 shadow-sm hover:shadow-md
            ${isPaid
                            ? "border-blue-500 bg-blue-50 text-blue-700 font-bold"
                            : "border-gray-300 bg-white text-gray-900 hover:border-blue-400 hover:bg-blue-50 whitespace-nowrap"
                        }`}
                >
                    <input
                        type="radio"
                        name={field.fieldName}
                        value="2"
                        checked={isPaid}
                        onChange={(e) => onChange(e.target.value)}
                        className="sr-only"
                    />
                    <DollarSign
                        size={18}
                        className={`transition-all duration-200 ${isPaid ? "text-blue-600" : "text-gray-400"}`}
                    />
                    <span className={`font-semibold text-sm ${isPaid ? "text-blue-700" : "text-gray-900"}`}>
                        Paid
                    </span>
                </label>
            </div>

            {/* Error */}
            {error && (
                <div className="md:col-start-2 flex items-center gap-1 text-red-600 text-sm mt-1">
                    <AlertCircle size={14} />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
};

export default RadioPaymentField;
