"use client";
import React from "react";

interface Props {
  isOpen: boolean;
  title?: string;
  message: string;
  primaryButtonText?: string;
  onPrimaryClick: () => void;
  secondaryButtonText?: string;
  onSecondaryClick?: () => void;
}

export default function Universal_ModalConfirmComp({
  isOpen,
  title = "Confirm",
  message,
  primaryButtonText = "OK",
  onPrimaryClick,
  secondaryButtonText,
  onSecondaryClick,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white w-80 rounded-2xl p-5 text-center shadow-xl">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">{title}</h3>
        <p className="text-gray-600 mb-5">{message}</p>
        <div className="flex justify-center gap-3">
          {secondaryButtonText && onSecondaryClick && (
            <button
              onClick={onSecondaryClick}
              className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800"
            >
              {secondaryButtonText}
            </button>
          )}
          <button
            onClick={onPrimaryClick}
            className={`px-4 py-2 rounded-lg bg-blue-500 text-white`}
          >
            {primaryButtonText}
          </button>
        </div>
      </div>
    </div>
  );
}
