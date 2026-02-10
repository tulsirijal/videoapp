"use client";

import { useState, FormEvent, DragEvent, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axiosInstance";
import {
  Upload,
  X,
  Loader2,
  Sparkles,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Film,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function UploadForm() {
  const { isAuthenticated } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [status, setStatus] = useState<{
    type: "error" | "success" | null;
    msg: string;
  }>({ type: null, msg: "" });

  const router = useRouter();

  // Handle Video Preview & Cleanup
  useEffect(() => {
    if (!videoFile) {
      setVideoPreview(null);
      return;
    }
    const url = URL.createObjectURL(videoFile);
    setVideoPreview(url);
    return () => URL.revokeObjectURL(url); 
  }, [videoFile]);

  
  const generateAiDescription = async () => {
    if (!title)
      return setStatus({
        type: "error",
        msg: "Enter a title first for the AI to work!",
      });
    setIsGeneratingAi(true);
    try {
      const res = await api.post("/generateDescription", { title });
      setDescription(res.data.description);
    } catch (err) {
      setStatus({ type: "error", msg: "AI failed to respond. Try again." });
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated)
      return setStatus({ type: "error", msg: "Please log in." });
    if (!videoFile)
      return setStatus({ type: "error", msg: "Missing video file." });

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("videoFile", videoFile);
    if (thumbnailFile) formData.append("thumbnail", thumbnailFile);

    try {
      setLoading(true);
      const res = await api.post("/uploadVideo", formData, {
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 100)
          );
          setUploadProgress(percent);
        },
      });
      setStatus({ type: "success", msg: "Video published! Redirecting..." });
      setTimeout(() => router.push("/studio"), 2000);
    } catch (err: any) {
      setStatus({
        type: "error",
        msg: "Upload failed. Check file size/format.",
      });
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-[#282828] text-white rounded-2xl shadow-2xl overflow-hidden border border-zinc-700">
      <div className="px-6 py-4 border-b border-zinc-700 flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Film className="text-red-500" /> Upload Video
        </h2>
        {loading && (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-zinc-400">
              Uploading {uploadProgress}%
            </span>
            <div className="w-32 h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        
        <div className="lg:col-span-2 space-y-6">
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase">
              Title
            </label>
            <input
              className="w-full bg-[#121212] border border-zinc-700 p-3 rounded-lg mt-1 focus:border-blue-500 outline-none"
              placeholder="Add a title that describes your video"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-zinc-500 uppercase">
                Description
              </label>
              <button
                type="button"
                onClick={generateAiDescription}
                disabled={isGeneratingAi || !title}
                className="flex items-center gap-1.5 text-[11px] font-bold text-blue-400 hover:text-blue-300 disabled:opacity-30"
              >
                {isGeneratingAi ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Sparkles size={12} />
                )}
                {isGeneratingAi ? "Thinking..." : "Generate with AI"}
              </button>
            </div>
            <textarea
              className="w-full bg-[#121212] border border-zinc-700 p-3 rounded-lg mt-1 h-40 resize-none focus:border-blue-500 outline-none text-sm"
              placeholder="Tell viewers about your video"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        
        <div className="space-y-6">
          <div className="aspect-video bg-black rounded-xl overflow-hidden border border-zinc-700 relative">
            {videoPreview ? (
              <video src={videoPreview} controls className="w-full h-full" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 bg-zinc-900">
                <Upload size={40} className="mb-2 opacity-20" />
                <p className="text-xs">Preview will appear here</p>
              </div>
            )}
          </div>

          <div
            onDrop={(e) => {
              e.preventDefault();
              setVideoFile(e.dataTransfer.files[0]);
            }}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-zinc-700 p-6 rounded-xl text-center hover:border-blue-500 transition group"
          >
            <p className="text-sm text-zinc-400 mb-4">
              {videoFile
                ? `Selected: ${videoFile.name}`
                : "Drag and drop your video file"}
            </p>
            <label className="bg-white text-black px-4 py-2 rounded-full font-bold text-sm cursor-pointer hover:bg-zinc-200">
              SELECT FILE
              <input
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
              />
            </label>
          </div>

          {status.type && (
            <div
              className={`p-3 rounded-lg flex items-center gap-2 text-sm ${
                status.type === "success"
                  ? "bg-green-500/10 text-green-500"
                  : "bg-red-500/10 text-red-500"
              }`}
            >
              {status.type === "success" ? (
                <CheckCircle2 size={16} />
              ) : (
                <AlertCircle size={16} />
              )}
              {status.msg}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !videoFile || !title}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : "PUBLISH VIDEO"}
          </button>
        </div>
      </form>
    </div>
  );
}
