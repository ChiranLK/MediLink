import { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const router = Router();

/**
 * Proxy all /api/payments/* requests to the payment-service.
 * payment-service app.js mounts routes at "/payments", so after Express 
 * strips "/api/payments" we need to prepend "/payments" back.
 *
 * Example: 
 *   Frontend: GET /api/payments/checkout
 *   Gateway strips: /checkout
 *   pathRewrite adds back: /payments/checkout
 *   payment-service receives: GET /payments/checkout ✓
 */
router.use(
  createProxyMiddleware({
    target: process.env.PAYMENT_SERVICE,
    changeOrigin: true,
    pathRewrite: (path) => `/payments${path === "/" ? "" : path}`,
    on: {
      error: (err, req, res) => {
        console.error("[Gateway] Payment service proxy error:", err.message);
        res.status(502).json({ message: "Payment service unavailable" });
      },
    },
  })
);

export default router;
