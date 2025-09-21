"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { ScaleLoader } from "react-spinners";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { User, ArrowLeft } from "lucide-react";

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

// Reusable Section Wrapper
const Section = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <section className={`py-16 ${className}`}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
  </section>
);

export default function SuccessStoriesPage() {
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

  // Animation variants for cards
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
    hover: {
      scale: 1.03,
      transition: {
        duration: 0.3,
      },
    },
  };

  // Define bento grid layout using grid-template-areas
  const getGridItemClass = (index: number) => {
    const pattern = index % 6; // Repeat every 6 items for variety
    switch (pattern) {
      case 0:
        return "col-span-2 row-span-2"; // Larger card
      case 3:
        return "col-span-2 row-span-1"; // Wide card
      default:
        return "col-span-1 row-span-1"; // Standard card
    }
  };

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-slate-900" : "bg-slate-50"} transition-colors duration-300`}>
      <Section className={themeStyles.sectionBg}>
        <div className="flex items-center justify-between mb-10">
          <h1
            className={`text-4xl font-extrabold ${themeStyles.titleColor} tracking-tight animate-fade-in`}
          >
            All Success Stories
          </h1>
          <Link href="/">
            <Button
              variant="outline"
              className={`${themeStyles.buttonBg} rounded-lg px-6 py-2 text-base font-medium transition-transform hover:scale-105`}
              aria-label="Back to home"
            >
              <ArrowLeft className="w-5 h-5 mr-2" /> Back to Home
            </Button>
          </Link>
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <ScaleLoader color={theme === "dark" ? "#60A5FA" : "#2563EB"} height={35} />
          </div>
        ) : stories.length === 0 ? (
          <p className={`text-center text-lg ${themeStyles.textMuted}`}>No success stories available yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 auto-rows-[200px] grid-flow-dense">
            <AnimatePresence>
              {stories.map((story, index) => (
                <motion.div
                  key={story.id}
                  custom={index}
                  initial="hidden"
                  animate="visible"
                  variants={cardVariants}
                  whileHover="hover"
                  className={getGridItemClass(index)}
                >
                  <Card
                    className={`relative ${themeStyles.cardBg} rounded-2xl shadow-lg transition-all duration-300 group overflow-hidden h-full flex flex-col`}
                  >
                    <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                    <CardContent className="p-6 flex flex-col flex-grow">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="h-16 w-16 rounded-full overflow-hidden flex-shrink-0">
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
                      <p className={`text-sm font-medium ${themeStyles.textColor} mb-4 line-clamp-2 flex-grow`}>
                        Followed: {story.followed_roadmap}
                      </p>
                      <a
                        href={story.connect_link}
                        className={`text-sm font-medium ${themeStyles.linkColor} inline-flex items-center gap-1 transition-colors mt-auto`}
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
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </Section>
    </div>
  );
}
