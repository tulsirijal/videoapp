"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axiosInstance";
import Link from "next/link";
import { Loader2, Trash2, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";


interface HistoryItem {
  id: number;
  watchedAt: string;
  video: {
    id: number;
    title: string;
    description: string;
    thumbnail: string;
    views: number;
    duration?: number;
    url: string;
    createdAt: string;
    updatedAt: string;
    user: {
      id: number;
      firstname: string;
      lastname: string;
    };
  };
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const [showOptionsFor, setShowOptionsFor] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get("/getHistory");

      if (Array.isArray(res.data)) {
        setHistory(res.data);
      } else if (res.data.history && Array.isArray(res.data.history)) {
        setHistory(res.data.history);
      }
      console.log(res.data);
    } catch (error) {
      console.error("Failed to load history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!confirm("Are you sure you want to clear your entire watch history?"))
      return;

    setIsClearing(true);
    try {
      await api.post("/deleteAllHistory");
      setHistory([]); 
    } catch (error) {
      console.error("Failed to clear history", error);
      alert("Could not clear history. Please try again.");
    } finally {
      setIsClearing(false);
    }
  };

  const clearIndividualHistory = async (id: number) => {
    try {
      await api.post(`/deleteHistory/${id}`);
      setHistory((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Failed to delete history item", error);
      alert("Could not remove video from history. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-purple-600 mb-4" />
        <p className="text-gray-500">Loading your history...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row max-w-7xl mx-auto px-4 py-8 gap-8">
      
      <div className="flex-1">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Watch History
        </h1>

        {history.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
            <Clock className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              No watch history yet
            </h3>
            <p className="text-gray-500 mb-4">
              Videos you watch will appear here.
            </p>
            <Link href="/">
              <Button>Browse Videos</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <div
                key={item.id}
                className="group flex flex-col sm:flex-row gap-4 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
              >
              
                <Link
                  href={`/video/${item.video.id}`}
                  className="relative sm:w-64 sm:flex-shrink-0 aspect-video"
                >
                  <div className=" flex flex-col cursor-pointer group">
                    
                    <div className="relative w-full aspect-video overflow-hidden rounded-xl bg-gray-200 dark:bg-gray-800">
                      <video
                        src={item.video.url}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                  </div>
                </Link>

                
                <div className="flex flex-col flex-grow min-w-0 pr-8">
                  <div className="flex justify-between items-start">
                    <Link href={`/video/${item.video.id}`}>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 leading-tight group-hover:text-purple-600 transition-colors">
                        {item.video.title}
                      </h3>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className=" md:absolute md:top-2 md:right-2 text-red-600 hover:bg-red-100"
                      onClick={() => clearIndividualHistory(item.id)}
                    >
                      <Trash2 className="w-4 h-4 " />
                      
                    </Button>
                  </div>

                  <div className="mt-1 text-sm text-gray-600 dark:text-gray-400 flex flex-wrap items-center gap-x-1">
                    <Link
                      href={`/channel/${item.video.user.id}`}
                      className="hover:text-gray-900 dark:hover:text-gray-200"
                    >
                      {item.video.user.firstname} {item.video.user.lastname}
                    </Link>
                    <span>•</span>
                    <span>{item.video.views} views</span>
                  </div>

                  <p className="text-xs text-gray-500 mt-2 line-clamp-1 sm:line-clamp-2">
                    {item.video.description}
                  </p>

                 
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-500 font-medium bg-gray-200 dark:bg-gray-700/50 w-fit px-2 py-1 rounded-full">
                    <Calendar className="w-3 h-3" />
                    Watched {new Date(item.watchedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      
      <div className="w-full lg:w-80 flex-shrink-0">
        <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800 sticky top-24">


          <div className="relative z-10">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
              Manage History
            </h2>

            <button
              onClick={handleClearHistory}
              disabled={isClearing || history.length === 0}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" />
              {isClearing ? "Clearing..." : "Clear all watch history"}
            </button>

            <div className="h-px bg-gray-200 dark:bg-gray-800 my-4" />

            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <Clock className="w-4 h-4" />
              Pause watch history
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
