import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { UserProfile } from "@/components/user-profile";
import { AuthProvider } from "@/context/auth-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zypher AI - Create Intelligent Chatbots",
  description: "Build knowledge-powered chatbots with custom context and deploy anywhere",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider> {/* Wrap with AuthProvider */}
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-border/50 bg-background/80 backdrop-blur-md shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">Z</span>
                </div>
                <h1 className="text-xl font-bold gradient-text">Zypher AI</h1>
              </div>
              <UserProfile />
            </header>
            <main className="grow container mx-auto px-4 py-8 max-w-7xl">
              {children}
            </main>
            <footer className="py-6 px-4 border-t border-border/50 bg-card/30 text-center text-muted-foreground text-sm">
              <p>© {new Date().getFullYear()} Zypher AI. Build intelligent chatbots powered by your knowledge.</p>
            </footer>
          </ThemeProvider>
        </AuthProvider> {/* Close AuthProvider */}
      </body>
    </html>
  );
}
