import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500 selection:text-white">
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600"></div>
            <span className="text-xl font-bold tracking-tight">Learnoir</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/signin" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Log in
            </Link>
            <Link
              href="/auth/signup"
              className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black transition-all hover:bg-gray-200 hover:scale-105"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden pt-20">
        {/* Background Gradients */}
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-purple-600/30 blur-[120px] animate-pulse-slow"></div>
        <div className="absolute top-40 -right-40 h-[500px] w-[500px] rounded-full bg-indigo-600/30 blur-[120px] animate-pulse-slow" style={{ animationDelay: '1s' }}></div>

        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center lg:px-8">
          <div className="mb-8 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-indigo-300 backdrop-blur-md animate-fadeIn hover-glow">
            <span className="mr-2 flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
            AI Career Navigation System
          </div>
          <h1 className="bg-gradient-to-b from-white to-gray-400 bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-7xl animate-fadeIn" style={{ animationDelay: '0.1s' }}>
            Your Path to <br /><span className="gradient-text">Dream Career</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-400 sm:text-xl max-w-2xl mx-auto animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            Personal AI coach that creates your learning roadmap, tracks progress, and prepares you for interviews. One guided journey from resume to offer.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-x-6 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
            <Link
              href="/auth/signup"
              className="group relative flex items-center gap-2 rounded-full bg-indigo-600 px-8 py-4 text-base font-semibold text-white transition-all hover:bg-indigo-500 hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/50 w-full sm:w-auto justify-center"
            >
              Get Started
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
            <Link
              href="/auth/signin"
              className="rounded-full border border-white/20 px-8 py-4 text-base font-semibold text-white transition-all hover:bg-white/10 w-full sm:w-auto text-center"
            >
              Try Demo
            </Link>
          </div>
        </div>

        {/* Interactive Demo Preview */}
        <div className="relative mt-16 w-full max-w-6xl px-6 lg:px-8 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
          {/* Glow effect */}
          <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl opacity-50" />

          {/* Frame container */}
          <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-indigo-500/10 bg-black">
            {/* Browser-like top bar */}
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-900/80 border-b border-white/5">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-4 py-1 bg-gray-800/50 rounded-md text-xs text-gray-400 font-mono">
                  learnoir.app/dashboard
                </div>
              </div>
              <div className="w-16" />
            </div>

            {/* Iframe */}
            <iframe
              src="/demo-preview"
              title="Learnoir interactive dashboard demo"
              className="w-full h-[420px] md:h-[520px] border-0"
              sandbox="allow-scripts allow-same-origin"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Caption */}
          <p className="text-center text-sm text-gray-500 mt-4">
            Interactive preview - powered by AI
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-base font-semibold leading-7 text-indigo-400">Everything you need</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              From Resume to Offer Letter
            </p>
            <p className="mt-4 text-gray-400">
              9 powerful AI-driven tools to accelerate your tech career
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-6 lg:max-w-none lg:grid-cols-3">
              {[
                {
                  name: 'Smart Resume Parsing',
                  description: 'Upload your PDF and our AI extracts skills, experience, and education in seconds.',
                  iconPath: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
                  color: 'indigo'
                },
                {
                  name: 'AI Recruiter Simulator',
                  description: 'See exactly why a recruiter would shortlist or reject your resume for any job.',
                  iconPath: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
                  color: 'red'
                },
                {
                  name: 'Auto Project Builder',
                  description: 'Paste any job description and get a complete portfolio project with architecture and build guide.',
                  iconPath: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
                  color: 'blue'
                },
                {
                  name: 'Smart Job Matching',
                  description: 'See your match percentage for different roles and discover which skills to learn next.',
                  iconPath: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
                  color: 'emerald'
                },
                {
                  name: 'Learning Lab',
                  description: 'Practice weak skills with AI-generated coding exercises, quizzes, and mini-projects.',
                  iconPath: 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z',
                  color: 'violet'
                },
                {
                  name: 'Personalized Roadmaps',
                  description: 'Get an 8-week learning plan tailored to your skills and target role.',
                  iconPath: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7',
                  color: 'purple'
                },
                {
                  name: 'Interview Prep',
                  description: 'Practice with role-specific MCQs, behavioral questions, and get instant feedback.',
                  iconPath: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
                  color: 'yellow'
                },
                {
                  name: 'Coding Challenges',
                  description: 'Solve LeetCode-style problems with AI evaluation of your solutions.',
                  iconPath: 'M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
                  color: 'cyan'
                },
                {
                  name: 'Progress Tracking',
                  description: 'Track your learning streak, skill growth, and career readiness over time.',
                  iconPath: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
                  color: 'green'
                },
              ].map((feature) => {
                const colorClasses: Record<string, string> = {
                  indigo: 'bg-indigo-500/20 text-indigo-400',
                  red: 'bg-red-500/20 text-red-400',
                  blue: 'bg-blue-500/20 text-blue-400',
                  emerald: 'bg-emerald-500/20 text-emerald-400',
                  violet: 'bg-violet-500/20 text-violet-400',
                  purple: 'bg-purple-500/20 text-purple-400',
                  yellow: 'bg-yellow-500/20 text-yellow-400',
                  cyan: 'bg-cyan-500/20 text-cyan-400',
                  green: 'bg-green-500/20 text-green-400',
                };
                return (
                  <div key={feature.name} className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:bg-white/10 hover:border-white/20">
                    <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                      <div className={`w-10 h-10 rounded-lg ${colorClasses[feature.color]} flex items-center justify-center`}>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.iconPath} />
                        </svg>
                      </div>
                      {feature.name}
                    </dt>
                    <dd className="mt-3 flex flex-auto flex-col text-sm leading-6 text-gray-400">
                      <p className="flex-auto">{feature.description}</p>
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black py-12">
        <div className="mx-auto max-w-7xl px-6 text-center text-gray-500 lg:px-8">
          <p>&copy; 2025 Learnoir AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
