import React from "react";
import { Minus } from "lucide-react";

interface SeparatorFieldProps {
    field: {
        fieldName: string;
        [key: string]: any;
    };
}

const SeparatorField: React.FC<SeparatorFieldProps> = ({ field }) => (
    <div key={field.fieldName} className="py-4">
        <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            <div className="flex items-center gap-2 px-4 py-1.5 bg-gray-100 rounded-full">
                <Minus size={12} className="text-gray-400" />
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {field.fieldName || "Section"}
                </span>
                <Minus size={12} className="text-gray-400" />
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
        </div>
    </div>
);

export default SeparatorField;
