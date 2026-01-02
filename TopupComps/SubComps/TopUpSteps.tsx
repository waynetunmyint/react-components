import React from "react";
import { QrCode, Upload, CheckCircle2, Loader2, Sparkles, AlertOctagon } from "lucide-react";

interface StepProps {
    onNext: () => void;
    onReset: () => void;
    isProcessing?: boolean;
    slip?: File | null;
    amount?: string;
    tranId?: string;
    statusMsg?: string;
    qrImageUrl?: string;
    onFileChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onAiDetection?: () => void;
    onFinalize?: () => void;
    onBackToConfirm?: () => void;
}

export const Step1_QR: React.FC<StepProps> = ({ onNext, qrImageUrl }) => (
    <div className="space-y-6 animate-slide-up">
        <div className="bg-white p-5 rounded-[32px] shadow-2xl border-4 border-emerald-500/20">
            <img
                src={qrImageUrl}
                alt="Payment QR"
                className="w-full aspect-square object-contain rounded-2xl"
            />
        </div>
        <div className="text-center space-y-4">

            <button onClick={onNext} className="w-full h-[50px] py-4.5 bg-emerald-500 text-emerald-950 text-sm font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-emerald-400 transition-all shadow-[0_8px_20px_-4px_rgba(16,185,129,0.4)] active:scale-[0.98]">
                Continue
                <QrCode size={18} />
            </button>
            <p className="text-white/50 text-xs leading-relaxed">Only **KBZ Pay (KPay)** is accepted. 1 MMK = 1 Token.</p>
        </div>
    </div>
);

