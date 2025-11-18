"use client";

import React, { useState, useEffect, useContext } from "react";
import { fetchForumPosts, ForumPost } from "@/lib/actions";
import { UserContext } from "@/context/user-context";
import { getUserDoc } from "@/lib/actions";
import toast from "react-hot-toast";
import { MessageSquare, User, Clock, ExternalLink } from "lucide-react";

const ForumPage = () => {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
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

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Unknown date";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="no-scrollbar min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-12 mt-10 px-4 sm:px-6 lg:px-8">
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
          <p className="text-gray-600 text-lg">Admin posts and announcements</p>
        </div>

        {posts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No discussions yet</h3>
            <p className="text-gray-600">Check back later for updates!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map(post => (
              <div key={post.id} id={`post-${post.id}`} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                {/* Post Header */}
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-800 mb-3">{post.title}</h2>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <User size={16} />
                      <span>{post.authorName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={16} />
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Post Content */}
                <div className="p-6">
                  <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
                </div>

                {/* Relevant Links */}
                {post.relevantLinks && post.relevantLinks.length > 0 && (
                  <div className="p-6 border-t border-gray-200 bg-gray-50">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <ExternalLink size={18} />
                      Relevant Links
                    </h4>
                    <div className="space-y-2">
                      {post.relevantLinks.map((link, index) => (
                        <a 
                          key={index}
                          href={link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="block text-blue-600 hover:text-blue-800 hover:underline text-sm"
                        >
                          {link}
                        </a>
                      ))}
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