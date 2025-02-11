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
        <div className="pt-16 md:pt-20">
          {/* Hero Section */}
          <section className="relative py-12 sm:py-16 md:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                <div className="text-center md:text-left">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[2.5rem] xl:text-6xl leading-[1.2] tracking-[-0.02em] font-thin text-[#1B1B1B]">
                    Your AI Automation Companion
                  </h1>
                  <p className="mt-4 md:mt-6 text-base sm:text-lg md:text-xl leading-relaxed text-[#1B1B1B]/70 max-w-xl mx-auto md:mx-0">
                    Autosurf is an advanced AI-powered platform that deploys autonomous agents to handle your web tasks. Simply describe what you need, and our intelligent agents will navigate, interact, and complete tasks across the web with human-like precision.
                  </p>
                  <div className="mt-6 md:mt-8 flex flex-wrap gap-4 justify-center md:justify-start">
                    <Link
                      href="/dashboard"
                      className="bg-[#1B1B1B] text-white px-6 md:px-7 py-2.5 md:py-3 rounded-3xl text-sm font-medium transition-all hover:bg-[#2C2C2C] hover:scale-105"
                    >
                      Get Started
                    </Link>
                  </div>
                </div>
                {/* Dashboard Preview */}
                <div className="relative mt-8 md:mt-0">
                  <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white/90 z-10 md:hidden"></div>
                  <div className="relative rounded-2xl overflow-hidden border border-black/5 shadow-lg hover:shadow-xl transition-all">
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
          <section className="py-16 md:py-20 bg-gradient-to-b from-gray-50/50 to-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
                <h2 className="text-4xl md:text-5xl lg:text-6xl text-[#1B1B1B] mb-4">
                  Workflow
                </h2>
                <p className="text-[#1B1B1B]/60 text-base md:text-lg">
                  Transform your ideas into automated workflows in three simple steps
                </p>
              </div>

              {/* Workflow Steps - Grid Layout */}
              <div className="grid md:grid-cols-3 gap-6 md:gap-12 mb-16">
                {/* Step 1 */}
                <div className="bg-white p-6 md:p-8 rounded-xl border border-black/5 relative group hover:border-black/10 transition-all shadow-sm hover:shadow-xl">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-[#1B1B1B] text-white rounded-lg flex items-center justify-center mb-4 text-sm font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <h3 className="text-base md:text-lg font-medium mb-2">Describe Your Task</h3>
                  <p className="text-[#1B1B1B]/60 text-sm">
                    Simply tell our AI what you want to accomplish in natural language. No coding or technical knowledge required.
                  </p>
                  {/* Right Arrow for desktop */}
                  <div className="absolute -right-6 md:-right-8 top-1/2 transform -translate-y-1/2 z-10 text-black/20 hidden md:block">
                    <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="bg-white p-6 md:p-8 rounded-xl border border-black/5 relative group hover:border-black/10 transition-all shadow-sm hover:shadow-xl">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-[#1B1B1B] text-white rounded-lg flex items-center justify-center mb-4 text-sm font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-base md:text-lg font-medium mb-2">AI Takes Action</h3>
                  <p className="text-[#1B1B1B]/60 text-sm">
                    Our autonomous AI agent navigates the web, performs actions, and completes your task with precision and efficiency.
                  </p>
                  {/* Right Arrow for desktop */}
                  <div className="absolute -right-6 md:-right-8 top-1/2 transform -translate-y-1/2 z-10 text-black/20 hidden md:block">
                    <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="bg-white p-6 md:p-8 rounded-xl border border-black/5 group hover:border-black/10 transition-all shadow-sm hover:shadow-xl">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-[#1B1B1B] text-white rounded-lg flex items-center justify-center mb-4 text-sm font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                  </div>
                  <h3 className="text-base md:text-lg font-medium mb-2">Save & Reuse</h3>
                  <p className="text-[#1B1B1B]/60 text-sm">
                    Save your automation for future use, schedule recurring tasks, or modify them as needed. Your workflows are always at your fingertips.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}


