const express = require("express");
const router = express.Router();
const {
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

router.get("/:id", getUserById);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;
