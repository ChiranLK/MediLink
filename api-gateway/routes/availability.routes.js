import { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const router = Router();

/**
 * Proxy all /api/availability/* requests to the doctor-service.
 * Rewrites path to preserve the /api/availability prefix.
 */
router.use(
  createProxyMiddleware({
    target: process.env.DOCTOR_SERVICE,
    changeOrigin: true,
    pathRewrite: (path) => `/api/availability${path === "/" ? "" : path}`,
    on: {
      error: (err, req, res) => {
        console.error("[Gateway] Availability proxy error:", err.message);
        res.status(502).json({ message: "Doctor service unavailable" });
      },
    },
  })
);

export default router;
