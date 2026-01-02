import React, { useState, useEffect } from "react";
import Tesseract from "tesseract.js";
import { GetStoredJWT, GetStoredProfile } from "../StorageComps/StorageCompOne";
import { BASE_URL, ENABLE_TOPUP_WIDGET, PAGE_ID, IMAGE_URL } from "@/config";
import { resizeImage } from "../ImageComps/ImageClientComp";

// Sub-components
import { TopUpTrigger } from "./SubComps/TopUpTrigger";
import { TopUpModal } from "./SubComps/TopUpModal";
import {
    Step1_QR,
    Step2_Upload,
    Step3_AI,
    Step4_Confirm,
    Step5_Success,
    Step6_Error
} from "./SubComps/TopUpSteps";

const TopUpWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [isVisible, setIsVisible] = useState(false);
    const [slip, setSlip] = useState<File | null>(null);
    const [amount, setAmount] = useState<string>("");
    const [tranId, setTranId] = useState<string>("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusMsg, setStatusMsg] = useState<string>("");
    const [qrImageUrl, setQrImageUrl] = useState<string>("");
    const [kpayName, setKpayName] = useState<string>("");

    const storedProfile = GetStoredProfile();
    const token = GetStoredJWT();

    // Fetch contactInfo to get KPayQR image and KPayName
    useEffect(() => {
        const fetchContactInfo = async () => {
            try {
                const response = await fetch(`${BASE_URL}/contactInfo/api/byPageId/${PAGE_ID}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data && data[0]) {
                        // Store KPayQR image URL
                        if (data[0].KPayQR) {
                            setQrImageUrl(`${IMAGE_URL}/uploads/${data[0].KPayQR}`);
                        }
                        // Store KPayName for validation
                        if (data[0].KPayName) {
                            setKpayName(data[0].KPayName);
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to fetch contact info:", error);
            }
        };
        fetchContactInfo();
    }, []);

    useEffect(() => {
        const checkVisibility = () => {
            if (!ENABLE_TOPUP_WIDGET) {
                setIsVisible(false);
                return;
            }
            const path = window.location.pathname;
            const isExcluded = path.startsWith('/admin') || path === '/login' || path === '/register' || path === '/profileLogin';
            setIsVisible(!isExcluded && !!storedProfile);
        };

        checkVisibility();
        const interval = setInterval(checkVisibility, 2000);
        return () => clearInterval(interval);
    }, [storedProfile]);

    const handleReset = () => {
        setStep(1);
        setSlip(null);
        setAmount("");
        setTranId("");
        setIsProcessing(false);
        setStatusMsg("");
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setSlip(e.target.files[0]);
        }
    };

    const runAiDetection = async () => {
        if (!slip) return;
        setIsProcessing(true);
        setStep(3);

        try {
            // 1. Run OCR on the slip
            const { data: { text } } = await Tesseract.recognize(slip, 'eng');
            const cleanText = text.toLowerCase();
            console.log("🔍 OCR Extracted Text:", text);

            // 2. Validate KBZ Pay E-Receipt Pattern
            const isKBZReceipt = cleanText.includes("e-receipt") || cleanText.includes("e-receipt") ||
                cleanText.includes("kbz") || cleanText.includes("kbzpay");

            if (!isKBZReceipt) {
                setIsProcessing(false);
                setStatusMsg("Invalid receipt format. Please upload a valid KBZ Pay E-Receipt.");
                setStep(6);
                return;
            }

            // 3. Validate Transfer To matches KPayName from contactInfo
            // English: "Transfer To" | Myanmar: "ပေးပို့သူ" or "တေးလည့် သို့" (recipient)
            const transferToMatch = text.match(/Transfer\s*To\s*[:\s]*([^\n]+)/i) ||
                text.match(/ပေးပို့သူ\s*[:\s]*([^\n]+)/) ||
                text.match(/တေးလည့်\s*သို့\s*[:\s]*([^\n]+)/) ||
                text.match(/ငွေလွှဲမည်\s*သို့\s*[:\s]*([^\n]+)/) ||
                text.match(/လွှဲပြောင်း.*?[:\s]*([^\n]+)/);

            // If we found the Transfer To field, validate it
            if (transferToMatch) {
                const transferToName = transferToMatch[1].trim();
                console.log("📝 Transfer To:", transferToName);
                console.log("✅ Expected KPayName:", kpayName);

                // Check if the transfer recipient matches the expected KPayName
                if (kpayName && !transferToName.toLowerCase().includes(kpayName.toLowerCase())) {
                    setIsProcessing(false);
                    setStatusMsg(`Recipient Mismatch. The payment must be sent to: ${kpayName}`);
                    setStep(6);
                    return;
                }
            } else if (kpayName) {
                // If Transfer To field not found (Myanmar OCR issue), search for KPayName anywhere in receipt
                console.log("⚠️ Transfer To field not detected, searching for recipient name in full text...");
                const recipientFound = text.toLowerCase().includes(kpayName.toLowerCase());

                if (!recipientFound) {
                    setIsProcessing(false);
                    setStatusMsg(`Recipient not found. The payment must be sent to: ${kpayName}. Please ensure the receipt is clear and complete.`);
                    setStep(6);
                    return;
                }
                console.log("✅ Recipient name found in receipt text");
            }

            // 4. Extract Transaction ID (KBZ Pay uses 20-digit transaction numbers)
            const tranIdMatch = text.match(/\d{20}/);
            const extractedTranId = tranIdMatch ? tranIdMatch[0] : "";

            if (!extractedTranId) {
                setIsProcessing(false);
                setStatusMsg("Transaction ID not found. Please ensure the full receipt is visible.");
                setStep(6);
                return;
            }

            // 5. Extract Amount from the top (large number format: -250,000.00 or 250,000.00)
            // Look for the amount at the top of the receipt (usually the first large number)
            const topAmountMatch = text.match(/[-−]?\s*[\d,]+\.\d{2}\s*\(?\s*[Kk]s?\)?/);
            let extractedAmount = "";

            if (topAmountMatch) {
                const amountStr = topAmountMatch[0].replace(/[-−,\s()Kks]/g, '');
                const numericAmount = parseFloat(amountStr);
                if (numericAmount > 0) {
                    extractedAmount = Math.floor(numericAmount).toString();
                }
            }

            if (!extractedAmount) {
                setIsProcessing(false);
                setStatusMsg("Amount not found. Please ensure the receipt shows the transaction amount clearly.");
                setStep(6);
                return;
            }

            // 6. All validations passed
            setAmount(extractedAmount);
            setTranId(extractedTranId);
            setStep(4);

        } catch (err) {
            console.error("OCR Error:", err);
            setStatusMsg("AI analysis failed. Please check your image quality or try again.");
            setStep(6);
        } finally {
            setIsProcessing(false);
        }
    };

    const finalizeTopUp = async () => {
        if (!storedProfile?.Email || !token || !slip) return;
        setIsProcessing(true);

        try {
            const addedAmount = parseInt(amount);

            // 1. Process thumbnail as base64 string (Following ListAdminAction/FormAdminUpdate pattern)
            const fileToBase64 = (file: File): Promise<string> =>
                new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });

            const base64 = await fileToBase64(slip);
            const resizedBase64 = await resizeImage(base64, 1000); // Standard high-quality resize

            // 2. Prepare atomic update payload
            const updateFd = new FormData();
            updateFd.append("email", storedProfile.Email);
            updateFd.append("token", addedAmount.toString());
            updateFd.append("UsableToken", addedAmount.toString());
            updateFd.append("transId", tranId);
            updateFd.append("amount", amount);
            updateFd.append("name", storedProfile.Name || "");
            updateFd.append("note", "KPay TopUp");

            // Send as base64 string in the "thumbnail" field, matching the project's admin form pattern
            updateFd.append("thumbnail", resizedBase64 as string);

            const updateRes = await fetch(`${BASE_URL}/profile/api/updateToken`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` },
                body: updateFd
            });

            const resData = await updateRes.json().catch(() => ({}));
            const backendMsg = resData.message || resData.msg || resData.error;

            if (updateRes.ok) {
                setStatusMsg(backendMsg || "Top-up successful! Your balance has been updated.");
                setStep(5);
            } else {
                setStatusMsg(backendMsg || "Transaction failed. Please contact support or try again.");
                setStep(6);
            }
        } catch (err) {
            console.error("TopUp process failed:", err);
            setStatusMsg("An unexpected error occurred. Please check your connection.");
            setStep(6);
        } finally {
            setIsProcessing(false);
        }
    };

    if (!isVisible) return null;

    return (
        <>
            <TopUpTrigger onClick={() => setIsOpen(true)} />

            <TopUpModal isOpen={isOpen} step={step} onClose={() => { setIsOpen(false); handleReset(); }}>
                {step === 1 && <Step1_QR qrImageUrl={qrImageUrl} onNext={() => setStep(2)} onReset={handleReset} />}
                {step === 2 && <Step2_Upload slip={slip} onFileChange={handleFileChange} onAiDetection={runAiDetection} isProcessing={isProcessing} onNext={() => { }} onReset={handleReset} />}
                {step === 3 && <Step3_AI />}
                {step === 4 && <Step4_Confirm amount={amount} tranId={tranId} onFinalize={finalizeTopUp} isProcessing={isProcessing} onNext={() => { }} onReset={handleReset} />}
                {step === 5 && <Step5_Success amount={amount} statusMsg={statusMsg} onReset={handleReset} onNext={() => { }} />}
                {step === 6 && <Step6_Error statusMsg={statusMsg} amount={amount} onBackToConfirm={() => setStep(4)} onReset={handleReset} onNext={() => { }} />}
            </TopUpModal>
        </>
    );
};

export default TopUpWidget;
