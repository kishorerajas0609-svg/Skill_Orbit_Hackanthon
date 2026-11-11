import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { ChatMessage, ChatSession } from '../../types';
import {
  Bot,
  Sparkles,
  X,
  Send,
  Minimize2,
  Maximize2,
  Plus,
  Trash2,
  MessageSquare,
  ChevronDown
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export const SkillOrbitAIAssistant: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [showSessionsDropdown, setShowSessionsDropdown] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && user) {
      fetchSessions();
    }
  }, [isOpen, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const fetchSessions = async () => {
    try {
      const res = await api.get('/ai/sessions');
      const list = res.data.sessions || [];
      setSessions(list);
      if (list.length > 0 && !sessionId) {
        loadSession(list[0]._id);
      } else if (list.length === 0 && messages.length === 0) {
        // Initial welcome message
        setMessages([
          {
            _id: 'welcome-1',
            session_id: 'init',
            sender: 'assistant',
            content: `Hello ${user?.full_name || 'there'}! I am **SkillOrbit AI**, your intelligent ${user?.role || 'career'} co-pilot. How can I help boost your skills, placements, or talent search today?`,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch (e) {
      // ignore
    }
  };

  const loadSession = async (sId: string) => {
    setSessionId(sId);
    setShowSessionsDropdown(false);
    try {
      const res = await api.get(`/ai/sessions/${sId}/messages`);
      setMessages(res.data.messages || []);
    } catch (e) {
      // ignore
    }
  };

  const handleNewChat = () => {
    setSessionId(null);
    setMessages([
      {
        _id: `welcome-${Date.now()}`,
        session_id: 'new',
        sender: 'assistant',
        content: `Started a fresh conversation! Ask me anything about ${
          user?.role === 'student'
            ? 'career targets, skill gaps, resume review, or mock interviews.'
            : user?.role === 'recruiter'
            ? 'job descriptions, interview questions, or candidate profiles.'
            : 'curriculum alignment and industry collaborations.'
        }`,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputMessage;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      _id: `user-${Date.now()}`,
      session_id: sessionId || 'temp',
      sender: 'user',
      content: textToSend,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInputMessage('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', {
        message: textToSend,
        session_id: sessionId,
      });

      if (res.data?.session_id && !sessionId) {
        setSessionId(res.data.session_id);
        fetchSessions();
      }

      const assistantMsg: ChatMessage = {
        _id: `ai-${Date.now()}`,
        session_id: res.data.session_id,
        sender: 'assistant',
        content: res.data.message,
        timestamp: res.data.timestamp,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        _id: `err-${Date.now()}`,
        session_id: sessionId || 'temp',
        sender: 'assistant',
        content: "I'm having trouble connecting to the AI co-pilot right now. Please check your backend network or try again in a moment.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (sId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.delete(`/ai/sessions/${sId}`);
      setSessions((prev) => prev.filter((s) => s._id !== sId));
      if (sessionId === sId) {
        handleNewChat();
      }
    } catch (e) {
      // ignore
    }
  };

  // Role-specific suggested prompt chips
  const getPromptChips = () => {
    if (!user) return ['What is SkillOrbit?', 'How do skill passports work?'];
    switch (user.role) {
      case 'student':
        return [
          'Explain my top skill gaps',
          'Suggest high-impact portfolio projects',
          'Give me mock interview questions for React',
          'How can I improve my placement readiness?',
        ];
      case 'recruiter':
        return [
          'Draft a Full-Stack Engineer job description',
          'Suggest technical screening questions',
          'How does candidate skill verification work?',
        ];
      case 'institution':
        return [
          'How to improve department placement rate?',
          'Recommend industry partnership strategies',
          'Analyze top missing skills across students',
        ];
      default:
        return ['How can I maximize my SkillOrbit profile?'];
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 text-white shadow-2xl shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all duration-200 border border-emerald-400/30 group"
          title="Open SkillOrbit AI Assistant"
        >
          <div className="relative flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
            <Sparkles className="w-4 h-4 text-emerald-200 animate-pulse" />
          </div>
          <span className="text-xs font-bold tracking-wide">SkillOrbit AI</span>
          <span className="rounded-full bg-emerald-400/20 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-200 uppercase">
            {user?.role || 'Co-Pilot'}
          </span>
        </button>
      )}

      {/* Chatbot Window */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex flex-col rounded-3xl border border-border bg-surface shadow-2xl overflow-hidden transition-all duration-300 ${
            isExpanded
              ? 'w-[90vw] md:w-[680px] h-[85vh]'
              : 'w-[92vw] sm:w-[420px] h-[580px]'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-surface-elevated px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-foreground">SkillOrbit AI</h3>
                  <Badge variant="emerald" size="sm">Gemini</Badge>
                </div>
                <span className="text-[11px] text-foreground-muted capitalize">
                  {user?.role ? `${user.role} Co-Pilot` : 'Intelligent Assistant'}
                </span>
              </div>
            </div>

            {/* Header controls */}
            <div className="flex items-center gap-1">
              {/* Sessions Selector */}
              {sessions.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowSessionsDropdown(!showSessionsDropdown)}
                    className="p-1.5 rounded-lg text-foreground-muted hover:text-foreground hover:bg-surface border border-transparent hover:border-border text-xs flex items-center gap-1"
                    title="History"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <ChevronDown className="w-3 h-3" />
                  </button>

                  {showSessionsDropdown && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-surface p-1.5 shadow-xl z-50 max-h-52 overflow-y-auto">
                      <div className="px-2 py-1 text-[10px] font-bold text-foreground-muted uppercase">
                        Past Conversations
                      </div>
                      {sessions.map((s) => (
                        <div
                          key={s._id}
                          onClick={() => loadSession(s._id)}
                          className={`flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-xs cursor-pointer ${
                            sessionId === s._id ? 'bg-emerald-500/10 text-emerald-400 font-medium' : 'text-foreground hover:bg-surface-elevated'
                          }`}
                        >
                          <span className="truncate flex-1">{s.title || 'Conversation'}</span>
                          <button
                            onClick={(e) => handleDeleteSession(s._id, e)}
                            className="text-foreground-muted hover:text-rose-400 p-0.5"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={handleNewChat}
                className="p-1.5 rounded-lg text-foreground-muted hover:text-foreground hover:bg-surface border border-transparent hover:border-border"
                title="New Chat"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="hidden sm:block p-1.5 rounded-lg text-foreground-muted hover:text-foreground hover:bg-surface border border-transparent hover:border-border"
                title={isExpanded ? 'Restore Size' : 'Expand View'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-foreground-muted hover:text-foreground hover:bg-surface border border-transparent hover:border-border"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-background/50">
            {messages.map((m) => {
              const isAi = m.sender === 'assistant';
              return (
                <div
                  key={m._id}
                  className={`flex gap-2.5 ${isAi ? 'justify-start' : 'justify-end'}`}
                >
                  {isAi && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-sm ${
                      isAi
                        ? 'bg-surface border border-border text-foreground prose-sm'
                        : 'bg-emerald-600 text-white font-medium'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{m.content}</div>
                    <span className={`block mt-1 text-[9px] ${isAi ? 'text-foreground-muted/60' : 'text-emerald-100/70'}`}>
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex gap-2.5 items-center text-xs text-foreground-muted">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="rounded-2xl bg-surface border border-border px-3 py-2 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="ml-1 text-[11px] text-foreground-muted">SkillOrbit AI is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Prompt Chips */}
          <div className="border-t border-border/60 bg-surface px-3 py-2 overflow-x-auto flex gap-1.5 scrollbar-none">
            {getPromptChips().map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip)}
                disabled={loading}
                className="shrink-0 rounded-full border border-border bg-surface-elevated hover:border-emerald-500/40 hover:bg-emerald-500/10 px-2.5 py-1 text-[11px] text-foreground-muted hover:text-emerald-400 transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <div className="border-t border-border bg-surface p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask SkillOrbit AI..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={loading}
                className="flex-1 rounded-xl border border-border bg-surface-elevated px-3.5 py-2 text-xs text-foreground placeholder-foreground-muted focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={loading}
                disabled={!inputMessage.trim()}
                className="shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
