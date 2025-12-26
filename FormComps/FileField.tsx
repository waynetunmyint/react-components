import React from "react";
import { Upload, CheckCircle, AlertCircle, Paperclip } from "lucide-react";

interface FileFieldProps {
  field: any;
  dataSource: string;
  error?: string;
  fileInputs: Record<string, string>;
  handleFileChange: (field: string, file: File | null) => void;
}

const FileField: React.FC<FileFieldProps> = ({
  field,
  dataSource,
  error,
  fileInputs,
  handleFileChange,
}) => {
  const hasFile = !!fileInputs[field.fieldName];

  return (
    <div key={field.fieldName} className="md:grid md:grid-cols-[180px_1fr] md:gap-4 md:items-center space-y-2 md:space-y-0">
      {/* Label */}
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <Paperclip size={14} className="text-cyan-500" />
        {field.fieldName}
        {field.required && <span className="text-red-500">*</span>}
      </label>

      {/* File Upload Area */}
      <div>
        <input
          id={`file-input-${dataSource}-${field.fieldName}`}
          type="file"
          onChange={(e) => handleFileChange(field.fieldName, e.target.files?.[0] ?? null)}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => document.getElementById(`file-input-${dataSource}-${field.fieldName}`)?.click()}
          className={`w-full border-2 border-dashed rounded-xl px-4 py-4 transition-all duration-300 flex items-center gap-3 ${hasFile
            ? "border-cyan-500 bg-cyan-50 shadow-md shadow-cyan-500/20"
            : error
              ? "border-red-400 bg-red-50"
              : "border-gray-300 bg-white hover:border-cyan-400 hover:bg-cyan-50 hover:shadow-md"
            }`}
        >
          {hasFile ? (
            <>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md">
                <CheckCircle className="text-white" size={20} />
              </div>
              <div className="text-left flex-1">
                <span className="text-sm text-gray-900 font-semibold block">File uploaded!</span>
                <span className="text-xs text-cyan-600">Click to replace</span>
              </div>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center">
                <Upload className={error ? "text-red-500" : "text-cyan-500"} size={20} />
              </div>
              <div className="text-left flex-1">
                <span className="text-sm text-gray-900 font-semibold block">Upload {field.fieldName}</span>
                <span className="text-xs text-gray-400">Click to browse</span>
              </div>
            </>
          )}
        </button>

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
};

export default FileField;
