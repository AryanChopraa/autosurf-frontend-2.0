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
                  Autosurf is your AI-powered Swiss Army Knife for web automation and information discovery. It's not just about automating tasks; it's about empowering you to do more—whether you're looking to streamline workflows, collect data, or explore new possibilities.
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
          <section className="py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
                {features.map((feature) => (
                  <div key={feature.name} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-black/5 hover:shadow-lg transition-all">
                    <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-medium text-[#1B1B1B] mb-2">
                      {feature.name}
                    </h3>
                    <p className="text-[#1B1B1B]/70 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

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

const features = [
  {
    name: 'AI-Powered Automation',
    description: 'Leverage advanced AI to automate complex web interactions and workflows with minimal setup.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    ),
  },
  {
    name: 'Data Collection',
    description: 'Extract and organize web data efficiently with our powerful scraping and data processing tools.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
      </svg>
    ),
  },
  {
    name: 'Workflow Automation',
    description: 'Create and manage complex automation workflows with our intuitive visual builder.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
];
