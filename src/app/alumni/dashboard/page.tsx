"use client";

import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Stars, Search, Filter, Calendar, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { ScaleLoader } from 'react-spinners';
import { generateRoadmap, Step } from '@/lib/gemini';
import Link from 'next/link';
import { Label } from '@/components/ui/label';
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
  created_at: string;
  likes: number;
  created_by: string;
}

interface CreateRoadmapForm {
  title: string;
  year: string;
  steps: Step[];
}

export default function AlumniDashboard() {
  const { user } = useUser();
  const { userId } = useAuth();
  const { theme } = useTheme();
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [allRoadmaps, setAllRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState<number | null>(null);
  const [formData, setFormData] = useState<CreateRoadmapForm>({
    title: '',
    year: '',
    steps: [{ title: '', bullets: [''], link: '' }],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (user) fetchRoadmaps();
  }, [user]);

  const fetchRoadmaps = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/roadmaps');
      const data = await res.json();
      const userRoadmaps = data.data.filter((r: Roadmap) => r.created_by === userId);
      setRoadmaps(userRoadmaps);
      setAllRoadmaps(userRoadmaps);
    } catch {
      toast.error('Failed to fetch roadmaps');
    } finally {
      setLoading(false);
    }
  };

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

  const resetFilters = () => {
    setSearchQuery('');
    setYearFilter(null);
    setRoadmaps(allRoadmaps);
  };

  const availableYears = [...new Set(allRoadmaps.map(r => r.year).filter(Boolean))].sort((a, b) => Number(b) - Number(a));

  const generateSteps = async () => {
    const { title, year } = formData;
    if (!title) return;
    setIsGenerating(true);
    try {
      const steps = await generateRoadmap(title, year);
      setFormData({ ...formData, steps });
      toast.success('Steps generated successfully');
    } catch {
      toast.error('Failed to generate steps');
    } finally {
      setIsGenerating(false);
    }
  };

  const addStep = () => {
    setFormData({
      ...formData,
      steps: [...formData.steps, { title: '', bullets: [''], link: '' }],
    });
  };

  const addBullet = (stepIndex: number) => {
    const steps = [...formData.steps];
    steps[stepIndex].bullets.push('');
    setFormData({ ...formData, steps });
  };

  const updateStep = (index: number, field: keyof Step, value: string | string[]) => {
    const steps = [...formData.steps];
    steps[index][field] = value as string & string[];
    setFormData({ ...formData, steps });
  };

  const updateBullet = (stepIndex: number, bulletIndex: number, value: string) => {
    const steps = [...formData.steps];
    steps[stepIndex].bullets[bulletIndex] = value;
    setFormData({ ...formData, steps });
  };

  const handleCreateRoadmap = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        year: formData.year ? parseInt(formData.year) : null,
        ai_generated: true,
        steps: formData.steps.map(step => ({
          title: step.title,
          bullets: step.bullets.filter(b => b.trim()),
          link: step.link || undefined,
        })),
      };
      const res = await fetch('/api/roadmaps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const newRoadmap = (await res.json()).data;
        setRoadmaps([newRoadmap, ...roadmaps]);
        setAllRoadmaps([newRoadmap, ...allRoadmaps]);
        toast.success('Roadmap created');
        setFormData({ title: '', year: '', steps: [{ title: '', bullets: [''], link: '' }] });
        setDialogOpen(false);
      } else {
        toast.error((await res.json()).error || 'Failed to create roadmap');
      }
    } catch {
      toast.error('Failed to create roadmap');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRoadmap = async (id: number) => {
    if (!confirm('Delete this roadmap?')) return;
    try {
      const res = await fetch(`/api/roadmaps?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setRoadmaps(roadmaps.filter(r => r.id !== id));
        setAllRoadmaps(allRoadmaps.filter(r => r.id !== id));
        toast.success('Roadmap deleted');
      } else {
        toast.error((await res.json()).error || 'Failed to delete roadmap');
      }
    } catch {
      toast.error('Failed to delete roadmap');
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'} transition-colors duration-300`}>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                Alumni Dashboard
              </h1>
              <p className={`text-sm max-w-2xl mt-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                Manage your career roadmaps and share your expertise with the community.
              </p>
            </div>
           
          </div>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="search"
                placeholder="Search your roadmaps..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-400' : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-500'} pl-9 rounded-lg`}
              />
            </div>
            <div className="flex gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className={`${theme === 'dark' ? 'border-slate-700 bg-slate-800 text-slate-200' : 'border-slate-200 bg-white text-slate-800'} gap-2 rounded-lg`}>
                    <Filter className="h-4 w-4" />
                    <span>Filter by Year</span>
                    {yearFilter && <Badge variant="secondary" className="ml-1">{yearFilter}</Badge>}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'} w-56`}>
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
              <Button
                onClick={() => setDialogOpen(true)}
                className={`${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg`}
              >
                <Plus className="h-4 w-4 mr-2" /> Create Roadmap
              </Button>
            </div>
          </div>
        </header>
        <main>
          {loading ? (
            <div className="flex items-center justify-center h-[60vh]">
              <div className="text-center">
                <ScaleLoader color={theme === 'dark' ? '#6366f1' : '#3b82f6'} height={35} />
                <p className={`mt-4 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>Loading roadmaps...</p>
              </div>
            </div>
          ) : roadmaps.length === 0 ? (
            <Card className={`rounded-lg border p-12 text-center ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
              <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${theme === 'dark' ? 'bg-indigo-900/30' : 'bg-blue-100'}`}>
                <Filter className={`h-6 w-6 ${theme === 'dark' ? 'text-indigo-500' : 'text-blue-500'}`} />
              </div>
              <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'} mb-2`}>No roadmaps found</h3>
              <p className={`max-w-md mx-auto mb-6 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                {searchQuery || yearFilter !== null
                  ? "No roadmaps match your current filters. Try adjusting your search criteria."
                  : "Create your first roadmap to share your career journey."}
              </p>
              {(searchQuery || yearFilter !== null) && (
                <Button onClick={resetFilters} variant="outline" className={`${theme === 'dark' ? 'border-slate-700 text-slate-200 hover:bg-slate-700' : 'border-slate-200 text-slate-800 hover:bg-slate-50'} rounded-lg`}>
                  Reset Filters
                </Button>
              )}
              {!searchQuery && yearFilter === null && (
                <Button
                  onClick={() => setDialogOpen(true)}
                  className={`${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg mt-4`}
                >
                  <Plus className="h-4 w-4 mr-2" /> Create Your First Roadmap
                </Button>
              )}
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {roadmaps.map((roadmap) => (
                <Link href={`/roadmaps/${roadmap.id}`} key={roadmap.id} className="group">
                  <Card className={`h-full ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} shadow-sm hover:shadow-md transition overflow-hidden`}>
                    <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                    <CardHeader>
                      <CardTitle className={`text-xl font-semibold ${theme === 'dark' ? 'text-slate-200 group-hover:text-blue-400' : 'text-slate-800 group-hover:text-blue-600'} transition line-clamp-2`}>
                        {roadmap.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className={`flex items-center text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                        <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                        <span>Year: {roadmap.year || 'Not specified'}</span>
                      </div>
                      <div className={`flex items-center text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                        <Heart className="h-4 w-4 mr-2 text-rose-500" />
                        <span>{roadmap.likes} Likes</span>
                      </div>
                    </CardContent>
                    <CardFooter className={`border-t pt-4 flex justify-between items-center ${theme === 'dark' ? 'border-slate-700/50' : 'border-slate-100'}`}>
                      <div className={`flex items-center text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                        <Calendar className="h-3.5 w-3.5 mr-1.5" />
                        <span>{new Date(roadmap.created_at).toLocaleDateString()}</span>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          handleDeleteRoadmap(roadmap.id);
                        }}
                        className={`${theme === 'dark' ? 'bg-red-600/70 hover:bg-red-700' : 'bg-red-100 text-red-600 hover:bg-red-200'} rounded-lg`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </main>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'} sm:max-w-lg max-h-[80vh] overflow-y-auto rounded-lg shadow-lg`}>
            <DialogHeader>
              <DialogTitle className={`text-2xl ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>Create Roadmap</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateRoadmap} className="space-y-6">
              <div className="space-y-2">
                <Label className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>Title</Label>
                <div className="flex items-center gap-3">
                  <Input
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    required
                    className={`${theme === 'dark' ? 'bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-500'} rounded-lg`}
                    placeholder="e.g., Web Development"
                  />
                  <Button
                    type="button"
                    onClick={generateSteps}
                    className={`${theme === 'dark' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'} rounded-lg shadow-md`}
                    disabled={!formData.title || isGenerating}
                  >
                    {isGenerating ? (
                      <ScaleLoader color="#f1f5f9" height={20} />
                    ) : (
                      <>
                        <Stars className="h-4 w-4 mr-2" /> Generate
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>Year (1-4)</Label>
                <Input
                  type="number"
                  value={formData.year}
                  onChange={e => setFormData({ ...formData, year: e.target.value })}
                  min="1"
                  max="4"
                  className={`${theme === 'dark' ? 'bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-500'} rounded-lg`}
                  placeholder="e.g., 1"
                />
              </div>
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                <h3 className={`text-lg font-medium mb-3 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>Roadmap Steps</h3>
                {formData.steps.map((step, stepIndex) => (
                  <div key={stepIndex} className={`space-y-4 mb-4 p-4 rounded-lg ${theme === 'dark' ? 'bg-slate-800/50 border border-slate-600/20' : 'bg-white border border-slate-100 shadow-sm'}`}>
                    <h4 className={`font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>Step {stepIndex + 1}</h4>
                    <div className="space-y-2">
                      <Label className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>Title</Label>
                      <Input
                        value={step.title}
                        onChange={e => updateStep(stepIndex, 'title', e.target.value)}
                        required
                        className={`${theme === 'dark' ? 'bg-slate-700 border-slate-600 text-slate-200' : 'bg-slate-900/10 hover:bg-slate-800/30'} rounded-lg transition-colors duration-300`}
                        placeholder="e.g., Learn HTML"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className={`text-sm font-medium flex justify-between ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                        <span>Bullets</span>
                        <Button
                          type="button"
                          onClick={() => addBullet(stepIndex)}
                          className={`${theme === 'dark' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'} text-xs py-1 h-6 rounded-lg shadow-sm`}
                        >
                          <Plus className="h-3 w-3 mr-1" /> Add Bullet
                        </Button>
                      </Label>
                      {step.bullets.map((bullet, bulletIndex) => (
                        <Input
                          key={bulletIndex}
                          value={bullet}
                          onChange={e => updateBullet(stepIndex, bulletIndex, e.target.value)}
                          required
                          className={`${theme === 'dark' ? 'bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-500'} rounded-lg mt-2`}
                          placeholder={`Bullet ${bulletIndex + 1}`}
                        />
                      ))}
                    </div>
                    <div className="space-y-2">
                      <Label className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>Link (Optional)</Label>
                      <Input
                        type="url"
                        value={step.link}
                        onChange={e => updateStep(stepIndex, 'link', e.target.value)}
                        className={`${theme === 'dark' ? 'bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-500'} rounded-lg`}
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={addStep}
                  className={`${theme === 'dark' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'} rounded-lg shadow-md w-full`}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Step
                </Button>
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  className={`${theme === 'dark' ? 'border-slate-700 text-slate-200 hover:bg-slate-700' : 'border-slate-200 text-slate-800 hover:bg-slate-50'} rounded-lg`}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className={`${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} rounded-lg`}
                >
                  {isSubmitting ? <ScaleLoader color="#f1f5f9" height={20} /> : 'Create Roadmap'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}