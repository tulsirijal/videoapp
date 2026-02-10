"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import toast from "react-hot-toast";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface SocketContextType {
  socket: Socket | null;
  onlineUsers: number;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  onlineUsers: 0,
});

export const SocketProvider = ({
  children,
  userId,
}: {
  children: React.ReactNode;
  userId: number | null;
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {

    const socketQuery = userId ? { userId: userId.toString() } : {};


      const newSocket = io(apiUrl, {
        query: socketQuery,
        withCredentials: true,
      });

      newSocket.on("newNotification", (data) => {
        const senderName = `${data.sender.firstname} ${data.sender.lastname}`;

        let message = "";
        if (data.type === "LIKE") message = `${senderName} liked your video!`;
        else if (data.type === "COMMENT")
          message = `${senderName} commented on your video.`;
        else if (data.type === "SUBSCRIBE")
          message = `${senderName} subscribed to your channel!`;
        else if (data.type === "REPLY")
          message = `${senderName} replied to your comment.`;
        else message = `You have a new notification from ${senderName}.`;

        toast.success(message, {
          duration: 4000,
          position: "top-right",
          icon: "🔔",
        });
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    
  }, [userId]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers: 0 }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
