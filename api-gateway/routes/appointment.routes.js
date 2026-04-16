import { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const router = Router();

/**
 * Proxy all /api/appointments/* requests to the appointment-service.
 * The appointment-service app.js mounts routes at "/" (root level), 
 * so we forward the path as stripped — e.g. /my-appointments, /:id, etc.
 * Express strips "/api/appointments" before passing to this router.
 */
router.use(
  createProxyMiddleware({
    target: process.env.APPOINTMENT_SERVICE,
    changeOrigin: true,
    // No pathRewrite needed - appointment-service uses root-level routes
    on: {
      error: (err, req, res) => {
        console.error("[Gateway] Appointment service proxy error:", err.message);
        res.status(502).json({ message: "Appointment service unavailable" });
      },
    },
  })
);

export default router;
