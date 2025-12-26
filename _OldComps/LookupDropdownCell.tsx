"use client";
import { useEffect, useState } from "react";
import { BASE_URL } from "@/config";
import { GetStoredJWT } from "./Storage_Comp";

interface Props {
  item: any;
  fieldName: string;
  customTable: string;
  dataSource?: string; // parent table to PATCH (optional)
  idField?: string;
  displayField?: string; // field in customTable used as label
  onUpdated?: (updatedItem: any) => void;
}

export default function LookupDropdownCell({
  item,
  fieldName,
  customTable,
  dataSource,
  idField = "Id",
  displayField = "Name",
  onUpdated,
}: Props) {
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const token = GetStoredJWT();

  useEffect(() => {
    let mounted = true;
    const fetchOptions = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/${customTable}/api`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch lookup options");
        const data = await res.json();
        if (!Array.isArray(data)) {
          setOptions([]);
        } else if (mounted) {
          setOptions(data);
        }
      } catch (err) {
        console.error("Lookup fetch error:", err);
        if (mounted) setOptions([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchOptions();
    return () => {
      mounted = false;
    };
  }, [customTable]);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    // local optimistic update
    if (!dataSource) {
      if (onUpdated) onUpdated({ ...item, [fieldName]: val });
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("id", item[idField]);
      formData.append(fieldName, val);

      const res = await fetch(`${BASE_URL}/${dataSource}/api`, {
        method: "PATCH",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      });

      if (!res.ok) throw new Error("Update failed");

      // notify other components (Table_ActionComp) to update their state
      const detail = { id: item[idField], fieldName, value: val };
      document.dispatchEvent(new CustomEvent("mws:row-updated", { detail }));

      if (onUpdated) onUpdated({ ...item, [fieldName]: val });
    } catch (err) {
      console.error("Lookup update error:", err);
      // keep UI stable; a more robust implementation would show non-blocking error UI
      alert("Update failed");
    } finally {
      setSaving(false);
    }
  };

  const current = item?.[fieldName] ?? "";

  return (
    <div>
      {loading ? (
        <span className="text-sm text-gray-500">Loading...</span>
      ) : (
        <select
          value={current}
          onChange={handleChange}
          disabled={saving}
          className="text-sm border rounded px-2 py-1 bg-white"
        >
          <option value="">— Select —</option>
          {options.map((opt) => {
            const key = opt.Id ?? opt[idField] ?? JSON.stringify(opt);
            const value = opt.Id ?? opt[idField] ?? (opt[displayField] ?? key);
            const label = opt[displayField] ?? opt.Name ?? opt.Title ?? String(value);
            return (
              <option key={key} value={value}>
                {label}
              </option>
            );
          })}
        </select>
      )}
    </div>
  );
}
