"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser, SignOutButton, SignInButton, SignUpButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Home,
  LogOut, 
  Moon, 
  Sun,
  Menu,
  X,
  ChevronDown,
  Grid3X3,
  Info,
  Mail
} from 'lucide-react';
import { useTheme } from 'next-themes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

export default function Header() {
  const { user, isLoaded } = useUser();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const role = user?.publicMetadata.role as string | undefined;

  // Handle theme hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-slate-900/80 transition-all duration-300">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo and title */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
              HS
            </div>
            <span className="text-xl font-bold text-slate-800 dark:text-white hidden sm:inline-block">
              HireSphere
            </span>
          </Link>
        </div>
        
        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <Link href="/" passHref>
            <Button
              variant={pathname === "/" ? "default" : "ghost"}
              size="sm"
              className={`transition-colors duration-200 ${pathname === "/" ? "bg-blue-600 text-white hover:bg-blue-700" : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
              aria-current={pathname === "/" ? "page" : undefined}
            >
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
          </Link>
          <Link href="/about" passHref>
            <Button
              variant={pathname === "/about" ? "default" : "ghost"}
              size="sm"
              className={`transition-colors duration-200 ${pathname === "/about" ? "bg-blue-600 text-white hover:bg-blue-700" : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
              aria-current={pathname === "/about" ? "page" : undefined}
            >
              <Info className="h-4 w-4 mr-2" />
              About
            </Button>
          </Link>
          <Link href="/contact" passHref>
            <Button
              variant={pathname === "/contact" ? "default" : "ghost"}
              size="sm"
              className={`transition-colors duration-200 ${pathname === "/contact" ? "bg-blue-600 text-white hover:bg-blue-700" : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
              aria-current={pathname === "/contact" ? "page" : undefined}
            >
              <Mail className="h-4 w-4 mr-2" />
              Contact
            </Button>
          </Link>
          {role === 'alumni' && (
            <Link href="/alumni/dashboard" passHref>
              <Button
                variant={pathname === "/alumni/dashboard" ? "default" : "ghost"}
                size="sm"
                className={`transition-colors duration-200 ${pathname === "/alumni/dashboard" ? "bg-blue-600 text-white hover:bg-blue-700" : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
                aria-current={pathname === "/alumni/dashboard" ? "page" : undefined}
              >
                <Grid3X3 className="h-4 w-4 mr-2" />
                My Roadmaps
              </Button>
            </Link>
          )}
          {role === 'admin' && (
            <Link href="/admin/dashboard" passHref>
              <Button
                variant={pathname === "/admin/dashboard" ? "default" : "ghost"}
                size="sm"
                className={`transition-colors duration-200 ${pathname === "/admin/dashboard" ? "bg-blue-600 text-white hover:bg-blue-700" : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
                aria-current={pathname === "/admin/dashboard" ? "page" : undefined}
              >
                <Grid3X3 className="h-4 w-4 mr-2" />
                Admin Dashboard
              </Button>
            </Link>
          )}
        </nav>
        
        {/* User controls */}
        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          
          {/* User info and logout (desktop) */}
          {isLoaded && user ? (
            <div className="hidden md:flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200"
                    aria-label="User menu"
                  >
                    <div className="flex items-center gap-2">
                      {user.hasImage ? (
                        <img 
                          src={user.imageUrl} 
                          alt={user.fullName || "User"} 
                          className="h-6 w-6 rounded-full"
                        />
                      ) : (
                        <User className="h-4 w-4 text-slate-500" />
                      )}
                      <span className="text-sm font-medium max-w-[120px] truncate text-slate-800 dark:text-slate-200">
                        {user.fullName || "User"}
                      </span>
                      {role && (
                        <span className="text-xs py-0.5 px-1.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </span>
                      )}
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  <Link href="/profile">
                    <DropdownMenuItem className="text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">
                      <User className="h-4 w-4 mr-2" />
                      Profile Settings
                    </DropdownMenuItem>
                  </Link>
                  <SignOutButton>
                    <DropdownMenuItem className="text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700 focus:text-red-600 dark:focus:text-red-400">
                      <LogOut className="h-4 w-4 mr-2" />
                      Log Out
                    </DropdownMenuItem>
                  </SignOutButton>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <SignInButton mode='modal'>
                <Button variant="ghost" className="text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode='modal'>   
                <Button className="bg-blue-600 text-white hover:bg-blue-700">
                  Sign Up
                </Button>
              </SignUpButton>
            </div>
          )}
          
          {/* Mobile menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="h-6 w-6 text-slate-700 dark:text-slate-200" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-white dark:bg-slate-900">
                <div className="flex flex-col h-full">
                  <div className="flex justify-between items-center py-4 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                        HS
                      </div>
                      <span className="text-lg font-bold text-slate-800 dark:text-white">HireSphere</span>
                    </div>
                    <SheetClose asChild>
                      <Button variant="ghost" size="icon" aria-label="Close menu">
                        <X className="h-5 w-5 text-slate-700 dark:text-slate-200" />
                      </Button>
                    </SheetClose>
                  </div>
                  
                  {/* User info */}
                  {isLoaded && user && (
                    <div className="border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
                      <div className="flex items-center gap-3 mb-4">
                        {user.hasImage ? (
                          <img 
                            src={user.imageUrl} 
                            alt={user.fullName || "User"} 
                            className="h-10 w-10 rounded-full"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                            <User className="h-5 w-5 text-slate-500" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-slate-800 dark:text-slate-200">{user.fullName || "User"}</p>
                          {role && (
                            <span className="text-xs py-0.5 px-1.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </span>
                          )}
                        </div>
                      </div>
                      <Link href="/profile">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full justify-start text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 mb-2"
                        >
                          <User className="h-4 w-4 mr-2" />
                          Profile Settings
                        </Button>
                      </Link>
                      <SignOutButton>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full justify-start text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/30"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Log Out
                        </Button>
                      </SignOutButton>
                    </div>
                  )}
                  
                  {/* Mobile navigation */}
                  <div className="space-y-2">
                    <SheetClose asChild>
                      <Link href="/" passHref>
                        <Button
                          variant={pathname === "/" ? "default" : "ghost"}
                          size="sm"
                          className={`w-full justify-start transition-colors duration-200 ${pathname === "/" ? "bg-blue-600 text-white hover:bg-blue-700" : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
                          aria-current={pathname === "/" ? "page" : undefined}
                        >
                          <Home className="h-4 w-4 mr-2" />
                          Home
                        </Button>
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/about" passHref>
                        <Button
                          variant={pathname === "/about" ? "default" : "ghost"}
                          size="sm"
                          className={`w-full justify-start transition-colors duration-200 ${pathname === "/about" ? "bg-blue-600 text-white hover:bg-blue-700" : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
                          aria-current={pathname === "/about" ? "page" : undefined}
                        >
                          <Info className="h-4 w-4 mr-2" />
                          About
                        </Button>
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/contact" passHref>
                        <Button
                          variant={pathname === "/contact" ? "default" : "ghost"}
                          size="sm"
                          className={`w-full justify-start transition-colors duration-200 ${pathname === "/contact" ? "bg-blue-600 text-white hover:bg-blue-700" : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
                          aria-current={pathname === "/contact" ? "page" : undefined}
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Contact
                        </Button>
                      </Link>
                    </SheetClose>
                    {role === 'alumni' && (
                      <SheetClose asChild>
                        <Link href="/alumni/dashboard" passHref>
                          <Button
                            variant={pathname === "/alumni/dashboard" ? "default" : "ghost"}
                            size="sm"
                            className={`w-full justify-start transition-colors duration-200 ${pathname === "/alumni/dashboard" ? "bg-blue-600 text-white hover:bg-blue-700" : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
                            aria-current={pathname === "/alumni/dashboard" ? "page" : undefined}
                          >
                            <Grid3X3 className="h-4 w-4 mr-2" />
                            My Roadmaps
                          </Button>
                        </Link>
                      </SheetClose>
                    )}
                    {role === 'admin' && (
                      <SheetClose asChild>
                        <Link href="/admin/dashboard" passHref>
                          <Button
                            variant={pathname === "/admin/dashboard" ? "default" : "ghost"}
                            size="sm"
                            className={`w-full justify-start transition-colors duration-200 ${pathname === "/admin/dashboard" ? "bg-blue-600 text-white hover:bg-blue-700" : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
                            aria-current={pathname === "/admin/dashboard" ? "page" : undefined}
                          >
                            <Grid3X3 className="h-4 w-4 mr-2" />
                            Admin Dashboard
                          </Button>
                        </Link>
                      </SheetClose>
                    )}
                    {!user && (
                      <>
                        <SheetClose asChild>
                          <Link href="/sign-in" passHref>
                            <Button
                              variant={pathname === "/sign-in" ? "default" : "ghost"}
                              size="sm"
                              className={`w-full justify-start transition-colors duration-200 ${pathname === "/sign-in" ? "bg-blue-600 text-white hover:bg-blue-700" : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
                              aria-current={pathname === "/sign-in" ? "page" : undefined}
                            >
                              Sign In
                            </Button>
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link href="/sign-up" passHref>
                            <Button
                              variant={pathname === "/sign-up" ? "default" : "ghost"}
                              size="sm"
                              className={`w-full justify-start bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200`}
                              aria-current={pathname === "/sign-up" ? "page" : undefined}
                            >
                              Sign Up
                            </Button>
                          </Link>
                        </SheetClose>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}