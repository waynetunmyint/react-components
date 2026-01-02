// lib/Initialize.ts
import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import { Toast } from "@capacitor/toast";
import { initializeFirebase } from "./firebaseConfig";

export const InitializeNotification = async () => {
  if (Capacitor.getPlatform() === "web") return;

  const init = async () => {
    try {
      // Initialize shared Firebase instance
      initializeFirebase();

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
        // Note: Backend token registration removed as requested
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

  await init();

  // Cleanup function (optional, but good practice if this were a hook)
  return () => {
    PushNotifications.removeAllListeners();
  };
};
