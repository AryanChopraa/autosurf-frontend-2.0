'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-4 py-4">
      <nav className="mx-auto max-w-[90rem] rounded-[20px] bg-white/70 backdrop-blur-xl border border-black/5 shadow-lg">
        <div className="px-6">
          <div className="flex justify-between items-center h-14">
            {/* Logo and brand */}
            <Link href="/" className="flex items-center">
              <span className="text-xl font-[var(--font-serif)] font-medium tracking-tight text-[#1B1B1B]">autosurf.ai</span>
            </Link>

            {/* Auth Buttons / Dashboard */}
            <div className="flex items-center space-x-6">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="bg-[#1B1B1B] text-white px-5 py-2.5 rounded-[14px] text-sm font-medium transition-colors hover:bg-[#2C2C2C] flex items-center gap-2"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={signOut}
                    className="text-[#1B1B1B]/80 hover:text-[#1B1B1B] px-4 py-2 text-sm font-medium"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-[#1B1B1B]/80 hover:text-[#1B1B1B] px-4 py-2 text-sm font-medium"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    className="bg-[#1B1B1B] text-white px-5 py-2.5 rounded-[14px] text-sm font-medium transition-colors hover:bg-[#2C2C2C]"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
} 