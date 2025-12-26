"use client";
import { useEffect, useState, useCallback } from "react";
import { FileText, Receipt, X, AlertCircle, CreditCard } from "lucide-react";
import { BASE_URL, PAGE_ID } from "../../../config";

interface BillData {
    Status?: number;
    Id?: string | number;
    Title?: string;
    Amount?: number | string;
    Description?: string;
    StudentName?: string;
    CheckFrequency?: 'daily' | 'hourly' | 'always';
    [key: string]: unknown;
}

interface Props {
    pageId?: number | string;
}

const STORAGE_KEY = "billCheckerLastShown";

// Type for check frequency
type CheckFrequencyType = 'daily' | 'hourly' | 'always';

/**
 * BillChecker Component
 * 
 * Checks if there's an outstanding bill (Status = 1) and shows a modal
 * once per day/hour with options to view Invoice, Receipt, or Close (Pay Later).
 * The check frequency is now fetched from the API.
 */
const BillChecker: React.FC<Props> = ({ pageId = PAGE_ID }) => {
    const [showModal, setShowModal] = useState(false);
    const [billData, setBillData] = useState<BillData | null>(null);
    const [loading, setLoading] = useState(true);
    const [checkFrequency, setCheckFrequency] = useState<CheckFrequencyType>('always');

    /**
     * Check if modal was already shown within the configured frequency
     */
    const wasShownRecently = useCallback((frequency: CheckFrequencyType): boolean => {
        if (frequency === 'always') return false;
        try {
            const lastShown = localStorage.getItem(`${STORAGE_KEY}_${pageId}`);
            if (!lastShown) return false;

            const lastDate = new Date(lastShown);
            const now = new Date();

            if (frequency === 'daily') {
                // Check if same day
                return (
                    lastDate.getFullYear() === now.getFullYear() &&
                    lastDate.getMonth() === now.getMonth() &&
                    lastDate.getDate() === now.getDate()
                );
            } else if (frequency === 'hourly') {
                // Check if within the same hour
                return (
                    lastDate.getFullYear() === now.getFullYear() &&
                    lastDate.getMonth() === now.getMonth() &&
                    lastDate.getDate() === now.getDate() &&
                    lastDate.getHours() === now.getHours()
                );
            }
            return false;
        } catch {
            return false;
        }
    }, [pageId]);

    /**
     * Mark modal as shown today
     */
    const markAsShownToday = (): void => {
        try {
            localStorage.setItem(`${STORAGE_KEY}_${pageId}`, new Date().toISOString());
        } catch (error) {
            console.error("Failed to save to localStorage:", error);
        }
    };

    /**
     * Fetch bill data and check status
     * The API should return CheckFrequency field (e.g., 'daily', 'hourly', 'always')
     */
    const checkBillStatus = async (): Promise<void> => {
        try {
            setLoading(true);

            const url = `${BASE_URL}/pageBill/api/checkBill/${pageId}`;
            console.log("BillChecker: Fetching from", url);
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch: ${response.status}`);
            }

            const data = await response.json();
            const result = Array.isArray(data) ? data[0] : data;
            console.log("BillChecker: API Result:", result);

            // Get check frequency from API response (default to 'always' if not provided)
            const apiFrequency: CheckFrequencyType = result?.CheckFrequency || 'always';
            setCheckFrequency(apiFrequency);
            console.log(`BillChecker: Check frequency from API: ${apiFrequency}`);

            // Skip if already shown recently (based on API-provided frequency)
            if (wasShownRecently(apiFrequency)) {
                console.log(`BillChecker: Already shown (${apiFrequency}). Skipping.`);
                setLoading(false);
                return;
            }

            // Check if Status is 1 (outstanding bill)
            if (result?.Status === 1) {
                console.log("BillChecker: Status is 1. Showing modal.");
                setBillData(result);
                setShowModal(true);
                markAsShownToday();
            } else {
                console.log("BillChecker: Status is not 1 (" + result?.Status + "). No modal.");
            }
        } catch (error) {
            console.error("Error checking bill status:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log("BillChecker mounted. Checking status...");
        checkBillStatus();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pageId]);

    /**
     * Handle View Bill button click
     */
    const handleViewBill = (): void => {
        // Navigate to admin page bill page
        window.location.href = `/admin/pageBill`;
    };

    /**
     * Handle Receipt button click (placeholder for future implementation)
     */
    const handleReceipt = (): void => {
        // TODO: Will implement later
        alert("Receipt feature coming soon!");
    };

    /**
     * Handle Close (Pay Later) button click
     */
    const handleClose = (): void => {
        setShowModal(false);
    };

    // Don't render anything while loading or if modal shouldn't show
    if (loading || !showModal) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-[100] px-4">
            <div className="bg-white/95 backdrop-blur-xl w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                {/* Header - Using theme primary colors from variables.css */}
                <div
                    className="p-6 relative overflow-hidden"
                    style={{ background: 'linear-gradient(to bottom right, var(--theme-primary-bg), var(--theme-secondary-bg))' }}
                >
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12" />

                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <AlertCircle className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Payment Notice</h2>
                                <p className="text-white/80 text-sm">You have an outstanding bill</p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white/30 active:scale-90 transition-all"
                            aria-label="Close modal"
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Simple Message - Using theme text colors */}
                    <p
                        className="text-center text-lg mb-6"
                        style={{ color: 'var(--theme-text-primary)' }}
                    >
                        You have an outstanding balance. Please settle your payment at your earliest convenience.
                    </p>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        {/* View Bill Button - Using theme primary colors */}
                        <button
                            onClick={handleViewBill}
                            className="w-full py-4 text-white font-semibold text-base rounded-2xl shadow-lg hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            style={{
                                background: 'linear-gradient(to right, var(--theme-primary-bg), var(--theme-secondary-bg))'
                            }}
                        >
                            <FileText className="w-5 h-5" />
                            View Bill
                        </button>

                        {/* Close / Pay Later Button */}
                        <button
                            onClick={handleClose}
                            className="w-full py-4 bg-gray-100 font-semibold text-base rounded-2xl hover:bg-gray-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            style={{ color: 'var(--theme-text-primary)' }}
                        >
                            <X className="w-5 h-5" />
                            Close (Pay Later)
                        </button>
                    </div>

                    {/* Footer Note */}
                    <p
                        className="text-xs text-center mt-4"
                        style={{ color: 'var(--theme-text-muted)' }}
                    >
                        This reminder will appear once per day until the bill is settled.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default BillChecker;
