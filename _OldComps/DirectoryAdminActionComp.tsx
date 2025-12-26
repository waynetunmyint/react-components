// "use client";
// import { useEffect, useState } from "react";
// import { Trash2, Edit2, AlertCircle, ActivityIcon } from "lucide-react";
// import { BASE_URL } from "../../config";
// import { useUniversalRouter } from "@/utils/useUniversalRouter"; // <- universal router hook

// interface SelectedItem {
//   Id: number;
//   PageId: number;
//   Type: string;
//   PageOwnerEmail?: string;
// }

// interface CompAdminActionProps {
//   selectedItem: SelectedItem;
// }

// const DirectoryAdminActionComp = ({ selectedItem }: CompAdminActionProps) => {
//   const router = useUniversalRouter();
//   const [isLoading, setIsLoading] = useState(false);
//   const [alertMessage, setAlertMessage] = useState("");
//   const [dialogType, setDialogType] = useState<string | null>(null);
//   const [isOwner, setIsOwner] = useState(false);
//   const [isAdmin, setIsAdmin] = useState(false);
//   const [isSuperAdmin, setIsSuperAdmin] = useState(false);
//   const [menuOpen, setMenuOpen] = useState(false);

//   const storedProfileRaw = typeof window !== "undefined" ? localStorage.getItem("StoredProfile") : null;
//   const storedProfile = storedProfileRaw ? JSON.parse(storedProfileRaw) : null;

//   useEffect(() => {
//     checkPermission();
//     checkSuperAdmin();
//   }, []);

//   const checkPermission = async () => {
//     if (!storedProfile) return;
//     try {
//       const formData = new FormData();
//       formData.append("profileEmail", storedProfile.Email);
//       formData.append("pageId", selectedItem.PageId.toString());

//       const res = await fetch(`${BASE_URL}/admin/api/checkPermission`, {
//         method: "POST",
//         body: formData,
//       });

//       const data = await res.json();
//       setIsAdmin(data.isAdmin);
//       setIsOwner(data.isOwner);
//       setIsSuperAdmin(data.isSuperAdmin);
//     } catch (error) {
//       console.error("Error checking permissions:", error);
//     }
//   };

//   const checkSuperAdmin = async () => {
//     if (!storedProfile) return;
//     try {
//       const formData = new FormData();
//       formData.append("profileEmail", storedProfile.Email);

//       const res = await fetch(`${BASE_URL}/admin/api/checkSuperAdmin`, {
//         method: "POST",
//         body: formData,
//       });

//       const data = await res.json();
//       setIsSuperAdmin(data.hasPermission === true);
//     } catch (error) {
//       console.error("checkSuperAdmin Error:", error);
//     }
//   };

//   const handleAction = async () => {
//     setIsLoading(true);
//     try {
//       if (dialogType === "report") handleReport();
//       else if (dialogType === "edit") handleEdit();
//       else if (dialogType === "delete") await handleDelete();
//       else if (dialogType === "block") await handleBlock();
//       else setAlertMessage("Invalid action.");
//     } catch (error: any) {
//       setAlertMessage(`Error: ${error.message}`);
//     } finally {
//       setIsLoading(false);
//       setDialogType(null);
//     }
//   };

//   const handleReport = () => {
//     if (typeof window !== "undefined") {
//       localStorage.setItem("StoredPost", JSON.stringify(selectedItem));
//       router.push("/report");
//     }
//   };

//   const handleEdit = () => {
//     if (typeof window === "undefined") return;
//     const storageKey = selectedItem.Type === "Post" ? "StoredPost" : "StoredProduct";
//     localStorage.setItem(storageKey, JSON.stringify(selectedItem));

//     const updateRoute = {
//       Post: "/post/update",
//       Product: "/product/update",
//     }[selectedItem.Type];

//     if (updateRoute) router.push(updateRoute);
//   };

//   const handleDelete = async () => {
//     const apiUrl = {
//       Post: `${BASE_URL}/post/api/${selectedItem.Id}`,
//       Product: `${BASE_URL}/product/api/${selectedItem.Id}`,
//     }[selectedItem.Type];

//     if (!apiUrl) throw new Error("Unsupported type");

