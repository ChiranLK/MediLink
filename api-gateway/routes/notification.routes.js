import { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const router = Router();

router.use(
  createProxyMiddleware({
    target: process.env.NOTIFICATION_SERVICE,
    changeOrigin: true,
    pathRewrite: (pathname) => {
      // Gateway mounts at /api/notification, service expects /notifications/*
      if (pathname.startsWith("/api/notification")) {
        const rest = pathname.slice("/api/notification".length) || "/";
        return `/notifications${rest.startsWith("/") ? rest : `/${rest}`}`;
      }
      return pathname;
    },
  }),
);

export default router;
