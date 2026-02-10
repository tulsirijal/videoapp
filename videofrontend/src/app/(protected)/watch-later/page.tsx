'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Play, Shuffle, Trash2, Clock, CheckCircle2 } from 'lucide-react';
import api from '@/lib/axiosInstance'; 
import { Button } from '@/components/ui/button';
import { formatNumber } from '@/lib/helperFunctions';

interface Video {
  id: number;
  title: string;
  description: string;
  url: string;
  thumbnail: string | null;
  duration: number | null;
  views: number;
  createdAt: string;
  user: {
    id: number;
    firstname: string;
    lastname: string;
  };
}

interface WatchLaterItem {
  id: number;
  videoId: number;
  addedAt: string;
  video: Video;
}

export default function WatchLaterPage() {
  const [items, setItems] = useState<WatchLaterItem[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchWatchLater = async () => {
      try {
        
        const res = await api.get('/getWatchLater'); 
        setItems(res.data.watchLater);
      } catch (error) {
        console.error('Failed to fetch watch later', error);
      } finally {
        setLoading(false);
      }
    };
    fetchWatchLater();
  }, []);

  const handleRemove = async (videoId: number) => {
    try {
      
      await api.post(`/removeFromWatchLater/${videoId}`);
      
      setItems((prev) => prev.filter((item) => item.videoId !== videoId));
    } catch (error) {
      console.error('Failed to remove video', error);
    }
  };

  if (loading) return <WatchLaterSkeleton />;

  const firstVideo = items.length > 0 ? items[0].video : null;
  const coverImage = firstVideo?.thumbnail || "https://placehold.co/600x400/1f2937/FFF?text=Empty";

  return (
    
    <div className="min-h-screen bg-[#0f0f0f] text-white p-6 md:p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* --- LEFT PANEL (Playlist Info) --- */}
        <div className="lg:col-span-4 xl:col-span-3">
          
          <div className="bg-gradient-to-b from-[#2a2a2a] to-[#0f0f0f] p-6 rounded-2xl sticky top-24 border border-[#3f3f3f] shadow-lg">

            <h1 className="text-2xl font-bold text-white mb-2">Watch Later</h1>
            
            <div className="text-sm font-medium text-gray-300 mb-1">
              {items.length} videos
            </div>
            <div className="text-xs text-[#aaaaaa] mb-6">
              Updated today
            </div>

            {/* Dark Mode Action Buttons */}
            <div className="flex flex-col gap-2">
              <button className="flex items-center justify-center gap-2 w-full bg-white text-black py-2.5 rounded-full font-medium hover:bg-gray-200 transition">
                <Play className="w-4 h-4 fill-current" /> Play all
              </button>
              <button className="flex items-center justify-center gap-2 w-full bg-[#272727] text-white py-2.5 rounded-full font-medium hover:bg-[#3f3f3f] transition border border-[#3f3f3f]">
                <Shuffle className="w-4 h-4" /> Shuffle
              </button>
            </div>
          </div>
        </div>

        {/* --- RIGHT PANEL (Video List) --- */}
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-2">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-[#aaaaaa]">
              <Clock className="w-12 h-12 mb-4 text-[#3f3f3f]" />
              <p>Your Watch Later list is empty.</p>
            </div>
          ) : (
            items.map((item, index) => (
              <div 
                key={item.id} 
                
                className="group relative flex flex-col sm:flex-row gap-4 p-3 rounded-xl hover:bg-[#272727] transition border border-transparent"
              >
                {/* Index */}
                <div className="hidden sm:flex items-center text-[#aaaaaa] font-medium text-sm w-6">
                  {index + 1}
                </div>

                {/* Video Thumbnail */}
                <Link
                  href={`/video/${item.video.id}`}
                  className="relative sm:w-64 sm:flex-shrink-0 aspect-video"
                >
                  <div className=" flex flex-col cursor-pointer group">
                    {/* Thumbnail */}
                    <div className="relative w-full aspect-video overflow-hidden rounded-xl bg-gray-200 dark:bg-gray-800">
                      <video
                        src={item.video.url}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                  </div>
                </Link>

                {/* Video Details */}
                <div className="flex-1 min-w-0 py-1">
                  <div className="flex justify-between items-start gap-2">
                    <Link href={`/video/${item.video.id}`}>
                       {/* 🌑 Text Color: White */}
                       <h3 className="text-base font-semibold text-white line-clamp-2 leading-tight mb-1 group-hover:text-blue-400 transition-colors">
                         {item.video.title}
                       </h3>
                    </Link>
                    
                    {/* Context Menu Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className=" md:absolute md:top-2 md:right-2 text-red-600 hover:bg-red-100"
                      onClick={() => handleRemove(item.videoId)}
                    >
                      <Trash2 className="w-4 h-4 " />
                      
                    </Button>
                  </div>

                  <div className="flex flex-col gap-1">
                    <Link href={`/channel/${item.video.user.id}`} className="text-sm text-[#aaaaaa] hover:text-white flex items-center gap-1 transition-colors">
                      {item.video.user.firstname} {item.video.user.lastname}
                      <CheckCircle2 className="w-3 h-3 text-[#aaaaaa]" />
                    </Link>
                    
                    <div className="text-xs text-[#aaaaaa]">
                      {formatNumber(item.video.views)} views • Added {new Date(item.addedAt).toLocaleDateString()}
                    </div>
                    
                    <p className="text-xs text-[#aaaaaa] mt-2 line-clamp-1 hidden md:block">
                      {item.video.description}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}

// 🌑 Dark Skeleton Loader
function WatchLaterSkeleton() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] p-8 text-white">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse">
        <div className="lg:col-span-4 h-96 bg-[#1f1f1f] rounded-2xl border border-[#2f2f2f]"></div>
        <div className="lg:col-span-8 space-y-4">
          {[1, 2, 3, 4].map((i) => (
             <div key={i} className="flex gap-4">
                <div className="w-48 h-28 bg-[#1f1f1f] rounded-lg"></div>
                <div className="flex-1 space-y-2 py-2">
                   <div className="h-4 bg-[#1f1f1f] rounded w-3/4"></div>
                   <div className="h-3 bg-[#1f1f1f] rounded w-1/4"></div>
                </div>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
}