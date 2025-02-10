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
                  <h1 className="text-[2.5rem] leading-[1.2] tracking-[-0.02em] font-thin text-[#1B1B1B] sm:text-6xl">
                    Your AI Automation Companion
                  </h1>
                  <p className="mt-6 text-lg sm:text-xl leading-relaxed text-[#1B1B1B]/70">
                    Autosurf is an advanced AI-powered platform that deploys autonomous agents to handle your web tasks. Simply describe what you need, and our intelligent agents will navigate, interact, and complete tasks across the web with human-like precision.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-4">
                    <Link
                      href="/dashboard"
                      className="bg-[#1B1B1B] text-white px-7 py-3 rounded-3xl text-sm font-medium transition-all hover:bg-[#2C2C2C] hover:scale-105"
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
                <h2 className="text-6xl text-[#1B1B1B] mb-4">
                  Workflow
                </h2>
                <p className="text-[#1B1B1B]/60 text-lg">
                  Transform your ideas into automated workflows in three simple steps
                </p>
              </div>

              {/* Workflow Steps - Horizontal Layout */}
              <div className="grid md:grid-cols-3 gap-12 mb-16">
                {/* Step 1 */}
                <div className="bg-white p-8 rounded-xl border border-black/5 relative group hover:border-black/10 transition-all shadow-sm hover:shadow-xl">
                  <div className="w-12 h-12 bg-[#1B1B1B] text-white rounded-lg flex items-center justify-center mb-4 text-sm font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium mb-2">Describe Your Task</h3>
                  <p className="text-[#1B1B1B]/60 text-sm">
                    Simply tell our AI what you want to accomplish in natural language. No coding or technical knowledge required.
                  </p>
                  {/* Right Arrow for desktop */}
                  <div className="absolute -right-8 top-1/2 transform -translate-y-1/2 z-10 text-black/20 hidden md:block">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="bg-white p-8 rounded-xl border border-black/5 relative group hover:border-black/10 transition-all shadow-sm hover:shadow-xl">
                  <div className="w-12 h-12 bg-[#1B1B1B] text-white rounded-lg flex items-center justify-center mb-4 text-sm font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium mb-2">AI Takes Action</h3>
                  <p className="text-[#1B1B1B]/60 text-sm">
                    Our autonomous AI agent navigates the web, performs actions, and completes your task with precision and efficiency.
                  </p>
                  {/* Right Arrow for desktop */}
                  <div className="absolute -right-8 top-1/2 transform -translate-y-1/2 z-10 text-black/20 hidden md:block">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="bg-white p-8 rounded-xl border border-black/5 group hover:border-black/10 transition-all shadow-sm hover:shadow-xl">
                  <div className="w-12 h-12 bg-[#1B1B1B] text-white rounded-lg flex items-center justify-center mb-4 text-sm font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium mb-2">Save & Reuse</h3>
                  <p className="text-[#1B1B1B]/60 text-sm">
                    Save your automation for future use, schedule recurring tasks, or modify them as needed. Your workflows are always at your fingertips.
                  </p>
                </div>
              </div>
              
              {/* Saved Automations Preview - Bottom */}
              {/* <div className="mt-8 flex justify-center">
                <div className="relative rounded-xl overflow-hidden border border-black/5 shadow-xl hover:shadow-2xl transition-all duration-300 max-w-[800px] w-full mx-auto opacity-90">
                  <Image
                    src="/hero3.png"
                    alt="Saved Automations Dashboard"
                    width={800}
                    height={450}
                    className="w-full"
                  />
                </div>
              </div> */}
            </div>
          </section>

          {/* Features Section */}
         
        </div>
      </div>
      <Footer />
    </div>
  );
}


