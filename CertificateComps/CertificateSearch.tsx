import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Search, Award, AlertCircle, Loader2, X } from 'lucide-react';
import { BASE_URL, IMAGE_URL, PAGE_ID } from '@/config';

export default function CertificateSearch() {
    const [certNumber, setCertNumber] = useState('');
    const [certificate, setCertificate] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!certNumber.trim()) return;

        setLoading(true);
        setError(null);
        setCertificate(null);

        try {
            const url = `${BASE_URL}/certificate/api/byPageId/bySearch/byPageId/${PAGE_ID}/${certNumber}`;
            console.log("Searching with URL:", url);

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(response.status === 404 ? 'Certificate not found.' : `Server error: ${response.status}`);
            }

            const data = await response.json();
            const result = Array.isArray(data) ? data[0] : data;

            if (!result || Object.keys(result).length === 0) {
                setError('No certificate found with this serial number.');
            } else {
                setCertificate(result);
                setShowModal(true);
            }
        } catch (err: any) {
            console.error("Verification error:", err);
            setError(err.message || 'Could not verify certificate.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Custom Modal with Portal to ensure it is above everything */}
            {showModal && certificate && createPortal(
                <div
                    className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-300 pointer-events-auto"
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className="relative w-full h-full flex items-center justify-center pointer-events-none p-0 md:p-10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="relative aspect-[1.414/1] w-full max-w-[1000px] max-h-full bg-white shadow-2xl overflow-hidden pointer-events-auto">
                            <img
                                src={IMAGE_URL + "/uploads/Spero-Certificate-7.png"}
                                alt="Certificate"
                                className="w-full h-full object-cover"
                            />

                            {/* Perfectly Centered 2-Column Grid */}
                            <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
                                <div className="w-full grid grid-cols-2 text-center items-center">
                                    <div className="px-4">
                                        <h3 className="text-xl md:text-3xl lg:text-[4.5vw] font-serif font-black text-gray-900 italic leading-tight">
                                            {certificate.CertificateNumber}
                                        </h3>
                                    </div>
                                    <div className="px-4">
                                        <p className="text-xl md:text-3xl lg:text-[4vw] font-mono font-black text-gray-900 tracking-tighter">
                                            {certificate.Title}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute top-4 right-4 p-2 md:p-4 bg-black/10 hover:bg-black/20 backdrop-blur-md rounded-full transition-all z-30"
                            >
                                <X size={24} className="text-white" />
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            <div className="min-h-screen mt-20 bg-gray-50 flex flex-col items-center p-4 py-20">
                <div className="max-w-2xl w-full mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="text-center mb-10">
                        <div className="w-24 h-24 bg-gradient-to-tr from-[var(--theme-primary-bg)] to-blue-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-[var(--theme-primary-bg)]/20">
                            <Award size={48} className="text-white" />
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">Certificate Verification</h1>
                        <p className="text-lg text-gray-500 font-medium">Verify official Spero English Language Academy certificates.</p>
                    </div>

                    <form onSubmit={handleSearch} className="relative group">
                        <div className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--theme-primary-bg)] transition-colors">
                            <Search size={24} />
                        </div>
                        <input
                            type="text"
                            className="w-full pl-16 pr-40 py-6 bg-white border-2 border-gray-100 rounded-[2.5rem] shadow-2xl shadow-gray-200/40 outline-none focus:border-[var(--theme-primary-bg)] transition-all text-xl font-bold text-gray-900 placeholder:text-gray-300 placeholder:font-normal"
                            placeholder="Enter Serial Number..."
                            value={certNumber}
                            onChange={(e) => setCertNumber(e.target.value)}
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="absolute right-3 top-3 bottom-3 px-10 bg-[var(--theme-primary-bg)] text-white font-black rounded-[2rem] hover:opacity-95 disabled:opacity-50 transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-[var(--theme-primary-bg)]/20"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Verify Now'}
                        </button>
                    </form>

                    {error && (
                        <div className="mt-8 flex items-center gap-4 p-5 bg-red-50 text-red-600 rounded-[2rem] border border-red-100 animate-in shake-in duration-300">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                <AlertCircle size={24} />
                            </div>
                            <span className="font-bold text-lg">{error}</span>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
