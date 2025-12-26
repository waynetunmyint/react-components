import { initializeApp, FirebaseOptions, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";
import { getEncryptedItem } from "../HelperComps/encryptionHelper";

let firebaseConfig: FirebaseOptions | null = null;
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let provider: GoogleAuthProvider | null = null;
let isInitialized = false;
let initAttempts = 0;
const MAX_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 second

const initializeFirebase = (): boolean => {
  try {
    const raw = getEncryptedItem("StoredEncryptedPage");

    if (raw) {
      // raw might be string or object, handle both
      const page = typeof raw === "string" ? JSON.parse(raw) : raw;

      if (page.FirebaseConfig) {
        try {
          const config = new Function(`return ({${page.FirebaseConfig}})`)();
          firebaseConfig = config;
          app = initializeApp(config);
          auth = getAuth(app);
          provider = new GoogleAuthProvider();
          isInitialized = true;
          console.log('Firebase initialized successfully');
          return true;
        } catch (err) {
          console.error("FirebaseConfig parse error:", err);
          return false;
        }
      }
    }
    return false;
  } catch (err) {
    console.warn("Firebase initialization skipped:", err);
    return false;
  }
};

// Wait for initialization or reload page
const waitForInitialization = async () => {
  if (initializeFirebase()) {
    return;
  }

  initAttempts++;

  if (initAttempts < MAX_ATTEMPTS) {
    console.log(`Firebase initialization attempt ${initAttempts}/${MAX_ATTEMPTS}...`);
    setTimeout(waitForInitialization, RETRY_DELAY);
  } else {
    console.warn('Firebase initialization failed after multiple attempts. Reloading page...');
    window.location.reload();
  }
};

// Try to initialize immediately (only on client)
if (typeof window !== "undefined") {
  waitForInitialization();
}

// Export function to reinitialize if needed
export const reinitializeFirebase = initializeFirebase;

export { auth, provider, isInitialized };
