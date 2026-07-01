const express = require("express");
const router = express.Router();
const {
  getBoards,
  createBoard,
  getBoardById,
  updateBoard,
  deleteBoard,
  getBoardCards,
  createBoardCard,
} = require("../controllers/boardController");

router.get("/", getBoards);
router.post("/", createBoard);
router.get("/:id", getBoardById);
router.put("/:id", updateBoard);
router.delete("/:id", deleteBoard);

// Nested cards for a board.
router.get("/:id/cards", getBoardCards);
router.post("/:id/cards", createBoardCard);

module.exports = router;
