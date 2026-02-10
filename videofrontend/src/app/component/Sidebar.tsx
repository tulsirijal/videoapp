"use client";

import { usePathname } from "next/navigation";
import { Home, Compass, PlaySquare, History, Clock, ThumbsUp, Upload, Menu } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

const mainLinks = [
  { name: "Home", icon: Home, href: "/" },
  { name: "Subscriptions", icon: PlaySquare, href: "/subscriptions" },
];

const secondaryLinks = [
  { name: "Upload", icon: Upload, href: "/upload" },
  { name: "History", icon: History, href: "/history" },
  { name: "Watch Later", icon: Clock, href: "/watch-later" },
  { name: "Liked", icon: ThumbsUp, href: "/liked" },
  {name: "Studio", icon: PlaySquare, href: "/studio" },
];

export default function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (val: boolean) => void }) {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  return (
    <>
      {/* --- MOBILE OVERLAY  --- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-[150] md:hidden"
          />
        )}
      </AnimatePresence>

      {/* --- SIDEBAR CONTAINER --- */}
      <motion.aside
        initial={false}
        animate={{ 
          x: isOpen ? 0 : (typeof window !== 'undefined' && window.innerWidth < 768 ? -280 : 0),
          width: isOpen ? 240 : 72 
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={clsx(
          "fixed left-0 top-0 md:top-14 h-full md:h-[calc(100vh-56px)] bg-[#0f0f0f] text-white z-[200] md:z-40",
          "border-r border-zinc-800 shadow-2xl md:shadow-none overflow-y-auto no-scrollbar",
          !isOpen && "hidden xl:block" 
        )}
      >
        {/* Mobile-Only Header */}
        <div className="flex items-center gap-4 px-4 h-14 md:hidden border-b border-zinc-800/50 mb-2">
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-zinc-800 rounded-full">
            <Menu size={22} />
          </button>
          <Link href="/" className="flex items-center gap-1">
             
             <span className="font-bold tracking-tighter text-lg"><span className="text-red-500 font-bold">Video</span>App</span>
          </Link>
        </div>

        <div className="flex flex-col gap-1 py-2 px-3">
          {mainLinks.map((item) => (
            <SidebarItem 
              key={item.name} 
              item={item} 
              active={isActive(item.href)} 
              isExpanded={isOpen} 
              onClick={() => { if(window.innerWidth < 768) setIsOpen(false) }}
            />
          ))}

          <div className="my-3 border-t border-zinc-800 mx-2" />
          
          {isOpen && <h3 className="px-4 py-2 text-[13px] font-bold text-zinc-400 uppercase tracking-wider">Library</h3>}
          {secondaryLinks.map((item) => (
            <SidebarItem 
              key={item.name} 
              item={item} 
              active={isActive(item.href)} 
              isExpanded={isOpen}
              onClick={() => { if(window.innerWidth < 768) setIsOpen(false) }}
            />
          ))}

          {isOpen && (
            <div className="mt-auto pt-10 px-4 pb-6 text-[11px] text-zinc-500 font-medium">
              <p className="flex gap-2 flex-wrap mb-2">
                <span>About</span><span>Press</span><span>Copyright</span>
              </p>
              <p>© 2025 VideoApp LLC</p>
            </div>
          )}
        </div>
      </motion.aside>
    </>
  );
}

function SidebarItem({ item, active, isExpanded, onClick }: any) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={clsx(
        "flex items-center rounded-xl transition-all duration-200 group",
        isExpanded 
          ? "gap-5 px-3 py-2.5 h-10 w-full" 
          : "flex-col gap-1 px-0 py-4 justify-center text-center h-16 w-full",
        active 
          ? "bg-zinc-800 font-semibold text-white" 
          : "hover:bg-zinc-900 text-zinc-300 hover:text-white"
      )}
    >
      <Icon 
        size={isExpanded ? 22 : 24} 
        className={clsx(
            "transition-transform group-active:scale-90",
            active ? "text-white" : "text-zinc-300"
        )} 
      />
      <span className={clsx(
        "transition-all truncate",
        isExpanded ? "text-[14px]" : "text-[10px] font-medium"
      )}>
        {item.name}
      </span>
    </Link>
  );
}