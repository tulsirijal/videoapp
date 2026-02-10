"use client"
import { useAuth } from "@/context/AuthContext";
import AuthForm from "../component/AuthForm";
import { useRouter } from "next/navigation";
import { useEffect } from "react";


export default function LoginPage() {
  const {isAuthenticated} = useAuth();
  const router = useRouter();

  useEffect(()=>{
      if(isAuthenticated) {
      router.push('/')
    }
  },[isAuthenticated])
  
  return <AuthForm mode="login" />;
}
