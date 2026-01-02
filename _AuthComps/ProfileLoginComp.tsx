import React, { useEffect, useState } from 'react';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';

import { BASE_URL, PAGE_ID } from "@/config";
import { initializeFirebase } from "../_firebase/firebaseConfig";
import { getEncryptedItem, setEncryptedItem } from '../HelperComps/encryptionHelper';
import { InitializeNotification } from '../_firebase/Initialize';
import { checkFirebaseConnectivity } from '../HelperComps/firebaseConnectivity';

import UnsupportedBrowser from './ProfileLoginParts/UnsupportedBrowser';
import ProfileLogo from './ProfileLoginParts/ProfileLogo';
import SignInOptions from './ProfileLoginParts/SignInOptions';
import LoadingOverlay from './ProfileLoginParts/LoadingOverlay';

const ProfileLoginComp: React.FC = () => {
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [unsupportedBrowser, setUnsupportedBrowser] = useState(false);
    const [logoLoaded, setLogoLoaded] = useState(false);
    const [pageData, setPageData] = useState<any>(null);
    const [isFirebaseBlocked, setIsFirebaseBlocked] = useState(false);
    const [showEmailLogin, setShowEmailLogin] = useState(false);
    const [email, setEmail] = useState('');

    useEffect(() => {
        (async () => {
            // Check Firebase connectivity
            const isConnected = await checkFirebaseConnectivity();
            setIsFirebaseBlocked(!isConnected);

            // Ensure Firebase is initialized
            const app = initializeFirebase();
            console.log("Initial Firebase init result:", !!app);

            const stored = getEncryptedItem(`StoredEncryptedPage_${PAGE_ID}`);
            if (stored) {
                console.log("Loading page data from storage", stored);
                setPageData(stored);
                return;
            }

            const d = await fetch(`${BASE_URL}/page/api/${PAGE_ID}`).then(r => r.json());
            if (d?.[0]) {
                setEncryptedItem(`StoredEncryptedPage_${PAGE_ID}`, d[0]);
                setPageData(d[0]);
                // Initialize after saving data
                initializeFirebase();
                await InitializeNotification();
            }
        })();
    }, []);

    useEffect(() => {
        const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
        const inAppBrowser = /FBAN|FBAV|Instagram|Line|Snapchat|LinkedIn/i.test(ua);
        if (inAppBrowser) setUnsupportedBrowser(true);
    }, []);

    const showToastMessage = (msg: string) => {
        setToastMessage(msg);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2500);
    };

    const handleGoogleLogin = async () => {
        // Double check initialization before proceeding
        const app = initializeFirebase();
        if (!app) {
            console.error("Firebase not initialized. Attempting to re-initialize...");
            showToastMessage("Initializing service... please try again in a moment.");
            return;
        }

        setIsLoading(true);
        try {
            const googleResult = await FirebaseAuthentication.signInWithGoogle();
            const googleUser = googleResult.user;

            if (!googleUser) {
                throw new Error('Failed to get user information');
            }

            // setUser(googleUser); // Optional: Set local user state if needed immediately
            await performBackendLogin({
                name: googleUser.displayName || '',
                email: googleUser.email || '',
                idToken: (googleResult.credential as any)?.idToken || ''
            });

        } catch (err: any) {
            console.error('Google Sign-In failed:', err);
            showToastMessage('Sign-in failed. Check your connection or use VPN.');
        } finally {
            setIsLoading(false);
        }
    };

    const performBackendLogin = async (userData: { name: string; email: string; idToken?: string }) => {
        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', userData.name);
            formData.append('email', userData.email);
            if (userData.idToken) formData.append('token', userData.idToken);

            const response = await fetch(`${BASE_URL}/profile/api/login`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle non-200 responses specifically if needed
                throw new Error(`Login failed: ${response.statusText}`);
            }


            // Based on user's manual implementation:
            // Store JWT token
            if (data.jwtToken) {
                localStorage.setItem('StoredJWT', data.jwtToken);
            }

            // Store profile returned from API
            if (data.profile) {
                localStorage.setItem('StoredProfile', JSON.stringify({
                    Name: data.profile.Name,
                    Email: data.profile.Email,
                    id: data.profile.id,
                }));
                showToastMessage('Login successful!');
                window.location.href = '/home';
            } else if (data.apiData) {
                // Fallback if structure matches UserLoginComp's response
                localStorage.setItem('StoredProfile', JSON.stringify({
                    Name: data.apiData.Name,
                    Email: data.apiData.Email,
                    id: data.apiData.id,
                }));
                showToastMessage('Login successful!');
                window.location.href = '/home';
            }
            else {
                showToastMessage('Profile not found in database.');
            }

        } catch (err) {
            console.error('Backend login failed:', err);
            showToastMessage('Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEmailLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            showToastMessage('Please enter your email.');
            return;
        }
        performBackendLogin({ name: '', email: email });
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            showToastMessage('URL copied to clipboard!');
        } catch (err) {
            console.error('Copy failed:', err);
            showToastMessage('Failed to copy URL.');
        }
    };

    if (unsupportedBrowser) {
        return (
            <UnsupportedBrowser
                showToast={showToast}
                toastMessage={toastMessage}
                copyToClipboard={copyToClipboard}
            />
        );
    }

    return (
        <div className="min-h-screen flex flex-col justify-center relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-[var(--a2)] rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex flex-col justify-center items-center text-center px-6 space-y-8 py-12">
                <ProfileLogo
                    pageData={pageData}
                    logoLoaded={logoLoaded}
                    setLogoLoaded={setLogoLoaded}
                />

                {/* Welcome Text */}
                <div className="space-y-3">
                    <h1 className="text-3xl md:text-4xl font-bold text-[var(--t1)]">
                        Profile Login
                    </h1>
                    <p className="text-blue-100 text-base md:text-lg font-medium max-w-md leading-relaxed">
                        Please sign in with your Google account to access your account
                    </p>
                </div>

                <SignInOptions
                    user={user}
                    showEmailLogin={showEmailLogin}
                    setShowEmailLogin={setShowEmailLogin}
                    isLoading={isLoading}
                    handleGoogleLogin={handleGoogleLogin}
                    handleEmailLogin={handleEmailLogin}
                    email={email}
                    setEmail={setEmail}
                    isFirebaseBlocked={isFirebaseBlocked}
                />
            </div>

            {/* Toast Notification */}
            {showToast && (
                <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-[var(--bg1)]  text-[var(--t3)] px-6 py-3 rounded-full shadow-2xl text-sm z-50 animate-fade-in border border-[var(--bg3)]">
                    {toastMessage}
                </div>
            )}

            <LoadingOverlay isLoading={isLoading} />
        </div>
    );
};

export default ProfileLoginComp;
