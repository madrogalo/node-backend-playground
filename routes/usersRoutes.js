const express = require("express");
const { addUser } = require("../controllers/usersController");
const { getUsers } = require("../controllers/usersController");
const { authenticate } = require("../middleware/authenticateMiddleware");

const router = express.Router();

router.post("/addUser", authenticate, addUser);
router.get("/getUsers", authenticate, getUsers);
module.exports = router;
