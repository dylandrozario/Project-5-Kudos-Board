const prisma = require("../prisma/client");

const GUEST_USER_ID = 1;

// Resolve a free-text author name to a User id.
// - Blank/undefined -> the seeded Guest user (id 1).
// - Otherwise upsert a User row matching the typed username and use its id.
async function resolveAuthorId(authorName) {
  if (!authorName || !authorName.trim()) {
    return GUEST_USER_ID;
  }

  const username = authorName.trim();
  const author = await prisma.user.upsert({
    where: { username },
    update: {},
    create: {
      username,
      email: `${username}@kudos.local`,
      password: "(unused)",
    },
  });

  return author.id;
}

module.exports = { resolveAuthorId, GUEST_USER_ID };
