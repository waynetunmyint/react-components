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
  ArrowLeft
} from "lucide-react";
import { BASE_URL, PAGE_ID, IMAGE_URL } from "@/config";
import { resizeImage } from "../ImageComps/ImageClientComp";
import { GetStoredJWT } from "../StorageComps/StorageCompOne";

// Import field components
import TextField from "./TextField";
import NumberField from "./NumberField";
import EmailField from "./EmailField";
import TextareaField from "./TextareaField";
import DropdownField from "./DropdownField";
import MultipleField from "./MultipleField";
import ImageField from "./ImageField";
import FileField from "./FileField";
import MapField from "./MapField";
import DateField from "./DateField";
import HiddenField from "./HiddenField";
import SeparatorField from "./SeparatorField";
import ArrayBillField from "./ArrayBillField";
import RadioField from "./RadioField";
import RadioPaymentField from "./RadioPaymentField";
import ArrayVariationField from "./ArrayVariationField";

interface Props {
  dataSource: string;
  fields: any[];
  imageSize: string;
  customRedirect?: string | null;
  onSuccess?: () => void;
  hideBackButton?: boolean;
}

interface DropdownOptions {
  [key: string]: Array<Record<string, any>>;
}

interface UploadImageBlobs {
  [key: string]: string | null;
}

