import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/ui/BottomNav";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#020617",
};

export const metadata: Metadata = {
  title: "ChapaQuiz | Real Time Trivia",
  description: "Compete in fast 60-second quizzes, challenge your friends on WhatsApp, and win cash prizes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.className}`}>
      <body>
        <div className="flex-1 overflow-y-auto pb-24 relative z-0 hide-scrollbar">
          {children}
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
