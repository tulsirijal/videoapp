'use client'
import { useEffect } from "react";
import AuthForm from "../component/AuthForm";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";;

export default function SignupPage() {
  const {isAuthenticated} = useAuth();
      const router = useRouter();
    
      useEffect(()=>{
          if(isAuthenticated) {
          router.push('/')
        }
      },[isAuthenticated])
  return <AuthForm mode="signup" />;
}
