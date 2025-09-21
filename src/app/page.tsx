"use client";

import { useState, useEffect } from "react";
import { SignedIn, SignedOut, SignUpButton, useUser } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import Link from "next/link";
import Head from "next/head";
import { ScaleLoader } from "react-spinners";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Map, Users, Brain, ArrowRight, Rocket, User, Facebook, Twitter, Instagram } from "lucide-react";


// Types
interface SuccessStory {
  image_url: string;
  id: number;
  name: string;
  post: string;
  batch: number;
  followed_roadmap: string;
  connect_link: string;
  created_at: string;
}

// Reusable Section Wrapper
const Section = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <section className={`py-16 ${className}`}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
  </section>
);

// Social Icon Component
const SocialIcon = ({ Icon, href, label }: { Icon: React.ElementType; href: string; label: string }) => {
  const { theme } = useTheme();
  return (
    <a
      href={href}
      className={`${theme === "dark" ? "text-slate-400 hover:text-blue-400" : "text-slate-600 hover:text-blue-500"
        } transition-colors duration-200`}
      aria-label={label}
    >
      <Icon className="h-6 w-6" />
    </a>
  );
};

// Feature Card Component
const FeatureCard = ({ Icon, title, description }: { Icon: React.ElementType; title: string; description: string }) => {
  const { theme } = useTheme();
  return (
    <Card
      className={`relative overflow-hidden ${theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
        } shadow-sm hover:shadow-lg transition-shadow duration-300 group`}
    >
      <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
      <CardHeader>
        <Icon
          className={`h-12 w-12 ${theme === "dark" ? "text-indigo-400" : "text-blue-600"} mb-3 mx-auto`}
        />
        <CardTitle className={`text-center ${theme === "dark" ? "text-slate-200" : "text-slate-800"}`}>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`text-center ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
          {description}
        </p>
      </CardContent>
    </Card>
  );
};

// Testimonial Card Component
const TestimonialCard = ({ name, role, quote }: { name: string; role: string; quote: string }) => {
  const { theme } = useTheme();
  return (
    <Card
      className={`relative ${theme === "dark" ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"
        } shadow-sm hover:shadow-md transition-shadow duration-300 group`}
    >
      <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
      <CardContent className="pt-6">
        <div className="flex items-center gap-4 mb-4">
          <div
            className={`h-12 w-12 rounded-full ${theme === "dark" ? "bg-slate-700" : "bg-slate-200"
              } flex items-center justify-center`}
          >
            <User className="h-6 w-6 text-slate-500" />
          </div>
          <div>
            <p className={`font-medium ${theme === "dark" ? "text-slate-200" : "text-slate-800"}`}>{name}</p>
            <p className={`text-sm ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>{role}</p>
          </div>
        </div>
        <p className={`italic ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>&quot;{quote}&quot;</p>
      </CardContent>
    </Card>
  );
};

// CTA Button Component
const CTAButton = ({ isLoaded, user }: { isLoaded: boolean; user: unknown }) => {
  const { theme } = useTheme();
  return (
    <Button
      asChild
      className={`${theme === "dark" ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-600 hover:bg-blue-700"
        } text-white rounded-lg shadow-md text-lg px-8 py-3 transition-transform hover:scale-105`}
    >
      <Link href={isLoaded && user ? "/roadmaps" : "/sign-up"}>
        {isLoaded && user ? "Explore Now" : "Get Started"} <ArrowRight className="ml-2 h-5 w-5" />
      </Link>
    </Button>
  );
};

// Hero Section Component
const HeroSection = ({ role }: { isLoaded: boolean; user: unknown; role?: string }) => {
  const { theme } = useTheme();
  return (
    <Section
      className={`py-20 ${theme === "dark" ? "bg-gradient-to-b from-slate-900 to-indigo-950" : "bg-gradient-to-b from-blue-50 to-white"
        }`}
    >
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
            HS
          </div>
        </div>
        <h2
          className={`text-4xl sm:text-5xl font-extrabold ${theme === "dark" ? "text-white" : "text-slate-800"
            } mb-6 tracking-tight animate-fade-in`}
        >
          Navigate Your Career with{" "}
          <span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
            HireSphere
          </span>
        </h2>
        <p
          className={`text-lg max-w-2xl mx-auto ${theme === "dark" ? "text-slate-300" : "text-slate-600"
            } mb-8 animate-fade-in-up`}
        >
          Explore curated career roadmaps, AI-powered learning paths, and inspiring alumni success stories to guide your professional journey.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <SignedOut>
            <SignUpButton mode="modal">
              <Button
                size="lg"
                className={`${theme === "dark" ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-600 hover:bg-blue-700"
                  } text-white rounded-lg shadow-md transition-transform hover:scale-105`}
                aria-label="Get Started"
              >
                Get Started <Rocket className="ml-2 h-5 w-5" />
              </Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            {role === "admin" && (
              <Link href="/admin/dashboard">
                <Button
                  size="lg"
                  className={`${theme === "dark" ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-600 hover:bg-blue-700"
                    } text-white rounded-lg shadow-md transition-transform hover:scale-105`}
                  aria-label="Go to Admin Dashboard"
                >
                  Go to Admin Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            )}
            {role === "alumni" && (
              <Link href="/alumni/dashboard">
                <Button
                  size="lg"
                  className={`${theme === "dark" ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-600 hover:bg-blue-700"
                    } text-white rounded-lg shadow-md transition-transform hover:scale-105`}
                  aria-label="Go to Alumni Dashboard"
                >
                  Go to Alumni Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            )}
            {role === "student" && (
              <Link href="/student/dashboard">
                <Button
                  size="lg"
                  className={`${theme === "dark" ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-600 hover:bg-blue-700"
                    } text-white rounded-lg shadow-md transition-transform hover:scale-105`}
                  aria-label="Go to Student Dashboard"
                >
                  Go to Student Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            )}
            <Link href="/roadmaps">
              <Button
                size="lg"
                variant="outline"
                className={`${theme === "dark"
                  ? "border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
                  : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                  } rounded-lg shadow-md transition-transform hover:scale-105`}
                aria-label="Go to Roadmaps"
              >
                Explore Roadmaps <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </SignedIn>
        </div>
      </div>
    </Section>
  );
};

// Feature Section Component
const FeatureSection = () => {
  const { theme } = useTheme();
  const features = [
    {
      Icon: Map,
      title: "Curated Roadmaps",
      description:
        "Follow expertly crafted roadmaps for fields like Cybersecurity and AI Engineering, designed by industry professionals.",
    },
    {
      Icon: Brain,
      title: "AI-Powered Paths",
      description: "Generate personalized learning paths tailored to your career goals using advanced AI technology.",
    },
    {
      Icon: Users,
      title: "Alumni Success",
      description: "Get inspired by stories from successful alumni who’ve walked the path you’re on.",
    },
  ];

  return (
    <Section className={`${theme === "dark" ? "bg-slate-900" : "bg-white"}`}>
      <h3
        className={`text-3xl font-bold text-center ${theme === "dark" ? "text-white" : "text-slate-800"
          } mb-12 tracking-tight animate-fade-in`}
      >
        Why Choose HireSphere?
      </h3>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            Icon={feature.Icon}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </div>
    </Section>
  );
};

// Testimonial Section Component
const TestimonialSection = () => {
  const { theme } = useTheme();
  const testimonials = [
    {
      name: "Jane Doe",
      role: "AI Engineer",
      quote: "The AI Engineer roadmap helped me land a job at a top tech company!",
    },
    {
      name: "John Smith",
      role: "Security Analyst",
      quote: "The Cybersecurity path was clear and practical. Now I’m a security analyst.",
    },
    {
      name: "Emily Chen",
      role: "Product Manager",
      quote: "The AI-generated roadmap was tailored perfectly to my goals.",
    },
  ];

  return (
    <Section className={`${theme === "dark" ? "bg-slate-800" : "bg-slate-100"}`}>
      <h3
        className={`text-3xl font-bold text-center ${theme === "dark" ? "text-white" : "text-slate-800"
          } mb-12 tracking-tight animate-fade-in`}
      >
        What Our Users Say
      </h3>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((testimonial, index) => (
          <TestimonialCard
            key={index}
            name={testimonial.name}
            role={testimonial.role}
            quote={testimonial.quote}
          />
        ))}
      </div>
    </Section>
  );
};

// Success Stories Section Component
// Success Stories Section Component
const SuccessStoriesSection = () => {
  const { theme } = useTheme();
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await fetch("/api/success-stories");
        if (!response.ok) throw new Error("Failed to fetch success stories");
        const data = await response.json();
        setStories(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching success stories:", error);
        setStories([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStories();
  }, []);

  const themeStyles = {
    sectionBg: theme === "dark" ? "bg-slate-900" : "bg-white",
    titleColor: theme === "dark" ? "text-white" : "text-slate-800",
    textMuted: theme === "dark" ? "text-slate-400" : "text-slate-600",
    cardBg: theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200",
    avatarBg: theme === "dark" ? "bg-slate-700" : "bg-slate-200",
    nameColor: theme === "dark" ? "text-slate-200" : "text-slate-800",
    textColor: theme === "dark" ? "text-slate-300" : "text-slate-700",
    linkColor: theme === "dark" ? "text-blue-400 hover:text-blue-300" : "text-blue-500 hover:text-blue-600",
    buttonBg: theme === "dark" ? "border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700" : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50",
  };

  return (
    <Section className={themeStyles.sectionBg}>
      <h3
        className={`text-4xl font-extrabold text-center ${themeStyles.titleColor} mb-10 tracking-tight animate-fade-in`}
      >
        Success Stories
      </h3>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <ScaleLoader color={theme === "dark" ? "#60A5FA" : "#2563EB"} height={35} />
        </div>
      ) : stories.length === 0 ? (
        <p className={`text-center text-lg ${themeStyles.textMuted}`}>No success stories available yet.</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {stories.slice(0, 3).map((story) => (
            <Card
              key={story.id}
              className={`relative ${themeStyles.cardBg} rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden`}
            >
              <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-16 w-16 rounded-full overflow-hidden">
                    {story.image_url ? (
                      <img
                        src={story.image_url}
                        alt={story.name}
                        width={64}
                        height={64}
                        className="object-cover"
                      />
                    ) : (
                      <div
                        className={`h-full w-full ${themeStyles.avatarBg} flex items-center justify-center`}
                      >
                        <User className="h-8 w-8 text-slate-500" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className={`text-lg font-semibold ${themeStyles.nameColor}`}>{story.name}</h4>
                    <p className={`text-sm ${themeStyles.textMuted}`}>
                      {story.post} | Batch {story.batch}
                    </p>
                  </div>
                </div>
                <p className={`text-sm font-medium ${themeStyles.textColor} mb-4 line-clamp-2`}>
                  Followed: {story.followed_roadmap}
                </p>
                <a
                  href={story.connect_link}
                  className={`text-sm font-medium ${themeStyles.linkColor} inline-flex items-center gap-1 transition-colors`}
                  aria-label={`Connect with ${story.name}`}
                >
                  Connect
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {!isLoading && stories.length > 0 && (
        <div className="text-center mt-8">
          <Link href="/success-stories">
            <Button
              variant="outline"
              className={`${themeStyles.buttonBg} rounded-lg px-8 py-3 text-base font-medium transition-transform hover:scale-105`}
              aria-label="View all success stories"
            >
              View All Success Stories
            </Button>
          </Link>
        </div>
      )}
    </Section>
  );
};

// CTA Section Component
const CTASection = ({ isLoaded, user }: { isLoaded: boolean; user: unknown }) => {
  const { theme } = useTheme();
  return (
    <Section className={`${theme === "dark" ? "bg-slate-800" : "bg-slate-100"}`}>
      <div className="text-center">
        <h2
          className={`text-3xl md:text-4xl font-bold ${theme === "dark" ? "text-white" : "text-slate-800"
            } mb-6 tracking-tight animate-fade-in`}
        >
          Ready to Start Your Journey?
        </h2>
        <p
          className={`text-lg max-w-xl mx-auto ${theme === "dark" ? "text-slate-300" : "text-slate-600"
            } mb-8 animate-fade-in-up`}
        >
          Join thousands of professionals using HireSphere to plan their careers with confidence.
        </p>
        <CTAButton isLoaded={isLoaded} user={user} />
      </div>
    </Section>
  );
};

// Footer Component
const Footer = () => {
  const { theme } = useTheme();
  return (
    <footer className={`py-12 ${theme === "dark" ? "bg-slate-800" : "bg-slate-100"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
                HS
              </div>
              <span
                className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-slate-800"}`}
              >
                HireSphere
              </span>
            </div>
            <p className={`${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
              Empowering professionals with curated career roadmaps and expert insights.
            </p>
          </div>
          <div>
            <h3
              className={`text-lg font-semibold ${theme === "dark" ? "text-slate-200" : "text-slate-800"
                } mb-4`}
            >
              Quick Links
            </h3>
            <ul className={`space-y-3 ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
              {[
                { href: "/roadmaps", label: "Roadmaps" },
                { href: "/alumni/dashboard", label: "Alumni Dashboard" },
                { href: "/admin/dashboard", label: "Admin Dashboard" },
                { href: "/student/dashboard", label: "Student Dashboard" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`${theme === "dark" ? "hover:text-blue-400" : "hover:text-blue-500"
                      } transition-colors duration-200`}
                    aria-label={link.label}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3
              className={`text-lg font-semibold ${theme === "dark" ? "text-slate-200" : "text-slate-800"
                } mb-4`}
            >
              Connect
            </h3>
            <div className="flex gap-4">
              <SocialIcon Icon={Facebook} href="#" label="Facebook" />
              <SocialIcon Icon={Twitter} href="#" label="Twitter" />
              <SocialIcon Icon={Instagram} href="#" label="Instagram" />
            </div>
          </div>
        </div>
        <div
          className={`mt-8 pt-8 border-t ${theme === "dark" ? "border-slate-700 text-slate-400" : "border-slate-200 text-slate-600"
            } text-center`}
        >
          <p>© {new Date().getFullYear()} HireSphere. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

// Main Landing Page Component
export default function LandingPage() {
  const { user, isLoaded } = useUser();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const role = user?.publicMetadata?.role as string | undefined;

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
      <div className={`min-h-screen ${theme === "dark" ? "bg-slate-900" : "bg-slate-50"} transition-colors duration-300`}>
        <HeroSection isLoaded={isLoaded} user={user} role={role} />
        <FeatureSection />
        <TestimonialSection />
        <SuccessStoriesSection />
        <CTASection user={user} isLoaded={true} />
        <Footer />
      </div>
    </>
  );
}