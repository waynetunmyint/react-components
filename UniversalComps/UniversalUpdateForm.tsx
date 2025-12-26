"use client";
import React, { useEffect, useState } from "react";
import { resizeImage } from "./ImageClient";
import { BASE_URL, IMAGE_URL } from "../../config";
import { UniversalGetStoredJWT } from "./UniversalStoredInformationComp";
import { Save } from "lucide-react";

interface Props {
  dataSource: string;
  fields: any[];
}

interface DropdownOptions {
  [key: string]: Array<Record<string, any>>;
}

interface UploadImageBlobs {
  [key: string]: string | null;
}

export default function UniversalUpdateForm({ dataSource, fields }: Props) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [fileInputs, setFileInputs] = useState<Record<string, string>>({});
  const [dropdownOptions, setDropdownOptions] = useState<DropdownOptions>({});
  const [uploadImageBlobs, setUploadImageBlobs] = useState<UploadImageBlobs>({});
  const [latitude, setLatitude] = useState("0");
  const [longitude, setLongitude] = useState("0");
  const [dropdownOpen, setDropdownOpen] = useState<{ [key: string]: boolean }>({});
  const [isSaving, setIsSaving] = useState(false); // track saving state

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

          // 🧠 Normalize backend responses to always produce an array
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
            // Handle single object case
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
  };

  const handleFile = async (field: string, file: File | null, isImg = false) => {
    if (!file) return;
    if (file.size > 500 * 1024 * 1024) return alert("File too large");

    if (isImg) {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const resized = await resizeImage(reader.result, 500);
          setUploadImageBlobs((p) => ({ ...p, [field]: resized as string }));
        } catch (err) {
          console.error("Image resize error:", err);
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
    if (isSaving) return; // prevent double click
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

      const token = UniversalGetStoredJWT();
      if (!token) throw new Error("JWT token not found");
      const res = await fetch(`${BASE_URL}/${dataSource}/api`, {
        method: "PATCH",
        body: fd,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Update failed, please try again");
      window.location.href = `/${dataSource}`;
     // window.location.href = `/${dataSource}/view/` + (formData.id || formData.Id || "");
    } catch (e) {
      console.error(e);
      alert("Update failed");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white text-gray-800 border">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Update <span className="">{dataSource}</span>
        </h1>
        <p className="text-sm text-gray-500">Make changes to the information</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {fields.map((f) => {
          const c = toCamelCase(f.fieldName);
          const val = formData[c] || "";
          const opts = dropdownOptions[f.fieldName] ?? [];

          switch (f.type) {
            case "text":
            case "email":
            case "number":
              return (
                <div key={f.fieldName}>
                  <label className="block mb-1 font-semibold">{f.fieldName}</label>
                  <input
                    type={f.type}
                    value={val}
                    onChange={(e) => handleChange(f.fieldName, e.target.value)}
                    className="w-full border rounded px-3 py-2 bg-white text-gray-800"
                    placeholder={`Enter ${f.fieldName}`}
                  />
                </div>
              );

            case "textarea":
              return (
                <div key={f.fieldName}>
                  <label className="block mb-1 font-semibold">{f.fieldName}</label>
                  <textarea
                    value={val}
                    onChange={(e) => handleChange(f.fieldName, e.target.value)}
                    rows={5}
                    className="w-full border rounded px-3 py-2 bg-white text-gray-800"
                    placeholder={`Enter ${f.fieldName}`}
                  />
                </div>
              );

            case "dropdown": {
              const sel = String(formData[c + "Id"] ?? "");
              return (
                <div key={f.fieldName} className="flex items-center gap-2 mb-4">
                  <label className="w-1/4 font-semibold text-gray-700 line-clamp-2 text-xs break-words">
                    {f.fieldName}
                  </label>

                  <button
                    type="button"
                    onClick={() => setDropdownOpen((p) => ({ ...p, [f.fieldName]: true }))}
                    className={`w-3/4 rounded-md bg-blue-100 border border-gray-500 px-3 py-2 text-left transition 
                    ${sel ? "!border-2 !border-blue-500 text-blue-800" : "border border-gray-400 text-gray-600"}`}
                  >
                    {opts.find((opt) => String(opt.Id ?? opt.id) === sel)?.Name ??
                      opts.find((opt) => String(opt.Id ?? opt.id) === sel)?.Title ??
                      `Select ${f.fieldName}`}
                  </button>

                  {dropdownOpen[f.fieldName] && (
                    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
                      <div className="w-full max-w-md bg-white rounded-lg p-4 relative shadow-lg">
                        <div className="flex justify-end mb-2">
                          <button
                            type="button"
                            onClick={() =>
                              setDropdownOpen((p) => ({ ...p, [f.fieldName]: false }))
                            }
                            className=" font-semibold px-3 py-1"
                          >
                            Done
                          </button>
                        </div>

                        <div className="max-h-64 overflow-y-auto border-t border-b">
                          {opts.map((opt) => {
                            const valOpt = opt.Id ?? opt.id ?? opt.value ?? "";
                            const name = opt.Name ?? opt.Title ?? opt.Label ?? valOpt;
                            const isSelected = sel === String(valOpt);
                            return (
                              <div
                                key={valOpt}
                                className={`flex px-4 py-2 cursor-pointer rounded ${isSelected
                                  ? "bg-blue-100  font-semibold"
                                  : "text-gray-800 hover:bg-gray-100"
                                  }`}
                                onClick={() => {
                                  handleChange(f.fieldName, valOpt, true);
                                  setDropdownOpen((p) => ({ ...p, [f.fieldName]: false }));
                                }}
                              >
                                {opt.Thumbnail && (
                                  <img
                                    src={IMAGE_URL + "/uploads/" + opt.Thumbnail}
                                    alt={name}
                                    className="w-6 h-6 mr-2 rounded object-cover"
                                  />
                                )}
                                {name}
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

            case "multiple": {
              const selectedValues: any[] = formData[c] || [];
              return (
                <div key={f.fieldName} className="space-y-2">
                  <label className="block font-semibold">{f.fieldName}</label>
                  <div className="flex flex-wrap bg-white gap-2 border p-2 rounded">
                    {opts.map((o) => {
                      const valOpt = o.Id ?? o.id ?? o.value ?? "";
                      const name = o.Name ?? o.Title ?? o.Label ?? valOpt;
                      const checked = selectedValues.map(String).includes(String(valOpt));
                      return (
                        <div key={valOpt}>
                          <label className="flex items-center space-x-2 bg-gray-100 px-2 py-1 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                const valStr = String(valOpt);
                                let updated: string[] = [];
                                if (e.target.checked)
                                  updated = [...selectedValues.map(String), valStr];
                                else
                                  updated = selectedValues.map(String).filter((v) => v !== valStr);
                                setFormData((p) => ({ ...p, [c]: updated }));
                              }}
                              className="w-4 h-4 bg-white"
                            />
                            <span>{name}</span>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }

            case "image":
              return (
                <div key={f.fieldName} className="inline-block px-2 mb-4 w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5 align-top">
                  <div
                    className="relative border border-gray-300 rounded-lg h-32 flex items-center justify-center cursor-pointer overflow-hidden bg-gray-50 hover:bg-gray-100"
                    onClick={() => document.getElementById(`file-${f.fieldName}`)?.click()}
                  >
                    {uploadImageBlobs[f.fieldName] || formData[c] ? (
                      <>
                        <img
                          src={uploadImageBlobs[f.fieldName] || `${BASE_URL}/uploads/${formData[c]}`}
                          alt={f.fieldName}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setUploadImageBlobs((p) => ({ ...p, [f.fieldName]: null }));
                          }}
                          className="absolute top-1 right-1 z-10 bg-white rounded-full p-1 shadow hover:bg-gray-200"
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <span className="text-gray-400 text-sm text-center">{f.fieldName}</span>
                    )}
                    <input
                      id={`file-${f.fieldName}`}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFile(f.fieldName, e.target.files?.[0] ?? null, true)}
                    />
                  </div>
                </div>
              );

            case "file":
              return (
                <div key={f.fieldName}>
                  <label className="block mb-1 font-semibold">{f.fieldName}</label>
                  <input
                    type="file"
                    onChange={(e) => handleFile(f.fieldName, e.target.files?.[0] ?? null)}
                    className="w-full border rounded px-3 py-2 bg-white text-gray-800"
                  />
                </div>
              );

            case "hidden":
              return <input key={f.fieldName} type="hidden" value={f.defaultValue ?? val} />;

            case "map":
              return (
                <div key={f.fieldName}>
                  <label className="block mb-1 font-semibold">{f.fieldName}</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-gray-800">Latitude</label>
                      <input
                        value={latitude}
                        onChange={(e) => {
                          setLatitude(e.target.value);
                          handleChange("latitude", e.target.value);
                        }}
                        placeholder="Enter Latitude"
                        className="w-full border rounded px-3 py-2 bg-white text-gray-800"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-gray-800">Longitude</label>
                      <input
                        value={longitude}
                        onChange={(e) => {
                          setLongitude(e.target.value);
                          handleChange("longitude", e.target.value);
                        }}
                        placeholder="Enter Longitude"
                        className="w-full border rounded px-3 py-2 bg-white text-gray-800"
                      />
                    </div>
                  </div>
                </div>
              );

            default:
              return null;
          }
        })}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className={`flex items-center gap-2 px-6 py-3 rounded text-white ${isSaving ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            <Save size={20} />
            {isSaving ? "Saving..." : "Update"}
          </button>
        </div>
      </form>

      {isSaving && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-lg p-6 shadow-lg flex flex-col items-center gap-4">
            <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
            <span className="text-gray-700 font-semibold">Saving, please wait...</span>
          </div>
        </div>
      )}

      <style jsx>{`
        .loader {
          border-top-color: #3490dc;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
