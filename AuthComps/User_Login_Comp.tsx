import React, { useEffect, useState } from 'react';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { ClipboardIcon, Info } from 'lucide-react';

// import "../_firebase/firebaseConfig";
import { APP_NAME, BASE_URL, IMAGE_URL, PAGE_ID } from '../../../config';
import "../_firebase/firebaseConfig";
import { getEncryptedItem, setEncryptedItem } from '../HelperComps/encryptionHelper';
import { InitializeNotification } from '../_firebase/Initialize';
import { checkFirebaseConnectivity } from '../HelperComps/firebaseConnectivity';

const UserLoginComp: React.FC = () => {
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

      const stored = getEncryptedItem("StoredEncryptedPage");
      if (stored) {
        console.log("Loading page data from storage", stored);
        setPageData(stored);
        return;
      }

      const d = await fetch(`${BASE_URL}/page/api/${PAGE_ID}`).then(r => r.json());
      if (d?.[0]) {
        // console.log("Storing page data locally", d[0]);
        setEncryptedItem("StoredEncryptedPage", d[0]);
        setPageData(d[0]);
        InitializeNotification();
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
    setIsLoading(true);
    try {
      // Let the plugin automatically choose popup or redirect based on platform
      const googleResult = await FirebaseAuthentication.signInWithGoogle();
      const googleUser = googleResult.user;

      if (!googleUser) {
        throw new Error('Failed to get user information');
      }

      await performBackendLogin(googleUser.email || '');

    } catch (err: any) {
      console.error('Google Sign-In failed:', err);
      showToastMessage('Sign-in failed. Check your connection or use VPN.');
    } finally {
      setIsLoading(false);
    }
  };

  const performBackendLogin = async (userEmail: string) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('pageId', PAGE_ID.toString());
      formData.append('email', userEmail);
      const response = await fetch(`${BASE_URL}/user/api/login`, {
        method: 'POST',
        body: formData,
      });
      const responseJson = await response.json();

      if (responseJson.apiData) {
        localStorage.setItem('StoredUser', JSON.stringify({
          Name: responseJson.apiData.Name,
          Email: responseJson.apiData.Email
        }));

        if (responseJson.jwtToken) {
          localStorage.setItem('StoredJWT', responseJson.jwtToken);
        }
        window.location.href = '/admin';
      } else {
        showToastMessage('User not found in database.');
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
    performBackendLogin(email);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-md w-full text-center space-y-6 border border-gray-100">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full mb-4 shadow-lg">
            <span className="text-4xl">🚫</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Unsupported Browser</h2>
          <p className="text-gray-600 leading-relaxed">
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
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-blue-800 active:scale-95 transition-all shadow-lg hover:shadow-xl"
          >
            <ClipboardIcon size={20} className="text-white" />
            Copy URL to Clipboard
          </button>
        </div>

        {showToast && (
          <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-gray-900/95 backdrop-blur-sm text-white px-6 py-3 rounded-full shadow-2xl text-sm z-50 animate-fade-in">
            {toastMessage}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col justify-center items-center text-center px-6 space-y-8 py-12">
        {/* Logo Container */}
        <div className="w-full max-w-sm">
          <div className="relative inline-block">
            {/* Animated Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl blur-xl opacity-30 animate-pulse"></div>

            {/* Skeleton Loader */}
            {!logoLoaded && (
              <div className="relative w-48 h-48 rounded-3xl mx-auto shadow-2xl border-4 border-white/20 bg-gradient-to-br from-blue-900/30 to-purple-900/30 backdrop-blur-sm overflow-hidden">
                {/* Shimmer effect */}
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                {/* Pulsing circles */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="absolute w-32 h-32 border-4 border-blue-400/30 rounded-full animate-ping"></div>
                  <div className="absolute w-24 h-24 border-4 border-purple-400/40 rounded-full animate-pulse"></div>
                  <div className="relative w-16 h-16 border-4 border-white/60 border-t-transparent rounded-full animate-spin"></div>
                </div>

                {/* Loading text */}
                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <p className="text-white/70 text-xs font-medium animate-pulse">Loading...</p>
                </div>
              </div>
            )}

            {/* Actual Logo */}
            <img
              className={`relative w-48 h-48 rounded-3xl mx-auto shadow-2xl border-4 border-white/20 object-contain transition-all duration-700 ${logoLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95 absolute inset-0'
                }}`}
              src={`${IMAGE_URL}/uploads/${pageData?.ContactInfoThumbnail}`}
              alt={`${APP_NAME} Logo`}
              loading="eager"
              onLoad={() => setLogoLoaded(true)}
              onError={() => setLogoLoaded(true)}
            />
          </div>
        </div>

        {/* Welcome Text */}
        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Welcome Back
          </h1>
          <p className="text-blue-100/80 text-base md:text-lg font-medium max-w-md leading-relaxed">
            Please sign in with your Google account to access all features
          </p>
        </div>

        {/* Sign In Options */}
        {!user && (
          <div className="w-full max-w-sm space-y-6">
            {!showEmailLogin ? (
              <div className="space-y-4">
                <button
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="group w-full flex items-center justify-center gap-3 py-4 px-6 bg-white text-gray-900 text-base font-semibold rounded-2xl shadow-xl hover:shadow-2xl active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
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

                <div className="flex items-center gap-4 my-2">
                  <div className="flex-1 h-px bg-white/20"></div>
                  <span className="text-white/40 text-xs font-medium uppercase tracking-wider">or</span>
                  <div className="flex-1 h-px bg-white/20"></div>
                </div>

                <button
                  onClick={() => setShowEmailLogin(true)}
                  className="w-full py-3 px-6 bg-white/10 hover:bg-white/15 text-white text-sm font-medium rounded-2xl border border-white/20 backdrop-blur-sm transition-all active:scale-95"
                >
                  Login with Email
                </button>
              </div>
            ) : (
              <form onSubmit={handleEmailLogin} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 backdrop-blur-md transition-all"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
                >
                  {isLoading ? 'Verifying...' : 'Continue'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEmailLogin(false)}
                  className="w-full text-white/60 text-sm hover:text-white transition-colors"
                >
                  Back to Google Login
                </button>
              </form>
            )}

            {/* Firebase/VPN Warnings */}
            {(isFirebaseBlocked && !showEmailLogin) && (
              <div className="p-4 rounded-2xl bg-red-500/20 border border-red-500/30 backdrop-blur-md animate-pulse">
                <div className="flex gap-3">
                  <Info size={20} className="text-red-400 shrink-0" />
                  <div className="text-left text-xs text-red-100/90 leading-relaxed">
                    <p className="font-bold mb-1">Firebase is unreachable</p>
                    <p>It seems Firebase is restricted in your area. Please turn on your <b>VPN</b> or use the <b>Email Login</b> option above.</p>
                  </div>
                </div>
              </div>
            )}

            {!isFirebaseBlocked && (
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 backdrop-blur-sm">
                <Info size={18} className="text-amber-500 shrink-0 mt-0.5" />
                <div className="text-left">
                  <p className="text-amber-200/90 text-[11px] leading-relaxed">
                    Google does not allow sign-ins from embedded browsers (like Facebook or Instagram). If you encounter issues, please use Chrome or Safari.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm text-gray-900 px-6 py-3 rounded-full shadow-2xl text-sm z-50 animate-fade-in border border-gray-200">
          {toastMessage}
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-40">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl flex flex-col items-center gap-4 border border-gray-100">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-900 font-semibold">Signing you in...</p>
            <p className="text-gray-500 text-sm">Please wait a moment</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserLoginComp;

