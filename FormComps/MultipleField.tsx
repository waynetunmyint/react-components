import React from "react";
import { CheckCircle2, CheckSquare, Square } from "lucide-react";

interface MultipleFieldProps {
    field: {
        fieldName: string;
        required?: boolean;
        [key: string]: any;
    };
    camel: string;
    selectedValues: any[];
    dropdownOptions: { [key: string]: any[] };
    setFormData: (fn: (p: any) => any) => void;
}

const MultipleField: React.FC<MultipleFieldProps> = ({
    field,
    camel,
    selectedValues,
    dropdownOptions,
    setFormData,
}) => {
    const opts = dropdownOptions[field.fieldName] ?? [];

    return (
        <div key={field.fieldName} className="md:grid md:grid-cols-[180px_1fr] md:gap-4 md:items-start space-y-2 md:space-y-0">
            {/* Label */}
            <div className="md:pt-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <CheckSquare size={14} className="text-violet-500" />
                    {field.fieldName}
                    {field.required && <span className="text-red-500">*</span>}
                </label>
                <span className={`text-xs mt-1 block ${selectedValues.length > 0 ? "text-violet-600" : "text-gray-400"
                    }`}>
                    {selectedValues.length} selected
                </span>
            </div>

            {/* Options Grid */}
            <div className="flex flex-wrap gap-2 p-3 border-2 border-gray-200 rounded-xl bg-gradient-to-br from-gray-50 to-white max-h-48 overflow-y-auto">
                {opts.length === 0 ? (
                    <div className="w-full text-center py-4 text-gray-400">
                        <Square size={24} className="mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No options</p>
                    </div>
                ) : (
                    opts.map((o) => {
                        const valOpt = o.Id ?? o.id ?? o.value ?? "";
                        const name = o.Name ?? o.Title ?? o.Label ?? valOpt;
                        const checked = selectedValues.map(String).includes(String(valOpt));
                        return (
                            <label
                                key={valOpt}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer transition-all duration-200 select-none text-sm ${checked
                                    ? "border-violet-500 bg-gradient-to-r from-violet-50 to-purple-50 shadow-sm"
                                    : "border-gray-200 bg-white hover:border-violet-300 hover:bg-violet-50/50"
                                    }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={(e) => {
                                        let updated: any[] = [];
                                        if (e.target.checked) updated = [...selectedValues, valOpt];
                                        else updated = selectedValues.filter((v) => String(v) !== String(valOpt));
                                        setFormData((p) => ({ ...p, [camel]: updated }));
                                    }}
                                    className="sr-only"
                                />
                                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${checked
                                    ? "bg-violet-500 border-violet-500"
                                    : "border-gray-300 bg-white"
                                    }`}>
                                    {checked && <CheckCircle2 className="text-white" size={12} />}
                                </div>
                                <span className={`font-medium truncate ${checked ? "text-violet-700" : "text-gray-900"}`}>
                                    {name}
                                </span>
                            </label>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default MultipleField;
