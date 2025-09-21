"use client";

import { useState, useEffect } from 'react';
import { useUser, UserButton, SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/nextjs';
import { useTheme } from 'next-themes';
import { Moon, Sun, Home, TrophyIcon, LayoutDashboardIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';


export default function Header() {
  const { user, isLoaded } = useUser();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const role = user?.publicMetadata.role as 'admin' | 'alumni' | 'student' | undefined;

  // Handle theme hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isLoaded) return null;

  // Determine dashboard link based on role
  const dashboardLink = role === 'admin' ? '/admin/dashboard' :
    role === 'alumni' ? '/alumni/dashboard' :
      role === 'student' ? '/student/dashboard' : null;

  // Reusable UserInfo component
  const UserInfo = ({ user, role }: { user: { hasImage: boolean; imageUrl: string; fullName?: string }; role: 'admin' | 'alumni' | 'student' | undefined }) => (
    <div className="flex items-center gap-3">
      <Link href={`${dashboardLink}`} className="flex items-center gap-3">
        {user.hasImage ? (
          <img
            src={user.imageUrl}
            alt={user.fullName || "User"}
            className="h-10 w-10 rounded-full border-2 border-slate-300 dark:border-slate-600 shadow-md"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center border-2 border-slate-300 dark:border-slate-600 shadow-md">
            <span className="text-base font-medium text-slate-600 dark:text-slate-300">{user.fullName?.[0] || "U"}</span>
          </div>
        )}
        <span className="text-base font-semibold truncate max-w-[120px] text-slate-900 dark:text-white hidden md:block">
          {user.fullName || "User"}
        </span>
        {role && (
          <span className="text-sm py-1 px-2.5 bg-blue-200 dark:bg-blue-900/80 text-blue-800 dark:text-blue-100 rounded-full font-medium hidden md:inline">
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </span>
        )}
      </Link>
    </div>
  );


  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-300/50 bg-white dark:bg-slate-950 shadow-sm">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between gap-4">
        {/* Left Section: Logo and Navigation */}
        <div className="flex items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 hover:scale-105 transition-transform duration-300">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-xl font-bold shadow-md">
              HS
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white hidden sm:inline">HireSphere</span>
          </Link>
          {/* Navigation Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-base font-medium text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-800 hidden sm:flex"
            >
              <Link href="/">
                <Home className="h-5 w-5 mr-1" />
                Home
              </Link>
            </Button>
            <SignedIn>
              {dashboardLink && (
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="text-base font-medium text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-800 hidden sm:flex"
                >
                  <Link href={dashboardLink}>
                    <LayoutDashboardIcon />
                    Dashboard
                  </Link>
                </Button>
              )}

              {role === 'admin' && (
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="text-base font-medium text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-800 hidden sm:flex"
                >
                  <Link href="/admin/success">
                    <TrophyIcon className="h-5 w-5 mr-1" />
                    Success Stories
                  </Link>
                </Button>
              )}
            </SignedIn>
          </div>
        </div>

        {/* Right Section: User Controls */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-10 w-10 text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors duration-200"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
          </Button>

          {/* User Menu */}
          <SignedIn>
            <div className="flex items-center gap-3">
              {user && (
                <UserInfo
                  user={{
                    hasImage: !!user.imageUrl,
                    imageUrl: user.imageUrl || '',
                    fullName: user.fullName || undefined
                  }}
                  role={role}
                />
              )}
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: "h-10 w-10 border-2 border-slate-300 dark:border-slate-600 shadow-md",
                    userButtonTrigger: "p-0",
                  },
                }}
              />
            </div>
          </SignedIn>
          <SignedOut>
            <div className="flex items-center gap-2">
              <SignInButton mode="redirect">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-base font-medium text-slate-900 dark:text-white border-slate-400 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800"
                >
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="redirect">
                <Button
                  size="sm"
                  className="text-base font-medium bg-blue-700 text-white hover:bg-blue-800 shadow-md"
                >
                  Sign Up
                </Button>
              </SignUpButton>
            </div>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}