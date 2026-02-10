"use client"
import {Video} from '@/types/videoType'

const VideoCard = ({ id,title,thumbnail,createdAt,duration,url,views }:Video) => {

  return (
    <div className=" flex flex-col cursor-pointer group">
      {/* Thumbnail */}
      <div className="relative w-full aspect-video overflow-hidden md:rounded-xl bg-gray-200 dark:bg-gray-800">
        <video
          src={url}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Video Info */}
      <div className="mt-2 flex flex-col px-2">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
          {title}
        </h3>
        <p className="text-sm text-gray-300 dark:text-gray-300">
          {views} views 
        </p>
      </div>
    </div>
  );
};

export default VideoCard;
