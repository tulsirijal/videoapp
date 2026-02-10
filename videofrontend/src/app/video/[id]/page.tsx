"use client";
import SingleVideoCard from "@/app/component/SingleVideoCard";
import { useEffect, useRef, useState } from "react";
import { Video } from "@/types/videoType";
import api from "@/lib/axiosInstance";
import { useAuth } from "@/context/AuthContext";
import { useParams } from "next/navigation";

interface VideoRes {
  message: Video;
}
export default function VideoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [video, setVideo] = useState<Video>();
  const [videoExists, setVideoExists] = useState(false);
  const { id } = useParams();

  const { isAuthenticated } = useAuth();
 
  const hasRecordedRef = useRef(false);

  useEffect(() => {
    
    if (!isAuthenticated || !id) return;
    hasRecordedRef.current = false;
    const timer = setTimeout(async () => {
      
      if (!hasRecordedRef.current) {
        try {
          console.log(`Recording history for video ${id}...`);
          await api.post(`/addHistory/${id}`);
          hasRecordedRef.current = true; 
        } catch (error) {
          console.error("Failed to record history:", error);
        }
      }
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
  }, [id, isAuthenticated]);

  useEffect(() => {
    const getVideo = async () => {
      try {
        const res = await api.get<VideoRes>(`/video/${id}`);
        setVideo(res.data.message);
        if (res.data.message) {
          setVideoExists(true);
        }
      } catch (error) {
        console.log(error);
      }
    };
    getVideo();
  }, []);

  if (!videoExists) {
    return <div>Video does not exist</div>;
  }
  return video ? <SingleVideoCard {...video} /> : <div>Loading...</div>;
}
