import React, { memo, useState } from "react";
import { User, ArrowRight, Loader2, CheckCircle, AlertCircle, Phone, Mail, Lock, Building2, X } from "lucide-react";

interface RegistrationFormProps {
    guestName: string;
    setGuestName: (val: string) => void;
    guestPhone: string;
    setGuestPhone: (val: string) => void;
    guestEmail: string;
    setGuestEmail: (val: string) => void;
    guestCompany: string;
    setGuestCompany: (val: string) => void;
    onRegister: (e: React.FormEvent) => void;
    onClose?: () => void;
}

const RegistrationForm = memo(function RegistrationForm({
    guestName,
    setGuestName,
    guestPhone,
    setGuestPhone,
    guestEmail,
    setGuestEmail,
    guestCompany,
    setGuestCompany,
    onRegister,
    onClose
}: RegistrationFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);

    const isNameValid = guestName.trim().length >= 2;
    const isPhoneValid = guestPhone.trim().length >= 6;
    const isEmailValid = !guestEmail || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail);
    const canSubmit = isNameValid && isPhoneValid && isEmailValid;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;
        setIsSubmitting(true);
        await onRegister(e);
        setIsSubmitting(false);
    };

    return (
        <div
            className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-[var(--bg1)] overflow-y-auto scrollbar-hide relative"
            role="form"
            aria-label="Chat registration form"
        >
            {/* Close Button */}
            {onClose && (
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/10 transition-colors text-[var(--t2)]"
                    aria-label="Close registration"
                >
                    <X size={20} />
                </button>
            )}
            {/* Animated Icon */}
            <div className="relative mb-6">
                <div className="w-16 h-16 rounded-[2rem] flex items-center justify-center text-[var(--t1)] shadow-xl animate-float" style={{ background: 'var(--a2)' }}>
                    <User size={30} />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[var(--a2)] rounded-full flex items-center justify-center border-4 border-[var(--a3)] shadow-md">
                    <CheckCircle size={14} className="text-[var(--t1)]" />
                </div>
            </div>

            <h4 className="text-lg font-bold text-[var(--t3)] mb-1">Let's Get Started</h4>
            <p className="text-[11px] text-[var(--t2)] mb-6 max-w-[220px] leading-relaxed">
                Quick registration to get personalized assistance
            </p>

            {/* Security Badge */}
            <div className="flex items-center gap-1.5 mb-6 px-4 py-2 bg-[var(--a2)]/10 rounded-full border border-[var(--a2)]/20">
                <Lock size={10} className="text-[var(--a2)]" />
                <span className="text-[9px] text-[var(--a3)] font-black uppercase tracking-widest">Secure & Encrypted</span>
            </div>

            <form onSubmit={handleSubmit} className="w-full space-y-3 max-w-[280px]">
                {/* Name Field */}
                <div className="space-y-1.5 text-left">
                    <label
                        htmlFor="guest-name"
                        className="text-[9px] font-bold text-[var(--t2)] uppercase px-1 tracking-wider flex items-center gap-1"
                    >
                        <User size={10} />
                        Full Name <span className="text-[var(--a2)]">*</span>
                    </label>
                    <div className="relative">
                        <input
                            id="guest-name"
                            required
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                            onFocus={() => setFocusedField('name')}
                            onBlur={() => setFocusedField(null)}
                            placeholder="Your full name"
                            className={`w-full bg-[var(--bg1)] border text-[var(--t3)] rounded-xl px-4 py-3 text-xs focus:outline-none transition-all placeholder:text-[var(--t2)]/50 ${focusedField === 'name'
                                ? 'border-[var(--a2)]/50 ring-2 ring-[var(--a2)]/20'
                                : guestName && !isNameValid
                                    ? 'border-red-500'
                                    : 'border-[var(--bg3)] hover:border-[var(--bg3)]'
                                }`}
                            aria-required="true"
                            aria-invalid={guestName.length > 0 && !isNameValid}
                        />
                        {guestName && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                {isNameValid ? (
                                    <CheckCircle size={14} className="text-[var(--a2)]" />
                                ) : (
                                    <AlertCircle size={14} className="text-[var(--a2)]" />
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Phone Field */}
                <div className="space-y-2 text-left">
                    <label
                        htmlFor="guest-phone"
                        className="text-[10px] font-black text-[var(--t2)] uppercase px-1 tracking-[0.1em] flex items-center gap-2"
                    >
                        <Phone size={11} className="text-[var(--a2)]" />
                        Phone Number <span className="text-[var(--a2)]">*</span>
                    </label>
                    <div className="relative">
                        <input
                            id="guest-phone"
                            required
                            type="tel"
                            value={guestPhone}
                            onChange={(e) => setGuestPhone(e.target.value)}
                            onFocus={() => setFocusedField('phone')}
                            onBlur={() => setFocusedField(null)}
                            placeholder="e.g. +1 234 567 8900"
                            className={`w-full bg-[var(--bg1)] border text-[var(--t3)] rounded-2xl px-5 py-3.5 text-xs focus:outline-none transition-all placeholder:text-[var(--t2)]/40 ${focusedField === 'phone'
                                ? 'border-[var(--a2)] ring-4 ring-[var(--a2)]/10'
                                : guestPhone && !isPhoneValid
                                    ? 'border-red-500'
                                    : 'border-[var(--bg3)] hover:border-[var(--bg3)]'
                                }`}
                            aria-required="true"
                            aria-invalid={guestPhone.length > 0 && !isPhoneValid}
                        />
                        {guestPhone && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                {isPhoneValid ? (
                                    <CheckCircle size={16} className="text-[var(--a2)]" />
                                ) : (
                                    <AlertCircle size={16} className="text-[var(--r2)]" />
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Email Field */}
                <div className="space-y-2 text-left">
                    <label
                        htmlFor="guest-email"
                        className="text-[10px] font-black text-[var(--t2)] uppercase px-1 tracking-[0.1em] flex items-center gap-2"
                    >
                        <Mail size={11} className="text-[var(--a2)]" />
                        Email <span className="text-[var(--t2)] font-bold italic">(Optional)</span>
                    </label>
                    <div className="relative">
                        <input
                            id="guest-email"
                            type="email"
                            value={guestEmail}
                            onChange={(e) => setGuestEmail(e.target.value)}
                            onFocus={() => setFocusedField('email')}
                            onBlur={() => setFocusedField(null)}
                            placeholder="your@email.com"
                            className={`w-full bg-[var(--bg1)] border text-[var(--t3)] rounded-2xl px-5 py-3.5 text-xs focus:outline-none transition-all placeholder:text-[var(--t2)]/40 ${focusedField === 'email'
                                ? 'border-[var(--a2)] ring-4 ring-[var(--a2)]/10'
                                : guestEmail && !isEmailValid
                                    ? 'border-red-500'
                                    : 'border-[var(--bg3)] hover:border-[var(--bg3)]'
                                }`}
                            aria-invalid={guestEmail.length > 0 && !isEmailValid}
                        />
                        {guestEmail && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                {isEmailValid ? (
                                    <CheckCircle size={16} className="text-[var(--a2)]" />
                                ) : (
                                    <AlertCircle size={16} className="text-[var(--r2)]" />
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Company Field (Optional) */}
                <div className="space-y-2 text-left">
                    <label
                        htmlFor="guest-company"
                        className="text-[10px] font-black text-[var(--t2)] uppercase px-1 tracking-[0.1em] flex items-center gap-2"
                    >
                        <Building2 size={11} className="text-[var(--a2)]" />
                        Company <span className="text-[var(--t2)] font-bold italic">(Optional)</span>
                    </label>
                    <div className="relative">
                        <input
                            id="guest-company"
                            type="text"
                            value={guestCompany}
                            onChange={(e) => setGuestCompany(e.target.value)}
                            onFocus={() => setFocusedField('company')}
                            onBlur={() => setFocusedField(null)}
                            placeholder="Your company name"
                            className={`w-full bg-[var(--bg1)] border text-[var(--t3)] rounded-2xl px-5 py-3.5 text-xs focus:outline-none transition-all placeholder:text-[var(--t2)]/40 ${focusedField === 'company'
                                ? 'border-[var(--a2)] ring-4 ring-[var(--a2)]/10'
                                : 'border-[var(--bg3)] hover:border-[var(--bg3)]'
                                }`}
                        />
                        {guestCompany && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <CheckCircle size={16} className="text-[var(--a2)]" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={!canSubmit || isSubmitting}
                    className={`w-full font-bold py-3.5 rounded-xl shadow-lg transition-all mt-3 flex items-center justify-center gap-2 text-sm ${canSubmit && !isSubmitting
                        ? 'bg-[var(--a2)] text-[var(--t1)] shadow-[var(--a2)]/20 hover:shadow-[var(--a2)]/30 hover:scale-[1.02] active:scale-[0.98]'
                        : 'bg-[var(--t2)]/10 text-[var(--t2)] cursor-not-allowed'
                        }`}
                    aria-disabled={!canSubmit || isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Starting Chat...
                        </>
                    ) : (
                        <>
                            Start Chat
                            <ArrowRight className="w-4 h-4" />
                        </>
                    )}
                </button>

                {/* Privacy Note */}
                <p className="text-[8px] text-[var(--t2)]/50 text-center mt-3 leading-relaxed">
                    By starting a chat, you agree to our terms of service
                </p>
            </form>
        </div>
    );
});

export default RegistrationForm;
