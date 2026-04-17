import { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const router = Router();

/**
 * Proxy all /api/doctors/* requests to the doctor-service.
 * Express strips the mount prefix ("/api/doctors") before this middleware runs,
 * so we use pathRewrite to prepend /api/doctors back onto the path.
 */
router.use(
  createProxyMiddleware({
    target: process.env.DOCTOR_SERVICE,
    changeOrigin: true,
    pathRewrite: (path) => `/api/doctors${path === "/" ? "" : path}`,
  }),
);

export default router;
