const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const MOCK_BOARDS = [
  { title: "Quarterly Achievers", category: "Celebration", imageUrl: "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=600", createdAt: "2026-06-28T12:00:00Z" },
  { title: "Thanks, Sarah!", category: "Thank you", imageUrl: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600", createdAt: "2026-06-27T12:00:00Z" },
  { title: "Project Launch Success", category: "Celebration", imageUrl: "https://images.unsplash.com/photo-1542621334-a254cf47733d?w=600", createdAt: "2026-06-26T12:00:00Z" },
  { title: "Daily Inspiration", category: "Inspiration", imageUrl: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=600", createdAt: "2026-06-25T12:00:00Z" },
  { title: "Team Stand-up Wins", category: "Thank you", imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600", createdAt: "2026-06-24T12:00:00Z" },
  { title: "Morning Motivation", category: "Inspiration", imageUrl: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=600", createdAt: "2026-06-23T12:00:00Z" },
  { title: "Kudos Board", category: "Celebration", imageUrl: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600", createdAt: "2026-06-22T12:00:00Z" },
  { title: "Monthly Achievers", category: "Celebration", imageUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600", createdAt: "2026-06-21T12:00:00Z" },
];

// Cards for the first seeded board. Mirrors frontend/src/data/mockCards.js, minus
// the hardcoded ids/boardId (Postgres autoincrements) and the author objects —
// every card/comment is attributed to the guest user via authorId (a required FK).
const MOCK_CARDS = [
  {
    title: "Quarter MVP",
    description: "Absolutely crushed it this quarter — your dedication to the team is unmatched. So proud of everything you achieved!",
    gifUrl: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600",
    upvotes: 14,
    pinned: true,
    pinnedAt: "2026-06-28T08:00:00Z",
    createdAt: "2026-06-20T10:00:00Z",
    comments: [
      { message: "Couldn’t agree more!", createdAt: "2026-06-21T10:00:00Z" },
    ],
  },
  {
    title: "Launch Leadership",
    description: "Your leadership during the product launch kept everyone calm and focused. You are a true rockstar.",
    gifUrl: "",
    upvotes: 9,
    pinned: false,
    pinnedAt: null,
    createdAt: "2026-06-22T10:00:00Z",
    comments: [],
  },
  {
    title: "Bug Hero",
    description: "The way you tackled that critical bug at 11 PM saved the whole release. Hero stuff.",
    gifUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600",
    upvotes: 20,
    pinned: false,
    pinnedAt: null,
    createdAt: "2026-06-23T10:00:00Z",
    comments: [
      { message: "Legend.", createdAt: "2026-06-24T09:00:00Z" },
    ],
  },
  {
    title: "Stand-up Spark",
    description: "Thank you for always going the extra mile and bringing such positive energy to every stand-up. You lift everyone up.",
    gifUrl: "",
    upvotes: 6,
    pinned: false,
    pinnedAt: null,
    createdAt: "2026-06-24T10:00:00Z",
    comments: [],
  },
  {
    title: "Cross-team Champion",
    description: "Your cross-team collaboration this quarter set a new standard for the whole org. Genuinely impressive.",
    gifUrl: "",
    upvotes: 11,
    pinned: false,
    pinnedAt: null,
    createdAt: "2026-06-25T10:00:00Z",
    comments: [],
  },
  {
    title: "Workshop Warmth",
    description: "Loved your contribution to the team workshop — you made everyone feel heard.",
    gifUrl: "https://images.unsplash.com/photo-1531058020387-3be344556be6?w=600",
    upvotes: 4,
    pinned: false,
    pinnedAt: null,
    createdAt: "2026-06-26T10:00:00Z",
    comments: [],
  },
];

async function main() {
  // Boards require an author (User), so create/find one first.
  const user = await prisma.user.upsert({
    where: { email: "guest@kudos.local" },
    update: {},
    create: {
      email: "guest@kudos.local",
      username: "Guest",
      password: "changeme", // placeholder — hash if you add real auth
    },
  });

  let firstBoardId = null;
  for (const board of MOCK_BOARDS) {
    const created = await prisma.board.create({
      data: { ...board, authorId: user.id },
    });
    if (firstBoardId === null) firstBoardId = created.id;
  }

  // The mock cards all belong to the first board (matches the frontend mock).
  let commentCount = 0;
  for (const { comments, ...card } of MOCK_CARDS) {
    await prisma.card.create({
      data: {
        ...card,
        boardId: firstBoardId,
        authorId: user.id,
        comments: {
          create: comments.map((comment) => ({ ...comment, authorId: user.id })),
        },
      },
    });
    commentCount += comments.length;
  }

  console.log(
    `Seeded ${MOCK_BOARDS.length} boards, ${MOCK_CARDS.length} cards, ${commentCount} comments for user ${user.email} ✅`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
