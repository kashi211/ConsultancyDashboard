"use client";

import { useState } from "react";
import { Comment } from "@/lib/schema";
import { MessageSquare, CornerDownRight } from "lucide-react";

interface Props {
  opportunityId: number;
  comments: Comment[];
  onNewComment: (content: string, author: string, parentId?: number) => Promise<void>;
}

function timeAgo(date: Date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function CommentNode({ comment, replies, depth, onReply }: {
  comment: Comment;
  replies: Comment[];
  depth: number;
  onReply: (parentId: number, content: string, author: string) => Promise<void>;
}) {
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyAuthor, setReplyAuthor] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!replyText.trim()) return;
    setSubmitting(true);
    await onReply(comment.id, replyText, replyAuthor || "Anonymous");
    setReplyText("");
    setReplyAuthor("");
    setReplying(false);
    setSubmitting(false);
  }

  return (
    <div className={depth > 0 ? "ml-6 border-l-2 border-gray-100 pl-4" : ""}>
      <div className="py-2">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
            {comment.author.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium text-gray-800">{comment.author}</span>
          <span className="text-xs text-gray-400">{timeAgo(comment.createdAt)}</span>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed pl-8">{comment.content}</p>
        <button
          onClick={() => setReplying(r => !r)}
          className="mt-1 ml-8 text-xs text-indigo-500 hover:text-indigo-700 flex items-center gap-1"
        >
          <CornerDownRight size={12} /> Reply
        </button>
        {replying && (
          <div className="ml-8 mt-2 space-y-2">
            <input
              className="w-full border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Your name"
              value={replyAuthor}
              onChange={e => setReplyAuthor(e.target.value)}
            />
            <textarea
              className="w-full border rounded-lg px-3 py-1.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
              rows={2}
              placeholder="Write a reply..."
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
            />
            <div className="flex gap-2">
              <button onClick={submit} disabled={submitting}
                className="px-3 py-1 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                {submitting ? "Sending..." : "Send"}
              </button>
              <button onClick={() => setReplying(false)}
                className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg hover:bg-gray-200">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
      {replies.map(r => (
        <CommentNode key={r.id} comment={r} replies={[]} depth={depth + 1} onReply={onReply} />
      ))}
    </div>
  );
}

export default function CommentThread({ opportunityId, comments, onNewComment }: Props) {
  const [text, setText] = useState("");
  const [author, setAuthor] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const topLevel = comments.filter(c => !c.parentId);
  const replies = (parentId: number) => comments.filter(c => c.parentId === parentId);

  async function submitTop() {
    if (!text.trim()) return;
    setSubmitting(true);
    await onNewComment(text, author || "Anonymous");
    setText("");
    setSubmitting(false);
  }

  async function handleReply(parentId: number, content: string, replyAuthor: string) {
    await onNewComment(content, replyAuthor, parentId);
  }

  return (
    <div className="mt-4 border-t pt-4">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare size={14} className="text-gray-400" />
        <span className="text-sm font-medium text-gray-600">{comments.length} comment{comments.length !== 1 ? "s" : ""}</span>
      </div>

      {topLevel.length > 0 && (
        <div className="space-y-1 mb-4">
          {topLevel.map(c => (
            <CommentNode key={c.id} comment={c} replies={replies(c.id)} depth={0} onReply={handleReply} />
          ))}
        </div>
      )}

      <div className="space-y-2">
        <input
          className="w-full border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder="Your name"
          value={author}
          onChange={e => setAuthor(e.target.value)}
        />
        <textarea
          className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
          rows={2}
          placeholder="Add a comment or edit suggestion..."
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <button onClick={submitTop} disabled={submitting || !text.trim()}
          className="px-4 py-1.5 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
          {submitting ? "Posting..." : "Post comment"}
        </button>
      </div>
    </div>
  );
}
