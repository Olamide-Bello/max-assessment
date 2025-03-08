const express = require("express");
const { createVirtualAccount } = require("../controllers/virtualAccountController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/virtual-account", authMiddleware, createVirtualAccount);

module.exports = router;