const http = require("http");

const NOTIFICATION_URL =
  process.env.NOTIFICATION_SERVICE_URL || "http://notification-service:5003";

/**
 * Fire-and-forget notification. Never throws — just logs on failure.
 */
function sendNotification(payload) {
  try {
    const url = new URL(`${NOTIFICATION_URL}/notifications/notify`);
    const body = JSON.stringify(payload);

    const req = http.request(
      {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
        },
        timeout: 5000,
      },
      (res) => {
        res.resume(); // drain response
        console.log(
          `✅ Notification sent [${payload.type}] to ${payload.email}`,
        );
      },
    );

    req.on("error", (err) => {
      console.warn(`⚠️  Notification failed [${payload.type}]:`, err.message);
    });

    req.write(body);
    req.end();
  } catch (err) {
    console.warn(`⚠️  Notification error [${payload.type}]:`, err.message);
  }
}

module.exports = { sendNotification };
