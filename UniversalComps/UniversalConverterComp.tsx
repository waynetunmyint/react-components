// utils/dateFormat.ts
export function convertToDateTime(input: string | number | Date): string {
  if (!input) return "";

  let date: Date;

  if (typeof input === "string") {
    // Handle MySQL DATETIME format "YYYY-MM-DD HH:mm:ss"
    date = new Date(input.replace(" ", "T")); // convert to ISO-like format
  } else if (typeof input === "number") {
    date = new Date(input);
  } else {
    date = input;
  }

  if (isNaN(date.getTime())) return "";

  const day = date.getDate().toString().padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "long" });
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12 || 12; // convert 0 -> 12
  const hourStr = hours.toString();

  return `${day}-${month}-${year} ${hourStr}:${minutes}${ampm}`;
}
