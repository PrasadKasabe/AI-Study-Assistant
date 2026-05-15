import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Brain, Zap, Clock, Shield, CheckCircle } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 font-bold text-2xl text-primary-600">
            <Sparkles className="w-8 h-8 fill-primary-600" />
            <span>StudyAI</span>
          </div>
          <div className="flex gap-4">
            <Link to="/login" className="px-6 py-2 text-slate-600 hover:text-primary-600 transition-colors font-medium">Login</Link>
            <Link to="/register" className="btn-primary">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-6">
              Empowering Students with AI
            </span>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-tight mb-6">
              Study Smarter, <br />
              <span className="gradient-text">Not Harder.</span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              Upload your notes, and let our AI summarize them, extract key points, and answer your questions instantly. Your personal AI study assistant.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/register" className="btn-primary text-lg px-8 py-4">Start Learning Free</Link>
              <button className="btn-secondary text-lg px-8 py-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary-600" />
                See How It Works
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-primary-400 to-indigo-400 rounded-[2rem] blur-2xl opacity-20 animate-pulse"></div>
            <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-100 p-4">
               {/* Mockup Content */}
               <div className="bg-slate-50 rounded-2xl p-6 h-96 flex flex-col gap-4 overflow-hidden">
                 <div className="w-3/4 h-4 bg-slate-200 rounded animate-pulse"></div>
                 <div className="w-full h-4 bg-slate-200 rounded animate-pulse"></div>
                 <div className="w-5/6 h-4 bg-slate-200 rounded animate-pulse"></div>
                 <div className="mt-8 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-primary-500"></div>
                      <div className="w-24 h-3 bg-slate-200 rounded"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="w-full h-2 bg-slate-100 rounded"></div>
                      <div className="w-full h-2 bg-slate-100 rounded"></div>
                      <div className="w-2/3 h-2 bg-slate-100 rounded"></div>
                    </div>
                 </div>
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-5xl font-bold mb-16 text-slate-900">Why Choose StudyAI?</h2>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            {[
              { icon: Zap, title: "Instant Summaries", desc: "Turn lengthy PDFs into concise notes in seconds." },
              { icon: Brain, title: "Smart Chatbot", desc: "Ask questions based directly on your study material." },
              { icon: Clock, title: "Save 10+ Hours", desc: "Spend less time reading and more time mastering concepts." },
            ].map((f, i) => (
              <motion.div 
                key={i}
                whileHover={{ translateY: -10 }}
                className="p-8 rounded-2xl bg-slate-50 border border-slate-100"
              >
                <div className="w-14 h-14 bg-primary-600 rounded-xl flex items-center justify-center text-white mb-6">
                  <f.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-slate-600 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-900 text-slate-400">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 font-bold text-2xl text-white">
            <Sparkles className="w-8 h-8 fill-primary-500" />
            <span>StudyAI</span>
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-white transition-colors">GitHub</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
          </div>
          <p>© 2026 StudyAI Assistant. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
