import { Router } from "express";
import { getCurrentUser } from "../controllers/authcontroller.js";

const router = Router();

// Get current authenticated user (uses Authorization header)
router.get("/current-user", getCurrentUser);

export default router;
