'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import { useState } from 'react';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-4 py-4">
      <nav className="mx-auto max-w-[90rem] rounded-[20px] bg-white/70 backdrop-blur-xl border border-black/5 shadow-lg">
        <div className="px-6">
          <div className="flex justify-between items-center h-14">
            {/* Logo and brand */}
            <Link href="/" className="flex items-center">
              <span className="text-xl font-[var(--font-serif)] font-medium tracking-tight text-[#1B1B1B]">autosurf.ai</span>
            </Link>

            {/* Auth Buttons / Profile */}
            <div className="flex items-center space-x-6">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center space-x-2"
                  >
                    <div className="w-9 h-9 rounded-[14px] bg-black/5 flex items-center justify-center hover:bg-black/10 transition-colors">
                      {user.email ? (
                        <span className="text-[#1B1B1B] font-medium text-sm">
                          {user.email[0].toUpperCase()}
                        </span>
                      ) : (
                        <Image
                          src={user.user_metadata?.avatar_url || '/default-avatar.png'}
                          alt="Profile"
                          width={36}
                          height={36}
                          className="rounded-[14px]"
                        />
                      )}
                    </div>
                  </button>

                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-lg py-1.5 border border-black/5">
                      <Link
                        href="/profile"
                        className="block px-4 py-2.5 text-sm text-[#1B1B1B] hover:bg-black/5"
                        onClick={() => setShowDropdown(false)}
                      >
                        Profile
                      </Link>
                      <button
                        onClick={() => {
                          signOut();
                          setShowDropdown(false);
                        }}
                        className="block w-full text-left px-4 py-2.5 text-sm text-[#1B1B1B] hover:bg-black/5"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
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