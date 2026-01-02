"use client";
import React, { useEffect, useState } from "react";
import { Globe, Apple, Play, CreditCard, Copy, Smartphone, Gift, Sparkles, ArrowRight, CheckCircle } from "lucide-react";
import { IonToast } from "@ionic/react";
import { GetStoredJWT, GetStoredProfile } from "../StorageComps/StorageCompOne";
import { BASE_URL } from "@/config";

export default function TopUpComp() {
  const [setting, setSetting] = useState<any>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchSetting();
  }, []);

  const fetchSetting = async () => {
    try {
      const response = await fetch(BASE_URL + "/setting/api/1");
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      setSetting(data[0]);
    } catch (error) {
      console.error("Error fetching setting:", error);
      setToastMessage("Failed to load setting.");
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const storedProfile = await GetStoredProfile();
        if (!storedProfile?.Email) throw new Error("No stored profile found");

        const formData = new FormData();
        formData.append("email", storedProfile.Email);

        const token = await GetStoredJWT();
        const response = await fetch(`${BASE_URL}/profile/api/byEmail`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const resJSON = await response.json();
        const dataToSave = Array.isArray(resJSON) ? resJSON[0] : resJSON;
        localStorage.setItem("StoredItem", JSON.stringify(dataToSave));
        setProfile(dataToSave);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleTopUp = (type: string) => {
    if (type === "url") {
      window.open(setting?.TopUpURL, "_blank");
    } else {
      setToastMessage(`${type} TopUp feature coming soon`);
    }
  };

  const handleCopyUserId = () => {
    if (profile?.Id) {
      navigator.clipboard.writeText(profile.Id.toString());
      setCopied(true);
      setToastMessage("User ID copied! ✅");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const topUpMethods = [
    {
      id: "messenger",
      type: "url",
      icon: Globe,
      label: "Messenger",
      subtitle: "Quick & Easy",
      color: "from-blue-500 to-blue-600",
      hoverColor: "hover:from-blue-600 hover:to-blue-700",
      available: true,
    },
    {
      id: "google",
      type: "Google",
      icon: Play,
      label: "Google Pay",
      subtitle: "Secure Payment",
      color: "from-green-500 to-green-600",
      hoverColor: "hover:from-green-600 hover:to-green-700",
      available: false,
    },
    {
      id: "apple",
      type: "Apple",
      icon: Apple,
      label: "Apple Pay",
      subtitle: "Fast Checkout",
      color: "from-gray-700 to-gray-800",
      hoverColor: "hover:from-gray-800 hover:to-gray-900",
      available: false,
    },
    {
      id: "kpay",
      type: "KPay",
      icon: CreditCard,
      label: "KPay",
      subtitle: "Local Payment",
      color: "from-purple-500 to-purple-600",
      hoverColor: "hover:from-purple-600 hover:to-purple-700",
      available: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 pb-24">
      <IonToast
        isOpen={!!toastMessage}
        onDidDismiss={() => setToastMessage(null)}
        message={toastMessage || ""}
        duration={2000}
        position="top"
        color="dark"
        translucent={true}
        cssClass="text-center text-base font-medium bg-black/80 text-white py-2 px-4 rounded-2xl"
      />

      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center gap-2 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Gift className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Top Up Tokens</h1>
          <p className="text-gray-600">Choose your preferred payment method</p>
        </div>

        {setting ? (
          <>
            {/* iPhone 17 Prize Banner */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl shadow-2xl overflow-hidden mb-6 border border-slate-700/50">
              <div className="relative p-6">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-500/20 to-pink-500/20 rounded-full blur-3xl" />

                <div className="relative flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5 text-yellow-400" />
                      <span className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">
                        Grand Prize
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-1">iPhone 17</h2>
                    <p className="text-slate-300 text-sm">
                      Top up to enter the draw!
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl flex items-center justify-center shadow-xl border border-slate-600/50">
                    <Smartphone className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* User ID Card */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-5 mb-6 border border-gray-200/50">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <p className="text-gray-500 text-xs font-medium mb-1 uppercase tracking-wide">
                    Your User ID
                  </p>
                  <p className="text-2xl font-bold text-gray-800">
                    #{profile?.Id || "---"}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    Use this ID for top-up
                  </p>
                </div>
                <button
                  onClick={handleCopyUserId}
                  disabled={!profile?.Id}
                  className={`p-4 rounded-2xl transition-all shadow-md ${copied
                    ? "bg-green-500 text-white scale-95"
                    : "bg-gradient-to-br from-pink-500 to-purple-600 text-white hover:scale-105 active:scale-95"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  aria-label="Copy User ID"
                >
                  {copied ? (
                    <CheckCircle size={24} className="animate-in zoom-in" />
                  ) : (
                    <Copy size={24} />
                  )}
                </button>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-700 mb-4 px-1">
                Payment Methods
              </h3>

              {topUpMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => handleTopUp(method.type)}
                  disabled={!method.available}
                  className={`w-full group relative overflow-hidden rounded-2xl shadow-lg transition-all duration-300 ${method.available
                    ? `bg-gradient-to-r ${method.color} ${method.hoverColor} hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]`
                    : "bg-gradient-to-r from-gray-400 to-gray-500 opacity-60 cursor-not-allowed"
                    }`}
                >
                  <div className="relative p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                        <method.icon size={24} className="text-white" />
                      </div>
                      <div className="text-left">
                        <p className="text-white font-semibold text-lg">
                          {method.label}
                        </p>
                        <p className="text-white/80 text-sm">
                          {method.available ? method.subtitle : "Coming Soon"}
                        </p>
                      </div>
                    </div>
                    {method.available && (
                      <ArrowRight
                        size={24}
                        className="text-white/80 group-hover:translate-x-1 transition-transform"
                      />
                    )}
                  </div>

                  {/* Shine effect for available methods */}
                  {method.available && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  )}
                </button>
              ))}
            </div>

            {/* Info Card */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Gift className="w-5 h-5 " />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900 mb-1">
                    💡 Need Help?
                  </p>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    Copy your User ID and send it along with your payment proof to complete the top-up process.
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          // Loading Skeleton
          <div className="space-y-4 animate-pulse">
            <div className="h-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl" />
            <div className="h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}