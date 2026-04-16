import { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const router = Router();

router.use(
  createProxyMiddleware({
    target: process.env.DOCTOR_SERVICE,
    changeOrigin: true,
  })
);

export default router;
