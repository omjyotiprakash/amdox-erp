const express = require("express");

const router = express.Router();

router.get("/health", (_req, res) => res.json({ success: true, status: "ok" }));
router.use("/auth", require("./authRoutes"));

module.exports = router;
