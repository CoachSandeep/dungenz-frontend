export const sendGlobalNotification = async (title, message) => {
    const token = localStorage.getItem('token');
  
    try {
        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/push/send`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
        body: JSON.stringify({
          title,
          message,
          topic: 'all' // or "daily-release" if using topic-based FCM
        }),
      });
  
      if (res.ok) {
        console.log("✅ Notification sent");
      } else {
        const err = await res.json();
        console.error("❌ Notification failed:", err.message);
      }
    } catch (err) {
      console.error("🔥 Notification error:", err);
    }
  };
  