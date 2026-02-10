"use client";
import { useEffect, useState } from "react";
import { Menu, Search, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "./Sidebar";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const {isAuthenticated, user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const router = useRouter();
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".user-menu-container")) {
        setIsUserMenuOpen(false);
      }
      if(!target.closest(".mobile-search-bar")) {
        setShowMobileSearch(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleSearchNavigation = ()=>{
    if(!searchQuery.trim()){
      return;
    }
    const encodedQuery = encodeURIComponent(searchQuery.trim());
    setShowMobileSearch(false);
    router.push(`/search?query=${encodedQuery}`);
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>)=>{
    if(e.key === 'Enter'){
      handleSearchNavigation();
    }
  }


  return (
    <div className="w-full sticky top-0 z-50  bg-black border-b border-gray-200 dark:border-gray-700 shadow-sm z-50">
      <div className="flex items-center justify-between px-4 md:px-10 lg:px-20 py-2 ">
        {/* Left: Logo + Mobile Menu */}
        <div className="flex items-center gap-3">
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/" className="text-xl font-bold text-red-600">
            Video<span className="text-gray-900 dark:text-white">App</span>
          </Link>
        </div>

        {/* Middle: Search Bar (Desktop) */}
        <div className="hidden md:flex items-center flex-1 max-w-xl mx-4">
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyPress}
            className="flex-grow rounded-l-full border border-gray-300 dark:border-gray-700 px-4 py-[5px] text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
          <Button
            variant="secondary"
            className="w-8 h-8 rounded-r-full border border-l-0"
            onClick={handleSearchNavigation}
          >
            <Search className="" />
          </Button>
        </div>

        <div className="flex items-center gap-3">
          {/* Right: Icons */}
          <div className="mobile-search-bar self-start">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setShowMobileSearch((prev) => !prev)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
          {isAuthenticated ? (
            <>
              {/* User Avatar Dropdown */}
              <div className="relative user-menu-container ml-2">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-full bg-purple-600 text-white font-semibold text-sm hover:ring-2 hover:ring-gray-300 dark:hover:ring-gray-600 transition-all focus:outline-none"
                >
                  {user?.firstname?.[0]}
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.1 }}
                      className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-[#282828] rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden"
                    >
                      {/* Dropdown Header */}
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white text-lg font-bold">
                          {user?.firstname?.[0]}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {user?.firstname} {user?.lastname}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            @{user?.firstname.toLowerCase()}
                            {user?.lastname.toLowerCase()}
                          </p>
                        </div>
                      </div>

                      {/* Dropdown Items */}
                      <div className="py-2">
                        <Link href={`/channel/${user?.id}`} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors">
                          <User className="w-5 h-5 text-gray-500" />
                          Your Channel
                        </Link>
                        <div className="h-px bg-gray-200 dark:bg-gray-700 my-1" />
                        <button
                          onClick={() => logout()}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors"
                        >
                          <LogOut className="w-5 h-5 text-gray-500" />
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <Link href={"/login"}>
              <button className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 text-blue-600 border border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full font-medium text-sm transition-colors">
                <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-500 dark:text-gray-300" />
                </div>
                Login
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Search Input */}
      <AnimatePresence>
        <div className="mobile-search-bar">
          {showMobileSearch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-gray-200 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-gray-800"
            >
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Search"
                  className="flex-grow rounded-full border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyPress}
                />
                <Button size="icon" variant="secondary" onClick={handleSearchNavigation}>
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </AnimatePresence>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <Sidebar isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} />
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Navbar;
