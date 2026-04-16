import { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const router = Router();

/**
 * Proxy all /api/patients/* requests to the patient-service.
 * patient-service mounts at "/" (root level), so no path rewrite needed.
 * Express strips "/api/patients" prefix, remainder is forwarded as-is.
 *
 * Example:
 *   Frontend: GET /api/patients/profile
 *   Gateway strips: /profile
 *   patient-service receives: GET /profile ✓ (since it mounts at "/"/"patients/")
 */
router.use(
  createProxyMiddleware({
    target: process.env.PATIENT_SERVICE,
    changeOrigin: true,
    pathRewrite: (pathname) => {
      if (pathname.startsWith("/api/patient")) {
        const next = pathname.slice("/api/patient".length) || "/";
        return next.startsWith("/") ? next : `/${next}`;
      }
      return pathname;
    },
    on: {
      proxyReq: (proxyReq, req) => {
        if (req.user && req.user.userId) {
          proxyReq.setHeader("X-User-Id", String(req.user.userId));
        }
      },
      error: (err, req, res) => {
        console.error("[Gateway] Patient service proxy error:", err.message);
        res.status(502).json({ message: "Patient service unavailable" });
      },
    },
  }),
);

export default router;
