"use client";
import { BASE_URL, IMAGE_URL } from "@/config";
import { LogIn, Loader2 } from "lucide-react";
import { use, useEffect, useState } from "react";

interface Props {
  appName?: string;
  onGoogleLogin: () => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

export default function LoginComp({
  appName = "App",
  onGoogleLogin,
  isLoading: externalLoading,
  className = "",
}: Props) {
  const [internalLoading, setInternalLoading] = useState(false);
  const isLoading = externalLoading ?? internalLoading;

  const [contactInfo, setContactInfo] = useState<any>([]);
  const getContactInfo = async () => {
    // Placeholder for future settings retrieval logic
    const response = await fetch(BASE_URL+"/contactInfo/api/1");
    const responseJson = await response.json();
    console.log("Contact Info:", responseJson);
    setContactInfo(responseJson[0]);
  }

  useEffect(() => {
    getContactInfo();
  }, []);

  const handleLogin = async () => {
    if (externalLoading === undefined) {
      setInternalLoading(true);
    }
    try {
      await onGoogleLogin();
    } finally {
      if (externalLoading === undefined) {
        setInternalLoading(false);
      }
    }
  };

  return (
    <div
      className={`w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100 ${className}`}
    >
      {/* Logo */}

        <div className="flex justify-center mb-6 animate-[fadeIn_0.6s_ease-out]">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300" />
           {contactInfo &&
           (
                        <img
              src={IMAGE_URL+ "/uploads/" + (contactInfo?.Thumbnail || "logo.png")}
              alt={`${appName} logo`}
              className="relative w-20 h-20 object-contain transform group-hover:scale-110 transition-transform duration-300"
            />

           )}

          </div>
        </div>


      {/* Title */}
      <div className="text-center mb-8 animate-[fadeIn_0.8s_ease-out]">
        <h1 className="text-3xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
          {appName}
        </h1>
        <p className="text-gray-600 text-sm">Sign in to access your account and get started</p>
      </div>

      {/* Google Sign-in Button */}
      <button
        onClick={handleLogin}
        disabled={isLoading}
        className="relative w-full bg-red-900 hover:bg-gray-50 text-white font-semibold py-4 px-6 rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:text-gray-900 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden transform hover:scale-[1.02] active:scale-[0.98]"
      >
        {/* Hover effect background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="relative flex items-center justify-center gap-3">
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin " />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          <span className="text-base">{isLoading ? "Signing in..." : "Continue with Google"}</span>
        </div>
      </button>

      {/* Divider */}
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-sm text-gray-500 font-medium">Secure Login</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-gray-500 leading-relaxed">
        By signing in, you agree to our{" "}
        <a
          href="#"
          className=" hover:text-blue-700 font-medium underline"
        >
          Terms
        </a>{" "}
        and{" "}
        <a
          href="#"
          className=" hover:text-blue-700 font-medium underline"
        >
          Privacy Policy
        </a>
      </p>
    </div>
  );
}

// Usage example:
// <LoginComp
//   appName="MyApp"
//   logoImage="/logo.png"
//   onGoogleLogin={async () => {
//     await loginWithGoogle();
//   }}
// />