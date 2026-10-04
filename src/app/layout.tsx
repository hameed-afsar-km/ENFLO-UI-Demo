import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { TopNav } from "@/components/TopNav";
import { ChatbotWidget } from "@/components/ChatbotWidget";
import { SimulationProvider } from "@/context/SimulationContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ENECO Solar Intelligence",
  description: "Solar intelligence, clearly visualized.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} text-primary-text min-h-screen bg-background relative`}>
        {/* Static faded grid background */}
        <div className="absolute inset-0 z-[-1] h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>
        
        <SimulationProvider>
          <TopNav />
          <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 relative z-10">
            {children}
          </main>
          <Suspense fallback={null}>
            <ChatbotWidget />
          </Suspense>
        </SimulationProvider>
      </body>
    </html>
  );
}
