"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import api from "@/lib/axiosInstance";
import { Loader2 } from "lucide-react";
import VideoCard from "../component/VideoCard";
import Link from "next/link";


export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query");
  
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) return;

      setLoading(true);
      setError("");

      try {
        const res = await api.post('/search', { query: query });
        setVideos(res.data);

      } catch (err) {
        console.error(err);
        setError("Failed to load search results.");
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]); 

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Search results for: <span className="text-red-600">"{query}"</span>
      </h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      ) : error ? (
        <div className="text-center text-red-500 mt-10">{error}</div>
      ) : videos.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">
          No videos found matching your search.
        </div>
      ) : (
        <div className="px-4 md:px-0 grid grid-cols-2 md:grid-cols-3 gap-4">
          {videos.map((video: any) => (
            <Link href={`/video/${video.id}`} key={video.id} className="">
                <VideoCard {...video} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}