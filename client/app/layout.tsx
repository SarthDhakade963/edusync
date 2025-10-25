// app/layout.tsx
import "./globals.css";
import { ReactNode } from "react";
import { Providers } from "./provider";

export const metadata = { title: "EduSync - Modern Learning Platform" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
        <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50 backdrop-blur-lg">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="font-bold text-xl bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    EduSync
                  </h1>
                  <p className="text-xs text-slate-500">
                    Modern Learning Platform
                  </p>
                </div>
              </div>
            </div>
          </div>
        </nav>
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Providers>{children}</Providers>
        </main>
      </body>
    </html>
  );
}
