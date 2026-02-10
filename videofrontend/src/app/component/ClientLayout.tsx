"use client";

import { useState } from "react";

import clsx from "clsx";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  return (
    <div className="flex flex-col min-h-screen">
      
      <Navbar  />

      <div className="flex flex-1">

        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

        <main
          className={clsx(
            "flex-1 transition-all duration-300 ease-in-out w-full max-w-full overflow-x-hidden",
           
            isSidebarOpen ? "md:ml-60" : "md:ml-20",
            
            "ml-0"
          )}
        >
          <div className=" md:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}