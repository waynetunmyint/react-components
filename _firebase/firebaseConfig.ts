import { initializeApp, FirebaseOptions, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";
import { getEncryptedItem } from "../HelperComps/encryptionHelper";
import { PAGE_ID } from "@/config";

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let provider: GoogleAuthProvider | null = null;

export const initializeFirebase = (): FirebaseApp | null => {
  if (app) return app;

  try {
    const raw = getEncryptedItem(`StoredEncryptedPage_${PAGE_ID}`);
    if (!raw) return null;

    const page = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!page?.FirebaseConfig) return null;

    let config: FirebaseOptions;
    // Handle both stringified JSON/JS-Object and object
    if (typeof page.FirebaseConfig === 'string') {
      try {
        // Try strict JSON first
        config = JSON.parse(page.FirebaseConfig);
      } catch {
        // Fallback to evaluating JS object string (original behavior)
        // This handles cases like: apiKey: "..." (unquoted keys)
        // Note: The input string might lack outer braces, so we wrap it.
        // If it already has braces, we might need to adjust, but based on prev code:
        // `return ({${page.FirebaseConfig}})` suggests it lacks braces.
        // However, let's try to be smart.
        const rawConfig = page.FirebaseConfig.trim();
        const hasBraces = rawConfig.startsWith('{') && rawConfig.endsWith('}');
        const body = hasBraces ? `return (${rawConfig})` : `return ({${rawConfig}})`;
        config = new Function(body)();
      }
    } else {
      config = page.FirebaseConfig;
    }

    app = initializeApp(config);
    auth = getAuth(app);
    provider = new GoogleAuthProvider();
    console.log('Firebase initialized successfully');

    return app;
  } catch (err) {
    console.error("Firebase initialization error:", err);
    return null;
  }
};

export { app, auth, provider };
