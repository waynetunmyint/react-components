import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';

import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { APP_NAME, BASE_URL, IMAGE_URL } from '@/config';
import { LockIcon, ClipboardIcon } from 'lucide-react';

const ProfileLoginComp: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [unsupportedBrowser, setUnsupportedBrowser] = useState(false);
  const history = useHistory();

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

  const processLoginData = async (user: { name?: string; email?: string; idToken?: string }) => {
    try {
      const formData = new FormData();
      formData.append('name', user.name || '');
      formData.append('email', user.email || '');
      formData.append('appName', APP_NAME.toString());
      if (user.idToken) formData.append('token', user.idToken);

      const res = await fetch(`${BASE_URL}/profile/api/login`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error(`Login failed: ${res.statusText}`);

      const data = await res.json();

      localStorage.setItem('StoredJWT', data.jwtToken);

      if (data.profile) {
        localStorage.setItem('StoredProfile', JSON.stringify({
          Name: data.profile.Name,
          Email: data.profile.Email,
          id: data.profile.id,
        }));
      }

      showToastMessage('Login successful!');
      await history.push('/home');
      window.location.reload();
    } catch (err) {
      console.error('API login failed:', err);
      showToastMessage('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await FirebaseAuthentication.signInWithGoogle();
      console.log("result", result);
      const gUser = result.user;

      if (!gUser) throw new Error('No user returned from Google');

      setUser(gUser);
      await processLoginData({
        name: gUser.displayName || undefined,
        email: gUser.email || undefined,
      });
    } catch (err: any) {
      console.error('Google Sign-In failed:', err);
      showToastMessage('Login failed. Please try again.');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center space-y-6">
          <div className="text-6xl mb-4">🚫🖥️</div>
          <h2 className="text-2xl font-bold mb-3 text-gray-900">Unsupported Browser</h2>
          <p className="text-gray-600 mb-6">
            Oops! This app does not work inside in-app browsers.
            Please open this page using a real desktop or mobile browser. 🌐
          </p>
          <p className="text-red-800 mb-6 text-sm leading-relaxed">
            ဂူဂဲလ်က Login စနစ်က ဖေ့ဘုတ်ရဲ့ browser ထဲမှာ အလုပ်မလုပ်ပါဘူး။ သူတို့အချင်းချင်းပြသနာပါ။
            ကျေးဇူးပြု၍ Chrome, Safari, Firefox စတဲ့ browser တွေထဲမှာဖွင့်ပါ။
          </p>

          <button
            onClick={copyToClipboard}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-md"
          >
            <ClipboardIcon size={20} className="text-white" />
            Copy URL to Clipboard
          </button>
        </div>

        {showToast && (
          <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg text-sm z-50">
            {toastMessage}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col justify-between relative`}>
      {/* Header / Logo */}
      <div className="flex-1 flex flex-col justify-center items-center text-center px-6 space-y-6 py-12">
        <div className="w-full max-w-sm">
          <img
            className="w-1/2 max-w-[200px] rounded-3xl mx-auto shadow-lg"
            src={`${IMAGE_URL}/uploads/${APP_NAME}_logo.png`}
            alt={`${APP_NAME} Logo`}
            loading="eager"
          />
        </div>
        <p className="text-white text-lg font-medium max-w-md">
          Please login to access all features
        </p>

        {!user && (
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full max-w-sm flex items-center justify-center gap-3 py-4 bg-red-600 text-white text-base font-semibold rounded-xl shadow-lg hover:bg-red-700 active:bg-red-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LockIcon size={22} className="text-white" />
            {isLoading ? "Signing in..." : "Sign in with Google"}
          </button>
        )}
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg text-sm z-50 animate-fade-in">
          {toastMessage}
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin"></div>
            <p className="text-gray-700 font-medium">Signing you in...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileLoginComp;