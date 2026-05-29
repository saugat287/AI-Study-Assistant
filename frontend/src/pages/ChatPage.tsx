import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Plus, MessageCircle, Bot, User, Loader2, Mic } from 'lucide-react';
import { aiApi } from '../api/ai';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PageSpinner } from '../components/ui/Spinner';
import { ChatSession, ChatMessage } from '../types';
import { formatDate } from '../utils/format';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';

function ChatInput({ onSend, isPending }: { onSend: (msg: string) => void, isPending: boolean }) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isPending) {
        onSend(input.trim());
        setInput('');
      }
    }
  };

  return (
    <div className="p-4 border-t border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="flex gap-2 items-end">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question... (Enter to send)"
          rows={1}
          className="flex-1 resize-none px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md text-sm text-[#ffffff] focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent max-h-32 overflow-y-auto transition-all shadow-[0_0_15px_rgba(16,185,129,0.1)] focus:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
          style={{ minHeight: 44 }}
        />
        <Button
          onClick={() => toast.success("Voice input is not yet supported in this demo.")}
          variant="outline"
          className="shrink-0 !px-3"
        >
          <Mic className="w-4 h-4 text-[#10b981]" />
        </Button>
        <Button
          onClick={() => {
            if (input.trim() && !isPending) {
              onSend(input.trim());
              setInput('');
            }
          }}
          disabled={!input.trim() || isPending}
          className="shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export function ChatPage() {
  const location = useLocation();
  const preloadNoteId = location.state?.noteId as string | undefined;
  const queryClient = useQueryClient();

  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ['chatSessions'],
    queryFn: () => aiApi.getSessions().then((r) => r.data.data),
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['chatMessages', activeSession],
    queryFn: () => aiApi.getMessages(activeSession!).then((r) => r.data.data),
    enabled: !!activeSession,
  });

  useEffect(() => {
    if (messages.length) setLocalMessages(messages);
  }, [messages]);

  useEffect(() => {
    if (!activeSession && !preloadNoteId && sessions.length > 0) {
      setActiveSession(sessions[0].id);
    }
  }, [sessions, activeSession, preloadNoteId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localMessages]);

  const createSessionMutation = useMutation<
    { data: { data: ChatSession } },
    unknown,
    string | undefined
  >({
    mutationFn: (noteId?: string) => aiApi.createChatSession(noteId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['chatSessions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setActiveSession(res.data.data.id);
      setLocalMessages([]);
      toast.success('New chat started');
    },
    onError: () => toast.error('Failed to start chat'),
  });

  const deleteSessionMutation = useMutation({
    mutationFn: (sessionId: string) => aiApi.deleteSession(sessionId),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['chatSessions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      if (activeSession === deletedId) {
        setActiveSession(null);
        setLocalMessages([]);
      }
      toast.success('Chat deleted');
    },
    onError: () => toast.error('Failed to delete chat'),
  });

  const sendMutation = useMutation({
    mutationFn: (msg: string) => aiApi.sendMessage(activeSession!, msg),
    onSuccess: (res) => {
      const assistantMsg: ChatMessage = {
        id: Date.now().toString(),
        sessionId: activeSession!,
        role: 'assistant',
        content: res.data.data.reply,
        createdAt: new Date().toISOString(),
      };
      setLocalMessages((prev) => [...prev, assistantMsg]);
      queryClient.invalidateQueries({ queryKey: ['chatSessions'] });
    },
    onError: () => {
      toast.error('Failed to send message');
      setLocalMessages((prev) => prev.slice(0, -1));
    },
  });

  // Auto-start a session with noteId if passed from navigation
  useEffect(() => {
    if (preloadNoteId && !activeSession) {
      createSessionMutation.mutate(preloadNoteId);
    }
  }, [preloadNoteId]);

  const handleSend = (messageContent: string) => {
    if (!activeSession || sendMutation.isPending) return;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sessionId: activeSession,
      role: 'user',
      content: messageContent,
      createdAt: new Date().toISOString(),
    };
    setLocalMessages((prev) => [...prev, userMsg]);
    sendMutation.mutate(messageContent);
  };

  const displayMessages = localMessages;

  return (
    <div className="flex h-full">
      {/* Session sidebar */}
      <div className="w-64 border-r border-white/10 flex flex-col bg-slate-950/80 backdrop-blur-xl hidden md:flex">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <Button
            fullWidth
            size="sm"
            onClick={() => createSessionMutation.mutate(undefined)}
            loading={createSessionMutation.isPending}
          >
            <Plus className="w-3.5 h-3.5" />
            New Chat
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {sessionsLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 px-4">
              <MessageCircle className="w-8 h-8 text-gray-300 dark:text-gray-700 mx-auto mb-2" />
              <p className="text-xs text-gray-500">No chats yet. Start one!</p>
            </div>
          ) : (
            sessions.map((session: ChatSession) => (
              <button
                key={session.id}
                onClick={() => setActiveSession(session.id)}
                className={clsx(
                  'group w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors mb-1',
                  activeSession === session.id
                    ? 'bg-gradient-to-r from-[#8b5cf6]/20 to-[#10b981]/20 text-white shadow-[0_0_15px_rgba(139,92,246,0.15)]'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                )}
              >
                <div className="flex justify-between items-center w-full">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{session.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(session.updatedAt)}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Are you sure you want to delete this chat?')) {
                        deleteSessionMutation.mutate(session.id);
                      }
                    }}
                    className="sci-fi-delete-btn p-1.5 rounded-lg shrink-0 ml-2 flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                  </button>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {sessions.length > 0 && (
          <div className="md:hidden border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-3">
            <label className="text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400 mb-2 block">
              Select a chat session
            </label>
            <select
              value={activeSession ?? ''}
              onChange={(e) => setActiveSession(e.target.value)}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {sessions.map((session: ChatSession) => (
                <option key={session.id} value={session.id}>
                  {session.title}
                </option>
              ))}
            </select>
          </div>
        )}
        {!activeSession ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-brand-600 dark:text-brand-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">AI Tutor</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm text-sm">
                Start a new chat to ask questions about your study material or any topic.
              </p>
              <Button
                onClick={() => createSessionMutation.mutate(undefined)}
                loading={createSessionMutation.isPending}
              >
                <Plus className="w-4 h-4" />
                Start New Chat
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
              {messagesLoading ? (
                <PageSpinner />
              ) : displayMessages.length === 0 ? (
                <div className="text-center py-12">
                  <Bot className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">Ask me anything about your study material!</p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {displayMessages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={clsx('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}
                    >
                      {msg.role === 'assistant' && (
                        <div className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center shrink-0 mt-0.5">
                          <Bot className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                        </div>
                      )}
                      <div
                        className={clsx(
                          'max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed backdrop-blur-md',
                          msg.role === 'user'
                            ? 'bg-gradient-to-r from-[#8b5cf6]/90 to-[#7c3aed]/90 text-[#ffffff] rounded-br-sm shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                            : 'bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-800 dark:text-gray-200 rounded-bl-sm shadow-[0_4px_15px_rgba(0,0,0,0.05)] dark:shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                        )}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      {msg.role === 'user' && (
                        <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 mt-0.5">
                          <User className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                  {sendMutation.isPending && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center shrink-0">
                        <Bot className="w-3.5 h-3.5 text-brand-600" />
                      </div>
                      <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl rounded-bl-sm px-4 py-3 shadow-[0_4px_15px_rgba(0,0,0,0.05)] dark:shadow-[0_0_15px_rgba(0,240,255,0.1)]">
                        <div className="flex gap-1 items-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-gray-400 animate-bounce [animation-delay:0ms]" />
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-gray-400 animate-bounce [animation-delay:150ms]" />
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-gray-400 animate-bounce [animation-delay:300ms]" />
                        </div>
                      </div>
                    </div>
                  )}
                </AnimatePresence>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <ChatInput onSend={handleSend} isPending={sendMutation.isPending} />
          </>
        )}
      </div>
    </div>
  );
}
