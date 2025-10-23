"use client";

import { ReactNode } from "react";
import { Providers } from "../../provider";
import { signOut } from "next-auth/react";

export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-blue-800 text-white p-4 flex justify-between items-center">
          <div className="font-bold text-lg">Student Dashboard</div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="bg-red-500 px-4 py-2 rounded hover:bg-red-600"
          >
            Sign Out
          </button>
        </nav>
        <main className="p-6">{children}</main>
      </div>
    </Providers>
  );
}
