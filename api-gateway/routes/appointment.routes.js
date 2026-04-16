import { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const router = Router();

// Proxy to appointment service
// Express already strips "/api/appointment" and "/api/appointments" before passing to this router
// So we just forward the remaining path as-is
router.use(
  createProxyMiddleware({
    target: process.env.APPOINTMENT_SERVICE,
    changeOrigin: true,
  })
);

export default router;
