const express = require("express");
const { z } = require("zod");
const controller = require("../controllers/authController");
const { authenticate } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validation.middleware");
const { authLimiter } = require("../middleware/rateLimiter.middleware");

const router = express.Router();

const email = z.string().trim().toLowerCase().email("Enter a valid email address");

const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email,
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required"),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password"),
  newPassword: z.string().min(8, "New password must be at least 8 characters").max(128),
});

router.get("/registration", controller.registration);
router.post("/register", authLimiter, validate(registerSchema), controller.register);
router.post("/login", authLimiter, validate(loginSchema), controller.login);
router.post("/change-password", authLimiter, authenticate, validate(changePasswordSchema), controller.changePassword);
router.get("/me", authenticate, controller.me);

module.exports = router;
