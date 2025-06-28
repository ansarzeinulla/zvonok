// 👉 Called by the Start button (after user gesture)
function askPermissionAndGetToken() {
  if (!('Notification' in window)) {
    document.getElementById("status").textContent = "❌ Notifications not supported.";
    return;
  }

  Notification.requestPermission().then(permission => {
    if (permission === 'granted') {
      messaging.getToken({
        vapidKey: "BLH3X-ouhfhtnQZUgdt23wjOB9bweFjMeg3KKmo21MQb0fwGDyGoj9LZ-uz9nrerYdpv93IlexUMAU3sd1cCpi0"
      }).then((token) => {
        if (token) {
          document.getElementById("status").textContent = "✅ Your FCM Token:\n" + token;
          console.log("✅ Your FCM token:", token);
        } else {
          document.getElementById("status").textContent = "⚠️ Token is null.";
        }
      }).catch((err) => {
        console.error("Unable to get token", err);
        document.getElementById("status").textContent = "❌ Error: " + err.message;
      });
    } else {
      document.getElementById("status").textContent = "❌ Notification permission denied.";
    }
  });
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js')
    .then(reg => {
      console.log('SW scope:', reg.scope);
      return messaging.getToken({
        vapidKey: "ВАШ_VAPID_KEY",
        serviceWorkerRegistration: reg
      });
    })
    .then(token => {
      console.log('Token:', token);
      document.getElementById("status").textContent = "✅ Token:\n" + token;
    })
    .catch(err => console.error('SW/token error', err));
}

// 👉 Called when you press the “Call” button
function sendCall() {
  Notification.requestPermission().then(permission => {
    if (permission === 'granted') {
      messaging.getToken({
        vapidKey: "BLH3X-ouhfhtnQZUgdt23wjOB9bweFjMeg3KKmo21MQb0fwGDyGoj9LZ-uz9nrerYdpv93IlexUMAU3sd1cCpi0"
      }).then((token) => {
        if (token) {
          document.getElementById("status").textContent = "📲 Sending call to:\n" + token;
          console.log("📲 Sending call to token:", token);

          // ✅ Only now we alert and open the call page
          alert("Call sent! Token:\n" + token);
          window.open("call.html", "_blank");
        } else {
          alert("⚠️ Token not available. Maybe permissions not granted?");
        }
      }).catch((err) => {
        alert("❌ Error getting token:\n" + err.message);
      });
    } else {
      alert("❌ Notification permission denied.");
    }
  });
}