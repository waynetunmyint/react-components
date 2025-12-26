import { useEffect } from "react";

const TrackWebViewUrl = () => {
  useEffect(() => {
    // Log initial URL
    console.log("Current URL:", window.location.href);

    // Listen for SPA route changes
    const logUrl = () => console.log("Redirected URL:", window.location.href);
    window.addEventListener("hashchange", logUrl);
    window.addEventListener("popstate", logUrl);

    // Override window.open (external redirects in WebView)
    const originalOpen = window.open;
    window.open = (url: string, target?: string, features?: string) => {
      console.log("window.open called with URL:", url);
      return originalOpen.call(window, url, target, features);
    };

    return () => {
      window.removeEventListener("hashchange", logUrl);
      window.removeEventListener("popstate", logUrl);
      window.open = originalOpen;
    };
  }, []);

  return null;
};

export default TrackWebViewUrl;
