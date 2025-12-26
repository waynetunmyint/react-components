import { BASE_URL } from "../../../config";

/* -----------------------------
   Local Storage Utility
----------------------------- */
export function UniversalGetStoredData<T>(keyString: string): T | null {
  if (typeof window === "undefined") return null; // Prevent SSR errors

  try {
    const stored = localStorage.getItem(keyString);
    return stored ? (JSON.parse(stored) as T) : null;
  } catch (error) {
    console.error(`Failed to parse localStorage item: ${keyString}`, error);
    return null;
  }
}

export function UniversalGetStoredJWT(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("StoredJWT");
}

export function returnStringLocalStored(): string | null {
  return UniversalGetStoredJWT();
}

/* -----------------------------
   API Helpers
----------------------------- */

/** ✅ Fetch Chat Group Member Info */
export async function UniversalGetChatGroupMemberInfo(chatGroupId: string) {
  if (!chatGroupId) return null;
  const storedProfile = UniversalGetStoredProfile();
  const token = UniversalGetStoredJWT();

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

  const token = UniversalGetStoredJWT();
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


export const UniversalGetChatGroupInfo = async (chatGroupId: string) => {
  const storedGroup = localStorage.getItem("StoredChatGroupItem");
  const parsedStoredGroup = storedGroup ? JSON.parse(storedGroup) : null;
  if (parsedStoredGroup?.Id === chatGroupId.toString()) {
    //setChatGroup(parsedStoredGroup);
    console.log("Retrieved chat group data from local storage:", parsedStoredGroup);
    return parsedStoredGroup;
  } else {
    const response = await fetch(`${BASE_URL}/chatGroup/api/${chatGroupId}`);
    if (response.ok) {
      const data = await response.json();
      const dataJson = await JSON.stringify(data[0]);
      localStorage.setItem("StoredChatGroupItem", dataJson);
      return dataJson;
    } else {
      console.error("Failed to fetch chat group data");
    }
  }
};

/** ✅ Fetch Profile by Email */
export async function UniversalFetchProfileByEmail(email: string) {
  if (!email) return null;

  const token = UniversalGetStoredJWT();
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
export const UniversalGetStoredProfile = () => UniversalGetStoredData<any>("StoredProfile");

export const UniversalGetStoredItem = () => UniversalGetStoredData<any>("StoredItem");

export const UniversalGetStoredPage = () => UniversalGetStoredData<any>("StoredPage");

export const UniversalGetStoredUser = () => UniversalGetStoredData<any>("StoredUser");
