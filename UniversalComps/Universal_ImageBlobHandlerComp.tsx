"use client";
import React, { useRef } from "react";
import { resizeImage } from "./ImageClient";
import { Image } from "lucide-react";

interface Props {
  maxSize?: number;
  setImageBlobString: (base64: string) => void;
  triggerFunction?: () => void;
  classNameString?: string;
}

export const ImagePicker: React.FC<Props> = ({
  maxSize = 500,
  setImageBlobString,
  triggerFunction,
  classNameString
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const resizedBase64 = (await resizeImage(base64, maxSize)) as string;
      setImageBlobString(resizedBase64);
      // wait a tick before calling triggerFunction
      if (triggerFunction) {
        setTimeout(() => {
          triggerFunction();
        }, 50); // 50ms delay
      }
    } catch (err) {
      console.error("ImagePicker error:", err);
    } finally {
      // Reset input value to allow picking the same file again
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="relative inline-block">
      <Image
        size={40}
        className={classNameString}
        onClick={() => inputRef.current?.click()}
      />

      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        onChange={handleFileChange}
        style={{ display: "none" }} // keep hidden always
      />
    </div>
  );
};
