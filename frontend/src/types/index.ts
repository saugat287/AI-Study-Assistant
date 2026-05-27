export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  fileUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  summary?: { id: string; createdAt: string } | null;
  _count?: { quizzes: number; flashcardDecks: number };
}

export interface Summary {
  id: string;
  content: string;
  noteId: string;
  createdAt: string;
}

export interface QuizQuestion {
  id?: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  noteId: string;
  createdAt: string;
  questions: Array<{
    id: string;
    questionText: string;
    options: string;
    correctAnswer: number;
    explanation: string | null;
  }>;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export interface FlashcardDeck {
  id: string;
  title: string;
  noteId: string;
  createdAt: string;
  flashcards: Flashcard[];
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface ChatSession {
  id: string;
  title: string;
  noteId?: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  note?: { title: string } | null;
  _count?: { messages: number };
}

export interface DashboardStats {
  noteCount: number;
  summaryCount: number;
  quizCount: number;
  flashcardDeckCount: number;
  chatCount: number;
  studyStreak: number;
  weeklyNoteCount: number;
  weeklyQuizCount: number;
  recentNotes: Array<{ id: string; title: string; createdAt: string }>;
}
