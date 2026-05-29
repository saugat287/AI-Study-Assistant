import { groq } from '../config/groq';
import { prisma } from '../config/database';

// Helper to check if we should mock
function shouldMock() {
  return !process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.includes('missing') || process.env.GROQ_API_KEY.includes('your_groq_api_key_here');
}

const MODEL = "llama-3.1-8b-instant";

// ── Summarize ──────────────────────────────────────────────────────────────

export async function summarizeNote(noteId: string, userId: string): Promise<string> {
  const note = await prisma.note.findFirst({ where: { id: noteId, userId } });
  if (!note) throw Object.assign(new Error('Note not found'), { statusCode: 404 });

  let summary = '';
  
  if (shouldMock()) {
    summary = `- Key concept: Understanding the core principles of this topic.\n- Main idea: ${note.title} is an essential study material.\n- Details: The notes cover various fundamental aspects that are critical for mastery.\n- Conclusion: Review this material frequently to retain knowledge.`;
  } else {
    try {
      const prompt = `You are an expert study assistant. Summarize the following study notes concisely and clearly. Use bullet points for key concepts. Keep it focused and educational.\n\nNotes:\n${note.content}`;
      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: MODEL,
      });
      summary = chatCompletion.choices[0]?.message?.content || '';
    } catch (error) {
      console.warn("Groq summarize error, using fallback mock:", error);
      summary = `- Key concept: Understanding the core principles of this topic.\n- Main idea: ${note.title} is an essential study material.\n- Details: The notes cover various fundamental aspects that are critical for mastery.\n- Conclusion: Review this material frequently to retain knowledge.`;
    }
  }

  // Upsert so re-summarizing replaces the old one
  await prisma.summary.upsert({
    where: { noteId },
    create: { noteId, content: summary },
    update: { content: summary },
  });

  await prisma.activityLog.create({
    data: { userId, action: 'SUMMARY_GENERATED' }
  });

  return summary;
}

export async function getSummary(noteId: string, userId: string) {
  const note = await prisma.note.findFirst({ where: { id: noteId, userId } });
  if (!note) throw Object.assign(new Error('Note not found'), { statusCode: 404 });
  return prisma.summary.findUnique({ where: { noteId } });
}

export async function deleteSummary(noteId: string, userId: string) {
  const note = await prisma.note.findFirst({ where: { id: noteId, userId } });
  if (!note) throw Object.assign(new Error('Note not found'), { statusCode: 404 });
  
  await prisma.summary.delete({ where: { noteId } });
}

// ── Quiz ───────────────────────────────────────────────────────────────────

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export async function generateQuiz(
  noteId: string,
  userId: string,
  questionCount = 5
): Promise<{ quizId: string; questions: QuizQuestion[] }> {
  const note = await prisma.note.findFirst({ where: { id: noteId, userId } });
  if (!note) throw Object.assign(new Error('Note not found'), { statusCode: 404 });

  let questions: QuizQuestion[] = [];

  if (shouldMock()) {
    for (let i = 0; i < questionCount; i++) {
      questions.push({
        question: `What is a key takeaway from "${note.title}" (Practice Question ${i + 1})?`,
        options: ["Option A: Incorrect", "Option B: Incorrect", "Option C: Correct Answer", "Option D: Incorrect"],
        correctAnswer: 2,
        explanation: "This is a practice explanation."
      });
    }
  } else {
    try {
      const prompt = `You are a quiz generator. Generate exactly ${questionCount} multiple-choice questions from the provided study notes. 
Return ONLY a valid JSON object with a single key "questions" containing an array in this exact format:
{
  "questions": [
    {
      "question": "question text",
      "options": ["option A", "option B", "option C", "option D"],
      "correctAnswer": 0,
      "explanation": "brief explanation"
    }
  ]
}
correctAnswer is the zero-based index of the correct option.
Notes:
${note.content}`;

      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: MODEL,
        response_format: { type: "json_object" },
      });
      const text = chatCompletion.choices[0]?.message?.content || '{}';
      const parsed = JSON.parse(text);
      questions = parsed.questions || [];
    } catch (error) {
      console.warn("Groq quiz error, using fallback mock:", error);
      for (let i = 0; i < questionCount; i++) {
        questions.push({
          question: `What is a key takeaway from "${note.title}" (Practice Question ${i + 1})?`,
          options: ["Option A: Incorrect", "Option B: Incorrect", "Option C: Correct Answer", "Option D: Incorrect"],
          correctAnswer: 2,
          explanation: "This is a fallback practice explanation generated while offline."
        });
      }
    }
  }

  const quiz = await prisma.quiz.create({
    data: {
      title: `Quiz: ${note.title}`,
      noteId,
      questions: {
        create: questions.map((q) => ({
          questionText: q.question,
          options: JSON.stringify(q.options),
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
        })),
      },
    },
    include: { questions: true },
  });

  await prisma.activityLog.create({
    data: { userId, action: 'QUIZ_TAKEN' }
  });

  return {
    quizId: quiz.id,
    questions: quiz.questions.map((q) => ({
      question: q.questionText,
      options: JSON.parse(q.options),
      correctAnswer: q.correctAnswer,
      explanation: q.explanation ?? '',
    })),
  };
}

