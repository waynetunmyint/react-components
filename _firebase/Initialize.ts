import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import { Toast } from "@capacitor/toast";
import { PAGE_ID, BASE_URL } from "../../../config";

export const InitializeNotification = () => {
  if (Capacitor.getPlatform() === "web") return;


  const registerToken = async (token: string) => {
    const formData = new FormData();
    formData.append("pageId", String(PAGE_ID));
    formData.append("tokenValue", token);

    try {
      const response = await fetch(`${BASE_URL}/firebaseToken/api`, {
        method: "POST",
        body: formData,
        headers: { 'Accept': 'application/json' }
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const result = await response.json();
      console.log("FCM token registered:", result);
    } catch (err) {
      console.error("Failed to register FCM token:", err);
      await Toast.show({ 
        text: "Failed to register for notifications",
        duration: "short"
      });
    }
  };

  const init = async () => {
    try {
      // Request permissions
      const perm = await PushNotifications.requestPermissions();
      if (perm.receive !== "granted") {
        console.warn("Push notification permission denied");
        return;
      }

      // Register for push notifications
      await PushNotifications.register();

      // Handle FCM token registration
      PushNotifications.addListener("registration", async ({ value }) => {
        console.log("FCM token received:", value);
        await registerToken(value);
      });

      // Handle registration errors
      PushNotifications.addListener("registrationError", (error) => {
        console.error("Push registration failed:", error);
      });

      // Handle incoming notifications (app in foreground)
      PushNotifications.addListener("pushNotificationReceived", async (notification) => {
        console.log("Notification received:", notification);
        const message = notification.body || notification.title || "New notification";
        await Toast.show({ text: message, duration: "long" });
      });

      // Handle notification tap (app in background/closed)
      PushNotifications.addListener("pushNotificationActionPerformed", ({ notification }) => {
        console.log("Notification tapped:", notification);
        const url = notification.data?.url;
        if (url) {
          // Navigate to URL if provided
          window.location.href = url;
        }
      });

    } catch (err) {
      console.error("Push notification initialization failed:", err);
    }
  };

  init();

  // Cleanup function
  return () => {
    PushNotifications.removeAllListeners();
  };
};
