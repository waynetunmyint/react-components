// Simple encryption/decryption utility for localStorage
// Uses base64 encoding with a simple XOR cipher

const SECRET_KEY = "MySecretKey2024!@#$%"; // Change this to your own secret key

/**
 * Encrypt a string using XOR cipher and base64 encoding
 * Handles Unicode characters properly
 */
export const encrypt = (text: string): string => {
  try {
    if (!text) return "";

    // Convert to UTF-8 bytes
    const utf8Bytes = new TextEncoder().encode(text);

    // XOR encryption
    const encrypted = new Uint8Array(utf8Bytes.length);
    for (let i = 0; i < utf8Bytes.length; i++) {
      encrypted[i] = utf8Bytes[i] ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length);
    }

    // Convert to binary string for btoa
    let binaryString = "";
    for (let i = 0; i < encrypted.length; i++) {
      binaryString += String.fromCharCode(encrypted[i]);
    }

    // Base64 encode
    return btoa(binaryString);
  } catch (error) {
    console.error("Encryption error:", error);
    return text;
  }
};

/**
 * Decrypt a string that was encrypted with the encrypt function
 * Handles Unicode characters properly
 */
export const decrypt = (encryptedText: string): string => {
  try {
    if (!encryptedText) return "";

    // Base64 decode to binary string
    const binaryString = atob(encryptedText);

    // Convert binary string to byte array
    const encrypted = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      encrypted[i] = binaryString.charCodeAt(i);
    }

    // XOR decryption
    const decrypted = new Uint8Array(encrypted.length);
    for (let i = 0; i < encrypted.length; i++) {
      decrypted[i] = encrypted[i] ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length);
    }

    // Convert back from UTF-8 bytes to string
    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error("Decryption error:", error);
    return "";
  }
};

/**
 * Store encrypted data in localStorage
 */
export const setEncryptedItem = (key: string, value: unknown): void => {
  try {
    if (typeof window === "undefined") return;
    const jsonString = typeof value === 'string' ? value : JSON.stringify(value);
    const encrypted = encrypt(jsonString);
    localStorage.setItem(key, encrypted);
  } catch (error) {
    console.error("Error storing encrypted item:", error);
  }
};

/**
 * Retrieve and decrypt data from localStorage
 */
export const getEncryptedItem = (key: string): unknown => {
  try {
    if (typeof window === "undefined") return null;
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;

    const decrypted = decrypt(encrypted);

    // Try to parse as JSON, if it fails return as string
    try {
      return JSON.parse(decrypted);
    } catch {
      return decrypted;
    }
  } catch (error) {
    console.error("Error retrieving encrypted item:", error);
    return null;
  }
};

/**
 * Remove item from localStorage
 */
export const removeEncryptedItem = (key: string): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(key);
  }
};