export async function getQuizzesForNote(noteId: string, userId: string) {
  const note = await prisma.note.findFirst({ where: { id: noteId, userId } });
  if (!note) throw Object.assign(new Error('Note not found'), { statusCode: 404 });

  return prisma.quiz.findMany({
    where: { noteId },
    orderBy: { createdAt: 'desc' },
    include: { questions: true },
  });
}

export async function deleteQuiz(quizId: string, userId: string) {
  const quiz = await prisma.quiz.findFirst({ 
    where: { id: quizId, note: { userId } } 
  });
  if (!quiz) throw Object.assign(new Error('Quiz not found'), { statusCode: 404 });

  await prisma.quiz.delete({ where: { id: quizId } });
}

// ── Flashcards ─────────────────────────────────────────────────────────────

export interface FlashcardItem {
  front: string;
  back: string;
}

export async function generateFlashcards(
  noteId: string,
  userId: string,
  cardCount = 10
): Promise<{ deckId: string; cards: FlashcardItem[] }> {
  const note = await prisma.note.findFirst({ where: { id: noteId, userId } });
  if (!note) throw Object.assign(new Error('Note not found'), { statusCode: 404 });

  let cards: FlashcardItem[] = [];

  if (shouldMock()) {
    for (let i = 0; i < cardCount; i++) {
      cards.push({
        front: `Key Term ${i + 1} from ${note.title}`,
        back: `This is a practice definition for Term ${i + 1}.`
      });
    }
  } else {
    try {
      const prompt = `You are a flashcard generator. Create exactly ${cardCount} study flashcards from the provided notes.
Return ONLY valid JSON in this format:
{
  "flashcards": [
    { "front": "term or question", "back": "definition or answer" }
  ]
}
Notes:
${note.content}`;

      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: MODEL,
        response_format: { type: "json_object" },
      });
      const text = chatCompletion.choices[0]?.message?.content || '{}';
      const parsed = JSON.parse(text);
      cards = parsed.flashcards || [];
    } catch (error) {
      console.warn("Groq flashcard error, using fallback mock:", error);
      for (let i = 0; i < cardCount; i++) {
        cards.push({
          front: `Key Term ${i + 1} from ${note.title}`,
          back: `This is a fallback definition for Term ${i + 1} generated while offline.`
        });
      }
    }
  }

  const deck = await prisma.flashcardDeck.create({
    data: {
      title: `Flashcards: ${note.title}`,
      noteId,
      flashcards: {
        create: cards.map((c) => ({ front: c.front, back: c.back })),
      },
    },
    include: { flashcards: true },
  });

  await prisma.activityLog.create({
    data: { userId, action: 'FLASHCARD_GENERATED' }
  });

  return {
    deckId: deck.id,
    cards: deck.flashcards.map((c) => ({ front: c.front, back: c.back })),
  };
}

export async function getFlashcardsForNote(noteId: string, userId: string) {
  const note = await prisma.note.findFirst({ where: { id: noteId, userId } });
  if (!note) throw Object.assign(new Error('Note not found'), { statusCode: 404 });

  return prisma.flashcardDeck.findMany({
    where: { noteId },
    orderBy: { createdAt: 'desc' },
    include: { flashcards: true },
  });
}

export async function deleteFlashcardDeck(deckId: string, userId: string) {
  const deck = await prisma.flashcardDeck.findFirst({ 
    where: { id: deckId, note: { userId } } 
  });
  if (!deck) throw Object.assign(new Error('Flashcard deck not found'), { statusCode: 404 });

  await prisma.flashcardDeck.delete({ where: { id: deckId } });
}

