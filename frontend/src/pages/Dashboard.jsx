import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import {
  Search, ArrowRight, GraduationCap, Shield, Trophy,
  Star, Sparkles, BookOpen, BarChart3, MessageCircle,
  CheckCircle2, Clock, Zap, TrendingUp, Users, Crown,
  ChevronRight, CalendarDays, Info, Target, User
} from 'lucide-react';
import { motion } from 'framer-motion';

/* ── Animation helpers ── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
});

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.5, delay },
});

/* ── TNEA 2025 key dates ── */
const TNEA_DATES = [
  { label: 'Application Open',     date: 'Apr 2025',  done: true  },
  { label: 'Certificate Verification', date: 'May 2025', done: true },
  { label: 'Random Number Release', date: 'Jun 2025',  done: false },
  { label: 'Round 1 Choice Fill',   date: 'Jul 2025',  done: false },
  { label: 'Round 2 Allotment',     date: 'Aug 2025',  done: false },
  { label: 'Round 3 Special',       date: 'Sep 2025',  done: false },
];

/* ── Platform features ── */
const FEATURES = [
  {
    icon: <Search size={22} />,
    color: 'blue',
    title: 'Smart College Search',
    desc: 'Filter 500+ Engineering colleges by your cutoff, caste category, district, and branch — all in real time.',
    free: true,
  },
  {
    icon: <BarChart3 size={22} />,
    color: 'indigo',
    title: 'Cutoff Analytics',
    desc: 'View Round 1, 2 and 3 cutoff trends across all categories to strategically plan your choice filling.',
    free: false,
  },
  {
    icon: <MessageCircle size={22} />,
    color: 'purple',
    title: 'Expert Counseling',
    desc: 'One-on-one sessions with TNEA experts who have guided 10,000+ students to their dream colleges.',
    free: false,
  },
];

