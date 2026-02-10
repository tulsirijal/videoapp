"use client";

import { useAuth, AuthContextProvider } from "@/context/AuthContext"; 
import { SocketProvider } from "@/context/SocketContext";
import { Toaster } from "react-hot-toast";
import ClientLayout from "./ClientLayout";


function SocketWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useAuth(); 
  
  return (
    <SocketProvider userId={user?.id || null}>
      {children}
    </SocketProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthContextProvider>
      <SocketWrapper>
        <Toaster />
        
        <ClientLayout>
            {children}
        </ClientLayout>
      </SocketWrapper>
    </AuthContextProvider>
  );
}