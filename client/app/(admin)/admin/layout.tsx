"use client";

import { ReactNode } from "react";
import { Providers } from "../../provider";
import { signOut } from "next-auth/react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Modern Navigation Bar */}
        <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40 backdrop-blur-lg bg-white/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo/Brand */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h1 className="font-bold text-xl text-slate-900">Admin Dashboard</h1>
                  <p className="text-xs text-slate-500">Management Portal</p>
                </div>
              </div>

              {/* Right Side Actions */}
              <div className="flex items-center gap-4">
                {/* User Info */}
                <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="text-sm">
                    <p className="font-semibold text-slate-900">Administrator</p>
                  </div>
                </div>

                {/* Sign Out Button */}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main>{children}</main>
      </div>
    </Providers>
  );
}