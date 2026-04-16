import { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const router = Router();

/**
 * Proxy all /api/ai/* requests to the ai-symptom-service.
 * ai-symptom-service serves routes at /api/ai-symptoms, 
 * so we rewrite /api/ai → /api/ai-symptoms.
 */
router.use(
  createProxyMiddleware({
    target: process.env.AI_SERVICE,
    changeOrigin: true,
    pathRewrite: (path) => `/api/ai-symptoms${path === "/" ? "" : path}`,
    on: {
      error: (err, req, res) => {
        console.error("[Gateway] AI service proxy error:", err.message);
        res.status(502).json({ message: "AI service unavailable" });
      },
    },
  })
);

export default router;
