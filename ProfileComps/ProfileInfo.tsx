import React, { useEffect, useState } from "react";
import { Coins, Wallet, User, LogOut, RefreshCcw } from "lucide-react";
import { GetStoredJWT, GetStoredProfile } from "../StorageComps/StorageCompOne";
import { BASE_URL, IMAGE_URL, APP_NAME } from "@/config";
import { formatNumber } from "../HelperComps/TextCaseComp";

interface Profile {
    Name: string;
    Email: string;
    Thumbnail?: string;
    Token?: number;
    UsableToken?: number;
}

const ProfileInfo: React.FC = () => {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [imgSrc, setImgSrc] = useState<string>("");
    const storedProfile = GetStoredProfile();

    const fetchProfile = async () => {
        if (!storedProfile?.Email) {
            setLoading(false);
            return;
        }

        try {
            const formData = new FormData();
            formData.append("email", storedProfile.Email);

            const token = GetStoredJWT();
            const response = await fetch(`${BASE_URL}/profile/api/byEmail`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (response.ok) {
                const resJSON = await response.json();
                const data = Array.isArray(resJSON) ? resJSON[0] : resJSON;
                setProfile(data);
                if (data.Thumbnail) {
                    setImgSrc(`${IMAGE_URL}/uploads/${data.Thumbnail}`);
                } else {
                    setImgSrc(`${IMAGE_URL}/uploads/logo.png`);
                }
            }
        } catch (err) {
            console.error("Error fetching profile info:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleImageError = () => {
        setImgSrc(`${IMAGE_URL}/uploads/logo.png`);
    };

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to logout?")) {
            localStorage.removeItem("StoredProfile");
            localStorage.removeItem("StoredPage");
            localStorage.removeItem("StoredItem");
            localStorage.removeItem("StoredJWT");
            window.location.href = "/";
        }
    };

    if (loading) {
        return (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 animate-pulse mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-white/20 rounded w-1/3"></div>
                        <div className="h-3 bg-white/20 rounded w-1/2"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!profile && !loading) return null;

    return (
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-3 mb-6 shadow-xl relative overflow-hidden transition-all hover:bg-white/15">
            {/* Subtle Gradient Shadow */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 pointer-events-none"></div>

            <div className="flex items-center gap-3 relative z-10">
                {/* Profile Image - Scaled Down */}
                <div className="relative flex-shrink-0">
                    {imgSrc ? (
                        <img
                            src={imgSrc}
                            alt={profile?.Name}
                            onError={handleImageError}
                            className="w-12 h-12 rounded-full object-cover border border-white/30 shadow-md"
                        />
                    ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center border border-white/30">
                            <User className="text-white" size={24} />
                        </div>
                    )}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white/20 rounded-full shadow-sm"></div>
                </div>

                {/* User Info - Compact */}
                <div className="flex-1 min-w-0 pr-2">
                    <h2 className="text-sm font-bold text-white truncate leading-none mb-1">
                        {profile?.Name || "User"}
                    </h2>
                    <p className="text-white/50 text-[10px] truncate leading-none">
                        {profile?.Email}
                    </p>
                </div>

                {/* Tokens - Horizontal and Mini */}
                <div className="flex items-center gap-3 pr-2">
                    <div className="w-px h-6 bg-white/10"></div>

                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1.5 text-green-400">
                            <span className="text-[14px] font-black text-white">{formatNumber(profile?.UsableToken ?? 0)}</span>
                            <Wallet size={14} />
                        </div>
                        <span className="text-[8px] font-bold text-white/30 uppercase tracking-tighter">Usable</span>
                    </div>
                </div>

                {/* Mini Controls */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => { setLoading(true); fetchProfile(); }}
                        className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white/80 transition-all"
                        title="Refresh"
                    >
                        <RefreshCcw size={16} />
                    </button>
                    <button
                        onClick={handleLogout}
                        className="p-2 hover:bg-red-500/20 rounded-lg text-white/40 hover:text-red-400 transition-all"
                        title="Logout"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileInfo;
