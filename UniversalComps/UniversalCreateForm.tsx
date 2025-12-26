"use client";
import React, { useEffect, useState } from "react";
import { resizeImage } from "./ImageClient";
import { BASE_URL, IMAGE_URL } from "../../config";
import { UniversalGetStoredJWT } from "./UniversalStoredInformationComp";
import { Save, Upload, X, ImagePlus, CheckCircle2 } from "lucide-react";

interface Props {
  dataSource: string;
  fields: any[];
}

export default function UniversalCreateForm({ dataSource, fields }: Props) {
  const [formData, setFormData] = useState<any>({});
  const [fileInputs, setFileInputs] = useState<any>({});
  const [dropdownOptions, setDropdownOptions] = useState<{ [key: string]: any[] }>({});
  const [uploadImageBlobs, setUploadImageBlobs] = useState<{ [key: string]: string | null }>({});
  const [latitude, setLatitude] = useState<string>("0");
  const [longitude, setLongitude] = useState<string>("0");
  const [pickerOpen, setPickerOpen] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(false);

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
    try {
      const base64 = await fileToBase64(file);
      const resized = await resizeImage(base64, 500);
      setUploadImageBlobs((p) => ({ ...p, [field]: resized as string }));
    } catch (err) {
      console.error("Resize error:", err);
    }
  };

  const handleFileChange = async (field: string, file: File | null) => {
    if (!file) return;
    if (file.size > 500 * 1024 * 1024) return alert("File too large (500MB max).");
    try {
      const base64Blob = await fileToBase64(file);
      setFileInputs((p: any) => ({ ...p, [field]: base64Blob }));
    } catch (err) {
      console.error("File convert error:", err);
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

  const handleChange = (field: string, value: any) =>
    setFormData((p: any) => ({ ...p, [toCamelCase(field)]: value }));

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
      const responseData = await res.json();
      console.log("response", responseData);
      window.location.href = `/${dataSource}`;
    } catch (err) {
      console.error("Submit error", err);
      alert("Submit failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white px-8 py-6 rounded-2xl shadow-2xl text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-xl font-semibold text-gray-800">Saving your data...</p>
            <p className="text-sm text-gray-500 mt-1">Please wait</p>
          </div>
        </div>
      )}

      <div className="mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {fields.map((field) => {
              const camel = toCamelCase(field.fieldName);
              const val = formData[camel] || "";

              switch (field.type) {
                case "image":
                  return (
                    <div key={field.fieldName} className="inline-block px-2 mb-4 w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5">
                      <div
                        className="group relative border-2 border-dashed border-gray-300 rounded-xl h-40 flex items-center justify-center cursor-pointer overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 hover:border-blue-400 hover:from-blue-50 hover:to-blue-100 transition-all duration-300"
                        onClick={() => document.getElementById(`file-${field.fieldName}`)?.click()}
                      >
                        {uploadImageBlobs[field.fieldName] || formData[camel] ? (
                          <>
                            <img
                              src={
                                uploadImageBlobs[field.fieldName]
                                  ? uploadImageBlobs[field.fieldName]
                                  : formData[camel]
                                    ? `${BASE_URL}/uploads/${formData[camel]}`
                                    : ""
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
                              className="absolute top-2 right-2 z-10 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <div className="text-center">
                            <ImagePlus className="mx-auto text-gray-400 group-hover:text-blue-500 transition-colors mb-2" size={32} />
                            <span className="text-gray-500 text-sm font-medium">{field.fieldName}</span>
                            <p className="text-xs text-gray-400 mt-1">Click to upload</p>
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
                    </div>
                  );

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
                              className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                                checked
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

                  return (
                    <div key={field.fieldName} className="space-y-2">
                      <label className="block text-lg font-semibold text-gray-800">
                        {field.fieldName}
                      </label>

                      {isLoading ? (
                        <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
                      ) : (
                        <button
                          type="button"
                          onClick={() => setPickerOpen((p) => ({ ...p, [field.fieldName]: true }))}
                          className={`w-full flex justify-between items-center px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                            selectedValue
                              ? "border-blue-500 bg-blue-50 text-gray-900"
                              : "border-gray-300 bg-white text-gray-500 hover:border-blue-300"
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
                              return (
                                <>
                                  <span className="text-gray-400">Select {field.fieldName}</span>
                                </>
                              );
                            })()}
                          </span>
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      )}

                      {pickerOpen[field.fieldName] && !isLoading && (
                        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
                            <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700">
                              <h3 className="text-xl font-semibold text-white">Select {field.fieldName}</h3>
                              <button
                                type="button"
                                onClick={() => setPickerOpen((p) => ({ ...p, [field.fieldName]: false }))}
                                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg px-4 py-2 transition-colors font-medium"
                              >
                                Done
                              </button>
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                              {options.map((opt: any) => {
                                const valOpt = opt.id ?? opt.Id;
                                const name = opt.Name ?? opt.Title ?? opt.Label ?? valOpt;
                                const isSelected = selectedValue === valOpt;
                                return (
                                  <div
                                    key={valOpt}
                                    className={`flex items-center gap-3 px-6 py-4 cursor-pointer border-b border-gray-100 transition-all ${
                                      isSelected
                                        ? "bg-blue-50 text-blue-700 font-semibold"
                                        : "text-gray-800 hover:bg-gray-50"
                                    }`}
                                    onClick={() => {
                                      handleChange(field.fieldName, valOpt);
                                      setPickerOpen((p) => ({ ...p, [field.fieldName]: false }));
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
                                    {isSelected && (
                                      <CheckCircle2 className="" size={20} />
                                    )}
                                  </div>
                                );
                              })}
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
                      <label className="block text-lg font-semibold text-gray-800">{field.fieldName}</label>
                      <input
                        type={field.type}
                        value={field.defaultValue || val}
                        onChange={(e) => handleChange(field.fieldName, e.target.value)}
                        placeholder={`Enter ${field.fieldName}`}
                        className="w-full border-2 border-gray-300 bg-white text-gray-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        required
                      />
                    </div>
                  );

                case "textarea":
                  return (
                    <div key={field.fieldName} className="space-y-2">
                      <label className="block text-lg font-semibold text-gray-800">{field.fieldName}</label>
                      <textarea
                        rows={5}
                        value={val}
                        onChange={(e) => handleChange(field.fieldName, e.target.value)}
                        placeholder={`Enter ${field.fieldName}`}
                        className="w-full border-2 border-gray-300 bg-white text-gray-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                        required
                      />
                    </div>
                  );

                case "file":
                  return (
                    <div key={field.fieldName} className="space-y-2">
                      <label className="block text-lg font-semibold text-gray-800">{field.fieldName}</label>
                      <div className="relative">
                        <input
                          type="file"
                          onChange={(e) => handleFileChange(field.fieldName, e.target.files?.[0] ?? null)}
                          className="w-full border-2 border-gray-300 bg-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:cursor-pointer hover:file:bg-blue-700 transition-all"
                          required
                        />
                      </div>
                    </div>
                  );

                case "map":
                  return (
                    <div key={field.fieldName} className="space-y-4">
                      <label className="block text-lg font-semibold text-gray-800">{field.fieldName}</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-600">Latitude</label>
                          <input
                            type="text"
                            value={latitude}
                            onChange={(e) => setLatitude(e.target.value)}
                            placeholder="Enter latitude"
                            className="w-full border-2 border-gray-300 bg-white text-gray-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-600">Longitude</label>
                          <input
                            type="text"
                            value={longitude}
                            onChange={(e) => setLongitude(e.target.value)}
                            placeholder="Enter longitude"
                            className="w-full border-2 border-gray-300 bg-white text-gray-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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

            <div className="flex justify-end pt-6 border-t-2 border-gray-100">
              <button
                type="submit"
                disabled={loading}
                className={`flex items-center gap-3 px-8 py-4 rounded-xl text-lg font-semibold transition-all shadow-lg ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed text-white"
                    : "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:shadow-xl transform hover:-translate-y-0.5"
                }`}
              >
                <Save size={22} />
                {loading ? "Saving..." : "Save Entry"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}