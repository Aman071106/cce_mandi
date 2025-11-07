"use client";

import React, { useState, useEffect, useContext } from "react";
import { fetchForumPosts, addCommentToPost, ForumPost } from "@/lib/actions";
import { UserContext } from "@/context/user-context";
import { getUserDoc } from "@/lib/actions";
import toast from "react-hot-toast";
import { MessageSquare, User, Clock, Send } from "lucide-react";

const ForumPage = () => {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState<{ [key: string]: string }>({});
  const [expandedPosts, setExpandedPosts] = useState<{ [key: string]: boolean }>({});
  const { currentUserID } = useContext(UserContext);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    loadPosts();
    loadUserData();
  }, [currentUserID]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const forumPosts = await fetchForumPosts();
      setPosts(forumPosts);
    } catch (error) {
      toast.error("Failed to load forum posts");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async () => {
    if (currentUserID) {
      try {
        const userData = await getUserDoc(currentUserID);
        setUserName(userData.personalDetails?.fullName || "Anonymous");
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!currentUserID) {
      toast.error("Please login to comment");
      return;
    }

    const content = commentContent[postId]?.trim();
    if (!content) {
      toast.error("Comment cannot be empty");
      return;
    }

    try {
      await addCommentToPost(postId, content, currentUserID, userName, "");
      setCommentContent(prev => ({ ...prev, [postId]: "" }));
      toast.success("Comment added!");
      loadPosts(); // Reload to get updated comments
    } catch (error) {
      toast.error("Failed to add comment");
      console.error(error);
    }
  };

  const togglePostExpansion = (postId: string) => {
    setExpandedPosts(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Unknown date";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-12 mt-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-12 mt-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Discussion Forum</h1>
          <p className="text-gray-600 text-lg">Join the conversation and share your thoughts</p>
        </div>

        {posts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No discussions yet</h3>
            <p className="text-gray-600">Be the first to start a conversation!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map(post => (
              <div key={post.id} id={`post-${post.id}`} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                {/* Post Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="text-xl font-semibold text-gray-800">{post.title}</h2>
                    <button
                      onClick={() => togglePostExpansion(post.id)}
                      className="text-slate-600 hover:text-slate-800 transition-colors"
                    >
                      <MessageSquare size={20} />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <User size={16} />
                      <span>{post.authorName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={16} />
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare size={16} />
                      <span>{post.comments?.length || 0} comments</span>
                    </div>
                  </div>
                </div>

                {/* Post Content */}
                <div className="p-6">
                  <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
                </div>

                {/* Comments Section */}
                {expandedPosts[post.id] && (
                  <div className="border-t border-gray-200">
                    {/* Comments List */}
                    <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                      <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                        <MessageSquare size={18} />
                        Comments ({post.comments?.length || 0})
                      </h4>
                      
                      {post.comments && post.comments.length > 0 ? (
                        post.comments.map(comment => (
                          <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                <User size={14} className="text-gray-500" />
                                <span className="font-medium text-gray-800 text-sm">
                                  {comment.authorName}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">
                                {formatDate(comment.createdAt)}
                              </span>
                            </div>
                            <p className="text-gray-700 text-sm">{comment.content}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm text-center py-4">
                          No comments yet. Be the first to comment!
                        </p>
                      )}
                    </div>

                    {/* Add Comment Form */}
                    <div className="p-6 border-t border-gray-200 bg-gray-50">
                      <div className="flex gap-3">
                        <input
                          type="text"
                          placeholder="Write a comment..."
                          value={commentContent[post.id] || ""}
                          onChange={(e) => setCommentContent(prev => ({
                            ...prev,
                            [post.id]: e.target.value
                          }))}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleAddComment(post.id);
                            }
                          }}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          disabled={!commentContent[post.id]?.trim()}
                          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Send size={16} />
                          Post
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ForumPage;