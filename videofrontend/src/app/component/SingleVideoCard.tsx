"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ThumbsDown, ThumbsUp, ChevronDown, ChevronUp } from "lucide-react";
import api from "@/lib/axiosInstance";
import { Video } from "@/types/videoType";
import CommentSection from "./CommentSection";
import { formatNumber } from "@/lib/helperFunctions";
import Link from "next/link";
import { useSocket } from "@/context/SocketContext";
import { useAuth } from "@/context/AuthContext";

interface User {
  id: number;
  firstname: string;
  lastname: string;
  _count: {
    subscribers: number;
  };
}
interface UserRes {
  user: User;
}

const VideoPlayerPage = ({
  id,
  title,
  description,
  createdAt,
  url,
  views,
  userId,
  _count,
}: Video) => {
  const [user, setUser] = useState<User | null>(null);
  const [subscribed, setSubscribed] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(_count.likes);
  const [viewsCount, setViewsCount] = useState(views);
  const [liveViews, setLiveViews] = useState(0);
  const { socket } = useSocket();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!socket || !id) return;

    socket.emit("join_video_room", id);

    socket.on("current_views", (data) => {
      if (data.videoId === id) {
        setViewsCount(data.views);
      }
    });

    socket.on("live_viewers", (data) => {
      if (data.videoId === id) {
        setLiveViews(data.roomSize);
      }
    });

    // heartbeat

    const heartbeatInterval = setInterval(() => {
      socket.emit("heartbeat", { videoId: id });
    }, 30000); // every 30 seconds

    return () => {
      socket.emit("leave_video_room", id);
      socket.off("live_viewers");
      socket.off("current_views");
      clearInterval(heartbeatInterval);
    };
  }, [socket, id]);

  useEffect(() => {
    // Fetch channel user info
    const getUserInfo = async () => {
      try {
        const res = await api.get<UserRes>(`/getUser/${userId}`);
        setUser(res.data.user);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };
    getUserInfo();
  }, [userId]);

  const handleLikeClick = async () => {
    setLiked(!liked);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
    try {
      await api.post(`/likeVideo/${id}`);
    } catch (error) {
      console.log(error);
      setLiked(liked);
      setLikeCount((prev) => (liked ? prev + 1 : prev - 1));
    }
  };
  const handleSubscribe = async () => {
    setSubscribed(!subscribed);
    try {
      await api.post(`/subscribe/${userId}`);
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddViews = async () => {
    if (!isAuthenticated) return;
    try {
      await api.post(`/addViews/${id}`);
    } catch (error) {
      console.error("Failed to add views:", error);
    }
  };

  useEffect(() => {
    handleAddViews();
  }, [id]);

  useEffect(() => {
    const isSubsribedToChannel = async () => {
      try {
        const doesSubscritionExist = await api.post(`/isSubscribed`, {
          channelId: userId,
        });
        console.log(doesSubscritionExist);
        if (doesSubscritionExist.data.subscribed) {
          setSubscribed(true);
        }
      } catch (error) {
        console.log(error);
      }
    };
    isSubsribedToChannel();
  }, [userId]);

  useEffect(() => {
    const checkLikeStatus = async () => {
      try {
        const res = await api.get(`/isLiked/${id}`);
        setLiked(res.data.liked);
      } catch (error) {
        console.error("Failed to sync like status:", error);
      }
    };

    
    if (isAuthenticated && id) {
      checkLikeStatus();
    } else {
      
      setLiked(false);
    }
  }, [id, isAuthenticated]);

  const publishedDate = new Date(createdAt).toLocaleDateString();

  return (
    <div className="max-w-[1300px] mx-auto md:p-4 flex flex-col lg:flex-row gap-6">
      <div className="flex-grow lg:max-w-[850px] w-full">
        <div className="relative w-full aspect-video overflow-hidden rounded-xl bg-black shadow-lg">
          <video controls src={url} className="object-cover w-full h-full" />
        </div>

        <h1 className="text-xl md:text-2xl font-bold text-white px-2 mt-4 mb-2">
          {title}
        </h1>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center px-2 py-2 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-lg">
              {user?.firstname?.[0].toUpperCase() || "U"}
            </div>
            <div>
              <Link
                href={`/channel/${userId}`}
                className="font-semibold text-xs md:text-md text-gray-900 dark:text-white hover:underline"
              >
                {user
                  ? `${user.firstname} ${user.lastname || ""}`
                  : "Unknown Channel"}
              </Link>
              <p className="text-xs text-gray-300 font-medium -mt-1">
                {formatNumber(user?._count?.subscribers || 0)} subscribers
              </p>
            </div>

            <Button
              onClick={handleSubscribe}
              className="bg-red-600 text-white font-bold hover:bg-red-700"
              disabled={!isAuthenticated}
            >
              {subscribed ? "Subscribed" : "Subscribe"}
            </Button>
          </div>

          <div className="flex items-center bg-gray-100 rounded-full self-start">
            <div className="flex items-center gap-1 px-4 py-2 hover:bg-gray-200 transition rounded-l-full cursor-pointer">
              <ThumbsUp
                onClick={handleLikeClick}
                size={18}
                className={`${liked ? "text-red-600" : "text-gray-700"}`}
              />
              <span className="font-semibold text-sm text-gray-700">
                {formatNumber(likeCount)}
              </span>
            </div>
            <span className="h-5 w-px bg-gray-300"></span>
            <div className="px-4 py-2 hover:bg-gray-200 transition rounded-r-full cursor-pointer">
              <ThumbsDown size={18} className="text-gray-700" />
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition">
          <div className="flex items-center gap-4 text-sm font-semibold">
            <span className="text-gray-900">
              {formatNumber(viewsCount)} views
            </span>

            {/* ---LIVE VIEWERS BADGE --- */}
            <div className="flex items-center gap-1 bg-red-100 text-red-600 px-2 py-0.5 rounded-md animate-pulse">
              <span className="w-2 h-2 bg-red-600 rounded-full"></span>
              <span>{formatNumber(liveViews)} watching now</span>
            </div>
            {/* ------------------------------ */}

            <span className="text-gray-700">{publishedDate}</span>
          </div>

          <div
            className={`mt-2 text-gray-700 whitespace-pre-wrap ${
              showDescription ? "" : "line-clamp-2"
            }`}
          >
            {description ||
              "The uploader has not provided a description for this video."}
          </div>

          <button
            onClick={() => setShowDescription((prev) => !prev)}
            className="mt-1 text-sm font-semibold text-gray-600 hover:text-gray-900 flex items-center"
          >
            {showDescription ? (
              <>
                Show less <ChevronUp size={16} className="ml-1" />
              </>
            ) : (
              <>
                Show more <ChevronDown size={16} className="ml-1" />
              </>
            )}
          </button>
        </div>

        <CommentSection id={id} />
      </div>
    </div>
  );
};

export default VideoPlayerPage;
