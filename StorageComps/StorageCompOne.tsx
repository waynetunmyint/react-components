import { BASE_URL } from "../../../config";

/* -----------------------------
   Local Storage Utility
----------------------------- */
export function GetStoredData<T = any>(keyString: string): T | null {
  if (typeof window === "undefined") return null; // Prevent SSR errors

  try {
    const stored = localStorage.getItem(keyString);
    return stored ? (JSON.parse(stored) as T) : null;
  } catch (error) {
    console.error(`Failed to parse localStorage item: ${keyString}`, error);
    return null;
  }
}

export const StoredChatGroupInfo = async (chatGroupId: string) => {
  try {
    const cached = localStorage.getItem("StoredChatGroupItem");
    const parsed = cached ? JSON.parse(cached) : null;
    if (parsed?.Id?.toString() === chatGroupId.toString()) return parsed;
    const res = await fetch(`${BASE_URL}/chatGroup/api/${chatGroupId}`);
    if (!res.ok) return null;
    const data = (await res.json())?.[0] || null;
    if (data) localStorage.setItem("StoredChatGroupItem", JSON.stringify(data));
    return data;
  } catch (e) {
    console.error("UniversalGetChatGroupInfo error:", e);
    return null;
  }
};

export function GetStoredJWT(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("StoredJWT");
}


/** ✅ Fetch Chat Group Member Info */
export async function GetChatGroupMemberInfo(chatGroupId: string) {
  if (!chatGroupId) return null;
  const storedProfile = GetStoredProfile();
  const token = GetStoredJWT();

  try {
    const formData = new FormData();
    formData.append("email", storedProfile?.Email);
    formData.append("chatGroupId", chatGroupId);

    const res = await fetch(`${BASE_URL}/chatGroupMember/api/byEmail`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const resJson = await res.json();
   // console.log("Stored Group Member Info", resJson);

    if (!res.ok) {
      console.error("Failed to fetch chat group member info:", res.statusText);
      return null;
    }

    return resJson;
  } catch (err) {
    console.error("UniversalGetChatGroupMemberInfo error:", err);
    return null;
  }
}


export function returnStringLocalStored(): string | null {
  return GetStoredJWT();
}

  /** Membership verification */
  // eslint-disable-next-line react-refresh/only-export-components
  export const getAppInfoByAppName = async (appName:string)=>{
    const token = GetStoredJWT();
    try {
      const res = await fetch(`${BASE_URL}/application/api/byName/${appName}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
     // console.log("Application Information:", data[0]);
      return data[0];
    } catch (err) {
      console.error(" Application Get error:", err);
    }
  };


  /** Membership verification */
  export const checkChatMembership = async (chatGroupId:string)=>{
    const storedProfile = GetStoredProfile();
    const token =GetStoredJWT();
    try {
      const formData = new FormData();
      formData.append("chatGroupId", chatGroupId);
      formData.append("profileEmail", storedProfile?.Email);
      const res = await fetch(`${BASE_URL}/chatGroupMember/api/purchaseMembership`, {
        method: "POST",
        body: formData,
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
     // console.log("Membership check:", data);
    } catch (err) {
      console.error("Membership check error:", err);
    }
  };

/* -----------------------------
   API Helpers
----------------------------- */

/** ✅ Fetch Chat Group Member Info */
export async function StoredChatGroupMemberInfo(chatGroupId: string) {
  if (!chatGroupId) return null;
  const storedProfile = GetStoredProfile();
  const token = GetStoredJWT();

  try {
    const formData = new FormData();
    formData.append("email", storedProfile?.Email);
    formData.append("chatGroupId", chatGroupId);

    const res = await fetch(`${BASE_URL}/chatGroupMember/api/byEmail`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const resJson = await res.json();
   // console.log("Stored Group Member Info", resJson);

    if (!res.ok) {
      console.error("Failed to fetch chat group member info:", res.statusText);
      return null;
    }

    return resJson;
  } catch (err) {
    console.error("UniversalGetChatGroupMemberInfo error:", err);
    return null;
  }
}

/** ✅ Join Group */
export async function joinGroup(chatGroupId: string, email: string) {
  if (!chatGroupId || !email) return null;

  const token = GetStoredJWT();
  if (!token) {
    console.error("JWT token not found");
    return null;
  }

  try {
    const formData = new FormData();
    formData.append("profileEmail", email);
    formData.append("chatGroupId", chatGroupId);

    const res = await fetch(`${BASE_URL}/chatGroupMember/api`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!res.ok) {
      console.error("Failed to join group:", res.statusText);
    }

    return res.ok;
  } catch (err) {
    console.error("joinGroup error:", err);
    return null;
  }
}




/** ✅ Fetch Profile by Email */
export async function UniversalFetchProfileByEmail(email: string) {
  if (!email) return null;

  const token = GetStoredJWT();
  if (!token) {
    console.error("JWT token not found");
    return null;
  }

  try {
    const formData = new FormData();
    formData.append("email", email);

    const res = await fetch(`${BASE_URL}/profile/api/byEmail`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const data = await res.json();
    console.log("Profile Data By Api", data);

    if (!res.ok) {
      console.error("Failed to fetch profile:", res.statusText);
      return null;
    }

    // If backend returns array, take first element
    return Array.isArray(data) ? data[0] : data;
  } catch (err) {
    console.error("Fetch profile error:", err);
    return null;
  }
}

/* -----------------------------
   Specific Storage Getters
----------------------------- */
export const GetStoredProfile = () =>GetStoredData("StoredProfile");

export const GetStoredItem = () =>GetStoredData("StoredItem");

export const GetStoredPage = () =>GetStoredData("StoredPage");

export const GetStoredUser = () =>GetStoredData("StoredUser");
