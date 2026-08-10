import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CalendarIcon,
  PackageIcon,
  LineChartIcon,
  ClipboardListIcon,
  CheckIcon,
  UserIcon,
  UsersIcon,
  BuildingIcon,
  BriefcaseIcon,
  SunIcon,
  MoonIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  ZapIcon,
  StarIcon,
} from 'lucide-react';

type ThemeMode = 'light' | 'dark' | 'system';
const THEME_KEY = 'theme';

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  const shouldBeDark = mode === 'dark' || (mode === 'system' && prefersDark);
  root.classList.toggle('dark', !!shouldBeDark);
}

export const Landing: React.FC = () => {
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const role = (localStorage.getItem('userRole') || '').toUpperCase();
    if (token && role) {
      if (role === 'ADMIN') navigate('/app/AdminDashboard', { replace: true });
      else if (role === 'DOCTOR') navigate('/app/DoctorDashboard', { replace: true });
      else navigate('/app/PatientDashboard', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const cached = (localStorage.getItem(THEME_KEY) as ThemeMode | null) ?? 'system';
    const initial: ThemeMode = cached === 'light' || cached === 'dark' || cached === 'system' ? cached : 'system';
    setThemeMode(initial);
    applyTheme(initial);
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    const onSystemChange = () => {
      const current = (localStorage.getItem(THEME_KEY) as ThemeMode | null) ?? initial;
      if (current === 'system') applyTheme('system');
    };
    mq?.addEventListener?.('change', onSystemChange);
    return () => mq?.removeEventListener?.('change', onSystemChange);
  }, []);

  const setTheme = (mode: ThemeMode) => {
    setThemeMode(mode);
    localStorage.setItem(THEME_KEY, mode);
    applyTheme(mode);
  };
  const cycleTheme = () => {
    const next: ThemeMode = themeMode === 'light' ? 'dark' : themeMode === 'dark' ? 'system' : 'light';
    setTheme(next);
  };

  const agentCards = useMemo(() => [
    {
      title: 'Appointments Agent',
      body: "Schedules, manages, and reminds patients—while optimizing your clinic's calendar.",
      Icon: CalendarIcon,
      accent: 'text-sky-600 dark:text-sky-300',
      bg: 'bg-sky-500/10 dark:bg-sky-500/12',
      border: 'border-sky-200/60 dark:border-sky-500/20',
      glow: 'group-hover:shadow-[0_8px_30px_-8px_rgba(14,165,233,0.35)]',
      dot: 'bg-sky-500',
    },
    {
      title: 'Inventory Agent',
      body: 'Tracks supplies, predicts usage patterns, and prevents stockouts of critical materials.',
      Icon: PackageIcon,
      accent: 'text-amber-600 dark:text-amber-300',
      bg: 'bg-amber-500/10 dark:bg-amber-500/12',
      border: 'border-amber-200/60 dark:border-amber-500/20',
      glow: 'group-hover:shadow-[0_8px_30px_-8px_rgba(245,158,11,0.35)]',
      dot: 'bg-amber-500',
    },
    {
      title: 'Revenue Agent',
      body: 'Analyzes trends and provides actionable insights to improve profitability and cashflow.',
      Icon: LineChartIcon,
      accent: 'text-emerald-600 dark:text-emerald-300',
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/12',
      border: 'border-emerald-200/60 dark:border-emerald-500/20',
      glow: 'group-hover:shadow-[0_8px_30px_-8px_rgba(16,185,129,0.35)]',
      dot: 'bg-emerald-500',
    },
    {
      title: 'Case Tracking Agent',
      body: 'Monitors treatments, summarizes cases, and supports consistent, high-quality pathways.',
      Icon: ClipboardListIcon,
      accent: 'text-violet-600 dark:text-violet-300',
      bg: 'bg-violet-500/10 dark:bg-violet-500/12',
      border: 'border-violet-200/60 dark:border-violet-500/20',
      glow: 'group-hover:shadow-[0_8px_30px_-8px_rgba(139,92,246,0.35)]',
      dot: 'bg-violet-500',
    },
  ], []);

  const benefits = useMemo(() => [
    { title: 'Automation', body: 'Reduce manual work with intelligent task handling and proactive workflows.', color: 'text-emerald-600 dark:text-emerald-400' },
    { title: 'Accuracy', body: 'Minimize errors with AI-verified checks and consistent process enforcement.', color: 'text-sky-600 dark:text-sky-400' },
    { title: 'Insights', body: 'Make faster decisions with analytics that surface what matters.', color: 'text-violet-600 dark:text-violet-400' },
    { title: 'Efficiency', body: 'Improve resource allocation and scheduling utilization.', color: 'text-amber-600 dark:text-amber-400' },
    { title: 'Satisfaction', body: 'Deliver a smoother patient experience with timely reminders.', color: 'text-rose-600 dark:text-rose-400' },
    { title: 'Growth', body: 'Scale operations with support that adapts as your clinic expands.', color: 'text-indigo-600 dark:text-indigo-400' },
  ], []);

  const roles = useMemo(() => [
    {
      title: 'Dentist', body: 'Patient histories, treatment plans, and AI-assisted decision support.',
      Icon: UserIcon, accent: 'text-sky-600 dark:text-sky-300', bg: 'bg-sky-500/10 dark:bg-sky-500/12',
      border: 'border-sky-200/60 dark:border-sky-500/20',
      bullets: ['Case analysis', 'Treatment tracking', 'Patient history'],
    },
    {
      title: 'Staff', body: 'Appointments, inventory, and day-to-day operations—done faster.',
      Icon: UsersIcon, accent: 'text-violet-600 dark:text-violet-300', bg: 'bg-violet-500/10 dark:bg-violet-500/12',
      border: 'border-violet-200/60 dark:border-violet-500/20',
      bullets: ['Scheduling', 'Inventory management', 'Patient communication'],
    },
    {
      title: 'Manager', body: 'Performance metrics, financial analytics, and operational insights.',
      Icon: BuildingIcon, accent: 'text-emerald-600 dark:text-emerald-300', bg: 'bg-emerald-500/10 dark:bg-emerald-500/12',
      border: 'border-emerald-200/60 dark:border-emerald-500/20',
      bullets: ['Revenue analytics', 'Staff performance', 'Business insights'],
    },
    {
      title: 'Patient', body: 'Appointments, treatment details, and convenient payment options.',
      Icon: BriefcaseIcon, accent: 'text-amber-600 dark:text-amber-300', bg: 'bg-amber-500/10 dark:bg-amber-500/12',
      border: 'border-amber-200/60 dark:border-amber-500/20',
      bullets: ['Self-scheduling', 'Treatment history', 'Payment management'],
    },
  ], []);

  const steps = [
    { step: '01', title: 'Connect your data', body: 'Securely integrate practice systems so agents can learn from operational history.', icon: '🔗' },
    { step: '02', title: 'Continuous analysis', body: 'Agents monitor activity, detect patterns, and surface opportunities automatically.', icon: '📊' },
    { step: '03', title: 'Automated intelligence', body: 'Get proactive alerts, recommendations, and workflow automation that saves time.', icon: '⚡' },
  ];


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 overflow-x-hidden">

      {/* ── GLOBAL BACKGROUND MESH ── */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[800px] w-[800px] rounded-full bg-gradient-to-br from-sky-400/12 via-emerald-400/10 to-violet-400/10 blur-3xl" />
        <div className="absolute top-20 -left-20 h-[500px] w-[500px] rounded-full bg-sky-500/8 dark:bg-sky-500/6 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[600px] w-[600px] rounded-full bg-emerald-500/8 dark:bg-emerald-500/6 blur-3xl" />
        <div className="absolute top-1/2 right-1/4 h-[400px] w-[400px] rounded-full bg-violet-500/6 dark:bg-violet-500/5 blur-3xl" />
        {/* Subtle grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.04)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-30 border-b border-slate-200/60 dark:border-slate-800/60 bg-white/75 dark:bg-slate-950/75 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

          {/* Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative w-10 h-10 rounded-2xl overflow-hidden shadow-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-sky-500 to-violet-500" />
              <div className="absolute inset-0 flex items-center justify-center font-bold text-white text-sm tracking-tight">DC</div>
            </div>
            <div className="leading-tight">
              <div className="font-bold text-slate-900 dark:text-white text-[15px]">Dental Clinic Intelligence</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Agentic AI for modern clinic ops</div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme switcher */}
            <div className="hidden sm:flex items-center gap-0.5 rounded-xl border border-slate-200/70 dark:border-slate-800/70 bg-slate-100/70 dark:bg-slate-900/50 p-1">
              {(['light','dark'] as const).map(m => (
                <button key={m} type="button" onClick={() => setTheme(m)} title={m}
                  className={['h-7 w-7 rounded-lg grid place-items-center transition-all', themeMode === m ? 'bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-slate-100' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'].join(' ')}>
                  {m === 'light' ? <SunIcon size={13} /> : <MoonIcon size={13} />}
                </button>
              ))}
              <button type="button" onClick={cycleTheme} title="System"
                className={['h-7 w-7 rounded-lg grid place-items-center transition-all', themeMode === 'system' ? 'bg-white dark:bg-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'].join(' ')}>
                <span className="h-2 w-2 rounded-full bg-gradient-to-br from-emerald-400 to-sky-400" />
              </button>
            </div>

            <Link to="/login" className="hidden sm:inline-flex text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition px-3 py-1.5 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/60">
              Login
            </Link>
            <Link to="/create-account"
              className="inline-flex items-center gap-1.5 rounded-2xl px-4 py-2 text-sm font-semibold bg-gradient-to-r from-slate-900 to-slate-800 text-white hover:from-slate-800 hover:to-slate-700 shadow-sm dark:from-white dark:to-slate-100 dark:text-slate-950 dark:hover:from-slate-100 dark:hover:to-slate-200 transition-all active:scale-[0.98]">
              Get Started <ArrowRightIcon size={14} />
            </Link>
          </div>
        </div>
      </nav>


      {/* ── HERO ── */}
      <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/70 dark:border-emerald-500/25 bg-emerald-50/80 dark:bg-emerald-500/10 px-4 py-1.5 text-[12px] font-semibold text-emerald-700 dark:text-emerald-300 mb-6 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-[pulse-dot_2s_ease-in-out_infinite]" />
              HIPAA-ready patterns · Role-based access · Audit-friendly
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-6">
              Transform your clinic<br className="hidden sm:block" /> with{' '}
              <span className="relative inline-block">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-500 via-emerald-500 to-violet-500">
                  Agentic AI
                </span>
                <span className="absolute -bottom-1 left-0 right-0 h-[3px] rounded-full bg-gradient-to-r from-sky-500 via-emerald-500 to-violet-500 opacity-40" />
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed mb-10">
              Four specialized AI agents streamline operations, reduce workload, and improve patient care—without changing how your team works.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
              <Link to="/login"
                className="inline-flex items-center gap-2 rounded-2xl px-7 py-3.5 text-sm font-bold bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg hover:shadow-xl hover:from-slate-800 hover:to-slate-700 active:scale-[0.98] transition-all dark:from-white dark:to-slate-100 dark:text-slate-950">
                Login to Dashboard <ArrowRightIcon size={15} />
              </Link>
              <Link to="/create-account"
                className="inline-flex items-center gap-2 rounded-2xl px-7 py-3.5 text-sm font-semibold border border-slate-200/80 dark:border-slate-700/70 bg-white/70 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 hover:bg-white dark:hover:bg-slate-900/80 active:scale-[0.98] transition-all shadow-sm">
                Create Account
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {[
                { icon: <ZapIcon size={12} />, label: 'Faster scheduling' },
                { icon: <PackageIcon size={12} />, label: 'Smarter inventory' },
                { icon: <LineChartIcon size={12} />, label: 'Revenue insights' },
                { icon: <ShieldCheckIcon size={12} />, label: 'Secure & compliant' },
                { icon: <StarIcon size={12} />, label: 'Case tracking' },
              ].map(({ icon, label }) => (
                <span key={label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200/70 dark:border-slate-800/70 bg-white/60 dark:bg-slate-900/50 text-[11px] font-medium text-slate-600 dark:text-slate-300 shadow-sm">
                  <span className="text-slate-400 dark:text-slate-500">{icon}</span>
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* ── AGENT CARDS ── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 dark:border-slate-800/70 bg-white/60 dark:bg-slate-900/50 px-3 py-1 text-[11px] font-bold tracking-[0.12em] uppercase text-slate-500 dark:text-slate-400 mb-4">
              AI Agents
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
              Four agents, one platform
            </h2>
            <p className="mt-3 text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              Each agent is purpose-built for a core area of clinic operations.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {agentCards.map(({ title, body, Icon, accent, bg, border, glow, dot }) => (
              <div key={title}
                className={['group relative rounded-3xl border bg-white/80 dark:bg-slate-900/60 backdrop-blur p-6 transition-all duration-200 hover:-translate-y-1', border, glow].join(' ')}
                style={{ boxShadow: '0 2px 20px -8px rgba(15,23,42,0.12)' }}>
                {/* Top accent line */}
                <div className={['absolute top-0 left-6 right-6 h-[2px] rounded-full opacity-60 group-hover:opacity-100 transition-opacity', bg.replace('bg-', 'bg-').replace('/10', '').replace('/12', '')].join(' ')}
                  style={{ background: 'currentColor' }} />

                <div className={['w-12 h-12 rounded-2xl grid place-items-center mb-5 transition-transform group-hover:scale-105', bg, 'border', border].join(' ')}>
                  <Icon size={22} className={accent} />
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span className={['w-1.5 h-1.5 rounded-full', dot].join(' ')} />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{title}</h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 dark:border-slate-800/70 bg-white/60 dark:bg-slate-900/50 px-3 py-1 text-[11px] font-bold tracking-[0.12em] uppercase text-slate-500 dark:text-slate-400 mb-4">
              How it works
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Three steps to smarter ops</h2>
            <p className="mt-3 text-slate-500 dark:text-slate-400 max-w-xl mx-auto">A clean integration flow that keeps your team focused on care—not tools.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 relative">
            {/* Connector line (desktop) */}
            <div className="hidden md:block absolute top-12 left-[calc(33%-40px)] right-[calc(33%-40px)] h-[1px] bg-gradient-to-r from-transparent via-slate-300/60 dark:via-slate-700/60 to-transparent" />

            {steps.map((s, idx) => (
              <div key={s.step}
                className="relative rounded-3xl border border-slate-200/70 dark:border-slate-800/70 bg-white/80 dark:bg-slate-900/60 backdrop-blur p-7 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-5">
                  <div className="text-3xl">{s.icon}</div>
                  <div className="font-mono text-xs font-bold text-slate-400 dark:text-slate-600 bg-slate-100 dark:bg-slate-800 rounded-lg px-2 py-1">
                    {s.step}
                  </div>
                </div>
                {idx < 2 && (
                  <div className="hidden md:block absolute top-12 -right-3 w-6 h-6 rounded-full border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 z-10" />
                )}
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{s.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ── BENEFITS ── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 dark:border-slate-800/70 bg-white/60 dark:bg-slate-900/50 px-3 py-1 text-[11px] font-bold tracking-[0.12em] uppercase text-slate-500 dark:text-slate-400 mb-4">
              Benefits
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Practical improvements, every day</h2>
            <p className="mt-3 text-slate-500 dark:text-slate-400 max-w-xl mx-auto">Tangible gains you feel in day-to-day operations—without complexity.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {benefits.map((b) => (
              <div key={b.title}
                className="group rounded-3xl border border-slate-200/70 dark:border-slate-800/70 bg-white/80 dark:bg-slate-900/60 backdrop-blur p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 w-8 h-8 rounded-xl grid place-items-center bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shrink-0">
                    <CheckIcon size={16} className={b.color} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">{b.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{b.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── USER ROLES ── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 dark:border-slate-800/70 bg-white/60 dark:bg-slate-900/50 px-3 py-1 text-[11px] font-bold tracking-[0.12em] uppercase text-slate-500 dark:text-slate-400 mb-4">
              User roles
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Built for everyone in the clinic</h2>
            <p className="mt-3 text-slate-500 dark:text-slate-400 max-w-xl mx-auto">Role-specific experiences—simple, clear, and aligned to responsibilities.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {roles.map(({ title, body, Icon, accent, bg, border, bullets }) => (
              <div key={title}
                className={['group rounded-3xl border bg-white/80 dark:bg-slate-900/60 backdrop-blur p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200', border].join(' ')}>
                <div className={['w-12 h-12 rounded-2xl grid place-items-center mb-4 border group-hover:scale-105 transition-transform', bg, border].join(' ')}>
                  <Icon size={22} className={accent} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">{body}</p>
                <ul className="space-y-1.5">
                  {bullets.map((x) => (
                    <li key={x} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <CheckIcon size={14} className={accent} />
                      <span>{x}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ── CTA ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-[36px] overflow-hidden border border-slate-200/60 dark:border-slate-800/60 shadow-[0_40px_120px_-40px_rgba(15,23,42,0.35)] dark:shadow-[0_40px_120px_-40px_rgba(0,0,0,0.6)]">
            {/* CTA bg gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(16,185,129,0.18)_0%,transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(139,92,246,0.18)_0%,transparent_60%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:48px_48px]" />

            <div className="relative px-8 py-16 sm:px-14 sm:py-20 text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-1.5 text-[12px] font-semibold text-white/70 mb-6">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-[pulse-dot_2s_ease-in-out_infinite]" />
                Ready to get started?
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
                Transform your dental practice today
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed mb-10">
                Start with role-based access, clean dashboards, and agents that reduce workload from day one.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-3 mb-8">
                <Link to="/create-account"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-4 text-sm font-bold bg-white text-slate-900 hover:bg-slate-100 shadow-lg active:scale-[0.98] transition-all">
                  Get Started Free <ArrowRightIcon size={15} />
                </Link>
                <Link to="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-4 text-sm font-semibold border border-white/15 bg-white/8 text-white hover:bg-white/12 active:scale-[0.98] transition-all">
                  Login to Dashboard
                </Link>
              </div>

              <p className="text-[12px] text-slate-500">No heavy UI. Just a smooth, professional workflow.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-950/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="relative w-9 h-9 rounded-xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-sky-500 to-violet-500" />
                  <div className="absolute inset-0 flex items-center justify-center font-bold text-white text-xs">DC</div>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">Dental Clinic AI</span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Transforming dental practices with intelligent AI solutions.
              </p>
            </div>

            {[
              { title: 'Product', items: ['Features', 'Pricing', 'Integrations', 'Security'] },
              { title: 'Company', items: ['About Us', 'Careers', 'Blog', 'Press'] },
              { title: 'Support', items: ['Help Center', 'Contact Us', 'Privacy Policy', 'Terms of Service'] },
            ].map((col) => (
              <div key={col.title}>
                <h3 className="font-bold text-slate-900 dark:text-white mb-4 text-sm">{col.title}</h3>
                <ul className="space-y-2.5">
                  {col.items.map((x) => (
                    <li key={x}>
                      <a href="#" className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition">{x}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200/60 dark:border-slate-800/60 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">© 2024 Dental Clinic Intelligence. All rights reserved.</p>
            <div className="flex gap-5 text-sm">
              {['Twitter', 'LinkedIn', 'Facebook', 'Instagram'].map((x) => (
                <a key={x} href="#" className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition">{x}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};