/* ══════════════════════════════════════════════════════════════
   Dashboard (Home page at /)
══════════════════════════════════════════════════════════════ */
const Dashboard = () => {
  const { user } = useAuth();
  const { isSubscribed } = useSubscription();
  const navigate = useNavigate();

  const name       = user?.studentName || user?.name || 'Student';
  const caste      = user?.caste      ?? null;
  const tneaRank   = user?.tnea_ranking ?? null;

  let calculatedCutoff = '—';
  let cutoffSubtext = 'Set marks in Settings';
  
  if (user?.maths_mark != null && user?.physics_mark != null && user?.chemistry_mark != null) {
    const calc = parseFloat(user.maths_mark) + (parseFloat(user.physics_mark) / 2) + (parseFloat(user.chemistry_mark) / 2);
    if (!isNaN(calc)) {
      calculatedCutoff = calc.toFixed(2);
      cutoffSubtext = 'Calculated from marks';
    }
  } else if (user?.cutoff != null) {
    calculatedCutoff = parseFloat(user.cutoff).toFixed(2);
    cutoffSubtext = 'From your profile';
  }

  // ── Guest / public landing view ────────────────────────────────────────
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900" />
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                'radial-gradient(circle at 15% 60%, rgba(99,102,241,0.35) 0%, transparent 45%), radial-gradient(circle at 85% 15%, rgba(59,130,246,0.25) 0%, transparent 45%), radial-gradient(circle at 50% 90%, rgba(139,92,246,0.15) 0%, transparent 50%)',
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }}
          />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-24 sm:pb-36 text-center">
            <motion.div {...fadeIn(0)} className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-[11px] font-black uppercase tracking-[0.2em]">TNEA Counseling 2025</span>
            </motion.div>

            <motion.h1
              {...fadeUp(0.05)}
              className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-[1.1] tracking-tight mb-5"
            >
              Navigate TNEA with<br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-violet-400">
                Confidence &amp; Clarity
              </span>
            </motion.h1>

            <motion.p
              {...fadeUp(0.1)}
              className="text-slate-400 text-base sm:text-lg font-medium max-w-2xl mx-auto leading-relaxed mb-10"
            >
              Personalized college admission strategy, cutoff analytics for 500+ colleges, and expert counseling — all in one place.
            </motion.p>

            <motion.div {...fadeUp(0.18)} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/login"
                className="group flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-base shadow-2xl shadow-indigo-900/60 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all"
              >
                <User size={18} />
                Login to Get Started
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/signup"
                className="flex items-center gap-2 px-7 py-4 rounded-2xl bg-white/10 border border-white/20 text-white font-bold text-sm hover:bg-white/20 transition-all backdrop-blur-sm"
              >
                Create Free Account
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Mini stats band */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-10 relative z-10 mb-16">
          <motion.div
            {...fadeUp(0.22)}
            className="grid grid-cols-2 md:grid-cols-4 gap-3"
          >
            {[
              { number: '10K+', label: 'Students Guided', icon: <Users size={18} /> },
              { number: '500+', label: 'Partner Colleges', icon: <GraduationCap size={18} /> },
              { number: '98%',  label: 'Success Rate',     icon: <TrendingUp size={18} /> },
              { number: '20+',  label: 'Expert Counselors', icon: <MessageCircle size={18} /> },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col items-center text-center">
                <div className="text-indigo-400 mb-1">{s.icon}</div>
                <p className="text-2xl font-black text-slate-900">{s.number}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-0.5">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Feature highlights */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-24 space-y-16">
          <motion.section {...fadeUp(0.28)}>
            <SectionHeader
              eyebrow="What We Offer"
              title="Platform Features"
              subtitle="Everything you need to navigate TNEA counseling"
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group bg-white rounded-3xl border border-slate-100 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-slate-50 to-transparent rounded-full -translate-y-20 translate-x-20 group-hover:scale-150 transition-transform duration-700" />
                  <div className="relative">
                    <div className={`w-11 h-11 rounded-2xl bg-${f.color}-50 text-${f.color}-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-all`}>
                      {f.icon}
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-sm font-black text-slate-900">{f.title}</h3>
                      {f.free
                        ? <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Free</span>
                        : <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">Pro</span>
                      }
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Bottom CTA */}
          <motion.section {...fadeUp(0.32)}>
            <div className="relative rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700" />
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
              <div className="relative p-8 sm:p-14 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 text-white text-[10px] font-black uppercase tracking-widest mb-5">
                  <Sparkles size={12} /> Join 10,000+ Students
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-white mb-3 leading-tight">
                  Ready to Secure<br />Your Dream Seat?
                </h2>
                <p className="text-indigo-200 text-sm font-medium max-w-lg mx-auto mb-8">
                  Sign in and get your personalized college admission plan in minutes.
                </p>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-white text-indigo-700 font-black text-sm shadow-2xl shadow-indigo-900/50 hover:bg-indigo-50 hover:-translate-y-0.5 transition-all"
                >
                  <User size={16} />
                  Login Now
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    );
  }

  // ── Authenticated dashboard ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">

      {/* ── 1. HERO BANNER ──────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900" />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(circle at 15% 60%, rgba(99,102,241,0.35) 0%, transparent 45%), radial-gradient(circle at 85% 15%, rgba(59,130,246,0.25) 0%, transparent 45%), radial-gradient(circle at 50% 90%, rgba(139,92,246,0.15) 0%, transparent 50%)',
          }}
        />
        {/* Decorative dots grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-20 sm:pb-28">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">

            {/* Left: Greeting */}
            <motion.div {...fadeUp(0)}>
              <div className="flex items-center gap-2 mb-4 sm:mb-5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.25em]">
                  TNEA Counseling 2025
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-[3.25rem] font-black text-white leading-[1.15] md:leading-[1.08] tracking-tight mb-3 sm:mb-4">
                Welcome back,<br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-violet-400">
                  {name}
                </span>
              </h1>
              <p className="text-slate-400 text-sm sm:text-base md:text-lg font-medium max-w-xl leading-relaxed">
                Your personalized college admission strategy, cutoff analytics, and expert counseling — all in one place.
              </p>
            </motion.div>

            {/* Right: Pro / Upgrade badge */}
            <motion.div {...fadeUp(0.15)} className="flex-shrink-0 w-full lg:w-auto">
              {isSubscribed ? (
                <div className="flex flex-col items-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-br from-emerald-500/15 to-teal-500/10 border border-emerald-500/25 backdrop-blur-sm text-center">
                  <CheckCircle2 size={28} className="text-emerald-400" />
                  <span className="text-emerald-400 text-xs font-black uppercase tracking-widest block">Pro Active</span>
                  {user?.subscriptionExpiry && (
                    <span className="text-slate-500 text-[10px] font-medium">
                      Expires {new Date(user.subscriptionExpiry).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => navigate('/subscribe')}
                  className="w-full lg:w-auto group flex flex-col items-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-br from-amber-500/15 to-orange-500/10 border border-amber-500/25 backdrop-blur-sm hover:border-amber-400/50 transition-all text-center"
                >
                  <Star size={26} className="text-amber-400 group-hover:scale-110 transition-transform" />
                  <span className="text-amber-400 text-xs font-black uppercase tracking-widest">Upgrade to Pro</span>
                  <span className="text-slate-500 text-[10px] font-medium"><span className="line-through opacity-60 mr-1">₹499</span>₹199 · 3 months</span>
                </button>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 2. FLOATING STAT CARDS ──────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-10 sm:-mt-12 relative z-10 mb-10 sm:mb-14">
        <motion.div {...fadeUp(0.1)} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          <StatCard
            icon={<Target size={20} />}
            label="TNEA Cutoff"
            value={calculatedCutoff}
            sub={cutoffSubtext}
            color="blue"
          />
          <StatCard
            icon={<Shield size={20} />}
            label="Caste Category"
            value={caste || '—'}
            sub={caste ? 'Reservation applied' : 'Set in Settings'}
            color="violet"
          />
          <StatCard
            icon={<Trophy size={20} />}
            label="TNEA Rank"
            value={tneaRank ? `#${tneaRank.toLocaleString()}` : '—'}
            sub={tneaRank ? 'Your counseling rank' : 'Set in Settings'}
            color="amber"
          />
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20 sm:pb-24 space-y-16 sm:space-y-20">

        {/* ── 3. QUICK ACTIONS ────────────────────────────── */}
        <motion.section {...fadeUp(0.2)}>
          <SectionHeader
            eyebrow="Get Started"
            title="Quick Actions"
            subtitle="Jump directly into your most-used tools"
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
            <ActionCard
              icon={<Search size={24} />}
              iconBg="bg-blue-50 text-blue-600"
              glow="group-hover:shadow-blue-100"
              title="College Search"
              titleTamil="கல்லூரி தேடல்"
              description="Explore 500+ Engineering colleges filtered by your TNEA cutoff, caste category, branch and district."
              tag="Free Access"
              tagClass="bg-emerald-50 text-emerald-700 border-emerald-200"
              onClick={() => navigate('/search')}
              cta="Search Colleges"
            />
            {!isSubscribed ? (
              <ActionCard
                icon={<Crown size={24} />}
                iconBg="bg-amber-50 text-amber-600"
                glow="group-hover:shadow-amber-100"
                title="Unlock Pro Access"
                titleTamil="Pro அணுகல்"
                description="Get full Round 2 & 3 cutoff data, AI counseling assistant, choice-fill optimizer and more for ₹199."
                tag="₹199 / 3 months"
                tagClass="bg-amber-50 text-amber-700 border-amber-200"
                onClick={() => navigate('/subscribe')}
                cta="Upgrade Now"
              />
            ) : (
              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 sm:p-8 text-white flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 sm:w-56 h-48 sm:h-56 bg-white/5 rounded-full -translate-y-20 sm:-translate-y-28 translate-x-20 sm:translate-x-28" />
                <div className="absolute bottom-0 left-0 w-32 sm:w-40 h-32 sm:h-40 bg-white/5 rounded-full translate-y-16 sm:translate-y-20 -translate-x-16 sm:-translate-x-20" />
                <div className="relative">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/15 flex items-center justify-center mb-4 sm:mb-5">
                    <CheckCircle2 size={24} />
                  </div>
                  <h3 className="text-lg sm:text-xl font-black mb-1">Pro Access Active</h3>
                  <p className="text-indigo-200 text-xs font-medium mb-4">Full cutoff data · AI assistant · Expert counseling</p>
                  {user?.subscriptionExpiry && (
                    <div className="flex items-center gap-1.5 text-indigo-300 text-xs font-bold">
                      <Clock size={12} />
                      Valid until {new Date(user.subscriptionExpiry).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => navigate('/search')}
                  className="relative mt-5 sm:mt-6 flex items-center justify-between px-4 sm:px-5 py-3 bg-white/15 hover:bg-white/25 rounded-2xl text-sm font-bold transition-all border border-white/20"
                >
                  <span>Start Searching</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        </motion.section>

        {/* ── 4. PLATFORM FEATURES ────────────────────────── */}
        <motion.section {...fadeUp(0.25)}>
          <SectionHeader
            eyebrow="What We Offer"
            title="Platform Features"
            subtitle="Everything you need to navigate TNEA counseling"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group bg-white rounded-3xl border border-slate-100 p-6 sm:p-7 hover:shadow-2xl hover:shadow-slate-200/60 hover:-translate-y-1 transition-all duration-500 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-40 sm:w-48 h-40 sm:h-48 bg-gradient-to-br from-slate-50 to-transparent rounded-full -translate-y-20 sm:-translate-y-24 translate-x-20 sm:translate-x-24 group-hover:scale-150 transition-transform duration-700" />
                <div className="relative">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-${f.color}-50 text-${f.color}-600 flex items-center justify-center mb-4 sm:mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    {f.icon}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-sm sm:text-base font-black text-slate-900">{f.title}</h3>
                    {f.free ? (
                      <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Free</span>
                    ) : (
                      <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">Pro</span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── 5. TNEA 2025 TIMELINE ───────────────────────── */}
        <motion.section {...fadeUp(0.3)}>
          <SectionHeader
            eyebrow="Important Dates"
            title="TNEA 2025 Timeline"
            subtitle="Track key milestones in this year's counseling process"
          />
          <div className="bg-white rounded-3xl border border-slate-100 p-5 sm:p-6 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 w-60 sm:w-72 h-60 sm:h-72 bg-gradient-to-br from-indigo-50 to-transparent rounded-full -translate-y-30 sm:-translate-y-36 translate-x-30 sm:translate-x-36 pointer-events-none" />
            <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {TNEA_DATES.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className={`flex items-start gap-3 p-3 sm:p-4 rounded-2xl border transition-all ${
                    item.done
                      ? 'bg-emerald-50/60 border-emerald-100'
                      : 'bg-slate-50 border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/40'
                  }`}
                >
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${item.done ? 'bg-emerald-500 text-white' : 'bg-white border border-slate-200 text-slate-400'}`}>
                    {item.done ? <CheckCircle2 size={14} /> : <CalendarDays size={13} />}
                  </div>
                  <div>
                    <p className={`text-xs sm:text-sm font-black ${item.done ? 'text-emerald-800' : 'text-slate-700'}`}>{item.label}</p>
                    <p className={`text-[10px] sm:text-xs font-semibold mt-0.5 ${item.done ? 'text-emerald-600' : 'text-slate-400'}`}>{item.date}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium mt-4 flex items-center gap-1">
              <Info size={10} sm:size={11} /> Dates are indicative. Refer to <a href="https://www.annauniv.edu" target="_blank" rel="noopener noreferrer" className="underline hover:text-indigo-500 transition-colors">annauniv.edu</a> for official schedule.
            </p>
          </div>
        </motion.section>

        {/* ── 6. STATS BAND ───────────────────────────────── */}
        <motion.section {...fadeUp(0.35)}>
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-10 grid grid-cols-2 md:grid-cols-4 gap-6 relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.05]"
              style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            {[
              { number: '10K+', label: 'Students Guided',   icon: <Users size={18} /> },
              { number: '500+', label: 'Partner Colleges',  icon: <GraduationCap size={18} /> },
              { number: '98%',  label: 'Success Rate',      icon: <TrendingUp size={18} /> },
              { number: '20+',  label: 'Expert Counselors', icon: <MessageCircle size={18} /> },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative text-center"
              >
                <div className="flex justify-center mb-1.5 sm:mb-2 text-indigo-400/60">{s.icon}</div>
                <p className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-1">{s.number}</p>
                <p className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── 7. UPGRADE CTA (free users only) ────────────── */}
        {!isSubscribed && (
          <motion.section {...fadeUp(0.4)}>
            <div className="relative rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700" />
              <div className="absolute inset-0 opacity-20"
                style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
              <div className="absolute -top-16 -right-16 sm:-top-20 sm:-right-20 w-64 sm:w-80 h-64 sm:h-80 bg-white/5 rounded-full" />
              <div className="absolute -bottom-12 -left-12 sm:-bottom-16 sm:-left-16 w-48 sm:w-64 h-48 sm:h-64 bg-white/5 rounded-full" />

              <div className="relative p-6 sm:p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 text-center md:text-left">
                <div className="flex-1 w-full flex flex-col items-center md:items-start">
                  <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-full bg-white/15 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-4 sm:mb-5">
                    <Sparkles size={12} />
                    <span>Unlock Full Access</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-2 sm:mb-3 leading-tight">
                    Ready to Secure<br className="hidden sm:block" />Your Dream Seat?
                  </h2>
                  <p className="text-indigo-200 text-sm sm:text-base font-medium max-w-lg leading-relaxed">
                    Get full Round 2 & 3 cutoff data, AI-powered choice filling optimizer, and direct counselor access — all for just ₹199.
                  </p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-2 sm:gap-3 mt-4 sm:mt-5">
                    {['Round 2 & 3 Cutoffs', 'AI Choice Fill', 'Expert Sessions', 'Rank Analytics'].map((f) => (
                      <span key={f} className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-bold text-indigo-100">
                        <CheckCircle2 size={12} className="text-emerald-400" />
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex-shrink-0 text-center w-full md:w-auto mt-4 md:mt-0">
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-5 sm:p-6 mb-3 sm:mb-4">
                    <p className="text-white/60 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-1">One-time</p>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-xl sm:text-2xl font-bold text-white/50 line-through">₹499</span>
                      <span className="text-4xl sm:text-5xl font-black text-white">₹199</span>
                    </div>
                    <p className="text-indigo-300 text-[10px] sm:text-xs font-medium mt-1">for 3 months access</p>
                  </div>
                  <button
                    onClick={() => navigate('/subscribe')}
                    className="w-full flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-white text-indigo-700 font-black text-xs sm:text-sm rounded-2xl shadow-2xl shadow-indigo-900/50 hover:bg-indigo-50 hover:-translate-y-0.5 transition-all"
                  >
                    <Crown size={15} sm:size={16} />
                    Activate Pro Now
                    <ArrowRight size={15} sm:size={16} />
                  </button>
                </div>
              </div>
            </div>
          </motion.section>
        )}

      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   Sub-components
══════════════════════════════════════════════════════════════ */

const SectionHeader = ({ eyebrow, title, subtitle }) => (
  <div className="mb-6 sm:mb-8">
    <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-indigo-500 mb-1.5 sm:mb-2">{eyebrow}</p>
    <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-1">{title}</h2>
    {subtitle && <p className="text-xs sm:text-sm text-slate-500 font-medium">{subtitle}</p>}
  </div>
);

const StatCard = ({ icon, label, value, sub, color }) => {
  const map = {
    blue:   'from-blue-500/10   to-blue-500/5   border-blue-100   text-blue-600',
    violet: 'from-violet-500/10 to-violet-500/5 border-violet-100 text-violet-600',
    amber:  'from-amber-500/10  to-amber-500/5  border-amber-100  text-amber-600',
  };
  return (
    <div className={`bg-gradient-to-br ${map[color]} border rounded-2xl p-4 sm:p-5 shadow-sm backdrop-blur-xl`}>
      <div className="flex items-start gap-2.5 sm:gap-3">
        <div className="opacity-70 mt-0.5 flex-shrink-0">{icon}</div>
        <div className="min-w-0">
          <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">{label}</p>
          <p className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">{value}</p>
          <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium mt-0.5 truncate">{sub}</p>
        </div>
      </div>
    </div>
  );
};

const ActionCard = ({ icon, iconBg, glow, title, titleTamil, description, tag, tagClass, onClick, cta }) => (
  <div
    onClick={onClick}
    className={`group bg-white rounded-2xl sm:rounded-3xl border border-slate-100 p-6 sm:p-8 hover:shadow-2xl ${glow} hover:-translate-y-1 transition-all duration-500 cursor-pointer relative overflow-hidden`}
  >
    <div className="absolute top-0 right-0 w-56 sm:w-72 h-56 sm:h-72 bg-gradient-to-br from-slate-50 to-transparent rounded-full -translate-y-28 sm:-translate-y-36 translate-x-28 sm:translate-x-36 group-hover:scale-150 transition-transform duration-700" />
    <div className="relative">
      <div className="flex items-start justify-between mb-5 sm:mb-6">
        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl ${iconBg} flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
          {icon}
        </div>
        <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border ${tagClass}`}>
          {tag}
        </span>
      </div>
      <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mb-1 group-hover:text-indigo-600 transition-colors">
        {title}
      </h3>
      <p className="text-[10px] sm:text-xs font-bold text-slate-400 mb-2 sm:mb-3">{titleTamil}</p>
      <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">{description}</p>
      <div className="mt-5 sm:mt-6 flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-black text-slate-900 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">
        {cta} <ArrowRight size={13} sm:size={14} className="group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  </div>
);

export default Dashboard;
