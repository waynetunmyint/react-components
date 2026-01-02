import React, { useEffect, useState } from "react";
import { Coins, Wallet } from "lucide-react";
import { GetStoredJWT, GetStoredProfile } from "../StorageComps/StorageCompOne";
import { BASE_URL, IMAGE_URL } from "@/config";


interface Profile {
  RankThumbnail?: string;
  RankTitle?: string;
  Token?: number;
  UsableToken?: number;
}

const RewardComp: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const storedProfile = GetStoredProfile();

  const handleSwap = () => {
    setError("🚧 Swap feature coming soon.");
    setTimeout(() => setError(null), 3000);
  };

  const handleRedirect = () => {
    if (
      window.confirm(
        "You are about to leave the app and visit the Token Home Page. Daily login already provides daily tokens and you do not need to purchase anything. Continue?"
      )
    ) {
      window.location.href =
        "https://pump.fun/coin/ay8i8RneAGXFPDXBTvT1jrsCdu87VnXTJkvtfqRpump";
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const storedEmail = storedProfile?.Email;
        if (!storedEmail) {
          console.warn("No stored email found.");
          setLoading(false);
          return;
        }

        const formData = new FormData();
        formData.append("email", storedEmail);

        // ✅ ensure token is awaited if UniversalGetStoredJWT is async
        const token = await GetStoredJWT();

        const response = await fetch(`${BASE_URL}/profile/api/byEmail`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const resJSON = await response.json();
        const dataToSave = Array.isArray(resJSON) ? resJSON[0] : resJSON;

        localStorage.setItem("StoredItem", JSON.stringify(dataToSave));
        setProfile(dataToSave);

        // ✅ show prompt if profile is incomplete
        if (!dataToSave?.Email) {
          const shouldRedirect = window.confirm(
            "Your profile is incomplete.\nPlease update your profile information to access the reward page."
          );
          if (shouldRedirect) {
            window.location.href = "/profile/update";
          }
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);


  // Provide default values to avoid undefined errors
  const RankThumbnail = profile?.RankThumbnail;
  const RankTitle = profile?.RankTitle;
  const Token = profile?.Token ?? 0;
  const UsableToken = profile?.UsableToken ?? 0;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md space-y-5 w-full">

      {/* Loading State */}
      {loading && <p className="text-gray-500 text-center">Loading profile...</p>}



      {/* Rank Info */}
      {RankTitle && (
        <div className="flex items-center gap-4 border-b pb-3">
          {RankThumbnail && (
            <img
              src={`${IMAGE_URL}/uploads/${RankThumbnail}`}
              alt={RankTitle}
              className="w-12 h-12 rounded-xl object-cover border border-gray-200"
            />
          )}
          <div>
            <p className="text-xs text-gray-400">Your Rank</p>
            <p className="font-semibold text-xl text-gray-900">{RankTitle}</p>
          </div>
        </div>
      )}

      {/* Token Balance */}
      <div className="flex items-center justify-between px-3 py-2 rounded-lg w-full">
        <div className="flex items-center gap-3">
          <Coins size={24} className="text-yellow-500" />
          <span className="text-gray-700 font-medium">Daily Tokens</span>
        </div>
        <span className="text-gray-900 font-bold text-lg">{Token}</span>
      </div>

      {/* Usable Token Balance */}
      <div className="flex items-center justify-between px-3 py-2 rounded-lg w-full">
        <div className="flex items-center gap-3">
          <Wallet size={24} className="text-green-500" />
          <span className="text-gray-700 font-medium flex items-center gap-2">
            Usable Tokens
            <button
              onClick={handleSwap}
              className=" bg-blue-100 hover:bg-blue-200 transition px-3 py-1 rounded-full text-xs font-semibold"
            >
              Swap
            </button>
          </span>
        </div>
        <span className="text-gray-900 font-bold text-lg">{UsableToken}</span>
      </div>
      {/* Error Message */}
      {error && <p className="text-red-500 text-center font-medium">{error}</p>}

      {/* Empty Token Message */}
      {Token === 0 && UsableToken === 0 && (
        <p className="text-sm text-red-500 text-center mt-2">
          You don’t have any tokens yet. Login daily to earn!
        </p>
      )}

      {/* Redirect Button */}
      <button
        onClick={handleRedirect}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl shadow-md transition flex justify-center items-center gap-2"
      >
        <span>Go To Token Home</span>
      </button>
    </div>
  );
};

export default RewardComp;
