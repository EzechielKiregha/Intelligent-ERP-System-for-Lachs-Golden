"use client";

import { LeftAuthPanel } from "@/components/LeftAuthPanel";
import { Button } from "@/components/ui/button";
import { Frown } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function NotFoundPage() {
  return (

    <div className="flex items-center justify-center min-h-screen bg-sidebar px-4 shadow-lg">
      <div className="bg-white dark:bg-[#111827] shadow-lg rounded-2xl flex flex-col md:flex-row w-full max-w-[900px] md:h-[535px] overflow-hidden">
        <LeftAuthPanel />
        <div className=" flex flex-col justify-center items-center w-full max-w-lg bg-white dark:bg-[#111827] ">
          <div className="flex items-center gap-x-2 mb-3">
            <Frown className="size-6 text-muted-foreground" />
            <span className="font-bold text-xl">Not Found</span>
          </div>
          <p className="text-muted-foreground text-lg">
            Could not find requested resources
          </p>
          <Link href="/">
            <Button variant={"outline"} className="mt-1">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>

  );
}
