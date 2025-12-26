import React, { memo, useState } from "react";
import { User, ArrowRight, Loader2, CheckCircle, AlertCircle, Phone, Mail, Lock, Building2 } from "lucide-react";

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
    onRegister
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
            className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-[var(--theme-secondary-bg)] to-[var(--theme-secondary-bg)]/95 overflow-y-auto scrollbar-hide"
            role="form"
            aria-label="Chat registration form"
        >
            {/* Animated Icon */}
            <div className="relative mb-5">
                <div className="w-14 h-14 bg-gradient-to-br from-[var(--theme-accent)] to-[var(--scolor-contrast)] rounded-2xl flex items-center justify-center shadow-2xl shadow-[var(--theme-accent)]/20 transform -rotate-3 animate-float">
                    <User size={26} className="text-[var(--theme-text-primary)]" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[var(--scolor)] rounded-full flex items-center justify-center border-2 border-[var(--theme-secondary-bg)]">
                    <CheckCircle size={12} className="text-[var(--theme-text-primary)]" />
                </div>
            </div>

            <h4 className="text-lg font-bold text-[var(--theme-text-primary)] mb-1">Let's Get Started</h4>
            <p className="text-[11px] text-[var(--theme-text-muted)] mb-6 max-w-[220px] leading-relaxed">
                Quick registration to get personalized assistance
            </p>

            {/* Security Badge */}
            <div className="flex items-center gap-1.5 mb-4 px-3 py-1.5 bg-[var(--theme-text-secondary)]/10 rounded-full border border-[var(--theme-text-secondary)]/20">
                <Lock size={10} className="text-[var(--scolor)]" />
                <span className="text-[9px] text-[var(--theme-text-muted)] font-medium">Your data is secure & encrypted</span>
            </div>

            <form onSubmit={handleSubmit} className="w-full space-y-3 max-w-[280px]">
                {/* Name Field */}
                <div className="space-y-1.5 text-left">
                    <label
                        htmlFor="guest-name"
                        className="text-[9px] font-bold text-[var(--theme-text-muted)] uppercase px-1 tracking-wider flex items-center gap-1"
                    >
                        <User size={10} />
                        Full Name <span className="text-[var(--theme-accent)]">*</span>
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
                            className={`w-full bg-[var(--theme-text-secondary)]/10 border text-[var(--theme-text-primary)] rounded-xl px-4 py-3 text-xs focus:outline-none transition-all placeholder:text-[var(--theme-text-muted)]/50 ${focusedField === 'name'
                                ? 'border-[var(--theme-accent)]/50 ring-2 ring-[var(--theme-accent)]/20'
                                : guestName && !isNameValid
                                    ? 'border-[var(--theme-accent)]/50'
                                    : 'border-[var(--theme-text-primary)]/5 hover:border-[var(--theme-text-primary)]/10'
                                }`}
                            aria-required="true"
                            aria-invalid={guestName.length > 0 && !isNameValid}
                        />
                        {guestName && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                {isNameValid ? (
                                    <CheckCircle size={14} className="text-[var(--scolor)]" />
                                ) : (
                                    <AlertCircle size={14} className="text-[var(--theme-accent)]" />
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Phone Field */}
                <div className="space-y-1.5 text-left">
                    <label
                        htmlFor="guest-phone"
                        className="text-[9px] font-bold text-slate-500 uppercase px-1 tracking-wider flex items-center gap-1"
                    >
                        <Phone size={10} />
                        Phone Number <span className="text-red-400">*</span>
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
                            className={`w-full bg-slate-800/60 border text-white rounded-xl px-4 py-3 text-xs focus:outline-none transition-all placeholder:text-slate-600 ${focusedField === 'phone'
                                ? 'border-blue-500/50 ring-2 ring-blue-500/20'
                                : guestPhone && !isPhoneValid
                                    ? 'border-red-500/50'
                                    : 'border-white/5 hover:border-white/10'
                                }`}
                            aria-required="true"
                            aria-invalid={guestPhone.length > 0 && !isPhoneValid}
                        />
                        {guestPhone && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                {isPhoneValid ? (
                                    <CheckCircle size={14} className="text-green-400" />
                                ) : (
                                    <AlertCircle size={14} className="text-red-400" />
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Email Field */}
                <div className="space-y-1.5 text-left">
                    <label
                        htmlFor="guest-email"
                        className="text-[9px] font-bold text-slate-500 uppercase px-1 tracking-wider flex items-center gap-1"
                    >
                        <Mail size={10} />
                        Email <span className="text-slate-600">(Optional)</span>
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
                            className={`w-full bg-slate-800/60 border text-white rounded-xl px-4 py-3 text-xs focus:outline-none transition-all placeholder:text-slate-600 ${focusedField === 'email'
                                ? 'border-blue-500/50 ring-2 ring-blue-500/20'
                                : guestEmail && !isEmailValid
                                    ? 'border-red-500/50'
                                    : 'border-white/5 hover:border-white/10'
                                }`}
                            aria-invalid={guestEmail.length > 0 && !isEmailValid}
                        />
                        {guestEmail && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                {isEmailValid ? (
                                    <CheckCircle size={14} className="text-green-400" />
                                ) : (
                                    <AlertCircle size={14} className="text-red-400" />
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Company Field (Optional) */}
                <div className="space-y-1.5 text-left">
                    <label
                        htmlFor="guest-company"
                        className="text-[9px] font-bold text-slate-500 uppercase px-1 tracking-wider flex items-center gap-1"
                    >
                        <Building2 size={10} />
                        Company <span className="text-slate-600">(Optional)</span>
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
                            className={`w-full bg-slate-800/60 border text-white rounded-xl px-4 py-3 text-xs focus:outline-none transition-all placeholder:text-slate-600 ${focusedField === 'company'
                                ? 'border-blue-500/50 ring-2 ring-blue-500/20'
                                : 'border-white/5 hover:border-white/10'
                                }`}
                        />
                        {guestCompany && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <CheckCircle size={14} className="text-green-400" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={!canSubmit || isSubmitting}
                    className={`w-full font-bold py-3.5 rounded-xl shadow-lg transition-all mt-3 flex items-center justify-center gap-2 text-sm ${canSubmit && !isSubmitting
                        ? 'bg-gradient-to-r from-[var(--theme-accent)] to-[var(--scolor-contrast)] text-[var(--theme-primary-text)] shadow-[var(--theme-accent)]/20 hover:shadow-[var(--theme-accent)]/30 hover:scale-[1.02] active:scale-[0.98]'
                        : 'bg-[var(--theme-text-secondary)]/10 text-[var(--theme-text-muted)] cursor-not-allowed'
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
                <p className="text-[8px] text-[var(--theme-text-muted)]/50 text-center mt-3 leading-relaxed">
                    By starting a chat, you agree to our terms of service
                </p>
            </form>
        </div>
    );
});

export default RegistrationForm;
