'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

export default function Navbar() {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-4 py-4 md:mx-20 mx-2">
      <nav className="mx-auto max-w-[90rem] rounded-[50px] bg-white/70 backdrop-blur-xl border border-black/5 shadow-lg">
        <div className="px-4 md:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo and brand */}
            <Link href="/" className="flex items-center">
              <Image src="/aslogo.png" alt="Autosurf.ai" width={40} height={40} className="object-contain mr-2" />
              <span className="text-lg md:text-xl font-[var(--font-serif)] font-medium tracking-tight text-[#1B1B1B]">autosurf</span>
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {user ? (
                <Link
                  href="/dashboard"
                  className="bg-[#1B1B1B] text-white px-6 py-3 rounded-[20px] text-sm font-medium transition-colors hover:bg-[#2C2C2C] flex items-center gap-2"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="bg-gray-100 hover:bg-gray-200 text-[#1B1B1B]/80 hover:text-[#1B1B1B] px-6 py-3 rounded-[20px] text-sm font-medium transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    className="bg-[#1B1B1B] text-white px-6 py-3 rounded-[20px] text-sm font-medium transition-colors hover:bg-[#2C2C2C]"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100">
              {user ? (
                <Link
                  href="/dashboard"
                  className="block bg-[#1B1B1B] text-white px-4 py-2 rounded-[15px] text-sm font-medium transition-colors hover:bg-[#2C2C2C] text-center mb-2"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block bg-gray-100 text-[#1B1B1B]/80 px-4 py-2 rounded-[15px] text-sm font-medium transition-colors hover:bg-gray-200 text-center mb-2"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    className="block bg-[#1B1B1B] text-white px-4 py-2 rounded-[15px] text-sm font-medium transition-colors hover:bg-[#2C2C2C] text-center"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </nav>
    </div>
  );
} 