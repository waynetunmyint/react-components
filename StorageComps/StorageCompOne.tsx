"use client";
import { BASE_URL } from "@/config";

/* -----------------------------
   Local Storage Utility
----------------------------- */

/** ✅ Get generic data from localStorage */
export function GetStoredData<T = any>(keyString: string): T | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(keyString);
    if (!stored) return null;
    return JSON.parse(stored) as T;
  } catch (error) {
    console.error(`Failed to parse localStorage item: ${keyString}`, error);
    return null;
  }
}

/** ✅ Set generic data in localStorage */
export function SetStoredData(keyString: string, data: any): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(keyString, JSON.stringify(data));
  } catch (error) {
    console.error(`Failed to set localStorage item: ${keyString}`, error);
  }
}

/** ✅ Get JWT from storage */
export function GetStoredJWT(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("StoredJWT");
}

/* -----------------------------
   Specific Storage Getters
----------------------------- */
export const GetStoredProfile = () => GetStoredData("StoredProfile");
export const GetStoredItem = () => GetStoredData("StoredItem");
export const GetStoredPage = () => GetStoredData("StoredPage");
export const GetStoredUser = () => GetStoredData("StoredUser");

/* -----------------------------
   API Helpers
----------------------------- */

/** ✅ Fetch Chat Group Info (with caching) */
export async function GetChatGroupInfo(chatGroupId: string): Promise<any | null> {
  if (!chatGroupId) return null;

  try {
    const cached = GetStoredData("StoredChatGroupItem");
    if (cached?.Id?.toString() === chatGroupId.toString()) return cached;

    const res = await fetch(`${BASE_URL}/chatGroup/api/${chatGroupId}`);
    if (!res.ok) return null;

    const data = await res.json();
    const group = data?.[0] || data;
    if (group) SetStoredData("StoredChatGroupItem", group);
    return group;
  } catch (e) {
    console.error("GetChatGroupInfo error:", e);
    return null;
  }
}

/** ✅ Fetch Chat Group Member Info */
export async function GetChatGroupMemberInfo(chatGroupId: string): Promise<any | null> {
  if (!chatGroupId) return null;
  const storedProfile = GetStoredProfile();
  const token = GetStoredJWT();

  if (!storedProfile?.Email || !token) return null;

  try {
    const formData = new FormData();
    formData.append("email", storedProfile.Email);
    formData.append("chatGroupId", chatGroupId);

    const res = await fetch(`${BASE_URL}/chatGroupMember/api/byEmail`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error("GetChatGroupMemberInfo error:", err);
    return null;
  }
}

/** ✅ Join Group */
export async function joinGroup(chatGroupId: string, email: string): Promise<boolean> {
  if (!chatGroupId || !email) return false;

  const token = GetStoredJWT();
  if (!token) return false;

  try {
    const formData = new FormData();
    formData.append("profileEmail", email);
    formData.append("chatGroupId", chatGroupId);

    const res = await fetch(`${BASE_URL}/chatGroupMember/api`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    return res.ok;
  } catch (err) {
    console.error("joinGroup error:", err);
    return false;
  }
}

/** ✅ Fetch Profile by Email */
export async function GetProfileByEmail(email: string): Promise<any | null> {
  if (!email) return null;

  const token = GetStoredJWT();
  if (!token) return null;

  try {
    const formData = new FormData();
    formData.append("email", email);

    const res = await fetch(`${BASE_URL}/profile/api/byEmail`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) ? data[0] : data;
  } catch (err) {
    console.error("GetProfileByEmail error:", err);
    return null;
  }
}

/** ✅ Get App Information */
export async function getAppInfoByAppName(appName: string): Promise<any | null> {
  if (!appName) return null;
  const token = GetStoredJWT();

  try {
    const res = await fetch(`${BASE_URL}/application/api/byName/${appName}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data?.[0] || data;
  } catch (err) {
    console.error("getAppInfoByAppName error:", err);
    return null;
  }
}

/** ✅ Check/Purchase Chat Membership */
export async function checkChatMembership(chatGroupId: string): Promise<void> {
  const storedProfile = GetStoredProfile();
  const token = GetStoredJWT();

  if (!storedProfile?.Email || !token) return;

  try {
    const formData = new FormData();
    formData.append("chatGroupId", chatGroupId);
    formData.append("profileEmail", storedProfile.Email);

    await fetch(`${BASE_URL}/chatGroupMember/api/purchaseMembership`, {
      method: "POST",
      body: formData,
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (err) {
    console.error("checkChatMembership error:", err);
  }
}

