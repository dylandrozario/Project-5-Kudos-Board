const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// GET /comments/:id: Find a comment based on its associated id
async function getCommentById(req, res) {
  try {
    const id = Number(req.params.id);

    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) {
      return res.status(404).json({ error: "Comment not found." });
    }

    res.status(200).json(comment);
  } catch (err) {
    res.status(404).json({ error: "Comment not found." });
  }
}

// PUT /comments/:id — update the message's contents
async function updateComment(req, res) {
  try {
    const id = Number(req.params.id);
    const { message } = req.body;

    const comment = await prisma.comment.update({
      where: { id },
      data: { message },
    });

    res.status(200).json(comment);
  } catch (err) {
    res.status(404).json({ error: "Comment not found" });
  }
}

// DELETE /comments/:id; delete comments based on id
async function deleteComment(req, res) {
  try {
    const id = Number(req.params.id);
    await prisma.comment.delete({ where: { id } });
    res.status(200).json({ message: "Comment deleted successfully." });
  } catch (err) {
    res.status(404).json({ error: "Comment not found" });
  }
}

module.exports = { getCommentById, updateComment, deleteComment };
