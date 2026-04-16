import { createProxyMiddleware } from "http-proxy-middleware";

// Express strips the mount prefix before the proxy sees the path, so we need
// to reconstruct the original URL. We do this by capturing the base path from
// the original request.
const proxy = createProxyMiddleware({
  target: process.env.DOCTOR_SERVICE,
  changeOrigin: true,
  pathRewrite: (pathname, req) => {
    // req.baseUrl is the mount prefix (e.g. "/api/availability")
    // pathname is the remainder (e.g. "/blocked-days/DOC-xxx" or "/settings")
    return `${req.baseUrl}${pathname}`;
  },
});

export default proxy;
