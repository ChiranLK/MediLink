import { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const router = Router();

/**
 * Proxy all /api/consultations/* requests to the doctor-service.
 */
router.use(
  createProxyMiddleware({
    target: process.env.DOCTOR_SERVICE,
    changeOrigin: true,
    pathRewrite: (path) => `/api/consultations${path === "/" ? "" : path}`,
    on: {
      error: (err, req, res) => {
        console.error("[Gateway] Consultation proxy error:", err.message);
        res.status(502).json({ message: "Doctor service unavailable" });
      },
    },
  }),
);

export default router;
