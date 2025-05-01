import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Roadmap & Alumni Platform
          </h1>
          <div className="space-x-4">
            <SignInButton mode="modal">
              <Button variant="outline">Sign In</Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Sign Up
              </Button>
            </SignUpButton>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-extrabold">
            Your Path to Success Starts Here
          </h2>
          <p className="mt-4 text-lg max-w-2xl mx-auto">
            Explore learning roadmaps, generate AI-powered custom paths, and get
            inspired by alumni success stories.
          </p>
          <SignedOut>
            <SignUpButton mode="modal">
              <Button
                size="lg"
                className="mt-6 bg-white text-blue-600 hover:bg-gray-100"
              >
                Get Started
              </Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard">
              <Button
                size="lg"
                className="mt-6 bg-white text-blue-600 hover:bg-gray-100"
              >
                Go to Dashboard
              </Button>
            </Link>
          </SignedIn>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center text-gray-900">
            Why Choose Us?
          </h3>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Learning Roadmaps</CardTitle>
              </CardHeader>
              <CardContent>
                Follow expertly crafted roadmaps for fields like Cybersecurity and
                AI Engineering.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>AI-Powered Paths</CardTitle>
              </CardHeader>
              <CardContent>
                Generate personalized learning paths using advanced AI
                technology.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Alumni Success</CardTitle>
              </CardHeader>
              <CardContent>
                Get inspired by stories from successful alumni who started just
                like you.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Alumni Preview Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center text-gray-900">
            Meet Our Alumni
          </h3>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Jane Doe</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  "The AI Engineer roadmap helped me land a job at a top tech
                  company!"
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>John Smith</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  "The Cybersecurity path was clear and practical. Now I’m a
                  security analyst."
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Emily Chen</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  "The AI-generated roadmap was tailored perfectly to my goals."
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="mt-8 text-center">
            <Link href="/alumni">
              <Button variant="link">View All Alumni Stories</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 Roadmap & Alumni Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}