//     const res = await fetch(apiUrl, { method: "DELETE" });
//     if (!res.ok) throw new Error(`Failed to delete item with ID ${selectedItem.Id}`);
//     router.push("/home");
//   };

//   const handleBlock = async () => {
//     if (!storedProfile) return;
//     const formData = new FormData();
//     formData.append("blockEmail", selectedItem?.PageOwnerEmail || "");
//     formData.append("profileEmail", storedProfile.Email);

//     const res = await fetch(`${BASE_URL}/profileBlock/api`, {
//       method: "POST",
//       body: formData,
//     });

//     if (!res.ok) throw new Error("Failed to block user");
//     setAlertMessage("User blocked successfully.");
//     if (typeof window !== "undefined") window.location.reload();
//   };

//   return (
//     <div className="relative">
//       <button className="p-2 text-gray-600 hover:text-gray-800" onClick={() => setMenuOpen(!menuOpen)}>
//         <ActivityIcon size={20} />
//       </button>

//       {menuOpen && (
//         <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-md z-10">
//           {isSuperAdmin ? (
//             <>
//               <button className="w-full px-4 py-2 text-left text-gray-800 hover:bg-gray-100 flex items-center gap-2"
//                 onClick={() => { setDialogType("edit"); setMenuOpen(false); }}>
//                 <Edit2 size={16} /> Super Edit
//               </button>
//               <button className="w-full px-4 py-2 text-left text-gray-800 hover:bg-gray-100 flex items-center gap-2"
//                 onClick={() => { setDialogType("delete"); setMenuOpen(false); }}>
//                 <Trash2 size={16} /> Super Delete
//               </button>
//               <button className="w-full px-4 py-2 text-left text-gray-800 hover:bg-gray-100 flex items-center gap-2"
//                 onClick={() => { setDialogType("report"); setMenuOpen(false); }}>
//                 <AlertCircle size={16} /> Super Report
//               </button>
//               <button className="w-full px-4 py-2 text-left text-gray-800 hover:bg-gray-100 flex items-center gap-2"
//                 onClick={() => { setDialogType("block"); setMenuOpen(false); }}>
//                 ⛔ Super Block
//               </button>
//             </>
//           ) : isOwner || isAdmin ? (
//             <>
//               <button className="w-full px-4 py-2 text-left text-gray-800 hover:bg-gray-100 flex items-center gap-2"
//                 onClick={() => { setDialogType("edit"); setMenuOpen(false); }}>
//                 <Edit2 size={16} /> Edit
//               </button>
//               <button className="w-full px-4 py-2 text-left text-gray-800 hover:bg-gray-100 flex items-center gap-2"
//                 onClick={() => { setDialogType("delete"); setMenuOpen(false); }}>
//                 <Trash2 size={16} /> Delete
//               </button>
//             </>
//           ) : (
//             <>
//               <button className="w-full px-4 py-2 text-left text-gray-800 hover:bg-gray-100 flex items-center gap-2"
//                 onClick={() => { setDialogType("report"); setMenuOpen(false); }}>
//                 <AlertCircle size={16} /> Report
//               </button>
//               <button className="w-full px-4 py-2 text-left text-gray-800 hover:bg-gray-100 flex items-center gap-2"
//                 onClick={() => { setDialogType("block"); setMenuOpen(false); }}>
//                 ⛔ Block
//               </button>
//             </>
//           )}
//         </div>
//       )}

//       {dialogType && (
//         <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
//           <div className="bg-white p-6 rounded-lg shadow-lg w-96">
//             <p className="text-lg font-semibold text-gray-800">
//               {dialogType.charAt(0).toUpperCase() + dialogType.slice(1)} this item?
//             </p>
//             <div className="mt-4 flex justify-end space-x-4">
//               <button className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
//                 onClick={() => setDialogType(null)}>
//                 Cancel
//               </button>
//               <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//                 onClick={handleAction}>
//                 Confirm
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {isLoading && <div className="mt-4 text-center text-gray-700">Loading...</div>}
//       {alertMessage && <div className="mt-4 bg-red-100 text-red-800 p-2 rounded">{alertMessage}</div>}
//     </div>
//   );
// };

// export default DirectoryAdminActionComp;
