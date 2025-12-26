import React from "react";
import { AlertCircle, Mail } from "lucide-react";

interface EmailFieldProps {
  field: {
    fieldName: string;
    required?: boolean;
    defaultValue?: string;
  };
  value: string;
  error?: string;
  onChange: (val: string) => void;
}

const EmailField: React.FC<EmailFieldProps> = ({ field, value, error, onChange }) => (
  <div key={field.fieldName} className="md:grid md:grid-cols-[180px_1fr] md:gap-4 md:items-center space-y-2 md:space-y-0">
    {/* Label */}
    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
      <Mail size={14} className="text-emerald-500" />
      {field.fieldName}
      {field.required && <span className="text-red-500">*</span>}
    </label>

    {/* Input */}
    <div>
      <div className="relative">
        <input
          type="email"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Enter ${field.fieldName.toLowerCase()}...`}
          pattern="^[^@\s]+@[^@\s]+\.[^@\s]+$"
          className={`w-full border-2 bg-white text-gray-900 rounded-xl px-4 py-3 transition-all duration-200 shadow-sm hover:shadow-md focus:shadow-md focus:ring-4 focus:ring-emerald-500/20 focus:outline-none ${error
            ? "border-red-400 bg-red-50"
            : value
              ? "border-emerald-500 bg-emerald-50"
              : "border-gray-200 hover:border-emerald-400 focus:border-emerald-500"
            }`}
          required={field.required}
        />
        {value && !error && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-green-500"></div>
        )}
      </div>
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

export default EmailField;
