// /app/roadmaps/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Calendar,
  User,
  Loader,
  Heart,
  Filter,
  Search,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/misc/header';
import { useTheme } from 'next-themes';

// Roadmap Interface
interface Roadmap {
  id: number;
  title: string;
  year: number | null;
  ai_generated: boolean;
  created_by: string;
  created_at: string;
  likes: number;
}

// Section Wrapper
const Section = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <section className={`py-8 ${className}`}>
    <div className="container mx-auto px-4 max-w-7xl">{children}</div>
  </section>
);

// Roadmap Card Component
const RoadmapCard = ({ roadmap }: { roadmap: Roadmap }) => {
  const { theme } = useTheme();
  return (
    <Link href={`/roadmaps/${roadmap.id}`} className="group">
      <Card
        className={`h-full relative overflow-hidden ${
          theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
        } shadow-sm hover:shadow-md transition-shadow duration-300`}
      >
        <div className="absolute top-0 left-0 h-2 w-full bg-gradient-to-r from-blue-500 to-indigo-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
        <CardHeader>
          <CardTitle
            className={`text-xl font-semibold line-clamp-2 ${
              theme === 'dark'
                ? 'text-slate-200 group-hover:text-blue-400'
                : 'text-slate-800 group-hover:text-blue-600'
            } transition-colors duration-200`}
          >
            {roadmap.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div
            className={`flex items-center text-sm ${
              theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            <Calendar className="h-4 w-4 mr-2 text-slate-400" />
            <span>Year: {roadmap.year || 'Not specified'}</span>
          </div>
          <div
            className={`flex items-center text-sm ${
              theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            <User className="h-4 w-4 mr-2 text-slate-400" />
            <span>
              By:{' '}
              <Link
                href={`/users/${roadmap.created_by}`}
                className={`${
                  theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-500'
                } hover:underline`}
              >
                {roadmap.created_by}
              </Link>
            </span>
          </div>
        </CardContent>
        <CardFooter
          className={`border-t pt-4 flex justify-between items-center ${
            theme === 'dark' ? 'border-slate-700/50' : 'border-slate-100'
          }`}
        >
          <div
            className={`flex items-center text-sm ${
              theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            <Calendar className="h-3.5 w-3.5 mr-1.5" />
            <span>{new Date(roadmap.created_at).toLocaleDateString()}</span>
          </div>
          <div
            className={`flex items-center text-sm font-medium ${
              theme === 'dark' ? 'text-rose-400' : 'text-rose-500'
            }`}
          >
            <Heart className="h-3.5 w-3.5 mr-1.5 fill-current" />
            <span>{roadmap.likes}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

// Search and Filter Component
const SearchFilter = ({
  searchQuery,
  setSearchQuery,
  yearFilter,
  setYearFilter,
  availableYears,
  resetFilters,
  role,
}: {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  yearFilter: number | null;
  setYearFilter: (value: number | null) => void;
  availableYears: number[];
  resetFilters: () => void;
  role?: string;
}) => {
  const { theme } = useTheme();
  return (
    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center mb-8">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          type="search"
          placeholder="Search roadmaps..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`pl-9 rounded-lg ${
            theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
          }`}
          aria-label="Search roadmaps"
        />
      </div>
      <div className="flex gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className={`gap-2 rounded-lg ${
                theme === 'dark' ? 'border-slate-700 bg-slate-800 text-slate-200' : 'border-slate-200 bg-white text-slate-800'
              }`}
            >
              <Filter className="h-4 w-4" />
              <span>Filter by Year</span>
              {yearFilter && <Badge variant="secondary" className="ml-1">{yearFilter}</Badge>}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} w-56`}
          >
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
              className={`${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} cursor-pointer`}
            >
              Reset filters
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {role === 'alumni' && (
          <Button
            className={`${
              theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'
            } text-white rounded-lg`}
            asChild
          >
            <Link href="/alumni/dashboard" aria-label="Create Roadmap">
              <Plus className="h-4 w-4 mr-2" />
              Create Roadmap
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
};

// Empty State Component
const EmptyState = ({
  searchQuery,
  yearFilter,
  resetFilters,
  role,
}: {
  searchQuery: string;
  yearFilter: number | null;
  resetFilters: () => void;
  role?: string;
}) => {
  const { theme } = useTheme();
  return (
    <div
      className={`rounded-lg shadow-sm border p-12 text-center ${
        theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
      }`}
    >
      <div
        className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
          theme === 'dark' ? 'bg-amber-900/30' : 'bg-amber-100'
        }`}
      >
        <Filter className={`h-6 w-6 ${theme === 'dark' ? 'text-amber-500' : 'text-amber-600'}`} />
      </div>
      <h3
        className={`text-xl font-semibold ${
          theme === 'dark' ? 'text-slate-200' : 'text-slate-800'
        } mb-2`}
      >
        No roadmaps found
      </h3>
      <p
        className={`text-sm max-w-md mx-auto mb-6 ${
          theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
        }`}
      >
        {searchQuery || yearFilter !== null
          ? 'No roadmaps match your current filters. Try adjusting your search criteria.'
          : 'There are no roadmaps available at the moment.'}
      </p>
      {(searchQuery || yearFilter !== null) && (
        <Button
          onClick={resetFilters}
          variant="outline"
          className={`${
            theme === 'dark' ? 'border-slate-700 text-slate-200' : 'border-slate-200 text-slate-800'
          } rounded-lg`}
        >
          Reset Filters
        </Button>
      )}
      {role === 'alumni' && !searchQuery && yearFilter === null && (
        <Button
          className={`${
            theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'
          } text-white rounded-lg mt-4`}
          asChild
        >
          <Link href="/alumni/dashboard" aria-label="Create Your First Roadmap">
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Roadmap
          </Link>
        </Button>
      )}
    </div>
  );
};

// Main Roadmaps Page Component
export default function RoadmapsPage() {
  const { user, isLoaded } = useUser();
  const { userId } = useAuth();
  const { theme, setTheme } = useTheme();
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [allRoadmaps, setAllRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState<number | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(theme === 'dark');
  const role = user?.publicMetadata.role as string | undefined;

  // Sync dark mode state with theme
  useEffect(() => {
    setIsDarkMode(theme === 'dark');
  }, [theme]);

  // Fetch roadmaps
  useEffect(() => {
    if (isLoaded) fetchRoadmaps();
  }, [isLoaded, userId]);

  const fetchRoadmaps = async () => {
    setLoading(true);
    try {
      const url = userId ? `/api/roadmaps?userId=${userId}` : '/api/roadmaps';
      const res = await fetch(url);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to fetch roadmaps');
      }
      const { data } = await res.json();
      setRoadmaps(data);
      setAllRoadmaps(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to fetch roadmaps');
    } finally {
      setLoading(false);
    }
  };

  // Search and filter functions
  useEffect(() => {
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
  }, [searchQuery, yearFilter, allRoadmaps]);

  // Filter reset
  const resetFilters = () => {
    setSearchQuery('');
    setYearFilter(null);
    setRoadmaps(allRoadmaps);
  };

  // Get available years for filtering
  const availableYears = [...new Set(allRoadmaps.map((r) => r.year).filter(Boolean))].sort(
    (a, b) => Number(b) - Number(a)
  );

  // Loading state
  if (loading) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <Header />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <Loader
              className={`h-10 w-10 animate-spin ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-500'
              } mx-auto`}
            />
            <p
              className={`text-sm mt-4 ${
                theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              Loading roadmaps...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'} pb-16 transition-colors duration-300`}>
      <Header />
      <Section>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1
              className={`text-3xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-slate-800'
              } mb-2 animate-fade-in`}
            >
              Career Roadmaps
            </h1>
            <p
              className={`text-sm max-w-3xl ${
                theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
              } animate-fade-in-up`}
            >
              Explore curated career roadmaps to guide your professional journey, created by industry experts and successful alumni.
            </p>
          </div>
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
        <SearchFilter
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          yearFilter={yearFilter}
          setYearFilter={setYearFilter}
          availableYears={availableYears.filter((year): year is number => year !== null)}
          resetFilters={resetFilters}
          role={role}
        />
        {roadmaps.length === 0 ? (
          <EmptyState
            searchQuery={searchQuery}
            yearFilter={yearFilter}
            resetFilters={resetFilters}
            role={role}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {roadmaps.map((roadmap) => (
              <RoadmapCard key={roadmap.id} roadmap={roadmap} />
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
