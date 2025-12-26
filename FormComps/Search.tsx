import React, { useEffect, useRef, useState } from "react";
import { Search as SearchIcon, X } from "lucide-react";

type SearchProps = {
  id?: string;
  placeholder?: string;
  initialValue?: string;
  delay?: number;
  onSearch: (val: string) => void;
  onClear?: () => void;
  className?: string; // Container class
  inputClassName?: string; // Input specific override
};

const Search: React.FC<SearchProps> = ({
  id,
  placeholder = "",
  initialValue = "",
  onSearch,
  onClear,
  className = "",
  inputClassName = "",
}) => {
  const [value, setValue] = useState(initialValue);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearch(value);
    }
  };

  const handleClear = () => {
    setValue("");
    if (onClear) onClear();
    else onSearch("");
  };

  return (
    <div className={`relative group flex items-center ${className}`}>
      <SearchIcon
        className="absolute left-3 text-slate-400 group-focus-within:text-slate-900 transition-colors z-10"
        size={18}
      />
      <input
        id={id}
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`
          w-full h-full pl-10 pr-10 py-2.5 
          bg-slate-100 border border-transparent 
          rounded-2xl text-sm text-gray-900 
          placeholder:text-slate-400 
          focus:outline-none focus:bg-white focus:border-slate-200 focus:ring-4 focus:ring-[var(--theme-primary-bg)]/10 
          transition-all duration-200 
          ${inputClassName}
        `}
      />

      {value && (
        <button
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute right-2 p-1.5 hover:bg-slate-200 text-slate-400 rounded-lg transition-all"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};

export default Search;
