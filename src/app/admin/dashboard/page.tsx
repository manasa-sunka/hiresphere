"use client"
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, UserPlus, UserCheck, Calendar, Award, Search, Loader2, LogOutIcon } from 'lucide-react';
import { SignOutButton } from '@clerk/nextjs';

// Types
interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  role: 'admin' | 'student' | 'alumni';
  createdAt: number;
}

interface CreateUserForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'admin' | 'student' | 'alumni';
}

interface UserStats {
  totalUsers: number;
  adminCount: number;
  studentCount: number;
  alumniCount: number;
}

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center space-y-4 py-12">
    <div className="relative">
      <div className="w-12 h-12 rounded-full border-4 border-t-indigo-500 border-r-purple-500 border-b-cyan-500 border-l-emerald-500 animate-spin"></div>
      <Loader2 className="w-6 h-6 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
    </div>
    <p className="text-indigo-300 animate-pulse">Loading data...</p>
  </div>
);

// Card Loading Skeleton
const CardSkeleton = () => (
  <Card className="border-0 bg-slate-800/50">
    <CardHeader className="pb-2">
      <div className="h-4 w-24 bg-slate-700 rounded animate-pulse"></div>
    </CardHeader>
    <CardContent>
      <div className="flex justify-between items-center">
        <div className="h-8 w-12 bg-slate-700 rounded animate-pulse"></div>
        <div className="h-6 w-6 rounded-full bg-slate-700 animate-pulse"></div>
      </div>
    </CardContent>
  </Card>
);

