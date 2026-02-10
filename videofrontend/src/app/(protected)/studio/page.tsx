"use client";
import { useEffect, useState } from "react";
import api from "@/lib/axiosInstance";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Eye, ThumbsUp, Users, Video, Trash2, Edit } from "lucide-react";
import { useSocket } from "@/context/SocketContext";

export default function StudioDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [subCount, setSubCount] = useState(0);
  const {socket} = useSocket();

  useEffect(() => {
    const fetchStudioData = async () => {
      try {
        const res = await api.get("/studioStats");
        setData(res.data);
        setSubCount(res.data.summary.subscriberCount);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchStudioData();
  }, []);

  useEffect(()=>{
    if(!socket) return;
    socket.emit("join_channel_room", data?.summary?.channelId);

    socket.on("update_sub_count", (data)=>{
      setSubCount(data.subscriptionCount);
    });
    return ()=>{
      socket.emit("leave_channel_room", data?.summary?.channelId);
      socket.off("update_sub_count");
    }
  }, [socket, data]);

  if (loading) return <div className="p-10 text-zinc-500">Loading Studio...</div>;

  return (

    <div className="w-full max-w-full overflow-x-hidden p-4 md:p-8 space-y-8">
      <h1 className="text-2xl font-bold">Channel Content</h1>

      {/* ---  Summary Cards --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Views" value={data.summary.totalViews} icon={<Eye />} />
        <StatCard title="Subscribers" value={subCount} icon={<Users />} />
        <StatCard title="Total Likes" value={data.summary.totalLikes} icon={<ThumbsUp />} />
        <StatCard title="Videos" value={data.summary.totalVideos} icon={<Video />} />
      </div>

      {/* ---  Analytics Chart --- */}
      <div className="bg-zinc-900/50 p-4 md:p-6 rounded-2xl border border-zinc-800 min-w-0 w-full">
        <h2 className="text-lg font-bold mb-6">Top Video Performance</h2>
        <div className="h-[250px] md:h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#71717a" 
                fontSize={10} 
                tick={{fill: '#71717a'}} 
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                stroke="#71717a" 
                fontSize={10} 
                tick={{fill: '#71717a'}} 
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '8px' }}
                cursor={{fill: 'transparent'}}
              />
              <Bar dataKey="views" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* --- Video Management Table --- */}
      <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 w-full">

        <div className="overflow-x-auto w-full max-w-[calc(100vw-2rem)] md:max-w-full no-scrollbar">
          <table className="w-full text-left border-collapse min-w-[700px] table-fixed">
            <thead className="bg-zinc-800/50 text-zinc-400 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 w-[40%]">Video</th>
                <th className="px-6 py-4 w-[20%]">Date</th>
                <th className="px-6 py-4 w-[15%]">Views</th>
                <th className="px-6 py-4 w-[10%] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {data.videos.map((v: any) => (
                <tr key={v.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <video src={v.videoUrl} className="w-16 md:w-24 aspect-video rounded-md object-cover flex-shrink-0 bg-zinc-800" />
                      <span className="font-medium text-xs md:text-sm line-clamp-2">{v.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs md:text-sm text-zinc-400">
                    {new Date(v.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-xs md:text-sm font-semibold">{v.views.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex justify-end gap-1">
                      <button className="p-2 hover:bg-zinc-700 rounded-full text-zinc-400"><Edit size={16}/></button>
                      <button className="p-2 hover:bg-zinc-700 rounded-full text-zinc-400 hover:text-red-400"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: any) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-zinc-400 text-xs font-medium">{title}</span>
        <div className="text-blue-500">{icon}</div>
      </div>
      <div className="text-2xl font-bold">{value.toLocaleString()}</div>
    </div>
  );
}