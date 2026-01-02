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
import { BASE_URL, PAGE_ID } from "@/config";
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
import ArrayBillField from "./ArrayBillField";
import RadioField from "./RadioField";
import RadioPaymentField from "./RadioPaymentField";
import ArrayVariationField from "./ArrayVariationField";


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
            if (typeof value === 'object' && value !== null) {
              submitData.append(camel, JSON.stringify(value));
            } else {
              submitData.append(camel, value || "");
            }
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

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[200] animate-in fade-in duration-300">
          <div className="bg-white px-10 py-8 rounded-[2.5rem] shadow-2xl text-center animate-in zoom-in-95 duration-500 max-w-xs w-full">
            <div className="relative mx-auto mb-6 w-20 h-20">
              <div className="w-20 h-20 border-4 border-slate-100 rounded-full"></div>
              <div className="w-20 h-20 border-4 border-brand-green border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Save className="text-brand-green/20" size={24} />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tighter">Saving</p>
            <p className="text-sm text-slate-500 font-medium">Writing your data to the cloud...</p>
          </div>
        </div>
      )}

      <div className={hideBackButton ? "" : "max-w-4xl mx-auto"}>
        {/* Header Card */}
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
                <span className="text-brand-gold font-black uppercase tracking-[0.2em] text-[10px] mb-2 block">New Entry</span>
                <h1 className="text-4xl font-black text-slate-900 mb-2 uppercase tracking-tighter">
                  Create {dataSource}
                </h1>
                <p className="text-slate-500 font-medium">Enter the details below to publish your content.</p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-green to-[#00381b] flex items-center justify-center shadow-lg shadow-brand-green/30 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <FileText className="text-white" size={32} strokeWidth={2.5} />
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
                <div className="flex flex-wrap gap-6">
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
            <div className="space-y-8">
              {fields
                .filter((f) => f.type !== "image")
                .map((field) => renderField(field))}
            </div>

            {/* Submit Error */}
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
                Discard
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`w-full sm:flex-[2] flex items-center justify-center gap-3 px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl ${loading
                  ? "bg-slate-200 cursor-not-allowed text-slate-400"
                  : "bg-brand-gold text-slate-900 shadow-brand-gold/20 hover:shadow-2xl hover:brightness-110 transform hover:-translate-y-1 active:scale-[0.98]"
                  }`}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} strokeWidth={3} className="animate-spin text-slate-400" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Save size={18} strokeWidth={3} />
                    <span>Confirm & Save</span>
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
