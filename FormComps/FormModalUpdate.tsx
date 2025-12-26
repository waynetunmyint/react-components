"use client";
import React, { useEffect, useState } from "react";

import {
  Save,
  FileText,
  AlertCircle,
  Loader2,
  ArrowLeft
} from "lucide-react";
import { BASE_URL, IMAGE_URL } from "../../../config";
import { GetStoredJWT } from "../StorageComps/StorageCompOne";
import { resizeImage } from "../ImageComps/ImageClientComp";

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
import HundredDropdownField from "./HundredDropdownField";
import RadioField from "./RadioField";
import RadioPaymentField from "./RadioPaymentField";
import ArrayBillField from "./ArrayBillField";
import IconDropdownField from "./IconDropdownField";
import BlockDisplayArrayField from "./BlockDisplayArrayField";

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

export default function FormModalUpdate({ dataSource, fields, imageSize, customRedirect, onSuccess, hideBackButton = false }: Props) {
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

        // single Id fields -> store using the camelCase key (e.g. PageId -> pageId)
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
                : `${BASE_URL}/${toCamelCase(field.fieldName)}/api`;

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
    const key = field?.customSource
      ? toCamelCase(fieldName)
      : toCamelCase(fieldName) + "Id";
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

      fields.forEach((field) => {
        const formField = toCamelCase(field.fieldName);
        const val = formData[formField];
        const ddlVal = formData[formField + "Id"];

        switch (field.type) {
          case "dropdown":
            if (field.customSource) {
              submitData.append(formField, val ?? "");
            } else {
              // treat empty selection or explicit '0' as no value so backend stores NULL
              const normalized = ddlVal === "0" || ddlVal === 0 ? "" : (ddlVal ?? "");
              submitData.append(formField + "Id", normalized);
            }
            break;
          case "multiple":
            submitData.append(formField + "Ids", (formData[formField] || []).join(","));
            break;
          case "image":
            if (uploadImageBlobs[field.fieldName]) submitData.append(formField, uploadImageBlobs[field.fieldName] as string);
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
    const rawVal = formData[c];
    const val = (rawVal === 0 || rawVal === false || rawVal) ? rawVal : "";
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
          preSelected = String(formData[c + "Id"] ?? "");
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
        return (
          <ImageField
            key={field.fieldName}
            field={field}
            dataSource={dataSource}
            error={error}
            camel={c}
            uploadImageBlobs={uploadImageBlobs}
            formData={formData}
            handleImagePicked={(fieldName, file) => handleFile(fieldName, file, true)}
            setUploadImageBlobs={setUploadImageBlobs}
          />
        );

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

      case "hundredDropdown":
        return (
          <HundredDropdownField
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

      case "iconDropdown":
        return (
          <IconDropdownField
            key={field.fieldName}
            field={field}
            value={val}
            error={error}
            onChange={(v) => handleChange(field.fieldName, v)}
          />
        );

      case "blockDisplayArray":
        return (
          <BlockDisplayArrayField
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
    <div className={hideBackButton ? "" : "min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4"}>
      <div className={hideBackButton ? "" : "max-w-4xl mx-auto"}>
        {/* Header */}
        {!hideBackButton && (
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
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className={hideBackButton ? "" : "bg-white rounded-2xl shadow-sm border border-gray-200 p-6"}>
            <div className="space-y-6">
              {fields.map((field) => renderField(field))}
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
              className={`flex items-center gap-2 px-8 py-3 rounded-xl text-white font-semibold shadow-lg transition-all ${isSaving
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