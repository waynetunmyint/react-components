import React from "react";
import { AlertCircle, AlignLeft } from "lucide-react";

interface TextareaFieldProps {
  field: {
    fieldName: string;
    required?: boolean;
    defaultValue?: string;
  };
  value: string;
  error?: string;
  onChange: (val: string) => void;
}

const TextareaField: React.FC<TextareaFieldProps> = ({ field, value, error, onChange }) => (
  <div key={field.fieldName} className="md:grid md:grid-cols-[180px_1fr] md:gap-4 md:items-start space-y-2 md:space-y-0">
    {/* Label */}
    <div className="md:pt-3">
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <AlignLeft size={14} className="text-indigo-500" />
        {field.fieldName}
        {field.required && <span className="text-red-500">*</span>}
      </label>
      <span className="text-xs text-gray-400 ml-6">{value?.length || 0} chars</span>
    </div>

    {/* Textarea */}
    <div>
      <textarea
        rows={5}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Enter ${field.fieldName.toLowerCase()}...`}
        className={`w-full border-2 bg-white text-gray-900 rounded-xl px-4 py-3 transition-all duration-200 shadow-sm hover:shadow-md focus:shadow-md focus:ring-4 focus:ring-indigo-500/20 focus:outline-none resize-none ${error
          ? "border-red-400 bg-red-50"
          : value
            ? "border-indigo-500 bg-indigo-50"
            : "border-gray-200 hover:border-indigo-400 focus:border-indigo-500"
          }`}
        required={field.required}
      />
      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm mt-2 bg-red-50 px-3 py-2 rounded-lg">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  </div>
);

export default TextareaField;
