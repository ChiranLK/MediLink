import { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const router = Router();

// Proxy root /users/* requests to auth service
// Request: /current-user → Auth service: /api/users/current-user
router.use(
  createProxyMiddleware({
    target: process.env.AUTH_SERVICE,
    changeOrigin: true,
    pathRewrite: {
      "^(.*)$": "/api/users$1", // Prepend /api/users to any path
    },
  })
);

export default router;