export default function FormAdminUpdate({ dataSource, fields, imageSize, customRedirect, onSuccess, hideBackButton = false }: Props) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [fileInputs, setFileInputs] = useState<Record<string, string>>({});
  const [dropdownOptions, setDropdownOptions] = useState<DropdownOptions>({});
  const [uploadImageBlobs, setUploadImageBlobs] = useState<UploadImageBlobs>({});
  const [latitude, setLatitude] = useState("0");
  const [longitude, setLongitude] = useState("0");
  const [pickerOpen, setPickerOpen] = useState<{ [key: string]: boolean }>({});
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

        // preserve id field as-is
        if (k === "id" || k === "Id") {
          camelObj.id = parsed[k];
          return;
        }

        // Handle "Ids" arrays or comma-strings
        if (k.endsWith("Ids") && parsed[k]) {
          const keyName = c.replace(/Ids$/, "");
          const values = Array.isArray(parsed[k]) ? parsed[k] : String(parsed[k]).split(",");
          camelObj[keyName] = values.map((v: any) => {
            const n = parseInt(String(v), 10);
            return isNaN(n) ? v : n;
          });
          return;
        }

        // single Id fields -> store as camel (already includes Id)
        if (k.toLowerCase().endsWith("id") && !k.endsWith("Ids")) {
          camelObj[c] = parsed[k];
          return;
        }

        // default
        camelObj[c] = parsed[k];
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

  // Fetch dropdown options (parallel)
  useEffect(() => {
    const fetchAll = async () => {
      const dropdownFields = fields.filter((f) => f.type === "dropdown" || f.type === "multiple");
      if (dropdownFields.length === 0) return;

      const results = await Promise.all(
        dropdownFields.map(async (field) => {
          try {
            const url = field.customAPI
              ? `${BASE_URL}${field.customAPI}`
              : field.customSource
                ? `${BASE_URL}/${field.customSource}/api`
                : `${BASE_URL}/${toCamelCase(field.fieldName)}/api/byPageId/${PAGE_ID}`;

            const res = await fetch(url, { cache: "no-store" });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();

            let normalizedData: any[] = [];
            if (Array.isArray(data)) normalizedData = data;
            else if (Array.isArray(data?.items)) normalizedData = data.items;
            else if (Array.isArray(data?.data)) normalizedData = data.data;
            else if (Array.isArray(data?.results)) normalizedData = data.results;
            else if (Array.isArray(data?.rows)) normalizedData = data.rows;
            else if (typeof data === "object" && data !== null) normalizedData = [data];
            else normalizedData = [];

            return { fieldName: field.fieldName, data: normalizedData };
          } catch (e) {
            console.error(`Failed to fetch dropdown for ${field.fieldName}:`, e);
            return { fieldName: field.fieldName, data: [] };
          }
        })
      );

      setDropdownOptions((prev) => {
        const updated = { ...prev };
        results.forEach(({ fieldName, data }) => (updated[fieldName] = data));
        return updated;
      });
    };

    fetchAll();
  }, [fields]);

  const handleChange = (fieldName: string, value: any) => {
    const key = toCamelCase(fieldName);
    setFormData((p) => ({ ...p, [key]: value }));
    setTouched((p) => ({ ...p, [fieldName]: true }));
  };

  const handleDropdownChange = (field: any, fieldName: string, value: any) => {
    let key;
    if (field?.customSource) {
      key = toCamelCase(fieldName);
    } else {
      // Check if the field already ends with "Id"
      key = fieldName.toLowerCase().endsWith("id") ? toCamelCase(fieldName) : toCamelCase(fieldName) + "Id";
    }
    setFormData((p) => ({ ...p, [key]: value }));
    setTouched((p) => ({ ...p, [fieldName]: true }));
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
      const submitData = new FormData();
      submitData.append("id", formData?.id ?? formData?.Id ?? "");
      submitData.append("pageId", PAGE_ID.toString() || "0");

      fields.forEach((field) => {
        const formField = toCamelCase(field.fieldName);
        const val = formData[formField];

        // For dropdown fields that already end with "Id", don't append another "Id"
        const dropdownKey = field.fieldName.toLowerCase().endsWith("id") ? formField : formField + "Id";
        const ddlVal = formData[dropdownKey];

        switch (field.type) {
          case "dropdown":
            if (field.customSource) {
              submitData.append(formField, val ?? "");
            } else {
              submitData.append(dropdownKey, ddlVal ?? "");
            }
            break;
          case "multiple":
            submitData.append(formField + "Ids", (formData[formField] || []).join(","));
            break;
          case "image":
            if (uploadImageBlobs[field.fieldName] !== undefined) {
              // If it's null (cleared) append empty string, otherwise append the new blob
              submitData.append(formField, uploadImageBlobs[field.fieldName] ?? "");
            }
            break;
          case "file":
            if (fileInputs[field.fieldName]) submitData.append(formField, fileInputs[field.fieldName]);
            break;
          case "hidden":
            submitData.append(formField, field.defaultValue ?? "");
            break;
          case "map":
            submitData.append("latitude", latitude);
            submitData.append("longitude", longitude);
            break;
          default:
            if (typeof val === 'object' && val !== null) {
              submitData.append(formField, JSON.stringify(val));
            } else {
              submitData.append(formField, val ?? "");
            }
        }
      });

      const token = GetStoredJWT();
      if (!token) throw new Error("JWT token not found");
      const res = await fetch(`${BASE_URL}/${dataSource}/api`, {
        method: "PATCH",
        body: submitData,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Update failed, please try again");

      // Call success callback or redirect
      if (onSuccess) {
        onSuccess();
      } else {
        setTimeout(() => {
          customRedirect ? window.location.href = customRedirect :
            window.location.href = `/${dataSource}`;
        }, 500);
      }
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

  // Render field based on type
  const renderField = (field: any) => {
    const c = toCamelCase(field.fieldName);
    const val = formData[c] || "";
    const error = errors[field.fieldName];

    switch (field.type) {
      case "text":
        return (
          <TextField
            key={field.fieldName}
            field={field}
            value={val}
            error={error}
            onChange={(v) => handleChange(field.fieldName, v)}
          />
        );

      case "number":
        return (
          <NumberField
            key={field.fieldName}
            field={field}
            value={val}
            error={error}
            onChange={(v) => handleChange(field.fieldName, v)}
          />
        );

      case "email":
        return (
          <EmailField
            key={field.fieldName}
            field={field}
            value={val}
            error={error}
            onChange={(v) => handleChange(field.fieldName, v)}
          />
        );

      case "textarea":
        return (
          <TextareaField
            key={field.fieldName}
            field={field}
            value={val}
            error={error}
            onChange={(v) => handleChange(field.fieldName, v)}
          />
        );

      case "dropdown": {
        // For fields ending with "Id", use as-is; otherwise append "Id"
        let preSelected;
        if (field?.customSource) {
          preSelected = String(formData[c] ?? "");
        } else {
          const fieldKey = field.fieldName.toLowerCase().endsWith("id") ? c : c + "Id";
          preSelected = String(formData[fieldKey] ?? "");
        }

        return (
          <DropdownField
            key={field.fieldName}
            field={field}
            camel={c}
            formData={{ ...formData, [c]: preSelected }}
            dropdownOptions={dropdownOptions}
            pickerOpen={pickerOpen}
            setPickerOpen={setPickerOpen}
            searchTerms={searchTerms}
            setSearchTerms={setSearchTerms}
            getFilteredOptions={getFilteredOptions}
            handleChange={(fieldName, value) => handleDropdownChange(field, fieldName, value)}
          />
        );
      }

      case "multiple":
        return (
          <MultipleField
            key={field.fieldName}
            field={field}
            camel={c}
            selectedValues={(formData[c] || []).map(String)}
            dropdownOptions={dropdownOptions}
            setFormData={setFormData}
          />
        );

      case "image":
        return null; // Handled in dedicated Images section at the top of form

      case "file":
        return (
          <FileField
            key={field.fieldName}
            field={field}
            dataSource={dataSource}
            error={error}
            fileInputs={fileInputs}
            handleFileChange={(fieldName, file) => handleFile(fieldName, file)}
          />
        );

      case "map":
        return (
          <MapField
            key={field.fieldName}
            field={field}
            latitude={latitude}
            longitude={longitude}
            setLatitude={setLatitude}
            setLongitude={setLongitude}
          />
        );

      case "date":
        return (
          <DateField
            key={field.fieldName}
            field={field}
            value={val}
            onChange={(v) => handleChange(field.fieldName, v)}
          />
        );

      case "hidden":
        return (
          <HiddenField
            key={field.fieldName}
            field={field}
            value={val}
          />
        );

      case "separator":
        return (
          <SeparatorField
            key={field.fieldName}
            field={field}
          />
        );

      case "arrayBill":
        return (
          <ArrayBillField
            key={field.fieldName}
            field={field}
            value={val}
            error={error}
            onChange={(v) => handleChange(field.fieldName, v)}
          />
        );

      case "radio":
        return (
          <RadioField
            key={field.fieldName}
            field={field}
            value={val}
            error={error}
            onChange={(v) => handleChange(field.fieldName, v)}
          />
        );

      case "radioPayment":
        return (
          <RadioPaymentField
            key={field.fieldName}
            field={field}
            value={val}
            error={error}
            onChange={(v) => handleChange(field.fieldName, v)}
          />
        );

      case "arrayVariation":
        return (
          <ArrayVariationField
            key={field.fieldName}
            field={field}
            value={val}
            error={error}
            onChange={(v) => handleChange(field.fieldName, v)}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className={hideBackButton ? "" : "min-h-screen bg-brand-beige py-12 px-4 relative overflow-hidden"}>
      {!hideBackButton && (
        <div className="fixed top-0 left-0 w-full h-96 bg-gradient-to-b from-brand-gold/10 to-transparent pointer-events-none -z-10" />
      )}

      <div className={hideBackButton ? "" : "max-w-4xl mx-auto"}>
        {/* Header */}
        {!hideBackButton && (
          <div className="bg-white rounded-[2rem] shadow-xl shadow-brand-green/5 border border-slate-200/50 p-8 mb-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 rounded-full blur-3xl -mr-32 -mt-32 transition-transform group-hover:scale-110 duration-700" />

            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 text-slate-400 hover:text-brand-green mb-6 transition-all group/back active:scale-95"
            >
              <div className="p-2 rounded-xl bg-slate-50 group-hover/back:bg-brand-green group-hover/back:text-white transition-colors">
                <ArrowLeft size={18} strokeWidth={3} className="group-hover/back:-translate-x-0.5 transition-transform" />
              </div>
              <span className="font-black uppercase tracking-widest text-[10px]">Back to List</span>
            </button>

            <div className="flex items-center justify-between relative z-10">
              <div>
                <span className="text-brand-gold font-black uppercase tracking-[0.2em] text-[10px] mb-2 block">Editor Mode</span>
                <h1 className="text-4xl font-black text-slate-900 mb-2 uppercase tracking-tighter">
                  Update {dataSource}
                </h1>
                <p className="text-slate-500 font-medium">Refine and improve your existing content.</p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-brand-green/10 flex items-center justify-center transform -rotate-3 hover:rotate-0 transition-transform duration-500 shadow-inner">
                <FileText className="text-brand-green" size={32} strokeWidth={2.5} />
              </div>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className={hideBackButton ? "" : "bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden"}>
          <form onSubmit={handleSubmit} className="p-8 md:p-12">
            {/* Image Upload Section */}
            {fields.some((f) => f.type === "image") && (
              <div className="mb-12 bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100">
                <div className="flex items-center gap-3 mb-10">
                  <div className="p-3 bg-brand-gold/10 text-brand-gold rounded-2xl shadow-inner">
                    <ImageIcon size={22} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">
                      Visual Assets
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Primary {dataSource} Media</p>
                  </div>
                </div>
                <div className="flex flex-col gap-8">
                  {fields
                    .filter((f) => f.type === "image")
                    .map((field) => {
                      const camel = toCamelCase(field.fieldName);
                      const error = errors[field.fieldName];
                      return (
                        <ImageField
                          key={field.fieldName}
                          field={field}
                          dataSource={dataSource}
                          error={error}
                          camel={camel}
                          uploadImageBlobs={uploadImageBlobs}
                          formData={formData}
                          handleImagePicked={(fieldName, file) => handleFile(fieldName, file, true)}
                          setUploadImageBlobs={setUploadImageBlobs}
                        />
                      );
                    })}
                </div>
              </div>
            )}

            {/* Other Fields */}
            <div className="space-y-8">
              {fields
                .filter((f) => f.type !== "image")
                .map((field) => renderField(field))}
            </div>

            {/* Error Message */}
            {errors.submit && (
              <div className="mt-8 bg-red-50 border border-red-100 rounded-2xl p-5 flex items-center gap-4 animate-in shake duration-500">
                <div className="p-2 bg-red-100 text-red-600 rounded-xl">
                  <AlertCircle size={20} strokeWidth={3} />
                </div>
                <span className="text-red-700 font-bold text-sm">{errors.submit}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 pt-10 border-t-2 border-slate-100">
              <button
                type="button"
                onClick={() => hideBackButton ? onSuccess?.() : window.history.back()}
                className="w-full sm:flex-1 px-8 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-500 font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 hover:text-slate-900 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className={`w-full sm:flex-[2] flex items-center justify-center gap-3 px-10 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all shadow-2xl ${isSaving
                  ? "bg-slate-200 cursor-not-allowed text-slate-400"
                  : "bg-slate-900 text-white hover:bg-black ring-4 ring-brand-gold/10 hover:ring-brand-gold/20 transform hover:-translate-y-1 active:scale-[0.98]"
                  }`}
              >
                {isSaving ? (
                  <>
                    <Loader2 size={18} strokeWidth={3} className="animate-spin text-slate-400" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save size={18} strokeWidth={3} className="text-brand-gold" />
                    <span className="font-black text-white ml-1">Confirm Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Loading Overlay */}
      {isSaving && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[200] animate-in fade-in duration-300">
          <div className="bg-white px-10 py-8 rounded-[2.5rem] shadow-2xl text-center animate-in zoom-in-95 duration-500 max-w-xs w-full">
            <div className="relative mx-auto mb-6 w-20 h-20">
              <div className="w-20 h-20 border-4 border-slate-100 rounded-full"></div>
              <div className="w-20 h-20 border-4 border-brand-green border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <CheckCircle className="text-brand-green/20" size={24} />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tighter text-center">Syncing</p>
            <p className="text-sm text-slate-500 font-medium text-center">Updating your content records...</p>
          </div>
        </div>
      )}
    </div>
  );
}