export async function reviewFlashcard(flashcardId: string, userId: string, quality: number) {
  // quality: 0 (blackout), 1 (wrong), 2 (hard), 3 (good), 4 (easy)
  const card = await prisma.flashcard.findUnique({ where: { id: flashcardId } });
  if (!card) throw Object.assign(new Error('Flashcard not found'), { statusCode: 404 });

  let { interval, easeFactor, repetitions } = card;

  if (quality < 2) {
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  }

  easeFactor = easeFactor + (0.1 - (4 - quality) * (0.08 + (4 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  return prisma.flashcard.update({
    where: { id: flashcardId },
    data: {
      interval,
      easeFactor,
      repetitions,
      nextReview,
    }
  });
}

// ── Magic Generate ───────────────────────────────────────────────────────────

export async function magicGenerate(
  userId: string,
  topic: string,
  type: 'quiz' | 'flashcards'
): Promise<{ noteId: string }> {
  let noteContent = '';

  if (shouldMock()) {
    noteContent = `This is a magically generated study note for the topic: ${topic}. It covers all the essential concepts of ${topic} to help you study effectively while in offline mode.`;
  } else {
    try {
      const prompt = `You are an expert study assistant. Generate a comprehensive and educational study note about the following topic: "${topic}". The note should be well-structured with headings and bullet points.`;
      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: MODEL,
      });
      noteContent = chatCompletion.choices[0]?.message?.content || '';
    } catch (error) {
      console.warn("Groq magic generate error, using fallback mock:", error);
      noteContent = `This is a magically generated offline note for the topic: ${topic}. The AI service is currently in offline mode.`;
    }
  }

  const note = await prisma.note.create({
    data: { userId, title: topic, content: noteContent },
  });

  if (type === 'quiz') {
    await generateQuiz(note.id, userId, 5);
  } else if (type === 'flashcards') {
    await generateFlashcards(note.id, userId, 10);
  }

  return { noteId: note.id };
}

// ── Chat Tutor ─────────────────────────────────────────────────────────────

export async function createChatSession(userId: string, noteId?: string) {
  let title = 'Study Chat';
  let noteContent = '';
  if (noteId) {
    const note = await prisma.note.findFirst({ where: { id: noteId, userId } });
    if (note) {
      title = `Chat: ${note.title}`;
      noteContent = note.content;
    }
  }
  const session = await prisma.chatSession.create({
    data: { title, userId, noteId: noteId ?? null },
  });
  return { session, noteContent };
}

export async function sendChatMessage(
  sessionId: string,
  userId: string,
  userMessage: string
): Promise<string> {
  const session = await prisma.chatSession.findFirst({
    where: { id: sessionId, userId },
    include: {
      messages: { orderBy: { createdAt: 'asc' }, take: 20 },
      note: true,
    },
  });
  if (!session) throw Object.assign(new Error('Session not found'), { statusCode: 404 });

  await prisma.chatMessage.create({
    data: { sessionId, role: 'user', content: userMessage },
  });

  let assistantMessage = '';

  if (shouldMock()) {
    assistantMessage = `I'm your AI tutor! You said: "${userMessage}". I am currently operating in offline mode, but I'm still here to help you study.`;
  } else {
    try {
      const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      const systemPrompt = session.note
        ? `You are a helpful AI study tutor. Today's date is ${currentDate}. You have access to a live Wikipedia search tool. You MUST use the searchWikipedia tool to look up ANY factual questions, people, or current events. Your internal training data stops in 2023, so you MUST use the tool to get the latest info. NEVER mention your knowledge cutoff date to the user.\n\nThe student is studying the following material:\n\n${session.note.content}\n\nAnswer questions based on this material. Be clear, encouraging, and educational.`
        : `You are a helpful AI study tutor. Today's date is ${currentDate}. You have access to a live Wikipedia search tool. You MUST use the searchWikipedia tool to look up ANY factual questions, people, or current events. Your internal training data stops in 2023, so you MUST use the tool to get the latest info. NEVER mention your knowledge cutoff date to the user. Be clear, encouraging, and educational.`;

      const formattedMessages: any[] = [
        { role: 'system', content: systemPrompt },
      ];

      session.messages.forEach(m => {
        formattedMessages.push({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content
        });
      });
      
      formattedMessages.push({ role: 'user', content: userMessage });

      const tools = [
        {
          type: "function" as const,
          function: {
            name: "searchWikipedia",
            description: "Search Wikipedia for real-time and up-to-date information. Use this whenever the user asks for facts, current events, or information you don't know.",
            parameters: {
              type: "object",
              properties: { query: { type: "string" } },
              required: ["query"]
            }
          }
        }
      ];

      let chatCompletion = await groq.chat.completions.create({
        messages: formattedMessages,
        model: MODEL,
        tools,
      });

      const responseMessage = chatCompletion.choices[0]?.message;

      if (responseMessage?.tool_calls?.length) {
        // Append assistant's tool call request
        formattedMessages.push(responseMessage as any);

        // Execute each tool call
        for (const toolCall of responseMessage.tool_calls) {
          if (toolCall.function.name === 'searchWikipedia') {
            const args = JSON.parse(toolCall.function.arguments || '{}');
            try {
              const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(args.query)}&utf8=&format=json`;
              const searchRes = await fetch(searchUrl);
              const searchData = (await searchRes.json()) as any;
              
              let wikiContent = "No results found.";
              if (searchData.query?.search?.length > 0) {
                const topHit = searchData.query.search[0];
                const extractUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=1&explaintext=1&pageids=${topHit.pageid}&format=json`;
                const extractRes = await fetch(extractUrl);
                const extractData = (await extractRes.json()) as any;
                const extract = extractData.query?.pages[topHit.pageid]?.extract || topHit.snippet.replace(/<[^>]+>/g, '');
                wikiContent = `Title: ${topHit.title}\n\n${extract}`;
              }
              
              formattedMessages.push({
                role: 'tool',
                tool_call_id: toolCall.id,
                content: wikiContent
              });
            } catch (err) {
              formattedMessages.push({
                role: 'tool',
                tool_call_id: toolCall.id,
                content: "Failed to search Wikipedia."
              });
            }
          }
        }

        // Second pass with tool results
        chatCompletion = await groq.chat.completions.create({
          messages: formattedMessages,
          model: MODEL,
        });
        assistantMessage = chatCompletion.choices[0]?.message?.content || '';
      } else {
        assistantMessage = responseMessage?.content || '';
      }
    } catch (error) {
      console.warn("Groq chat error, using fallback mock:", error);
      assistantMessage = `I'm your AI tutor! You said: "${userMessage}". I am currently operating in offline mode, but I'm still here to help you study.`;
    }
  }

  await prisma.chatMessage.create({
    data: { sessionId, role: 'assistant', content: assistantMessage },
  });

  return assistantMessage;
}

