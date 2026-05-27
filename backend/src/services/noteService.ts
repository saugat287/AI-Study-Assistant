import { prisma } from '../config/database';

export async function createNote(userId: string, title: string, content: string, fileUrl?: string) {
  return prisma.note.create({
    data: { userId, title, content, fileUrl },
  });
}

export async function getUserNotes(userId: string) {
  return prisma.note.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      summary: { select: { id: true, createdAt: true } },
      _count: { select: { quizzes: true, flashcardDecks: true } },
    },
  });
}

export async function getNoteById(id: string, userId: string) {
  const note = await prisma.note.findFirst({ where: { id, userId } });
  if (!note) throw Object.assign(new Error('Note not found'), { statusCode: 404 });
  return note;
}

export async function updateNote(id: string, userId: string, title: string, content: string) {
  await getNoteById(id, userId); // ownership check
  return prisma.note.update({ where: { id }, data: { title, content } });
}

export async function deleteNote(id: string, userId: string) {
  await getNoteById(id, userId); // ownership check
  return prisma.note.delete({ where: { id } });
}

export async function getDashboardStats(userId: string) {
  const [noteCount, summaryCount, quizCount, flashcardDeckCount, chatCount] = await Promise.all([
    prisma.note.count({ where: { userId } }),
    prisma.summary.count({ where: { note: { userId } } }),
    prisma.quiz.count({ where: { note: { userId } } }),
    prisma.flashcardDeck.count({ where: { note: { userId } } }),
    prisma.chatSession.count({ where: { userId } }),
  ]);

  const recentNotes = await prisma.note.findMany({
    where: { userId },
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: { id: true, title: true, createdAt: true },
  });

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [weeklyNoteCount, weeklyQuizCount] = await Promise.all([
    prisma.note.count({ where: { userId, createdAt: { gte: sevenDaysAgo } } }),
    prisma.quiz.count({ where: { note: { userId }, createdAt: { gte: sevenDaysAgo } } }),
  ]);

  // Calculate streak based on note creation dates
  const allNotes = await prisma.note.findMany({
    where: { userId },
    select: { createdAt: true },
    orderBy: { createdAt: 'desc' }
  });

  let studyStreak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  const uniqueDates = Array.from(new Set(allNotes.map(n => {
    const d = new Date(n.createdAt);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  })));

  for (const time of uniqueDates) {
    if (time === currentDate.getTime()) {
      studyStreak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (time === currentDate.getTime() - 86400000 && studyStreak === 0) {
      // If they haven't studied today but studied yesterday, the streak is still alive
      studyStreak++;
      currentDate = new Date(time);
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return { 
    noteCount, summaryCount, quizCount, flashcardDeckCount, chatCount, recentNotes,
    weeklyNoteCount, weeklyQuizCount, studyStreak
  };
}
