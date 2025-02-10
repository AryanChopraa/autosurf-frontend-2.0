import Link from "next/link";
import Navbar from '@/components/Navbar';
import BackgroundTexture from '@/components/BackgroundTexture';
import Footer from '@/components/Footer';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white via-white to-black/5">
      <BackgroundTexture opacity="0.01" />
      <div className="relative z-10">
        <Navbar />
        <div className="pt-16">
          {/* Hero Section */}
          <section className="relative py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="text-left">
                  <h1 className="text-[2.5rem] leading-[1.2] tracking-[-0.02em] font-semibold text-[#1B1B1B] sm:text-6xl">
                    Your AI Automation Companion
                  </h1>
                  <p className="mt-6 text-lg sm:text-xl leading-relaxed text-[#1B1B1B]/70">
                    Autosurf is an advanced AI-powered platform that deploys autonomous agents to handle your web tasks. Simply describe what you need, and our intelligent agents will navigate, interact, and complete tasks across the web with human-like precision.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-4">
                    <Link
                      href="/dashboard"
                      className="bg-[#1B1B1B] text-white px-7 py-3 rounded-lg text-sm font-medium transition-all hover:bg-[#2C2C2C] hover:scale-105"
                    >
                      Get Started
                    </Link>
                  </div>
                </div>
                {/* Dashboard Preview */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white/90 z-10 md:hidden"></div>
                  <div className="relative rounded-2xl overflow-hidden border border-black/5">
                    <Image
                      src="/hero2.png"
                      alt="Autosurf Dashboard"
                      width={1000}
                      height={562}
                      className="w-full z-10"
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Workflow Section */}
          <section className="py-20 bg-gradient-to-b from-gray-50/50 to-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="max-w-3xl mx-auto text-center mb-16">
                <h2 className="text-3xl font-semibold text-[#1B1B1B] mb-4">
                  How It Works
                </h2>
                <p className="text-[#1B1B1B]/60 text-lg">
                  Transform your ideas into automated workflows in three simple steps
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-12 items-start">
                {/* Saved Automations Preview - Left Side */}
                <div className="relative">
                  <div className="sticky top-8">
                    <div className="relative rounded-xl overflow-hidden border border-black/5 shadow-lg">
                      <Image
                        src="/hero1.png"
                        alt="Saved Automations Dashboard"
                        width={1000}
                        height={562}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Workflow Steps - Right Side */}
                <div className="space-y-6">
                  {/* Step 1 */}
                  <div className="bg-white p-6 rounded-xl border border-black/5 relative group hover:border-black/10 transition-all">
                    <div className="w-10 h-10 bg-[#1B1B1B] text-white rounded-lg flex items-center justify-center mb-4 text-sm font-medium">
                      1
                    </div>
                    <h3 className="text-lg font-medium mb-2">Describe Your Task</h3>
                    <p className="text-[#1B1B1B]/60 text-sm">
                      Simply tell our AI what you want to accomplish in natural language. No coding or technical knowledge required.
                    </p>
                    {/* Down Arrow */}
                    <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 z-10 text-black/20">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="rotate-90">
                        <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  {/* Step 2 */}
                  <div className="bg-white p-6 rounded-xl border border-black/5 relative group hover:border-black/10 transition-all">
                    <div className="w-10 h-10 bg-[#1B1B1B] text-white rounded-lg flex items-center justify-center mb-4 text-sm font-medium">
                      2
                    </div>
                    <h3 className="text-lg font-medium mb-2">AI Takes Action</h3>
                    <p className="text-[#1B1B1B]/60 text-sm">
                      Our autonomous AI agent navigates the web, performs actions, and completes your task with precision and efficiency.
                    </p>
                    {/* Down Arrow */}
                    <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 z-10 text-black/20">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="rotate-90">
                        <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  {/* Step 3 */}
                  <div className="bg-white p-6 rounded-xl border border-black/5 group hover:border-black/10 transition-all">
                    <div className="w-10 h-10 bg-[#1B1B1B] text-white rounded-lg flex items-center justify-center mb-4 text-sm font-medium">
                      3
                    </div>
                    <h3 className="text-lg font-medium mb-2">Save & Reuse</h3>
                    <p className="text-[#1B1B1B]/60 text-sm">
                      Save your automation for future use, schedule recurring tasks, or modify them as needed. Your workflows are always at your fingertips.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
         
        </div>
      </div>
      <Footer />
    </div>
  );
}


