"use client";
import React, { useEffect, useState } from "react";
import {
  Save,
  ArrowLeft,
  FileText,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";
import { resizeImage } from "../ImageComps/ImageClientComp";
import { BASE_URL, PAGE_ID } from "../../../config";
import { GetStoredJWT } from "../StorageComps/StorageCompOne";
import { toCamelCase } from "../HelperComps/TextCaseComp";

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


interface Props {
  dataSource: string;
  fields: any[];
  imageSize: string;
  onSuccess?: () => void;
  hideBackButton?: boolean;
}

export default function FormAdminCreateComp({ dataSource, fields, imageSize, onSuccess, hideBackButton = false }: Props) {
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
            : `${BASE_URL}/${toCamelCase(field.fieldName)}/api/byPageId/${PAGE_ID}`;

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
      // Protect against PAGE_ID being undefined/null - use nullish coalescing and String()
      submitData.append("pageId", String(PAGE_ID ?? "0"));

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

      const token = GetStoredJWT();
      if (!token) throw new Error("JWT token not found");
      const res = await fetch(`${BASE_URL}/${dataSource}/api`, {
        method: "POST",
        body: submitData,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Submission failed");

      // Call success callback or redirect
      if (onSuccess) {
        onSuccess();
      } else {
        setTimeout(() => {
          window.location.href = `/${dataSource}`;
        }, 500);
      }
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

  // Render field based on type
  const renderField = (field: any) => {
    const camel = toCamelCase(field.fieldName);
    const val = formData[camel] || "";
    const error = errors[field.fieldName];

    switch (field.type) {
      case "text":
        return (
          <TextField
            key={field.fieldName}
            field={field}
            value={field.defaultValue || val}
            error={error}
            onChange={(v) => handleChange(field.fieldName, v)}
          />
        );

      case "number":
        return (
          <NumberField
            key={field.fieldName}
            field={field}
            value={field.defaultValue || val}
            error={error}
            onChange={(v) => handleChange(field.fieldName, v)}
          />
        );

      case "email":
        return (
          <EmailField
            key={field.fieldName}
            field={field}
            value={field.defaultValue || val}
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

      case "dropdown":
        return (
          <DropdownField
            key={field.fieldName}
            field={field}
            camel={camel}
            formData={formData}
            dropdownOptions={dropdownOptions}
            pickerOpen={pickerOpen}
            setPickerOpen={setPickerOpen}
            searchTerms={searchTerms}
            setSearchTerms={setSearchTerms}
            getFilteredOptions={getFilteredOptions}
            handleChange={handleChange}
          />
        );

      case "multiple":
        return (
          <MultipleField
            key={field.fieldName}
            field={field}
            camel={camel}
            selectedValues={formData[camel] || []}
            dropdownOptions={dropdownOptions}
            setFormData={setFormData}
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
            handleFileChange={handleFileChange}
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

      default:
        return null;
    }
  };

  return (
    <div className={hideBackButton ? "" : "min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4"}>
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

      <div className={hideBackButton ? "" : "max-w-7xl mx-auto"}>
        {/* Header Card */}
        {!hideBackButton && (
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
        )}

        {/* Form Card */}
        <div className={hideBackButton ? "" : "bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"}>
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
                        <ImageField
                          key={field.fieldName}
                          field={field}
                          dataSource={dataSource}
                          error={error}
                          camel={camel}
                          uploadImageBlobs={uploadImageBlobs}
                          formData={formData}
                          handleImagePicked={handleImagePicked}
                          setUploadImageBlobs={setUploadImageBlobs}
                        />
                      );
                    })}
                </div>
              </div>
            )}

            {/* Other Fields */}
            <div className="space-y-6">
              {fields
                .filter((f) => f.type !== "image")
                .map((field) => renderField(field))}
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