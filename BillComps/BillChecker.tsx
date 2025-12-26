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
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[100] px-4 animate-in fade-in duration-300">
            <div className="bg-[var(--theme-secondary-bg)] w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-5 duration-300 relative">

                {/* Header with Premium Gradient */}
                <div className="bg-gradient-to-br from-[var(--scolor)] to-[var(--scolor-contrast)] p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-[var(--theme-primary-text)]/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none" />

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-16 h-16 bg-[var(--theme-primary-text)]/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 shadow-inner ring-1 ring-[var(--theme-primary-text)]/30">
                            <Receipt className="w-8 h-8 text-[var(--theme-primary-text)] drop-shadow-md" />
                        </div>
                        <h2 className="text-2xl font-bold text-[var(--theme-primary-text)] tracking-tight mb-1">Payment Notice</h2>
                        <span className="inline-block px-3 py-1 bg-[var(--theme-primary-text)]/20 backdrop-blur-md rounded-full text-xs font-semibold text-[var(--theme-primary-text)]/90 border border-[var(--theme-primary-text)]/10">
                            Outstanding Bill
                        </span>
                    </div>

                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 p-2 bg-[var(--theme-primary-text)]/10 hover:bg-[var(--theme-primary-text)]/20 rounded-full text-[var(--theme-primary-text)]/80 hover:text-[var(--theme-primary-text)] transition-all backdrop-blur-sm"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8 space-y-6">
                    <div className="text-center space-y-2">
                        <div className="bg-[var(--scolor)]/5 rounded-xl p-4 border border-[var(--scolor)]/10">
                            <p className="text-[var(--scolor-contrast)] font-medium leading-relaxed">
                                You have an outstanding balance.<br />
                                <span className="text-sm opacity-80">Please settle your payment to enable full access.</span>
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={handleViewBill}
                            className="w-full py-3.5 bg-[var(--scolor-contrast)] text-[var(--theme-primary-text)] font-bold text-lg rounded-xl shadow-lg shadow-[var(--scolor-contrast)]/20 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                        >
                            <FileText className="w-5 h-5 group-hover:rotate-3 transition-transform" />
                            View Bill Details
                        </button>

                        <button
                            onClick={handleClose}
                            className="w-full py-3.5 bg-[var(--theme-text-primary)]/5 text-[var(--theme-text-primary)]/60 font-semibold text-base rounded-xl border border-[var(--theme-text-primary)]/10 hover:bg-[var(--theme-text-primary)]/10 hover:text-[var(--theme-text-primary)] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            I'll Pay Later
                        </button>
                    </div>

                    <p className="text-[10px] text-center text-[var(--theme-text-muted)] uppercase tracking-widest font-semibold">
                        Daily Reminder
                    </p>
                </div>
            </div>
        </div>
    );
};

export default BillChecker;
