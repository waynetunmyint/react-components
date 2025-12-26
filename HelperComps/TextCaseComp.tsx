import { IMAGE_URL } from "../../../config";


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



export function tablePluralizer(word: string): string {
  if (!word) return word;

  const lower = word.toLowerCase();

  // Words ending with consonant + y → drop y + ies
  if (lower.endsWith("y") && !/[aeiou]y$/.test(lower)) {
    return word.slice(0, -1) + "ies";
  }

  // Words ending with s, x, z, ch, sh → add "es"
  if (/(s|x|z|ch|sh)$/i.test(lower)) {
    return word + "es";
  }

  // Default → add "s"
  return word + "s";
}


export const toCamelCase = (str: string) =>
  str.replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : "")).replace(/^(.)/, (m) => m.toLowerCase());

export const priceFormatter = (value: number | string): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0';
  return num.toLocaleString('en-US');
};


export const getYouTubeEmbedUrl = (url: string | undefined) => {
  if (!url) return null;

  // Extract video ID from various YouTube URL formats
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);

  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }

  // If already an embed URL, return as is
  if (url.includes('/embed/')) {
    return url;
  }

  return null;
};


export const formatPrice = (value: number | string): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0';
  return num.toLocaleString('en-US');
};


export const formatNumber = (value: number | string): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0';
  return num.toLocaleString('en-US');
};

export const getImageUrl = (thumbnail: string | undefined) =>
  thumbnail ? `${IMAGE_URL}/uploads/${thumbnail}` : null;

export const normalizeUrl = (url: any) => {
  if (!url) return "";
  let s = String(url).trim();
  if (s === "" || s.toLowerCase() === "null" || s === "-") return "";

  // Remove all whitespace
  s = s.replace(/\s+/g, "");

  // Step 1: Standardize protocol or fix missing colon typos (e.g. https// -> https://)
  if (/^https?:\/\//.test(s)) {
    // already has proper protocol
  } else if (/^https?\/\//.test(s)) {
    s = s.replace(/^(https?)\/\//, "$1://");
  }

  // Step 2: Handle nested protocols (e.g. https://https:// or https://https//)
  while (/^https?:\/\/https?:\/\//.test(s) || /^https?:\/\/https?\/\//.test(s)) {
    s = s.replace(/^https?:\/\/https?:\/\//, "https://");
    s = s.replace(/^https?:\/\/https?\/\//, "https://");
  }

  // Step 3: Add protocol if missing
  if (!s.startsWith("https://") && !s.startsWith("http://")) {
    s = "https://" + s;
  }

  return s;
};

export const handleOpenLink = (url: string) => {
  if (!url) return;
  const normalized = normalizeUrl(url);
  if (normalized) {
    window.open(normalized, "_blank", "noopener,noreferrer");
  }
};




export const formatDate = (dateString: string | undefined) => {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
};



// utils/dateFormat.ts
export function convertDateTime(input: string | number | Date): string {
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