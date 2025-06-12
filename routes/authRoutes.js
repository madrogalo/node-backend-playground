const express = require("express");
const {
  login,
  logout,
  protectedRoute,
} = require("../controllers/authController");

const router = express.Router();

router.post("/login", login);
router.post("/logout", logout);
router.get("/protected", protectedRoute);

module.exports = router;
