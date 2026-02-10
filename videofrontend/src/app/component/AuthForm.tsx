"use client";

import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import api from "@/lib/axiosInstance";
import  router  from "next/navigation";


interface AuthFormProps {
  mode: "login" | "signup";
}

const AuthForm = ({ mode }: AuthFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const isLogin = mode === "login";

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  try {
    const endpoint = isLogin ? "/login" : "/register";

    const res = await api.post(endpoint, { email, password, firstname, lastname });
    login(res.data.user); 
    
  } catch (err: any) {
    setError(err.response?.data?.message || "Auth failed");
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="flex items-center justify-center xl:mr-[250px] bg-black px-4 py-8">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl p-6 sm:p-8 border border-gray-100">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-1 font-sans">
            <span className="text-3xl font-extrabold text-red-600">Video</span>
            <span className="text-3xl font-light text-gray-800">App</span>
          </Link>
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
          {isLogin ? "Sign in to continue" : "Join VideoApp"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="flex gap-4">
              <Input
                type="text"
                placeholder="First name"
                className="w-1/2  p-3 text-black border-gray-300 focus:border-red-600 focus:ring-red-600"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
                required
              />
              <Input
                type="text"
                placeholder="Last name"
                className="w-1/2  p-3 text-black border-gray-300 focus:border-red-600 focus:ring-red-600"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                required
              />
            </div>
          )}

          <div>
            <Input
              type="email"
              placeholder="Email address"
              className=" p-3 text-black border-gray-300 focus:border-red-600 focus:ring-red-600"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <Input
              type="password"
              placeholder="Password"
              className=" p-3 text-black border-gray-300 focus:border-red-600 focus:ring-red-600"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 text-center font-medium border border-red-100 bg-red-50 p-2 rounded-md">
              {error}
            </p>
          )}

          <Button
            type="submit"
            className={`w-full font-bold py-3 rounded-md transition duration-300 shadow-lg ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700 text-white shadow-red-500/50"
            }`}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                {isLogin ? "Signing in..." : "Creating account..."}
              </span>
            ) : isLogin ? (
              "SIGN IN"
            ) : (
              "SIGN UP"
            )}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          {isLogin ? (
            <>
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="text-red-600 font-semibold hover:underline"
              >
                Create one now
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-red-600 font-semibold hover:underline"
              >
                Sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
