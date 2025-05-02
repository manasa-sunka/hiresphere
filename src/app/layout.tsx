import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { ensureDefaultRole } from "@/lib/roles";
import Header from "@/components/misc/header";

const font = Lexend({
  subsets: ["latin"],
  weight: ["300"],
});

export const metadata: Metadata = {
  title: "HireSphere - Career Development Platform",
  description:
    "HireSphere connects students with career roadmaps and resources to help them navigate their professional journey effectively.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  await ensureDefaultRole();

  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
      <body className={`${font.className} font-sans antialiased`}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <main className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-300">
              <Header />
              {children}
            </main>
            <Toaster theme="light"
            />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}