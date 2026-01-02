import React from 'react';
import { Info } from 'lucide-react';

interface SignInOptionsProps {
    user: any;
    showEmailLogin: boolean;
    setShowEmailLogin: (show: boolean) => void;
    isLoading: boolean;
    handleGoogleLogin: () => void;
    handleEmailLogin: (e: React.FormEvent) => void;
    email: string;
    setEmail: (email: string) => void;
    isFirebaseBlocked: boolean;
}

const SignInOptions: React.FC<SignInOptionsProps> = ({
    user,
    showEmailLogin,
    setShowEmailLogin,
    isLoading,
    handleGoogleLogin,
    handleEmailLogin,
    email,
    setEmail,
    isFirebaseBlocked
}) => {
    if (user) return null;

    return (
        <div className="w-full max-w-sm space-y-6">
            {!showEmailLogin ? (
                <div className="space-y-4">
                    <button
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="group w-full flex items-center justify-center gap-3 py-4 px-6 bg-[var(--bg1)] text-[var(--t3)] text-base font-semibold rounded-2xl shadow-xl hover:shadow-2xl active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                        <div className="relative flex items-center gap-3">
                            <svg className="w-6 h-6" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            <span>{isLoading ? "Signing in..." : "Sign in with Google"}</span>
                        </div>
                    </button>
                    {/* 
                     <div className="flex items-center gap-4 my-2">
                        <div className="flex-1 h-px bg-[var(--bg1)]"></div>
                        <span className="text-[var(--t1)] text-xs font-medium uppercase tracking-wider">or</span>
                        <div className="flex-1 h-px bg-[var(--bg1)]"></div>
                    </div>
    
                    <button
                        onClick={() => setShowEmailLogin(true)}
                        className="w-full py-3 px-6 bg-[var(--bg1)] hover:bg-[var(--bg1)] text-[var(--t1)] text-sm font-medium rounded-2xl border border-[var(--bg1)]  transition-all active:scale-95"
                    >
                        Login with Email
                    </button> */}
                </div>
            ) : (
                <form onSubmit={handleEmailLogin} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="relative">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-6 py-4 bg-[var(--bg1)] border border-[var(--bg1)] rounded-2xl text-[var(--t1)] placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500  transition-all"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 bg-[var(--a2)] hover:bg-blue-700 text-[var(--t1)] font-bold rounded-2xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
                    >
                        {isLoading ? 'Verifying...' : 'Continue'}
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowEmailLogin(false)}
                        className="w-full text-[var(--t1)] text-sm hover:text-[var(--t1)] transition-colors"
                    >
                        Back to Google Login
                    </button>
                </form>
            )}

            {/* Firebase/VPN Warnings */}
            {(isFirebaseBlocked && !showEmailLogin) && (
                <div className="p-4 rounded-2xl bg-[var(--r2)] border border-red-500  animate-pulse">
                    <div className="flex gap-3">
                        <Info size={20} className="text-red-400 shrink-0" />
                        <div className="text-left text-xs text-red-100 leading-relaxed">
                            <p className="font-bold mb-1">Firebase is unreachable</p>
                            <p>It seems Firebase is restricted in your area. Please turn on your <b>VPN</b> or use the <b>Email Login</b> option above.</p>
                        </div>
                    </div>
                </div>
            )}

            {!isFirebaseBlocked && (
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500 border border-amber-500 ">
                    <Info size={18} className="text-amber-500 shrink-0 mt-0.5" />
                    <div className="text-left">
                        <p className="text-amber-200 text-[11px] leading-relaxed">
                            Google does not allow sign-ins from embedded browsers (like Facebook or Instagram). If you encounter issues, please use Chrome or Safari.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SignInOptions;
