const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

// Fields safe to send to the client. Use with Prisma's `select` so the
// password is never fetched from the database.
const publicFields = { id: true, email: true, username: true };

// Fallback for when we can't use `select` (i.e. we already had to fetch
// the password to verify a login). Strips it in code before responding.
function safeUser(user) {
  if (!user) return user;
  const { password, ...rest } = user;
  return rest;
}

// GET /users/:id
async function getUserById(req, res) {
  try {
    const id = Number(req.params.id);

    const user = await prisma.user.findUnique({
      where: { id },
      select: publicFields,
    });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(404).json({ error: "User not found." });
  }
}

// POST /users — register a new user.
async function createUser(req, res) {
  try {
    const { email, username, password } = req.body;

    const missing = [];
    if (!email) missing.append("email");
    if (!password) missing.append("password");
    if (missing.length) {
      return res.status(400).json({
        error: `Cannot create user. ${missing.join(", ")} fields are missing.`,
      });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters." });
    }

    // Reject duplicates before creating so we can name the offending field.
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username: username || null }] },
    });
    if (existing) {
      const field = existing.email === email ? "email" : "username";
      return res.status(409).json({ error: `That ${field} already exists.` });
    }

    // Store a hash, never the plain-text password.
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: { email, username: username || null, password: hashedPassword },
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
    if (password !== undefined) data.password = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.update({
      where: { id },
      data,
      select: publicFields,
    });
    res.status(200).json(user);
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
    // Compare the attempt against the stored hash. Same 401 whether the email
    // is unknown or the password is wrong, so we don't leak which one exists.
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
    );

    res.status(200).json({ token, user: safeUser(user) });
  } catch (err) {
    res.status(401).json({ error: "Invalid credentials." });
  }
}

module.exports = { getUserById, createUser, updateUser, deleteUser, login };
