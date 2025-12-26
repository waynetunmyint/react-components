"use client";
import React, { useEffect, useState } from "react";
import { resizeImage } from "./ImageClient";
import { BASE_URL, IMAGE_URL } from "../../../config";
import { UniversalGetStoredJWT } from "../UniversalComps/UniversalStoredInformationComp";
import {
  Save,
  Upload,
  X,
  ImagePlus,
  CheckCircle2,
  ArrowLeft,
  FileText,
  MapPin,
  Search,
  Loader2,
  AlertCircle,
  ChevronDown,
  Image as ImageIcon,
  File as FileIcon,
} from "lucide-react";

interface Props {
  dataSource: string;
  fields: any[];
  imageSize: string;
}

export default function FormCreateComp({ dataSource, fields, imageSize }: Props) {
  const [formData, setFormData] = useState<any>({});
  const [fileInputs, setFileInputs] = useState<any>({});
  const [dropdownOptions, setDropdownOptions] = useState<{ [key: string]: any[] }>({});
  const [uploadImageBlobs, setUploadImageBlobs] = useState<{ [key: string]: string | null }>({});
  const [latitude, setLatitude] = useState<string>("0");
  const [longitude, setLongitude] = useState<string>("0");
  const [pickerOpen, setPickerOpen] = useState<{ [key: string]: boolean }>({});
  const [searchTerms, setSearchTerms] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const toCamelCase = (str: string) =>
    str.replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : "")).replace(/^(.)/, (m) => m.toLowerCase());

  const fileToBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleImagePicked = async (field: string, file: File | null) => {
    if (!file) return;
    if (file.size > 500 * 1024 * 1024) {
      setErrors((p) => ({ ...p, [field]: "Image too large (max 500MB)" }));
      return;
    }
    try {
      setErrors((p) => ({ ...p, [field]: "" }));
      const base64 = await fileToBase64(file);
      const resized = await resizeImage(base64, imageSize == "large" ? 1600 : 500);
      setUploadImageBlobs((p) => ({ ...p, [field]: resized as string }));
    } catch (err) {
      console.error("Resize error:", err);
      setErrors((p) => ({ ...p, [field]: "Failed to process image" }));
    }
  };

  const handleFileChange = async (field: string, file: File | null) => {
    if (!file) return;
    if (file.size > 500 * 1024 * 1024) {
      setErrors((p) => ({ ...p, [field]: "File too large (max 500MB)" }));
      return;
    }
    try {
      setErrors((p) => ({ ...p, [field]: "" }));
      const base64Blob = await fileToBase64(file);
      setFileInputs((p: any) => ({ ...p, [field]: base64Blob }));
    } catch (err) {
      console.error("File convert error:", err);
      setErrors((p) => ({ ...p, [field]: "Failed to process file" }));
    }
  };

  useEffect(() => {
    fields.forEach(async (field) => {
      if (field.type === "dropdown" || field.type === "multiple") {
        try {
          const url = field.customAPI
            ? `${BASE_URL}${field.customAPI}`
            : `${BASE_URL}/${toCamelCase(field.fieldName)}/api`;

          const res = await fetch(url);
          const data = await res.json();

          console.log(`Fetched dropdown data for ${field.fieldName}: dropdown/checkbox`, data);

          let normalizedData: any[] = [];

          if (Array.isArray(data)) {
            normalizedData = data;
          } else if (Array.isArray(data?.items)) {
            normalizedData = data.items;
          } else if (Array.isArray(data?.data)) {
            normalizedData = data.data;
          } else if (Array.isArray(data?.results)) {
            normalizedData = data.results;
          } else if (Array.isArray(data?.rows)) {
            normalizedData = data.rows;
          } else if (typeof data === "object" && data !== null) {
            normalizedData = [data];
          } else {
            normalizedData = [];
          }

          setDropdownOptions((prev) => ({
            ...prev,
            [field.fieldName]: normalizedData,
          }));
        } catch (err) {
          console.error(`Dropdown fetch failed for ${field.fieldName}`, err);
          setDropdownOptions((prev) => ({ ...prev, [field.fieldName]: [] }));
        }
      }
    });
  }, [fields]);

  const handleChange = (field: string, value: any) => {
    setFormData((p: any) => ({ ...p, [toCamelCase(field)]: value }));
    setTouched((p) => ({ ...p, [field]: true }));
    setErrors((p) => ({ ...p, [field]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const submitData = new FormData();

      fields.forEach((field) => {
        const camel = toCamelCase(field.fieldName);
        const value = formData[camel];

        switch (field.type) {
          case "dropdown":
            submitData.append(camel + "Id", value || "");
            break;
          case "multiple":
            submitData.append(camel + "Ids", (value || []).join(","));
            break;
          case "image":
            if (uploadImageBlobs[field.fieldName]) submitData.append(camel, uploadImageBlobs[field.fieldName]!);
            break;
          case "file":
            if (fileInputs[field.fieldName]) submitData.append(camel, fileInputs[field.fieldName]);
            break;
          case "hidden":
            submitData.append(camel, field.defaultValue ?? "");
            break;
          case "map":
            submitData.append("latitude", latitude);
            submitData.append("longitude", longitude);
            break;
          default:
            submitData.append(camel, value || "");
        }
      });

      const token = UniversalGetStoredJWT();
      if (!token) throw new Error("JWT token not found");
      const res = await fetch(`${BASE_URL}/${dataSource}/api`, {
        method: "POST",
        body: submitData,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Submission failed");

      // Brief success indication before redirect
      setTimeout(() => {
        window.location.href = `/${dataSource}`;
      }, 500);
    } catch (err) {
      console.error("Submit error", err);
      setErrors({ submit: "Failed to create entry. Please try again." });
      setLoading(false);
    }
  };

  // Filter dropdown options based on search
  const getFilteredOptions = (fieldName: string) => {
    const opts = dropdownOptions[fieldName] ?? [];
    const search = searchTerms[fieldName]?.toLowerCase() ?? "";
    if (!search) return opts;

    return opts.filter((opt) => {
      const name = (opt.Name ?? opt.Title ?? opt.Label ?? "").toLowerCase();
      return name.includes(search);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white px-8 py-6 rounded-2xl shadow-2xl text-center animate-in zoom-in-95 duration-200">
            <div className="relative mx-auto mb-4 w-16 h-16">
              <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
            <p className="text-xl font-semibold text-gray-900 mb-1">Creating Entry</p>
            <p className="text-sm text-gray-600">Please wait while we save your data...</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back</span>
          </button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Create New <span className="">{dataSource}</span>
              </h1>
              <p className="text-gray-600">Fill in the information below to create a new entry</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
              <FileText className="text-white" size={28} />
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            {/* Image Upload Section */}
            {fields.some((f) => f.type === "image") && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ImageIcon size={20} className="" />
                  Images
                </h3>
                <div className="flex flex-wrap gap-4">
                  {fields
                    .filter((f) => f.type === "image")
                    .map((field) => {
                      const camel = toCamelCase(field.fieldName);
                      const error = errors[field.fieldName];
                      return (
                        <div key={field.fieldName} className="space-y-2">
                          <div
                            className={`group relative border-2 border-dashed rounded-xl w-40 h-40 flex items-center justify-center cursor-pointer overflow-hidden transition-all duration-300 ${uploadImageBlobs[field.fieldName] || formData[camel]
                              ? "border-blue-500 bg-blue-50"
                              : error
                                ? "border-red-500 bg-red-50"
                                : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50"
                              }`}
                            onClick={() => document.getElementById(`file-${field.fieldName}`)?.click()}
                          >
                            {uploadImageBlobs[field.fieldName] || formData[camel] ? (
                              <>
                                <img
                                  src={
                                    uploadImageBlobs[field.fieldName] ||
                                    `${BASE_URL}/uploads/${formData[camel]}`
                                  }
                                  alt={field.fieldName}
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setUploadImageBlobs((p) => ({ ...p, [field.fieldName]: null }));
                                  }}
                                  className="absolute top-2 right-2 z-10 bg-white rounded-full p-1.5 shadow-lg hover:bg-red-50 hover:text-red-600 transition-colors"
                                >
                                  <X size={16} />
                                </button>
                              </>
                            ) : (
                              <div className="text-center p-3">
                                <ImagePlus
                                  className={`mx-auto mb-2 ${error ? "text-red-500" : "text-gray-400 group-hover:text-blue-500"
                                    } transition-colors`}
                                  size={32}
                                />
                                <span className="text-xs text-gray-600 font-medium block">{field.fieldName}</span>
                                <span className="text-xs text-gray-400 block mt-1">Click to upload</span>
                              </div>
                            )}
                            <input
                              id={`file-${field.fieldName}`}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleImagePicked(field.fieldName, e.target.files?.[0] ?? null)}
                            />
                          </div>
                          {error && (
                            <div className="flex items-center gap-1 text-red-600 text-xs">
                              <AlertCircle size={12} />
                              <span>{error}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Other Fields */}
            <div className="space-y-6">
              {fields
                .filter((f) => f.type !== "image")
                .map((field) => {
                  const camel = toCamelCase(field.fieldName);
                  const val = formData[camel] || "";
                  const error = errors[field.fieldName];

                  switch (field.type) {

                    case "multiple": {
                      const selectedValues: any[] = formData[camel] || [];
                      const opts = dropdownOptions[field.fieldName] ?? [];
                      return (
                        <div key={field.fieldName} className="space-y-3">
                          <label className="block text-lg font-semibold text-gray-800 mb-3">
                            {field.fieldName}
                            <span className="ml-2 text-sm font-normal text-gray-500">
                              ({selectedValues.length} selected)
                            </span>
                          </label>
                          <div className="flex flex-wrap gap-3  overflow-y-auto border-2 border-gray-200 p-4 rounded-xl bg-gray-50">
                            {opts.map((o) => {
                              const valOpt = o.Id ?? o.id ?? o.value ?? "";
                              const name = o.Name ?? o.Title ?? o.Label ?? valOpt;
                              const checked = selectedValues.includes(valOpt);
                              return (
                                <label
                                  key={valOpt}
                                  className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${checked
                                    ? "border-blue-500 bg-blue-50 shadow-md"
                                    : "border-gray-300 bg-white hover:border-blue-300 hover:bg-blue-50"
                                    }`}
                                >
                                  <div className="relative flex items-center justify-center">
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={(e) => {
                                        let updated: any[] = [];
                                        if (e.target.checked) updated = [...selectedValues, valOpt];
                                        else updated = selectedValues.filter((v) => v !== valOpt);
                                        setFormData((p) => ({ ...p, [camel]: updated }));
                                      }}
                                      className="w-5 h-5 rounded border-2 border-gray-400  focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer transition-all"
                                    />
                                    {checked && (
                                      <CheckCircle2 className="absolute w-5 h-5  pointer-events-none" />
                                    )}
                                  </div>
                                  <span className={`text-sm font-medium ${checked ? "text-blue-700" : "text-gray-700"}`}>
                                    {name}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }



                    case "dropdown": {
                      const options = dropdownOptions[field.fieldName] || [];
                      const selectedValue = formData[camel] || "";
                      const isLoading = !dropdownOptions[field.fieldName];
                      const filteredOpts = getFilteredOptions(field.fieldName);

                      return (
                        <div key={field.fieldName} className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            {field.fieldName}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </label>

                          {isLoading ? (
                            <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
                          ) : (
                            <button
                              type="button"
                              onClick={() => setPickerOpen((p) => ({ ...p, [field.fieldName]: true }))}
                              className={`w-full flex justify-between items-center px-4 py-3 rounded-xl transition-all duration-200 ${selectedValue
                                ? "border-2 border-blue-500 bg-blue-50 text-gray-900"
                                : "border-2 border-gray-300 bg-white text-gray-500 hover:border-blue-400"
                                } focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                            >
                              <span className="flex items-center gap-3">
                                {(() => {
                                  const selectedOpt = options?.find(
                                    (opt: any) => (opt.Id ?? opt.id) === selectedValue
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
                              <ChevronDown size={20} className={selectedValue ? "" : "text-gray-400"} />
                            </button>
                          )}

                          {pickerOpen[field.fieldName] && !isLoading && (
                            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                              <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
                                <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 border-b border-blue-800">
                                  <h3 className="text-xl font-semibold text-white">Select {field.fieldName}</h3>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setPickerOpen((p) => ({ ...p, [field.fieldName]: false }));
                                      setSearchTerms((p) => ({ ...p, [field.fieldName]: "" }));
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
                                        value={searchTerms[field.fieldName] ?? ""}
                                        onChange={(e) => setSearchTerms((p) => ({ ...p, [field.fieldName]: e.target.value }))}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                      const isSelected = selectedValue === valOpt;
                                      return (
                                        <div
                                          key={valOpt}
                                          className={`flex items-center gap-3 px-6 py-4 cursor-pointer transition-all ${isSelected
                                            ? "bg-blue-50 text-blue-700 font-semibold"
                                            : "text-gray-800 hover:bg-gray-50"
                                            }`}
                                          onClick={() => {
                                            handleChange(field.fieldName, valOpt);
                                            setPickerOpen((p) => ({ ...p, [field.fieldName]: false }));
                                            setSearchTerms((p) => ({ ...p, [field.fieldName]: "" }));
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
                                      );
                                    })
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    }

                    case "text":
                    case "number":
                    case "email":
                      return (
                        <div key={field.fieldName} className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            {field.fieldName}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </label>
                          <input
                            type={field.type}
                            value={field.defaultValue || val}
                            onChange={(e) => handleChange(field.fieldName, e.target.value)}
                            placeholder={`Enter ${field.fieldName.toLowerCase()}`}
                            className={`w-full border-2 bg-white text-gray-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${error ? "border-red-500" : "border-gray-300"
                              }`}
                            required={field.required}
                          />
                          {error && (
                            <div className="flex items-center gap-1 text-red-600 text-sm">
                              <AlertCircle size={14} />
                              <span>{error}</span>
                            </div>
                          )}
                        </div>
                      );

                    case "textarea":
                      return (
                        <div key={field.fieldName} className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            {field.fieldName}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </label>
                          <textarea
                            rows={5}
                            value={val}
                            onChange={(e) => handleChange(field.fieldName, e.target.value)}
                            placeholder={`Enter ${field.fieldName.toLowerCase()}`}
                            className={`w-full border-2 bg-white text-gray-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${error ? "border-red-500" : "border-gray-300"
                              }`}
                            required={field.required}
                          />
                          {error && (
                            <div className="flex items-center gap-1 text-red-600 text-sm">
                              <AlertCircle size={14} />
                              <span>{error}</span>
                            </div>
                          )}
                        </div>
                      );

                    case "file":
                      return (
                        <div key={field.fieldName} className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <FileIcon size={16} className="" />
                            {field.fieldName}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </label>
                          <div className="relative">
                            <input
                              id={`file-input-${field.fieldName}`}
                              type="file"
                              onChange={(e) => handleFileChange(field.fieldName, e.target.files?.[0] ?? null)}
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={() => document.getElementById(`file-input-${field.fieldName}`)?.click()}
                              className={`w-full border-2 border-dashed rounded-xl px-4 py-6 transition-all flex flex-col items-center gap-2 ${fileInputs[field.fieldName]
                                ? "border-blue-500 bg-blue-50"
                                : error
                                  ? "border-red-500 bg-red-50"
                                  : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50"
                                }`}
                            >
                              <Upload className={fileInputs[field.fieldName] ? "" : "text-gray-400"} size={32} />
                              <span className="text-sm text-gray-700 font-medium">
                                {fileInputs[field.fieldName] ? "✓ File uploaded" : `Upload ${field.fieldName}`}
                              </span>
                            </button>
                            {error && (
                              <div className="flex items-center gap-1 text-red-600 text-sm mt-1">
                                <AlertCircle size={14} />
                                <span>{error}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );

                    case "map":
                      return (
                        <div key={field.fieldName} className="space-y-3">
                          <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <MapPin size={18} className="" />
                            {field.fieldName}
                          </label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="block text-xs font-medium text-gray-600">Latitude</label>
                              <input
                                type="text"
                                value={latitude}
                                onChange={(e) => setLatitude(e.target.value)}
                                placeholder="Enter latitude"
                                className="w-full border-2 border-gray-300 bg-white text-gray-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="block text-xs font-medium text-gray-600">Longitude</label>
                              <input
                                type="text"
                                value={longitude}
                                onChange={(e) => setLongitude(e.target.value)}
                                placeholder="Enter longitude"
                                className="w-full border-2 border-gray-300 bg-white text-gray-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      );

                    case "hidden":
                      return <input key={field.fieldName} type="hidden" value={field.defaultValue || val} />;

                    default:
                      return null;
                  }
                })}
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="mt-6 bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                <span className="text-red-700 font-medium">{errors.submit}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-4 pt-8 mt-8 border-t-2 border-gray-100">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex items-center gap-3 px-8 py-3 rounded-xl font-semibold transition-all shadow-lg ${loading
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:shadow-xl transform hover:-translate-y-0.5"
                  }`}
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Save
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}