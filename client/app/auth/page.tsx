"use client";

import { useState } from "react";
import {
  Eye,
  EyeOff,
  GraduationCap,
  Users,
  FileText,
  BookOpen,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState<FormDataInterface>({
    name: "",
    email: "",
    password: "",
    role: "STUDENT",
  });

  const toggleMode = () => {
    setIsLogin(!isLogin);
  };

  interface FormDataInterface {
    name: string;
    email: string;
    password: string;
    role: "STUDENT" | "ADMIN";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSubmit = async (
    e: React.MouseEvent<HTMLButtonElement>,
    isSignup: boolean
  ): Promise<void> => {
    e.preventDefault();

    if (!emailRegex.test(formData.email)) {
      alert("Please enter a valid email address.");
      return;
    }

    try {
      if (isSignup) {
        // Signup
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/signup`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          }
        );

        const data = await res.json();

        if (!res.ok) {
          alert(data.message || "Registration failed");
          return;
        }

        console.log("Signup successful:", data);

        const loginResult = await signIn("credentials", {
          redirect: false,
          email: formData.email,
          password: formData.password,
        });

        if (loginResult?.error) {
          alert("Login after signup failed");
          return;
        }

        const sessionRes = await fetch("/api/auth/session");
        const sessionData = await sessionRes.json();

        const role = sessionData?.user?.role;
        router.push(
          role === "ADMIN" ? "/admin/dashboard" : "/student/dashboard"
        );
        return;
      }

      // Login
      const result = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (result?.error) {
        alert("Invalid credentials");
      } else {
        alert("Login successful!");
        const sessionRes = await fetch("/api/auth/session");
        const sessionData = await sessionRes.json();

        const role = sessionData?.user?.role;
        router.push(
          role === "ADMIN" ? "/admin/dashboard" : "/student/dashboard"
        );
        return;
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred");
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-blue-600 via-blue-700 to-blue-900 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-10 left-10 w-64 h-64 bg-blue-400 rounded-full opacity-20 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-300 rounded-full opacity-20 blur-3xl animate-pulse"></div>

        <div className="relative z-10 text-center max-w-xl">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-white p-4 rounded-2xl shadow-2xl">
              <GraduationCap className="w-12 h-12 text-blue-600" />
            </div>
          </div>

          <h1 className="text-6xl font-bold mb-4 text-white">EduSync</h1>

          <p className="text-xl text-blue-100 mb-12 leading-relaxed">
            Your comprehensive platform for managing academic excellence
          </p>

          <div className="relative mb-8">
            <div className="absolute inset-0 bg-white rounded-full opacity-20 blur-2xl"></div>
            <Image
              src="/auth-image.png"
              alt="Education"
              height={320}
              width={320}
              className="relative z-10 mx-auto rounded-full shadow-2xl border-8 border-white/30 w-120 h-80 object-cover"
            />
          </div>

          <div className="flex flex-wrap gap-3 justify-center mt-8">
            <div className="bg-white/20 backdrop-blur-md rounded-full px-6 py-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-white" />
              <span className="text-white font-medium text-sm">
                Manage Groups
              </span>
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-full px-6 py-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-white" />
              <span className="text-white font-medium text-sm">
                Track Assignments
              </span>
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-full px-6 py-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-white" />
              <span className="text-white font-medium text-sm">
                Share Resources
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-linear-to-br from-gray-50 to-blue-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center mb-8">
            <div className="bg-linear-to-br from-blue-600 to-blue-800 p-3 rounded-xl shadow-lg">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold ml-3 bg-linear-to-r from-blue-600 to-blue-900 bg-clip-text text-transparent">
              EduSync
            </h1>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-10 border border-blue-100">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {isLogin ? "Welcome Back" : "Get Started"}
              </h2>
              <p className="text-gray-500">
                {isLogin
                  ? "Sign in to continue your journey"
                  : "Create your account to begin"}
              </p>
            </div>

            <div className="space-y-5">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="placeholder:text-gray-400 w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="placeholder:text-gray-400 w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="placeholder:text-gray-400 w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    I am a
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, role: "STUDENT" })
                      }
                      className={`relative flex items-center justify-center px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                        formData.role === "STUDENT"
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 bg-gray-50 hover:border-gray-300"
                      }`}
                    >
                      <span
                        className={`font-semibold ${
                          formData.role === "STUDENT"
                            ? "text-blue-700"
                            : "text-gray-600"
                        }`}
                      >
                        Student
                      </span>
                      {formData.role === "STUDENT" && (
                        <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, role: "ADMIN" })
                      }
                      className={`relative flex items-center justify-center px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                        formData.role === "ADMIN"
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 bg-gray-50 hover:border-gray-300"
                      }`}
                    >
                      <span
                        className={`font-semibold ${
                          formData.role === "ADMIN"
                            ? "text-blue-700"
                            : "text-gray-600"
                        }`}
                      >
                        Teacher
                      </span>
                      {formData.role === "ADMIN" && (
                        <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={(e) => handleSubmit(e, !isLogin)}
                className="w-full py-4 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mt-6"
              >
                {isLogin ? "Sign In" : "Create Account"}
              </button>
            </div>

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                {isLogin
                  ? "Don't have an account?"
                  : "Already have an account?"}{" "}
                <button
                  onClick={toggleMode}
                  className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-gray-500 mt-6">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
