"use client"
import { User } from "@/types/userType";
import { Video } from "@/types/videoType";
import { useEffect, useState } from "react";
import { formatDate } from "@/lib/helperFunctions";
import axios from "axios";
import { useParams } from "next/navigation";
import api from "@/lib/axiosInstance";
interface Subscriber {
    id:number;
    subscriberId:number;
    subscribedToId:number;
    createdAt:Date;
}

interface UserInfo extends User {
    videos:Video[],
    subscriptions:any[],
    likes:any[],
    subscribers:Subscriber[]
}

interface UserInfoRes {
    userInfo:UserInfo
}


export default function UserInfoCard() {
    
    const [info,setInfo] = useState<UserInfo | undefined>(undefined);
    const {channelId} = useParams()
    useEffect(()=>{
        const getUserInfo = async()=>{
            const res = await api.get<UserInfoRes>(`/getUserInfo/${channelId}`);
            console.log(res.data.userInfo);
            setInfo(res.data.userInfo);
        }
        getUserInfo()
    },[]);

    const fullName = info ? `${info.firstname} ${info.lastname}` : 'Loading...';
    const initials = info ? `${info.firstname[0]}${info.lastname[0]}`.toUpperCase() : 'U';

    if (!info) {
        
        return (
            <div className="mx-4 my-5 flex justify-center">
                <div className="max-w-md w-full p-6 bg-white rounded-xl shadow-lg animate-pulse">
                    <div className="flex flex-col items-center">
                        <div className="h-20 w-20 rounded-full bg-gray-200 mb-4"></div>
                        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
                        <div className="flex justify-between w-full space-x-4">
                            <div className="h-10 bg-gray-200 rounded flex-1"></div>
                            <div className="h-10 bg-gray-200 rounded flex-1"></div>
                            <div className="h-10 bg-gray-200 rounded flex-1"></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

  return (
    <div className="mx-4 my-5 flex justify-center">
            
            <div className="max-w-md w-full p-6 bg-white rounded-xl shadow-2xl transition-all duration-300 hover:shadow-red-300/50">

               
                <div className="flex flex-col items-center border-b pb-4 mb-4 border-gray-100">
                    
                    {/* Avatar */}
                    <div className="relative h-20 w-20 mb-3">
                        <div className="h-full w-full rounded-full bg-red-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-white ring-2 ring-red-600 shadow-md">
                            {initials}
                        </div>
                        
                        <span className="absolute bottom-0 right-0 h-4 w-4 bg-green-500 rounded-full border-2 border-white"></span>
                    </div>

                    
                    <h2 className="text-xl font-extrabold text-gray-900 line-clamp-1">{fullName}</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        @{info.firstname.toLowerCase()}_{info.lastname.toLowerCase()}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{info.email}</p>
                </div>

                
                <div className="flex justify-around text-center mb-6">
                    <div className="flex-1 px-2 border-r border-gray-100">
                        <p className="text-2xl font-bold text-red-600">{info.subscribers.length}</p>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Subscribers</p>
                    </div>
                    <div className="flex-1 px-2 border-r border-gray-100">
                        <p className="text-2xl font-bold text-gray-800">{info.videos.length}</p>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Videos</p>
                    </div>
                    <div className="flex-1 px-2">
                        <p className="text-2xl font-bold text-gray-800">{info.likes.length}</p>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Total Likes</p>
                    </div>
                </div>

                
                <div className="space-y-3">
                    <p className="text-sm text-gray-600 flex justify-between items-center border-b pb-2">
                        <span className="font-medium text-gray-500">Member Since:</span>
                        <span className="font-semibold text-gray-800">{formatDate(info.createdAt)}</span>
                    </p>
                    <p className="text-sm text-gray-600 flex justify-between items-center border-b pb-2">
                        <span className="font-medium text-gray-500">Videos Uploaded:</span>
                        <span className="font-semibold text-gray-800">{info.videos.length}</span>
                    </p>
                    <p className="text-sm text-gray-600 flex justify-between items-center">
                        <span className="font-medium text-gray-500">Subscriptions:</span>
                        <span className="font-semibold text-gray-800">{info.subscriptions.length}</span>
                    </p>
                </div>

                
                <div className="mt-6 pt-4 border-t border-gray-100">
                    <button 
                        className="w-full py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition duration-150 shadow-lg shadow-red-500/50"
                        
                        onClick={() => console.log('Viewing full channel page...')} 
                    >
                        View Full Channel
                    </button>
                </div>
            </div>
        </div>
  )
}
