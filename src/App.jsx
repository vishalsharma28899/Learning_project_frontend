import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submissions, setSubmissions] = useState([]);

  // Handle input change
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post("http://localhost:5000/api/form", formData);
    setFormData({ name: "", email: "", message: "" });
    fetchForms();
  };

  // Fetch all submissions
  const fetchForms = async () => {
    const res = await axios.get("http://localhost:5000/api/forms");
    setSubmissions(res.data);
  };

  // Register service worker + Push notification subscription
  useEffect(() => {
    fetchForms();

    async function registerServiceWorker() {
      if ("serviceWorker" in navigator && "PushManager" in window) {
        try {
          const swReg = await navigator.serviceWorker.register("/sw.js");
          console.log("✅ Service Worker Registered:", swReg);

          // Request permission for notifications
          const permission = await Notification.requestPermission();
          if (permission !== "granted") {
            console.log("❌ Notification permission denied");
            return;
          }

          // Get subscription (for push notifications)
          const existingSubscription = await swReg.pushManager.getSubscription();
          if (!existingSubscription) {
            const response = await fetch("http://localhost:5000/vapidPublicKey");
            const vapidPublicKey = await response.text();

            const convertedKey = urlBase64ToUint8Array(vapidPublicKey);
            const subscription = await swReg.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: convertedKey,
            });
         
            // Send subscription to backend
            await axios.post("http://localhost:5000/subscribe", subscription);
            console.log("✅ User subscribed for push notifications");
          } else {
            console.log("🔔 Already subscribed:", existingSubscription);
          }
        } catch (err) {
          console.error("❌ Service Worker error:", err);
        }
      }
    }

    registerServiceWorker();
  }, []);

  // Convert VAPID key (required format)
  function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  return (
    <div className="container">
      <h1>📋 Feedback Form</h1>

      <form className="form-card" onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Enter your name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          name="email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <textarea
          name="message"
          placeholder="Enter your message"
          value={formData.message}
          onChange={handleChange}
          required
        />
        <button type="submit">Submit</button>
      </form>

      <h2>🗂️ Submissions</h2>
      <div className="submissions">
        {submissions.map((s) => (
          <div className="card" key={s._id}>
            <h3>{s.name}</h3>
            <small>{new Date(s.createdAt).toLocaleString()}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