// Chart Loading Skeleton
const ChartSkeleton = () => (
  <Card className="border-0 bg-slate-800/50">
    <CardHeader>
      <div className="h-5 w-40 bg-slate-700 rounded animate-pulse"></div>
      <div className="h-4 w-64 bg-slate-700/70 rounded animate-pulse mt-2"></div>
    </CardHeader>
    <CardContent>
      <div className="h-64 w-full bg-slate-800 rounded flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-t-indigo-500 border-r-purple-500 border-b-cyan-500 border-l-emerald-500 animate-spin"></div>
      </div>
    </CardContent>
  </Card>
);

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof User>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [formData, setFormData] = useState<CreateUserForm>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'student',
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Color palette for charts and UI elements
  const COLORS = {
    admin: '#6366f1', // indigo
    student: '#06b6d4', // cyan
    alumni: '#8b5cf6', // purple
    card: {
      bg: 'bg-slate-800',
      border: 'border-slate-700',
      hover: 'hover:bg-slate-700/50'
    },
    text: {
      primary: 'text-slate-100',
      secondary: 'text-slate-300',
      muted: 'text-slate-400'
    },
    chart: ['#6366f1', '#06b6d4', '#8b5cf6', '#10b981']
  };

  // Role badge styling function
  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-indigo-900/40 text-indigo-300 border border-indigo-600/30';
      case 'student':
        return 'bg-cyan-900/40 text-cyan-300 border border-cyan-600/30';
      case 'alumni':
        return 'bg-purple-900/40 text-purple-300 border border-purple-600/30';
      default:
        return 'bg-slate-800 text-slate-300';
    }
  };

  // Fetch users
  useEffect(() => {
    async function fetchUsers() {
      setIsLoading(true);
      try {
        // Simulate network delay for demo purposes
        await new Promise(resolve => setTimeout(resolve, 1500));
        const response = await fetch('/api/users');
        const data = await response.json();
        setUsers(data.users);
      } catch {
        toast.error('Failed to fetch users');
      } finally {
        setIsLoading(false);
      }
    }
    fetchUsers();
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
        setUsers([newUser, ...users]);
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
  const handleSort = (field: keyof User) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filter and sort users
  const filteredUsers = users
    .filter((user) =>
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortField] || '';
      const bValue = b[sortField] || '';
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      }
      return aValue < bValue ? 1 : -1;
    });

  // Calculate user statistics
  const userStats: UserStats = {
    totalUsers: users.length,
    adminCount: users.filter(user => user.role === 'admin').length,
    studentCount: users.filter(user => user.role === 'student').length,
    alumniCount: users.filter(user => user.role === 'alumni').length,
  };

  // Data for pie chart
  const roleDistribution = [
    { name: 'Admin', value: userStats.adminCount },
    { name: 'Student', value: userStats.studentCount },
    { name: 'Alumni', value: userStats.alumniCount },
  ];

  // Group users by month
  const getMonthData = () => {
    const monthData = new Array(6).fill(0).map((_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return {
        month: date.toLocaleString('default', { month: 'short' }),
        count: 0,
        timestamp: date.getTime(),
      };
    }).reverse();

    users.forEach(user => {
      const userDate = new Date(user.createdAt);
      const monthIndex = monthData.findIndex(item => {
        const itemDate = new Date(item.timestamp);
        return itemDate.getMonth() === userDate.getMonth() &&
          itemDate.getFullYear() === userDate.getFullYear();
      });
      if (monthIndex !== -1) {
        monthData[monthIndex].count++;
      }
    });

    return monthData;
  };

  // Calculate recent activity - last 30 days
  const recentActivity = users.filter(user => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return new Date(user.createdAt) >= thirtyDaysAgo;
  }).length;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Admin Dashboard
            </span>
          </h1>
          <div className='flex items-center space-x-2 justify-center'>
            <Button
              onClick={() => setDialogOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <UserPlus className="mr-2 h-4 w-4" /> Create User
            </Button>
            <SignOutButton component='div'>
              <Button variant={'destructive'} className='bg-red-500 rounded-sm'>Logout <LogOutIcon/></Button>
              </SignOutButton>
          </div>
        </div>

        <Tabs
          defaultValue={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="mb-6 bg-slate-800 p-1">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
            >
              User Management
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {isLoading ? (
                <>
                  <CardSkeleton />
                  <CardSkeleton />
                  <CardSkeleton />
                  <CardSkeleton />
                </>
              ) : (
                <>
                  <Card className="bg-slate-800 border-slate-700 hover:bg-slate-700/70 transition-colors">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-slate-400">Total Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-white">{userStats.totalUsers}</div>
                        <Users className="h-6 w-6 text-indigo-400" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-800 border-slate-700 hover:bg-slate-700/70 transition-colors">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-slate-400">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-white">{recentActivity}</div>
                        <Calendar className="h-6 w-6 text-cyan-400" />
                      </div>
                      <p className="text-xs text-slate-400 mt-1">New users in last 30 days</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-800 border-slate-700 hover:bg-slate-700/70 transition-colors">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-slate-400">Students</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-white">{userStats.studentCount}</div>
                        <UserCheck className="h-6 w-6 text-cyan-400" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-800 border-slate-700 hover:bg-slate-700/70 transition-colors">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-slate-400">Alumni</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-white">{userStats.alumniCount}</div>
                        <Award className="h-6 w-6 text-purple-400" />
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isLoading ? (
                <>
                  <ChartSkeleton />
                  <ChartSkeleton />
                </>
              ) : (
                <>
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-slate-100">User Role Distribution</CardTitle>
                      <CardDescription className="text-slate-400">Breakdown of users by role</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center pt-6">
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={roleDistribution}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {roleDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS.chart[index % COLORS.chart.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) => [`${value} users`, '']}
                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-slate-100">User Growth Trend</CardTitle>
                      <CardDescription className="text-slate-400">Monthly user registration trends</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                          data={getMonthData()}
                          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                        >
                          <XAxis dataKey="month" stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" />
                          <Tooltip
                            formatter={(value) => [`${value} users`, 'Registrations']}
                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                          />
                          <Legend />
                          <Bar dataKey="count" name="New Users" fill="#6366f1" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            {/* Recent Users */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-100">Recently Added Users</CardTitle>
                <CardDescription className="text-slate-400">Latest 5 users added to the system</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <LoadingSpinner />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700">
                        <TableHead className="text-slate-300">Name</TableHead>
                        <TableHead className="text-slate-300">Email</TableHead>
                        <TableHead className="text-slate-300">Role</TableHead>
                        <TableHead className="text-slate-300">Created At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users
                        .sort((a, b) => b.createdAt - a.createdAt)
                        .slice(0, 5)
                        .map((user) => (
                          <TableRow key={user.id} className="border-slate-700 hover:bg-slate-700/30">
                            <TableCell className="text-slate-200">{user.fullName || 'N/A'}</TableCell>
                            <TableCell className="text-slate-200">{user.email}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeStyle(user.role)}`}>
                                {user.role}
                              </span>
                            </TableCell>
                            <TableCell className="text-slate-300">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            {/* Search and Filter */}
            <div className="flex items-center space-x-2 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-indigo-500"
                />
              </div>
              <Select
                value={sortField as string}
                onValueChange={(value) => setSortField(value as keyof User)}
              >
                <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700 text-slate-200">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                  <SelectItem value="fullName">Name</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="role">Role</SelectItem>
                  <SelectItem value="createdAt">Date Created</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-slate-100"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>

            {/* User Table */}
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead
                        className="cursor-pointer text-slate-300 hover:text-indigo-300"
                        onClick={() => handleSort('fullName')}
                      >
                        Name {sortField === 'fullName' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead
                        className="cursor-pointer text-slate-300 hover:text-indigo-300"
                        onClick={() => handleSort('email')}
                      >
                        Email {sortField === 'email' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead
                        className="cursor-pointer text-slate-300 hover:text-indigo-300"
                        onClick={() => handleSort('role')}
                      >
                        Role {sortField === 'role' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead
                        className="cursor-pointer text-slate-300 hover:text-indigo-300"
                        onClick={() => handleSort('createdAt')}
                      >
                        Created At {sortField === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-64">
                          <LoadingSpinner />
                        </TableCell>
                      </TableRow>
                    ) : filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-slate-400">
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id} className="border-slate-700 hover:bg-slate-700/30">
                          <TableCell className="text-slate-200">{user.fullName || 'N/A'}</TableCell>
                          <TableCell className="text-slate-200">{user.email}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeStyle(user.role)}`}>
                              {user.role}
                            </span>
                          </TableCell>
                          <TableCell className="text-slate-300">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create User Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[425px] bg-slate-800 border-slate-700 text-slate-100">
            <DialogHeader>
              <DialogTitle className="text-slate-100">Create New User</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <Label htmlFor="firstName" className="text-slate-300">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  required
                  className="bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-500"
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-slate-300">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className="bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-500"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-slate-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  className="bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-500"
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-slate-300">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  className="bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-500"
                />
              </div>
              <div>
                <Label htmlFor="role" className="text-slate-300">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData({ ...formData, role: value as 'admin' | 'student' | 'alumni' })
                  }
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-200">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
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
                  className="bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                    </>
                  ) : (
                    'Create User'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}