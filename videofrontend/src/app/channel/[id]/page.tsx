"use client";

import { useEffect, useState, useRef, use } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/axiosInstance";
import { Bell, ChevronDown, Search, Edit2, Trash2, X, MoreVertical } from "lucide-react";
import { Video } from "@/types/videoType";
import VideoCard from "@/app/component/VideoCard";
import { formatNumber } from "@/lib/helperFunctions";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

interface ChannelData {
  id: number;
  firstname: string;
  lastname?: string;
  avatarUrl?: string;
  description?: string;
  videos: Video[];
  _count: {
    subscribers: number;
  };
}

export default function ChannelProfile() {
  const { id } = useParams();
  

  const {user} = useAuth();
  const loggedInUserId = user?.id;
  const isOwner = Number(id) === loggedInUserId;

  const [channel, setChannel] = useState<ChannelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [activeTab, setActiveTab] = useState("Videos");


  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchChannelInfo = async () => {
      if (!id) return;
      try {
        const res = await api.get(`/getChannelInfoWithVideos/${id}`);
        setChannel(res.data.channelInfo);
      } catch (error) {
        console.error("Error fetching channel info:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchChannelInfo();
  }, [id]);


  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const handleDeleteVideo = async (videoId: number) => {
    if (!window.confirm("Delete this video permanently?")) return;
    try {
      await api.post(`/removeVideo/${videoId}`);
      setChannel((prev) => 
        prev ? { ...prev, videos: prev.videos.filter(v => v.id !== videoId) } : null
      );
    } catch (error) {
      alert("Failed to delete video.");
    }
  };

  const handleUpdateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo) return;
    setIsUpdating(true);
    try {
      await api.post(`/editVideo/${editingVideo.id}`, {
        title: editingVideo.title,
        description: editingVideo.description,
      });
      setChannel((prev) => 
        prev ? {
          ...prev,
          videos: prev.videos.map(v => v.id === editingVideo.id ? editingVideo : v)
        } : null
      );
      setEditingVideo(null);
    } catch (error) {
      alert("Failed to update video.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!channel) return <div className="text-white text-center mt-20">Channel not found.</div>;

  const displayName = `${channel.firstname} ${channel.lastname || ""}`.trim();

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white w-full overflow-x-hidden pb-20">
      

      <div className="h-28 md:h-52 w-full bg-gradient-to-r from-zinc-800 to-zinc-900" />


      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-center md:items-start text-center md:text-left">
          <div className="flex-shrink-0">
             {channel.avatarUrl ? (
                <img src={channel.avatarUrl} alt={displayName} className="w-24 h-24 md:w-40 md:h-40 rounded-full object-cover" />
             ) : (
                <div className="w-24 h-24 md:w-40 md:h-40 rounded-full bg-indigo-600 flex items-center justify-center text-4xl md:text-5xl font-bold">
                  {channel.firstname[0].toUpperCase()}
                </div>
             )}
          </div>

          <div className="flex-grow flex flex-col gap-2 md:gap-3">
            <h1 className="text-2xl md:text-3xl font-bold">{displayName}</h1>
            <div className="text-zinc-400 text-xs md:text-sm flex flex-wrap justify-center md:justify-start items-center gap-2">
              <span className="font-medium">@{channel.firstname.toLowerCase()}</span>
              <span>•</span>
              <span>{formatNumber(channel._count.subscribers)} subscribers</span>
              <span>•</span>
              <span>{channel.videos.length} videos</span>
            </div>

            <div className="text-zinc-400 text-xs md:text-sm max-w-2xl flex items-center justify-center md:justify-start gap-1">
              <span className="line-clamp-1">{channel.description || "No description available."}</span>
              <ChevronDown size={14} />
            </div>

            <div className="mt-2 flex gap-2 justify-center md:justify-start">
              {isOwner ? (
                <>
                  <button className="bg-zinc-800 hover:bg-zinc-700 px-4 py-1.5 rounded-full font-medium text-xs md:text-sm">
                    Customize channel
                  </button>
                  <button className="bg-zinc-800 hover:bg-zinc-700 px-4 py-1.5 rounded-full font-medium text-xs md:text-sm">
                    Manage videos
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setIsSubscribed(!isSubscribed)}
                  className={`px-6 py-1.5 rounded-full font-medium text-xs md:text-sm ${
                    isSubscribed ? 'bg-zinc-800 text-zinc-200' : 'bg-white text-black'
                  }`}
                >
                  {isSubscribed ? 'Subscribed' : 'Subscribe'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>


      <div className="border-b border-zinc-800 sticky top-0 bg-[#0f0f0f] z-10 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center">
            <nav className="flex gap-4 md:gap-8 overflow-x-auto no-scrollbar">
            {['Home', 'Videos', 'Shorts', 'Playlists'].map((tab) => (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 pt-4 font-medium text-xs md:text-sm border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab ? 'text-white border-white' : 'text-zinc-500 border-transparent hover:text-zinc-200'
                  }`}
                >
                  {tab}
                </button>
            ))}
            </nav>
        </div>
      </div>


      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
            {channel.videos.map((video) => (
                <div key={video.id} className="relative group">
                    <Link href={`/video/${video.id}`}>
                      <VideoCard {...video} />
                    </Link>
                    
                    
                    {isOwner && (
                      <div className="absolute top-1 right-1" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => setActiveMenuId(activeMenuId === video.id ? null : video.id)}
                          className="p-1.5 bg-black/40 hover:bg-black/80 rounded-full transition-colors backdrop-blur-sm"
                        >
                          <MoreVertical size={20} className="text-white" />
                        </button>

            
                        {activeMenuId === Number(video.id) && (
                          <div className="absolute right-0 mt-2 w-36 bg-zinc-800 border border-zinc-700 rounded-xl shadow-2xl z-20 py-1 overflow-hidden">
                            <button 
                              onClick={() => { setEditingVideo(video); setActiveMenuId(null); }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-zinc-700 text-left"
                            >
                              <Edit2 size={16} /> Edit
                            </button>
                            <button 
                              onClick={() => { handleDeleteVideo(Number(video.id)); setActiveMenuId(null); }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-zinc-700 text-red-400 text-left border-t border-zinc-700"
                            >
                              <Trash2 size={16} /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                </div>
            ))}
        </div>
      </div>


      {editingVideo && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
          <div className="bg-zinc-900 w-full max-w-xl rounded-2xl border border-zinc-800 shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <h2 className="text-lg font-bold">Edit details</h2>
              <button onClick={() => setEditingVideo(null)} className="p-2 hover:bg-zinc-800 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateVideo} className="p-5 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[11px] text-zinc-500 font-bold uppercase">Title</label>
                <input 
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-blue-500 outline-none p-3 rounded-lg text-sm"
                  value={editingVideo.title}
                  onChange={(e) => setEditingVideo({...editingVideo, title: e.target.value})}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-zinc-500 font-bold uppercase">Description</label>
                <textarea 
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-blue-500 outline-none p-3 rounded-lg text-sm h-32 resize-none"
                  value={editingVideo.description || ""}
                  onChange={(e) => setEditingVideo({...editingVideo, description: e.target.value})}
                />
              </div>

              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setEditingVideo(null)} className="text-sm px-4">Cancel</button>
                <button 
                  type="submit" 
                  disabled={isUpdating}
                  className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-full text-sm font-medium disabled:opacity-50"
                >
                  {isUpdating ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}