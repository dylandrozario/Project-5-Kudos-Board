const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const GUEST_USER_ID = 1;

// Resolves an incoming author reference to a numeric User.id.
// Preference order: explicit authorId → look up / upsert by authorName → Guest user.
async function resolveAuthorId({ authorId, authorName }) {
  if (typeof authorId === "number") return authorId;
  if (authorName && authorName.trim()) {
    const name = authorName.trim();
    const user = await prisma.user.upsert({
      where: { username: name },
      update: {},
      create: {
        username: name,
        email: `${name.toLowerCase().replace(/\s+/g, "-")}@kudos.local`,
        password: "changeme",
      },
    });
    return user.id;
  }
  return GUEST_USER_ID;
}

// GET /boards: gets the list of boards to be displayed on the website.
async function getBoards(req, res) {
  try {
    const { category, title, sort } = req.query;

    const where = {};
    if (category && category !== "All") {
      where.category = category;
    }

    if (title) {
      where.title = { contains: title, mode: "insensitive" };
    }

    // "Recent" view: shows only the 6 most recently created board if sorting by recent; otherwise show all boards
    const totalShown = sort === "recent" ? 6 : undefined;

    const boards = await prisma.board.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: totalShown,
      include: { author: true },
    });

    res.status(200).json(boards);
  } catch (err) {
    res.status(500).json({ error: "Cannot retrieve boards." });
  }
}

// POST /boards: creates a board and adds to the list of boards displayed
async function createBoard(req, res) {
  try {
    const { title, category, imageUrl, authorId, authorName } = req.body;

    // title + category are required fields
    if (!title || !category) {
      return res.status(400).json({ error: "Cannot create board" });
    }

    const resolvedAuthorId = await resolveAuthorId({ authorId, authorName });

    // Create board using given parameters and return success/error response accordingly
    const board = await prisma.board.create({
      data: {
        title,
        category,
        imageUrl: imageUrl || "",
        authorId: resolvedAuthorId,
      },
      include: { cards: true, author: true },
    });

    res.status(201).json(board);
  } catch (err) {
    res.status(400).json({ error: "Cannot create board" });
  }
}

// GET /boards/:id: Returns one board based on id
async function getBoardById(req, res) {
  try {
    const id = Number(req.params.id);

    // Finds board by id and returns it as a success response if found; else returns error
    const board = await prisma.board.findUnique({
      where: { id },
      include: {
        author: true,
        cards: {
          include: { author: true, comments: { include: { author: true } } },
          orderBy: [
            { pinned: "desc" },
            { pinnedAt: "desc" },
            { createdAt: "desc" },
          ],
        },
      },
    });

    if (!board) {
      return res.status(404).json({ error: "Board not found." });
    }

    res.status(200).json(board);
  } catch (err) {
    res.status(404).json({ error: "Board not found." });
  }
}

// PUT /boards/:id: updates each board based on their id field
async function updateBoard(req, res) {
  try {
    const id = Number(req.params.id);
    const { title, category, imageUrl } = req.body;

    const data = {};
    // Only updates requested fields present
    if (title !== undefined) data.title = title;
    if (category !== undefined) data.category = category;
    if (imageUrl !== undefined) data.imageUrl = imageUrl;

    const board = await prisma.board.update({ where: { id }, data });
    res.status(200).json(board);
  } catch (err) {
    res.status(404).json({ error: "Board not found" });
  }
}

// DELETE /boards/:id — cascades to cards and their comments; done based on id
async function deleteBoard(req, res) {
  try {
    const id = Number(req.params.id);
    await prisma.board.delete({ where: { id } });
    res.status(200).json({ message: "Board deleted successfully." });
  } catch (err) {
    res.status(404).json({ error: "Board not found" });
  }
}

// GET /boards/:id/cards — pinned-first, then unpinned by createdAt desc.
async function getBoardCards(req, res) {
  try {
    const boardId = Number(req.params.id);

    const board = await prisma.board.findUnique({ where: { id: boardId } });
    if (!board) {
      return res.status(404).json({ error: "Cannot retrieve cards." });
    }

    // finds the board's associated cards and orders them if pinned
    const cards = await prisma.card.findMany({
      where: { boardId },
      orderBy: [
        { pinned: "desc" },
        { pinnedAt: "desc" },
        { createdAt: "desc" },
      ],
    });

    res.status(200).json(cards);
  } catch (err) {
    res.status(404).json({ error: "Cannot retrieve cards." });
  }
}

// POST /boards/:id/cards — create a card belonging to this board.
async function createBoardCard(req, res) {
  try {
    const boardId = Number(req.params.id);
    const { title, description, gifUrl, authorId } = req.body;

    if (!title || !gifUrl) {
      return res.status(400).json({ error: "Cannot create card." });
    }

    const card = await prisma.card.create({
      data: { title, description: description || "", gifUrl, boardId, authorId },
      include: { comments: true },
    });

    res.status(201).json(card);
  } catch (err) {
    res.status(400).json({ error: "Cannot create card." });
  }
}

module.exports = {
  getBoards,
  createBoard,
  getBoardById,
  updateBoard,
  deleteBoard,
  getBoardCards,
  createBoardCard,
};
