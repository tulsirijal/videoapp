"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import VideoCard from "./VideoCard";
import VideoSkeleton from "./VideoSkeleton";
import Link from "next/link";
import api from "@/lib/axiosInstance";
import { Video } from "@/types/videoType";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

const VideoGrid = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await api.get("/videos");
        setVideos(res.data.message);
      } finally { setLoading(false); }
    };
    fetchVideos();
  }, []);

  return (
    <div className="max-w-[2000px] mx-auto sm:px-6 lg:px-10 py-6">
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4  gap-x-4 gap-y-10">
          {[...Array(8)].map((_, i) => <VideoSkeleton key={i} />)}
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4  gap-x-4 gap-y-10"
        >
          {videos.map((video) => (
            <motion.div variants={itemVariants} key={video.id}>
              <Link href={`/video/${video.id}`} className="group">
                <VideoCard {...video} />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default VideoGrid;