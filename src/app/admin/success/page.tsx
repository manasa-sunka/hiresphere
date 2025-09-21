"use client";

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Search, UserPlus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ScaleLoader, ClipLoader } from 'react-spinners';

// Types
interface SuccessStory {
  id: number;
  name: string;
  post: string;
  batch: number;
  followed_roadmap: string;
  connect_link: string;
  created_at: string;
  image_url: string | null;
}

interface Roadmap {
  id: number;
  title: string;
}

interface CreateSuccessStoryForm {
  name: string;
  post: string;
  batch: string;
  followed_roadmap: string;
  connect_link: string;
  image_url: string | null;
}

// Loading Spinner Component
const LoadingSpinner = ({ theme }: { theme: string }) => (
  <div className="flex flex-col items-center justify-center h-[60vh]">
    <ScaleLoader color={theme === 'dark' ? '#60A5FA' : '#2563EB'} height={35} />
    <p className={`mt-4 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>Loading...</p>
  </div>
);

// Page Component
export default function SuccessStoriesPage() {
  const { theme } = useTheme();
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<CreateSuccessStoryForm>({
    name: '',
    post: '',
    batch: '',
    followed_roadmap: '',
    connect_link: '',
    image_url: null,
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch success stories and roadmaps
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        // Fetch success stories
        const storiesResponse = await fetch('/api/success-stories');
        if (!storiesResponse.ok) {
          throw new Error(`Failed to fetch success stories: ${storiesResponse.statusText}`);
        }
        const storiesData = await storiesResponse.json();
        if (Array.isArray(storiesData)) {
          setStories(storiesData);
        } else {
          console.error('Stories data is not an array:', storiesData);
          setStories([]);
          toast.error('Invalid success stories data format');
        }
  
        // Fetch roadmaps for dropdown
        const roadmapsResponse = await fetch('/api/roadmaps');
        if (!roadmapsResponse.ok) {
          throw new Error(`Failed to fetch roadmaps: ${roadmapsResponse.statusText}`);
        }
        const roadmapsData = await roadmapsResponse.json();
        console.log('Roadmaps data:', roadmapsData); // Debug log
  
        const roadmapsArray = Array.isArray(roadmapsData?.data) ? roadmapsData.data : null;
        if (roadmapsArray) {
          setRoadmaps(roadmapsArray);
        } else {
          console.error('Roadmaps data is not an array:', roadmapsData);
          setRoadmaps([]);
          toast.error('No roadmaps available. Please contact support.');
        }
  
      } catch (error) {
        console.error('Fetch error:', error);
        toast.error('Failed to load data. Please try again later.');
        setStories([]);
        setRoadmaps([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);
  
  // Handle form submission
  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/success-stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          batch: parseInt(formData.batch),
          followed_roadmap: formData.followed_roadmap,
          connect_link: `mailto:${formData.connect_link}`,
        }),
      });
      if (response.ok) {
        const newStory = await response.json();
        setStories([newStory, ...stories]);
        toast.success('Success story created successfully');
        setFormData({
          name: '',
          post: '',
          batch: '',
          followed_roadmap: '',
          connect_link: '',
          image_url: null,
        });
        setDialogOpen(false);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create success story');
      }
    } catch {
      toast.error('Failed to create success story');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete story
  const handleDeleteStory = async (id: number) => {
    try {
      const response = await fetch('/api/success-stories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (response.ok) {
        setStories(stories.filter((story) => story.id !== id));
        toast.success('Success story deleted successfully');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete success story');
      }
    } catch {
      toast.error('Failed to delete success story');
    }
  };

  // Filter stories
  const filteredStories = stories.filter(
    (story) =>
      story.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.post.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.followed_roadmap.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'} transition-colors duration-300`}>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                Success Stories
              </h1>
              <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                Manage inspiring success stories from our community.
              </p>
            </div>
            
          </div>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="search"
                placeholder="Search success stories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-400' : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-500'} pl-9 rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-colors`}
              />
            </div>
            <Button
              onClick={() => setDialogOpen(true)}
              className={`${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg hover:scale-105 transition-transform`}
            >
              <UserPlus className="h-4 w-4 mr-2" /> Add Success Story
            </Button>
          </div>
        </header>
        <main>
          {isLoading ? (
            <LoadingSpinner theme={theme as string} />
          ) : (
            <Card className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} hover:shadow-lg transition-shadow`}>
              <CardHeader>
                <CardTitle className={theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}>Success Stories</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredStories.length === 0 ? (
                  <div className={`text-center py-12 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    <UserPlus className={`mx-auto w-16 h-16 rounded-full p-4 mb-4 ${theme === 'dark' ? 'bg-indigo-900/30 text-indigo-500' : 'bg-blue-100 text-blue-500'}`} />
                    <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'} mb-2`}>No success stories found</h3>
                    <p className="mb-6">
                      {searchTerm ? 'No success stories match your search.' : 'No success stories available.'}
                    </p>
                    {!searchTerm && (
                      <Button
                        onClick={() => setDialogOpen(true)}
                        className={`${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg hover:scale-105 transition-transform`}
                      >
                        Add Success Story
                      </Button>
                    )}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className={theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}>Name</TableHead>
                        <TableHead className={theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}>Post</TableHead>
                        <TableHead className={theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}>Batch</TableHead>
                        <TableHead className={theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}>Followed Roadmap</TableHead>
                        <TableHead className={theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}>Connect</TableHead>
                        <TableHead className={theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}>Created At</TableHead>
                        <TableHead className={theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStories.map((story) => (
                        <TableRow key={story.id} className={`hover:bg-slate-700/30 dark:hover:bg-slate-700/30 transition-colors`}>
                          <TableCell className={theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}>{story.name}</TableCell>
                          <TableCell className={theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}>{story.post}</TableCell>
                          <TableCell className={theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}>{story.batch}</TableCell>
                          <TableCell className={theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}>{story.followed_roadmap}</TableCell>
                          <TableCell>
                            <a
                              href={story.connect_link}
                              className={`text-blue-500 hover:underline hover:text-blue-400 transition-colors`}
                            >
                              Contact
                            </a>
                          </TableCell>
                          <TableCell className={theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}>{story.created_at}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteStory(story.id)}
                              className={`${theme === 'dark' ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20' : 'text-red-600 hover:text-red-500 hover:bg-red-100'} rounded-full transition-colors`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}
        </main>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent
            className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'} sm:max-w-md rounded-lg shadow-lg`}
          >
            <DialogHeader>
              <DialogTitle className={`text-2xl ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>Add Success Story</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateStory} className="space-y-4">
              <div>
                <Label htmlFor="name" className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                  Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className={`${theme === 'dark' ? 'bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-500'} rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-colors`}
                />
              </div>
              <div>
                <Label htmlFor="post" className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                  Post
                </Label>
                <Input
                  id="post"
                  value={formData.post}
                  onChange={(e) => setFormData({ ...formData, post: e.target.value })}
                  required
                  className={`${theme === 'dark' ? 'bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-500'} rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-colors`}
                />
              </div>
              <div>
                <Label htmlFor="batch" className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                  Batch (Year)
                </Label>
                <Input
                  id="batch"
                  type="number"
                  value={formData.batch}
                  onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                  required
                  min="1900"
                  max={new Date().getFullYear()}
                  className={`${theme === 'dark' ? 'bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-500'} rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-colors`}
                />
              </div>
              <div>
                <Label htmlFor="followed_roadmap" className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                  Followed Roadmap
                </Label>
                <Select
                  value={formData.followed_roadmap}
                  onValueChange={(value) => setFormData({ ...formData, followed_roadmap: value })}
                >
                  <SelectTrigger
                    className={`${theme === 'dark' ? 'bg-slate-700 border-slate-600 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'} rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-colors`}
                  >
                    <SelectValue placeholder="Select roadmap" />
                  </SelectTrigger>
                  <SelectContent
                    className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'}`}
                  >
                    {Array.isArray(roadmaps) && roadmaps.length > 0 ? (
                      roadmaps.map((roadmap) => (
                        <SelectItem key={roadmap.id} value={roadmap.title}>
                          {roadmap.title}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="0" disabled>
                        No roadmaps available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="connect_link" className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                  Connect Email
                </Label>
                <Input
                  id="connect_link"
                  type="email"
                  value={formData.connect_link}
                  onChange={(e) => setFormData({ ...formData, connect_link: e.target.value })}
                  required
                  placeholder="john.doe@gmail.com"
                  className={`${theme === 'dark' ? 'bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-500'} rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-colors`}
                />
              </div><div>
                <Label htmlFor="image_url" className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                  Image URL (optional)
                </Label>
                <Input
                  id="image_url"
                  type="text"
                  value={formData.image_url as string}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  required
                  placeholder="https://i.insider.com/63ca78a6eee94d001a791149?width=700"
                  className={`${theme === 'dark' ? 'bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-500'} rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-colors`}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setDialogOpen(false)}
                  className={`${theme === 'dark' ? 'border-slate-700 text-slate-200 hover:bg-slate-700' : 'border-slate-200 text-slate-800 hover:bg-slate-50'} rounded-lg hover:scale-105 transition-transform`}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !formData.followed_roadmap}
                  className={`${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg hover:scale-105 transition-transform`}
                >
                  {isSubmitting ? <ClipLoader color="#f1f5f9" size={20} /> : 'Add Story'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}