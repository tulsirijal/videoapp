"use client";
import { Video } from '@/types/videoType';

const VideoCard = ({ title, url, views, createdAt, user }: Video) => {

  const formatTimeAgo = (date: string | Date) => {
    const now = new Date();
    const then = new Date(date);
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return "just now";
  };

  const initials = `${user.firstname.charAt(0)}${user.lastname.charAt(0)}`.toUpperCase();

  return (
    <div className="flex flex-col cursor-pointer group w-full">
      <div className="relative w-full aspect-video overflow-hidden rounded-xl bg-gray-200 dark:bg-gray-800 shadow-sm">
        <video
          src={url}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 ease-out"
          muted
          onMouseOver={(e) => e.currentTarget.play()}
          onMouseOut={(e) => {
            e.currentTarget.pause();
            e.currentTarget.currentTime = 0;
          }}
        />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
      </div>


      <div className="mt-3 flex gap-3 px-1">

        <div className="flex-shrink-0">
          {user.avatar ? (
            <img 
              src={user.avatar} 
              alt={user.firstname} 
              className="h-10 w-10 rounded-full object-cover border border-gray-100 dark:border-gray-700" 
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
              {initials}
            </div>
          )}
        </div>


        <div className="flex flex-col pr-2 overflow-hidden">
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {title}
          </h3>
          
          <div className="mt-1 flex flex-col">
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium hover:text-gray-900 dark:hover:text-gray-200 transition-colors">
              {user.firstname} {user.lastname}
            </p>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-500">
              <span>{views.toLocaleString()} views</span>
              <span className="mx-1 text-[10px]">•</span>
              <span>{formatTimeAgo(createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;