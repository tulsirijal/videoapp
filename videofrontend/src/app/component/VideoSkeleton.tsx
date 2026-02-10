export default function VideoSkeleton() {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      {/* Thumbnail */}
      <div className="aspect-video w-full bg-zinc-800 rounded-xl" />
      <div className="flex gap-3 px-1">
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-zinc-800 flex-shrink-0" />
        <div className="flex flex-col gap-2 w-full">
          {/* Title */}
          <div className="h-4 bg-zinc-800 rounded w-3/4" />
          {/* Metadata */}
          <div className="h-3 bg-zinc-800 rounded w-1/2" />
        </div>
      </div>
    </div>
  );
}