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

  for (const board of MOCK_BOARDS) {
    await prisma.board.create({
      data: { ...board, authorId: user.id },
    });
  }

  console.log(`Seeded ${MOCK_BOARDS.length} boards for user ${user.email} ✅`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
