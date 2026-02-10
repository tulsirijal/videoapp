"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axiosInstance";
import CommentItem from "./CommentItem";
import { Button } from "@/components/ui/button";
import { useSocket } from "@/context/SocketContext";

export default function CommentSection({ id }: { id: number }) {
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentError, setCommentError] = useState("");
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated } = useAuth();
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket || !id) return;
    socket.emit("join_comment_room", id);

    socket.on("new_comment", (data) => {
      if (data.videoId === id) {
        setComments((prevComments) => {
          if (data.parentId) {
            // It's a reply, find the parent comment and add the reply
            return prevComments.map((comment) => {
              if (comment.id === data.parentId) {
                return {
                  ...comment,
                  replies: [data, ...(comment.replies || [])],
                };
              }
              return comment;
            });
          } else {
            // It's a main comment, add it to the top level
            return [data, ...prevComments];
          }
        });
      }
    });

    return () => {
      socket.emit("leave_comment_room", id);
      socket.off("new_comment");
    };
  }, [socket, id]);

  const fetchComments = async () => {
    try {
      const res = await api.get(`/getComment/${id}`);
      setComments(res.data.comments);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [id]);

  const handlePostMainComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmitting || timeLeft > 0) return;

    setIsSubmitting(true);
    setCommentError("");

    try {
      await api.post(`/uploadComment/${id}`, { commentText });
      setCommentText("");
    } catch (err: any) {
      if (err.response?.status === 429) {
        setCommentError(err.response.data.message); 
        setTimeLeft(60);
      } else {
        setCommentError("An error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (commentError) {
      const timer = setTimeout(() => setCommentError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [commentError]);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  return (
    <div className="mt-8 max-w-3xl">
      <h3 className="text-xl font-bold mb-4 px-2">
        {comments.length} Comments
      </h3>

      {isAuthenticated && (
        <form onSubmit={handlePostMainComment} className="mb-8">
          <input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            disabled={timeLeft > 0} 
            placeholder={
              timeLeft > 0
                ? `Wait ${timeLeft}s to comment again...`
                : "Add a comment..."
            }
            className={`w-full bg-transparent border-b border-zinc-700 py-2 outline-none transition-colors ${
              timeLeft > 0
                ? "text-gray-500 cursor-not-allowed"
                : "focus:border-white"
            }`}
          />

          <div className="flex justify-end gap-2 mt-2">
            <Button
              variant="ghost"
              type="button"
              onClick={() => setCommentText("")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting || timeLeft > 0}
              className={`${timeLeft > 0 ? "bg-gray-600" : "bg-blue-600"} rounded-full min-w-[100px]`}
            >
              {isSubmitting
                ? "Posting..."
                : timeLeft > 0
                  ? `Wait ${timeLeft}s`
                  : "Comment"}
            </Button>
          </div>

          {commentError && (
            <p className="text-red-500 text-sm mt-2">{commentError}</p>
          )}
        </form>
      )}

      <div className="space-y-6">
        {loading ? (
          <div className="text-center text-gray-500">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-center text-gray-500">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          comments.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              videoId={id}
              setComments={setComments}
              commentError={commentError}
            />
          ))
        )}
      </div>
    </div>
  );
}
