  export function formatNumber(numberString: any): import("react").ReactNode {
    if (numberString === null || numberString === undefined) return 0;
    // Remove existing commas if it's a string, then convert to number
    const cleaned =
      typeof numberString === "string" ? numberString.replace(/,/g, "").trim() : numberString;
    const num = Number(cleaned);
    if (Number.isNaN(num)) return numberString;
    // Use en-US formatting to ensure thousand separators (commas)
    return Intl.NumberFormat("en-US").format(num);
  }

  export  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };



    // Validate identifier to prevent SQL injection
  export  const sanitizeIdentifier = (identifier: string): string => {
      if (!/^[a-zA-Z0-9_]+$/.test(identifier)) {
        throw new Error(`Invalid identifier: ${identifier}`);
      }
      return identifier;
    };
  



export const isValidValue = (val: any) =>
  val !== null && val !== undefined && val !== "-" && val !== "null";

export const detectFieldType = (val: string) => {
  if (!val || !isValidValue(val)) return "text";
  if (/^\+?[0-9\s\-]{5,20}$/.test(val)) return "phone";
  if (/^[\w.-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(val)) return "email";
  if (/^https?:\/\//.test(val)) return "url";
  return "text";
};
