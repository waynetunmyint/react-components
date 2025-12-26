"use client";
import { useEffect, useState } from "react";
import {
  Gift,
  MessageSquare,
  Coins,
  ShoppingBag,
  Apple,
  Smartphone,
  CheckCircle,
  X,
  Crown,
  Star,
} from "lucide-react";
import { APP_NAME, BASE_URL, IMAGE_URL } from "../../config";
import { formatNumber } from "./Formatter_Comp";
import { getAppInfoByAppName, UniversalGetStoredJWT, UniversalGetStoredProfile } from "./Stored_InformationComp";

const TokenCheckDailyLoginTokenModalComp = () => {
  const [showModal, setShowModal] = useState(false);
  const [checking, setChecking] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [appData, setAppData] = useState<any>(null);


  // Detect platform
  const isAndroid = /Android/i.test(navigator.userAgent);
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isMobile = isAndroid || isIOS;

  const storedProfile = UniversalGetStoredProfile();
  const token = UniversalGetStoredJWT();

  useEffect(() => {
    if (storedProfile && token) checkDateAndClaimToken();
    else setChecking(false);
    getApplicationInformation();
  }, []);

  const getApplicationInformation = async () => {
    const responseData = await getAppInfoByAppName(APP_NAME);
    //console.log("response data", responseData);
    setAppData(responseData);
  }

  const checkDateAndClaimToken = async () => {
    try {
      if (!storedProfile?.Email || !token) return setChecking(false);

      const profileForm = new FormData();
      profileForm.append("email", storedProfile.Email);

      const profileRes = await fetch(`${BASE_URL}/profile/api/byEmail`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: profileForm,
      });

      const profileJSON = await profileRes.json();
      const fetchedProfile = Array.isArray(profileJSON)
        ? profileJSON[0]
        : profileJSON;
      localStorage.setItem("StoredItem", JSON.stringify(fetchedProfile));

      if (fetchedProfile?.Email === "logo.png") {
        alert("Please update your profile to claim tokens");
        window.location.href = "/profile/update";
      }
      setProfile(fetchedProfile);

      const checkForm = new FormData();
      checkForm.append("email", storedProfile.Email);
      checkForm.append("appName", APP_NAME);

      const checkRes = await fetch(
        `${BASE_URL}/profile/api/checkTokenClaimable`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: checkForm,
        }
      );

      const checkJSON = await checkRes.json();
      //console.log("Token claimable check:", checkJSON);
      if (checkJSON.canClaim) {
        setShowModal(true);

        const formData = new FormData();
        formData.append("email", storedProfile.Email);
        formData.append("appName", APP_NAME);
        const response = await fetch(`${BASE_URL}/profile/api/claimToken`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        const result = await response.json();
       // console.log("Token claim result:", result);

        if (response.ok && result.success) {
          setMessage(result?.message || "🎉 Token claimed successfully!");
          setProfile((prev: any) =>
            prev
              ? {
                ...prev,
               Token: Number(prev.Token) + 1,
                UsableToken: Number(prev.UsableToken) + 1,
              }
              : prev
          );
        }
      }
    } catch (error) {
      console.error("Error checking token date:", error);
    } finally {
      setChecking(false);
    }
  };




  return (
    <>
      {/* SKELETON LOADING */}
      {checking && (
        <div className="animate-pulse bg-white rounded-3xl shadow-sm p-6 mb-4">
          <div className="h-32 bg-gray-200 rounded-2xl mb-4"></div>
          <div className="grid grid-cols-3 gap-3">
            <div className="h-24 bg-gray-200 rounded-2xl"></div>
            <div className="h-24 bg-gray-200 rounded-2xl"></div>
            <div className="h-24 bg-gray-200 rounded-2xl"></div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <div className="h-12 bg-gray-200 rounded-2xl"></div>
            <div className="h-12 bg-gray-200 rounded-2xl"></div>
          </div>
        </div>
      )}

      {/* LOGIN BUTTON (Guest) */}
      {!storedProfile && !checking && (
        <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-3xl shadow-lg overflow-hidden mb-4">
          <button
            onClick={() => (window.location.href = "/login")}
            className="w-full flex flex-col items-center justify-center gap-3 py-8 text-white active:scale-95 transition-transform duration-200"
          >
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Gift className="w-9 h-9" />
            </div>
            <span className="text-lg font-semibold">Login to Claim Daily Gift</span>
          </button>
        </div>
      )}




       {/* iPhone 17 Promotional Banner */}
      {storedProfile && !checking && profile && (
        <div 
          onClick={() => (window.location.href = "/top-up")}
          className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl shadow-2xl overflow-hidden mb-4 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 border border-slate-700/50"
        >
          <div className="relative p-6">
            {/* Animated background effects */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-500/20 to-pink-500/20 rounded-full blur-3xl" />
            
            <div className="relative flex items-center justify-between gap-4">
              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">
                    Exclusive Reward
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1 tracking-tight">
                  Win iPhone 17
                </h3>
                <p className="text-slate-300 text-sm mb-3">
                  Top up now to earn your chance!
                </p>
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                  <ShoppingBag className="w-4 h-4 text-white" />
                  <span className="text-white text-sm font-medium">Start Earning →</span>
                </div>
              </div>

              {/* iPhone Icon */}
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl flex items-center justify-center shadow-xl border border-slate-600/50 transform hover:rotate-6 transition-transform duration-300">
                  <Smartphone className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <Crown className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>
          </div>
          </div>
      )}



      {/* REWARD CENTER (Logged in) - All in One Card */}
      {storedProfile && !checking && profile && !showModal && (
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden mb-4 border border-gray-200/50">
          {/* Token Balance Header */}
          <div className="relative p-6">
            {/* macOS-style subtle gradients */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-50 to-transparent rounded-full -mr-20 -mt-20 opacity-40" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-50 to-transparent rounded-full -ml-16 -mb-16 opacity-40" />

            <div className="relative flex items-center justify-between">
              <div className="flex-1">
                <p className="text-gray-500 text-sm font-medium mb-2">
                  Your Balance
                </p>
                <div className="flex items-center gap-3 ">
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-md">
                    <Coins className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-3xl font-semibold text-gray-700 tracking-tight hover:scale-105">
                    {formatNumber(profile?.UsableToken) ?? 0}
                    <p className="text-gray-400 text-sm mt-0 font-medium">Usable Tokens</p>
                  </span>
                </div>

              </div>

              {/* Profile Thumbnail */}
              <div className="w-12 h-12 hover:scale-105 rounded-full overflow-hidden shadow-lg ring-4 ring-white/50">
                {profile?.Thumbnail ? (
                  <img
                    src={IMAGE_URL + "/uploads/" + profile.Thumbnail}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onClick={() => window.location.href = "/profile"}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                    <span className="text-2xl text-white font-semibold">
                      {profile?.Name?.charAt(0) || '?'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons - Three in a row */}
          <div className="px-4 pb-4 grid grid-cols-3 gap-3">
            {/* Reward Center */}
            <button
              onClick={() => (window.location.href = "/reward")}
              className="group hover:scale-105 relative overflow-hidden bg-gradient-to-b bg-red-600 text-white font-medium py-5 rounded-2xl shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-150"
            >
              <div className="relative flex flex-col items-center justify-center gap-2">
                <div className="w-11 h-11  rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Gift className="w-10 h-10" />
                </div>
                <span className="text-xs font-medium">Reward</span>
              </div>
            </button>

            {/* Meet Friends */}
            <button
              onClick={() => (window.location.href = "/chatGroup")}
              className="group hover:scale-105 relative overflow-hidden bg-gradient-to-b bg-blue-600 text-white font-medium py-5 rounded-2xl shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-150"
            >
              <div className="relative flex flex-col items-center justify-center gap-2">
                <div className="w-11 h-11  rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <MessageSquare className="w-10 h-10" />
                </div>
                <span className="text-xs font-medium">Friends</span>
              </div>
            </button>

            {/* Top Up */}
            <button
              onClick={() => (window.location.href = "/top-up")}
              className="group hover:scale-105 relative overflow-hidden bg-gradient-to-b bg-green-600 text-white font-medium py-5 rounded-2xl shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-150"
            >
              <div className="relative flex flex-col items-center justify-center gap-2">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <span className="text-xs font-medium">Top Up</span>
              </div>
            </button>
          </div>


          <div className="flex flex-col  gap-3 items-center justify-center p-4">
            {!isMobile && (
              <div className="grid grid-cols-2 gap-3 w-full w-full">
                {[
                  { url: appData?.AndroidURL, icon: Smartphone, label: "Android", colors: "bg-green-600" },
                  { url: appData?.AppleURL, icon: Apple, label: "iOS", colors: "bg-gray-800" }
                ].map(({ url, icon: Icon, label, colors }) => (
                  url && url !== "-" ? (
                    <a
                      key={label}
                      href={url}
                      target="_blank"
                      className={`flex items-center gap-3 bg-gradient-to-r ${colors} text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 justify-center`}
                    >
                      <Icon className="w-6 h-6" />
                      <span className="font-semibold">Download for {label}</span>
                    </a>
                  ) : (
                    <div key={label} className="border border-dashed flex items-center gap-3 bg-gray-500 text-gray-600 px-6 py-3 rounded-lg justify-center cursor-not-allowed">
                      <Icon className="w-6 h-6 text-white" />
                      <span className="font-semibold text-white">Coming Soon</span>
                    </div>
                  )
                ))}
              </div>
            )}
          </div>




        </div>
      )}



      {/* CLAIMEd TOKEN MODAL */}
      {storedProfile && profile && showModal && !checking && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 px-4">
          <div className="bg-white/95 backdrop-blur-xl w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            {/* Header with gradient */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12" />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <CheckCircle className="w-7 h-7 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Success!</h2>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white/30 active:scale-90 transition-all"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-10 h-10 text-green-600" />
              </div>

              <h3 className="text-2xl font-bold text-gray-800 mb-2">Token Claimed!</h3>
              <p className="text-gray-600 text-base leading-relaxed mb-6">
                Your daily login token has been successfully claimed. Come back tomorrow for more rewards!
              </p>

              <button
                onClick={() => setShowModal(false)}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold text-base rounded-2xl shadow-lg hover:shadow-xl active:scale-95 transition-all"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TokenCheckDailyLoginTokenModalComp;