import React, { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, X, ChevronDown } from "lucide-react";

interface DateFieldProps {
  field: {
    fieldName: string;
    required?: boolean;
    [key: string]: any;
  };
  value: string;
  onChange: (val: string) => void;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Generate years (100 years back and 10 years forward)
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 111 }, (_, i) => currentYear - 100 + i);

const DateField: React.FC<DateFieldProps> = ({ field, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  // Parse current value or default to today
  const parseDate = (dateStr: string) => {
    if (!dateStr) return new Date();
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  const selectedDate = parseDate(value);
  const [viewMonth, setViewMonth] = useState(selectedDate.getMonth());
  const [viewYear, setViewYear] = useState(selectedDate.getFullYear());

  // Get days in month
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get first day of month (0 = Sunday)
  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(viewMonth, viewYear);
    const firstDay = getFirstDayOfMonth(viewMonth, viewYear);
    const days: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  // Handle date selection
  const handleDateClick = (day: number) => {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    onChange(dateStr);
    setIsOpen(false);
  };

  // Navigate months
  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  // Format display date
  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`;
  };

  // Check if day is selected
  const isSelected = (day: number) => {
    if (!value) return false;
    const d = new Date(value);
    return d.getDate() === day && d.getMonth() === viewMonth && d.getFullYear() === viewYear;
  };

  // Check if day is today
  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
  };

  return (
    <div key={field.fieldName} className="md:grid md:grid-cols-[180px_1fr] md:gap-4 md:items-center space-y-2 md:space-y-0">
      {/* Label */}
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <Calendar size={14} className="text-orange-500" />
        {field.fieldName}
        {field.required && <span className="text-red-500">*</span>}
      </label>

      {/* Date Picker Button */}
      <div>
        <button
          type="button"
          onClick={() => {
            const d = parseDate(value);
            setViewMonth(d.getMonth());
            setViewYear(d.getFullYear());
            setIsOpen(true);
          }}
          className={`w-full flex justify-between items-center px-4 py-3.5 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md ${value
            ? "border-2 border-orange-500 bg-orange-50 text-gray-900"
            : "border-2 border-gray-400 bg-white text-gray-900 hover:border-orange-500 hover:bg-orange-50"
            } focus:ring-4 focus:ring-orange-500/20 focus:outline-none`}
        >
          <span className="flex items-center gap-3">
            {value ? (
              <>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-xs">{new Date(value).getDate()}</span>
                </div>
                <span className="font-semibold">{formatDisplayDate(value)}</span>
              </>
            ) : (
              <span className="text-gray-400">Select {field.fieldName}...</span>
            )}
          </span>
          <div className={`p-1.5 rounded-lg transition-all ${value ? "bg-orange-100" : "bg-gray-100"}`}>
            <Calendar size={16} className={value ? "text-orange-600" : "text-gray-400"} />
          </div>
        </button>
      </div>

      {/* Calendar Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-200">
            {/* Header */}
            <div className="flex justify-between items-center px-4 py-3 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600">
              <div>
                <h3 className="text-lg font-bold text-white">{field.fieldName}</h3>
                <p className="text-orange-100 text-xs">Select a date</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white hover:bg-white/20 rounded-xl p-2 transition-all hover:rotate-90"
              >
                <X size={20} />
              </button>
            </div>

            {/* Month/Year Quick Selectors */}
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
              <button
                type="button"
                onClick={prevMonth}
                className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ChevronLeft size={18} className="text-gray-600" />
              </button>

              {/* Month Dropdown */}
              <div className="relative flex-1">
                <button
                  type="button"
                  onClick={() => { setShowMonthPicker(!showMonthPicker); setShowYearPicker(false); }}
                  className="w-full flex items-center justify-center gap-1 px-3 py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-orange-400 transition-colors font-semibold text-gray-900"
                >
                  {MONTHS[viewMonth].slice(0, 3)}
                  <ChevronDown size={14} />
                </button>
                {showMonthPicker && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-10 max-h-48 overflow-y-auto">
                    {MONTHS.map((month, idx) => (
                      <button
                        key={month}
                        type="button"
                        onClick={() => { setViewMonth(idx); setShowMonthPicker(false); }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-orange-50 ${idx === viewMonth ? "bg-orange-100 text-orange-700 font-semibold" : "text-gray-700"}`}
                      >
                        {month}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Year Dropdown */}
              <div className="relative flex-1">
                <button
                  type="button"
                  onClick={() => { setShowYearPicker(!showYearPicker); setShowMonthPicker(false); }}
                  className="w-full flex items-center justify-center gap-1 px-3 py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-orange-400 transition-colors font-semibold text-gray-900"
                >
                  {viewYear}
                  <ChevronDown size={14} />
                </button>
                {showYearPicker && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-10 max-h-48 overflow-y-auto">
                    {YEARS.slice().reverse().map((year) => (
                      <button
                        key={year}
                        type="button"
                        onClick={() => { setViewYear(year); setShowYearPicker(false); }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-orange-50 ${year === viewYear ? "bg-orange-100 text-orange-700 font-semibold" : "text-gray-700"}`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={nextMonth}
                className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ChevronRight size={18} className="text-gray-600" />
              </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 px-3 py-2 bg-gray-50 border-b border-gray-100">
              {DAYS.map((day) => (
                <div key={day} className="text-center text-xs font-semibold text-gray-500 py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 p-3" onClick={() => { setShowMonthPicker(false); setShowYearPicker(false); }}>
              {generateCalendarDays().map((day, index) => (
                <div key={index} className="aspect-square">
                  {day !== null && (
                    <button
                      type="button"
                      onClick={() => handleDateClick(day)}
                      className={`w-full h-full rounded-lg font-medium text-sm transition-all duration-200 ${isSelected(day)
                        ? "bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/30"
                        : isToday(day)
                          ? "bg-orange-100 text-orange-700 font-bold"
                          : "text-gray-700 hover:bg-gray-100"
                        }`}
                    >
                      {day}
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  const today = new Date();
                  setViewMonth(today.getMonth());
                  setViewYear(today.getFullYear());
                }}
                className="px-3 py-2 text-sm font-medium text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateField;
