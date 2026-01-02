"use client";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";
import { signInWithPopup, signOut, User } from "firebase/auth";
import { BASE_URL } from "@/config";
import { auth, provider as googleProvider } from "../_firebase/firebaseConfig";

interface AuthContextType {
  user: User | null;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loginWithGoogle: async () => { },
  logout: () => { },
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const loginWithGoogle = async () => {
    if (!auth) {
      console.error("Firebase Auth not initialized");
      alert("Auth not ready. Please try again.");
      return;
    }
    try {
      const result = await signInWithPopup(auth, googleProvider!); // Provider is also non-null if auth is initialized
      const loggedUser = result.user;

      if (!loggedUser?.email) throw new Error("No email from Google");

      // Send email to backend
      const formData = new URLSearchParams();
      formData.append("pageId", "1");
      formData.append("email", loggedUser.email);

      const response = await fetch(`${BASE_URL}/user/api/login`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("Backend response:", data);

      // Correct check
      if (data?.userData?.Email && data?.token) {
        setUser(loggedUser);
        localStorage.setItem(
          "StoredUser",
          JSON.stringify({ email: data.userData.Email })
        );
        localStorage.setItem("StoredJWT", data.token);

        window.location.href = "/article";
      } else {
        await signOut(auth);
        setUser(null);
        localStorage.removeItem("StoredUser");
        localStorage.removeItem("StoredJWT");
        localStorage.removeItem("StoredProfile");
        alert("Login failed. User not found in database.");
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Google login error:", error);
      alert("Login failed. Please try again.");
      window.location.href = "/login";
    }
  };

  const logout = () => {
    if (auth) {
      signOut(auth).then(() => {
        setUser(null);
        localStorage.removeItem("StoredUser");
        localStorage.removeItem("StoredJWT");
        localStorage.removeItem("StoredProfile");
        window.location.href = "/login";
      });
    } else {
      // Force logout locally if auth is broken
      setUser(null);
      localStorage.removeItem("StoredUser");
      localStorage.removeItem("StoredJWT");
      localStorage.removeItem("StoredProfile");
      window.location.href = "/login";
    }
  };

  return (
    <AuthContext.Provider value={{ user, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
