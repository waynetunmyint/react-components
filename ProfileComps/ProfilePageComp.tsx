import { useEffect, useState } from "react";
import { UserCircle2, LogOut, Trash2, AlertCircle, ChevronRight } from "lucide-react";
import { BASE_URL, IMAGE_URL } from "@/config";
import { GetStoredJWT, GetStoredProfile } from "../StorageComps/StorageCompOne";

interface Profile {
  Name: string;
  Email: string;
  Thumbnail?: string;
}

const ProfilePageComp: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const storedProfile = GetStoredProfile();
    console.log("Stored Profile:", storedProfile);

    if (!storedProfile || !storedProfile.Email) {
      setLoading(false);
      setError("No profile found. Please login.");
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
      return;
    }

    setLoading(true);
    setError("");

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

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Session expired. Please login again.");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const resJSON = await response.json();
      const dataToSave = Array.isArray(resJSON) ? resJSON[0] : resJSON;
      localStorage.setItem("StoredItem", JSON.stringify(dataToSave));
      setProfile(dataToSave);
    } catch (error) {
      console.error("Error fetching profile:", error);
      const errorMsg = error instanceof Error ? error.message : "Failed to load profile";
      setError(errorMsg);

      if (errorMsg.includes("Session expired")) {
        setTimeout(() => {
          handleLogout();
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("StoredProfile");
    localStorage.removeItem("StoredPage");
    localStorage.removeItem("StoredItem");
    localStorage.removeItem("StoredJWT");
    window.location.href = "/home";
  };

  const handleProfileDelete = () => {
    if (
      window.confirm(
        "Are you sure you want to delete your profile? This action cannot be undone."
      )
    ) {
      window.location.href = "/profile/delete";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* iOS-style Status Bar Space */}
      <div className="h-12 bg-transparent"></div>

      <div className="max-w-2xl mx-auto px-4 pb-8">
        {loading ? (
          <ProfileSkeleton />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchProfile} />
        ) : profile ? (
          <div className="space-y-6">
            {/* Profile Header Card */}
            <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 h-32"></div>
              <div className="relative px-6 pb-6">
                {/* Avatar */}
                <div className="flex justify-center -mt-16 mb-4">
                  {profile.Thumbnail ? (
                    <img
                      src={`${IMAGE_URL}/uploads/${profile.Thumbnail}`}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 border-4 border-white shadow-lg flex items-center justify-center">
                      <UserCircle2 size={64} className="text-white" />
                    </div>
                  )}
                </div>

                {/* Name */}
                <h1 className="text-2xl font-semibold text-gray-900 text-center mb-1">
                  {profile.Name}
                </h1>
                <p className="text-gray-500 text-center text-sm mb-5">
                  {profile.Email}
                </p>

                {/* Edit Profile Button */}
                <a
                  href="/profile/update"
                  className="block w-full text-center py-3 bg-blue-500 text-white font-semibold rounded-2xl hover:bg-blue-600 active:scale-98 transition-all shadow-sm"
                >
                  Edit Profile
                </a>
              </div>
            </div>



            {/* Reward Component */}
            <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
              {/* <RewardComp /> */}
            </div>

            {/* Actions Card */}
            <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
              <div className="divide-y divide-gray-100">
                {/* Delete Profile */}
                <button
                  onClick={handleProfileDelete}
                  className="w-full flex items-center px-6 py-4 hover:bg-red-50 active:bg-red-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center mr-3">
                    <Trash2 size={18} className="text-red-600" />
                  </div>
                  <span className="text-base font-medium text-red-600 flex-1 text-left">
                    Delete Profile
                  </span>
                  <ChevronRight className="text-red-400" size={20} />
                </button>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-6 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center mr-3">
                    <LogOut size={18} className="text-gray-600" />
                  </div>
                  <span className="text-base font-medium text-gray-900 flex-1 text-left">
                    Log Out
                  </span>
                  <ChevronRight className="text-gray-400" size={20} />
                </button>
              </div>
            </div>

            {/* iOS-style Bottom Safe Area */}
            <div className="h-8"></div>
          </div>
        ) : (
          <p className="text-center text-gray-500 mt-10">
            No profile data available
          </p>
        )}
      </div>
    </div>
  );
};

/* Error Message Component */
const ErrorMessage: React.FC<{
  message: string;
  onRetry: () => void;
}> = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center px-4 py-12">
    <div className="bg-white rounded-3xl shadow-lg p-8 max-w-md w-full">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="text-red-600" size={32} />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
        Unable to Load Profile
      </h3>
      <p className="text-gray-600 text-center mb-6">{message}</p>
      <button
        onClick={onRetry}
        className="w-full py-3 bg-blue-500 text-white font-semibold rounded-2xl hover:bg-blue-600 active:scale-98 transition-all shadow-sm"
      >
        Try Again
      </button>
    </div>
  </div>
);

/* Skeleton Loader */
const ProfileSkeleton: React.FC = () => (
  <div className="space-y-6 animate-pulse">
    {/* Profile Header Skeleton */}
    <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
      <div className="bg-gradient-to-br from-gray-300 to-gray-400 h-32"></div>
      <div className="relative px-6 pb-6">
        <div className="flex justify-center -mt-16 mb-4">
          <div className="w-32 h-32 rounded-full bg-gray-300 border-4 border-white shadow-lg"></div>
        </div>
        <div className="h-7 bg-gray-200 rounded-lg w-2/5 mx-auto mb-2"></div>
        <div className="h-4 bg-gray-200 rounded-lg w-3/5 mx-auto mb-5"></div>
        <div className="h-12 bg-gray-200 rounded-2xl"></div>
      </div>
    </div>

    {/* Info Card Skeleton */}
    <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
      <div className="px-6 py-3 border-b border-gray-100">
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      </div>
      <div className="divide-y divide-gray-100">
        <div className="flex items-center px-6 py-4">
          <div className="w-8 h-8 rounded-lg bg-gray-200 mr-3"></div>
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
        <div className="flex items-center px-6 py-4">
          <div className="w-8 h-8 rounded-lg bg-gray-200 mr-3"></div>
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    </div>

    {/* Reward Skeleton */}
    <div className="bg-white rounded-3xl shadow-sm p-6">
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
    </div>

    {/* Actions Skeleton */}
    <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
      <div className="h-14 bg-gray-100"></div>
      <div className="h-14 bg-gray-50"></div>
    </div>
  </div>
);

export default ProfilePageComp;