export async function getChatSessions(userId: string) {
  return prisma.chatSession.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    include: {
      note: { select: { title: true } },
      _count: { select: { messages: true } },
    },
  });
}

export async function getChatMessages(sessionId: string, userId: string) {
  const session = await prisma.chatSession.findFirst({ where: { id: sessionId, userId } });
  if (!session) throw Object.assign(new Error('Session not found'), { statusCode: 404 });
  return prisma.chatMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'asc' },
  });
}

export async function deleteChatSession(sessionId: string, userId: string) {
  const session = await prisma.chatSession.findFirst({ where: { id: sessionId, userId } });
  if (!session) throw Object.assign(new Error('Session not found'), { statusCode: 404 });
  
  return prisma.chatSession.delete({
    where: { id: sessionId },
  });
}

// ── Quizzes Hub ────────────────────────────────────────────────────────────

export async function getAllQuizzes(userId: string) {
  return prisma.quiz.findMany({
    where: { note: { userId } },
    orderBy: { createdAt: 'desc' },
    include: { 
      note: { select: { title: true } },
      questions: true,
      attempts: {
        where: { userId },
        orderBy: { createdAt: 'desc' }
      }
    },
  });
}

export async function submitQuizAttempt(userId: string, quizId: string, score: number, totalQuestions: number) {
  const quiz = await prisma.quiz.findFirst({ where: { id: quizId, note: { userId } } });
  if (!quiz) throw Object.assign(new Error('Quiz not found'), { statusCode: 404 });

  return prisma.quizAttempt.create({
    data: {
      userId,
      quizId,
      score,
      totalQuestions
    }
  });
}

// ── Flashcards Hub ─────────────────────────────────────────────────────────

export async function getAllFlashcardDecks(userId: string) {
  return prisma.flashcardDeck.findMany({
    where: { note: { userId } },
    orderBy: { createdAt: 'desc' },
    include: {
      note: { select: { title: true } },
      flashcards: true
    }
  });
}

// ── Planner Hub ────────────────────────────────────────────────────────────

export async function getPlannerEvents(userId: string) {
  return prisma.studyEvent.findMany({
    where: { userId },
    orderBy: { date: 'asc' }
  });
}

export async function createPlannerEvent(userId: string, title: string, date: Date, type: string, color: string) {
  return prisma.studyEvent.create({
    data: {
      userId,
      title,
      date,
      type,
      color
    }
  });
}

export async function deletePlannerEvent(userId: string, eventId: string) {
  const event = await prisma.studyEvent.findFirst({ where: { id: eventId, userId } });
  if (!event) throw Object.assign(new Error('Event not found'), { statusCode: 404 });
  return prisma.studyEvent.delete({ where: { id: eventId } });
}

