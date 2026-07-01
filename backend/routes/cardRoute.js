const express = require("express");
const router = express.Router();
const {
  getCardById,
  createCard,
  updateCard,
  deleteCard,
  getCardComments,
  createCardComment,
} = require("../controllers/cardController");

router.post("/", createCard);
router.get("/:id", getCardById);
router.put("/:id", updateCard);
router.delete("/:id", deleteCard);

// Nested comments for a card.
router.get("/:id/comments", getCardComments);
router.post("/:id/comments", createCardComment);

module.exports = router;
