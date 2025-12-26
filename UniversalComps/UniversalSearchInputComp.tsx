import React, { useState } from "react";
import { Search } from "lucide-react";

interface Props {
  dataSource: string;
}

export default function UniversalSearchInputComp({ dataSource }: Props) {
  const [keyword, setKeyword] = useState("");

  const handleSearch = () => {
    if (!keyword.trim()) return;
    window.location.href = `/${dataSource}/search/${encodeURIComponent(keyword)}`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="w-full mt-5 mb-5  bg-none">
      <div className="relative w-full">
        {/* Search icon inside input */}
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Type here to search from ${dataSource}s`}
          className="w-full rounded-full pl-10 pr-4 py-2 text-sm text-gray-800 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 bg-white transition-colors duration-200"
        />
      </div>
    </div>
  );
}
