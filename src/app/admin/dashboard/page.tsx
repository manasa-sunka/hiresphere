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
import { Search, UserPlus, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { ScaleLoader, ClipLoader } from 'react-spinners';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Types
interface UserResponse {
  createdAt: number;
  id: string;
  email: string;
  fullName: string | null;
  role: 'admin' | 'student' | 'alumni';
}

interface CreateUserForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'admin' | 'student' | 'alumni';
}

interface RoadmapTableData {
  title: string;
  year: number | null;
  ai_generated: 'AI' | 'User';
  created_by: string;
  created_at: string;
  likes: number;
}

interface RoadmapStats {
  totalRoadmaps: number;
  aiVsUser: { name: string; value: number }[];
  byYear: { year: number; count: number }[];
}

interface ApiResponse {
  users: UserResponse[];
  roadmapData: {
    table: RoadmapTableData[];
    stats: RoadmapStats;
  };
}

// Loading Spinner Component
const LoadingSpinner = ({ theme }: { theme: string }) => (
  <div className="flex flex-col items-center justify-center h-[60vh]">
    <ScaleLoader color={theme === 'dark' ? '#60A5FA' : '#2563EB'} height={35} />
    <p className={`mt-4 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>Loading...</p>
  </div>
);


// Chart Skeleton Component
const ChartSkeleton = ({ theme }: { theme: string }) => (
  <Card className={`${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-100/50 border-slate-200'}`}>
    <CardHeader>
      <div className={`h-5 w-40 ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-300'} rounded animate-pulse`}></div>
    </CardHeader>
    <CardContent>
      <div className={`h-64 w-full ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-200'} rounded flex items-center justify-center`}>
        <ClipLoader color={theme === 'dark' ? '#60A5FA' : '#2563EB'} size={40} />
      </div>
    </CardContent>
  </Card>
);

export default function AdminDashboard() {
  const { theme } = useTheme();
  const [data, setData] = useState<ApiResponse>({ users: [], roadmapData: { table: [], stats: { totalRoadmaps: 0, aiVsUser: [], byYear: [] } } });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState<number | null>(null);
  const [sortField, setSortField] = useState<keyof UserResponse>('fullName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [formData, setFormData] = useState<CreateUserForm>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'student',
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch data from /api/users
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const response = await fetch('/api/users');
        if (!response.ok) throw new Error('Failed to fetch data');
        const json = await response.json();
        setData(json);
      } catch {
        toast.error('Failed to fetch admin data');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // Handle form submission
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const newUser = await response.json();
        setData((prev) => ({
          ...prev,
          users: [newUser, ...prev.users],
        }));
        toast.success('User created successfully');
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          role: 'student',
        });
        setDialogOpen(false);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create user');
      }
    } catch {
      toast.error('Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle sorting
  const handleSort = (field: keyof UserResponse) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filter and sort users
  const filteredUsers = data.users
    .filter((user) =>
      (user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (yearFilter === null || user.role === 'admin')
    )
    .sort((a, b) => {
      const aValue = a[sortField] || '';
      const bValue = b[sortField] || '';
      return sortOrder === 'asc'
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });

  // Filter roadmaps
  const filteredRoadmaps = data.roadmapData.table.filter(
    (roadmap) => yearFilter === null || roadmap.year === yearFilter
  );

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setYearFilter(null);
  };

  // Available years for filter
  const availableYears = [...new Set(data.roadmapData.table.map((r) => r.year).filter(Boolean))].sort(
    (a, b) => Number(b) - Number(a)
  );

  // User statistics
  const userStats = {
    totalUsers: data.users.length,
    adminCount: data.users.filter((user) => user.role === 'admin').length,
    studentCount: data.users.filter((user) => user.role === 'student').length,
    alumniCount: data.users.filter((user) => user.role === 'alumni').length,
  };

  // Role distribution for pie chart
  const roleDistribution = [
    { name: 'Admin', value: userStats.adminCount },
    { name: 'Student', value: userStats.studentCount },
    { name: 'Alumni', value: userStats.alumniCount },
  ];

  // User growth trend (last 6 months)
  const getUserGrowthData = () => {
    const monthData = new Array(6).fill(0).map((_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return {
        month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
        count: 0,
      };
    }).reverse();

    data.users.forEach((user) => {
      const userDate = new Date(user.createdAt || Date.now());
      const monthIndex = monthData.findIndex((item) => {
        const itemDate = new Date(item.month);
        return itemDate.getMonth() === userDate.getMonth() && itemDate.getFullYear() === userDate.getFullYear();
      });
      if (monthIndex !== -1) {
        monthData[monthIndex].count++;
      }
    });

    return monthData;
  };

  // Chart colors
  const COLORS = theme === 'dark' ? ['#60A5FA', '#F87171', '#34D399'] : ['#2563EB', '#DC2626', '#059669'];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'} transition-colors duration-300`}>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                Admin Dashboard
              </h1>
              <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                Manage users and oversee career roadmaps.
              </p>
            </div>
          
          </div>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="search"
                placeholder="Search users or roadmaps..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-400' : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-500'} pl-9 rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-colors`}
              />
            </div>
            <div className="flex gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className={`${theme === 'dark' ? 'border-slate-700 bg-slate-800 text-slate-200' : 'border-slate-200 bg-white text-slate-800'} gap-2 rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-colors`}
                  >
                    <Filter className="h-4 w-4" />
                    <span>Filter by Year</span>
                    {yearFilter && <span className="ml-1 bg-indigo-600 text-white px-2 py-1 rounded-full text-xs">{yearFilter}</span>}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'} w-56`}
                >
                  <DropdownMenuLabel>Select Year</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {availableYears.map((year) => (
                    <DropdownMenuItem
                      key={year}
                      onClick={() => setYearFilter(Number(year))}
                      className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      {year}
                      {yearFilter === year && <span className="ml-auto">✓</span>}
                    </DropdownMenuItem>
                  ))}
                  {availableYears.length > 0 && <DropdownMenuSeparator />}
                  <DropdownMenuItem
                    onClick={resetFilters}
                    className={`${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700`}
                  >
                    Reset filters
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                onClick={() => setDialogOpen(true)}
                className={`${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg hover:scale-105 transition-transform`}
              >
                <UserPlus className="h-4 w-4 mr-2" /> Create User
              </Button>
            </div>
          </div>
        </header>
        <main>
          {isLoading ? (
            <LoadingSpinner theme={theme as string} />
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {isLoading ? (
                  <>
                    <ChartSkeleton theme={theme as string} />
                    <ChartSkeleton theme={theme as string} />
                  </>
                ) : (
                  <>
                    <Card className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} hover:shadow-lg transition-shadow`}>
                      <CardHeader>
                        <CardTitle className={theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}>User Role Distribution</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie
                              data={roleDistribution}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              label
                            >
                              {roleDistribution.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                background: theme === 'dark' ? '#1E293B' : '#FFFFFF',
                                border: theme === 'dark' ? '1px solid #475569' : '1px solid #E2E8F0',
                                color: theme === 'dark' ? '#E2E8F0' : '#1F2937',
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        <p className={`text-center text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                          Total Users: {userStats.totalUsers}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} hover:shadow-lg transition-shadow`}>
                      <CardHeader>
                        <CardTitle className={theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}>User Growth Trend</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={getUserGrowthData()}>
                            <XAxis dataKey="month" stroke={theme === 'dark' ? '#E2E8F0' : '#1F2937'} />
                            <YAxis stroke={theme === 'dark' ? '#E2E8F0' : '#1F2937'} />
                            <Tooltip
                              contentStyle={{
                                background: theme === 'dark' ? '#1E293B' : '#FFFFFF',
                                border: theme === 'dark' ? '1px solid #475569' : '1px solid #E2E8F0',
                                color: theme === 'dark' ? '#E2E8F0' : '#1F2937',
                              }}
                            />
                            <Bar dataKey="count" fill={theme === 'dark' ? '#60A5FA' : '#2563EB'} />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                    <Card className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} hover:shadow-lg transition-shadow`}>
                      <CardHeader>
                        <CardTitle className={theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}>Roadmap Type Distribution</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie
                              data={data.roadmapData.stats.aiVsUser}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              label
                            >
                              {data.roadmapData.stats.aiVsUser.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                background: theme === 'dark' ? '#1E293B' : '#FFFFFF',
                                border: theme === 'dark' ? '1px solid #475569' : '1px solid #E2E8F0',
                                color: theme === 'dark' ? '#E2E8F0' : '#1F2937',
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        <p className={`text-center text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                          Total Roadmaps: {data.roadmapData.stats.totalRoadmaps}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} hover:shadow-lg transition-shadow`}>
                      <CardHeader>
                        <CardTitle className={theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}>Roadmaps by Year</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={data.roadmapData.stats.byYear}>
                            <XAxis dataKey="year" stroke={theme === 'dark' ? '#E2E8F0' : '#1F2937'} />
                            <YAxis stroke={theme === 'dark' ? '#E2E8F0' : '#1F2937'} />
                            <Tooltip
                              contentStyle={{
                                background: theme === 'dark' ? '#1E293B' : '#FFFFFF',
                                border: theme === 'dark' ? '1px solid #475569' : '1px solid #E2E8F0',
                                color: theme === 'dark' ? '#E2E8F0' : '#1F2937',
                              }}
                            />
                            <Bar dataKey="count" fill={theme === 'dark' ? '#60A5FA' : '#2563EB'} />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
              <Card className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} hover:shadow-lg transition-shadow mb-8`}>
                <CardHeader>
                  <CardTitle className={theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}>Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead
                          className={`cursor-pointer ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'} hover:text-indigo-500`}
                          onClick={() => handleSort('fullName')}
                        >
                          Name {sortField === 'fullName' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead
                          className={`cursor-pointer ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'} hover:text-indigo-500`}
                          onClick={() => handleSort('email')}
                        >
                          Email {sortField === 'email' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead
                          className={`cursor-pointer ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'} hover:text-indigo-500`}
                          onClick={() => handleSort('role')}
                        >
                          Role {sortField === 'role' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className={`h-24 text-center ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                            No users found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers.map((user) => (
                          <TableRow key={user.id} className={`hover:bg-slate-700/30 dark:hover:bg-slate-700/30 transition-colors`}>
                            <TableCell className={theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}>{user.fullName || 'N/A'}</TableCell>
                            <TableCell className={theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}>{user.email}</TableCell>
                            <TableCell className={theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}>{user.role}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              <Card className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} hover:shadow-lg transition-shadow`}>
                <CardHeader>
                  <CardTitle className={theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}>Roadmaps</CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredRoadmaps.length === 0 ? (
                    <div className={`text-center py-12 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                      <Filter className={`mx-auto w-16 h-16 rounded-full p-4 mb-4 ${theme === 'dark' ? 'bg-indigo-900/30 text-indigo-500' : 'bg-blue-100 text-blue-500'}`} />
                      <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'} mb-2`}>No roadmaps found</h3>
                      <p className="mb-6">
                        {searchTerm || yearFilter !== null
                          ? 'No roadmaps match your current filters.'
                          : 'No roadmaps available.'}
                      </p>
                      {(searchTerm || yearFilter !== null) && (
                        <Button
                          onClick={resetFilters}
                          variant="outline"
                          className={`${theme === 'dark' ? 'border-slate-700 text-slate-200 hover:bg-slate-700' : 'border-slate-200 text-slate-800 hover:bg-slate-50'} rounded-lg hover:scale-105 transition-transform`}
                        >
                          Reset Filters
                        </Button>
                      )}
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className={theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}>Title</TableHead>
                          <TableHead className={theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}>Year</TableHead>
                          <TableHead className={theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}>Type</TableHead>
                          <TableHead className={theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}>Creator</TableHead>
                          <TableHead className={theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}>Created At</TableHead>
                          <TableHead className={theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}>Likes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRoadmaps.map((roadmap) => (
                          <TableRow key={roadmap.title} className={`hover:bg-slate-700/30 dark:hover:bg-slate-700/30 transition-colors`}>
                            <TableCell className={theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}>{roadmap.title}</TableCell>
                            <TableCell className={theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}>{roadmap.year || 'N/A'}</TableCell>
                            <TableCell className={theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}>{roadmap.ai_generated}</TableCell>
                            <TableCell className={theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}>{roadmap.created_by}</TableCell>
                            <TableCell className={theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}>{roadmap.created_at}</TableCell>
                            <TableCell className={theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}>{roadmap.likes}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </main>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent
            className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'} sm:max-w-md rounded-lg shadow-lg`}
          >
            <DialogHeader>
              <DialogTitle className={`text-2xl ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>Create New User</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <Label htmlFor="firstName" className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                  First Name
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                  className={`${theme === 'dark' ? 'bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-500'} rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-colors`}
                />
              </div>
              <div>
                <Label htmlFor="lastName" className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className={`${theme === 'dark' ? 'bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-500'} rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-colors`}
                />
              </div>
              <div>
                <Label htmlFor="email" className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className={`${theme === 'dark' ? 'bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-500'} rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-colors`}
                />
              </div>
              <div>
                <Label htmlFor="password" className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className={`${theme === 'dark' ? 'bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-500'} rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-colors`}
                />
              </div>
              <div>
                <Label htmlFor="role" className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                  Role
                </Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value as 'admin' | 'student' | 'alumni' })}
                >
                  <SelectTrigger
                    className={`${theme === 'dark' ? 'bg-slate-700 border-slate-600 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'} rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-colors`}
                  >
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent
                    className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'}`}
                  >
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="alumni">Alumni</SelectItem>
                  </SelectContent>
                </Select>
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
                  disabled={isSubmitting}
                  className={`${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} rounded-lg hover:scale-105 transition-transform`}
                >
                  {isSubmitting ? <ClipLoader color="#f1f5f9" size={20} /> : 'Create User'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}