"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axiosInstance";
import {  ChevronDown, ChevronUp, } from "lucide-react";

interface CommentItemProps {
  comment: any;
  videoId: number;
  setComments: any;
  commentError: string;
}

export default function CommentItem({ comment, videoId, setComments, commentError }: CommentItemProps) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState("");

const handleReply = async () => {
  if (!replyText.trim()) return;
  try {
    const res = await api.post(`/uploadComment/${videoId}`, {
      commentText: replyText,
      parentId: comment.id,
    });
    

    setReplyText("");
    setShowReplyInput(false);
    setShowReplies(true);
  } catch (err) { console.error(err); }
};

  return (
    <div className="flex gap-3 group">
      
      <div className="h-10 w-10 rounded-full bg-zinc-800 flex-shrink-0 flex items-center justify-center font-bold">
        {comment.user.firstname[0]}
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold">@{comment.user.firstname.toLowerCase()}</span>
          <span className="text-xs text-zinc-500">
            {new Date(comment.createdAt).toLocaleDateString()}
          </span>
        </div>
        <p className="text-sm mt-1 text-zinc-200">{comment.commentText}</p>

        
        <div className="flex items-center gap-4 mt-2">
          <button 
            onClick={() => setShowReplyInput(!showReplyInput)}
            className="text-xs font-bold text-zinc-400 hover:text-white flex items-center gap-1"
          >
            Reply
          </button>
        </div>

        
        {showReplyInput && (
          <div className="mt-3 flex flex-col gap-2">
            <input
              autoFocus
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Add a reply..."
              className="w-full bg-transparent border-b border-zinc-700 py-1 text-sm outline-none"
            />
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => setShowReplyInput(false)}>Cancel</Button>
              <Button size="sm" className="bg-blue-600 rounded-full" onClick={handleReply}>Reply</Button>
            </div>
          </div>
        )}

        
        {comment.replies?.length > 0 && (
          <button 
            onClick={() => setShowReplies(!showReplies)}
            className="mt-2 text-blue-400 text-xs font-bold flex items-center gap-1 hover:bg-blue-400/10 px-2 py-1 rounded-full"
          >
            {showReplies ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
          </button>
        )}

        
        {showReplies && comment.replies && (
          <div className="mt-4 space-y-4 border-l-2 border-zinc-800 pl-4">
            {comment.replies.map((reply: any) => (
              <div key={reply.id} className="flex gap-2">
                 <div className="h-6 w-6 rounded-full bg-zinc-700 text-[10px] flex items-center justify-center font-bold">
                    {reply.user.firstname[0]}
                 </div>
                 <div>
                    <span className="text-[11px] font-bold">@{reply.user.firstname.toLowerCase()}</span>
                    <p className="text-sm text-zinc-300">{reply.commentText}</p>
                 </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}