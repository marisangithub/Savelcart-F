import { useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL || "https://savelcart-backend.onrender.com";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const output = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i++) {
    output[i] = rawData.charCodeAt(i);
  }

  return output;
}

export default function EnablePushNotifications() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function enableNotifications() {
    setLoading(true);
    setMessage("");

    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        throw new Error(
          "Indha browser web push notifications-ai support pannavillai."
        );
      }

      if (!("Notification" in window)) {
        throw new Error("Browser notification support illai.");
      }

      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        throw new Error(
          "Browser settings-la notification permission allow pannunga."
        );
      }

      const keyResponse = await fetch(`${API_URL}/api/push/public-key`);

      if (!keyResponse.ok) {
        throw new Error("Push public key-ai fetch panna mudiyavillai.");
      }

      const { publicKey } = await keyResponse.json();

      if (!publicKey) {
        throw new Error("VAPID public key missing.");
      }

      const registration = await navigator.serviceWorker.register("/sw.js");

      await navigator.serviceWorker.ready;

      let subscription =
        await registration.pushManager.getSubscription();

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
      }

      const response = await fetch(`${API_URL}/api/push/subscribe`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subscription),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Subscription save panna mudiyavillai."
        );
      }

      setMessage("Push notifications enabled successfully!");
    } catch (error) {
      setMessage(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={enableNotifications}
        disabled={loading}
      >
        {loading ? "Enabling..." : "🔔 Enable Order Notifications"}
      </button>

      {message && <p role="status">{message}</p>}
    </div>
  );
}