import React from "react";
import { IMAGE_URL } from "@/config";
import { ChevronDown, X, Search, CheckCircle2, List } from "lucide-react";

interface DropdownFieldProps {
  field: any;
  camel: string;
  formData: any;
  dropdownOptions: any;
  pickerOpen: any;
  setPickerOpen: (fn: (p: any) => any) => void;
  searchTerms: any;
  setSearchTerms: (fn: (p: any) => any) => void;
  getFilteredOptions: (fieldName: string) => any[];
  handleChange: (fieldName: string, value: any) => void;
}

const DropdownField: React.FC<DropdownFieldProps> = ({
  field,
  camel,
  formData,
  dropdownOptions,
  pickerOpen,
  setPickerOpen,
  searchTerms,
  setSearchTerms,
  getFilteredOptions,
  handleChange,
}) => {
  const options = dropdownOptions[field.fieldName] || [];
  // Convert to string for consistent comparison
  const selectedValue = String(formData[camel] ?? "");
  const isLoading = !dropdownOptions[field.fieldName];
  const filteredOpts = getFilteredOptions(field.fieldName);

  // Find selected option with flexible comparison (handles both string and number IDs)
  const findSelectedOption = () => {
    if (!selectedValue || selectedValue === "" || selectedValue === "undefined") return null;
    return options?.find((opt: any) => {
      const optId = String(opt.Id ?? opt.id ?? "");
      return optId === selectedValue;
    });
  };

  const hasSelection = !!findSelectedOption();

  return (
    <div key={field.fieldName} className="md:grid md:grid-cols-[180px_1fr] md:gap-4 md:items-center space-y-2 md:space-y-0">
      {/* Label */}
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <List size={14} className="text-blue-500" />
        {field.fieldName}
        {field.required && <span className="text-red-500">*</span>}
      </label>

      {/* Dropdown Button */}
      <div>
        {isLoading ? (
          <div className="h-14 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl animate-pulse border-2 border-gray-200" />
        ) : (
          <button
            type="button"
            onClick={() => setPickerOpen((p: any) => ({ ...p, [field.fieldName]: true }))}
            className={`w-full border flex justify-between items-center px-4 py-3.5 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md ${hasSelection
              ? "border-2 border-blue-500 bg-blue-50 text-gray-900"
              : "border-2 border-gray-400 bg-white text-gray-900 hover:border-blue-500 hover:bg-blue-50"
              } focus:ring-4 focus:ring-blue-500/20 focus:outline-none`}
          >
            <span className="flex items-center gap-3">
              {(() => {
                const selectedOpt = findSelectedOption();
                if (selectedOpt) {
                  return (
                    <>
                      {selectedOpt.Thumbnail ? (
                        <img
                          src={IMAGE_URL + "/uploads/" + selectedOpt.Thumbnail}
                          alt={selectedOpt.Name ?? selectedOpt.Title ?? ""}
                          className="w-8 h-8 rounded-lg object-cover border-2 border-white shadow-md ring-2 ring-blue-200"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                          <span className="text-white font-bold text-xs">
                            {(selectedOpt.Name ?? selectedOpt.Title ?? "?").charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className="font-semibold text-gray-900">
                        {selectedOpt.Name ?? selectedOpt.Title ?? selectedOpt.Label ?? "Unnamed"}
                      </span>
                    </>
                  );
                }
                return <span className="text-gray-400">Select {field.fieldName}...</span>;
              })()}
            </span>
            <div className={`p-1.5 rounded-lg transition-all duration-200 ${hasSelection ? "bg-blue-100" : "bg-gray-100"}`}>
              <ChevronDown size={16} className={hasSelection ? "text-blue-600" : "text-gray-400"} />
            </div>
          </button>
        )}
      </div>

      {/* Picker Modal */}
      {pickerOpen[field.fieldName] && !isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 border border-gray-200">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700">
              <div>
                <h3 className="text-lg font-bold text-white">Select {field.fieldName}</h3>
                <p className="text-blue-200 text-xs">{options.length} options available</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPickerOpen((p: any) => ({ ...p, [field.fieldName]: false }));
                  setSearchTerms((p: any) => ({ ...p, [field.fieldName]: "" }));
                }}
                className="text-white/80 hover:text-white hover:bg-white/20 rounded-xl p-2.5 transition-all duration-200 hover:rotate-90"
              >
                <X size={20} />
              </button>
            </div>

            {/* Search */}
            {options.length > 5 && (
              <div className="p-4 border-b border-gray-100 bg-gradient-to-b from-gray-50 to-white">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Type to search..."
                    value={searchTerms[field.fieldName] ?? ""}
                    onChange={(e) => setSearchTerms((p: any) => ({ ...p, [field.fieldName]: e.target.value }))}
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Options List */}
            <div className="max-h-80 overflow-y-auto">
              {filteredOpts.length === 0 ? (
                <div className="p-10 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <Search size={28} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No options found</p>
                  <p className="text-gray-400 text-sm mt-1">Try a different search term</p>
                </div>
              ) : (
                <div className="p-2">
                  {filteredOpts.map((opt: any) => {
                    const valOpt = opt.id ?? opt.Id;
                    const name = opt.Name ?? opt.Title ?? opt.Label ?? valOpt;
                    const isSelected = selectedValue === String(valOpt);
                    return (
                      <div
                        key={valOpt}
                        className={`flex items-center gap-4 px-4 py-3.5 cursor-pointer rounded-xl transition-all duration-200 mb-1 ${isSelected
                          ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                          : "text-gray-900 hover:bg-gray-50 border border-transparent hover:border-gray-200"
                          }`}
                        onClick={() => {
                          handleChange(field.fieldName, valOpt);
                          setPickerOpen((p: any) => ({ ...p, [field.fieldName]: false }));
                          setSearchTerms((p: any) => ({ ...p, [field.fieldName]: "" }));
                        }}
                      >
                        {opt.Thumbnail ? (
                          <img
                            src={IMAGE_URL + "/uploads/" + opt.Thumbnail}
                            alt={name}
                            className={`w-10 h-10 rounded-xl object-cover ${isSelected ? "border-2 border-white shadow-md" : "border-2 border-gray-200"}`}
                          />
                        ) : (
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${isSelected ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"}`}>
                            {name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <span className={`block font-medium truncate ${isSelected ? "text-white" : ""}`}>{name}</span>
                          <span className={`text-xs ${isSelected ? "text-blue-100" : "text-gray-400"}`}>ID: {valOpt}</span>
                        </div>
                        {isSelected && (
                          <div className="bg-white rounded-full p-1 shadow-md">
                            <CheckCircle2 className="text-blue-600" size={16} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setPickerOpen((p: any) => ({ ...p, [field.fieldName]: false }));
                  setSearchTerms((p: any) => ({ ...p, [field.fieldName]: "" }));
                }}
                className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DropdownField;
