"use client";

import { useState, useEffect, useCallback } from 'react';
import { useUser, SignOutButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from 'next-themes';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

// Icons and Utils
import { Search, Filter, Calendar, Heart, ChevronDown, BookOpen, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { ScaleLoader } from 'react-spinners';
import { cn } from '@/lib/utils';

interface Step {
  title: string;
  bullets: string[];
  link?: string;
}

interface Roadmap {
  id: number;
  title: string;
  year: number | null;
  created_at: string;
  likes: number;
  created_by: string;
  steps: Step[];
  progress?: {
    liked: boolean;
    completed_steps: number[];
  };
}

export default function StudentDashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(theme === 'dark');

  // State
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [allRoadmaps, setAllRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState<number | null>(null);

  // Sync isDarkMode with theme
  useEffect(() => {
    setIsDarkMode(theme === 'dark');
  }, [theme]);

  // Check user role
  useEffect(() => {
    if (isLoaded && user && user.publicMetadata.role !== 'student') {
      router.push('/');
      toast.error('Access Denied: Only students can access this dashboard');
    }
  }, [isLoaded, user, router]);

  // Fetch roadmaps
  const fetchRoadmaps = useCallback(async () => {
    if (!isLoaded || !user) return;

    setLoading(true);
    try {

      const res = await fetch(`/api/roadmaps?userId=${user.id}`);
      if (!res.ok) throw new Error('Failed to fetch roadmaps');

      const { data } = await res.json();
      const enrolledRoadmaps = data.filter((r: Roadmap) => r.progress);


      setRoadmaps(enrolledRoadmaps);
      setAllRoadmaps(enrolledRoadmaps);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to fetch roadmaps');
    } finally {
      setLoading(false);
    }
  }, [isLoaded, user]);

  useEffect(() => {
    fetchRoadmaps();
  }, [fetchRoadmaps]);

  // Search and filter with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      let filtered = [...allRoadmaps];

      if (searchQuery) {
        filtered = filtered.filter((roadmap) =>
          roadmap.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      if (yearFilter !== null) {
        filtered = filtered.filter((roadmap) => roadmap.year === yearFilter);
      }

      setRoadmaps(filtered);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, yearFilter, allRoadmaps]);

  const resetFilters = () => {
    setSearchQuery('');
    setYearFilter(null);
    setRoadmaps(allRoadmaps);
  };

  const availableYears = [...new Set(allRoadmaps.map((r) => r.year).filter(Boolean))].sort(
    (a, b) => Number(b) - Number(a)
  );

  // Calculate progress percentage
  const calculateProgress = (roadmap: Roadmap) => {
    const completedSteps = roadmap.progress?.completed_steps?.length || 0;
    const totalSteps = roadmap.steps.length;
    return Math.round((completedSteps / totalSteps) * 100);
  };

  // Like handler simulation
  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // toast.success('Feature coming soon!');
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'} transition-colors duration-300`}>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                My Learning Path
              </h1>
              <p className={`text-${isDarkMode ? 'slate-300' : 'slate-600'} max-w-2xl mt-2`}>
                Track your progress across enrolled career roadmaps
              </p>
            </div>

            <div className="flex items-center gap-4 self-end sm:self-auto">
              <div className="flex items-center space-x-2">
                <Switch
                  id="dark-mode"
                  checked={isDarkMode}
                  onCheckedChange={() => {
                    setIsDarkMode(!isDarkMode);
                    setTheme(isDarkMode ? 'light' : 'dark');
                  }}
                  className={isDarkMode ? 'bg-blue-600' : 'bg-blue-400'}
                />
                <Label htmlFor="dark-mode" className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>
                  {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                </Label>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className={`${isDarkMode ? 'border-slate-700 bg-slate-800 text-slate-200' : 'border-slate-200 bg-white text-slate-800'} rounded-lg`}
                  >
                    <div className={`w-5 h-5 rounded-full ${isDarkMode ? 'bg-blue-600' : 'bg-blue-500'} flex items-center justify-center text-xs font-semibold text-white`}>
                      {user?.firstName?.[0] || 'U'}
                    </div>
                    <span className="ml-2 hidden sm:inline">{user?.firstName || 'User'}</span>
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} w-56`}>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/bookmarks">Saved Roadmaps</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <SignOutButton>
                      <button className="w-full text-left cursor-pointer">Logout</button>
                    </SignOutButton>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="search"
                placeholder="Search enrolled roadmaps..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'} pl-9 rounded-lg`}
              />
            </div>

            <div className="flex gap-3 self-end sm:self-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className={`${isDarkMode ? 'border-slate-700 bg-slate-800 text-slate-200' : 'border-slate-200 bg-white text-slate-800'} gap-2 rounded-lg`}
                  >
                    <Filter className="h-4 w-4" />
                    <span className="hidden sm:inline">Filter by Year</span>
                    {yearFilter && <Badge variant="secondary" className="ml-1">{yearFilter}</Badge>}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} w-56`}>
                  <DropdownMenuLabel>Select Year</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {availableYears.map((year) => (
                    <DropdownMenuItem
                      key={year}
                      onClick={() => setYearFilter(Number(year))}
                      className="cursor-pointer"
                    >
                      {year}
                      {yearFilter === year && <span className="ml-auto">✓</span>}
                    </DropdownMenuItem>
                  ))}
                  {availableYears.length > 0 && <DropdownMenuSeparator />}
                  <DropdownMenuItem
                    onClick={resetFilters}
                    className={`${isDarkMode ? 'text-blue-400' : 'text-blue-600'} cursor-pointer`}
                  >
                    Reset filters
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                onClick={() => router.push('/roadmaps')}
                className={`${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg`}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Explore</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main>
          {loading ? (
            <div className="flex items-center justify-center h-[60vh]">
              <div className="text-center">
                <ScaleLoader color={isDarkMode ? "#6366f1" : "#3b82f6"} height={35} />
                <p className={`mt-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Loading your roadmaps...</p>
              </div>
            </div>
          ) : roadmaps.length === 0 ? (
            <div className={`rounded-lg shadow-sm border p-12 text-center ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
              <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDarkMode ? 'bg-indigo-900/30' : 'bg-blue-100'}`}>
                <BookOpen className={`h-6 w-6 ${isDarkMode ? 'text-indigo-500' : 'text-blue-500'}`} />
              </div>
              <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} mb-2`}>
                No roadmaps found
              </h3>
              <p className={`max-w-md mx-auto mb-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                {searchQuery || yearFilter !== null
                  ? 'No roadmaps match your current filters. Try adjusting your search criteria.'
                  : 'You are not enrolled in any roadmaps yet.'}
              </p>
              {(searchQuery || yearFilter !== null) ? (
                <Button
                  onClick={resetFilters}
                  variant="outline"
                  className={`${isDarkMode ? 'border-slate-700 text-slate-200' : 'border-slate-200 text-slate-800'} rounded-lg`}
                >
                  Reset Filters
                </Button>
              ) : (
                <Button
                  onClick={() => router.push('/roadmaps')}
                  className={`${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg`}
                >
                  Explore Roadmaps
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {roadmaps.map((roadmap) => {
                const progressPercentage = calculateProgress(roadmap);

                return (
                  <Link
                    href={`/roadmaps/${roadmap.id}`}
                    key={roadmap.id}
                    className="group block h-full transition-all duration-200 hover:translate-y-[-4px]"
                  >
                    <Card className={`h-full ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} shadow-sm hover:shadow-md transition overflow-hidden`}>
                      <div className={`h-2 ${progressPercentage === 100 ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-blue-500 to-indigo-600'}`}></div>
                      <CardHeader>
                        <div className="flex justify-between items-start gap-2">
                          <CardTitle className={`text-xl font-semibold ${isDarkMode ? 'text-slate-200 group-hover:text-blue-400' : 'text-slate-800 group-hover:text-blue-600'} transition line-clamp-2`}>
                            {roadmap.title}
                          </CardTitle>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => handleLike(e)}
                            className={cn(
                              'h-8 w-8 rounded-full',
                              roadmap.progress?.liked
                                ? 'text-rose-500 hover:text-rose-600 bg-rose-50 dark:bg-rose-900/20'
                                : 'text-slate-400 hover:text-rose-500'
                            )}
                          >
                            <Heart
                              className={cn(
                                'h-4 w-4',
                                roadmap.progress?.liked ? 'fill-rose-500' : ''
                              )}
                            />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {roadmap.year && (
                            <Badge variant="outline" className={`flex items-center gap-1 rounded-full ${isDarkMode ? 'border-slate-600 text-slate-300' : 'border-slate-200 text-slate-600'}`}>
                              <Calendar className="h-3 w-3" />
                              {roadmap.year}
                            </Badge>
                          )}
                          <Badge variant="outline" className={`flex items-center gap-1 rounded-full ${isDarkMode ? 'border-slate-600 text-slate-300' : 'border-slate-200 text-slate-600'}`}>
                            <Heart className="h-3 w-3 text-rose-500" />
                            {roadmap.likes}
                          </Badge>
                          <Badge
                            variant={progressPercentage === 100 ? 'default' : 'outline'}
                            className={cn(
                              'rounded-full',
                              progressPercentage === 100
                                ? isDarkMode
                                  ? 'bg-green-900/30 text-green-400'
                                  : 'bg-green-100 text-green-800'
                                : isDarkMode
                                  ? 'border-slate-600 text-slate-300'
                                  : 'border-slate-200 text-slate-600'
                            )}
                          >
                            {progressPercentage}% Complete
                          </Badge>
                        </div>

                        <div>
                          <Progress
                            value={progressPercentage}
                            className={cn(
                              'h-1.5 rounded-full',
                              progressPercentage === 100
                                ? isDarkMode
                                  ? 'bg-green-900/30'
                                  : 'bg-green-100'
                                : ''
                            )}
                          />
                        </div>

                        <div className="space-y-3">
                          {roadmap.steps.slice(0, 3).map((step, index) => (
                            <div key={index} className="flex items-start gap-2 group">
                              <Checkbox
                                checked={roadmap.progress?.completed_steps.includes(index)}
                                className="mt-1 transition-all"
                                onCheckedChange={() => {}}
                              />
                              <div>
                                <p
                                  className={cn(
                                    'text-sm font-medium',
                                    roadmap.progress?.completed_steps.includes(index)
                                      ? 'text-slate-400 line-through'
                                      : isDarkMode
                                        ? 'text-slate-200'
                                        : 'text-slate-800'
                                  )}
                                >
                                  {step.title}
                                </p>
                                {step.bullets.length > 0 && (
                                  <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} mt-0.5 line-clamp-1`}>
                                    {step.bullets[0]}
                                    {step.bullets.length > 1 && '...'}
                                  </p>
                                )}
                                {step.link && (
                                  <a
                                    href={step.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`text-xs ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'} hover:underline`}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    Learn More
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}

                          {roadmap.steps.length > 3 && (
                            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                              + {roadmap.steps.length - 3} more steps
                            </p>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className={`border-t pt-4 flex justify-between items-center ${isDarkMode ? 'border-slate-700/50' : 'border-slate-100'}`}>
                        <div className={`flex items-center text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          <Calendar className="h-3.5 w-3.5 mr-1.5" />
                          {new Date(roadmap.created_at).toLocaleDateString()}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-7 text-xs gap-1 ${isDarkMode ? 'text-slate-300 hover:text-blue-400' : 'text-slate-600 hover:text-blue-600'} rounded-lg`}
                        >
                          View Details
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </CardFooter>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}