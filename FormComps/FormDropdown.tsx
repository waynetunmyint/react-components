import React from "react";
import { ChevronDown, CheckCircle2, AlertCircle, X, Search } from "lucide-react";
import { IMAGE_URL } from "@/config";

interface FormDropdownProps {
  field: any;
  value: any;
  error?: string;
  required?: boolean;
  options: any[];
  isLoading?: boolean;
  pickerOpen?: boolean;
  setPickerOpen?: (v: any) => void;
  searchTerm?: string;
  setSearchTerm?: (v: any) => void;
  onChange: (value: any) => void;
  gridInput?: boolean;
}

export default function FormDropdown({
  field,
  value,
  error,
  required,
  options,
  isLoading,
  pickerOpen,
  setPickerOpen,
  searchTerm,
  setSearchTerm,
  onChange,
  gridInput,
}: FormDropdownProps) {
  const filteredOpts = searchTerm
    ? options.filter((opt) => {
      const name = (opt.Name ?? opt.Title ?? opt.Label ?? "").toLowerCase();
      return name.includes(searchTerm.toLowerCase());
    })
    : options;

  return (
    <div className="md:grid md:grid-cols-[180px_1fr] md:gap-3 md:items-center space-y-2 md:space-y-0">
      <label className="block text-sm font-semibold text-gray-700">
        {field.fieldName}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {isLoading ? (
        <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
      ) : (
        <button
          type="button"
          onClick={() => setPickerOpen && setPickerOpen((p: any) => ({ ...p, [field.fieldName]: true }))}
          className={`w-full flex justify-between items-center px-4 py-3 rounded-xl transition-all duration-200 ${value
            ? "border-2 border-blue-500 bg-blue-50 text-gray-900"
            : "border-2 border-gray-300 bg-white text-gray-500 hover:border-blue-400"
            } focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
        >
          <span className="flex items-center gap-3">
            {(() => {
              const selectedOpt = options?.find(
                (opt: any) => (opt.Id ?? opt.id) === value
              );
              if (selectedOpt) {
                return (
                  <>
                    {selectedOpt.Thumbnail && (
                      <img
                        src={IMAGE_URL + "/uploads/" + selectedOpt.Thumbnail}
                        alt={selectedOpt.Name ?? selectedOpt.Title ?? ""}
                        className="w-8 h-8 rounded-lg object-cover border-2 border-white shadow-sm"
                      />
                    )}
                    <span className="font-medium">
                      {selectedOpt.Name ?? selectedOpt.Title ?? selectedOpt.Label ?? "Unnamed"}
                    </span>
                  </>
                );
              }
              return <span className="text-gray-400">Select {field.fieldName}</span>;
            })()}
          </span>
          <ChevronDown size={20} className={value ? "" : "text-gray-400"} />
        </button>
      )}
      {pickerOpen && !isLoading && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
            <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 border-b border-blue-800">
              <h3 className="text-xl font-semibold text-white">Select {field.fieldName}</h3>
              <button
                type="button"
                onClick={() => {
                  setPickerOpen && setPickerOpen((p: any) => ({ ...p, [field.fieldName]: false }));
                  setSearchTerm && setSearchTerm("");
                }}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            {/* Search */}
            {options.length > 5 && (
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm ?? ""}
                    onChange={(e) => setSearchTerm && setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
            <div className="max-h-96 overflow-y-auto">
              {filteredOpts.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Search size={32} className="mx-auto mb-2 text-gray-400" />
                  <p>No options found</p>
                </div>
              ) : (
                filteredOpts.map((opt: any) => {
                  const valOpt = opt.id ?? opt.Id;
                  const name = opt.Name ?? opt.Title ?? opt.Label ?? valOpt;
                  const isSelected = value === valOpt;
                  return (
                    <div key={valOpt} className={`p-2`}>
                      {gridInput ? (
                        <div
                          className={`cursor-pointer p-4 rounded-lg border-2 transition-all text-center ${isSelected ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold' : 'border-gray-200 hover:border-blue-300'}`}
                          onClick={() => {
                            onChange(valOpt);
                            setPickerOpen && setPickerOpen((p: any) => ({ ...p, [field.fieldName]: false }));
                            setSearchTerm && setSearchTerm("");
                          }}
                        >
                          {opt.Thumbnail && (
                            <img
                              src={IMAGE_URL + "/uploads/" + opt.Thumbnail}
                              alt={name}
                              className="mx-auto mb-2 w-16 h-16 rounded-md object-cover border-2 border-gray-200"
                            />
                          )}
                          <div className="text-sm">{name}</div>
                        </div>
                      ) : (
                        <div
                          className={`flex items-center gap-3 px-6 py-4 cursor-pointer transition-all ${isSelected
                            ? "bg-blue-50 text-blue-700 font-semibold"
                            : "text-gray-800 hover:bg-gray-50"
                            }`}
                          onClick={() => {
                            onChange(valOpt);
                            setPickerOpen && setPickerOpen((p: any) => ({ ...p, [field.fieldName]: false }));
                            setSearchTerm && setSearchTerm("");
                          }}
                        >
                          {opt.Thumbnail && (
                            <img
                              src={IMAGE_URL + "/uploads/" + opt.Thumbnail}
                              alt={name}
                              className="w-10 h-10 rounded-lg object-cover border-2 border-gray-200"
                            />
                          )}
                          <span className="flex-1">{name}</span>
                          {isSelected && <CheckCircle2 className="" size={20} />}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-1 text-red-600 text-sm">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
