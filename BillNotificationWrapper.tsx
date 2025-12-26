"use client";
import React, { useEffect, useState } from "react";
import { BASE_URL } from "../../config";
import { GetStoredPage } from "./StorageComps/StorageCompOne";
import { AlertCircle, CreditCard, X } from "lucide-react";

export default function BillNotificationWrapper() {
    const [showModal, setShowModal] = useState(false);
    const [bill, setBill] = useState<any>(null);

    useEffect(() => {
        const checkBillStatus = async () => {
            try {
                const storedPage = GetStoredPage();
                if (!storedPage?.Id) return;

                // Fetch fresh Page status (optional, but good practice)
                // For now, relies on StoredPage or check bill directly.
                // Let's check bill directly using the API we just made.

                const res = await fetch(`${BASE_URL}/pageBill/api/byPageId/${storedPage.Id}`);
                if (!res.ok) return;

                const data = await res.json();
                const pendingBill = Array.isArray(data) ? data[0] : null;

                if (pendingBill) {
                    setBill(pendingBill);
                    setShowModal(true);
                }
            } catch (err) {
                console.error("Error checking bill status:", err);
            }
        };

        // Check on mount and maybe every few minutes? For now, just mount.
        checkBillStatus();
    }, []);

    if (!showModal || !bill) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] px-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-5 duration-300 ring-1 ring-white/20">

                {/* Header */}
                <div className="bg-gradient-to-r from-red-500 to-rose-600 p-6 text-white text-center">
                    <div className="mx-auto w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3 backdrop-blur-md">
                        <AlertCircle size={28} />
                    </div>
                    <h2 className="text-2xl font-bold">Pending Invoice</h2>
                    <p className="text-red-100 text-sm mt-1">Action Required</p>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    <div className="text-center text-gray-600">
                        <p>You have a pending invoice for your subscription.</p>
                        <p className="text-xs text-gray-400 mt-1">Issued: {new Date(bill.CreatedAt).toLocaleDateString()}</p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        {bill.PackageTitles && (
                            <div className="mb-3 pb-3 border-b border-gray-200 dashed">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Services</p>
                                <p className="text-gray-900 font-medium">{bill.PackageTitles}</p>
                            </div>
                        )}
                        <div className="flex justify-between items-end">
                            <span className="text-sm text-gray-500 font-medium">Total Amount</span>
                            <span className="text-3xl font-bold text-gray-900">${Number(bill.Price).toLocaleString()}</span>
                        </div>
                    </div>

                    <button
                        onClick={() => alert("Redirect to Payment Gateway...")}
                        className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                    >
                        <CreditCard size={18} />
                        Pay Now
                    </button>

                    {/* Temporary Close for Demo */}
                    <button
                        onClick={() => setShowModal(false)}
                        className="w-full text-gray-400 hover:text-gray-600 text-xs py-2"
                    >
                        Remind me later
                    </button>
                </div>
            </div>
        </div>
    );
}
