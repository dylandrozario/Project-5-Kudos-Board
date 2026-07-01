const prisma = require("../prisma/client");
const { resolveAuthorId } = require("../utils/resolveAuthor");

// GET /cards/:id — includes author and comments.
async function getCardById(req, res) {
  try {
    const id = Number(req.params.id);

    const card = await prisma.card.findUnique({
      where: { id },
      include: { author: true, comments: { include: { author: true } } },
    });

    if (!card) {
      return res.status(404).json({ error: "Cannot retrieve card." });
    }

    res.status(200).json(card);
  } catch (err) {
    res.status(404).json({ error: "Cannot retrieve card." });
  }
}

// POST /cards — boardId is required in the body here.
async function createCard(req, res) {
  try {
    const { title, description, gifUrl, boardId, authorName } = req.body;

    if (!title || !gifUrl || !boardId) {
      return res.status(400).json({ error: "Cannot create card." });
    }

    const authorId = await resolveAuthorId(authorName);

    const card = await prisma.card.create({
      data: {
        title,
        description: description || null,
        gifUrl,
        boardId: Number(boardId),
        authorId,
      },
      include: { comments: true },
    });

    res.status(201).json(card);
  } catch (err) {
    res.status(400).json({ error: "Cannot create card." });
  }
}

// PUT /cards/:id — only provided fields change.
// Handles upvoting (upvotes) and pin/unpin (pinned drives pinnedAt automatically).
async function updateCard(req, res) {
  try {
    const id = Number(req.params.id);
    const { title, description, gifUrl, pinned, upvotes } = req.body;

    const data = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (gifUrl !== undefined) data.gifUrl = gifUrl;
    if (upvotes !== undefined) data.upvotes = upvotes;
    if (pinned !== undefined) {
      data.pinned = pinned;
      data.pinnedAt = pinned ? new Date() : null;
    }

    const card = await prisma.card.update({
      where: { id },
      data,
      include: { comments: true },
    });

    res.status(200).json(card);
  } catch (err) {
    res.status(404).json({ error: "Card not found" });
  }
}

// DELETE /cards/:id — cascades to its comments.
async function deleteCard(req, res) {
  try {
    const id = Number(req.params.id);
    await prisma.card.delete({ where: { id } });
    res.status(200).json({ message: "Card deleted successfully." });
  } catch (err) {
    res.status(404).json({ error: "Card not found" });
  }
}

// GET /cards/:id/comments — oldest first, each with its author.
async function getCardComments(req, res) {
  try {
    const cardId = Number(req.params.id);

    const card = await prisma.card.findUnique({ where: { id: cardId } });
    if (!card) {
      return res.status(404).json({ error: "Card not found" });
    }

    const comments = await prisma.comment.findMany({
      where: { cardId },
      orderBy: { createdAt: "asc" },
      include: { author: true },
    });

    res.status(200).json(comments);
  } catch (err) {
    res.status(404).json({ error: "Card not found" });
  }
}

// POST /cards/:id/comments — author optional (blank -> Guest).
async function createCardComment(req, res) {
  try {
    const cardId = Number(req.params.id);
    const { message, authorName } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Cannot create a comment." });
    }

    const authorId = await resolveAuthorId(authorName);

    const comment = await prisma.comment.create({
      data: { message, cardId, authorId },
    });

    res.status(201).json(comment);
  } catch (err) {
    res.status(400).json({ error: "Cannot create a comment." });
  }
}

module.exports = {
  getCardById,
  createCard,
  updateCard,
  deleteCard,
  getCardComments,
  createCardComment,
};
