import { BASE_URL, IMAGE_URL } from "../../../config";
import { Loader2, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, provider as googleProvider } from "../_firebase/firebaseConfig";
import { checkFirebaseConnectivity } from "../HelperComps/firebaseConnectivity";

interface Props {
    appName?: string;
    className?: string;
}

export default function BackendLoginComp({
    appName = "App",
    className = "",
}: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [isFirebaseBlocked, setIsFirebaseBlocked] = useState(false);
    const [showEmailLogin, setShowEmailLogin] = useState(false);
    const [email, setEmail] = useState('');

    const [contactInfo, setContactInfo] = useState<any>([]);
    const getContactInfo = async () => {
        // Placeholder for future settings retrieval logic
        const response = await fetch(BASE_URL + "/contactInfo/api/1");
        const responseJson = await response.json();
        // console.log("Contact Info:", responseJson);
        setContactInfo(responseJson[0]);
    }

    useEffect(() => {
        (async () => {
            const isConnected = await checkFirebaseConnectivity();
            setIsFirebaseBlocked(!isConnected);
            getContactInfo();
        })();
    }, []);

    const handleLogin = async () => {
        setIsLoading(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const loggedUser = result.user;

            if (!loggedUser?.email) throw new Error("No email from Google");

            await performBackendLogin(loggedUser.email);
        } catch (error) {
            console.error("Google login error:", error);
            alert("Login failed. Check your connection or use VPN.");
        } finally {
            setIsLoading(false);
        }
    };

    const performBackendLogin = async (userEmail: string) => {
        setIsLoading(true);
        try {
            const formData = new URLSearchParams();
            formData.append("pageId", "1");
            formData.append("email", userEmail);

            const response = await fetch(`${BASE_URL}/user/api/login`, {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (data?.apiData?.Email && data?.jwtToken) {
                localStorage.setItem(
                    "StoredUser",
                    JSON.stringify({ email: data.apiData.Email })
                );
                localStorage.setItem("StoredJWT", data.jwtToken);
                window.location.href = "/article";
            } else {
                localStorage.removeItem("StoredUser");
                localStorage.removeItem("StoredJWT");
                localStorage.removeItem("StoredProfile");
                alert("Login failed. User not found in database.");
            }
        } catch (error) {
            console.error("Backend login error:", error);
            alert("Login failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEmailLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        performBackendLogin(email);
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
                                src={IMAGE_URL + "/uploads/" + (contactInfo?.Thumbnail || "logo.png")}
                                alt={`${appName} logo`}
                                className="relative w-20 h-20 object-contain transform group-hover:scale-110 transition-transform duration-300"
                            />
                        )}
                </div>
            </div>


            {/* Title */}
            <div className="text-center mb-8 animate-[fadeIn_0.8s_ease-out]">
                <h1 className="text-3xl font-bold  mb-3 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                    {appName}
                </h1>
                <p className="text-gray-600 text-sm">Sign in to access your account and get started</p>
            </div>

            {/* Sign-in Options */}
            {!showEmailLogin ? (
                <div className="space-y-4">
                    <button
                        onClick={handleLogin}
                        disabled={isLoading}
                        className="relative w-full bg-red-900 hover:bg-gray-50 text-white font-semibold py-4 px-6 rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:text-gray-900 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="relative flex items-center justify-center gap-3">
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin " />
                            ) : (
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                            )}
                            <span className="text-base">{isLoading ? "Signing in..." : "Continue with Google"}</span>
                        </div>
                    </button>

                    <button
                        onClick={() => setShowEmailLogin(true)}
                        className="w-full py-3 text-sm text-gray-500 hover:text-gray-900 transition-colors"
                    >
                        Can't connect? Use Email Login
                    </button>

                    {isFirebaseBlocked && (
                        <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex gap-3 animate-pulse">
                            <Info className="w-5 h-5 text-red-500 shrink-0" />
                            <div className="text-xs text-red-800">
                                <b>Firebase unreachable.</b> Please use a VPN or the email login option.
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <form onSubmit={handleEmailLogin} className="space-y-4 animate-[fadeIn_0.4s_ease-out]">
                    <div className="relative">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
                    >
                        {isLoading ? 'Verifying...' : 'Login Now'}
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowEmailLogin(false)}
                        className="w-full text-xs text-gray-500 hover:text-gray-900 transition-colors"
                    >
                        Back to Google Login
                    </button>
                </form>
            )}

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-sm text-gray-500 font-medium">Secure Access</span>
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

