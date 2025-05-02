"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser, useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Heart,
  ArrowLeft,
  ExternalLink,
  MessageSquareText,
  Send,
  Calendar,
  User,
  Bot,
  Lightbulb,
  CheckCheck,
  Share2,
  Copy,
} from 'lucide-react';
import { toast } from 'sonner';
import { roadmapHelper } from '@/lib/gemini';
import { useTheme } from 'next-themes';
import { ScaleLoader } from 'react-spinners';

// Interfaces
interface Step {
  title: string;
  bullets: string[];
  link?: string;
}

interface Roadmap {
  id: number;
  title: string;
  year: number | null;
  ai_generated: boolean;
  created_by: string;
  steps: Step[];
  created_at: string;
  likes: number;
  progress?: { liked: boolean; completed_steps: number[] };
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Section Wrapper
const Section = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <section className={`py-8 ${className}`}>
    <div className="container mx-auto px-4 max-w-7xl">{children}</div>
  </section>
);

// Roadmap Header Component
const RoadmapHeader = ({
  roadmap,
  isStudent,
  updating,
  handleToggleLike,
  setShareDialogOpen,
}: {
  roadmap: Roadmap;
  isStudent: boolean;
  updating: boolean;
  handleToggleLike: () => void;
  setShareDialogOpen: (open: boolean) => void;
}) => {
  const { theme } = useTheme();
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1
            className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'} animate-fade-in`}
          >
            {roadmap.title}
          </h1>
          <div
            className={`flex items-center gap-3 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}
          >
            {roadmap.year && (
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1.5" />
                <span>Year {roadmap.year}</span>
              </div>
            )}
            <div className="h-1 w-1 rounded-full bg-slate-400 dark:bg-slate-600" />
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1.5" />
              <span>By {roadmap.created_by}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isStudent && (
            <Button
              variant="outline"
              className={`flex items-center gap-1.5 rounded-lg ${roadmap.progress?.liked
                ? 'text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800 bg-rose-50 '
                :  'border-primary bg-transparent text-slate-500'
                }  hover:bg-rose-100`}
              onClick={handleToggleLike}
              disabled={updating}
              aria-label={roadmap.progress?.liked ? 'Unlike roadmap' : 'Like roadmap'}
            >
              <Heart
                className={`h-4 w-4 ${roadmap.progress?.liked ? 'fill-rose-500 text-rose-500' : ''}`}
              />
              <span>{roadmap.likes}</span>
            </Button>
          )}
          <Button
            variant="outline"
            className={`rounded-lg  hover:bg-slate-100 dark:hover:bg-slate-700`}
            onClick={() => setShareDialogOpen(true)}
            aria-label="Share roadmap"
          >
            <Share2 className="h-4 w-4 mr-1.5" />
            Share
          </Button>
        </div>
      </div>
    </div>
  );
};

// Step Card Component
const StepCard = ({
  step,
  index,
  isStudent,
  roadmap,
  updating,
  handleToggleStep,
}: {
  step: Step;
  index: number;
  isStudent: boolean;
  roadmap: Roadmap;
  updating: boolean;
  handleToggleStep: (index: number) => void;
}) => {
  const { theme } = useTheme();
  return (
    <Card
      className={`relative overflow-hidden ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} shadow-sm hover:shadow-md transition hover:translate-y-[-4px] group ${roadmap.progress?.completed_steps.includes(index) ? 'border-l-4 border-l-green-500 dark:border-l-green-500' : ''}`}
    >
      <div className="absolute top-0 left-0 h-2 w-full bg-gradient-to-r from-blue-500 to-indigo-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          {isStudent && (
            <Checkbox
              checked={roadmap.progress?.completed_steps.includes(index)}
              onCheckedChange={() => handleToggleStep(index)}
              disabled={updating}
              className={`h-5 w-5 ${theme === 'dark' ? 'border-slate-600' : 'border-slate-300'} data-[state=checked]:bg-green-500 data-[state=checked]:text-white`}
              aria-label={`Mark step ${index + 1} as completed`}
            />
          )}
          <CardTitle
            className={`text-xl font-semibold ${theme === 'dark' ? 'text-slate-200 group-hover:text-blue-400' : 'text-slate-800 group-hover:text-blue-600'}`}
          >
            {index + 1}. {step.title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <ul
          className={`space-y-2 text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}
        >
          {step.bullets.map((bullet, i) => (
            <li key={i} className="flex items-start">
              <span className="mr-2 mt-1 text-blue-500">•</span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      {step.link && (
        <CardFooter className="pt-0 pb-4 text-sm">
          <a
            href={step.link}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-1 font-medium transition-colors ${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}
            aria-label="Learn more about this step"
          >
            Learn More
            <ExternalLink className="h-3 w-3" />
          </a>
        </CardFooter>
      )}
    </Card>
  );
};

// Progress Card Component
const ProgressCard = ({
  roadmap,
  isStudent,
  updating,
  markAllAsCompleted,
  setChatOpen,
}: {
  roadmap: Roadmap;
  isStudent: boolean;
  updating: boolean;
  markAllAsCompleted: () => void;
  setChatOpen: (open: boolean) => void;
}) => {
  const { theme } = useTheme();
  const completedStepsCount = roadmap.progress?.completed_steps.length || 0;
  const totalSteps = roadmap.steps.length;
  const progressPercentage = totalSteps > 0 ? Math.round((completedStepsCount / totalSteps) * 100) : 0;

  return (
    <Card
      className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} shadow-sm overflow-hidden`}
    >
      <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600" />
      <CardHeader className="p-6">
        <CardTitle className={`text-xl font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
          Roadmap Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-5">
        {isStudent ? (
          <>
            <div>
              <div className="flex items-center justify-between mb-2 text-sm">
                <span className={`font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  Your Progress
                </span>
                <span className={`font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                  {progressPercentage}%
                </span>
              </div>
              <Progress
                value={progressPercentage}
                className={`h-2 ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'} ${progressPercentage === 100 ? 'data-[state=filled]:bg-green-500' : ''}`}
              />
              <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                {completedStepsCount} of {totalSteps} steps completed
              </p>
            </div>
            {progressPercentage < 100 && progressPercentage > 0 && (
              <Button
                variant="outline"
                size="sm"
                className={`w-full rounded-lg`}
                onClick={markAllAsCompleted}
                disabled={updating}
                aria-label="Mark all steps as completed"
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark All as Completed
              </Button>
            )}
          </>
        ) : (
          <div className="py-2">
            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              Sign in as a student to track your progress on this roadmap.
            </p>
          </div>
        )}
        <div className={`border-t pt-4 mt-4 ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
          <h3 className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'} mb-3`}>
            Roadmap Details
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                Created On
              </span>
              <span className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                {new Date(roadmap.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                Total Steps
              </span>
              <span className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                {totalSteps}
              </span>
            </div>
            <div className="flex justify-between">
              <span className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                Type
              </span>
              <Badge
                variant="outline"
                className={`${theme === 'dark' ? 'border-slate-600 text-slate-300' : 'border-slate-200 text-slate-700'} bg-transparent rounded-full`}
              >
                {roadmap.ai_generated ? 'AI Generated' : 'Expert Created'}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          className={`w-full rounded-lg ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
          onClick={() => setChatOpen(true)}
          aria-label="Get help with this roadmap"
        >
          <MessageSquareText className="h-4 w-4 mr-2" />
          Get Help with This Roadmap
        </Button>
      </CardFooter>
    </Card>
  );
};

// ChatDialog Component
const ChatDialog = ({
  chatOpen,
  setChatOpen,
  chatQuery,
  setChatQuery,
  chatMessages,
  chatLoading,
  handleChatSubmit,
}: {
  chatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  chatQuery: string;
  setChatQuery: (value: string) => void;
  chatMessages: { role: 'user' | 'assistant'; content: string }[];
  chatLoading: boolean;
  handleChatSubmit: (e: React.FormEvent) => void;
}) => {
  const { theme } = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [chatQuery]);

  // Scroll to latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, chatLoading]);
  // Handle Ctrl+Enter to submit
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && chatQuery.trim()) {
      handleChatSubmit(e);
    }
  };

  return (
    <Dialog open={chatOpen} onOpenChange={setChatOpen}>
      <DialogContent
        className={`${
          theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
        } p-0 overflow-hidden text-slate-900 dark:text-slate-200 sm:max-w-lg md:max-w-xl lg:max-w-2xl max-h-[90vh] rounded-lg shadow-lg`}
      >
        {/* Header */}
        <div className={`p-4 border-b ${
          theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
        } sticky top-0 z-10`}>
          <DialogTitle
            className={`flex items-center gap-2 text-lg font-semibold ${
              theme === 'dark' ? 'text-slate-200' : 'text-slate-800'
            }`}
          >
            <Bot className="h-5 w-5 text-blue-500" />
            Roadmap Helper
          </DialogTitle>
        </div>

        {/* Chat Messages */}
        <ScrollArea className="flex-1 p-4 space-y-4 h-[60vh]">
          {chatMessages.length === 0 && !chatLoading ? (
            <div className="text-center py-8 animate-fade-in flex flex-col items-center justify-center h-full">
              <div
                className={`rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center ${
                  theme === 'dark' ? 'bg-indigo-900/30' : 'bg-blue-100'
                }`}
              >
                <Lightbulb
                  className={`h-8 w-8 ${theme === 'dark' ? 'text-indigo-400' : 'text-blue-600'}`}
                />
              </div>
              <h3
                className={`text-lg font-semibold ${
                  theme === 'dark' ? 'text-slate-200' : 'text-slate-800'
                } mb-2`}
              >
                Get Guidance on This Roadmap
              </h3>
              <p
                className={`text-sm max-w-md mx-auto mb-6 ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                Ask about roadmap steps, career advice, or progression tips.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
                {[
                  'How do I get started?',
                  'What resources do you recommend?',
                  'Is this roadmap for beginners?',
                  'How long will this take?',
                ].map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    className={`rounded-lg text-sm ${
                      theme === 'dark'
                        ? 'border-slate-700 text-slate-200 hover:bg-slate-700'
                        : 'border-slate-200 text-slate-800 hover:bg-slate-50'
                    }`}
                    onClick={() => setChatQuery(suggestion)}
                    aria-label={`Ask: ${suggestion}`}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex animate-fade-in ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`flex items-start gap-2 max-w-[80%] ${
                      msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <Avatar
                      className={`h-8 w-8 ${
                        msg.role === 'user'
                          ? 'bg-blue-600'
                          : 'bg-slate-200 dark:bg-slate-600'
                      }`}
                    >
                      <AvatarFallback>
                        {msg.role === 'user' ? (
                          <User className="h-4 w-4 text-white" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`p-3 rounded-lg text-sm whitespace-pre-wrap shadow-sm ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white rounded-tr-none'
                          : theme === 'dark'
                            ? 'bg-slate-700 text-slate-200 rounded-tl-none'
                            : 'bg-slate-100 text-slate-800 rounded-tl-none'
                      }`}
                    >
                      {msg.content}
                      <div
                        className={`text-xs mt-1 text-right ${
                          msg.role === 'user'
                            ? 'text-blue-200'
                            : theme === 'dark'
                              ? 'text-slate-400'
                              : 'text-slate-500'
                        }`}
                      >
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start animate-fade-in">
                  <div className="flex items-start gap-2 max-w-[80%]">
                    <Avatar className="h-8 w-8 bg-slate-200 dark:bg-slate-600">
                      <AvatarFallback>
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`p-3 rounded-lg ${
                        theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100'
                      } rounded-tl-none`}
                    >
                      <ScaleLoader color={theme === 'dark' ? '#6366f1' : '#3b82f6'} height={20} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </ScrollArea>

        {/* Input Area */}
        <div
          className={`border-t p-4 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} sticky bottom-0`}
        >
          <form onSubmit={handleChatSubmit} className="flex w-full items-end gap-2">
            <div className="relative flex-1">
              <Textarea
                ref={textareaRef}
                value={chatQuery}
                onChange={(e) => setChatQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className={`resize-none px-4 py-3 max-h-[120px] min-h-[48px] rounded-lg text-sm ${
                  theme === 'dark'
                    ? 'bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-400'
                    : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-500'
                } focus-visible:ring-blue-500 focus-visible:ring-offset-0 pr-12`}
                aria-label="Type a message"
              />
              <Button
                type="submit"
                className={`absolute right-2 bottom-2 rounded-full h-8 w-8 flex items-center justify-center ${
                  theme === 'dark'
                    ? chatQuery.trim() ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-600'
                    : chatQuery.trim() ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-300'
                } text-white transition-all`}
                size="icon"
                disabled={chatLoading || !chatQuery.trim()}
                aria-label="Send message"
              >
                <Send className={`h-4 w-4 ${chatQuery.trim() ? '' : 'opacity-50'}`} />
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Share Dialog Component
const ShareDialog = ({
  roadmapId,
  shareDialogOpen,
  setShareDialogOpen,
  handleShareRoadmap,
}: {
  roadmapId: number;
  shareDialogOpen: boolean;
  setShareDialogOpen: (open: boolean) => void;
  handleShareRoadmap: () => void;
}) => {
  const { theme } = useTheme();
  const shareUrl = `${window.location.origin}/roadmaps/${roadmapId}`;

  return (
    <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
      <DialogContent
        className={`sm:max-w-md ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-lg shadow-lg`}
      >
        <DialogHeader>
          <DialogTitle className={`${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
            Share Roadmap
          </DialogTitle>
        </DialogHeader>
        <div
          className={`p-4 border rounded-lg flex justify-between items-center ${theme === 'dark' ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-slate-50'}`}
        >
          <p className={`text-sm truncate ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
            {shareUrl}
          </p>
          <Button
            size="sm"
            variant="ghost"
            className={`${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}
            onClick={handleShareRoadmap}
            aria-label="Copy roadmap link"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <DialogFooter className="sm:justify-start">
          <Button
            variant="default"
            className={`rounded-lg ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
            onClick={handleShareRoadmap}
            aria-label="Copy roadmap link"
          >
            Copy Link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Main Roadmap Detail Component
export default function RoadmapDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { userId } = useAuth();
  const { theme, setTheme } = useTheme();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatQuery, setChatQuery] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(theme === 'dark');
  const role = user?.publicMetadata.role as string | undefined;

  // Sync dark mode with theme
  useEffect(() => {
    setIsDarkMode(theme === 'dark');
  }, [theme]);

  // Fetch roadmap
  useEffect(() => {
    if (isLoaded) fetchRoadmap();
  }, [isLoaded, id, userId]);

  const fetchRoadmap = async () => {
    setLoading(true);
    try {
      const url = userId ? `/api/roadmaps?id=${id}&userId=${userId}` : `/api/roadmaps?id=${id}`;
      const res = await fetch(url);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to fetch roadmap');
      }
      const { data } = await res.json();
      setRoadmap(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to fetch roadmap');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLike = async () => {
    if (!userId || role !== 'student' || !roadmap) return;
    setUpdating(true);
    try {
      const liked = !roadmap.progress?.liked;
      const res = await fetch('/api/roadmaps', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          roadmapId: roadmap.id,
          liked,
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update like');
      }
      setRoadmap({
        ...roadmap,
        likes: roadmap.likes + (liked ? 1 : -1),
        progress: {
          ...roadmap.progress,
          liked,
          completed_steps: roadmap.progress?.completed_steps || [],
        },
      });
      toast.success(liked ? 'Roadmap liked' : 'Roadmap unliked');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update like');
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleStep = async (stepIndex: number) => {
    if (!userId || role !== 'student' || !roadmap) return;
    setUpdating(true);
    try {
      const completedSteps = roadmap.progress?.completed_steps || [];
      const newCompletedSteps = completedSteps.includes(stepIndex)
        ? completedSteps.filter((i) => i !== stepIndex)
        : [...completedSteps, stepIndex];
      const res = await fetch('/api/roadmaps', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          roadmapId: roadmap.id,
          completed_steps: newCompletedSteps,
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update step');
      }
      setRoadmap({
        ...roadmap,
        progress: {
          ...roadmap.progress,
          liked: roadmap.progress?.liked || false,
          completed_steps: newCompletedSteps,
        },
      });
      toast.success(`Step ${newCompletedSteps.includes(stepIndex) ? 'completed' : 'unmarked'}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update step');
    } finally {
      setUpdating(false);
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roadmap || !chatQuery.trim()) return;
    const userMessage: ChatMessage = { role: 'user', content: chatQuery };
    setChatMessages((prev) => [...prev, userMessage]);
    setChatQuery('');
    setChatLoading(true);
    try {
      const response = await roadmapHelper(
        roadmap.title,
        roadmap.year?.toString() || '',
        roadmap.steps,
        chatQuery
      );
      const assistantMessage: ChatMessage = { role: 'assistant', content: response.answer };
      setChatMessages((prev) => [...prev, assistantMessage]);
    } catch {
      toast.error('Failed to get help. Please try again.');
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: "Sorry, I couldn't process your request. Please try again.",
      };
      setChatMessages((prev) => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleShareRoadmap = () => {
    const shareUrl = `${window.location.origin}/roadmaps/${id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Roadmap link copied to clipboard!');
    setShareDialogOpen(false);
  };

  const markAllAsCompleted = async () => {
    if (!userId || role !== 'student' || !roadmap) return;
    setUpdating(true);
    try {
      const allSteps = Array.from({ length: roadmap.steps.length }, (_, i) => i);
      const res = await fetch('/api/roadmaps', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          roadmapId: roadmap.id,
          completed_steps: allSteps,
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update steps');
      }
      setRoadmap({
        ...roadmap,
        progress: {
          ...roadmap.progress,
          liked: roadmap.progress?.liked || false,
          completed_steps: allSteps,
        },
      });
      toast.success('All steps marked as completed');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update steps');
    } finally {
      setUpdating(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <ScaleLoader color={theme === 'dark' ? '#6366f1' : '#3b82f6'} height={35} />
            <p className={`mt-4 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
              Loading roadmap...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Not found state
  if (!roadmap) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'}`}>
        
        <div className="flex items-center justify-center h-[80vh]">
          <div
            className={`text-center max-w-md mx-auto shadow-sm rounded-lg p-8 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
          >
            <div
              className={`rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center ${theme === 'dark' ? 'bg-indigo-900/30' : 'bg-blue-100'}`}
            >
              <Lightbulb
                className={`h-6 w-6 ${theme === 'dark' ? 'text-indigo-400' : 'text-blue-600'}`}
              />
            </div>
            <h2
              className={`text-xl font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'} mb-3`}
            >
              Roadmap Not Found
            </h2>
            <p
              className={`text-sm mb-6 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}
            >
              The roadmap you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Button
              variant="default"
              className={`rounded-lg ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
              onClick={() => router.push('/roadmaps')}
              aria-label="Back to roadmaps"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Roadmaps
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isStudent = role === 'student';
  const isAuthenticated = !!userId;
  const canViewSteps = !isAuthenticated || role === 'alumni' || role === 'admin' || isStudent;

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'} transition-colors duration-300`}>

      <Section>
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="ghost"
            className={`rounded-lg ${theme === 'dark' ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-50'}`}
            asChild
            aria-label="Back to roadmaps"
          >
            <Link href="/roadmaps">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Roadmaps
            </Link>
          </Button>
          <div className="flex items-center space-x-2">
            <Switch
              id="dark-mode"
              checked={isDarkMode}
              onCheckedChange={() => {
                setTheme(isDarkMode ? 'light' : 'dark');
                setIsDarkMode(!isDarkMode);
              }}
              className={isDarkMode ? 'bg-blue-600' : 'bg-blue-400'}
            />
            <Label
              htmlFor="dark-mode"
              className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}
            >
              {isDarkMode ? 'Dark Mode' : 'Light Mode'}
            </Label>
          </div>
        </div>
        <RoadmapHeader
          roadmap={roadmap}
          isStudent={isStudent}
          updating={updating}
          handleToggleLike={handleToggleLike}
          setShareDialogOpen={setShareDialogOpen}
        />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="sticky top-24">
              <ProgressCard
                roadmap={roadmap}
                isStudent={isStudent}
                updating={updating}
                markAllAsCompleted={markAllAsCompleted}
                setChatOpen={setChatOpen}
              />
            </div>
          </div>
          <div className="lg:col-span-3 order-1 lg:order-2">
            {canViewSteps ? (
              <div className="space-y-6 animate-fade-in">
                {roadmap.steps.map((step, index) => (
                  <StepCard
                    key={index}
                    step={step}
                    index={index}
                    isStudent={isStudent}
                    roadmap={roadmap}
                    updating={updating}
                    handleToggleStep={handleToggleStep}
                  />
                ))}
              </div>
            ) : (
              <Card
                className={`text-center flex flex-col items-center gap-4 p-8 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} shadow-sm`}
              >
                <div
                  className={`rounded-full p-4 w-16 h-16 flex items-center justify-center ${theme === 'dark' ? 'bg-indigo-900/30' : 'bg-blue-100'}`}
                >
                  <Lightbulb
                    className={`h-6 w-6 ${theme === 'dark' ? 'text-indigo-400' : 'text-blue-600'}`}
                  />
                </div>
                <h2
                  className={`text-xl font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}
                >
                  Sign In to Access
                </h2>
                <p
                  className={`text-sm max-w-lg mx-auto ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}
                >
                  Please sign in as a student, alumni, or admin to view the complete roadmap steps.
                </p>
              </Card>
            )}
          </div>
        </div>
      </Section>
      <ChatDialog
        chatOpen={chatOpen}
        setChatOpen={setChatOpen}
        chatQuery={chatQuery}
        setChatQuery={setChatQuery}
        chatMessages={chatMessages}
        chatLoading={chatLoading}
        handleChatSubmit={handleChatSubmit}
      />
      <ShareDialog
        roadmapId={Number(id)}
        shareDialogOpen={shareDialogOpen}
        setShareDialogOpen={setShareDialogOpen}
        handleShareRoadmap={handleShareRoadmap}
      />
    </div>
  );
}