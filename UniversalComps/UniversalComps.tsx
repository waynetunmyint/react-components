"use client";
import React from "react";
import Link from "next/link";

interface UniversalHeaderProps {
  dataSource: string;
  createLabel?: string;
}

export const UniversalHeader = ({
  dataSource,
  createLabel = "New",
}: UniversalHeaderProps) => {
  // Capitalize first letter
  const title = dataSource
    ? dataSource.charAt(0).toUpperCase() + dataSource.slice(1)
    : "";

  return (
    <header className="flex justify-between items-center px-6 py-4 ">
      {/* Title */}
      <h1 className="text-xl md:text-2xl font-semibold text-gray-800 flex items-center gap-2">
        <span className=" text-2xl">📂</span>
        {title}
      </h1>

      <Link
        href={`/${dataSource}/create`}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
      >
        <span className="text-white">➕</span>
        <span>{createLabel}</span>
      </Link>

    </header>
  );
};
