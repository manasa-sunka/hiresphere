"use client";

import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  User, 
  Loader, 
  Heart,
  Filter,
  Search,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import Header from '@/components/misc/header';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';

interface Roadmap {
  id: number;
  title: string;
  year: number | null;
  ai_generated: boolean;
  created_by: string;
  created_at: string;
  likes: number;
}

const RoadmapsPage = () => {
  const { user, isLoaded } = useUser();
  const { userId } = useAuth();
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [allRoadmaps, setAllRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState<number | null>(null);
  const role = user?.publicMetadata.role as string | undefined;

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
      filtered = filtered.filter(roadmap => 
        roadmap.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (yearFilter !== null) {
      filtered = filtered.filter(roadmap => roadmap.year === yearFilter);
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
  const availableYears = [...new Set(allRoadmaps.map(r => r.year).filter(Boolean))].sort((a, b) => Number(b) - Number(a));

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <Header />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <Loader className="h-10 w-10 animate-spin text-blue-500 mx-auto" />
            <p className="text-slate-600 dark:text-slate-300 mt-4">Loading roadmaps...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-16">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
            Career Roadmaps
          </h1>
          <p className="text-slate-600 dark:text-slate-300 max-w-3xl">
            Explore curated career roadmaps to guide your professional journey, created by industry experts and successful alumni.
          </p>
        </div>
        
        {/* Search and filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 items-start md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Search roadmaps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>
          
          <div className="flex gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 border-slate-200 dark:border-slate-700">
                  <Filter className="h-4 w-4" />
                  <span>Filter by Year</span>
                  {yearFilter && <Badge variant="secondary" className="ml-1">{yearFilter}</Badge>}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
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
                  className="text-blue-600 dark:text-blue-400 cursor-pointer"
                >
                  Reset filters
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {role === 'alumni' && (
              <Button className="bg-blue-600 hover:bg-blue-700 text-white" asChild>
                <Link href="/alumni">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Roadmap
                </Link>
              </Button>
            )}
          </div>
        </div>
        
        {/* Roadmaps grid */}
        {roadmaps.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
              <Filter className="h-6 w-6 text-amber-600 dark:text-amber-500" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">No roadmaps found</h3>
            <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-6">
              {searchQuery || yearFilter !== null 
                ? "No roadmaps match your current filters. Try adjusting your search criteria."
                : "There are no roadmaps available at the moment."}
            </p>
            {(searchQuery || yearFilter !== null) && (
              <Button onClick={resetFilters} variant="outline">
                Reset Filters
              </Button>
            )}
            {role === 'alumni' && !searchQuery && yearFilter === null && (
              <Button className="bg-blue-600 hover:bg-blue-700 text-white" asChild>
                <Link href="/alumni">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Roadmap
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {roadmaps.map((roadmap) => (
              <Link href={`/roadmaps/${roadmap.id}`} key={roadmap.id} className="group">
                <Card className="h-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition line-clamp-2">
                      {roadmap.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                      <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                      <span>Year: {roadmap.year || 'Not specified'}</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                      <User className="h-4 w-4 mr-2 text-slate-400" />
                      <span>By: <Link className='hover:underline hover:text-blue-500' href={`/users/${roadmap.created_by}`}>{roadmap.created_by}</Link></span>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-slate-100 dark:border-slate-700/50 pt-4 flex justify-between items-center">
                    <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                      <Calendar className="h-3.5 w-3.5 mr-1.5" />
                      <span>{new Date(roadmap.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-rose-500 dark:text-rose-400 text-sm font-medium">
                      <Heart className="h-3.5 w-3.5 mr-1.5 fill-rose-500 text-rose-500" />
                      <span>{roadmap.likes}</span>
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default RoadmapsPage;