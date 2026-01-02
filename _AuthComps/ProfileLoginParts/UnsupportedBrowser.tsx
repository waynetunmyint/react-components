import React from 'react';
import { ClipboardIcon } from 'lucide-react';

interface UnsupportedBrowserProps {
    showToast: boolean;
    toastMessage: string;
    copyToClipboard: () => void;
}

const UnsupportedBrowser: React.FC<UnsupportedBrowserProps> = ({
    showToast,
    toastMessage,
    copyToClipboard
}) => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
            <div className="bg-[var(--bg1)]  rounded-3xl shadow-2xl p-8 max-w-md w-full text-center space-y-6 border border-[var(--bg2)]">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full mb-4 shadow-lg">
                    <span className="text-4xl">🚫</span>
                </div>
                <h2 className="text-2xl font-bold text-[var(--t3)]">Unsupported Browser</h2>
                <p className="text-[var(--t2)] leading-relaxed">
                    Oops! This app does not work inside in-app browsers.
                    Please open this page using a real desktop or mobile browser. 🌐
                </p>
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                    <p className="text-red-800 text-sm leading-relaxed">
                        ဂူဂဲလ်က Login စနစ်က ဖေ့ဘုတ်ရဲ့ browser ထဲမှာ အလုပ်မလုပ်ပါဘူး။ သူတို့အချင်းချင်းပြသနာပါ။
                        ကျေးဇူးပြု၍ Chrome, Safari, Firefox စတဲ့ browser တွေထဲမှာဖွင့်ပါ။
                    </p>
                </div>

                <button
                    onClick={copyToClipboard}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-[var(--t1)] rounded-2xl font-semibold hover:from-blue-700 hover:to-blue-800 active:scale-95 transition-all shadow-lg hover:shadow-xl"
                >
                    <ClipboardIcon size={20} className="text-[var(--t1)]" />
                    Copy URL to Clipboard
                </button>
            </div>

            {showToast && (
                <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-gray-900  text-[var(--t1)] px-6 py-3 rounded-full shadow-2xl text-sm z-50 animate-fade-in">
                    {toastMessage}
                </div>
            )}
        </div>
    );
};

export default UnsupportedBrowser;
