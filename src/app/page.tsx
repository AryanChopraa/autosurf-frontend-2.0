import Link from "next/link";
import Navbar from '@/components/Navbar';
import BackgroundTexture from '@/components/BackgroundTexture';
import Footer from '@/components/Footer';

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white via-white to-black/5">
      <BackgroundTexture opacity="0.015" />
      <div className="relative z-10">
        <Navbar />
        <div className="pt-20">
          {/* Hero Section */}
          <section className="relative py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-4xl mx-auto">
                <h1 className="text-[2.5rem] leading-[1.2] tracking-[-0.02em] font-medium text-[#1B1B1B] sm:text-6xl">
                  What is Autosurf?
                </h1>
                <p className="mt-6 text-xl leading-relaxed text-[#1B1B1B]/80">
                  Autosurf is your AI-powered Swiss Army Knife for web automation and information discovery. It&apos;s not just about automating tasks; it&apos;s about empowering you to do more—whether you&apos;re looking to streamline workflows, collect data, or explore new possibilities.
                </p>
                <div className="mt-10 flex flex-wrap gap-4 justify-center">
                  <Link
                    href="/signup"
                    className="bg-[#1B1B1B] text-white px-6 py-3 rounded-xl text-sm transition-colors hover:bg-[#2C2C2C]"
                  >
                    Get Started Free
                  </Link>
                  <Link
                    href="/features"
                    className="bg-black/5 text-[#1B1B1B] px-6 py-3 rounded-xl text-sm hover:bg-black/10 transition-colors"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          
          {/* How It Works Section */}
          <section className="py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl font-medium text-[#1B1B1B] mb-4">
                  How Autosurf Works
                </h2>
                <p className="text-[#1B1B1B]/70 text-lg leading-relaxed">
                  Our platform uses advanced AI to understand and automate your web tasks. Simply describe what you want to do, and let Autosurf handle the rest.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}


