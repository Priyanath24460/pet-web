"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User, LogOut, Loader2, Search } from "lucide-react";
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";
import { auth } from "../lib/firebase/config";
import toast from "react-hot-toast";

export default function AuthMenu() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success("Signed out successfully");
    } catch (error) {
      toast.error("Error signing out");
    }
  };

  return (
    <div className="flex items-center gap-4 sm:gap-6">
      <button className="text-slate-600 hover:text-[#007BFF] transition">
        <Search className="w-5 h-5" />
      </button>

      {loading ? (
        <div className="hidden sm:flex items-center justify-center w-[120px] h-[44px]">
          <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
        </div>
      ) : user ? (
        <div className="hidden sm:flex items-center gap-2 bg-blue-50/50 pl-1.5 pr-3 py-1.5 rounded-full border border-blue-100">
          <Link href="/profile" className="flex items-center gap-2 hover:opacity-80 transition">
            <div className="w-8 h-8 rounded-full bg-[#007BFF] text-white flex items-center justify-center font-bold text-sm shadow-sm">
              {user.displayName ? user.displayName.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
            </div>
            <span className="font-semibold text-slate-700 text-sm max-w-[100px] truncate">
              {user.displayName || "User"}
            </span>
          </Link>
          <div className="w-[1px] h-4 bg-blue-200 mx-1"></div>
          <button 
            onClick={handleSignOut}
            className="text-slate-400 hover:text-red-500 transition p-1"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <Link href="/login" className="hidden sm:flex items-center gap-2 bg-[#007BFF] hover:bg-blue-700 text-white px-6 py-2.5 rounded-full font-medium transition shadow-sm shadow-blue-200/50">
          <User className="w-4 h-4" />
          Sign In
        </Link>
      )}
    </div>
  );
}
