import { Router } from "express";
const router = Router();

import {
    register,
    login,
    logout,    
    forgotPassword, 
    resetPassword,    
} from "../controllers/authcontroller.js";
import {
  validateRegisterInput,
  validateLoginInput,
} from "../middleware/validatoremiddleware.js";

router.post("/register", validateRegisterInput, register);
router.post("/login", validateLoginInput, login);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
