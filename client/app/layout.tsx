// app/layout.tsx
import "./globals.css";
import { ReactNode } from "react";
import { Providers } from "./provider";

export const metadata = { title: "Joineazy" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b p-4">
          <div className="container mx-auto flex justify-between">
            <div className="font-semibold">Joineazy</div>
          </div>
        </nav>
        <main className="container mx-auto p-6">
          <Providers>{children}</Providers>
        </main>
      </body>
    </html>
  );
}
