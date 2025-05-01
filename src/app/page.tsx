"use client";

import { useState, useEffect } from 'react';
import { SignedIn, SignedOut, SignUpButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import Head from "next/head";
import { useTheme } from 'next-themes';
import { Map, Users, Brain, ArrowRight, Rocket, User } from 'lucide-react';
import Header from '@/components/misc/header';

export default function LandingPage() {
  const { user, isLoaded } = useUser();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const role = user?.publicMetadata?.role;

  // Handle theme hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <Head>
        <title>HireSphere - Navigate Your Career</title>
        <meta
          name="description"
          content="Discover curated career roadmaps, AI-powered learning paths, and alumni success stories with HireSphere."
        />
      </Head>
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'} transition-colors duration-300`}>
        {/* Header */}
        <Header />

        {/* Hero Section */}
        <section className={`py-20 ${theme === 'dark' ? 'bg-gradient-to-b from-slate-900 to-indigo-950' : 'bg-gradient-to-b from-blue-50 to-white'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                HS
              </div>
            </div>
            <h2 className={`text-4xl sm:text-5xl font-extrabold ${theme === 'dark' ? 'text-white' : 'text-slate-800'} mb-6 tracking-tight`}>
              Navigate Your Career with <span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">HireSphere</span>
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'} mb-8`}>
              Explore curated career roadmaps, AI-powered learning paths, and inspiring alumni success stories to guide your professional journey.
            </p>
            <SignedOut>
              <SignUpButton mode="modal">
                <Button
                  size="lg"
                  className={`${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg shadow-md transition-transform hover:scale-105`}
                  aria-label="Get Started"
                >
                  Get Started <Rocket className="ml-2 h-5 w-5" />
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              {role === "admin" ? (
                <Link href="/admin/dashboard">
                  <Button
                    size="lg"
                    className={`${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg shadow-md transition-transform hover:scale-105`}
                    aria-label="Go to Admin Dashboard"
                  >
                    Go to Admin Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : role === "alumni" && (
                <Link href="/alumni/dashboard">
                  <Button
                    size="lg"
                    className={`${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg shadow-md transition-transform hover:scale-105`}
                    aria-label="Go to Alumni Dashboard"
                  >
                    Go to Alumni Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              )}
              <Link href="/roadmaps">
                <Button
                  size="lg"
                  className={`${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg shadow-md transition-transform hover:scale-105`}
                  aria-label="Go to Dashboard"
                >
                  Go to Roadmaps <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link> 
            </SignedIn>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className={`text-3xl font-bold text-center ${theme === 'dark' ? 'text-white' : 'text-slate-800'} mb-12 tracking-tight`}>
              Why Choose HireSphere?
            </h3>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <Card className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} shadow-sm hover:shadow-lg transition-shadow duration-300`}>
                <CardHeader>
                  <Map className={`h-12 w-12 ${theme === 'dark' ? 'text-indigo-400' : 'text-blue-600'} mb-3 mx-auto`} />
                  <CardTitle className={`text-center ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>Curated Roadmaps</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={`text-center ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    Follow expertly crafted roadmaps for fields like Cybersecurity and AI Engineering, designed by industry professionals.
                  </p>
                </CardContent>
              </Card>
              <Card className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} shadow-sm hover:shadow-lg transition-shadow duration-300`}>
                <CardHeader>
                  <Brain className={`h-12 w-12 ${theme === 'dark' ? 'text-indigo-400' : 'text-blue-600'} mb-3 mx-auto`} />
                  <CardTitle className={`text-center ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>AI-Powered Paths</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={`text-center ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    Generate personalized learning paths tailored to your career goals using advanced AI technology.
                  </p>
                </CardContent>
              </Card>
              <Card className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} shadow-sm hover:shadow-lg transition-shadow duration-300`}>
                <CardHeader>
                  <Users className={`h-12 w-12 ${theme === 'dark' ? 'text-indigo-400' : 'text-blue-600'} mb-3 mx-auto`} />
                  <CardTitle className={`text-center ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>Alumni Success</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={`text-center ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    Get inspired by stories from successful alumni who’ve walked the path you’re on.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className={`py-16 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className={`text-3xl font-bold text-center ${theme === 'dark' ? 'text-white' : 'text-slate-800'} mb-12 tracking-tight`}>
              What Our Users Say
            </h3>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <Card className={`${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} shadow-sm hover:shadow-md transition-shadow duration-300`}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                      <User className="h-6 w-6 text-slate-500" />
                    </div>
                    <div>
                      <p className={`font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>Jane Doe</p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>AI Engineer</p>
                    </div>
                  </div>
                  <p className={`italic ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                    "The AI Engineer roadmap helped me land a job at a top tech company!"
                  </p>
                </CardContent>
              </Card>
              <Card className={`${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} shadow-sm hover:shadow-md transition-shadow duration-300`}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                      <User className="h-6 w-6 text-slate-500" />
                    </div>
                    <div>
                      <p className={`font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>John Smith</p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Security Analyst</p>
                    </div>
                  </div>
                  <p className={`italic ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                    "The Cybersecurity path was clear and practical. Now I’m a security analyst."
                  </p>
                </CardContent>
              </Card>
              <Card className={`${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} shadow-sm hover:shadow-md transition-shadow duration-300`}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                      <User className="h-6 w-6 text-slate-500" />
                    </div>
                    <div>
                      <p className={`font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>Emily Chen</p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Product Manager</p>
                    </div>
                  </div>
                  <p className={`italic ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                    "The AI-generated roadmap was tailored perfectly to my goals."
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="mt-8 text-center">
              <Link href="/alumni">
                <Button
                  variant="link"
                  aria-label="View All Alumni Stories"
                  className={`${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} text-lg transition-colors duration-200`}
                >
                  View All Alumni Stories
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className={`text-3xl md:text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'} mb-6 tracking-tight`}>
              Ready to Start Your Journey?
            </h2>
            <p className={`text-lg max-w-xl mx-auto ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'} mb-8`}>
              Join thousands of professionals using HireSphere to plan their careers with confidence.
            </p>
            <Button
              asChild
              className={`${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg shadow-md text-lg px-8 py-3 transition-transform hover:scale-105`}
            >
              <Link href={isLoaded && user ? '/roadmaps' : '/sign-up'}>
                {isLoaded && user ? 'Explore Now' : 'Get Started'} <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className={`py-12 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
                    HS
                  </div>
                  <span className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                    HireSphere
                  </span>
                </div>
                <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  Empowering professionals with curated career roadmaps and expert insights.
                </p>
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'} mb-4`}>
                  Quick Links
                </h3>
                <ul className={`space-y-3 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  <li>
                    <Link href="/roadmaps" className={`hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200`}>
                      Roadmaps
                    </Link>
                  </li>
                  <li>
                    <Link href="/about" className={`hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200`}>
                      About
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className={`hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200`}>
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'} mb-4`}>
                  Connect
                </h3>
                <div className="flex gap-4">
                  <a href="#" className={`${theme === 'dark' ? 'text-slate-400 hover:text-blue-400' : 'text-slate-600 hover:text-blue-500'} transition-colors duration-200`} aria-label="Facebook">
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-3c-3.6 0-5 2.4-5 4.9v2h-3v4h3v12h5v-12h3.8l.4-4z" />
                    </svg>
                  </a>
                  <a href="#" className={`${theme === 'dark' ? 'text-slate-400 hover:text-blue-400' : 'text-slate-600 hover:text-blue-500'} transition-colors duration-200`} aria-label="Twitter">
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                    </svg>
                  </a>
                  <a href="#" className={`${theme === 'dark' ? 'text-slate-400 hover:text-blue-400' : 'text-slate-600 hover:text-blue-500'} transition-colors duration-200`} aria-label="Instagram">
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16.98 0H7.02A7.02 7.02 0 000 7.02v9.96A7.02 7.02 0 007.02 24h9.96A7.02 7.02 0 0024 16.98V7.02A7.02 7.02 0 0016.98 0zM12 18.5a6.5 6.5 0 110-13 6.5 6.5 0 010 13zm6-11a1 1 0 11-2 0 1 1 0 012 0z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
            <div className={`mt-8 pt-8 border-t ${theme === 'dark' ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-600'} text-center`}>
              <p>© {new Date().getFullYear()} HireSphere. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}