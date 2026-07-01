const express = require("express");
const router = express.Router();
const {
  getCommentById,
  updateComment,
  deleteComment,
} = require("../controllers/commentController");

router.get("/:id", getCommentById);
router.put("/:id", updateComment);
router.delete("/:id", deleteComment);

module.exports = router;
