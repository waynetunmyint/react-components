// app/_components/UniversalHeaderComp.tsx
import React from "react";
import { Plus } from "lucide-react"; // Lucide icon

interface UniversalHeaderCompProps {
  dataSource: string; // required
}

// Capitalize first letter
const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

// Simple pluralization
const pluralize = (str: string) => {
  if (str.endsWith("s")) return str;
  return str + "s";
};

const UniversalHeaderComp: React.FC<UniversalHeaderCompProps> = ({ dataSource }) => {

  //do nothing for now
  return null;
  
  // if (!dataSource) {
  //   throw new Error("UniversalHeaderComp requires a valid dataSource string");
  // }

  // const title = pluralize(capitalize(dataSource));
  // const createLink = `/${dataSource}/create`;

  // return (
  //   <header className="flex justify-between items-center px-4 py-3 bg-white">
  //     {/* Title on the left */}
  //     <h1 className="text-lg font-semibold text-gray-900">
  //       {title}
  //     </h1>

  //     {/* Right side button with icon (iOS style: blue, subtle) */}
  //     <a
  //       href={createLink}
  //       className="flex items-center border-2 border-blue-800 p-2 rounded-xl gap-1  font-medium text-sm hover:opacity-80 transition"
  //     >
  //       <Plus size={16} />
  //       Create
  //     </a>
  //   </header>
  // );
};

export default UniversalHeaderComp;