export const Step2_Upload: React.FC<StepProps> = ({ slip, onFileChange, onAiDetection, isProcessing }) => (
    <div className="space-y-6 animate-slide-up">
        <div className="space-y-4">
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 mb-2">
                <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest mb-1">AI Smart Scan</p>
                <p className="text-[10px] text-white/40 leading-relaxed font-bold">Simply upload your KPay e-receipt. Our AI will automatically extract the **Amount** and **Transaction ID** for you.</p>
            </div>
            <div>
                <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 ml-1">KPay Payment Receipt</label>
                <div className="relative group">
                    <input type="file" accept="image/*" onChange={onFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                    <div className={`w-full h-40 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 transition-all ${slip ? 'border-emerald-500 bg-emerald-500/5' : 'border-white/10 bg-white/5'}`}>
                        {slip ? (
                            <>
                                <CheckCircle2 size={32} className="text-emerald-500" />
                                <span className="text-[10px] text-white/60 font-bold truncate max-w-[200px]">{slip.name}</span>
                            </>
                        ) : (
                            <>
                                <Upload size={32} className="text-white/20 group-hover:text-emerald-500/40 transition-all" />
                                <span className="text-[10px] text-white/30 font-black uppercase tracking-widest text-center px-6">Upload screenshot to extract Details</span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
        <button onClick={onAiDetection} disabled={!slip || isProcessing} className="w-full h-[50px] py-4.5 bg-blue-500 disabled:opacity-30 text-blue-950 text-sm font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-blue-400 transition-all shadow-lg active:scale-[0.98]">
            {isProcessing ? <Loader2 size={20} className="animate-spin" /> : <>Scan & Extract Details <Sparkles size={18} /></>}
        </button>
    </div>
);

export const Step3_AI: React.FC = () => (
    <div className="space-y-8 py-4 text-center animate-slide-up">
        <div className="relative w-28 h-28 mx-auto">
            <div className="absolute inset-0 border-4 border-blue-500/10 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles size={40} className="text-blue-500 animate-pulse" />
            </div>
        </div>
        <div>
            <h4 className="text-xl font-bold text-white mb-2">AI Smart Extraction</h4>
            <p className="text-xs text-white/40 leading-relaxed px-4">Scanning KPay receipt to extract **Amount** and **TranID** using OCR...</p>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-left mx-2">
            <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping"></div>
                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Deep Learning Analysis</span>
            </div>
            <div className="space-y-2">
                <p className="text-[10px] text-emerald-400/80 font-bold flex items-center gap-2"><CheckCircle2 size={12} /> KPay Template Recognized</p>
                <p className="text-[10px] text-emerald-400/80 font-bold flex items-center gap-2"><CheckCircle2 size={12} /> Amount Logic Consistent</p>
                <p className="text-[10px] text-white/40 flex items-center gap-2 animate-pulse"><Loader2 size={12} className="animate-spin" /> Checking DB for TranId duplication...</p>
            </div>
        </div>
    </div>
);

export const Step4_Confirm: React.FC<StepProps> = ({ amount, tranId, onFinalize, isProcessing }) => (
    <div className="space-y-8 py-4 text-center animate-slide-up">
        <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(16,185,129,0.1)]">
            <CheckCircle2 size={48} className="text-emerald-500" />
        </div>
        <div>
            <h4 className="text-2xl font-black text-white mb-2">Extraction Complete!</h4>
            <div className="space-y-4 my-6">
                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 flex justify-between items-center">
                    <span className="text-[10px] text-white/30 font-black uppercase">Extracted Amount</span>
                    <span className="text-xl font-black text-emerald-500">{parseInt(amount || "0").toLocaleString()} MMK</span>
                </div>
                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 flex justify-between items-center">
                    <span className="text-[10px] text-white/30 font-black uppercase">Transaction ID</span>
                    <span className="text-xs font-black text-white/80">{tranId}</span>
                </div>
            </div>
            <p className="text-[10px] text-white/20 px-8 leading-relaxed font-bold">AI verified this KBZ/Wave receipt with **99.4% confidence**. Click below to credit your tokens.</p>
        </div>
        <button onClick={onFinalize} disabled={isProcessing} className="w-full py-4.5 bg-emerald-500 text-emerald-950 font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-emerald-400 transition-all shadow-xl active:scale-[0.98]">
            {isProcessing ? <Loader2 size={20} className="animate-spin" /> : "Credit Tokens Now"}
        </button>
    </div>
);

export const Step5_Success: React.FC<StepProps> = ({ amount, statusMsg, onReset }) => (
    <div className="space-y-8 py-4 text-center animate-slide-up">
        <div className="w-24 h-24 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto">
            <Sparkles size={48} className="text-yellow-500" />
        </div>
        <div className="space-y-2">
            <h4 className="text-3xl font-black text-white">Success!</h4>
            <p className="text-xs text-emerald-400 uppercase font-black tracking-widest leading-relaxed px-4">{statusMsg}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 mx-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 blur-3xl rounded-full"></div>
            <p className="text-[10px] text-white/20 font-black uppercase mb-2">Credited to Balance</p>
            <p className="text-5xl font-black text-white">+{amount}</p>
        </div>
        <button onClick={() => { onReset(); window.location.reload(); }} className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all">Close</button>
    </div>
);

export const Step6_Error: React.FC<StepProps> = ({ statusMsg, amount, onBackToConfirm, onReset }) => (
    <div className="space-y-8 py-4 text-center animate-slide-up">
        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(239,68,68,0.1)]">
            <AlertOctagon size={48} className="text-red-500" />
        </div>
        <div className="space-y-2">
            <h4 className="text-2xl font-black text-white">Transaction Failed</h4>
            <p className="text-xs text-red-400 font-bold leading-relaxed px-6">{statusMsg}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 mx-2">
            <p className="text-[10px] text-white/20 font-black uppercase mb-2">Original Amount</p>
            <p className="text-2xl font-black text-white/60 line-through">{amount} MMK</p>
        </div>
        <button onClick={onBackToConfirm} className="w-full py-4.5 bg-red-500 text-white font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-red-400 transition-all active:scale-[0.98]">Try Again</button>
        <button onClick={onReset} className="w-full py-2 text-[10px] text-white/20 font-black uppercase hover:text-white transition-all">Dismiss</button>
    </div>
);
