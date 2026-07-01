const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// GET /cards/:id — includes author and comments; based on id
async function getCardById(req, res) {
  try {
    const id = Number(req.params.id);

    // Pass in information about the card's fields; includes author and comments
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

// POST /cards — boardId is required in the body here to make card associated with board
async function createCard(req, res) {
  // Extracts information about the cards and uses this to create them;
  // returns error if required fields are not there and for bad requests
  try {
    const { title, description, gifUrl, boardId, authorId } = req.body;

    if (!title || !gifUrl || !boardId) {
      return res.status(400).json({ error: "Cannot create card." });
    }

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

// PUT /cards: Updates card information based on passed in requested information
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

// DELETE /cards/:id — cascades to its comments; deletes based on id
async function deleteCard(req, res) {
  try {
    const id = Number(req.params.id);
    await prisma.card.delete({ where: { id } });
    res.status(200).json({ message: "Card deleted successfully." });
  } catch (err) {
    res.status(404).json({ error: "Card not found" });
  }
}

// GET /cards/:id/comments — oldest first, includes author information
async function getCardComments(req, res) {
  // Finds cards and deletes them if present; returns not found error if cannot find card
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

// POST /cards/:id/comments — needs to include anonymous comments as well
async function createCardComment(req, res) {
  // Creates cards with authors (or guest authors); returns 201 if successful PUT request or 400 if not
  try {
    const cardId = Number(req.params.id);
    const { message, authorId } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Cannot create a comment." });
    }

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
