"use client";

import { LayoutDashboard } from "lucide-react";
import Link from "next/link";
import React from "react";
import AuthGuard from "../(app)/_components/AuthGuard";

export default function StandaloneLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <main className="pb-10">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-x-4 py-4">
            <Link href="/" className="flex items-center gap-x-2">
              <LayoutDashboard className="h-6 w-6" />
              <span className="text-xl font-bold">Intelligent ERP Task</span>
            </Link>
            {/* <UserButton /> */}
          </div>
        </nav>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
      </main>
    </AuthGuard>
  );
}