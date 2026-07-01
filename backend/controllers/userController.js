const prisma = require("../prisma/client");

// Strip the password before sending a user back to the client.
function safeUser(user) {
  if (!user) return user;
  const { password, ...rest } = user;
  return rest;
}

// GET /users/:id
async function getUserById(req, res) {
  try {
    const id = Number(req.params.id);

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    res.status(200).json(safeUser(user));
  } catch (err) {
    res.status(404).json({ error: "User not found." });
  }
}

// POST /users — register a new user.
async function createUser(req, res) {
  try {
    const { email, username, password } = req.body;

    const missing = [];
    if (!email) missing.push("email");
    if (!password) missing.push("password");
    if (missing.length) {
      return res.status(400).json({
        error: `Cannot create user. ${missing.join(", ")} fields are missing.`,
      });
    }

    const user = await prisma.user.create({
      data: { email, username: username || null, password },
      include: { boards: true, cards: true, comments: true },
    });

    res.status(201).json(safeUser(user));
  } catch (err) {
    res.status(400).json({ error: "Cannot create user. fields are missing." });
  }
}

// PUT /users/:id — only provided fields change.
async function updateUser(req, res) {
  try {
    const id = Number(req.params.id);
    const { email, username, password } = req.body;

    const data = {};
    if (email !== undefined) data.email = email;
    if (username !== undefined) data.username = username;
    if (password !== undefined) data.password = password;

    const user = await prisma.user.update({ where: { id }, data });
    res.status(200).json(safeUser(user));
  } catch (err) {
    res.status(400).json({ error: "Cannot update user" });
  }
}

// DELETE /users/:id — cascades to boards, cards, comments. Never delete Guest (id 1).
async function deleteUser(req, res) {
  try {
    const id = Number(req.params.id);
    await prisma.user.delete({ where: { id } });
    res.status(200).json({ message: "User now deleted" });
  } catch (err) {
    res.status(404).json({ error: "User not found." });
  }
}

// POST /login — authenticate and return a message.
async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    res.status(200).json({
      message: `${user.username || user.email} logged in successfully!`,
    });
  } catch (err) {
    res.status(401).json({ error: "Invalid credentials." });
  }
}

module.exports = { getUserById, createUser, updateUser, deleteUser, login };
