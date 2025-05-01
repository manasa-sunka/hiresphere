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
import { 
  Heart, 
  ArrowLeft, 
  ExternalLink, 
  MessageSquareText,
  Send,
  Calendar,
  User,
  Bot,
  Loader,
  Lightbulb,
  CheckCheck,
  Share2,
  Copy
} from 'lucide-react';
import { toast } from 'sonner';
import { roadmapHelper } from '@/lib/gemini';
import Header from '@/components/misc/header';

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

const RoadmapDetail = () => {
  const { id } = useParams();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { userId } = useAuth();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatQuery, setChatQuery] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const role = user?.publicMetadata.role as string | undefined;

  useEffect(() => {
    if (isLoaded) fetchRoadmap();
  }, [isLoaded, id, userId]);

  useEffect(() => {
    // Scroll chat to bottom when new messages arrive
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

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
        ? completedSteps.filter(i => i !== stepIndex)
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
    
    // Add user message to chat
    const userMessage: ChatMessage = {
      role: 'user',
      content: chatQuery
    };
    setChatMessages(prev => [...prev, userMessage]);
    setChatQuery('');
    setChatLoading(true);
    
    try {
      const response = await roadmapHelper(
        roadmap.title,
        roadmap.year?.toString() || '',
        roadmap.steps,
        chatQuery
      );
      
      // Add assistant message to chat
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.answer
      };
      setChatMessages(prev => [...prev, assistantMessage]);
    } catch {
      toast.error('Failed to get help. Please try again.');
      
      // Add error message
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: "Sorry, I couldn't process your request. Please try again."
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleShareRoadmap = () => {
    const shareUrl = `${window.location.origin}/roadmaps/${id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Roadmap link copied to clipboard!");
    setShareDialogOpen(false);
  };

  const markAllAsCompleted = async () => {
    if (!userId || role !== 'student' || !roadmap) return;
    setUpdating(true);
    
    try {
      // Create array with all step indexes
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <Header />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <Loader className="h-10 w-10 animate-spin text-blue-500 mx-auto" />
            <p className="text-slate-600 dark:text-slate-300 mt-4">Loading roadmap...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <Header />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center max-w-md mx-auto bg-white dark:bg-slate-800 shadow-md rounded-lg p-8 border border-slate-200 dark:border-slate-700">
            <div className="bg-amber-100 dark:bg-amber-900/40 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Lightbulb className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-3">Roadmap not found</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">The roadmap you&apos;re looking for doesn&apos;t exist or has been removed.</p>
            <Button 
              variant="default"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => router.push('/roadmaps')}
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
  
  // Calculate progress percentage
  const completedStepsCount = roadmap.progress?.completed_steps.length || 0;
  const totalSteps = roadmap.steps.length;
  const progressPercentage = totalSteps > 0 ? Math.round((completedStepsCount / totalSteps) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Navigation breadcrumb */}
        <div className="mb-6">
          <Button
            variant="ghost"
            className="text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            asChild
          >
            <Link href="/roadmaps">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Roadmaps
            </Link>
          </Button>
        </div>
        
        {/* Title Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
                {roadmap.title}
              </h1>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                {roadmap.year && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1.5" />
                    <span>Year {roadmap.year}</span>
                  </div>
                )}
                <div className="h-1 w-1 rounded-full bg-slate-400 dark:bg-slate-600"></div>
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
                  className={`flex items-center gap-1.5 ${
                    roadmap.progress?.liked ?
                    'text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20' :
                    'text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                  onClick={handleToggleLike}
                  disabled={updating}
                >
                  <Heart
                    className={`h-4 w-4 ${
                      roadmap.progress?.liked ? 'fill-rose-500 text-rose-500' : ''
                    }`}
                  />
                  <span>{roadmap.likes}</span>
                </Button>
              )}
              
              <Button
                variant="outline"
                className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                onClick={() => setShareDialogOpen(true)}
              >
                <Share2 className="h-4 w-4 mr-1.5" />
                Share
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Info */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="sticky top-24">
              <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                  <CardTitle className="text-xl font-bold">Roadmap Progress</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                  {isStudent ? (
                    <>
                      <div>
                        <div className="flex items-center justify-between mb-2 text-sm">
                          <span className="text-slate-600 dark:text-slate-400 font-medium">Your progress</span>
                          <span className="font-semibold">{progressPercentage}%</span>
                        </div>
                        <Progress value={progressPercentage} className="h-2 bg-slate-200 dark:bg-slate-700" />
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                          {completedStepsCount} of {totalSteps} steps completed
                        </p>
                      </div>
                      
                      {progressPercentage < 100 && progressPercentage > 0 && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="w-full border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          onClick={markAllAsCompleted}
                          disabled={updating}
                        >
                          <CheckCheck className="h-4 w-4 mr-2" />
                          Mark all as completed
                        </Button>
                      )}
                    </>
                  ) : (
                    <div className="py-2">
                      <p className="text-slate-600 dark:text-slate-400 text-sm">
                        Sign in as a student to track your progress on this roadmap.
                      </p>
                    </div>
                  )}
                  
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
                    <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Roadmap details</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Created on</span>
                        <span className="text-slate-700 dark:text-slate-300">{new Date(roadmap.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Total steps</span>
                        <span className="text-slate-700 dark:text-slate-300">{totalSteps}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Type</span>
                        <Badge variant="outline" className="bg-transparent">
                          {roadmap.ai_generated ? 'AI Generated' : 'Expert Created'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => setChatOpen(true)}
                  >
                    <MessageSquareText className="h-4 w-4 mr-2" />
                    Get Help with This Roadmap
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            {canViewSteps ? (
              <div className="space-y-6">
                {roadmap.steps.map((step, index) => (
                  <Card
                    key={index}
                    className={`border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm transition hover:shadow ${
                      roadmap.progress?.completed_steps.includes(index) ? 
                      'border-l-4 border-l-blue-500 dark:border-l-blue-500' : ''
                    }`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        {isStudent && (
                          <Checkbox
                            checked={roadmap.progress?.completed_steps.includes(index)}
                            onCheckedChange={() => handleToggleStep(index)}
                            disabled={updating}
                            className="h-5 w-5 border-blue-500 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white"
                          />
                        )}
                        <CardTitle className="text-xl font-semibold text-blue-600 dark:text-blue-400">
                          {index + 1}. {step.title}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <ul className="space-y-2 text-slate-700 dark:text-slate-300">
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
                          className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 font-medium transition-colors"
                        >
                          Learn more
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </CardFooter>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg p-8">
                <div className="text-center flex flex-col items-center gap-4">
                  <div className="bg-amber-100 dark:bg-amber-900/40 rounded-full p-4 w-16 h-16 flex items-center justify-center">
                    <Lightbulb className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-300">
                    Sign in to Access
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
                    Please sign in as a student, alumni, or admin to view the complete roadmap steps.
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Chat Dialog */}
      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 sm:max-w-lg md:max-w-xl max-h-[95vh] flex flex-col h-[80vh]">
          <DialogHeader className="pb-4 border-b border-slate-200 dark:border-slate-700">
            <DialogTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <Bot className="h-5 w-5" />
              Roadmap Helper
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="flex-1">
            <div className="space-y-6 py-4 px-1">
              {chatMessages.length === 0 ? (
                <div className="text-center py-8">
                  <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Lightbulb className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">
                    Get guidance on this roadmap
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
                    Ask any questions about the roadmap steps, career advice, or how to progress through this path.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-md mx-auto">
                    {[
                      "How do I get started?", 
                      "What resources do you recommend?", 
                      "Is this roadmap for beginners?",
                      "How long will this take?"
                    ].map((suggestion) => (
                      <Button 
                        key={suggestion}
                        variant="outline"
                        size="sm"
                        className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                        onClick={() => setChatQuery(suggestion)}
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
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`flex items-start gap-3 max-w-[80%] ${
                          msg.role === 'user' 
                            ? 'flex-row-reverse' 
                            : 'flex-row'
                        }`}
                      >
                        <Avatar className={msg.role === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 dark:bg-slate-600'}>
                          <AvatarFallback>
                            {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div 
                          className={`p-3 rounded-lg ${
                            msg.role === 'user' 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
              
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-3 max-w-[80%]">
                    <Avatar className="bg-slate-200 dark:bg-slate-600">
                      <AvatarFallback>
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-700">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"></div>
                        <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce delay-75"></div>
                        <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce delay-150"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700 mt-auto">
            <form onSubmit={handleChatSubmit} className="flex w-full gap-2 items-end">
              <Textarea
                value={chatQuery}
                onChange={e => setChatQuery(e.target.value)}
                placeholder="Ask about this roadmap..."
                className="flex-1 resize-none min-h-[80px] bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-600 focus-visible:ring-blue-500"
              />
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                size="icon"
                disabled={chatLoading || !chatQuery.trim()}
              >
                <Send className="h-5 w-5" />
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-slate-800 dark:text-slate-200">
              Share Roadmap
            </DialogTitle>
          </DialogHeader>
          <div className="p-4 border rounded-md border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex justify-between items-center">
            <p className="text-slate-600 dark:text-slate-400 text-sm truncate">
              {`${window.location.origin}/roadmaps/${id}`}
            </p>
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-blue-600 dark:text-blue-400"
              onClick={handleShareRoadmap}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <DialogFooter className="sm:justify-start">
            <Button 
              variant="default"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleShareRoadmap}
            >
              Copy Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoadmapDetail;