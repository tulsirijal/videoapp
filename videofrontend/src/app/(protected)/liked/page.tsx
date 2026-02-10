"use client";

import { useEffect, useState } from "react";
import { Play, ThumbsUp, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/axiosInstance";
import { Video } from "@/types/videoType";
import VideoCard from "../../component/VideoCard";
import Link from "next/link";

interface Like {
  id: number;
  userId: number;
  videoId: number;
  createdAt: string;
  video: Video;
}

export default function LikedVideos() {
  const [likes, setLikes] = useState<Like[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLikedVideos = async () => {
      try {
        setLoading(true);

        const likedVideo = await api.get("/likedVideos");
        setLikes(likedVideo.data.likedVideos);
      } catch (err: any) {
        console.error(err);
        setError("Failed to load liked videos");
      } finally {
        setLoading(false);
      }
    };

    fetchLikedVideos();
  }, []);


  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0f0f0f]">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      </div>
    );
  }


  if (error) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-2 bg-[#0f0f0f] text-red-400">
        <AlertCircle size={48} />
        <p className="text-lg font-semibold">{error}</p>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="mt-4"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] p-4 text-white md:p-8">

      <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight">Liked Videos</h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400">
              <span className="font-medium text-white">
                {likes.length} videos
              </span>
            </div>
          </div>
        </div>
      </div>



      {likes.length === 0 ? (
        
        <div className="mt-20 flex flex-col items-center justify-center text-gray-500">
          <ThumbsUp size={64} className="mb-4 opacity-20" />
          <h3 className="text-xl font-semibold">No liked videos yet</h3>
          <p className="mt-2">Videos you like will appear here.</p>
        </div>
      ) : (
        
        <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {likes.map((like) => (
            <Link
              key={like.video.id}
              href={`/video/${like.video.id}`}
              className="block mb-8"
            >
              <VideoCard {...like.video} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
