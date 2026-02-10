"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axiosInstance";
import { Bell, User } from "lucide-react";
import Link from "next/link";

interface Channel {
  id: string;
  firstname?: string;
  lastname?: string;
  username?: string;
  avatar?: string;
  subscribers?: number;
}

interface Subscription {
  id: string;
  subscribedTo: Channel;
}

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const res = await api.get("/getSubscriptions");
        setSubs(res.data.subscriptions);
      } catch (error) {
        console.error("Failed to load subscriptions", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0f0f0f]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-600 border-t-blue-500"></div>
      </div>
    );
  }

  return (

      <div className="w-full bg-black text-white p-4">
        <div className="">
          <h1 className="text-2xl font-bold mb-6 text-center">All Subscriptions</h1>

          {subs.length === 0 ? (
            <div className="flex flex-col items-center justify-center mt-20 text-gray-400">
              <User size={64} className="mb-4 opacity-50" />
              <p className="text-lg">You haven't subscribed to anyone yet.</p>
            </div>
          ) : (
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {subs.map((sub) => {
                const channel = sub.subscribedTo;
                const channelName = channel.firstname
                  ? `${channel.firstname} ${channel.lastname || ""}`
                  : channel.username || "Unknown Channel";

                return (
                  <div
                    key={sub.id}
                    className="flex flex-col items-center justify-center p-4 rounded-lg hover:bg-[#272727] transition-colors cursor-pointer group"
                  >
                    <Link
                      href={`/channel/${channel.id}`}
                      className="flex flex-col items-center w-full"
                    >
                      {/* Avatar */}
                      <div className="relative mb-3">
                        {channel.avatar ? (
                          <img
                            src={channel.avatar}
                            alt={channelName}
                            className="w-24 h-24 rounded-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-full bg-purple-600 flex items-center justify-center text-3xl font-bold group-hover:scale-105 transition-transform duration-200">
                            {channelName[0]?.toUpperCase()}
                          </div>
                        )}
                      </div>

                      
                      <h3 className="text-base font-semibold text-center text-gray-100 truncate w-full">
                        {channelName}
                      </h3>

                      
                      <p className="text-xs text-gray-400 mb-3">
                        @{channel.username || "user"}
                        {channel.subscribers !== undefined &&
                          ` • ${channel.subscribers} subscribers`}
                      </p>
                    </Link>

                    
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#272727] text-gray-300 rounded-full text-sm font-medium hover:bg-[#3f3f3f] hover:text-white transition-colors">
                      <Bell size={16} />
                      Subscribed
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
  );
}
