"use client";
import React, { useEffect, useState } from "react";

import {
  Save,
  Upload,
  X,
  Image as ImageIcon,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronDown,
  Search,
  ArrowLeft,
} from "lucide-react";
import { GetStoredJWT } from "../StorageComps/StorageCompOne";
import { BASE_URL, IMAGE_URL } from "../../../config";


interface Props {
  dataSource: string;
  fields: any[];
  imageSize: string;
}

interface DropdownOptions {
  [key: string]: Array<Record<string, any>>;
}

interface UploadImageBlobs {
  [key: string]: string | null;
}

export default function FormUpdateComp({ dataSource, fields, imageSize }: Props) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [fileInputs, setFileInputs] = useState<Record<string, string>>({});
  const [dropdownOptions, setDropdownOptions] = useState<DropdownOptions>({});
  const [uploadImageBlobs, setUploadImageBlobs] = useState<UploadImageBlobs>({});
  const [latitude, setLatitude] = useState("0");
  const [longitude, setLongitude] = useState("0");
  const [dropdownOpen, setDropdownOpen] = useState<{ [key: string]: boolean }>({});
  const [searchTerms, setSearchTerms] = useState<{ [key: string]: string }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const toCamelCase = (s: string) =>
    s.replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : "")).replace(/^(.)/, (m) => m.toLowerCase());

  const fileToBase64 = (f: File) =>
    new Promise<string>((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result as string);
      r.onerror = rej;
      r.readAsDataURL(f);
    });

  // Load stored item for editing
  useEffect(() => {
    const stored = localStorage.getItem("StoredItem");
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored);
      const camelObj: Record<string, any> = {};

      Object.keys(parsed).forEach((k) => {
        const c = toCamelCase(k);

        if (k.endsWith("Ids") && parsed[k]) {
          const keyName = c.replace(/Ids$/, "");
          camelObj[keyName] = parsed[k].split(",").map((v: string) => parseInt(v, 10));
        } else {
          camelObj[c] = parsed[k];
        }

        if (k.toLowerCase().endsWith("id") && !k.endsWith("Ids")) {
          camelObj[c + "Id"] = parsed[k];
        }
      });

      setFormData(camelObj);

      if (parsed.Latitude && parsed.Longitude) {
        setLatitude(String(parsed.Latitude));
        setLongitude(String(parsed.Longitude));
      }
    } catch (e) {
      console.error("Invalid StoredItem", e);
    }
  }, []);

  // Fetch dropdown options
  useEffect(() => {
    fields.forEach(async (field) => {
      if (field.type === "dropdown" || field.type === "multiple") {
        try {
          const url = field.customAPI
            ? `${BASE_URL}${field.customAPI}`
            : `${BASE_URL}/${toCamelCase(field.fieldName)}/api`;

          const res = await fetch(url);
          const data = await res.json();

          // Normalize backend responses to always produce an array
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
        } catch (e) {
          console.error(`Failed to fetch dropdown for ${field.fieldName}:`, e);
          setDropdownOptions((prev) => ({
            ...prev,
            [field.fieldName]: [],
          }));
        }
      }
    });
  }, [fields]);

  const handleChange = (field: string, value: any, isDropdown = false) => {
    setFormData((p) => ({
      ...p,
      [isDropdown ? toCamelCase(field) + "Id" : toCamelCase(field)]: value,
    }));
    setTouched((p) => ({ ...p, [field]: true }));
  };

  const handleFile = async (field: string, file: File | null, isImg = false) => {
    if (!file) return;
    if (file.size > 500 * 1024 * 1024) {
      setErrors((p) => ({ ...p, [field]: "File too large (max 500MB)" }));
      return;
    }

    setErrors((p) => ({ ...p, [field]: "" }));

    if (isImg) {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const resized = await resizeImage(reader.result, imageSize == "large" ? 1600 : 500);
          setUploadImageBlobs((p) => ({ ...p, [field]: resized as string }));
        } catch (err) {
          console.error("Image resize error:", err);
          setErrors((p) => ({ ...p, [field]: "Failed to process image" }));
        }
      };
      reader.readAsDataURL(file);
    } else {
      const base64 = await fileToBase64(file);
      setFileInputs((p) => ({ ...p, [field]: base64 }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);

    try {
      const fd = new FormData();
      fd.append("id", formData.id || formData.Id || "");

      fields.forEach((f) => {
        const c = toCamelCase(f.fieldName);
        const val = formData[c];
        const ddlVal = formData[c + "Id"];

        switch (f.type) {
          case "dropdown":
            fd.append(c + "Id", ddlVal ?? "");
            break;
          case "multiple":
            fd.append(c + "Ids", (formData[c] || []).join(","));
            break;
          case "image":
            if (uploadImageBlobs[f.fieldName]) fd.append(c, uploadImageBlobs[f.fieldName] as string);
            break;
          case "file":
            if (fileInputs[f.fieldName]) fd.append(c, fileInputs[f.fieldName]);
            break;
          case "hidden":
            fd.append(c, f.defaultValue ?? "");
            break;
          case "map":
            fd.append("latitude", latitude);
            fd.append("longitude", longitude);
            break;
          default:
            fd.append(c, val ?? "");
        }
      });

      const token = GetStoredJWT();
      if (!token) throw new Error("JWT token not found");
      const res = await fetch(`${BASE_URL}/${dataSource}/api`, {
        method: "PATCH",
        body: fd,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Update failed, please try again");

      // Show success message briefly before redirect
      setTimeout(() => {
        window.location.href = `/${dataSource}`;
      }, 500);
    } catch (e) {
      console.error(e);
      setErrors({ submit: "Update failed. Please try again." });
    } finally {
      setIsSaving(false);
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back</span>
          </button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Update <span className="">{dataSource}</span>
              </h1>
              <p className="text-gray-600">Make changes to the information below</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-xl">
              <FileText className="" size={28} />
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="space-y-6">
              {fields.map((f) => {
                const c = toCamelCase(f.fieldName);
                const val = formData[c] || "";
                const opts = dropdownOptions[f.fieldName] ?? [];
                const error = errors[f.fieldName];

                const Label = (
                  <label className="text-sm font-semibold text-gray-700">
                    {f.fieldName}
                    {f.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                );

                // Left-label layout: label in first column, control in second column
                const LeftLayout = (control: React.ReactNode) => (
                  <div key={f.fieldName} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                    <div className="col-span-1">{Label}</div>
                    <div className="col-span-2">{control}</div>
                  </div>
                );

                switch (f.type) {
                  case "text":
                  case "email":
                  case "number":
                    return LeftLayout(
                      <>
                        <input
                          type={f.type}
                          value={val}
                          onChange={(e) => handleChange(f.fieldName, e.target.value)}
                          className={`w-full border rounded-xl px-4 py-3 bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                            error ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder={`Enter ${f.fieldName.toLowerCase()}`}
                        />
                        {error && (
                          <div className="flex items-center gap-1 text-red-600 text-sm mt-2">
                            <AlertCircle size={14} />
                            <span>{error}</span>
                          </div>
                        )}
                      </>
                    );

                  case "textarea":
                    return LeftLayout(
                      <>
                        <textarea
                          value={val}
                          onChange={(e) => handleChange(f.fieldName, e.target.value)}
                          rows={5}
                          className={`w-full border rounded-xl px-4 py-3 bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${
                            error ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder={`Enter ${f.fieldName.toLowerCase()}`}
                        />
                        {error && (
                          <div className="flex items-center gap-1 text-red-600 text-sm mt-2">
                            <AlertCircle size={14} />
                            <span>{error}</span>
                          </div>
                        )}
                      </>
                    );

                  case "dropdown": {
                    const sel = String(formData[c + "Id"] ?? "");
                    const selectedOption = opts.find((opt) => String(opt.Id ?? opt.id) === sel);
                    const filteredOpts = getFilteredOptions(f.fieldName);

                    return LeftLayout(
                      <>
                        <button
                          type="button"
                          onClick={() => setDropdownOpen((p) => ({ ...p, [f.fieldName]: true }))}
                          className={`w-full rounded-xl px-4 py-3 text-left transition-all flex items-center justify-between ${
                            sel
                              ? "bg-blue-50 border-2 border-blue-500 text-blue-900"
                              : "bg-white border border-gray-300 text-gray-600 hover:border-gray-400"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            {selectedOption?.Thumbnail && (
                              <img
                                src={IMAGE_URL + "/uploads/" + selectedOption.Thumbnail}
                                alt=""
                                className="w-6 h-6 rounded object-cover"
                              />
                            )}
                            {selectedOption?.Name ?? selectedOption?.Title ?? `Select ${f.fieldName}`}
                          </span>
                          <ChevronDown size={20} className={sel ? "" : "text-gray-400"} />
                        </button>

                        {dropdownOpen[f.fieldName] && (
                          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
                              {/* Header */}
                              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                                <h3 className="text-lg font-semibold text-gray-900">Select {f.fieldName}</h3>
                                <button
                                  type="button"
                                  onClick={() => setDropdownOpen((p) => ({ ...p, [f.fieldName]: false }))}
                                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                  <X size={20} className="text-gray-600" />
                                </button>
                              </div>

                              {/* Search */}
                              {opts.length > 5 && (
                                <div className="p-4 border-b border-gray-200">
                                  <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                      type="text"
                                      placeholder="Search..."
                                      value={searchTerms[f.fieldName] ?? ""}
                                      onChange={(e) => setSearchTerms((p) => ({ ...p, [f.fieldName]: e.target.value }))}
                                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                  </div>
                                </div>
                              )}

                              {/* Options List */}
                              <div className="max-h-96 overflow-y-auto">
                                {filteredOpts.length === 0 ? (
                                  <div className="p-8 text-center text-gray-500">
                                    <Search size={32} className="mx-auto mb-2 text-gray-400" />
                                    <p>No options found</p>
                                  </div>
                                ) : (
                                  filteredOpts.map((opt) => {
                                    const valOpt = opt.Id ?? opt.id ?? opt.value ?? "";
                                    const name = opt.Name ?? opt.Title ?? opt.Label ?? valOpt;
                                    const isSelected = sel === String(valOpt);
                                    return (
                                      <div
                                        key={valOpt}
                                        className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                                          isSelected
                                            ? "bg-blue-50 text-blue-700 font-semibold"
                                            : "text-gray-800 hover:bg-gray-50"
                                        }`}
                                        onClick={() => {
                                          handleChange(f.fieldName, valOpt, true);
                                          setDropdownOpen((p) => ({ ...p, [f.fieldName]: false }));
                                          setSearchTerms((p) => ({ ...p, [f.fieldName]: "" }));
                                        }}
                                      >
                                        {opt.Thumbnail && (
                                          <img
                                            src={IMAGE_URL + "/uploads/" + opt.Thumbnail}
                                            alt={name}
                                            className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                                          />
                                        )}
                                        <span className="flex-1">{name}</span>
                                        {isSelected && <CheckCircle size={20} className=" flex-shrink-0" />}
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    );
                  }

                  case "multiple": {
                    const selectedValues: any[] = formData[c] || [];
                    return LeftLayout(
                      <>
                        <div className="border border-gray-300 rounded-xl p-4 bg-gray-50">
                          <div className="flex flex-wrap gap-2">
                            {opts.map((o) => {
                              const valOpt = o.Id ?? o.id ?? o.value ?? "";
                              const name = o.Name ?? o.Title ?? o.Label ?? valOpt;
                              const checked = selectedValues.map(String).includes(String(valOpt));
                              return (
                                <label
                                  key={valOpt}
                                  className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all ${
                                    checked
                                      ? "bg-blue-500 text-white shadow-md"
                                      : "bg-white text-gray-700 border border-gray-300 hover:border-blue-500"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={(e) => {
                                      const valStr = String(valOpt);
                                      let updated: string[] = [];
                                      if (e.target.checked) updated = [...selectedValues.map(String), valStr];
                                      else updated = selectedValues.map(String).filter((v) => v !== valStr);
                                      setFormData((p) => ({ ...p, [c]: updated }));
                                    }}
                                    className="w-4 h-4"
                                  />
                                  <span className="font-medium">{name}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    );
                  }

                  case "image":
                    return LeftLayout(
                      <>
                        <div
                          className="relative border-2 border-dashed border-gray-300 rounded-xl h-48 flex items-center justify-center cursor-pointer overflow-hidden bg-gray-50 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                          onClick={() => document.getElementById(`file-${dataSource}-${f.fieldName}`)?.click()}
                        >
                          {uploadImageBlobs[f.fieldName] || formData[c] ? (
                            <>
                              <img
                                src={uploadImageBlobs[f.fieldName] || `${IMAGE_URL}/uploads/${formData[c]}`}
                                alt={f.fieldName}
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setUploadImageBlobs((p) => ({ ...p, [f.fieldName]: null }));
                                }}
                                className="absolute top-2 right-2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-red-50 hover:text-red-600 transition-colors"
                              >
                                <X size={18} />
                              </button>
                            </>
                          ) : (
                            <div className="text-center">
                              <ImageIcon className="mx-auto mb-2 text-gray-400 group-hover:text-blue-500 transition-colors" size={40} />
                              <p className="text-sm text-gray-600 font-medium">Click to upload {f.fieldName}</p>
                              <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 500MB</p>
                            </div>
                          )}
                          <input
                            id={`file-${dataSource}-${f.fieldName}`}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFile(f.fieldName, e.target.files?.[0] ?? null, true)}
                          />
                        </div>
                        {error && (
                          <div className="flex items-center gap-1 text-red-600 text-sm mt-2">
                            <AlertCircle size={14} />
                            <span>{error}</span>
                          </div>
                        )}
                      </>
                    );

                  case "file":
                    return LeftLayout(
                      <>
                        <div className="relative">
                          <input
                            id={`file-input-${dataSource}-${f.fieldName}`}
                            type="file"
                            onChange={(e) => handleFile(f.fieldName, e.target.files?.[0] ?? null)}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => document.getElementById(`file-input-${dataSource}-${f.fieldName}`)?.click()}
                            className="w-full border-2 border-dashed border-gray-300 rounded-xl px-4 py-6 bg-gray-50 hover:border-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center gap-2"
                          >
                            <Upload className="text-gray-400" size={32} />
                            <span className="text-sm text-gray-600 font-medium">
                              {fileInputs[f.fieldName] ? "File uploaded" : `Upload ${f.fieldName}`}
                            </span>
                          </button>
                        </div>
                      </>
                    );

                  case "hidden":
                    return <input key={f.fieldName} type="hidden" value={f.defaultValue ?? val} />;

                  case "map":
                    return LeftLayout(
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block mb-2 text-sm font-medium text-gray-600">Latitude</label>
                            <input
                              value={latitude}
                              onChange={(e) => {
                                setLatitude(e.target.value);
                                handleChange("latitude", e.target.value);
                              }}
                              placeholder="Enter Latitude"
                              className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                          </div>
                          <div>
                            <label className="block mb-2 text-sm font-medium text-gray-600">Longitude</label>
                            <input
                              value={longitude}
                              onChange={(e) => {
                                setLongitude(e.target.value);
                                handleChange("longitude", e.target.value);
                              }}
                              placeholder="Enter Longitude"
                              className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                          </div>
                        </div>
                      </>
                    );

                  default:
                    return null;
                }
              })}
            </div>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
              <span className="text-red-700 font-medium">{errors.submit}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl text-white font-semibold shadow-lg transition-all ${
                isSaving
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl"
              }`}
            >
              {isSaving ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Update
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Loading Overlay */}
      {isSaving && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4 animate-in zoom-in-95 duration-200">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Updating...</h3>
              <p className="text-sm text-gray-600">Please wait while we save your changes</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
